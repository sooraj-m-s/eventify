# Generated by Django 5.2 on 2025-06-14 08:21

import datetime
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('events', '0005_event_is_settled_to_organizer'),
    ]

    operations = [
        migrations.AddField(
            model_name='event',
            name='time',
            field=models.TimeField(default=datetime.time(9, 0)),
            preserve_default=False,
        ),
    ]
