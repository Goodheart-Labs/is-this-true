import { truth } from "./lib";

console.log("background script loaded");

// Create context menu item when extension is installed
chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "factCheckSelection",
    title: "Fact Check This",
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

    // Call our truth function and send back the result
    truth(pageInfo).then((result) => {
      console.log("Fact check result:", result);
      sendResponse({
        result: JSON.stringify(result, null, 2),
      });
    });

    // Return true to indicate we will send a response asynchronously
    return true;
  }
});
