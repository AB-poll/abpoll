from sqlalchemy import func

from abpoll.blueprints.user.models import db, User
from abpoll.blueprints.post.models import Post, PostViewed, PostComment


class Dashboard(object):
    @classmethod
    def group_and_count_users(cls):
        """
        Perform a group by/count on all users.

        :return: dict
        """
        return Dashboard._group_and_count(User, User.role)

    @classmethod
    def group_and_count_posts(cls):
        """
        Perform a group by/count on all payouts.

        :return: dict
        """
        return Dashboard._group_and_count(Post, Post.id)

    @classmethod
    def group_and_count_votes(cls):
        """
        Perform a group by/count on all payouts.

        :return: dict
        """
        return Dashboard._group_and_count(PostViewed, PostViewed.id)

    @classmethod
    def group_and_count_comments(cls):
        """
        Perform a group by/count on all payouts.

        :return: dict
        """
        return Dashboard._group_and_count(PostComment, PostComment.id)

    @classmethod
    def topics(cls):
        """
        Perform a group by/count on all payouts.

        :return: dict
        """
        topics = db.session.query(User).filter(User.status == 'topic').all()
        return topics

    @classmethod
    def _group_and_count(cls, model, field):
        """
        Group results for a specific model and field.

        :param model: Name of the model
        :type model: SQLAlchemy model
        :param field: Name of the field to group on
        :type field: SQLAlchemy field
        :return: dict
        """
        count = func.count(field)
        query = db.session.query(count, field).group_by(field).all()

        return {"query": query, "total": model.query.count()}

    @classmethod
    def _count_all(cls, model, field):
        """
        Group results for a specific model and field.

        :param model: Name of the model
        :type model: SQLAlchemy model
        :param field: Name of the field to group on
        :type field: SQLAlchemy field
        :return: dict
        """
        count = func.count(field)
        query = db.session.query(count, field).group_by(field).all()

        return {"query": query, "total": model.query.count()}
