# This file should contain records you want created when you run flask db seed.
#
# Example:
# from yourapp.models import User


# initial_user = {
#     'username': 'superadmin'
# }
# if User.find_by_username(initial_user['username']) is None:
#     User(**initial_user).save()

from abpoll.blueprints.user.models import User
from lib.util_sqlalchemy import avatar_creation

initial_user = {
    "id": "738982ueh398h49fh3ubc",
    "role": "admin",
    "username": "dorcy",
    "email": "hello@dorcis.com",
    "password": "ABCD1234()",
    "name": "Dorcy Shema",
    "profile_picture": avatar_creation("hello@dorcis.com"),
}

if User.find_by_identity(initial_user["username"]) is None:
    User(**initial_user).save()