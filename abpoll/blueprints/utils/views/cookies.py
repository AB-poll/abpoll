from flask import request, session, redirect, Blueprint
from lib.util_json import render_json


def pop_session_cookies():
    session.pop("dark_mode", default=None)
    session.pop("cookie-accepted", default=None)
    return None


cookie_creation = Blueprint(
    "cookie_creation",
    __name__,
)


@cookie_creation.route("/util/cookies", methods=["POST"])
def dark_mode():
    return redirect(request.referrer)


@cookie_creation.route("/cookie-accepted", methods=["POST"])
def cookie_accepted():
    session["cookie-accepted"] = True
    return render_json(200)
