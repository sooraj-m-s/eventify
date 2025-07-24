import json
from django.db import transaction
from django_celery_beat.models import PeriodicTask, CrontabSchedule


def setup_periodic_tasks():
    with transaction.atomic():
        # Schedule for send_event_reminder_emails (every day at 10 AM)
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

        # Schedule for cancel_expired_pending_bookings (every hour)
        cancel_schedule, _ = CrontabSchedule.objects.get_or_create(
            minute='0',
            hour='*',
            day_of_week='*',
            day_of_month='*',
            month_of_year='*',
        )
        PeriodicTask.objects.update_or_create(
            name='Cancel expired pending bookings',
            defaults={
                'crontab': cancel_schedule,
                'task': 'events.tasks.cancel_expired_pending_bookings',
                'kwargs': json.dumps({}),
                'enabled': True,
            }
        )

