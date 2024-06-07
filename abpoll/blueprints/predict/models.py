from sqlalchemy.orm import relationship
from flask_login import current_user
from sqlalchemy import or_, text, func, and_
from lib.util_sqlalchemy import ResourceMixin, AwareDateTime
from abpoll.extensions import db


class Event(db.Model, ResourceMixin):
    """This is where all the events will be linked to"""
    __tablename__ = "events"
    id = db.Column(db.Integer, unique=True, primary_key=True)
    status = db.Column(db.Integer, default=0)  # 0 = open, 1 = live, 2 = closed, 4 = canceled/draw
    winning_index = db.Column(db.Integer)  # 0 = a, 1 = b
    end_date = db.Column(AwareDateTime(), nullable=False)

    # foreign items
    post_id = db.Column(db.String, db.ForeignKey("posts.id"))
    post = relationship("Post", back_populates="events")

    # total amounts
    a_amount = db.Column(db.Integer, default=0)
    b_amount = db.Column(db.Integer, default=0)

    # connected items
    predictions = relationship("Predict", back_populates="event", cascade="all, delete-orphan")

    def total_amount(self):
        return self.a_amount + self.b_amount

    def calculate_reward(self, predictions_amount: int, winning_amount: int) -> int:
        return round((predictions_amount / winning_amount) * self.total_amount())

    def user_prediction(self):
        if current_user.is_active:
            prediction = db.session.query(Predict).filter(
                and_(Predict.author_id == current_user.id, Predict.event_id == self.id)).first()
            if prediction is not None:
                return {
                    "amount": prediction.amount,
                    "index": prediction.index,
                    "status": prediction.did_win,
                }
        return {
            "amount": 0,
            "index": "",
            "status": "",
        }


class Predict(db.Model, ResourceMixin):
    """This is where all the predictions will be linked to"""
    __tablename__ = "predictions"
    id = db.Column(db.Integer, unique=True, primary_key=True)
    amount = db.Column(db.Integer, nullable=False)
    index = db.Column(db.Integer, nullable=False)  # is index a == 0 else b == 1
    did_win = db.Column(db.Boolean)

    # foreign items
    event_id = db.Column(db.Integer, db.ForeignKey("events.id"))
    event = relationship("Event", back_populates="predictions")

    author_id = db.Column(
        db.String,
        db.ForeignKey("users.id", onupdate="CASCADE", ondelete="CASCADE"),
        index=True,
        nullable=False,
    )
    author = db.relationship("User", back_populates="predictions")
