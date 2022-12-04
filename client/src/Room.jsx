import React from 'react';
import useWebSocket from 'react-use-websocket';

import Map from "./Map";


function Room({ session }) {
  const [message, setMessage] = React.useState('');
  const [mapData, setMapData] = React.useState(session.coordinates || []);
  const [chatContent, setChatContent] = React.useState(session.chat || [])

  const onMessage = React.useCallback((e) => {
    const data = JSON.parse(e.data);

    if (data.coordinates) {
      setMapData(prevState => [...prevState.filter(marker => marker.username !== data.username),
        { username: data.username, x: data.coordinates.x, y: data.coordinates.y}]);
    } else if (data.message) {
      setChatContent(prevState => [...prevState, {
        username: data.username,
        message: data.message,
      }]);
    }
  }, []);

  const onClose = React.useCallback((e) => {
    console.log('You have left the room');
  }, []);

  const { sendMessage } = useWebSocket(
    process.env.REACT_APP_WEBSOCKET_SERVER
        + '/ws/room/'
        + session.room
        + '/', { onMessage, onClose });

  React.useEffect(() => {
    const chat = document.querySelector('.chat');
    chat.scrollTop = chat.scrollHeight;
  }, [chatContent]);

  const coordinatesSendHandler = (x, y) => {
    if (x <= 0 || y <= 0) {
      return;
    }
    sendMessage(JSON.stringify({
      coordinates: { x, y },
      username: session.username,
      room: session.room,
    }));
  };

  const messageSendHandler = () => {
    if (!message) {
      return;
    }
    sendMessage(JSON.stringify({
      message,
      username: session.username,
      room: session.room,
    }));
    setMessage('');
  };

  return (
    <>
      <div className="room-header">
        <h3>
          Room:{' '}
          <span className="room-header__room-name">
            {session.room}
          </span>
        </h3>
        <h3>
          Username:{' '}
          <span className="room-header__username">
            {session.username}
          </span>
        </h3>
      </div>
      <div className="chat-wrapper">
        <h3>Chat</h3>
        <div className="chat">
          {chatContent.map((msg, index) => (
            <p
              key={`${msg.message}${index}`}
            >
              <b
                style={{ color: msg.username === session.username ? 'green' : 'black' }}
              >
                {msg.username}:</b> {msg.message}
            </p>
          ))}
        </div>
        <div className="chat-form">
          <input
            className="chat-input"
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={e => {
              if (e.key === 'Enter') {
                messageSendHandler();
              }
            }}
            placeholder="Message"
          />
          <button onClick={messageSendHandler}>Send</button>
        </div>
      </div>
      <Map data={mapData} username={session.username} coordinatesSendHandler={coordinatesSendHandler} />
    </>
  );
}

export default Room;
