import json
import re
from random import randint

from flask import request, Blueprint, redirect, url_for, session, flash
from flask_login import login_required, current_user, login_user

from abpoll.extensions import db
from abpoll.blueprints.user.models import User

from lib.util_datetime import tzware_datetime
from lib.safe_next_url import safe_next_url

from oauthlib.oauth2 import WebApplicationClient
import requests

from config.settings import (
    GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET,
    GOOGLE_DISCOVERY_URL,
)
from lib.util_json import parse_arg_from_requests, render_json

google_login = Blueprint(
    "google_login",
    __name__,
)

client = WebApplicationClient(GOOGLE_CLIENT_ID)


def get_google_provider_cfg():
    return requests.get(GOOGLE_DISCOVERY_URL).json()


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


@google_login.route("/login/google")
def login_google():
    next_argument = request.args.get("next")
    if next_argument is not None:
        session["next_url"] = safe_next_url(next_argument)

    google_provider_cfg = get_google_provider_cfg()
    authorization_endpoint = google_provider_cfg["authorization_endpoint"]

    request_uri = client.prepare_request_uri(
        authorization_endpoint,
        redirect_uri=request.base_url + "/callback",
        scope=["openid", "email", "profile"],
    )
    return redirect(request_uri)


@google_login.route("/login/google/callback")
def callback():
    code = request.args.get("code")

    google_provider_cfg = get_google_provider_cfg()
    token_endpoint = google_provider_cfg["token_endpoint"]

    token_url, headers, body = client.prepare_token_request(
        token_endpoint,
        authorization_response=request.url,
        redirect_url=request.base_url,
        code=code,
    )

    token_response = requests.post(
        token_url,
        headers=headers,
        data=body,
        auth=(GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET),
    )

    client.parse_request_body_response(json.dumps(token_response.json()))

    userinfo_endpoint = google_provider_cfg["userinfo_endpoint"]
    uri, headers, body = client.add_token(userinfo_endpoint)
    userinfo_response = requests.get(uri, headers=headers, data=body)

    if userinfo_response.json().get("email_verified"):
        unique_id = userinfo_response.json()["sub"]
        users_email = userinfo_response.json()["email"]
        picture = userinfo_response.json()["picture"]
        users_name = userinfo_response.json()["given_name"]
    else:
        return "User email not available or not verified by Google.", 400

    email_taken = db.session.query(User).filter(User.email == users_email).first()
    if email_taken is not None:
        if login_user(email_taken, remember=True) and email_taken.is_active():
            email_taken.update_activity_tracking(request.remote_addr)
        else:
            flash("This account has been disabled.", "danger")
            return redirect(url_for("user.login"), 400)

    elif User.query.get(unique_id) is None:
        user = User(
            id=unique_id,
            username=safe_name(users_name),
            email=users_email,
            profile_picture=picture,
            password="GOOGLE_LOGIN",
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


@google_login.route("/login/google/pop_up", methods=["POST"])
def pop_up():
    unique_id = parse_arg_from_requests("unique_id")
    users_email = parse_arg_from_requests("users_email")
    picture = parse_arg_from_requests("picture")
    users_name = parse_arg_from_requests("users_name")

    if unique_id is None or users_name is None or picture is None or users_email is None:
        flash("Something went wrongs, try again!", "warning")
        return redirect(url_for("user.login"), 400)

    email_taken = db.session.query(User).filter(User.email == users_email).first()
    if email_taken is not None:
        if login_user(email_taken, remember=True) and email_taken.is_active():
            email_taken.update_activity_tracking(request.remote_addr)
        else:
            flash("This account has been disabled.", "danger")
            return redirect(url_for("user.login"), 400)

    elif User.query.get(unique_id) is None:
        user = User(
            id=unique_id,
            username=safe_name(users_name),
            email=users_email,
            profile_picture=picture,
            password="GOOGLE_LOGIN",
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

    return render_json(200)
