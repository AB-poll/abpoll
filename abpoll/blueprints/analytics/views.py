from flask import Blueprint, render_template, url_for
from flask_login import login_required

from abpoll.blueprints.billing.decorators import subscription_required
from abpoll.blueprints.post.models import Post, PostViewed
from abpoll.blueprints.user.decorators import role_required
from abpoll.blueprints.user.models import User
from abpoll.extensions import db
from lib.util_json import parse_arg_from_requests, render_json

analytics = Blueprint("analytics", __name__, template_folder="templates")


@analytics.before_request
# @login_required
# @subscription_required
def before_request():
    """ Protect all the membership required endpoints. """
    pass


@analytics.route("/insights")
def insights():
    # render the admin analytics tab

    return render_template("analytics/analytics-admin.html")


@analytics.route("/util/analytics/api/v1/topic/list")
def topics():
    all_topics = db.session.query(User).filter(User.status == "topic").all()
    output = [topic.display_username() for topic in all_topics]
    return render_json(200, output)


@analytics.route("/util/analytics/api/v1/questions/list", methods=["POST"])
def questions():
    username = parse_arg_from_requests("topic")
    if username is None:
        return render_json(400, "Please make sure to include username in your request.")
    user = db.session.query(User).filter(User.username == username.lower()).first()
    if user is None:
        return render_json(404, "The username was invalid, changed, or does not exist.")

    output = []
    for post in user.post:
        if post.post_format != "Trivia":
            output.append({
                "id": post.id,
                "title": f"{post.title}: {post.a_text} or {post.b_text}",
                "question": post.title,
                "a_text": post.a_text,
                "b_text": post.b_text,
            })

    return render_json(200, output)


@analytics.route("/util/analytics/api/v1/locations", methods=["POST"])
def location():
    """Return a list of locations that voted on by the post_id"""
    question_id = parse_arg_from_requests("question_id")
    if question_id is None:
        return render_json(400, "Make sure to include the post_id in your request.")

    countries = db.session.query(PostViewed.country) \
        .filter(PostViewed.post_id == question_id) \
        .group_by(PostViewed.country) \
        .order_by(PostViewed.country.desc()).all()

    return render_json(200, [country[0] for country in countries])


@analytics.route("/util/analytics/api/v1/votes/pins", methods=["POST"])
def votes_pins():
    post_id = parse_arg_from_requests("post_id")
    if post_id is None:
        return render_json(400, "Make sure to include the post_id in your request.")

    selected_location = parse_arg_from_requests("location")
    if selected_location is None:
        return render_json(400, "Make sure to include the post_id in your request.")

    post = Post.query.get(post_id)
    if post is None:
        return render_json(404, "The post you are looking may have been deleted, or does not exist.")

    if selected_location == "all":
        fingers = db.session.query(PostViewed.fingerprint_id, PostViewed.user_vote_id, PostViewed.latitude,
                                   PostViewed.longitude).filter_by(post_id=post_id).all()

        output_dict = {
            "a_votes": post.options_vote[0],
            "b_votes": post.options_vote[1],
            "output": [],
        }

        for f in fingers:
            if f.latitude and f.longitude:
                output_dict["output"].append({
                    "user_id": f.fingerprint_id,
                    "vote_id": f.user_vote_id,
                    "lat": f.latitude,
                    "long": f.longitude,
                    "url": url_for("show_votes.votes", vote_id=f.fingerprint_id, _external=True),
                })

        return render_json(200, output_dict)

    fingers = db.session.query(PostViewed.fingerprint_id, PostViewed.user_vote_id, PostViewed.latitude,
                               PostViewed.longitude, PostViewed.country) \
        .filter_by(post_id=post_id, country=selected_location).all()

    output_dict = {
        "a_votes": 0,
        "b_votes": 0,
        "output": [],
    }

    for f in fingers:
        if f.latitude and f.longitude:
            output_dict["output"].append({
                "user_id": f.fingerprint_id,
                "vote_id": f.user_vote_id,
                "lat": f.latitude,
                "long": f.longitude,
                "url": url_for("show_votes.votes", vote_id=f.fingerprint_id, _external=True),
            })
        if f.user_vote_id == 0:
            output_dict["a_votes"] += 1
        elif f.user_vote_id == 1:
            output_dict["b_votes"] += 1

    return render_json(200, output_dict)
