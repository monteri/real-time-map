import React from 'react';

const MARKER_HEIGHT = 40;
const MARKER_WIDTH = 25;

function Map({ data, username, coordinatesSendHandler }) {
  const [visibleNames, setVisibleName] = React.useState(false);

  const handleMapClick = (event) => {
    const currentTargetRect = event.currentTarget.getBoundingClientRect();
    const event_offsetX = event.pageX - currentTargetRect.left;
    const event_offsetY = event.pageY - window.pageYOffset - currentTargetRect.top;
    coordinatesSendHandler(event_offsetX, event_offsetY);
  }

  return (
    <div className="map-wrapper">
      <div>
        <input type="checkbox" onChange={() => setVisibleName(!visibleNames)} />
        <label>See names</label>
      </div>

      <div id="map" onClick={handleMapClick}>
        {data.map(marker => (
          <div
            key={marker.username}
            className="marker-wrapper"
            style={{ top: `${marker.y - MARKER_HEIGHT}px`, left: `${marker.x - MARKER_WIDTH / 2}px` }}
          >
            {visibleNames && (
              <div className="marker-text">{marker.username === username ? 'YOU' : marker.username}</div>
            )}
            <div
              key={`${marker.x}${marker.y}`}
              className="marker"
            />
          </div>
        ))}
      </div>
    </div>
  );
}

export default Map;
