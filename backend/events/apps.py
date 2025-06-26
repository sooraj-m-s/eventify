from django.apps import AppConfig
from django.db.models.signals import post_migrate


class EventsConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'events'

    def ready(self):
        def setup_tasks(sender, **kwargs):
            from .setup_periodic_tasks import setup_periodic_tasks
            setup_periodic_tasks()
        
        post_migrate.connect(setup_tasks, sender=self)

