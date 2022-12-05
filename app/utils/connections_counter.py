class ConnectionsCounter:
    def __init__(self):
        self.connections = {}

    def mutate_connections(self, room, action):
        count = 0
        if room in self.connections:
            count = self.connections[room]
        if action == 'add':
            count += 1
        elif action == 'delete':
            count -= 1
        self.connections[room] = count
