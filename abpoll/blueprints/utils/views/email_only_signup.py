from lib.util_usernames import generate_usernames, generate_random_password
from flask import request, session, redirect, Blueprint, flash, url_for
from flask_login import login_user, current_user, logout_user
from lib.util_json import render_json, parse_arg_from_requests

from lib.util_json import render_json
from abpoll.extensions import db
from abpoll.blueprints.user.models import User

email_only_signup = Blueprint(
    "email_only_signup",
    __name__,
)


@email_only_signup.route("/util/email_only_signup", methods=["POST"])
def signup_post():
    from lib.util_sqlalchemy import avatar_creation, email_taken, random_user_id
    username, display_name = generate_usernames(1)

    email = request.form.get("email")
    password = request.form.get("password")

    if email is not None and email_taken(email) is False:
        u = User()
        u.id = random_user_id()
        u.username = username
        u.display_name = display_name
        u.email = email
        u.profile_picture = avatar_creation(email)
        u.password = User.encrypt_password(password)
        u.save()
        if login_user(u, remember=True) and u.is_active():
            u.update_activity_tracking(request.remote_addr)

            from abpoll.blueprints.user.tasks import email_confirmation
            email_confirmation(email, username)

            return redirect(request.referrer)

    flash(
        "The email is already in use, please login instead.",
        "danger",
    )
    return redirect(url_for("user.login"))
