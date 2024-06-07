from flask import (
    render_template,
    redirect,
    url_for,
    abort,
    Blueprint,
    session,
)
from flask_login import current_user


from abpoll.extensions import db
from lib.util_json import render_json
from abpoll.blueprints.post.models import PostViewed


show_votes = Blueprint("show_votes", __name__, template_folder="templates")


@show_votes.route("/v/<vote_id>")
def votes(vote_id):
    # user_object = (db.session.query(User).filter(User.fingerprint_id == vote_id).first())
    # if user_object is not None:
    #     return redirect(url_for('post.user_page_votes', username=user_object.username))

    posts = db.session.query(PostViewed).filter(PostViewed.fingerprint_id == vote_id).order_by(PostViewed.created_on.desc()).all()
    if len(posts) == 0:
        return abort(404)
    posts = [x.post for x in posts]

    return render_template("show_votes/anonymous-votes.html", vote_id=vote_id, posts=posts)


@show_votes.route("/v1/retrieve/vote-link")
def vote_link():
    if current_user.is_active:
        return render_json(200, {"link": url_for('post.user_page_votes', username=current_user.username, _external=True)})

    voter_id = session["fingerprint_id"]
    return render_json(200, {"link": url_for('show_votes.votes', vote_id=voter_id, _external=True)})
