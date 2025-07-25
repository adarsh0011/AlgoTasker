import React, { useState, useEffect } from "react";
import { Box, Chip, Fade } from "@mui/material";
import {
  WifiOff as OfflineIcon,
  Wifi as OnlineIcon,
} from "@mui/icons-material";

const OfflineIndicator = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [showIndicator, setShowIndicator] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setShowIndicator(true);
      // Hide the "back online" indicator after 3 seconds
      setTimeout(() => setShowIndicator(false), 3000);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setShowIndicator(true);
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    // Show indicator if already offline
    if (!navigator.onLine) {
      setShowIndicator(true);
    }

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  return (
    <Fade in={showIndicator}>
      <Box position="fixed" top={16} right={16} zIndex={9999}>
        <Chip
          icon={isOnline ? <OnlineIcon /> : <OfflineIcon />}
          label={isOnline ? "Back Online" : "Offline"}
          color={isOnline ? "success" : "warning"}
          variant="filled"
        />
      </Box>
    </Fade>
  );
};

export default OfflineIndicator;
