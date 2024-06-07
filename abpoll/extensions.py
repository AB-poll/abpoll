from flask_debugtoolbar import DebugToolbarExtension
from flask_sqlalchemy import SQLAlchemy
from flask_static_digest import FlaskStaticDigest
from flask_mail import Mail
from flask_dropzone import Dropzone
from flask_login import LoginManager
from flask_wtf.csrf import CSRFProtect
from flask_moment import Moment
from flask_session import Session
from flask_babel import Babel
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address
from redis import Redis

from config.settings import REDIS_URL


sess = Session()
csrf = CSRFProtect()
debug_toolbar = DebugToolbarExtension()
db = SQLAlchemy()
flask_static_digest = FlaskStaticDigest()
login_manager = LoginManager()
mail = Mail()
dropzone = Dropzone()
moment = Moment()
limiter = Limiter(key_func=get_remote_address)
babel = Babel()
redis = Redis.from_url(REDIS_URL)
