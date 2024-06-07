import pusher

pusher_client = pusher.Pusher(
    app_id='1388789',
    key='9ce7bf8c4389f119e275',
    secret='a4ebc8dd373b804351f6',
    cluster='us2',
    ssl=True
)


def send_pusher_message(channel_name, event, message, profile_picture, room_id, username):
    pusher_client.trigger(channel_name, event, {'message': message,
                                                'profile_picture': profile_picture,
                                                'room_id': room_id,
                                                'username': username})
    return None


def check_channel_info(channel_name):
    channel = pusher_client.channel_info(channel_name)
    return channel['occupied']
