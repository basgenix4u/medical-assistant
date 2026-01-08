// src/components/pwa/InstallPrompt.tsx

"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Download, X, Smartphone, Monitor } from "lucide-react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export default function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    // Check if already installed
    const standalone = window.matchMedia("(display-mode: standalone)").matches;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsStandalone(standalone);

    // Check if iOS
    const iOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    setIsIOS(iOS);

    // Check if user dismissed before (don't show for 7 days)
    const dismissed = localStorage.getItem("pwa-prompt-dismissed");
    if (dismissed) {
      const dismissedDate = new Date(dismissed);
      const daysSinceDismissed = (Date.now() - dismissedDate.getTime()) / (1000 * 60 * 60 * 24);
      if (daysSinceDismissed < 7) {
        return;
      }
    }

    // Listen for beforeinstallprompt event
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      
      // Show prompt after 30 seconds on site
      setTimeout(() => {
        setShowPrompt(true);
      }, 30000);
    };

    window.addEventListener("beforeinstallprompt", handler);

    // For iOS, show custom instructions after delay
    if (iOS && !standalone) {
      setTimeout(() => {
        setShowPrompt(true);
      }, 60000); // Show after 1 minute for iOS
    }

    return () => {
      window.removeEventListener("beforeinstallprompt", handler);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === "accepted") {
      setShowPrompt(false);
      setDeferredPrompt(null);
    }
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    localStorage.setItem("pwa-prompt-dismissed", new Date().toISOString());
  };

  // Don't show if already installed
  if (isStandalone) return null;

  return (
    <AnimatePresence>
      {showPrompt && (
        <motion.div
          initial={{ opacity: 0, y: 100 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 100 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          style={{
            position: "fixed",
            bottom: "24px",
            left: "50%",
            transform: "translateX(-50%)",
            width: "calc(100% - 32px)",
            maxWidth: "420px",
            background: "var(--bg-tertiary)",
            borderRadius: "20px",
            padding: "20px",
            boxShadow: "0 10px 40px rgba(0,0,0,0.15)",
            border: "1px solid var(--border-light)",
            zIndex: 1000,
          }}
        >
          {/* Close Button */}
          <button
            onClick={handleDismiss}
            style={{
              position: "absolute",
              top: "12px",
              right: "12px",
              background: "none",
              border: "none",
              cursor: "pointer",
              padding: "8px",
              borderRadius: "8px",
              color: "var(--text-tertiary)",
            }}
          >
            <X size={20} />
          </button>

          <div style={{ display: "flex", gap: "16px", alignItems: "flex-start" }}>
            {/* Icon */}
            <div
              style={{
                width: "56px",
                height: "56px",
                borderRadius: "14px",
                background: "var(--primary)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <Download size={28} style={{ color: "white" }} />
            </div>

            {/* Content */}
            <div style={{ flex: 1 }}>
              <h3
                style={{
                  fontSize: "16px",
                  fontWeight: 600,
                  color: "var(--text-primary)",
                  marginBottom: "4px",
                }}
              >
                Install MedAssist
              </h3>
              <p
                style={{
                  fontSize: "13px",
                  color: "var(--text-tertiary)",
                  lineHeight: 1.5,
                  marginBottom: "16px",
                }}
              >
                Add to your home screen for quick access, offline support, and a better experience.
              </p>

              {isIOS ? (
                // iOS Instructions
                <div
                  style={{
                    background: "var(--bg-secondary)",
                    padding: "12px",
                    borderRadius: "10px",
                    fontSize: "13px",
                    color: "var(--text-secondary)",
                  }}
                >
                  <p style={{ marginBottom: "8px" }}>
                    <strong>To install on iOS:</strong>
                  </p>
                  <ol style={{ margin: 0, paddingLeft: "20px" }}>
                    <li>Tap the Share button in Safari</li>
                    <li>Scroll down and tap &quot;Add to Home Screen&quot;</li>
                    <li>Tap &quot;Add&quot; to confirm</li>
                  </ol>
                </div>
              ) : (
                // Android/Desktop Install Button
                <div style={{ display: "flex", gap: "10px" }}>
                  <button
                    onClick={handleInstall}
                    style={{
                      flex: 1,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "8px",
                      padding: "12px 16px",
                      fontSize: "14px",
                      fontWeight: 500,
                      background: "var(--primary)",
                      color: "white",
                      border: "none",
                      borderRadius: "10px",
                      cursor: "pointer",
                    }}
                  >
                    <Smartphone size={18} />
                    Install App
                  </button>
                  <button
                    onClick={handleDismiss}
                    style={{
                      padding: "12px 16px",
                      fontSize: "14px",
                      fontWeight: 500,
                      background: "var(--bg-secondary)",
                      color: "var(--text-secondary)",
                      border: "1px solid var(--border-light)",
                      borderRadius: "10px",
                      cursor: "pointer",
                    }}
                  >
                    Not Now
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Features */}
          <div
            style={{
              display: "flex",
              gap: "16px",
              marginTop: "16px",
              paddingTop: "16px",
              borderTop: "1px solid var(--border-light)",
            }}
          >
            {[
              { icon: "⚡", text: "Faster loading" },
              { icon: "📱", text: "Works offline" },
              { icon: "🔔", text: "Get reminders" },
            ].map((feature, i) => (
              <div
                key={i}
                style={{
                  flex: 1,
                  textAlign: "center",
                  fontSize: "12px",
                  color: "var(--text-tertiary)",
                }}
              >
                <span style={{ fontSize: "20px", display: "block", marginBottom: "4px" }}>
                  {feature.icon}
                </span>
                {feature.text}
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}