from flask import Blueprint
from abpoll.extensions import csrf
from flask import jsonify
from flask import request
import json


from abpoll.extensions import db
from sqlalchemy.sql.expression import func
from abpoll.blueprints.user.models import User
from abpoll.blueprints.post.models import Post


from lib.util_json import render_json, parse_arg_from_requests

retrieve_topics = Blueprint(
    "retrieve_topics",
    __name__,
)


@retrieve_topics.route("/util/retrieve_topics", methods=["GET"])
def all_topics():
    users = db.session.query(User).filter(User.status == 'topic').outerjoin(Post).group_by(User.id).order_by(
        func.count().desc()).all()

    output = []
    for user in users:
        output.append({
            "value": user.username,
            "name": user.display_username(),
            "profile": user.retrieve_profile_picture(),
        })
    return render_json(200, output)
