import os

from itsdangerous import URLSafeTimedSerializer
from redis import Redis
from celery.schedules import crontab

LOG_LEVEL = os.getenv('LOG_LEVEL', 'DEBUG')

SECRET_KEY = os.getenv("SECRET_KEY", None)

SERVER_NAME = os.getenv(
    "SERVER_NAME", "localhost:{0}".format(os.getenv("PORT", "8000"))
)
# DOMAIN_NAME = "localhost:8000"
DOMAIN_NAME = "abpoll.com"

# SQLAlchemy.
pg_user = os.getenv("POSTGRES_USER", "abpoll")
pg_pass = os.getenv("POSTGRES_PASSWORD", "password")
pg_host = os.getenv("POSTGRES_HOST", "postgres")
pg_port = os.getenv("POSTGRES_PORT", "5432")
pg_db = os.getenv("POSTGRES_DB", pg_user)
db = f"postgresql://{pg_user}:{pg_pass}@{pg_host}:{pg_port}/{pg_db}"
SQLALCHEMY_DATABASE_URI = os.getenv("DATABASE_URL", db)
SQLALCHEMY_TRACK_MODIFICATIONS = False

# Redis.
REDIS_URL = os.getenv("REDIS_URL", "redis://redis:6379/0")

# Celery.
CELERY_CONFIG = {
    "broker_url": REDIS_URL,
    "result_backend": REDIS_URL,
    'include': [
        'abpoll.blueprints.helpcenter.tasks',
        'abpoll.blueprints.user.tasks',
        'abpoll.blueprints.billing.tasks',
        'abpoll.blueprints.post.tasks'
    ],
    'beat_schedule': {
        'mark-soon-to-expire-credit-cards': {
            'task': 'abpoll.blueprints.billing.tasks.mark_old_credit_cards',
            'schedule': crontab(hour=0, minute=0)
        },
        'expire-old-coupons': {
            'task': 'abpoll.blueprints.billing.tasks.expire_old_coupons',
            'schedule': crontab(hour=0, minute=1)
        }
    }
}

# Cloudflare Images
CLOUDFLARE_API_KEY = os.getenv("CLOUDFLARE_API_KEY", None)
CLOUDFLARE_ACCOUNT_ID = os.getenv("CLOUDFLARE_ACCOUNT_ID", None)
CLOUDFLARE_READ_ACCOUNT_ID = os.getenv("CLOUDFLARE_READ_ACCOUNT_ID", None)
CLOUDFLARE_IMAGE_DELETE_URL = os.getenv("CLOUDFLARE_IMAGE_DELETE_URL", None)

# Serializer Token and image upload folder.
UPLOAD_FOLDER = "public/images/uploads"
SERIALIZER_TOKEN = URLSafeTimedSerializer(os.getenv("SERIALIZER_TOKEN", None))

# Flask-Dropzone config:
DROPZONE_ALLOWED_FILE_TYPE = "image"
DROPZONE_MAX_FILE_SIZE = 26
DROPZONE_MAX_FILES = 10
DROPZONE_IN_FORM = True
DROPZONE_UPLOAD_ON_CLICK = True
DROPZONE_UPLOAD_ACTION = "image_upload.upload_images_url"  # URL or endpoint
DROPZONE_PARALLEL_UPLOADS = 3
DROPZONE_DEFAULT_MESSAGE = (
    "<button "
    'class="btn btn-soft-primary mt-2 me-2" '
    'type="button">Click to Upload</button>'
)
DROPZONE_ENABLE_CSRF = True

# Email Settings.
MAIL_SERVER = "smtp-relay.gmail.com"
MAIL_PORT = 587
MAIL_USE_TLS = True
MAIL_USERNAME = os.getenv("MAIL_USERNAME", None)
MAIL_NAME = os.getenv("MAIL_NAME", None)
MAIL_PASSWORD = os.getenv("MAIL_PASSWORD", None)
MAIL_DEBUG = True
MAIL_SUPPRESS_SEND = False
TESTING = os.getenv("TESTING", None)
EMAIL_SALT = os.getenv("EMAIL_SALT", None)

# API Keys
PUSHER_APP_ID = os.getenv("PUSHER_APP_ID", None)
PUSHER_KEY = os.getenv("PUSHER_KEY", None)
PUSHER_SECRET = os.getenv("PUSHER_SECRET", None)
PUSHER_CLUSTER = "us2"
PUSHER_SSL = True
PUSHER_AUTH_ENDPOINT = "/api/auth/pusher/"

# Billing.
STRIPE_PUBLISHABLE_KEY = os.getenv('STRIPE_PUBLISHABLE_KEY', None)
STRIPE_SECRET_KEY = os.getenv('STRIPE_SECRET_KEY', None)
STRIPE_API_VERSION = '2022-08-01'
STRIPE_CURRENCY = 'usd'
STRIPE_TRIAL_PERIOD_DAYS = 14
STRIPE_PLANS = {
    '0': {
        'id': 'monthly',
        'name': 'Monthly',
        'amount': 1299,
        'currency': STRIPE_CURRENCY,
        'interval': 'month',
        'interval_count': 1,
        'statement_descriptor': 'ABPOLL PLUS',
        'metadata': {
            'recommended': False
        }
    },
    '1': {
        'id': 'yearly',
        'name': 'Yearly',
        'amount': 11999,
        'currency': STRIPE_CURRENCY,
        'interval': 'year',
        'interval_count': 1,
        'statement_descriptor': 'ABPOLL PLUS',
        'metadata': {
            'recommended': True
        }
    }
}

# Rate limiting.
RATELIMIT_STORAGE_URL = REDIS_URL
RATELIMIT_STRATEGY = 'fixed-window-elastic-expiry'
RATELIMIT_HEADERS_ENABLED = True

# Google Login
GOOGLE_CLIENT_ID = os.getenv('GOOGLE_CLIENT_ID', None)
GOOGLE_CLIENT_SECRET = os.getenv('GOOGLE_CLIENT_SECRET', None)
GOOGLE_DISCOVERY_URL = os.getenv('GOOGLE_DISCOVERY_URL', None)

# Facebook Login
FACEBOOK_APP_ID = os.getenv('FACEBOOK_APP_ID', None)
FACEBOOK_APP_SECRET = os.getenv('FACEBOOK_APP_SECRET', None)
FACEBOOK_API_VERSION = os.getenv('FACEBOOK_API_VERSION', None)

OAUTHLIB_INSECURE_TRANSPORT = 1

# FILE UPLOAD SETTINGS
MAX_CONTENT_LENGTH = 65 * 1024 * 1024

# COOKIES
SESSION_TYPE = "redis"
SESSION_REDIS = Redis("redis")
SESSION_COOKIE_SECURE = True

# GITHUB SECRETS
GITHUB_SECRET = os.getenv('GITHUB_SECRET', None)

# Number of users to recommend
RECOMMEND_NUMBER = 3

# Firebase KEY
FIREBASE_SERVER_KEY = os.getenv('FIREBASE_SERVER_KEY', None)
FIREBASE_VAPID_KEY = os.getenv('FIREBASE_VAPID_KEY', None)

# OneSignal KEY
ONESIGNAL_APP_ID = os.getenv('ONESIGNAL_APP_ID', None)
ONESIGNAL_API_KEY = os.getenv('ONESIGNAL_API_KEY', None)

# OpenAI KEY
OPENAI_API_KEY = os.getenv('OPENAI_API_KEY', None)
OPENAI_ORGANIZATION = os.getenv('OPENAI_ORGANIZATION', None)

