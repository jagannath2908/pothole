import React, { useState, useEffect } from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { Box, Container, Typography, Paper, Grid } from '@mui/material';
import Map from './components/Map';
import PotholeList from './components/PotholeList';
import PotholeDetector from './components/PotholeDetector';
import io from 'socket.io-client';

const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#00ff9f',
    },
    secondary: {
      main: '#ff3366',
    },
  },
});

const socket = io('http://localhost:5000');

function App() {
  const [potholes, setPotholes] = useState([]);
  const [isDetecting, setIsDetecting] = useState(false);

  useEffect(() => {
    // Listen for new potholes
    socket.on('new-pothole', (pothole) => {
      setPotholes((prevPotholes) => [pothole, ...prevPotholes]);
    });

    // Fetch existing potholes
    fetch('http://localhost:5000/api/potholes')
      .then((res) => res.json())
      .then((data) => {
        // Ensure data is an array
        setPotholes(Array.isArray(data) ? data : []);
      })
      .catch((error) => {
        console.error('Error fetching potholes:', error);
        setPotholes([]);
      });

    return () => {
      socket.disconnect();
    };
  }, []);

  return (
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />
      <Box sx={{ flexGrow: 1, minHeight: '100vh', bgcolor: 'background.default' }}>
        <Container maxWidth="xl" sx={{ py: 4 }}>
          <Typography
            variant="h2"
            component="h1"
            gutterBottom
            sx={{
              fontWeight: 'bold',
              background: 'linear-gradient(45deg, #00ff9f 30%, #21CBF3 90%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            Pothole Detector
          </Typography>
          
          <Grid container spacing={3}>
            <Grid item xs={12} md={8}>
              <Paper
                elevation={3}
                sx={{
                  p: 2,
                  height: '70vh',
                  bgcolor: 'background.paper',
                  borderRadius: 2,
                }}
              >
                <Map potholes={potholes} />
              </Paper>
            </Grid>
            
            <Grid item xs={12} md={4}>
              <Paper
                elevation={3}
                sx={{
                  p: 2,
                  height: '70vh',
                  bgcolor: 'background.paper',
                  borderRadius: 2,
                  overflow: 'auto',
                }}
              >
                <PotholeDetector
                  isDetecting={isDetecting}
                  setIsDetecting={setIsDetecting}
                  socket={socket}
                />
                <PotholeList potholes={potholes} />
              </Paper>
            </Grid>
          </Grid>
        </Container>
      </Box>
    </ThemeProvider>
  );
}

export default App;
