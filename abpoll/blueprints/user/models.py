import datetime
from collections import OrderedDict
from hashlib import md5

import pytz
from flask import current_app, session
from flask_login import UserMixin
from itsdangerous import URLSafeTimedSerializer
from sqlalchemy import or_, text
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import relationship
from werkzeug.security import check_password_hash, generate_password_hash

from abpoll.blueprints.billing.models.credit_card import CreditCard
from abpoll.blueprints.billing.models.invoice import Invoice
from abpoll.blueprints.billing.models.subscription import Subscription
from abpoll.blueprints.general.models.activity import Notifications
from abpoll.blueprints.groups.models import GroupParticipant
from abpoll.blueprints.message.events import check_channel_info
from abpoll.blueprints.message.models import PrivateChatMeta
from abpoll.blueprints.post.models import Post, PostViewed
from abpoll.extensions import db
from config.settings import CLOUDFLARE_READ_ACCOUNT_ID
from lib.util_datetime import tzware_datetime
from lib.util_sqlalchemy import AwareDateTime, ResourceMixin


class Follower(ResourceMixin, db.Model, UserMixin):
    __tablename__ = "follower"
    follower_id = db.Column(
        db.String, db.ForeignKey("users.id"), primary_key=True
    )
    followed_id = db.Column(
        db.String, db.ForeignKey("users.id"), primary_key=True
    )


class User(UserMixin, db.Model, ResourceMixin):
    """User Model"""

    __tablename__ = "users"
    ROLE = OrderedDict([("member", "Member"), ("admin", "Admin")])

    # Authentication.
    id = db.Column(db.String, primary_key=True)
    role = db.Column(
        db.Enum(*ROLE, name="role_types", native_enum=False),
        index=True,
        nullable=False,
        server_default="member",
    )
    active = db.Column(
        "is_active", db.Boolean(), nullable=False, server_default="1"
    )
    username = db.Column(db.String(40), nullable=False, unique=True)
    display_name = db.Column(db.String(40), nullable=True)
    email = db.Column(db.String(80), unique=True, nullable=False)
    password = db.Column(db.String(250), nullable=False)

    # Billing.
    name = db.Column(db.String(128), index=True)
    payment_id = db.Column(db.String(128), index=True)
    cancelled_subscription_on = db.Column(AwareDateTime())
    previous_plan = db.Column(db.String(128))

    # Profile Data.
    first_name = db.Column(db.String(250), nullable=True)
    last_name = db.Column(db.String(250), nullable=True)

    profile_picture = db.Column(db.String(250))
    back_ground = db.Column(db.String(250), default="/images/account/bg.png")

    description = db.Column(db.String(250))
    location = db.Column(db.String(70))
    social_1_option = db.Column(db.String(250))
    social_1_link = db.Column(db.String(250))
    social_1_handle = db.Column(db.String(250))
    social_2_option = db.Column(db.String(250))
    social_2_link = db.Column(db.String(250))
    social_2_handle = db.Column(db.String(250))

    date_of_birth = db.Column(AwareDateTime())
    gender = db.Column(db.String(250))
    pronouns = db.Column(db.String(250))
    phone_number = db.Column(db.Integer)
    status = db.Column(db.String, nullable=True, default="visible")
    # online, offline, busy, visible, hidden, banned, immune, deleted, topic

    # Email Preference.
    email_verified = db.Column(db.Boolean, nullable=False, default=False)
    confirmed_on = db.Column(AwareDateTime())

    # Activity tracking.
    sign_in_count = db.Column(db.Integer, nullable=False, default=0)
    current_sign_in_on = db.Column(AwareDateTime())
    current_sign_in_ip = db.Column(db.String(45))
    last_sign_in_on = db.Column(AwareDateTime())
    last_sign_in_ip = db.Column(db.String(45))

    # Spam Detection
    fingerprint_id = db.Column(db.String(250), nullable=True)
    accuracy_radius = db.Column(db.String(250), nullable=True)
    latitude = db.Column(db.String(250), nullable=True)
    longitude = db.Column(db.String(250), nullable=True)
    timezone = db.Column(db.String(250), nullable=True)
    city = db.Column(db.String(250), nullable=True)
    subdivision = db.Column(db.String(250), nullable=True)
    country = db.Column(db.String(250), nullable=True)
    continent = db.Column(db.String(250), nullable=True)

    # Community Votes
    rating = db.Column(db.Integer, default=0)
    rating_vote_count = db.Column(db.Integer, default=0)

    # Notifications
    token = db.Column(db.Text, nullable=True)
    device = db.Column(db.String(300), default=None)

    # Gamification
    coins = db.Column(db.Integer, default=0)

    # Post Relationships.
    post = relationship(
        "Post", back_populates="author", cascade="all, delete-orphan"
    )

    # Group Relationships
    group = relationship("Group", back_populates="author", passive_deletes="all")
    group_participant = relationship("GroupParticipant", back_populates="user", cascade="all, delete-orphan")

    # Relationships.
    likes = relationship(
        "Like", back_populates="author", cascade="all, delete-orphan"
    )

    post_viewed = relationship(
        "PostViewed", back_populates="author", cascade="all, delete-orphan"
    )

    liked_comments = relationship(
        "CommentLike", back_populates="author", cascade="all, delete-orphan"
    )
    post_poll_reports = relationship(
        "ReportPoll", back_populates="author", cascade="all, delete-orphan"
    )
    post_a_votes = relationship(
        "PostAVote", back_populates="author", cascade="all, delete-orphan"
    )
    post_b_votes = relationship(
        "PostBVote", back_populates="author", cascade="all, delete-orphan"
    )
    notifications = relationship(
        "Notifications", back_populates="user", cascade="all, delete-orphan"
    )
    post_replies = relationship(
        "PostCommentReply",
        back_populates="reply_author",
        cascade="all, delete-orphan",
    )
    post_comments = relationship(
        "PostComment",
        back_populates="comment_author",
        cascade="all, delete-orphan",
    )
    predictions = relationship(
        "Predict",
        back_populates="author",
        cascade="all, delete-orphan",
    )
    messages = relationship(
        "PrivateChats",
        back_populates="sender",
        cascade="all, delete-orphan",
    )

    # Following.
    followers = db.relationship(
        "Follower",
        foreign_keys=[Follower.followed_id],
        backref=db.backref("followed", lazy="joined"),
        lazy="dynamic",
        cascade="all, delete-orphan",
    )
    following = db.relationship(
        "Follower",
        foreign_keys=[Follower.follower_id],
        backref=db.backref("follower", lazy="joined"),
        lazy="dynamic",
        cascade="all, delete-orphan",
    )

    # Payments.
    credit_card = db.relationship(CreditCard, uselist=False,
                                  backref='credit_card',
                                  passive_deletes=True)
    subscription = db.relationship(Subscription, uselist=False,
                                   backref='subscription',
                                   passive_deletes=True)
    invoices = db.relationship(Invoice, backref='invoices',
                               passive_deletes=True)

    def retrieve_profile_picture(self, user_id=None):
        if user_id is None:
            if "https://" in self.profile_picture:
                return self.profile_picture
            return f"https://imagedelivery.net/{CLOUDFLARE_READ_ACCOUNT_ID}/{self.profile_picture}/profile"

        user = User.query.get(user_id)
        if "https://" in user.profile_picture:
            return user.profile_picture
        return f"https://imagedelivery.net/{CLOUDFLARE_READ_ACCOUNT_ID}/{user.profile_picture}/profile"

    def display_username(self, user_id=None):
        if user_id is None:
            if self.display_name is not None:
                return self.display_name
            return self.username
        user = User.query.get(user_id)
        if user.display_name is not None:
            return user.display_name
        return user.username

    def __init__(self, **kwargs):
        # Call Flask-SQLAlchemy's constructor.
        super(User, self).__init__(**kwargs)
        if kwargs.get("password", "") != "GOOGLE_LOGIN" and kwargs.get("password", "") != "FACEBOOK_LOGIN":
            self.password = User.encrypt_password(kwargs.get("password", ""))

    def is_user_online(self):
        return check_channel_info(self.id)

    @classmethod
    def search(cls, query):
        """
        Search a resource by 1 or more fields.

        :param query: Search query
        :type query: str
        :return: SQLAlchemy filter
        """

        if query == "":
            return text("")

        search_query = "%{0}%".format(query)
        search_chain = (
            User.description.ilike(search_query),
            User.username.ilike(search_query),
            User.email.ilike(search_query),
            User.first_name.ilike(search_query),
            User.last_name.ilike(search_query),
        )

        return or_(*search_chain)

    @classmethod
    def encrypt_password(cls, plaintext_password):
        """
        Hash a plaintext string using PBKDF2. This is good enough according
        to the NIST (National Institute of Standards and Technology).

        In other words while bcrypt might be superior in practice, if you use
        PBKDF2 properly (which we are), then your passwords are safe.

        :param plaintext_password: Password in plain text
        :type plaintext_password: str
        :return: str
        """
        if plaintext_password:
            return generate_password_hash(plaintext_password, salt_length=8)

        return None

    @classmethod
    def find_by_identity(cls, identity):
        """
        Find a user by their e-mail or username.

        :param identity: Email or username
        :type identity: str
        :return: User instance
        """
        return User.query.filter(
            (User.email == identity) | (User.username == identity)
        ).first()

    def is_active(self):
        """
        Return whether or not the user account is active, this satisfies
        Flask-Login by overwriting the default value.

        :return: bool
        """
        return self.active

    def authenticated(self, with_password=True, password=""):
        """
        Ensure a user is authenticated, and optionally check their password.

        :param with_password: Optionally check their password
        :type with_password: bool
        :param password: Optionally verify this as their password
        :type password: str
        :return: bool
        """
        if with_password:
            return check_password_hash(self.password, password)

        return True

    def update_activity_tracking(self, ip_address):
        """
        Update various fields on the user that's related to meta data on their
        account, such as the sign in count and ip address, etc..

        :param ip_address: IP address
        :type ip_address: str
        :return: SQLAlchemy commit results
        """
        self.sign_in_count += 1

        self.last_sign_in_on = self.current_sign_in_on
        self.last_sign_in_ip = self.current_sign_in_ip

        self.current_sign_in_on = datetime.datetime.now(pytz.utc)
        self.current_sign_in_ip = ip_address
        try:
            if session['fingerprint_id']:
                self.fingerprint_id = session['fingerprint_id']
                self.accuracy_radius = session['accuracy_radius']
                self.latitude = session['latitude']
                self.longitude = session['longitude']
                self.timezone = session['timezone']
                try:
                    self.city = session['city']
                except:
                    pass

                self.subdivision = session['subdivision']
                self.country = session['country']
                self.continent = session['continent']
        except KeyError:
            pass

        if self.coins == 0:
            self.coins += 50

        try:
            viewed_posts = db.session.query(PostViewed).filter(PostViewed.fingerprint_id == session['fingerprint_id']).all()
            for viewed_post in viewed_posts:
                try:
                    if viewed_post.author_id is None:
                        viewed_post.author_id = self.id
                        viewed_post.save()
                        self.coins += 5
                except IntegrityError:
                    # The user has already voted on their account so don't save
                    db.session.rollback()
                    pass
            
            joined_groups = db.session.query(GroupParticipant).filter(GroupParticipant.fingerprint_id == session['fingerprint_id']).all()
            for group_paricipant in joined_groups:
                try:
                    if group_paricipant.user_id is None:
                        group_paricipant.user_id = self.id
                        group_paricipant.save()
                except IntegrityError:
                    # The user has already joined this group
                    db.session.rollback()
                    pass

        except KeyError:
            pass

        return self.save()

    def follow(self, user):
        if not self.if_follower_of(user):
            f = Follower()
            f.followed = user
            f.follower = self
            db.session.add(f)
            db.session.commit()

    def unfollow(self, user):
        if self.if_follower_of(user):
            f = self.following.filter_by(followed_id=user.id).first()
            db.session.delete(f)
            db.session.commit()

    def if_follower_of(self, user):
        return self.following.filter_by(followed_id=user.id).first() is not None

    def if_followed_by(self, user):
        return self.followers.filter_by(follower_id=user.id).first() is not None

    def chat_rooms(self):
        return db.session.query(PrivateChatMeta).filter(
            or_(PrivateChatMeta.from_user == self.id, PrivateChatMeta.to_user == self.id)).order_by(
            PrivateChatMeta.updated_on.desc()).all()

    @property
    def active_polls(self):
        active_listings = (
            db.session.query(Post)
                .filter(Post.voting_open, Post.author == self)
                .all()
        )
        return len(active_listings)

    def get_auth_token(self):
        """
        Return the user's auth token. Use their password as part of the token
        because if the user changes their password we will want to invalidate
        all of their logins across devices. It is completely fine to use
        md5 here as nothing leaks.

        This satisfies Flask-Login by providing a means to create a token.

        :return: str
        """
        private_key = current_app.config["SECRET_KEY"]

        serializer = URLSafeTimedSerializer(private_key)
        data = [str(self.id), md5(self.password.encode("utf-8")).hexdigest()]

        return serializer.dumps(data)
