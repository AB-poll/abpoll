from flask_login import current_user
from sqlalchemy import or_, text, func, and_
from sqlalchemy.orm import relationship
from flask import session, url_for

from textblob import TextBlob

from lib.util_sqlalchemy import ResourceMixin
from config.settings import CLOUDFLARE_READ_ACCOUNT_ID
from abpoll.extensions import db


class Post(db.Model, ResourceMixin):
    """Posts Model"""

    __tablename__ = "posts"
    id = db.Column(db.String, unique=True, primary_key=True)

    # Relationships.
    author_id = db.Column(
        db.String,
        db.ForeignKey("users.id", onupdate="CASCADE", ondelete="CASCADE"),
        index=True,
        nullable=False,
    )
    author = db.relationship("User", back_populates="post")

    # Post.
    title = db.Column(db.String, nullable=False)
    post_format = db.Column(db.String, nullable=True)  # Poll, Trivia
    options = db.Column(db.ARRAY(db.String(90)))
    options_vote = db.Column(db.ARRAY(db.Integer))
    selected_option = db.Column(db.Integer, nullable=True)

    image_1 = db.Column(db.String, nullable=True)
    image_2 = db.Column(db.String, nullable=True)

    accessibility = db.Column(db.String, nullable=True)

    voting_open = db.Column(db.Boolean, default=True)
    status = db.Column(db.String, nullable=True, default="voting_open")
    # voting_open, hidden, banned, immune, deleted, visible, ended

    a_text = db.Column(db.String(90), nullable=True)
    b_text = db.Column(db.String(90), nullable=True)

    # Votes.
    external_a_votes = db.Column(db.Integer, default=0)
    a_votes = relationship("PostAVote", back_populates="post", cascade="all, delete-orphan")

    external_b_votes = db.Column(db.Integer, default=0)
    b_votes = relationship("PostBVote", back_populates="post", cascade="all, delete-orphan")

    # Classification.
    categories = db.Column(db.ARRAY(db.String(90)))
    tags = db.Column(db.ARRAY(db.String(90)))
    sentiment = db.Column(db.Float, default=0, nullable=True)

    # Media.
    thumbnail = db.Column(db.String, nullable=True)
    location = db.Column(db.String, nullable=True)

    # Gamification
    coin_supply = db.Column(db.Integer, default=0)
    coins_left = db.Column(db.Integer, default=0)

    # Reports
    post_poll_reports = relationship("ReportPoll", back_populates="post", cascade="all, delete-orphan")
    events = relationship("Event", back_populates="post", cascade="all, delete-orphan")
    likes = relationship("Like", back_populates="post", cascade="all, delete-orphan")
    post_viewed = relationship("PostViewed", back_populates="post", cascade="all, delete-orphan")
    notifications = relationship("Notifications", back_populates="post", cascade="all, delete-orphan")
    post_comments = relationship("PostComment", back_populates="post", cascade="all, delete-orphan")

    def save_sentiment(self):
        """ store the sentiment of the post using sklearn and post_comments.text"""
        if self.post_format == "Trivia":
            output = f"{self.title}. Choose between: {', '.join(self.options)}"
        else:
            output = f"{self.title} {self.a_text} or {self.b_text}."

        if self.post_comments:
            comment = [comment.text for comment in self.post_comments]
            output += "Comment:" + " ".join(comment)

        blob = TextBlob(output)
        self.sentiment = blob.sentiment.polarity
        self.save()

    def serve_cloudflare_image(self):
        return f"https://imagedelivery.net/{CLOUDFLARE_READ_ACCOUNT_ID}/{self.image_1}/public"

    def serve_portrait_image(self):
        return f"https://imagedelivery.net/{CLOUDFLARE_READ_ACCOUNT_ID}/{self.image_1}/gallery"

    def did_user_vote(self, vote_id=None, user_id=None):
        if vote_id is not None:
            did_view = db.session.query(PostViewed).filter(
                and_(PostViewed.fingerprint_id == vote_id, PostViewed.post_id == self.id)).first()
            if did_view is not None and did_view.did_user_vote == 1:
                return True

        if user_id is not None:
            did_view = db.session.query(PostViewed).filter(
                and_(PostViewed.author_id == user_id, PostViewed.post_id == self.id)).first()
            if did_view is not None and did_view.did_user_vote == 1:
                return True

        if current_user.is_active:
            did_view = db.session.query(PostViewed).filter(
                and_(PostViewed.author_id == current_user.id, PostViewed.post_id == self.id)).first()
            if did_view is not None and did_view.did_user_vote == 1:
                return True

        if session.get('fingerprint_id'):
            did_view = db.session.query(PostViewed).filter(
                and_(PostViewed.fingerprint_id == session['fingerprint_id'], PostViewed.post_id == self.id)).first()
            if did_view is not None and did_view.did_user_vote == 1:
                return True

        return False

    def voted_index(self, vote_id=None, user_id=None):
        if vote_id is not None:
            did_view = db.session.query(PostViewed).filter(
                and_(PostViewed.fingerprint_id == vote_id, PostViewed.post_id == self.id)).first()
            if did_view is not None and did_view.did_user_vote == 1:
                return did_view.user_vote_id

        if user_id is not None:
            did_view = db.session.query(PostViewed).filter(
                and_(PostViewed.author_id == user_id, PostViewed.post_id == self.id)).first()
            if did_view is not None and did_view.did_user_vote == 1:
                return did_view.user_vote_id

        if current_user.is_active:
            did_view = db.session.query(PostViewed).filter(
                and_(PostViewed.author_id == current_user.id, PostViewed.post_id == self.id)).first()
            if did_view is not None and did_view.did_user_vote == 1:
                return did_view.user_vote_id

        elif session.get('fingerprint_id'):
            did_view = db.session.query(PostViewed).filter(
                and_(PostViewed.fingerprint_id == session['fingerprint_id'], PostViewed.post_id == self.id)).first()
            if did_view is not None and did_view.did_user_vote == 1:
                return did_view.user_vote_id

        return 0

    def total_votes(self):
        if self.options_vote is not None:
            return int(sum(self.options_vote))
        else:
            return self.a_votes_count() + self.b_votes_count()

    def percentage(self, num):
        try:
            return round((num * 100) / sum(self.options_vote))
        except ZeroDivisionError:
            return 0

    def did_user_report_poll(self):
        did_report = db.session.query(ReportPoll).filter(
            and_(ReportPoll.author_id == current_user.id, ReportPoll.post_id == self.id)).first()
        if did_report is not None:
            return True
        return False

    def next_post(self):
        return db.session.query(Post).order_by(Post.created_on.desc()).filter(
            and_(Post.created_on < self.created_on, Post.status == "immune")).first()

    def prev_post(self):
        return db.session.query(Post).order_by(Post.created_on.asc()).filter(
            and_(Post.created_on > self.created_on, Post.status == "immune")).first()

    def sorted_a_votes(self, fingerprints):
        return db.session.query(PostViewed).filter(
            and_(PostViewed.post_id == self.id, PostViewed.user_vote_id == 0),
            PostViewed.fingerprint_id.in_(fingerprints)).count()

    def sorted_b_votes(self, fingerprints):
        return db.session.query(PostViewed).filter(
            and_(PostViewed.post_id == self.id, PostViewed.user_vote_id == 1,
                 PostViewed.fingerprint_id.in_(fingerprints))).count()

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
            Post.title.ilike(search_query),
            Post.a_text.ilike(search_query),
            Post.b_text.ilike(search_query),
            func.array_to_string(Post.tags, ",").ilike(search_query),
        )

        return or_(*search_chain)

    @classmethod
    def sort_post_category(cls, query):
        """
        Search a resource by 1 or more fields.

        :param query: Search query
        :type query: str
        :return: SQLAlchemy filter
        """
        if query == "":
            return text("")

        category_query = "%{0}%".format(query)
        category_chain = (
            Post.title.ilike(category_query),
            func.array_to_string(Post.categories, ",").ilike(category_query),
        )

        return or_(*category_chain)

    @staticmethod
    def get_user_seen_posts():
        """ get all the posts that the user has seen """
        seen_posts = []
        if current_user.is_active:
            seen_posts = db.session.query(Post.id.label('post_id')).join(PostViewed).filter(
                PostViewed.author_id == current_user.id).subquery()
        else:
            try:
                if session["fingerprint_id"]:
                    seen_posts = db.session.query(Post.id.label('post_id')).join(PostViewed).filter(
                        PostViewed.fingerprint_id == session["fingerprint_id"]).subquery()
            except KeyError:
                pass
        return seen_posts

    @classmethod
    def recommend_random_posts(cls):
        """ get the recommended posts for the user """
        seen_posts = cls.get_user_seen_posts()
        posts = Post.query \
            .filter(and_(~Post.id.in_(seen_posts), Post.voting_open)) \
            .order_by(func.random()) \
            .limit(5).all()
        return posts

    @property
    def serialize(self):

        return {
            "id": self.id,
            "url": url_for('post.post_page', post_id=self.id),
            "external_url": url_for('post.post_page', post_id=self.id, _external=True),
            "status": self.status,
            "image_1": self.serve_cloudflare_image(),
            "image_2": self.image_2,
            "format": self.post_format,
            "title": self.title,
            "did_user_vote": self.did_user_vote(),
            "options": self.options,
            "options_vote": self.options_vote,
            "total_votes": sum(self.options_vote),
            "selected_option": self.selected_option,
            "voted_index": self.voted_index(),
            "a_text": self.a_text,
            "b_text": self.b_text,
            "author": {
                "username": self.author.display_username(),
                "profile": self.author.retrieve_profile_picture(),
            },
            "comments": len(self.post_comments),
        }


class PostViewed(db.Model, ResourceMixin):
    __tablename__ = "post_viewed"
    id = db.Column(db.Integer, unique=True, primary_key=True)
    author_id = db.Column(db.String, db.ForeignKey("users.id"), nullable=True)
    author = relationship("User", back_populates="post_viewed")
    post_id = db.Column(db.String, db.ForeignKey("posts.id"), nullable=False)
    post = relationship("Post", back_populates="post_viewed")
    did_user_vote = db.Column(db.Integer)  # 0 if the user didn't vote, 1 if they voted
    user_vote_id = db.Column(db.Integer)  # 0 for a, 1 for b, 2 for c, 3 for d

    # Spam detection
    fingerprint_id = db.Column(db.String(250), nullable=True)
    accuracy_radius = db.Column(db.String(250), nullable=True)
    latitude = db.Column(db.String(250), nullable=True)
    longitude = db.Column(db.String(250), nullable=True)
    timezone = db.Column(db.String(250), nullable=True)
    city = db.Column(db.String(250), nullable=True)
    subdivision = db.Column(db.String(250), nullable=True)
    country = db.Column(db.String(250), nullable=True)
    continent = db.Column(db.String(250), nullable=True)

    __table_args__ = (
        # this can be db.PrimaryKeyConstraint if you want it to be a primary key
        db.UniqueConstraint('post_id', 'author_id'),
    )


class Like(db.Model):
    __tablename__ = "likes"
    id = db.Column(db.Integer, unique=True, primary_key=True)
    author_id = db.Column(db.String, db.ForeignKey("users.id"))
    author = relationship("User", back_populates="likes")
    post_id = db.Column(db.String, db.ForeignKey("posts.id"))
    post = relationship("Post", back_populates="likes")


class PostComment(db.Model, ResourceMixin):
    __tablename__ = "post_comments"
    id = db.Column(db.String, primary_key=True)
    text = db.Column(db.String(280))

    comment_author_id = db.Column(db.String, db.ForeignKey("users.id"))
    comment_author = relationship("User", back_populates="post_comments")

    post_id = db.Column(db.String, db.ForeignKey("posts.id"))
    post = relationship("Post", back_populates="post_comments")

    likes = relationship("CommentLike", back_populates="comment", cascade="all, delete-orphan")

    replies = relationship("PostCommentReply", back_populates="comment", cascade="all, delete-orphan")
    notifications = relationship(
        "Notifications",
        back_populates="post_comment",
        cascade="all, delete-orphan",
    )

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
            PostComment.text.ilike(search_query),
        )

        return or_(*search_chain)

    def did_like(self) -> bool:
        """return true if the user liked the comment else false"""
        if current_user.is_active:
            liked = db.session.query(CommentLike).filter(
                and_(CommentLike.author_id == current_user.id, CommentLike.comment_id == self.id)).first()
            if liked is not None:
                return True
        return False

    def can_delete(self) -> bool:
        """return true if the current_user can delete else false"""
        if current_user.is_active:
            if current_user.role == "admin" or current_user.id == self.comment_author_id or current_user.id == self.post.author_id:
                return True
        return False

    @property
    def serialize(self):
        return {
            "id": self.id,
            "username": self.comment_author.username,
            "display_username": self.comment_author.display_username(),
            "profile_picture": self.comment_author.retrieve_profile_picture(),
            "text": self.text,
            "created_on": self.created_on,
            "did_like": self.did_like(),
            "can_delete": self.can_delete(),
            "likes": len(self.likes),
        }


class CommentLike(db.Model):
    __tablename__ = "comment_likes"
    id = db.Column(db.Integer, unique=True, primary_key=True)
    author_id = db.Column(db.String, db.ForeignKey("users.id"))
    author = relationship("User", back_populates="liked_comments")
    comment_id = db.Column(db.String, db.ForeignKey("post_comments.id"))
    comment = relationship("PostComment", back_populates="likes")


class PostCommentReply(db.Model, ResourceMixin):
    __tablename__ = "comment_replies"
    id = db.Column(db.String, primary_key=True)
    text = db.Column(db.String(280))

    reply_author_id = db.Column(db.String, db.ForeignKey("users.id"))
    reply_author = relationship("User", back_populates="post_replies")

    comment_id = db.Column(db.String, db.ForeignKey("post_comments.id"))
    comment = relationship("PostComment", back_populates="replies")

    notifications = relationship(
        "Notifications",
        back_populates="post_reply",
        cascade="all, delete-orphan",
    )


class ReportPoll(db.Model, ResourceMixin):
    __tablename__ = "post_poll_reports"
    id = db.Column(db.Integer, unique=True, primary_key=True)
    author_id = db.Column(db.String, db.ForeignKey("users.id"))
    author = relationship("User", back_populates="post_poll_reports")
    post_id = db.Column(db.String, db.ForeignKey("posts.id"))
    post = relationship("Post", back_populates="post_poll_reports")
    reason = db.Column(db.Integer)


class PostAVote(db.Model, ResourceMixin):
    __tablename__ = "post_a_votes"
    id = db.Column(db.Integer, unique=True, primary_key=True)
    author_id = db.Column(db.String, db.ForeignKey("users.id"))
    author = relationship("User", back_populates="post_a_votes")
    post_id = db.Column(db.String, db.ForeignKey("posts.id"))
    post = relationship("Post", back_populates="a_votes")


class PostBVote(db.Model, ResourceMixin):
    __tablename__ = "post_b_votes"
    id = db.Column(db.Integer, unique=True, primary_key=True)
    author_id = db.Column(db.String, db.ForeignKey("users.id"))
    author = relationship("User", back_populates="post_b_votes")
    post_id = db.Column(db.String, db.ForeignKey("posts.id"))
    post = relationship("Post", back_populates="b_votes")
