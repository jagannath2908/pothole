import React from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { Box, Typography } from '@mui/material';

// Fix for default marker icons in react-leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

const Map = ({ potholes = [] }) => {
  const defaultCenter = [20.5937, 78.9629]; // Center of India
  const safePotholes = Array.isArray(potholes) ? potholes : [];

  return (
    <Box sx={{ height: '100%', width: '100%' }}>
      <MapContainer
        center={defaultCenter}
        zoom={5}
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        {safePotholes.map((pothole, index) => (
          <Marker
            key={index}
            position={[pothole.latitude, pothole.longitude]}
          >
            <Popup>
              <Typography variant="subtitle1">
                Pothole Intensity: {pothole.intensity.toFixed(2)}
              </Typography>
              <Typography variant="body2">
                Detected: {new Date(pothole.timestamp).toLocaleString()}
              </Typography>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </Box>
  );
};

export default Map; 