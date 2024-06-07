from flask import (
    flash,
    render_template,
    url_for,
    request,
    abort,
    Blueprint,
    session,
    redirect,
)
from flask_login import current_user, login_required

from abpoll.extensions import db
from abpoll.blueprints.user.models import User
from abpoll.blueprints.message.models import PrivateChatMeta, PrivateChats

from sqlalchemy import or_, text, func, and_

from lib.util_json import render_json, parse_arg_from_requests
from lib.util_datetime import tzware_datetime
from abpoll.blueprints.message.events import send_pusher_message, check_channel_info

from abpoll.blueprints.general.models.activity import Notifications

message = Blueprint("message", __name__, template_folder="templates")


@message.route("/my-account/message/<receiver_username>/send", methods=["POST"])
def send_message(receiver_username):
    if not current_user.is_active:
        return redirect(
            f"{url_for('user.login')}?next=%2fmy-account%2fmessage%2f{receiver_username}"
        )
    user_object = (db.session.query(User).filter(User.username == receiver_username.lower()).first())
    if user_object is not None:

        message_content = request.values.get("message_content")
        room_id = request.values.get("room_id")

        chat_room = PrivateChatMeta.query.get(int(room_id))
        if chat_room is None:
            chat_room = PrivateChatMeta(from_user=current_user.id, to_user=user_object.id)
            chat_room.save()
        # referring to id as channel so the front end user's can't tell what it is
        if chat_room.from_user == current_user.id:
            channel = chat_room.to_user
        else:
            channel = chat_room.from_user

        to_user_object = User.query.get(channel)

        chat_room.unread_count += 1
        chat_room.save()
        new_chat = PrivateChats(meta_id=chat_room.id, sender_id=current_user.id, message=message_content)
        new_chat.save()

        if to_user_object.is_user_online():
            send_pusher_message(channel_name=channel,
                                event='new-message',
                                message=message_content,
                                profile_picture=request.values.get("avatar"),
                                room_id=chat_room.id,
                                username=current_user.display_username())
        else:
            new_notification = Notifications(
                category="message",
                objective_link=f"/my-account/message/{to_user_object.username}",
                title="New Message",
                body=message_content[:43] + ("..." * (len(message_content) > 41)),
                user_id=user_object.id,
                message_content_id=new_chat.id,
            )
            new_notification.save()
            new_notification.send_notification()

    return render_json(200)


@message.route("/my-account/message", methods=["GET"])
@login_required
def render_message_html():
    return render_template('message/message-2.html', username=None)


@message.route("/my-account/message/<username>", methods=["GET"])
def message_username(username):
    username = username.lower()
    if not current_user.is_active:
        return redirect(
            f"{url_for('user.login')}?next=%2fmy-account%2fmessage%2f{username}"
        )
    user_object = (db.session.query(User).filter(User.username == username).first())
    if user_object is None or user_object.username == current_user.username:
        return redirect(url_for('message.render_message_html'))

    chat_room = db.session.query(PrivateChatMeta).filter(
        and_(PrivateChatMeta.from_user == current_user.id, PrivateChatMeta.to_user == user_object.id)).first()
    if chat_room is None:
        chat_room = db.session.query(PrivateChatMeta).filter(
            and_(PrivateChatMeta.from_user == user_object.id, PrivateChatMeta.to_user == current_user.id)).first()
        if chat_room is None:
            chat_room = PrivateChatMeta(from_user=current_user.id, to_user=user_object.id)
            chat_room.save()
    if chat_room.unread_count > 0 and chat_room.private_chats[-1].sender != current_user:
        chat_room.unread_count = 0
        chat_room.save()

    return render_template('message/chat-room.html',
                           username=username,
                           user_object=user_object,
                           chat_room=chat_room)


@message.route("/util/my-account/message/retrieve", methods=["POST"])
@login_required
def util_retrieve_messages():
    chat_room_id = parse_arg_from_requests("chat_room_id", type=int)
    if chat_room_id is None:
        return render_json(400, "Invalid request no chat_room_id detected")

    chat_room = PrivateChatMeta.query.get(chat_room_id)
    return render_json(200, [chat.serialize for chat in chat_room.private_chats])
