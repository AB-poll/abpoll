from flask import render_template, url_for
from flask_mail import Message
from abpoll.extensions import mail
from config.settings import (
    SERIALIZER_TOKEN,
    EMAIL_SALT,
    MAIL_USERNAME,
    MAIL_NAME,
)
from abpoll.app import create_celery_app

celery = create_celery_app()


@celery.task()
def deliver_password_reset_email(email, username):
    """
    Send a reset password e-mail to a user.

    :param email: The current user's email
    :type email: str
    :param username: The reset user's username
    :type username: str
    :return: None when the email was sent
    """
    token = SERIALIZER_TOKEN.dumps(email, salt=EMAIL_SALT)
    msg = Message(
        "Reset Your Password",
        sender=("ABpoll", "noreply@abpoll.com"),
        recipients=[email],
    )
    assert msg.sender == f"ABpoll <noreply@abpoll.com>"
    ctx = {
        "reset_password_link": url_for("user.reset_password_token", token=token, _external=True),
        "username": username,
    }
    msg.html = render_template("email/email-password-reset.html", ctx=ctx)
    mail.send(msg)

    return None


@celery.task()
def email_confirmation(email, username):
    """
    Send a reset password e-mail to a user.

    :param email: The current user's email
    :type email: str
    :param username: The reset user's username
    :type username: str
    :return: None when the email was sent
    """
    token = SERIALIZER_TOKEN.dumps(email, salt=EMAIL_SALT)
    ctx = {
        "link": url_for("user.confirm_email", token=token, _external=True),
        "username": username
    }
    msg = Message(
        "Confirm Your Account Email",
        sender=("ABpoll", "noreply@abpoll.com"),
        recipients=[email],
    )

    assert msg.sender == f"ABpoll <noreply@abpoll.com>"
    msg.html = render_template("email/email-confirmation.html", ctx=ctx)
    mail.send(msg)
    return None


@celery.task()
def account_delete(email, username, verification_code):
    """
    Send a code to delete account.

    :param email: The current user's email
    :type email: str
    :param username: The reset user's username
    :type username: str
    :param verification_code: The code that the user must verify
    :type verification_code: str
    :return: None when the email was sent
    """
    ctx = {
        "reason": f"Hi {username}, To finish deleting your account, enter this verification code:",
        "verification_code": verification_code
    }
    msg = Message(
        "Delete your ABpoll account",
        sender=("ABpoll", "noreply@abpoll.com"),
        recipients=[email],
    )

    assert msg.sender == f"ABpoll <noreply@abpoll.com>"
    msg.html = render_template("email/email-code.html", ctx=ctx)
    mail.send(msg)
    return None


@celery.task()
def deliver_password(email: str, username: str, display_name: str, temporary_password: str):
    """
    Send a password to first time users.

    email: The current user's email
    username: The current user's username
    display_name: The current user's display name
    temporary_password: The current user's temporary password
    return: None when the email was sent
    """

    token = SERIALIZER_TOKEN.dumps(email, salt=EMAIL_SALT)
    ctx = {
        "link": url_for("user.confirm_email", token=token, _external=True),
        "display_name": display_name,
        "username": username,
        "temporary_password": temporary_password,
    }
    msg = Message(
        "Welcome to ABpoll",
        sender=("ABpoll", "noreply@abpoll.com"),
        recipients=[email],
    )

    assert msg.sender == f"ABpoll <noreply@abpoll.com>"
    msg.html = render_template("email/email-temporary-password.html", ctx=ctx)
    mail.send(msg)

    return None
