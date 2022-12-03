from django.urls import path

from app.views import enter_room

urlpatterns = [
    path('enter_room/', enter_room),
]
