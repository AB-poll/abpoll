from config.settings import MAIL_USERNAME
from flask import render_template
from flask_mail import Message
from abpoll.extensions import mail
from abpoll.app import create_celery_app


celery = create_celery_app()


@celery.task()
def send_contact_email(ctx):
    msg = Message(
        "New Message from ABpoll",
        sender=MAIL_USERNAME,
        recipients=["dorcy@skedo.tech"],
    )
    msg.html = render_template("email/email-contact.html", ctx=ctx)
    mail.send(msg)
    return None
