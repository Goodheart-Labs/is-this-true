import { createRoot } from "react-dom/client";
import React, { useState, useEffect } from "react";
import FactCheckPopover from "./components/FactCheckPopover";
import "./style.css";

const App: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [selectedText, setSelectedText] = useState("");
  const [result, setResult] = useState<string | null>(null);

  useEffect(() => {
    // Listen for messages from the background script
    const messageListener = (message: any) => {
      if (message.type === "FACT_CHECK_REQUEST") {
        const pageInfo = {
          title: document.title,
          url: window.location.href,
          text: message.text,
        };

        // Update UI state
        setSelectedText(message.text);
        setIsVisible(true);
        setResult(null);

        // Send to background script for processing
        chrome.runtime.sendMessage(
          { type: "PROCESS_FACT_CHECK", data: pageInfo },
          (response) => {
            setResult(response?.result || "No result available");
          }
        );
      }
    };

    chrome.runtime.onMessage.addListener(messageListener);

    // Cleanup listener on unmount
    return () => {
      chrome.runtime.onMessage.removeListener(messageListener);
    };
  }, []); // Empty dependency array since we don't use any external values

  return (
    <FactCheckPopover
      isVisible={isVisible}
      selectedText={selectedText}
      result={result}
    />
  );
};

// Create root element
const div = document.createElement("div");
div.id = "__fact_check_root";
document.body.appendChild(div);

// Render the app
const rootContainer = document.querySelector("#__fact_check_root");
if (!rootContainer) throw new Error("Can't find Content root element");
const root = createRoot(rootContainer);
root.render(<App />);

// Create a reference to our React component's setState functions
let setIsVisibleRef: (value: boolean) => void;
let setSelectedTextRef: (value: string) => void;
let setResultRef: (value: string | null) => void;

// Function to update the references
export function setStateRefs(
  setIsVisible: (value: boolean) => void,
  setSelectedText: (value: string) => void,
  setResult: (value: string | null) => void
) {
  setIsVisibleRef = setIsVisible;
  setSelectedTextRef = setSelectedText;
  setResultRef = setResult;
}
