import { truth } from "./lib";
import { checkRateLimit } from "./ratelimit";

console.log("background script loaded");

// Create context menu item when extension is installed
chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "factCheckSelection",
    title: "Is this true?",
    contexts: ["selection"],
  });
});

// Handle context menu clicks
chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (
    info.menuItemId === "factCheckSelection" &&
    info.selectionText &&
    tab?.id
  ) {
    // Send the selected text to the content script
    chrome.tabs.sendMessage(tab.id, {
      type: "FACT_CHECK_REQUEST",
      text: info.selectionText,
    });
  }
});

// Handle fact-checking requests from content script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "PROCESS_FACT_CHECK") {
    const pageInfo = message.data;
    console.log("Processing fact check:", pageInfo);

    // Check rate limit before processing
    checkRateLimit().then(async (isAllowed) => {
      if (!isAllowed) {
        sendResponse({
          error:
            "Limit reached. Need more? <a href='https://x.com/NathanpmYoung'>@NathanpmYoung</a> on X",
        });
        return;
      }

      // If within rate limit, proceed with fact checking
      try {
        const result = await truth(pageInfo);
        console.log("Fact check result:", result);
        sendResponse({
          result: JSON.stringify(result, null, 2),
        });
      } catch (error) {
        console.error("Fact check error:", error);
        sendResponse({
          error: "An error occurred while fact checking.",
        });
      }
    });

    // Return true to indicate we will send a response asynchronously
    return true;
  }
});
