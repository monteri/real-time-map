import json
import redis

from django.views.decorators.csrf import csrf_exempt
from django.http import JsonResponse
from django.conf import settings

redis_instance = redis.StrictRedis(host=settings.REDIS_HOST, port=settings.REDIS_PORT, db=0)


@csrf_exempt
def enter_room(request):
    if request.method != 'POST':
        return JsonResponse({'error': 'Method is not allowed'}, status=400)

    data = json.loads(request.body)
    room = data['room']
    username = data['username']
    chat = []
    map_data = []
    try:
        room_data = json.loads(redis_instance.get(f'{settings.ROOM_PREFIX}{room}'))
        chat = room_data['chat']
        map_data = room_data['map_data']
    except:
        pass

    return JsonResponse({'room': room, 'username': username, 'chat': chat, 'coordinates': map_data})
