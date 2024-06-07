from sqlalchemy.orm import relationship
from abpoll.extensions import db
from lib.util_sqlalchemy import ResourceMixin


class Notifications(db.Model, ResourceMixin):
    """Posts Model"""

    __tablename__ = "notifications"
    id = db.Column(db.Integer, unique=True, primary_key=True)

    category = db.Column(db.String(128), nullable=False)
    # likes, followers, post_comments, replies_to_post_comment, post_status, message
    seen = db.Column(db.Boolean, default=False)  # Seen Unseen

    objective_link = db.Column(db.String(528))
    title = db.Column(db.String(128), nullable=False)
    body = db.Column(db.String(128), nullable=False)

    # relationships
    post_id = db.Column(db.String, db.ForeignKey("posts.id"))
    post = relationship("Post", back_populates="notifications")

    user_id = db.Column(db.String, db.ForeignKey("users.id"))
    user = relationship("User", back_populates="notifications")

    post_comment_id = db.Column(
        db.String, db.ForeignKey("post_comments.id")
    )
    post_comment = relationship(
        "PostComment", back_populates="notifications"
    )

    message_content_id = db.Column(
        db.Integer, db.ForeignKey("private_chats.id")
    )
    message_content = relationship(
        "PrivateChats", back_populates="notifications"
    )

    post_reply_id = db.Column(db.String, db.ForeignKey("comment_replies.id"))
    post_reply = relationship(
        "PostCommentReply", back_populates="notifications"
    )

    def is_read(self):
        self.seen = True
        self.save()

    def send_notification(self):
        from abpoll.blueprints.general.tasks import send_new_notification
        send_new_notification(self.title, self.body, self.objective_link, self.user.token, self.user.id)
        return None

    @property
    def serialize(self):
        image_1 = None
        if self.post is not None:
            image_1 = self.post.image_1

        return {
            "title": self.title,
            "body": self.body,
            "notification_type": self.category,
            "image": image_1,
            "action_target": self.objective_link,
            "read": bool(self.seen),
            "timestamp": self.created_on,
        }
