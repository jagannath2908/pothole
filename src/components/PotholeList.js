import React from 'react';
import {
  Box,
  Typography,
  List,
  ListItem,
  ListItemText,
  Divider,
  Paper,
} from '@mui/material';
import { Warning } from '@mui/icons-material';

const PotholeList = ({ potholes = [] }) => {
  const safePotholes = Array.isArray(potholes) ? potholes : [];

  return (
    <Paper
      elevation={3}
      sx={{
        p: 2,
        bgcolor: 'background.paper',
        borderRadius: 2,
      }}
    >
      <Typography variant="h6" gutterBottom>
        Detected Potholes
      </Typography>
      
      <List>
        {safePotholes.length === 0 ? (
          <ListItem>
            <ListItemText
              primary="No potholes detected yet"
              secondary="Start the detection to begin monitoring"
            />
          </ListItem>
        ) : (
          safePotholes.map((pothole, index) => (
            <React.Fragment key={index}>
              <ListItem>
                <ListItemText
                  primary={
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Warning color="error" sx={{ mr: 1 }} />
                      <Typography variant="subtitle1">
                        Intensity: {pothole.intensity.toFixed(2)} m/s²
                      </Typography>
                    </Box>
                  }
                  secondary={
                    <>
                      <Typography variant="body2" component="span">
                        Location: {pothole.latitude.toFixed(6)}, {pothole.longitude.toFixed(6)}
                      </Typography>
                      <br />
                      <Typography variant="body2" component="span" color="text.secondary">
                        Detected: {new Date(pothole.timestamp).toLocaleString()}
                      </Typography>
                    </>
                  }
                />
              </ListItem>
              {index < safePotholes.length - 1 && <Divider />}
            </React.Fragment>
          ))
        )}
      </List>
    </Paper>
  );
};

export default PotholeList; 