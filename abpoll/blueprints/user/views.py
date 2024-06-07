import io
from PIL import Image
from werkzeug.utils import secure_filename
from itsdangerous import SignatureExpired
from werkzeug.security import generate_password_hash, check_password_hash
from urllib.parse import quote_plus as encode_url

from flask_login import login_user, current_user, logout_user, login_required
from flask import (
    Blueprint,
    redirect,
    request,
    flash,
    url_for,
    render_template,
    abort,
)

from lib.safe_next_url import safe_next_url
from lib.util_datetime import tzware_datetime
from lib.upload_files import allowed_image_file, upload_images_to_cloudflare, delete_image_from_cloudflare
from lib.util_sqlalchemy import avatar_creation, random_user_id

from abpoll.extensions import db
from abpoll.blueprints.user.models import User
from abpoll.blueprints.user.decorators import anonymous_required
from abpoll.blueprints.post.models import Post
from abpoll.blueprints.user.forms import LoginForm, SignupForm

from config.settings import SERIALIZER_TOKEN, EMAIL_SALT

user = Blueprint("user", __name__, template_folder="templates")


@user.route("/login", methods=["GET", "POST"])
@anonymous_required()
def login(**kwargs):
    next_argument = request.args.get("next")
    email = request.args.get("email")
    form = LoginForm(next=next_argument)
    if form.validate_on_submit():
        u = User.find_by_identity(request.form.get("identity").lower())

        if u and u.authenticated(password=request.form.get("password")):
            if login_user(u, remember=True) and u.is_active():
                u.update_activity_tracking(request.remote_addr)

                next_url = request.form.get("next")
                if next_url is not None:
                    return redirect(safe_next_url(next_url))

                return redirect(url_for("general.home"))
            else:
                flash("This account has been disabled.", "danger")
        else:
            flash("Identity or password is incorrect.", "danger")

        next_url = request.form.get("next")
        if next_url is not None:
            return render_template("user/auth-login.html", form=form, email_entry=email, next_url=next_url,
                                   next_argument=encode_url(next_url))

    if next_argument is not None:
        return render_template("user/auth-login.html", form=form, email_entry=email,
                               next_argument=encode_url(next_argument))
    return render_template("user/auth-login.html", form=form, email_entry=email)


@user.route("/register", methods=["POST", "GET"])
@anonymous_required()
def register(**kwargs):
    next_argument = request.args.get("next")

    form = SignupForm()

    if request.method == "POST":
        display_username = request.form.get("username")
        email = request.form.get("email")
        if display_username is not None and email is not None:
            username = str(display_username).lower()
            email = str(email).lower()

            user_object_username = (
                db.session.query(User).filter(User.username == username).first()
            )
            email_taken = (
                db.session.query(User).filter(User.email == email).first()
            )

            if (
                    user_object_username is None
                    and email_taken is None
                    and form.validate_on_submit
            ):
                u = User()
                form.populate_obj(u)
                u.id = random_user_id()
                u.username = username
                u.display_name = display_username
                u.email = email
                u.profile_picture = avatar_creation(email)
                u.password = User.encrypt_password(request.form.get("password"))
                u.save()
                if login_user(u, remember=True) and u.is_active():
                    u.update_activity_tracking(request.remote_addr)
                    from abpoll.blueprints.user.tasks import email_confirmation

                    email_confirmation(
                        request.form.get("email"), request.form.get("username")
                    )
                    next_url = request.form.get("next")
                    if next_url is not None:
                        return redirect(safe_next_url(next_url))

                    return redirect(url_for("general.home"))

            if email_taken is not None:
                flash(
                    "The email is already in use, please login instead.",
                    "danger",
                )
                return redirect(url_for("user.login"))
            elif user_object_username is not None:
                flash("The username is already taken.", "danger")
            else:
                flash(
                    "Invalid password, minimum 8 characters, one letter, number, and symbol.",
                    "danger"
                )
        else:
            flash("Please fill out all the fields bellow", "danger")

        next_url = request.form.get("next")
        if next_url is not None:
            return render_template("user/auth-signup.html", form=form, next_url=next_url,
                                   next_argument=encode_url(next_url))

    if next_argument is not None:
        return render_template("user/auth-signup.html", form=form, next_argument=encode_url(next_argument))
    return render_template("user/auth-signup.html", form=form)


@user.route("/logout")
@login_required
def logout():
    logout_user()
    flash("You have been logged out.", "success")
    return redirect(url_for("user.login"))


@user.route("/re-password", methods=["GET", "POST"])
@anonymous_required()
def recover_password():
    if request.method == "POST":
        email = request.values.get("email")
        user_object = db.session.query(User).filter(User.email == email).first()
        if user_object is not None:
            if user_object.password == "GOOGLE_LOGIN" or user_object.password == "FACEBOOK_LOGIN":
                flash(
                    "<strong>Oh Snap!</strong> Consider signing in with a social network.",
                    "warning",
                )
                return render_template(
                    "user/auth-re-password.html", password_form=False
                )

            from abpoll.blueprints.user.tasks import (
                deliver_password_reset_email,
            )

            deliver_password_reset_email(user_object.email, user_object.display_username())
            flash(
                "<strong>Great!</strong> Check your email for a password reset link.",
                "success",
            )
        else:
            flash(
                "<strong>Oh Snap!</strong> A user with this email could not be found.",
                "danger",
            )

    return render_template("user/auth-re-password.html", password_form=False)


@user.route("/reset-password", methods=["POST", "GET"])
@login_required
def reset_password():
    if request.method == "POST":
        old_password = request.values.get("old_password")
        password_1 = request.values.get("password_1")
        password_2 = request.values.get("password_2")

        user_object = User.query.get(current_user.id)

        if check_password_hash(user_object.password, password=old_password):
            if password_1 == password_2:
                user_object.password = generate_password_hash(
                    password_1, salt_length=8
                )
                user_object.save()
                flash(
                    "<strong>Nice!</strong> You successfully changed your password.",
                    "success",
                )
                email = current_user.email
                logout_user()
                return redirect(url_for("user.login", email=email))
            else:
                flash("Your new passwords don't match!", "danger")
        else:
            flash("Your old password is not a match", "danger")
        return redirect(url_for("user.account_details"))
    else:
        return redirect(url_for("user.recover_password"))


@user.route("/reset-password/<token>", methods=["GET", "POST"])
@anonymous_required()
def reset_password_token(token):
    try:
        email = SERIALIZER_TOKEN.loads(token, salt=EMAIL_SALT, max_age=600)
        user_object = db.session.query(User).filter(User.email == email).first()
        if user_object is None:
            flash(
                "<strong>Oh snap!</strong> The token has expired try submitting again.",
                "danger",
            )
            return redirect(url_for("user.recover_password"))
        if request.method == "POST":
            password_1 = request.values.get("password_1")
            password_2 = request.values.get("password_2")
            if password_1 != password_2:
                flash(
                    "<strong>Oh snap!</strong> Your new passwords don't match.",
                    "danger",
                )
            else:
                user_object.password = generate_password_hash(
                    password_1, salt_length=8
                )
                user_object.email_verified = True
                user_object.save()

                return redirect(url_for("user.login", email=email))
        return render_template(
            "user/auth-re-password.html",
            email=email,
            password_form=True,
            token=token,
        )
    except SignatureExpired:
        flash(
            "<strong>Oh snap!</strong> The token has expired try submitting again.",
            "danger",
        )
        return redirect(url_for("user.recover_password"))


@user.route("/upload-profile", methods=["POST"])
def upload_profile():
    if not current_user.is_active:
        return redirect(url_for("user.login"))

    if request.method == "POST":

        # check if the post request has the file part
        if "file" not in request.files:
            flash("To save an image you must upload one", "danger")
            return redirect(url_for("user.account_details"))
        file = request.files["file"]
        # if user does not select file, browser also
        # submit an empty part without filename
        if file.filename == "":
            flash(
                'No image uploaded, click on the "Change Picture" button to upload one',
                'danger'
            )
            return redirect(url_for("user.account_details"))
        if file and allowed_image_file(file.filename):
            from lib.util_crop import crop_max_square

            im = Image.open(file)
            im_thumb = crop_max_square(im)
            if current_user.profile_picture is not None and "https:/" not in current_user.profile_picture:
                delete_image_from_cloudflare(current_user.profile_picture)

            from lib.upload_files import save_image

            filename = secure_filename(save_image(file.filename))
            ext = str(str(filename).split(".")[1]).upper()
            image_format = "JPEG" if ext.lower() == "jpg" else ext.upper()

            in_mem_file = io.BytesIO()
            im_thumb.save(
                in_mem_file, quality=70, optimize=True, format=image_format
            )
            in_mem_file.seek(0)

            user_obj = User.query.get(current_user.id)
            user_obj.profile_picture = upload_images_to_cloudflare(filename, in_mem_file)
            user_obj.save()
            return redirect(url_for("user.account_details"))
        else:
            flash(
                f"{file.filename} file is not supported. \n"
                f"You can only upload .png, .jpg, .jpeg, .gif files", "danger"
            )
            return redirect(url_for("user.account_details"))
    else:
        abort(403)


@user.route("/my-account/settings", methods=["GET", "POST"])
@login_required
def account_details():
    if request.method == "POST":
        email = request.values.get("email")
        display_username = request.values.get("username")
        description = request.values.get("bio")

        if len(description) >= 250:
            flash(
                "The description exceeded 250 characters, keep it to about  1-4 sentences",
                "danger"
            )
            return render_template("user/settings-account-details.html")
        else:
            current_user.description = description

        if email is not None:
            email = str(email).lower()
            if current_user.email != email:
                user_object = (
                    db.session.query(User).filter(User.email == email).first()
                )
                if user_object is None:
                    current_user.email = email
                    from abpoll.blueprints.user.tasks import email_confirmation

                    email_confirmation(email, current_user.username)
                    current_user.email_verified = False
                else:
                    flash("A user with this email already exists", "danger")
                    return render_template("user/settings-account-details.html")

        if display_username is not None:
            username = str(display_username).lower()
            if current_user.username != username:
                user_object_username = (
                    db.session.query(User)
                        .filter(User.username == username)
                        .first()
                )
                if user_object_username is not None:
                    flash(f"The username '{username}' is already taken", "danger")
                    return render_template("user/settings-account-details.html")
                else:
                    current_user.username = username
                    current_user.display_name = display_username

        current_user.save()

    return render_template("user/settings-account-details.html")


@user.route("/my-account/mail-preference")
@login_required
def account_settings():
    return render_template("user/settings-settings.html")


@user.route("/resend-confirmation-email")
@login_required
def resend_confirmation(**kwargs):
    from abpoll.blueprints.user.tasks import email_confirmation

    if not current_user.email_verified:
        statement = "Please, Check Your Email!"
        description = (
            f"Hi {current_user.display_username()}<br>We have sent a verification link to your email {current_user.email}, "
            f"if its not your email you can change it <a href='{url_for('user.account_details')}'>here</a>. "
            f"This will allow you to better use our website features like predictions, matching, and chatting."
        )
        email_confirmation(current_user.email, current_user.display_username())
        return render_template(
            "errors/thankyou.html", statement=statement, description=description
        )
    else:
        statement = "Email Already Verified"
        description = f"Hi {current_user.display_username()}<br>The email {current_user.email} is already verified."
        return render_template(
            "errors/thankyou.html", statement=statement, description=description
        )


@user.route("/confirm_email/<token>")
def confirm_email(token):
    try:
        email = SERIALIZER_TOKEN.loads(token, salt=EMAIL_SALT, max_age=1800)
        user_object = db.session.query(User).filter(User.email == email).first()
        if user_object.email_verified:
            statement = "Email Already Verified"
            description = f"Hi {user_object.display_username()},<br>The email {user_object.email} is already verified."
            return render_template(
                "errors/thankyou.html", statement=statement, description=description
            )
        user_object.email_verified = True
        user_object.confirmed_on = tzware_datetime()
        user_object.save()
    except SignatureExpired:
        statement = "Token Has Expired"
        description = (
            f"The confirmation link you clicked has expired, click "
            f"<a href='/resend-confirmation-email'>here</a> to get a new one."
        )
        return render_template(
            "/errors/thankyou.html",
            statement=statement,
            description=description,
        )

    statement = "Successfully Verified"
    description = f"Hi {user_object.display_username()},<br>Your email {user_object.email} has been successfully verified."
    return render_template(
        "/errors/thankyou.html", statement=statement, description=description
    )


@user.route("/delete-account", methods=["POST"])
@login_required
def delete_account():
    if request.method == "POST":
        user_to_delete = User.query.get(current_user.id)
        posts = db.session.query(Post).filter(Post.author_id == user_to_delete.id).all()

        if posts is not None:
            from abpoll.blueprints.post.tasks import delete_post_id

            for post in posts:
                delete_post_id(post.id)

        if user_to_delete.profile_picture is not None:
            delete_image_from_cloudflare(user_to_delete.profile_picture)

        if user_to_delete.back_ground is not None and user_to_delete.back_ground != "/images/account/bg.png":
            delete_image_from_cloudflare(user_to_delete.back_ground)

        db.session.delete(user_to_delete)
        db.session.commit()

        return redirect(url_for("user.register"))
    else:
        return abort(403)
