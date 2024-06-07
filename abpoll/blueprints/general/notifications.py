from flask import Blueprint, flash, url_for
from flask_login import current_user
from lib.util_json import render_json, parse_arg_from_requests
from abpoll.extensions import db

from abpoll.blueprints.general.models.activity import Notifications


notifications = Blueprint("notifications", __name__)


@notifications.route("/notifications", methods=["POST"])
def notifications_endpoint():
    if not current_user.is_active:
        flash(f"Please login to access notifications.", "danger")
        return render_json(403, url_for('user.login'))

    notis = db.session.query(Notifications).filter(Notifications.user_id == current_user.id).order_by(Notifications.created_on.desc()).limit(20)

    return render_json(200, [n.serialize for n in notis])


@notifications.route("/read_notifications", methods=["POST"])
def read_notifications():
    if not current_user.is_active:
        flash(f"Please login to access notifications.", "danger")
        return render_json(403, url_for('user.login'))

    for alert in current_user.notifications[::-1]:
        if not alert.seen:
            alert.is_read()
        else:
            pass

    return render_json(200)


@notifications.route("/add_notifications_token", methods=["POST"])
def add_notifications_token():
    if not current_user.is_active:
        flash(f"Please login to access notifications.", "danger")
        return render_json(403, url_for('user.login'))
    
    data_token = parse_arg_from_requests('data_token')
    print(data_token)
    if data_token is not None:
        current_user.token = data_token
        current_user.save()
        return render_json(200)
    else:
        return render_json(500)


@notifications.route("/retrieve-channel-name", methods=["POST"])
def test_fcm_token():
    if not current_user.is_active:
        return render_json(500)
    return render_json(200, current_user.id)
