import base64
import datetime
import string
import uuid
import random

import numpy as np
from sqlalchemy import DateTime
from sqlalchemy.types import TypeDecorator

from lib.util_datetime import tzware_datetime
from lib.upload_files import random_profile_background
from abpoll.extensions import db

from hashlib import md5


def generate_random_id(model, length=11):
    """
    Generate a random id for the model
    """
    while True:
        if model.id.type.python_type == int:
            output = np.random.randint(10**(length-1), 10**length)
        else:
            output = ''.join(
                random.choice(string.ascii_uppercase + string.digits + string.ascii_lowercase) for _ in range(length))
        if not model.query.get(output):
            break
    return output


def avatar_creation(email, size=250):
    # digest = md5(email.lower().encode('utf-8')).hexdigest()
    # return 'https://www.gravatar.com/avatar/{}?d=mp&s={}'.format(digest, size)
    return random_profile_background(1)[0]


def email_taken(email: str):
    from abpoll.blueprints.user.models import User
    """"
    This function is designed to return true if the email is  taken and false if it's not taken
    """
    if db.session.query(User).filter(User.email == email).first() is None:
        return False
    return True


def username_taken(username: str):
    from abpoll.blueprints.user.models import User
    """"
    This function is designed to return true if the username is taken and false if it's not taken
    """
    if db.session.query(User).filter(User.username == username).first() is None:
        return False
    return True


def random_user_id():
    from abpoll.blueprints.user.models import User
    while 1 > 0:
        uuid_obj = uuid.uuid4()
        string_obj = str(uuid_obj.hex)
        is_id_available = (
            db.session.query(User).filter(User.id == string_obj).first()
        )
        if is_id_available is None:
            return string_obj


class AwareDateTime(TypeDecorator):
    """
    A DateTime type which can only store tz-aware DateTimes.

    Source:
      https://gist.github.com/inklesspen/90b554c864b99340747e
    """

    impl = DateTime(timezone=True)
    cache_ok = True

    def process_bind_param(self, value, dialect):
        if isinstance(value, datetime.datetime) and value.tzinfo is None:
            raise ValueError("{!r} must be TZ-aware".format(value))
        return value

    def __repr__(self):
        return "AwareDateTime()"


class ResourceMixin(object):
    # Keep track when records are created and updated.
    created_on = db.Column(AwareDateTime(), default=tzware_datetime)
    updated_on = db.Column(
        AwareDateTime(), default=tzware_datetime, onupdate=tzware_datetime
    )

    @classmethod
    def sort_by(cls, field, direction):
        """
        Validate the sort field and direction.

        :param field: Field name
        :type field: str
        :param direction: Direction
        :type direction: str
        :return: tuple
        """
        if field not in cls.__table__.columns:
            field = "created_on"

        if direction not in ("asc", "desc"):
            direction = "asc"

        return field, direction

    @classmethod
    def get_bulk_action_ids(cls, scope, ids, omit_ids=[], query=""):
        """
        Determine which IDs are to be modified.

        :param scope: Affect all or only a subset of items
        :type scope: str
        :param ids: List of ids to be modified
        :type ids: list
        :param omit_ids: Remove 1 or more IDs from the list
        :type omit_ids: list
        :param query: Search query (if applicable)
        :type query: str
        :return: list
        """
        # Hello. This is Nick from the future (July 2020 to be exact). This
        # needed to be patched to include a call to list(), otherwise it was
        # deleting every user instead of skipping the current_user.
        omit_ids = list(map(str, omit_ids))

        if scope == "all_search_results":
            # Change the scope to go from selected ids to all search results.
            ids = cls.query.with_entities(cls.id).filter(cls.search(query))

            # SQLAlchemy returns back a list of tuples, we want a list of strs.
            ids = [str(item[0]) for item in ids]

        # Remove 1 or more items from the list, this could be useful in spots
        # where you may want to protect the current user from deleting themself
        # when bulk deleting user accounts.
        if omit_ids:
            ids = [id for id in ids if id not in omit_ids]

        return ids

    @classmethod
    def bulk_delete(cls, ids):
        """
        Delete 1 or more model instances.

        :param ids: List of ids to be deleted
        :type ids: list
        :return: Number of deleted instances
        """
        delete_count = cls.query.filter(cls.id.in_(ids)).delete(
            synchronize_session=False
        )
        db.session.commit()

        return delete_count

    def save(self):
        """
        Save a model instance.

        :return: Model instance
        """
        db.session.add(self)
        db.session.commit()

        return self

    def delete(self):
        """
        Delete a model instance.

        :return: db.session.commit()'s result
        """
        db.session.delete(self)
        return db.session.commit()

    def __str__(self):
        """
        Create a human readable version of a class instance.

        :return: self
        """
        obj_id = hex(id(self))
        columns = self.__table__.c.keys()

        values = ", ".join("%s=%r" % (n, getattr(self, n)) for n in columns)
        return "<%s %s(%s)>" % (obj_id, self.__class__.__name__, values)
