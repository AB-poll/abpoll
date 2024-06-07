from wtforms import StringField
from wtforms.validators import Length, InputRequired
from wtforms_components import EmailField, Email
from lib.util_wtforms import ModelForm


class ContactForm(ModelForm):

    your_name = StringField(
        "Your Name", validators=[Length(1, 16), InputRequired()]
    )

    email = EmailField(
        "Email", validators=[InputRequired(), Email(), Length(4, 24)]
    )

    subject = StringField(
        "Subject", validators=[Length(1, 16), InputRequired()]
    )

    # your_message = StringField("Message",
    #                            validators=[Length(5, 500), InputRequired()],
    #                            render_kw={'rows': 5})
