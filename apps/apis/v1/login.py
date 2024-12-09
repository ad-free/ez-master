"""Login enpoints"""
from drf_spectacular.utils import extend_schema
from rest_framework.renderers import JSONRenderer
from rest_framework.request import Request
from rest_framework.response import Response
from rest_framework.status import HTTP_200_OK, HTTP_400_BAD_REQUEST
from rest_framework.viewsets import ViewSet

from apps.login.serializer import LoginSerializer


class Login(ViewSet):
    """
    View to list all users in the system.
    """
    serializer_class = LoginSerializer
    renderer_classes = [JSONRenderer]

    def create(self, request: Request):
        """
        Verify user

        Args:
            request (Request): The request

        Returns:
            The user information
        """

        serializer = self.serializer_class(data=request.data)

        if serializer.is_valid(raise_exception=True):
            return Response(data=serializer.data, status=HTTP_200_OK)
        return Response(data=serializer.errors, status=HTTP_400_BAD_REQUEST)
