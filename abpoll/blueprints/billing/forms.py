from flask_babel import lazy_gettext as _
from flask_wtf import FlaskForm
from wtforms import StringField, HiddenField, SelectField
from wtforms.validators import DataRequired, Optional, Length


class SubscriptionForm(FlaskForm):
    stripe_key = HiddenField(_('Stripe publishable key'),
                             [DataRequired(), Length(1, 254)])
    plan = HiddenField(_('Plan'),
                       [DataRequired(), Length(1, 254)])
    coupon_code = StringField(_('Do you have a coupon code?'),
                              [Optional(), Length(1, 128)])
    name = StringField(_('Name on card'),
                       [DataRequired(), Length(1, 254)])


class UpdateSubscriptionForm(FlaskForm):
    coupon_code = StringField(_('Do you have a coupon code?'),
                              [Optional(), Length(1, 254)])


class CancelSubscriptionForm(FlaskForm):
    pass
