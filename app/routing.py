from django.urls import path

from app.consumer import ChatConsumer, StatusConsumer

websocket_urlpatterns = [
    path('ws/status/', StatusConsumer.as_asgi()),
    path('ws/room/<str:room>/', ChatConsumer.as_asgi()),
]