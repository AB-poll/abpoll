from flask import Blueprint, flash, url_for
from flask_login import current_user

from abpoll.extensions import db
from lib.util_json import render_json, parse_arg_from_requests
from abpoll.blueprints.post.models import Like, Post
from abpoll.blueprints.user.models import User
from abpoll.blueprints.general.models.activity import Notifications


question_likes = Blueprint(
    "question_likes",
    __name__,
)


@question_likes.route("/util/likes", methods=["POST"])
def like_posts():
    liked_post_id = parse_arg_from_requests("post_id")

    if liked_post_id is not None or liked_post_id != "":
        post = (
            db.session.query(Post)
            .filter(Post.id == liked_post_id)
            .first()
        )
        if post is not None:
            if current_user.is_active:
                new_like = Like(
                    author_id=current_user.id, post_id=liked_post_id
                )
                db.session.add(new_like)
                db.session.commit()
                return render_json(200, "Success")
            else:
                flash("Please login to add items on your watchlist", "danger")
                return render_json(
                    403,
                    f"{url_for('user.login')}?next=%2fu%2f{post.author.username}%2f{post.id}",
                )
    return render_json(500, "Invalid post Id")


@question_likes.route("/util/unlike", methods=["POST"])
def unlike_post():
    liked_post_id = parse_arg_from_requests("post_id")

    if liked_post_id is not None or liked_post_id != "":
        if current_user.is_active:
            like = (
                db.session.query(Like)
                .filter(
                    Like.author_id == current_user.id,
                    Like.post_id == liked_post_id,
                )
                .first()
            )

            if like is not None:
                db.session.delete(like)
                db.session.commit()
                return render_json(200, "Success")
        else:
            post = (
                db.session.query(Post)
                .filter(Post.id == liked_post_id)
                .first()
            )
            flash("Please login to add items on your watchlist", "danger")
            return render_json(
                403,
                f"{url_for('user.login')}?next=%2fu%2f{post.author.username}%2f{post.id}",
            )
    else:
        return render_json(500, "Invalid post Id")


@question_likes.route("/util/follow", methods=["POST"])
def follow_person():
    followed_user = parse_arg_from_requests("user_name")
    if not current_user.is_active:
        flash(f"Please login to follow {followed_user}", "danger")
        return render_json(
            403, f"{url_for('user.login')}?next=%2fu%2f{followed_user}"
        )

    if followed_user is None or followed_user == "":
        return render_json(500, "Invalid username")

    user_object = (
        db.session.query(User).filter(User.username == followed_user).first()
    )
    if user_object is None:
        return render_json(400, "Invalid Request")

    new_notification = Notifications(
        category="followers",
        objective_link=f"/u/{current_user.username}",
        title="New Follow",
        body=f"{current_user.display_username()} just followed you",
        user_id=user_object.id,
    )

    new_notification.save()

    current_user.follow(user_object)
    return render_json(200, "Success")


@question_likes.route("/util/unfollow", methods=["POST"])
def unfollow_person():
    followed_user = parse_arg_from_requests("user_name")
    if not current_user.is_active:
        flash(f"Please login to unfollow {followed_user}", "danger")
        return render_json(
            403, f"{url_for('user.login')}?next=%2fu%2f{followed_user}"
        )

    if followed_user is None or followed_user == "":
        return render_json(400, "Invalid Request")

    user_object = db.session.query(User).filter(User.username == followed_user).first()
    if user_object is None:
        return render_json(400, "Invalid Request")

    current_user.unfollow(user_object)
    return render_json(200, "Success")
