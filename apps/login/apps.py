"""Login app"""

from django.apps import AppConfig


class LoginConfig(AppConfig):
    """Login Configuration

    Args:
        AppConfig: The app config
    """
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'login'
