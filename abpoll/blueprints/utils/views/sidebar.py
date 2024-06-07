from flask import request, session, redirect, Blueprint, url_for
from flask_login import current_user
from lib.util_json import render_json, parse_arg_from_requests
from lib.util_sqlalchemy import avatar_creation, random_user_id

from sqlalchemy.sql.expression import func
from abpoll.blueprints.post.models import Post
from abpoll.blueprints.user.models import User

from abpoll.extensions import db
from config.settings import RECOMMEND_NUMBER

sidebar = Blueprint("sidebar", __name__,)


@sidebar.route("/util/render-subscribe-pop-up", methods=["POST"])
def render_subscribe():
    if current_user.is_active:
        return render_json(403)

    sign_up_pop_up = Post.query.filter(Post.search("Do you want to claim your 50 points now?")).first()
    return render_json(200, sign_up_pop_up.serialize)


@sidebar.route("/util/render-recommended-users", methods=["POST"])
def render_recommended_users():
    output = []
    if current_user.is_active:
        users = db.session.query(User).filter(User.status != 'hidden').outerjoin(Post).group_by(User.id).order_by(
            func.count().desc()).limit(4).all()
    else:
        users = db.session.query(User).filter(User.status != 'hidden').outerjoin(Post).group_by(User.id).order_by(
            func.count().desc()).limit(RECOMMEND_NUMBER).all()

    for user in users:
        output.append({
            "url": url_for('post.user_page', username=user.username),
            "profile-picture": user.retrieve_profile_picture(),
            "display-username": user.display_username(),
            "username": user.description or user.username,
        })
    return render_json(200, output)
