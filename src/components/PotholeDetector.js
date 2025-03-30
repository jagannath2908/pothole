import React, { useEffect, useState } from 'react';
import {
  Box,
  Button,
  Typography,
  CircularProgress,
  Paper,
  LinearProgress,
  Slider,
  Alert,
} from '@mui/material';
import { PlayArrow, Stop } from '@mui/icons-material';

const PotholeDetector = ({ isDetecting, setIsDetecting, socket }) => {
  const [accelerometerData, setAccelerometerData] = useState({ x: 0, y: 0, z: 0 });
  const [threshold, setThreshold] = useState(15);
  const [lastUpdate, setLastUpdate] = useState(Date.now());
  const [error, setError] = useState(null);
  const [permissionGranted, setPermissionGranted] = useState(false);

  useEffect(() => {
    let timeoutId = null;

    const handleAccelerometer = (event) => {
      if (!event.acceleration) return;
      
      const { x, y, z } = event.acceleration;
      const safeX = x ?? 0;
      const safeY = y ?? 0;
      const safeZ = z ?? 0;
      
      setAccelerometerData({ x: safeX, y: safeY, z: safeZ });

      const magnitude = Math.sqrt(safeX * safeX + safeY * safeY + safeZ * safeZ);
      
      if (magnitude > threshold && Date.now() - lastUpdate > 1000) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const potholeData = {
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
              intensity: magnitude,
            };
            socket.emit('pothole-detected', potholeData);
            setLastUpdate(Date.now());
          },
          (error) => {
            console.error('Error getting location:', error);
            setError('Error getting location. Please enable location services.');
          }
        );
      }
    };

    if (isDetecting) {
      try {
        if (window.DeviceMotionEvent) {
          window.addEventListener('devicemotion', handleAccelerometer);
        } else {
          setError('Device motion not supported on this device');
          setIsDetecting(false);
        }
      } catch (error) {
        setError('Error accessing accelerometer');
        setIsDetecting(false);
      }
    }

    return () => {
      if (window.DeviceMotionEvent) {
        window.removeEventListener('devicemotion', handleAccelerometer);
      }
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [isDetecting, threshold, lastUpdate, socket, permissionGranted]);

  const toggleDetection = async () => {
    if (!isDetecting) {
      setError(null);

      if (typeof DeviceMotionEvent.requestPermission === 'function') {
        try {
          const permission = await DeviceMotionEvent.requestPermission();
          if (permission !== 'granted') {
            setError('Motion sensor permission denied');
            return;
          }
          setPermissionGranted(true);
        } catch (err) {
          setError('Error requesting motion sensor permission');
          return;
        }
      } else {
        setPermissionGranted(true);
      }
    }

    setIsDetecting(!isDetecting);
  };

  const magnitude = Math.sqrt(
    (accelerometerData.x ?? 0) * (accelerometerData.x ?? 0) +
    (accelerometerData.y ?? 0) * (accelerometerData.y ?? 0) +
    (accelerometerData.z ?? 0) * (accelerometerData.z ?? 0)
  );

  return (
    <Paper
      elevation={3}
      sx={{
        p: 2,
        mb: 2,
        bgcolor: 'background.paper',
        borderRadius: 2,
      }}
    >
      <Typography variant="h6" gutterBottom>
        Pothole Detection
      </Typography>
      
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <Button
          variant="contained"
          color={isDetecting ? 'error' : 'primary'}
          startIcon={isDetecting ? <Stop /> : <PlayArrow />}
          onClick={toggleDetection}
          sx={{ mr: 2 }}
        >
          {isDetecting ? 'Stop Detection' : 'Start Detection'}
        </Button>
        
        {isDetecting && (
          <CircularProgress size={24} sx={{ ml: 2 }} />
        )}
      </Box>

      <Typography variant="subtitle2" gutterBottom>
        Detection Threshold
      </Typography>
      <Slider
        value={threshold}
        onChange={(event, newValue) => setThreshold(newValue)}
        min={5}
        max={30}
        step={1}
        valueLabelDisplay="auto"
        sx={{ mb: 2 }}
      />
      <Typography variant="body2" gutterBottom>
        Current Threshold: {threshold} m/s²
      </Typography>

      <Typography variant="subtitle2" gutterBottom>
        Current Acceleration
      </Typography>
      <Box sx={{ mb: 2 }}>
        <Typography variant="body2">
          X: {(accelerometerData.x ?? 0).toFixed(2)} m/s²
        </Typography>
        <Typography variant="body2">
          Y: {(accelerometerData.y ?? 0).toFixed(2)} m/s²
        </Typography>
        <Typography variant="body2">
          Z: {(accelerometerData.z ?? 0).toFixed(2)} m/s²
        </Typography>
      </Box>

      <Typography variant="subtitle2" gutterBottom>
        Detection Level
      </Typography>
      <LinearProgress
        variant="determinate"
        value={(magnitude / threshold) * 100}
        sx={{
          height: 8,
          borderRadius: 4,
          bgcolor: 'grey.800',
          '& .MuiLinearProgress-bar': {
            bgcolor: magnitude > threshold ? 'error.main' : 'primary.main',
          },
        }}
      />
    </Paper>
  );
};

export default PotholeDetector;
