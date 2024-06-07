from collections import OrderedDict

from flask import session
from flask_login import current_user
from sqlalchemy.orm import relationship
from abpoll.extensions import db
from config.settings import CLOUDFLARE_READ_ACCOUNT_ID
from lib.util_sqlalchemy import ResourceMixin


class Group(db.Model, ResourceMixin):
    """Group Model"""

    __tablename__ = "groups"

    id = db.Column(db.Integer, primary_key=True, unique=True)

    # Privacy.
    PRIVACY = OrderedDict([("public", "Public"), ("private", "Private")])
    privacy = db.Column(
        db.Enum(*PRIVACY, name="privacy_types", native_enum=False),
        index=True,
        nullable=False,
        server_default="public",
    )

    # Images.
    background = db.Column(db.String(250), nullable=True)

    # Localization.
    name = db.Column(db.String(40), nullable=False)
    location = db.Column(db.String(40), nullable=True)
    description = db.Column(db.String(250), nullable=False)

    # Owner.
    author_id = db.Column(db.String, db.ForeignKey("users.id"))
    author = relationship("User", back_populates="group")

    # Members.
    participant = db.relationship('GroupParticipant', back_populates='group', lazy=True, cascade="all, delete-orphan")

    @staticmethod
    def get_user_groups():
        groups = []
        if current_user.is_active:
            groups = db.session.query(Group).join(GroupParticipant).filter(
                GroupParticipant.user_id == current_user.id).all()
        else:
            try:
                if session["fingerprint_id"]:
                    groups = db.session.query(Group).join(GroupParticipant).filter(
                        GroupParticipant.fingerprint_id == session["fingerprint_id"]).all()
            except KeyError:
                pass
        return groups

    def number_of_participants(self):
        return len(self.participant)

    def clean_spaced_id(self):
        return ' '.join(str(self.id)[i:i + 4] for i in range(0, len(str(self.id)), 4))

    def background_index(self):
        if self.background is None:
            return None
        return f"https://imagedelivery.net/{CLOUDFLARE_READ_ACCOUNT_ID}/{self.background}/groupBackgroundIndex"

    def background_profile(self):
        if self.background is None:
            return None
        return f"https://imagedelivery.net/{CLOUDFLARE_READ_ACCOUNT_ID}/{self.background}/groupBackgroundProfile"


class GroupParticipant(db.Model, ResourceMixin):
    """Group Participants Model"""

    __tablename__ = "group_participants"

    id = db.Column(db.Integer, primary_key=True)

    # Groups.
    group_id = db.Column(db.Integer, db.ForeignKey('groups.id'), nullable=False)
    group = relationship("Group", back_populates="participant")

    # Members.
    user_id = db.Column(db.String, db.ForeignKey('users.id'), nullable=True)
    user = relationship("User", back_populates="group_participant")

    fingerprint_id = db.Column(db.String(124), nullable=True)

    __table_args__ = (
        # this can be db.PrimaryKeyConstraint if you want it to be a primary key
        db.UniqueConstraint('group_id', 'user_id'),
        db.UniqueConstraint('group_id', 'fingerprint_id'),
    )

