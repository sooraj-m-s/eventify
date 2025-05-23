# Generated by Django 5.2 on 2025-04-25 18:48

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('users', '0005_alter_users_profile_image'),
    ]

    operations = [
        migrations.AlterField(
            model_name='users',
            name='mobile',
            field=models.BigIntegerField(default=1, unique=True),
            preserve_default=False,
        ),
        migrations.AlterField(
            model_name='users',
            name='profile_image',
            field=models.CharField(blank=True, max_length=255, null=True),
        ),
    ]
