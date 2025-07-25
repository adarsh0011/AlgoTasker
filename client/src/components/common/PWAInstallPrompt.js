import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  IconButton,
} from "@mui/material";
import {
  GetApp as InstallIcon,
  Close as CloseIcon,
  PhoneAndroid as MobileIcon,
  Computer as DesktopIcon,
} from "@mui/icons-material";

const PWAInstallPrompt = () => {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Check if app is already installed
    if (
      window.matchMedia("(display-mode: standalone)").matches ||
      window.navigator.standalone === true
    ) {
      setIsInstalled(true);
      return;
    }

    // Listen for the beforeinstallprompt event
    const handleBeforeInstallPrompt = (e) => {
      console.log("beforeinstallprompt event fired");
      e.preventDefault();
      setDeferredPrompt(e);

      // Show install prompt after a delay
      setTimeout(() => {
        if (!localStorage.getItem("pwa-install-dismissed")) {
          setShowInstallPrompt(true);
        }
      }, 5000);
    };

    // Listen for app installed event
    const handleAppInstalled = () => {
      console.log("PWA was installed");
      setIsInstalled(true);
      setShowInstallPrompt(false);
      setDeferredPrompt(null);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleAppInstalled);

    return () => {
      window.removeEventListener(
        "beforeinstallprompt",
        handleBeforeInstallPrompt
      );
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    // Show the install prompt
    deferredPrompt.prompt();

    // Wait for the user to respond to the prompt
    const { outcome } = await deferredPrompt.userChoice;
    console.log(`User response to the install prompt: ${outcome}`);

    if (outcome === "accepted") {
      console.log("User accepted the install prompt");
    } else {
      console.log("User dismissed the install prompt");
      localStorage.setItem("pwa-install-dismissed", "true");
    }

    setDeferredPrompt(null);
    setShowInstallPrompt(false);
  };

  const handleDismiss = () => {
    setShowInstallPrompt(false);
    localStorage.setItem("pwa-install-dismissed", "true");
  };

  if (isInstalled || !showInstallPrompt) {
    return null;
  }

  return (
    <Dialog
      open={showInstallPrompt}
      onClose={handleDismiss}
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          Install AlgoTasker
          <IconButton onClick={handleDismiss} size="small">
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>
      <DialogContent>
        <Box textAlign="center" mb={2}>
          <InstallIcon sx={{ fontSize: 64, color: "primary.main", mb: 2 }} />
          <Typography variant="h6" gutterBottom>
            Install AlgoTasker for a better experience!
          </Typography>
          <Typography variant="body2" color="textSecondary" paragraph>
            Get quick access to your tasks, work offline, and receive
            notifications by installing AlgoTasker on your device.
          </Typography>
        </Box>

        <Box display="flex" justifyContent="space-around" mb={2}>
          <Box textAlign="center">
            <MobileIcon sx={{ fontSize: 32, color: "primary.main", mb: 1 }} />
            <Typography variant="body2">Works on mobile</Typography>
          </Box>
          <Box textAlign="center">
            <DesktopIcon sx={{ fontSize: 32, color: "primary.main", mb: 1 }} />
            <Typography variant="body2">Works on desktop</Typography>
          </Box>
        </Box>

        <Typography variant="body2" color="textSecondary">
          Features you'll get:
        </Typography>
        <ul style={{ margin: "8px 0", paddingLeft: "20px" }}>
          <li>
            <Typography variant="body2">
              Offline access to your tasks
            </Typography>
          </li>
          <li>
            <Typography variant="body2">
              Push notifications for reminders
            </Typography>
          </li>
          <li>
            <Typography variant="body2">
              Quick access from home screen
            </Typography>
          </li>
          <li>
            <Typography variant="body2">Faster loading times</Typography>
          </li>
        </ul>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleDismiss} color="inherit">
          Maybe Later
        </Button>
        <Button
          onClick={handleInstallClick}
          variant="contained"
          startIcon={<InstallIcon />}
        >
          Install App
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default PWAInstallPrompt;
