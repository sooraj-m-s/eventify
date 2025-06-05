import json
from django.db import transaction
from django_celery_beat.models import PeriodicTask, CrontabSchedule


def setup_periodic_tasks():
    with transaction.atomic():
        schedule, _ = CrontabSchedule.objects.get_or_create(
            minute='0',
            hour='10',
            day_of_week='*',
            day_of_month='*',
            month_of_year='*',
        )

        PeriodicTask.objects.update_or_create(
            name='Send event reminders',
            defaults={
                'crontab': schedule,
                'task': 'events.tasks.send_event_reminder_emails',
                'kwargs': json.dumps({}),
                'enabled': True,
            }
        )

