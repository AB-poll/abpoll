from flask_login import current_user
from sqlalchemy import or_, text, func, and_
from sqlalchemy.orm import relationship
from flask import session, request

import math
from lib.util_sqlalchemy import ResourceMixin, AwareDateTime
from abpoll.extensions import db
from abpoll.blueprints.general.models.activity import Notifications


class PrivateChatMeta(db.Model, ResourceMixin):
    """
        Chat Metadata, this is like post and chat is like comments
    """
    __tablename__ = "private_chat_meta"
    id = db.Column(db.Integer, unique=True, primary_key=True, autoincrement=True)
    room_id = db.Column(db.Integer, default=None)
    is_typing = db.Column(db.Boolean, default=False)
    is_blocked = db.Column(db.Boolean, default=False)
    is_favourite = db.Column(db.Boolean, default=False)
    is_muted = db.Column(db.Boolean, default=False)
    unread_count = db.Column(db.Integer, default=0)
    from_user = db.Column(db.String, db.ForeignKey("users.id"))
    to_user = db.Column(db.String, db.ForeignKey("users.id"))
    private_chats = relationship("PrivateChats", back_populates="meta", cascade="all, delete-orphan")

    def last_message(self):
        try:
            return self.private_chats[-1].message
        except IndexError:
            return ""

    def the_other_user(self):
        if self.from_user == current_user.id:
            return self.to_user
        return self.from_user


class PrivateChats(db.Model, ResourceMixin):
    """
        Chat texts, this is like comments and the above chat meta is like post
    """
    __tablename__ = "private_chats"
    id = db.Column(db.Integer, unique=True, primary_key=True, autoincrement=True)

    meta_id = db.Column(db.Integer, db.ForeignKey("private_chat_meta.id"))
    meta = relationship("PrivateChatMeta", back_populates="private_chats")

    sender_id = db.Column(db.String, db.ForeignKey("users.id"))
    sender = relationship("User", back_populates="messages")

    room_id = db.Column(db.Integer, default=None)
    message_type = db.Column(db.Integer, nullable=False, default=1)  # text = 1, image = 2, gif = 3
    message = db.Column(db.Text)
    status = db.Column(db.Integer, nullable=False, default=1)  # sent = 1, seen = 2, deleted = 3
    notifications = relationship("Notifications", back_populates="message_content", cascade="all, delete-orphan")

    @property
    def serialize(self):
        return {
            "id": self.id,
            "is_sender": self.sender == current_user,
            "message_content": self.message,
            "created_on": self.created_on,
        }
