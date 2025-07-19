import React from "react";
import { Box, Typography, Button } from "@mui/material";
import { CloudOff as OfflineIcon } from "@mui/icons-material";

const OfflinePage = () => {
  return (
    <Box
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      minHeight="100vh"
      textAlign="center"
      p={3}
    >
      <OfflineIcon style={{ fontSize: 80, color: "#9e9e9e" }} />
      <Typography variant="h4" gutterBottom>
        You're offline
      </Typography>
      <Typography variant="body1" color="textSecondary" paragraph>
        AlgoTasker needs an internet connection for full functionality.
      </Typography>
      <Typography variant="body2" color="textSecondary">
        Some features may be limited while offline.
      </Typography>
    </Box>
  );
};

export default OfflinePage;
