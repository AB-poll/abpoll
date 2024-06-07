import uuid
from flask import Blueprint, flash, url_for, abort
from flask_login import current_user, login_required
from sqlalchemy import func, and_

from abpoll.extensions import db
from lib.util_json import render_json, parse_arg_from_requests
from abpoll.blueprints.post.models import (
    PostComment,
    PostCommentReply,
    CommentLike,
)
from abpoll.blueprints.general.models.activity import Notifications
from abpoll.blueprints.post.models import Post
from abpoll.extensions import csrf

post_comment = Blueprint("post_comment", __name__, url_prefix='/comment_webhook')


@post_comment.route("/add-comment", methods=["POST"])
@login_required
def add_comment():
    post_id = parse_arg_from_requests("post_id")
    if post_id is None:
        return render_json(400, "Missing post_id or page in the request")

    comment_text = parse_arg_from_requests("comment_text")
    if len(comment_text) == 0 or len(comment_text) > 280:
        return render_json(404, "Error: comment must be between 1 and 280 characters")

    post_object = Post.query.get(post_id)
    if post_object is None:
        return render_json(404, "Post not found")

    id_generated = str(uuid.uuid4()).replace("-", "")

    new_comment = PostComment(
        id=id_generated,
        comment_author_id=current_user.id,
        post_id=post_object.id,
        text=comment_text,
    )
    new_comment.save()

    output = new_comment.serialize

    if current_user.id != post_object.author.id:
        new_notification = Notifications(
            category="post_comments",
            objective_link=f"/p/{post_object.id}",
            title="New Comment",
            body=comment_text[:43] + ("..." * (len(comment_text) > 41)),
            post_id=post_object.id,
            user_id=post_object.author.id,
            post_comment_id=id_generated,
        )
        new_notification.save()
        new_notification.send_notification()

    return render_json(201, [output])


@post_comment.route("/retrieve-comments", methods=["POST"])
def retrieve_comments():
    post_id = parse_arg_from_requests("post_id")
    if post_id is None:
        return render_json(400, "Missing post_id or page in the request")

    try:
        page = int(parse_arg_from_requests("page"))
    except ValueError or TypeError:
        return render_json(400, "'page' is missing or is in invalid format")

    post_object = Post.query.get(post_id)
    if post_object is None:
        return render_json(404, "Post not found")

    output = []

    if current_user.is_active and page == 1:
        user_comments = db.session.query(PostComment).filter(and_(PostComment.post_id == post_id, PostComment.comment_author_id == current_user.id)).order_by(PostComment.created_on.desc())
        for comment in user_comments:
            output.append(comment.serialize)

    if current_user.is_active:
        comments = db.session.query(PostComment).filter(and_(PostComment.post_id == post_id, PostComment.comment_author_id != current_user.id)).order_by(func.count(CommentLike.id).desc()).outerjoin(CommentLike).group_by(PostComment.id).paginate(page, 50, False)
    else:
        comments = db.session.query(PostComment).filter(PostComment.post_id == post_id).order_by(func.count(CommentLike.id).desc()).outerjoin(CommentLike).group_by(PostComment.id).paginate(page, 50, False)

    for comment in comments.items:
        output.append(comment.serialize)

    return render_json(200, output, comments.has_next)


@post_comment.route("/delete-comment", methods=["POST"])
def delete_comment():
    comment_to_delete = parse_arg_from_requests("comment_id")
    if current_user.is_active and comment_to_delete is not None:
        comment_object = db.session.query(PostComment).filter(PostComment.id == comment_to_delete).first()
        if comment_object is not None:
            if current_user == comment_object.comment_author or comment_object.post.author == current_user:
                comment_object.delete()
            return render_json(200, "Success")
    return abort(404)


@post_comment.route("/delete-reply", methods=["POST"])
def delete_reply():
    reply_id = parse_arg_from_requests("reply_id")
    if reply_id is None or reply_id == "":
        return abort(500)
    reply_object = db.session.query(PostCommentReply).filter(PostCommentReply.id == reply_id).first()

    if reply_object is None:
        return render_json(500)

    if not current_user.is_active:
        flash("Please login to delete this answer", "danger")
        return render_json(403, f"{url_for('user.login')}?next=%2fp%2f{reply_object.comment.post.id}", )

    if reply_object.reply_author != current_user:
        return render_json(200, "Success")

    reply_object.delete()
    return render_json(200, "Success")


@post_comment.route("/like-comment", methods=["POST"])
def like_comment():
    comment_id = parse_arg_from_requests("comment_id")
    if comment_id is None or comment_id == "":
        return abort(500)

    comment_id = db.session.query(PostComment).filter(PostComment.id == comment_id).first()
    if comment_id is None:
        return render_json(404)

    if not current_user.is_active:
        flash("Please login to like a comment", "danger")
        return render_json(
            403, f"{url_for('user.login')}?next=%2fp%2f{comment_id.post.id}", )

    like_query = db.session.query(CommentLike).filter(
        CommentLike.author_id.like(current_user.id),
        CommentLike.comment_id.like(comment_id.id),
    ).first()

    if like_query is None:
        new_like = CommentLike(author_id=current_user.id, comment_id=comment_id.id)
        db.session.add(new_like)
        db.session.commit()
    else:
        db.session.delete(like_query)
        db.session.commit()

    return render_json(200, "Success")


@post_comment.route("/redirect-login", methods=["POST"])
@csrf.exempt
def redirect_login():
    post_id = parse_arg_from_requests("post_id")
    if post_id is None:
        return render_json(400, "Missing post_id or page in the request")

    flash("Please sign up to comment", "danger")
    return render_json(
        403, f"{url_for('user.register')}?next=%2fp%2f{post_id}", )
