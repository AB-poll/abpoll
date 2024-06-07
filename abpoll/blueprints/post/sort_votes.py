from flask import Blueprint, abort
from abpoll.extensions import csrf
import hmac
from flask import jsonify, render_template
from flask import request
import json

from sqlalchemy import or_, text, func, and_

from lib.util_json import render_json, parse_arg_from_requests

from abpoll.blueprints.user.models import User
from abpoll.blueprints.post.models import Post, PostViewed
from abpoll.extensions import db

sort_votes = Blueprint(
    "sort_votes",
    __name__,
)


@sort_votes.route("/util/retrieve-questions-and-choices", methods=["POST"])
def retrieve_questions_answers():
    output = {}
    username = parse_arg_from_requests("username").lower()
    user_object = db.session.query(User).filter(User.username == username).first()
    if user_object is not None:
        for post in user_object.post:
            if post.post_format != "Trivia":
                if post.title is None or post.title == "":
                    output[f"{post.a_text} vs {post.b_text}"] = [post.a_text, post.b_text, post.id]
                else:
                    output[f"{post.title} {post.a_text} vs {post.b_text}"] = [post.a_text, post.b_text, post.id]
        return render_json(200, output)
    return render_json(404)


@sort_votes.route("/u/<username>/sort-votes", methods=["get"])
def sort_polls_by_votes(username):
    choice_id = request.args.get("choice", text(""))
    post_id = request.args.get("poll_id", text(""))

    user_object = db.session.query(User).filter(User.username == username.lower()).first()
    if user_object is None:
        return abort(404)

    if choice_id == "" or post_id == "" or choice_id not in ["0", "1"] or len(post_id) > 20:
        return render_template("post/profile.html", User=user_object, posts=user_object.post)

    post = Post.query.get(post_id)
    if post is None:
        return render_template("post/profile.html", User=user_object, posts=user_object.post)

    total_users_to_sort = [r.fingerprint_id for r in db.session.query(PostViewed).filter(and_(PostViewed.post_id == post.id, PostViewed.user_vote_id == int(choice_id))).distinct()]

    return render_template("post/profile-sorted.html",
                           User=user_object,
                           posts=user_object.post,
                           fingerprints=total_users_to_sort)
