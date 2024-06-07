import json
import os
import re
from random import randint

from flask import request, Blueprint, redirect, url_for, session, flash
from flask_login import login_required, current_user, login_user

from abpoll.extensions import db
from abpoll.blueprints.user.models import User

from lib.util_datetime import tzware_datetime
from lib.util_json import render_json
from lib.safe_next_url import safe_next_url

from requests_oauthlib import OAuth2Session
from requests_oauthlib.compliance_fixes import facebook_compliance_fix

import requests

from config.settings import (
    FACEBOOK_APP_ID,
    FACEBOOK_APP_SECRET,
    FACEBOOK_API_VERSION
)

facebook_login = Blueprint(
    "facebook_login",
    __name__,
)

authorization_base_url = 'https://www.facebook.com/dialog/oauth'
token_url = 'https://graph.facebook.com/oauth/access_token'
redirect_uri = "https://abpoll.com/login/facebook/callback"

facebook = OAuth2Session(FACEBOOK_APP_ID, redirect_uri=redirect_uri, scope=["email", "public_profile"])
facebook = facebook_compliance_fix(facebook)


def safe_name(name):
    username = re.sub("[^\w]", "", name.lower())
    numbers = str(randint(0, 999))
    number_of_requests = 0
    while (
            db.session.query(User)
                    .filter(User.username == (username + numbers))
                    .first()
            is not None
            and number_of_requests < 10
    ):
        number_of_requests += 1
        numbers = str(randint(0, 999))

    return username + numbers


@facebook_login.route("/login/facebook")
def login_facebook():
    next_argument = request.args.get("next")
    if next_argument is not None:
        session["next_url"] = safe_next_url(next_argument)

    authorization_url, state = facebook.authorization_url(authorization_base_url)
    return redirect(authorization_url)


@facebook_login.route("/login/facebook/callback")
def callback():
    if request.args.get("error") == "access_denied":
        return redirect(url_for('user.register'))

    facebook.fetch_token(token_url,
                         client_secret=FACEBOOK_APP_SECRET,
                         authorization_response=request.url)

    r = facebook.get('https://graph.facebook.com/me?locale=en_US&fields=name,email,id')
    r_content = json.loads(r.content.decode('utf-8'))

    if r_content['email']:
        unique_id = r_content['id']
        # Deprecated facebook profile picture due to wong dimensions
        # picture = f"https://graph.facebook.com/{r_content['id']}/picture?width=800"
        users_email = r_content['email']
        users_name = r_content['name'].split(" ")[0]
    else:
        return "User email not available or not verified by Facebook.", 400

    email_taken = db.session.query(User).filter(User.email == users_email).first()

    if email_taken is not None:
        if login_user(email_taken, remember=True) and email_taken.is_active():
            email_taken.update_activity_tracking(request.remote_addr)
        else:
            flash("This account has been disabled.", "danger")
            return redirect(url_for("user.login"), 400)

    elif User.query.get(unique_id) is None:
        from lib.util_sqlalchemy import avatar_creation
        user = User(
            id=unique_id,
            username=safe_name(users_name),
            email=users_email,
            profile_picture=avatar_creation(users_email),
            password="FACEBOOK_LOGIN",
            email_verified=True,
            confirmed_on=tzware_datetime(),
        )

        user.save()
        if login_user(user, remember=True) and user.is_active():
            user.update_activity_tracking(request.remote_addr)
        else:
            flash("This account has been disabled.", "danger")
            return redirect(url_for("user.login"), 400)
    else:
        user = User.query.get(unique_id)
        if login_user(user, remember=True) and user.is_active():
            user.update_activity_tracking(request.remote_addr)
        else:
            flash("This account has been disabled.", "danger")
            return redirect(url_for("user.login"), 400)

    if session.get("next_url") is not None:
        next_url = session["next_url"]
        session.pop("next_url", default=None)
        return redirect(safe_next_url(next_url))

    return redirect(url_for("general.home"))
