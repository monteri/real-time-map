import React from 'react';
import useWebSocket from 'react-use-websocket';

const Status = () => {
  const [roomsData, setRoomsData] = React.useState({});

  const onMessage = React.useCallback((e) => {
    const data = JSON.parse(e.data);
    setRoomsData(data);
  }, []);

  const onClose = React.useCallback((e) => {
    console.log('The status socket closed the connection');
  }, []);

  useWebSocket(
        'ws://'
        + 'localhost:8000'
        + '/ws/status/', { onMessage, onClose });

  return (
    <div className="status">
      <h3>Active rooms</h3>
      {Object.keys(roomsData).length ? (
        <table className="status-table">
          <thead>
            <tr>
              <th>Room</th>
              <th>Members online</th>
            </tr>
          </thead>
          <tbody>
            {Object.keys(roomsData).map((room, index) => (
              <tr key={`${room}${index}`}>
                <td>{room}</td>
                <td>{roomsData[room]}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : 'No active room right now'}
    </div>
  );
};

export default Status;