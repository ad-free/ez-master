"""Serializer"""
from rest_framework import serializers


class LoginSerializer(serializers.Serializer):
    """Login Serializer"""

    password = serializers.CharField(max_length=50)


    def create(self, validated_data):
        return

    def update(self, instance, validated_data):
        return
