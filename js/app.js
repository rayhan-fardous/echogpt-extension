/**
 * EchoGPT Master App Entry Orchestrator
 */

import { store } from "./state.js";
import { ChatController } from "./chat.js";
import { PageReader } from "./page-reader.js";
import { HistoryController } from "./history.js";
import { WriteViewController } from "./views/write-view.js";
import { TranslateViewController } from "./views/translate-view.js";
import { CompareViewController } from "./views/compare-view.js";
import { ImageViewController, VideoViewController } from "./views/image-view.js";
import { SettingsViewController } from "./views/settings-view.js";
import { ModelModalController } from "./ui/model-modal.js";
import { SlashCommandsController, PromptEnhancer } from "./ui/slash-commands.js";

document.addEventListener("DOMContentLoaded", async () => {
  // 1. Wait for state hydration
  await store.initPromise;
  const currentTheme = store.getState().theme || "dark";
  document.documentElement.setAttribute("data-theme", currentTheme);

  // 2. Instantiate controllers
  const chatCtrl = new ChatController();
  const pageReader = new PageReader();
  const historyCtrl = new HistoryController();
  const writeCtrl = new WriteViewController();
  const translateCtrl = new TranslateViewController();
  const compareCtrl = new CompareViewController();
  const imageCtrl = new ImageViewController();
  const videoCtrl = new VideoViewController();
  const settingsCtrl = new SettingsViewController();
  const modelModalCtrl = new ModelModalController();

  chatCtrl.init();
  historyCtrl.init();
  writeCtrl.init();
  translateCtrl.init();
  compareCtrl.init();
  imageCtrl.init();
  videoCtrl.init();
  settingsCtrl.init();
  modelModalCtrl.init();

  // 3. Navigation Rail View Switching
  const railItems = document.querySelectorAll(".rail-item[data-view]");
  const viewContainers = document.querySelectorAll(".view-container");

  function switchView(targetViewId) {
    railItems.forEach(item => {
      item.classList.toggle("active", item.dataset.view === targetViewId);
    });

    viewContainers.forEach(container => {
      container.classList.toggle("active", container.id === targetViewId);
    });

    store.setState({ activeView: targetViewId });

    if (targetViewId === "viewRead") {
      pageReader.updateReadViewInfo();
    }
  }

  railItems.forEach(item => {
    item.addEventListener("click", () => {
      const viewId = item.dataset.view;
      if (viewId) switchView(viewId);
    });
  });

  // Keyboard Navigation Shortcuts (Alt+1 .. Alt+8)
  document.addEventListener("keydown", (e) => {
    if (e.altKey && !e.ctrlKey && !e.metaKey) {
      const num = parseInt(e.key, 10);
      const viewMap = {
        1: "viewChat",
        2: "viewWrite",
        3: "viewRead",
        4: "viewTranslate",
        5: "viewImage",
        6: "viewVideo",
        7: "viewCompare",
        8: "viewMcp"
      };
      if (viewMap[num]) {
        e.preventDefault();
        switchView(viewMap[num]);
      }
    }
  });

  // 4. Prompt Input & Auto-Resizing Textarea
  const textarea = document.getElementById("chatTextarea");
  const sendBtn = document.getElementById("btnSendMessage");
  const searchToggleBtn = document.getElementById("btnWebSearchToggle");
  const newChatBtn = document.getElementById("btnNewChat");

  function updateSendBtnState() {
    if (!sendBtn || !textarea) return;
    const hasText = textarea.value.trim().length > 0;
    sendBtn.classList.toggle("ready", hasText);
  }

  if (textarea) {
    textarea.addEventListener("input", () => {
      textarea.style.height = "auto";
      textarea.style.height = Math.min(textarea.scrollHeight, 120) + "px";
      updateSendBtnState();
    });

    textarea.addEventListener("keydown", (e) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        handleSendMessage();
      }
    });
  }

  if (sendBtn) {
    sendBtn.addEventListener("click", () => handleSendMessage());
  }

  function handleSendMessage() {
    if (!textarea) return;
    const text = textarea.value.trim();
    if (!text) return;
    textarea.value = "";
    textarea.style.height = "auto";
    updateSendBtnState();
    chatCtrl.sendUserPrompt(text);
  }

  // 5. Slash Commands & Prompt Enhancer
  const slashCtrl = new SlashCommandsController(textarea, () => updateSendBtnState());
  slashCtrl.init();

  const enhanceBtn = document.getElementById("btnToolEnhance");
  const enhancer = new PromptEnhancer(textarea, enhanceBtn);
  enhancer.init();

  // 6. Action Cards in Welcome View
  document.querySelectorAll(".action-card").forEach(card => {
    card.addEventListener("click", async () => {
      const action = card.dataset.action;
      if (action === "write") {
        switchView("viewWrite");
      } else if (action === "translate") {
        switchView("viewTranslate");
      } else if (action === "read-page") {
        const pageData = await pageReader.updateReadViewInfo();
        pageReader.attachToChatContext(pageData);
        textarea.value = `Summarize the active page "${pageData.title}" and highlight key takeaways.`;
        updateSendBtnState();
        textarea.focus();
      } else if (action === "image") {
        switchView("viewImage");
      } else if (action === "video") {
        switchView("viewVideo");
      } else if (action === "compare") {
        switchView("viewCompare");
      } else if (action === "mcp") {
        switchView("viewMcp");
      }
    });
  });

  // 7. Suggested Prompt Pills
  document.querySelectorAll(".prompt-suggestion-pill").forEach(pill => {
    pill.addEventListener("click", () => {
      const prompt = pill.dataset.prompt;
      if (prompt) chatCtrl.sendUserPrompt(prompt);
    });
  });

  // 8. New Chat Button
  if (newChatBtn) {
    newChatBtn.addEventListener("click", () => {
      store.createNewConversation();
      if (textarea) {
        textarea.value = "";
        textarea.focus();
      }
      switchView("viewChat");
    });
  }

  // 9. Web Search Toggle Button
  if (searchToggleBtn) {
    searchToggleBtn.addEventListener("click", () => {
      const current = store.getState().enableWebSearch;
      const next = !current;
      store.setState({ enableWebSearch: next });
      searchToggleBtn.classList.toggle("active", next);
    });
  }

  // 10. Secondary Read Page actions
  document.getElementById("btnExtractAndSummarize")?.addEventListener("click", () => {
    pageReader.generateSummary();
  });

  // 11. Expand to Side Panel Button (in popup.html)
  document.getElementById("btnExpandSidePanel")?.addEventListener("click", async () => {
    if (typeof chrome !== "undefined" && chrome.tabs && chrome.sidePanel) {
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (tabs && tabs[0]) {
          chrome.sidePanel.open({ tabId: tabs[0].id }).then(() => {
            window.close();
          }).catch(err => console.warn(err));
        }
      });
    } else {
      alert("Side Panel API is active in Chrome browser.");
    }
  });

  // 12. Check for pending context actions from context menus
  if (typeof chrome !== "undefined" && chrome.storage && chrome.storage.local) {
    chrome.storage.local.get(["pendingContextAction"], (res) => {
      if (res && res.pendingContextAction) {
        const action = res.pendingContextAction;
        if (action.selectionText) {
          switchView("viewChat");
          chatCtrl.sendUserPrompt(`Explain this selection: "${action.selectionText}"`);
        } else if (action.menuItemId === "echogpt-summarize-page") {
          switchView("viewRead");
          pageReader.generateSummary();
        }
        chrome.storage.local.remove(["pendingContextAction"]);
      }
    });

    // Also listen for real-time messages
    chrome.runtime.onMessage.addListener((msg) => {
      if (msg.type === "CONTEXT_MENU_ACTION") {
        if (msg.selectionText) {
          switchView("viewChat");
          chatCtrl.sendUserPrompt(`Explain this selection: "${msg.selectionText}"`);
        } else if (msg.menuItemId === "echogpt-summarize-page") {
          switchView("viewRead");
          pageReader.generateSummary();
        }
      }
    });
  }
});
