import requests
import json

from config.settings import FIREBASE_SERVER_KEY, ONESIGNAL_APP_ID, ONESIGNAL_API_KEY

from abpoll.app import create_celery_app

celery = create_celery_app()


@celery.task()
def send_new_notification(title, body, objective, token, channel, display_picture=None):
    """Send notification, to learn more about creating this notification,
    visit https://documentation.onesignal.com/reference/create-notification"""

    header = {"Content-Type": "application/json; charset=utf-8",
              "Authorization": f"Basic {ONESIGNAL_API_KEY}"}

    payload = {"app_id": ONESIGNAL_APP_ID,
               "include_external_user_ids": [channel],
               "channel_for_external_user_ids": "push",
               "contents": {"en": body},
               "headings": {"en": title},
               "url": objective,
               }

    req = requests.post("https://onesignal.com/api/v1/notifications", headers=header, data=json.dumps(payload))
    return req.status_code
