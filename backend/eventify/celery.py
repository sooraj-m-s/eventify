import os
from celery import Celery
from celery.schedules import crontab


os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'eventify.settings')

app = Celery('eventify')

app.config_from_object('django.conf:settings', namespace='CELERY')

app.autodiscover_tasks()

# Configure Celery Beat schedule
app.conf.beat_schedule = {
    'send-daily-morning-email': {
        'task': 'users.tasks.send_daily_morning_email',
        'schedule': crontab(hour=8, minute=0)
    },
}
