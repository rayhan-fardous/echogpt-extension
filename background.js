/**
 * EchoGPT Background Service Worker (Manifest V3)
 */

// Initialize Context Menus and Storage Defaults
chrome.runtime.onInstalled.addListener(() => {
  // Context menus for selected text
  chrome.contextMenus.create({
    id: "echogpt-ask-selection",
    title: "Ask EchoGPT about '%s'",
    contexts: ["selection"]
  });

  chrome.contextMenus.create({
    id: "echogpt-summarize-page",
    title: "Summarize this page with EchoGPT",
    contexts: ["page"]
  });

  chrome.contextMenus.create({
    id: "echogpt-translate-selection",
    title: "Translate selection with EchoGPT",
    contexts: ["selection"]
  });

  // Default settings
  chrome.storage.local.get(["settings"], (res) => {
    if (!res.settings) {
      chrome.storage.local.set({
        settings: {
          defaultModel: "echogpt",
          theme: "light",
          enableWebSearch: false,
          openSidePanelOnAction: false,
          apiKeys: {
            openai: "",
            anthropic: "",
            gemini: "",
            groq: "",
            ollamaUrl: "http://localhost:11434"
          }
        }
      });
    }
  });
});

// Handle Context Menu clicks
chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  if (!tab || !tab.id) return;

  // Open side panel for the active tab
  if (chrome.sidePanel && chrome.sidePanel.open) {
    try {
      await chrome.sidePanel.open({ tabId: tab.id });
    } catch (e) {
      console.warn("Could not open sidePanel directly:", e);
    }
  }

  // Allow sidepanel time to mount if needed, then dispatch message
  setTimeout(() => {
    chrome.runtime.sendMessage({
      type: "CONTEXT_MENU_ACTION",
      menuItemId: info.menuItemId,
      selectionText: info.selectionText || "",
      pageUrl: tab.url || "",
      pageTitle: tab.title || ""
    }).catch(() => {
      // Side panel might not have listener registered yet, save to pending context
      chrome.storage.local.set({
        pendingContextAction: {
          menuItemId: info.menuItemId,
          selectionText: info.selectionText || "",
          pageUrl: tab.url || "",
          pageTitle: tab.title || "",
          timestamp: Date.now()
        }
      });
    });
  }, 350);
});

// Message listener for coordinating side panel and popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "OPEN_SIDE_PANEL") {
    const tabId = message.tabId || (sender.tab && sender.tab.id);
    if (tabId && chrome.sidePanel && chrome.sidePanel.open) {
      chrome.sidePanel.open({ tabId }).then(() => {
        sendResponse({ success: true });
      }).catch((err) => {
        sendResponse({ success: false, error: err.message });
      });
      return true;
    }
    sendResponse({ success: false, error: "No valid tabId or sidePanel API" });
  }

  if (message.type === "GET_ACTIVE_TAB_INFO") {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs && tabs[0]) {
        sendResponse({ tab: tabs[0] });
      } else {
        sendResponse({ tab: null });
      }
    });
    return true;
  }
});
