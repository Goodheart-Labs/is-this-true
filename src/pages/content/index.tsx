import { createRoot } from "react-dom/client";
import React, { useState, useEffect } from "react";
import FactCheckPopover from "./components/FactCheckPopover";

import styles from "./style.css?inline"; // Import CSS as a string using Vite's `?inline` flag
import { initPostHog, getPostHog } from "./posthog";

const options = {
  api_host: import.meta.env.VITE_PUBLIC_POSTHOG_HOST,
};

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
            const result = response?.result || "No result available";
            setResult(result);

            const posthog = getPostHog();

            // Track the fact check event with both request and response data
            posthog?.capture("fact_check_completed", {
              request_text: pageInfo.text,
              page_title: pageInfo.title,
              page_url: pageInfo.url,
              response: result,
              timestamp: new Date().toISOString(),
            });
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

function AppWithProviders() {
  useEffect(() => {
    initPostHog();
  }, []);

  return <App />;
}

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
root.render(<AppWithProviders />);
