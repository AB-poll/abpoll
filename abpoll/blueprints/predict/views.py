from flask import (
    render_template,
    url_for,
    request,
    abort,
    Blueprint,
    session,
    redirect,
)
from sqlalchemy import or_, text, func, and_
from flask_login import current_user
from lib.util_json import render_json, parse_arg_from_requests
from abpoll.extensions import db
from abpoll.blueprints.predict.models import Event, Predict
from abpoll.blueprints.user.models import User

predict = Blueprint("predict", __name__, template_folder="templates")


@predict.route("/events")
def events_page():
    try:
        order_by_actions = int(request.args.get("sort", type=int))
        if order_by_actions == 1 or order_by_actions == 2:
            all_events = Event.query.filter(Event.status == order_by_actions).order_by(Event.end_date).all()
            return render_template("predict/events.html", events=all_events)
    except ValueError and TypeError:
        pass

    all_events = Event.query.filter(Event.status == 0).order_by(Event.end_date).all()
    return render_template("predict/events.html", events=all_events)


@predict.route("/v1/predict/new-prediction", methods=["POST"])
def new_predictions():
    if not current_user.is_active:
        return render_json(403, {
            "unauthorized": "The request you made could not be completed."
        })

    try:
        event_id = int(parse_arg_from_requests("event_id"))
        amount = int(parse_arg_from_requests("amount"))
        index = int(parse_arg_from_requests("index"))
    except TypeError or ValueError:
        return render_json(400, "Check if the event_id, amount_id, and index are submitted")

    if amount > current_user.coins:
        return render_json(400, "The total amount exceeds your balance")

    event_object = Event.query.get(event_id)
    if event_object is None or event_object.status != 0:
        return render_json(400, "Couldn't find the event or event ended")

    stored_prediction = db.session.query(Predict).filter(
        and_(Predict.author_id == current_user.id, Predict.event_id == event_id)).first()
    if stored_prediction is None:
        new_prediction_object = Predict(
            amount=amount,
            index=index,
            event_id=event_id,
            author_id=current_user.id
        )
        new_prediction_object.save()
    else:
        stored_prediction.amount += amount
        stored_prediction.save()

    if index == 0:
        event_object.a_amount += amount

    elif index == 1:
        event_object.b_amount += amount

    event_object.save()
    current_user.coins -= amount
    current_user.save()

    return render_json(200, {
        "points": current_user.coins
    })


@predict.route("/v1/predict/live-event", methods=["PUT"])
def event_live():
    try:
        event_id = int(parse_arg_from_requests("event_id"))
    except ValueError or TypeError:
        return render_json(400, "Check if event_id is submitted in the correct format")

    event_object = Event.query.get(event_id)
    if event_object is None or event_object.status == 1:
        return render_json(404, "The event could not be found or has been deleted")

    event_object.status = 1
    event_object.save()

    return render_json(200)


@predict.route("/v1/predict/retrieve-points")
def retrieve_points():
    if not current_user.is_active:
        return render_json(403, {
            "unauthorized": "The request you made could not be completed."
        })

    return render_json(200, {
        "points": current_user.coins
    })
