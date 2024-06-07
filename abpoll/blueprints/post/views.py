from flask import (
    render_template,
    redirect,
    url_for,
    flash,
    request,
    abort,
    Blueprint,
)
from flask_login import current_user

from lib.upload_files import allowed_image_file, random_image_background
from lib.util_json import parse_arg_from_requests
from lib.util_json import render_json
from lib.util_post import (
    random_post_id,
    return_cv2_image,
    create_array_from_argument,
    save_image_to_server,
    vertical_attach_images
)

from abpoll.extensions import db
from abpoll.blueprints.post.models import Post, PostViewed
from abpoll.blueprints.general.models.activity import Notifications
from abpoll.blueprints.user.models import User
from lib.upload_files import delete_image_from_cloudflare
from sqlalchemy.sql.expression import func, and_

from config.settings import RECOMMEND_NUMBER

post = Blueprint("post", __name__, template_folder="templates")


@post.route("/u/<username>")
def user_page(username):
    username = username.lower()
    user_object = (db.session.query(User).filter(User.username == username).first())
    if user_object is not None:
        posts = db.session.query(Post).filter(and_(Post.author_id == user_object.id, Post.voting_open)).order_by(
            Post.created_on.desc()).all()

        return render_template("post/profile.html",
                               User=user_object,
                               posts=posts,
                               )
    else:
        abort(404)


@post.route("/u/<username>/votes")
def user_page_votes(username):
    username = username.lower()
    user_object = (db.session.query(User).filter(User.username == username).first())
    if user_object is not None:
        posts = db.session.query(PostViewed).filter(PostViewed.author_id == user_object.id).order_by(
            PostViewed.created_on.desc()).all()
        posts = [x.post for x in posts]

        return render_template("post/profile-votes.html", User=user_object, posts=posts)
    else:
        abort(404)


# TODO: ADD Ask me anything tab

@post.route("/edit_user_page", methods=["POST"])
def edit_user_page():
    if not current_user.is_active:
        return redirect(
            f"{url_for('user.login')}?next=%2fmy-account%2fsettings"
        )

    selected_user = User.query.get(current_user.id)
    if selected_user is None:
        return abort(404)
    selected_user.description = request.values.get("description")
    location = request.values.get("location")
    selected_user.location = None

    if location != "" or location is None:
        selected_user.location = location

    if "background" not in request.files:
        # No file part
        pass
    else:
        file = request.files["background"]
        if file.filename == "":
            pass
        elif file and allowed_image_file(file.filename):
            from abpoll.blueprints.post.tasks import change_all_default_posts_background
            new_background = save_image_to_server(file)
            # If selected user already changed their background
            if selected_user.back_ground is not None and selected_user.back_ground != "/images/account/bg.png":
                delete_image_from_cloudflare(selected_user.back_ground)
                change_all_default_posts_background(selected_user.id, new_background, selected_user.back_ground)
            #  if selected user didn't change their background
            else:
                change_all_default_posts_background(selected_user.id, new_background)

            selected_user.back_ground = new_background

        else:
            #       file is not supported.
            #       You can only upload .png, .jpg, .jpeg, .gif files
            pass

    social_1_option = request.values.get("social_1_option")
    social_1_handle = request.values.get("social_1")

    if len(social_1_handle) <= 1:
        selected_user.social_1_handle = None
        selected_user.social_1_link = "#"
    else:
        if social_1_option == "Twitter":
            social_1 = social_1_handle.replace("@", "")
            social_1_link = f"https://twitter.com/{social_1}"
            selected_user.social_1_option = "twitter"
            selected_user.social_1_link = social_1_link
            selected_user.social_1_handle = social_1
        if social_1_option == "Instagram":
            social_1 = social_1_handle.replace("@", "")
            social_1_link = f"https://instagram.com/{social_1}"
            selected_user.social_1_option = "instagram"
            selected_user.social_1_link = social_1_link
            selected_user.social_1_handle = social_1
        if social_1_option == "Twitch":
            social_1 = social_1_handle.replace("@", "")
            social_1_link = f"https://twitch.tv/{social_1}"
            selected_user.social_1_option = "twitch"
            selected_user.social_1_link = social_1_link
            selected_user.social_1_handle = social_1
        if social_1_option == "Youtube":
            selected_user.social_1_option = "youtube"
            selected_user.social_1_link = social_1_handle
            selected_user.social_1_handle = "My Youtube"
        if social_1_option == "Website":
            web_link = f'https://{((social_1_handle.replace("www.", "")).replace("https://", "")).replace("http://", "")}'
            selected_user.social_1_option = "globe"
            selected_user.social_1_link = web_link
            selected_user.social_1_handle = "My Website"

    social_2_option = request.values.get("social_2_option")
    social_2_handle = request.values.get("social_2")

    if len(social_2_handle) <= 1:
        selected_user.social_2_handle = None
        selected_user.social_2_link = "#"
    else:
        if social_2_option == "Twitter":
            social_2 = social_1_handle.replace("@", "")
            social_2_link = f"https://twitter.com/{social_2}"
            selected_user.social_2_option = "twitter"
            selected_user.social_2_link = social_2_link
            selected_user.social_2_handle = social_2
        if social_2_option == "Instagram":
            social_2 = social_2_handle.replace("@", "")
            social_2_link = f"https://instagram.com/{social_2}"
            selected_user.social_2_option = "instagram"
            selected_user.social_2_link = social_2_link
            selected_user.social_2_handle = social_2
        if social_2_option == "Twitch":
            social_2 = social_2_handle.replace("@", "")
            social_2_link = f"https://twitch.tv/{social_2}"
            selected_user.social_2_option = "twitch"
            selected_user.social_2_link = social_2_link
            selected_user.social_2_handle = social_2
        if social_2_option == "Youtube":
            selected_user.social_2_option = "youtube"
            selected_user.social_2_link = social_2_handle
            selected_user.social_2_handle = "My Youtube"
        if social_2_option == "Website":
            selected_user.social_2_option = "globe"
            selected_user.social_2_link = social_2_handle
            selected_user.social_2_handle = "My Website"

    selected_user.save()
    return redirect(f"/u/{current_user.username}")


@post.route("/p/<post_id>", methods=["GET", "POST"])
def post_page(post_id):
    posts = Post.query.get(post_id)
    if posts is not None:
        return render_template("post/view-post.html", post=posts)
    abort(404)


@post.route("/delete-post", methods=["POST"])
def delete_post_id():
    post_id = parse_arg_from_requests("post_id")
    if post_id is not None:

        if not current_user.is_active:
            return render_json(301, f"{url_for('user.login')}?next=%2fp%2f{post_id}")

        post_to_delete = Post.query.get(post_id)
        username = post_to_delete.author.username
        if post_to_delete is not None:
            if current_user == post_to_delete.author or current_user.role == 'admin':
                from abpoll.blueprints.post.tasks import delete_post_id
                delete_post_id(post_id)
                return render_json(301, url_for('post.user_page', username=username))

    return abort(404)
