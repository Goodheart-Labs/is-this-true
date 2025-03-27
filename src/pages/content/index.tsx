import { createRoot } from "react-dom/client";
import React, { useState, useEffect } from "react";
import FactCheckPopover from "./components/FactCheckPopover";
import styles from "./style.css?inline"; // Import CSS as a string using Vite's `?inline` flag

const App: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [selectedText, setSelectedText] = useState("");
  const [result, setResult] = useState<string | null>(null);

  const handleClose = () => {
    setIsVisible(false);
  };

  const handleAnimationComplete = () => {
    // Reset state after animation completes
    setSelectedText("");
    setResult(null);
  };

  useEffect(() => {
    // Listen for messages from the background script
    const messageListener = (message: any) => {
      if (message.type === "FACT_CHECK_REQUEST") {
        const pageInfo = {
          title: document.title,
          url: window.location.href,
          text: message.text,
        };

        // Reset state for new fact check
        setResult(null);
        setSelectedText(message.text);
        setIsVisible(true);

        chrome.runtime.sendMessage(
          { type: "PROCESS_FACT_CHECK", data: pageInfo },
          (response) => {
            setResult(response?.result || "No result available");
          }
        );
      }
    };

    chrome.runtime.onMessage.addListener(messageListener);

    return () => {
      chrome.runtime.onMessage.removeListener(messageListener);
    };
  }, []);

  return (
    <FactCheckPopover
      isVisible={isVisible}
      selectedText={selectedText}
      result={result}
      onClose={handleClose}
      onAnimationComplete={handleAnimationComplete}
    />
  );
};

// Create Shadow DOM container
const shadowHost = document.createElement("div");
document.body.appendChild(shadowHost);
const shadowRoot = shadowHost.attachShadow({ mode: "open" });

// Inject styles inside Shadow DOM
const style = document.createElement("style");
style.textContent = styles;
shadowRoot.appendChild(style);

// Create mount point inside Shadow DOM
const mountPoint = document.createElement("div");
shadowRoot.appendChild(mountPoint);

// Render React app inside Shadow DOM
const root = createRoot(mountPoint);
root.render(<App />);
