# Generated by Django 5.2 on 2025-05-11 12:55

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('users', '0011_delete_blacklistedtoken_organizerprofile_about_and_more'),
    ]

    operations = [
        migrations.AlterField(
            model_name='organizerprofile',
            name='about',
            field=models.TextField(),
        ),
        migrations.AlterField(
            model_name='organizerprofile',
            name='id_proof',
            field=models.CharField(max_length=255),
        ),
        migrations.AlterField(
            model_name='organizerprofile',
            name='place',
            field=models.CharField(max_length=255),
        ),
    ]
