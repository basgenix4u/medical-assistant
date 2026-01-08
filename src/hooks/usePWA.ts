// src/hooks/usePWA.ts

"use client";

import { useState, useEffect } from "react";

interface PWAStatus {
  isInstalled: boolean;
  isOnline: boolean;
  isUpdateAvailable: boolean;
  canInstall: boolean;
}

export function usePWA() {
  const [status, setStatus] = useState<PWAStatus>({
    isInstalled: false,
    isOnline: true,
    isUpdateAvailable: false,
    canInstall: false,
  });

  useEffect(() => {
    // Check if installed
    const isInstalled = window.matchMedia("(display-mode: standalone)").matches;
    
    // Check online status
    const isOnline = navigator.onLine;

    // eslint-disable-next-line react-hooks/set-state-in-effect
    setStatus((prev) => ({
      ...prev,
      isInstalled,
      isOnline,
    }));

    // Listen for online/offline events
    const handleOnline = () => setStatus((prev) => ({ ...prev, isOnline: true }));
    const handleOffline = () => setStatus((prev) => ({ ...prev, isOnline: false }));

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    // Listen for install prompt
    const handleBeforeInstall = () => {
      setStatus((prev) => ({ ...prev, canInstall: true }));
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstall);

    // Register service worker
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("/sw.js")
        .then((registration) => {
          console.log("SW registered:", registration);

          // Check for updates
          registration.addEventListener("updatefound", () => {
            const newWorker = registration.installing;
            if (newWorker) {
              newWorker.addEventListener("statechange", () => {
                if (newWorker.state === "installed" && navigator.serviceWorker.controller) {
                  setStatus((prev) => ({ ...prev, isUpdateAvailable: true }));
                }
              });
            }
          });
        })
        .catch((error) => {
          console.error("SW registration failed:", error);
        });
    }

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
      window.removeEventListener("beforeinstallprompt", handleBeforeInstall);
    };
  }, []);

  const updateApp = () => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.getRegistration().then((registration) => {
        if (registration?.waiting) {
          registration.waiting.postMessage({ type: "SKIP_WAITING" });
          window.location.reload();
        }
      });
    }
  };

  return { ...status, updateApp };
}