from flask import request, session, redirect, Blueprint
from flask_login import current_user
from lib.util_json import render_json, parse_arg_from_requests
from lib.util_sqlalchemy import avatar_creation, random_user_id


fingerprint = Blueprint("fingerprint", __name__,)


@fingerprint.route("/util/register-user", methods=["POST"])
def register():
    request_data = request.get_json()

    try:
        session["fingerprint_id"] = request_data['visitorId']
    except KeyError:
        session["fingerprint_id"] = random_user_id()
    try:
        session["accuracy_radius"] = request_data['ipLocation']['accuracyRadius']
        session["latitude"] = request_data['ipLocation']['latitude']
        session["longitude"] = request_data['ipLocation']['longitude']
        session["timezone"] = request_data['ipLocation']['timezone']
    except KeyError:
        session["accuracy_radius"] = "50"
        session["latitude"] = "37.751"
        session["longitude"] = "-97.822"
        session["timezone"] = "America/North_Dakota/Center"
    try:
        session["city"] = request_data['ipLocation']['city']['name']
        session["subdivision"] = request_data['ipLocation']['subdivisions'][0]['name']
        session["country"] = request_data['ipLocation']['country']['code']
        session["continent"] = request_data['ipLocation']['continent']['code']
    except KeyError:
        session["city"] = "Kansas"
        session["subdivision"] = "US"
        session["country"] = "US"
        session["continent"] = "NA"

    session.modified = True

    if current_user.is_active and request_data is not None:
        current_user.fingerprint_id = session["fingerprint_id"]
        current_user.accuracy_radius = session["accuracy_radius"]
        current_user.latitude = session["latitude"]
        current_user.longitude = session["longitude"]
        current_user.timezone = session["timezone"]
        current_user.city = session["city"]
        current_user.subdivision = session["subdivision"]
        current_user.country = session["country"]
        current_user.continent = session["continent"]
        current_user.save()

    return render_json(200)
