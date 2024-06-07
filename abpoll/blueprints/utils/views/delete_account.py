from lib.util_json import render_json, parse_arg_from_requests

from flask_login import current_user
from flask import (
    Blueprint,
    flash,
    url_for,
)

from lib.upload_files import delete_image_from_cloudflare

from abpoll.extensions import db
from abpoll.blueprints.user.models import User
from abpoll.blueprints.post.models import Post
from lib.util_mail_assets import generate_otp

delete_account = Blueprint("delete_account", __name__, )

verification_code = 0


def delete_user_data(user_id):
    user_to_delete = User.query.get(user_id)
    posts = db.session.query(Post).filter(Post.author_id == user_id).all()

    if posts is not None:
        from abpoll.blueprints.post.tasks import delete_post_id

        for post in posts:
            delete_post_id(post.id)

    if user_to_delete.profile_picture is not None and "https:/" not in user_to_delete.profile_picture:
        delete_image_from_cloudflare(user_to_delete.profile_picture)

    if user_to_delete.back_ground is not None and user_to_delete.back_ground != "/images/account/bg.png":
        delete_image_from_cloudflare(user_to_delete.back_ground)

    db.session.delete(user_to_delete)
    db.session.commit()
    return True


@delete_account.route("/delete-account-password-verification", methods=["POST"])
def password_verification():
    if not current_user.is_active:
        flash("Please login to delete your account", "danger")
        return render_json(301, f"{url_for('user.login')}?next=%2fmy-account%2fmail-preference")

    global verification_code

    if current_user.authenticated(password=parse_arg_from_requests("password")):
        verification_code = generate_otp(6)
        from abpoll.blueprints.user.tasks import account_delete
        account_delete(current_user.email, current_user.display_username(), verification_code)
        return render_json(200)
    else:
        return render_json(403)


@delete_account.route("/delete-account-code-verification", methods=["POST"])
def code_verification():
    if not current_user.is_active:
        flash("Please login to delete your account", "danger")
        return render_json(301, f"{url_for('user.login')}?next=%2fmy-account%2fmail-preference")

    otp_key = parse_arg_from_requests("otp_key")
    if verification_code == otp_key:
        delete_user_data(current_user.id)
        return render_json(301, url_for("user.register"))

    else:
        return render_json(403)
