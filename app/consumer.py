import json
import redis

from django.conf import settings
from channels.generic.websocket import AsyncWebsocketConsumer
from asgiref.sync import sync_to_async

redis_instance = redis.StrictRedis(host=settings.REDIS_HOST, port=settings.REDIS_PORT, db=0)


def get_redis_room(room):
    return f'{settings.ROOM_PREFIX}{room}'


def get_rooms():
    _, keys = redis_instance.scan(match=f'{settings.ROOM_PREFIX}*')
    return list(map(lambda x: x.decode("utf-8").split(':')[1], keys))


connections = {}


def mutate_connections(room, action):
    count = 0
    if room in connections:
        count = connections[room]
    if action == 'add':
        count += 1
    elif action == 'delete':
        count -= 1
    connections[room] = count


class ChatConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.room = self.scope['url_route']['kwargs']['room']
        self.room_group_name = f'chat_{self.room}'
        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name,
        )
        await self.accept()

        await self.channel_layer.group_send(
            'rooms_status',
            {'type': 'update_rooms_data', 'room': self.room, 'action': 'add'}
        )

    async def disconnect(self, code):
        await self.channel_layer.group_discard(
            self.room_group_name,
            self.channel_name,
        )
        await self.channel_layer.group_send(
            'rooms_status',
            {'type': 'update_rooms_data', 'room': self.room, 'action': 'delete'}
        )

    async def receive(self, text_data=None, bytes_data=None):
        data = json.loads(text_data)
        username = data['username']
        room = data['room']

        if 'coordinates' in data:
            coordinates = data['coordinates']
            await self.save_coordinates(username, room, coordinates)
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    'type': 'map_message',
                    'coordinates': coordinates,
                    'username': username,
                }
            )
        elif 'message' in data:
            message = data['message']
            await self.save_message(username, room, message)
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    'type': 'chat_message',
                    'message': message,
                    'username': username,
                }
            )

    async def chat_message(self, event):
        message = event['message']
        username = event['username']

        await self.send(text_data=json.dumps({
            'message': message,
            'username': username,
        }))

    async def map_message(self, event):
        coordinates = event['coordinates']
        username = event['username']

        await self.send(text_data=json.dumps({
            'coordinates': coordinates,
            'username': username,
        }))

    @sync_to_async
    def save_message(self, username, room, message):
        room_data = {}
        chat = []
        try:
            room_data = json.loads(redis_instance.get(get_redis_room(room)))
            chat = room_data['chat']
        except:
            pass
        chat.append({'message': message, 'username': username})
        redis_instance.set(get_redis_room(room), json.dumps({
            **room_data,
            'chat': chat,
        }))

    @sync_to_async
    def save_coordinates(self, username, room, coordinates):
        room_data = {}
        map_data = []
        try:
            room_data = json.loads(redis_instance.get(get_redis_room(room)))
            map_data = room_data['map_data']
        except:
            pass
        map_data = [user for user in map_data if user['username'] != username]
        map_data.append({'username': username, 'x': coordinates['x'], 'y': coordinates['y']})
        redis_instance.set(get_redis_room(room), json.dumps({
            **room_data,
            'map_data': map_data
        }))


class StatusConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        await self.channel_layer.group_add(
            'rooms_status',
            self.channel_name,
        )
        await self.accept()
        await self.channel_layer.group_send(
            'rooms_status',
            {'type': 'update_rooms_data'}
        )

    async def disconnect(self, code):
        await self.channel_layer.group_discard(
            'rooms_status',
            self.channel_name,
        )

    async def update_rooms_data(self, event):
        room = event.get('room')
        action = event.get('action')
        if room and action:
            mutate_connections(room, action)
        await self.send(text_data=json.dumps({k: v for k, v in connections.items() if connections[k] > 0}))