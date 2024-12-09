"""
URL configuration for lpm_api project.
"""
from rest_framework import routers

from apps.apis.v1.login import Login

router = routers.DefaultRouter()
router.register("login", Login, basename="login")
