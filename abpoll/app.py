import logging
from logging.handlers import SMTPHandler

from celery import Celery
from flask import Flask, redirect, url_for, render_template, flash
from flask_wtf.csrf import CSRFError

import stripe
from abpoll.blueprints.billing.template_processors import (
    format_currency,
    current_year,
    time_in_days
)

from werkzeug.debug import DebuggedApplication
from werkzeug.middleware.proxy_fix import ProxyFix

from cli import register_cli_commands
from abpoll.blueprints.general.views import general
from abpoll.blueprints.user.views import user
from abpoll.blueprints.message.views import message
from abpoll.blueprints.post.views import post
from abpoll.blueprints.post.new_post import new_post
from abpoll.blueprints.post.show_votes import show_votes
from abpoll.blueprints.post.sort_votes import sort_votes
from abpoll.blueprints.sitemap.views import sitemap
from abpoll.blueprints.helpcenter.views import helpcenter
from abpoll.blueprints.predict.views import predict
from abpoll.blueprints.analytics.views import analytics
from abpoll.blueprints.billing.views.billing import billing
from abpoll.blueprints.billing.views.stripe_webhook import stripe_webhook
from abpoll.blueprints.groups.views import groups

from abpoll.blueprints.utils.views.question_likes import question_likes
from abpoll.blueprints.utils.views.cookies import cookie_creation
from abpoll.blueprints.utils.views.post_comment import post_comment
from abpoll.blueprints.utils.views.post_dashboard import post_dashboard
from abpoll.blueprints.general.notifications import notifications
from abpoll.blueprints.utils.views.google_login import google_login
from abpoll.blueprints.utils.views.facebook_login import facebook_login
from abpoll.blueprints.utils.views.delete_account import delete_account
from abpoll.blueprints.utils.views.auto_cd import auto_cd
from abpoll.blueprints.utils.views.email_only_signup import email_only_signup
from abpoll.blueprints.utils.views.fingerprint import fingerprint
from abpoll.blueprints.utils.views.sidebar import sidebar
from abpoll.blueprints.admin.views import admin
from abpoll.blueprints.utils.views.retrieve_topics import retrieve_topics

from abpoll.blueprints.user.models import User
from abpoll.extensions import (
    db,
    flask_static_digest,
    login_manager,
    mail,
    dropzone,
    csrf,
    moment,
    sess,
    babel,
    limiter
)


def create_celery_app(app=None):
    """
    Create a new Celery app and tie together the Celery config to the app's
    config. Wrap all tasks in the context of the application.

    param app: Flask app
    return: Celery app
    """
    app = app or create_app()

    celery = Celery(app.import_name)
    celery.conf.update(app.config.get("CELERY_CONFIG", {}))
    TaskBase = celery.Task

    class ContextTask(TaskBase):
        abstract = True

        def __call__(self, *args, **kwargs):
            with app.app_context():
                return TaskBase.__call__(self, *args, **kwargs)

    celery.Task = ContextTask
    return celery


def create_app(settings_override=None):
    """
    Create a Flask application using the app factory pattern.

    param settings_override: Override settings
    return: Flask app
    """
    app = Flask(__name__, static_folder="../public", static_url_path="")

    app.config.from_object("config.settings")

    if settings_override:
        app.config.update(settings_override)

    stripe.api_key = app.config.get('STRIPE_SECRET_KEY')
    stripe.api_version = app.config.get('STRIPE_API_VERSION')

    middleware(app)
    app.register_blueprint(general)
    app.register_blueprint(user)
    app.register_blueprint(post)
    app.register_blueprint(sitemap)
    app.register_blueprint(helpcenter)
    app.register_blueprint(new_post)
    app.register_blueprint(show_votes)
    app.register_blueprint(predict)
    app.register_blueprint(analytics)
    app.register_blueprint(billing)
    app.register_blueprint(stripe_webhook)
    app.register_blueprint(groups)

    app.register_blueprint(retrieve_topics)
    app.register_blueprint(question_likes)
    app.register_blueprint(cookie_creation)
    app.register_blueprint(post_comment)
    app.register_blueprint(post_dashboard)
    app.register_blueprint(notifications)
    app.register_blueprint(google_login)
    app.register_blueprint(admin)
    app.register_blueprint(facebook_login)
    app.register_blueprint(delete_account)
    app.register_blueprint(auto_cd)
    app.register_blueprint(email_only_signup)
    app.register_blueprint(message)
    app.register_blueprint(fingerprint)
    app.register_blueprint(sidebar)
    app.register_blueprint(sort_votes)

    app.jinja_env.add_extension("jinja2.ext.do")
    template_processors(app)
    authentication(app, User)
    extensions(app)
    register_cli_commands(app)

    @app.errorhandler(404)
    def page_not_found(e):
        return render_template("errors/404.html"), 404

    @app.errorhandler(429)
    def page_tbd(e):
        return render_template("errors/429.html"), 429

    @app.errorhandler(500)
    def page_server_error(e):
        return render_template("errors/429.html"), 500

    @app.errorhandler(405)
    @app.errorhandler(401)
    @app.errorhandler(CSRFError)
    def unauthorized(e):
        flash("You need to login to access this.", "danger")
        return redirect(url_for("user.login"))

    return app


def extensions(app):
    """
    Register 0 or more extensions (mutates the app passed in).

    param app: Flask application instance
    return: None
    """
    # Uncomment the thing bellow to enable flask debug toolbar
    # debug_toolbar.init_app(app)
    db.init_app(app)
    flask_static_digest.init_app(app)
    login_manager.init_app(app)
    mail.init_app(app)
    dropzone.init_app(app)
    csrf.init_app(app)
    moment.init_app(app)
    sess.init_app(app)
    limiter.init_app(app)
    babel.init_app(app)

    return None


def middleware(app):
    """
    Register 0 or more middleware (mutates the app passed in).

    param app: Flask application instance
    return: None
    """
    # Enable the Flask interactive debugger in the browser for development.

    # Comment this in development
    app.debug = app.config.get('DEBUG')

    if app.debug:
        app.wsgi_app = DebuggedApplication(app.wsgi_app, evalex=True)

    # Set the real IP address into request.remote_addr when behind a proxy.
    app.wsgi_app = ProxyFix(app.wsgi_app)

    return None


def template_processors(app):
    """
    Register 0 or more custom template processors (mutates the app passed in).

    :param app: Flask application instance
    :return: App jinja environment
    """
    app.jinja_env.filters['format_currency'] = format_currency
    app.jinja_env.globals.update(current_year=current_year)
    app.jinja_env.globals.update(time_in_days=time_in_days)
    app.jinja_env.globals.update(letters='abcdefghijklmnopqrstuvwxyz')

    return app.jinja_env


def authentication(app, user_model):
    """
    Initialize the Flask-Login extension (mutates the app passed in).

    param app: Flask application instance
    param user_model: Model that contains the authentication information
    type user_model: SQLAlchemy model
    return: None
    """
    login_manager.login_view = "user.login"
    login_manager.login_message = "Please log in to access this page."
    login_manager.login_message_category = "danger"

    @login_manager.user_loader
    def load_user(uid):
        return user_model.query.get(uid)


def exception_handler(app):
    """
    Register 0 or more exception handlers (mutates the app passed in).

    :param app: Flask application instance
    :return: None
    """
    mail_handler = SMTPHandler((app.config.get('MAIL_SERVER'),
                                app.config.get('MAIL_PORT')),
                               app.config.get('MAIL_USERNAME'),
                               [app.config.get('MAIL_USERNAME')],
                               '[Exception handler] A 5xx was thrown',
                               (app.config.get('MAIL_USERNAME'),
                                app.config.get('MAIL_PASSWORD')),
                               secure=())

    mail_handler.setLevel(logging.ERROR)
    mail_handler.setFormatter(logging.Formatter("""
    Time:               %(asctime)s
    Message type:       %(levelname)s


    Message:

    %(message)s
    """))
    app.logger.addHandler(mail_handler)

    return None


celery_app = create_celery_app()
