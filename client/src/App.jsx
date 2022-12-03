import React from 'react';
import Room from './Room';

import './App.css';
import Status from "./Status";

function App() {
  const [roomName, setRoomName] = React.useState('');
  const [username, setUsername] = React.useState('');
  const [session, setSession] = React.useState(null);

  const onClickHandler = () => {
    if (!roomName || !username) {
      return;
    }
    fetch('http://localhost:8000/enter_room/', {
      method: 'POST',
      body: JSON.stringify({ room: roomName, username }),
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
    })
      .then(response => response.json())
      .then(data => {
        setSession(data)
      });
  };

  return (
    <main style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      {session ? (
        <Room session={session} />
      ) : (
        <>
          <h3>Welcome to the real time map</h3>
          <p>Choose a room</p>
          <div style={{ padding: '0.5rem' }}>
            <input
              type="text"
              value={roomName}
              onChange={(e) => setRoomName(e.target.value)}
              placeholder="Room name"
            />
          </div>
          <div style={{ padding: '0.5rem' }}>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Username"
            />
          </div>
          <button onClick={onClickHandler}>Submit</button>
          <Status />
        </>
      )}
    </main>
  );
}

export default App;
