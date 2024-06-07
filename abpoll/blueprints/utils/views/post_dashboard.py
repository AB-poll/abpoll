import re
from flask import Blueprint, flash, url_for, redirect, abort, session
from flask_login import current_user
from itsdangerous import SignatureExpired

from abpoll.extensions import db
from abpoll.extensions import mail
from lib.util_sqlalchemy import avatar_creation, random_user_id


from abpoll.blueprints.post.models import Post, PostAVote, PostBVote, ReportPoll
from abpoll.blueprints.user.models import User

from abpoll.blueprints.general.models.activity import Notifications

from lib.util_json import render_json, parse_arg_from_requests

post_dashboard = Blueprint(
    "post_dashboard",
    __name__,
)


def vote_cookies(poll_id, choice):
    session[poll_id] = choice
    session.modified = True
    return None


@post_dashboard.route("/username-validation", methods=["POST"])
def username_validation():
    username = parse_arg_from_requests("username").lower()
    if username is not None:
        if bool(re.match(r"^(?=.*[a-z])\w{3,30}\s*$", username)):
            user_object = (
                db.session.query(User).filter(User.username == username).first()
            )
            if user_object is not None:
                if current_user.is_active:
                    if current_user.username == username:
                        return render_json(200, "")
                return render_json(
                    200, "<span class='text-danger'>Not Available.</span>"
                )
            if user_object is None:
                return render_json(
                    200, "<span class='text-success'>Available.</span>"
                )
        else:
            return render_json(
                200, "<span class='text-danger'>Invalid username.</span>"
            )
    return render_json(
        403, {"unauthorized": "The request you made could not be completed."}
    )


# choice a vote
@post_dashboard.route("/a-vote", methods=["POST"])
def up_vote_comment():
    post_id = parse_arg_from_requests("post_id")
    if post_id is None or post_id == "":
        return abort(500)

    post_object = db.session.query(Post).filter(Post.id == post_id).first()
    if post_object is None:
        return render_json(404)

    if not current_user.is_active:
        vote_cookies(post_id, True)
        post_object.external_a_votes += 1
        post_object.save()
        return render_json(403, f"{url_for('user.login')}?next=%2fp%2f{post_id}")

    new_vote = PostAVote(
        author_id=current_user.id,
        post_id=post_object.id,
    )
    new_vote.save()

    from abpoll.blueprints.post.tasks import post_was_voted
    post_was_voted(viewed_posts_id=post_object.id, current_user_id=current_user.id, user_vote_id=0)
    return render_json(200, "Success")


# choice b vote
@post_dashboard.route("/b-vote", methods=["POST"])
def down_vote_comment():
    post_id = parse_arg_from_requests("post_id")
    if post_id is None or post_id == "":
        return abort(500)

    post_object = db.session.query(Post).filter(Post.id == post_id).first()
    if post_object is None:
        return render_json(404)

    if not current_user.is_active:
        vote_cookies(post_id, False)
        post_object.external_b_votes += 1
        post_object.save()
        return render_json(403, f"{url_for('user.login')}?next=%2fp%2f{post_id}")

    new_vote = PostBVote(
        author_id=current_user.id,
        post_id=post_object.id,
    )
    new_vote.save()

    from abpoll.blueprints.post.tasks import post_was_voted
    post_was_voted(viewed_posts_id=post_object.id, current_user_id=current_user.id, user_vote_id=1)
    return render_json(200, "Success")


@post_dashboard.route("/post_answered", methods=["POST"])
def save_post():
    print("save_post")
    post_id = parse_arg_from_requests("post_id")
    vote_letter = parse_arg_from_requests("vote_letter")
    print("post_id", post_id)
    print("vote_letter", vote_letter)
    if post_id is None or post_id == '' or vote_letter is None or vote_letter == '':
        abort(500)

    from abpoll.blueprints.post.tasks import post_was_voted
    post_object = db.session.query(Post).filter(Post.id == post_id).first()

    vote_list = post_object.options_vote
    vote_list['abcd'.find(vote_letter)] += 1

    post_object.options_vote = []
    post_object.save()

    post_object.options_vote = vote_list
    post_object.save()

    if session.get('fingerprint_id'):
        pass
    else:
        session["fingerprint_id"] = random_user_id()
        session["accuracy_radius"] = "50"
        session["latitude"] = "37.751"
        session["longitude"] = "-97.822"
        session["timezone"] = "America/North_Dakota/Center"
        session["city"] = "Kansas"
        session["subdivision"] = "US"
        session["country"] = "US"
        session["continent"] = "NA"
        session["points"] = 50
        session.modified = True

    if current_user.is_active:
        current_user.coins += 5
        current_user.save()
        post_was_voted(viewed_posts_id=post_id, current_user_id=current_user.id, user_vote_id='abcd'.find(vote_letter))
        return render_json(200, {
            "message": "success",
            "balance": current_user.coins,
        })

    post_was_voted(viewed_posts_id=post_id, user_vote_id='abcd'.find(vote_letter))

    try:
        session["points"] += 5
    except KeyError:
        session["points"] = 55
    session.modified = True

    return render_json(200, {
        "message": "success",
        "balance": session["points"],
    })


@post_dashboard.route("/report-poll-api", methods=["POST"])
def report_poll():
    post_id = parse_arg_from_requests("post_id")

    if not current_user.is_active:
        flash("Please login to vote", "danger")
        return render_json(403, f"{url_for('user.login')}?next=%2fp%2f{post_id}")

    post_object = db.session.query(Post).filter(Post.id == post_id).first()
    if post_object is None:
        return abort(500)

    reason = parse_arg_from_requests("report_reason", type=int)
    if reason is None:
        return abort(500)

    if post_object.did_user_report_poll():
        return render_json(200, "Success")

    if 0 < reason < 7:
        new_report = ReportPoll(
            author_id=current_user.id,
            post_id=post_object.id,
            reason=reason,
        )
        new_report.save()

        return render_json(200, "Success")
    return abort(500)
