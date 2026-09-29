/**
 * EchoGPT Settings View Controller
 */

import { store } from "../state.js";

export class SettingsViewController {
  constructor() {
    this.themeSelect = document.getElementById("settingsThemeSelect");
    this.defaultModelSelect = document.getElementById("settingsDefaultModelSelect");
    this.openAiInput = document.getElementById("apiKeyOpenAI");
    this.anthropicInput = document.getElementById("apiKeyAnthropic");
    this.geminiInput = document.getElementById("apiKeyGemini");
    this.ollamaInput = document.getElementById("ollamaHostUrl");
    this.saveBtn = document.getElementById("btnSaveSettings");
    this.clearHistoryBtn = document.getElementById("btnClearAllHistory");
  }

  init() {
    if (!this.saveBtn) return;

    this.populate();

    this.themeSelect?.addEventListener("change", (e) => {
      this.applyTheme(e.target.value);
    });

    this.saveBtn.addEventListener("click", () => this.save());

    this.clearHistoryBtn?.addEventListener("click", () => {
      if (confirm("Are you sure you want to delete all chat conversations? This cannot be undone.")) {
        store.setState({ conversations: [] });
        store.seedInitialConversation();
        this.showToast("All chat history cleared.");
      }
    });
  }

  populate() {
    const state = store.getState();
    const settings = state.settings || {};

    if (this.themeSelect && state.theme) {
      this.themeSelect.value = state.theme;
      this.applyTheme(state.theme);
    }

    if (this.defaultModelSelect && state.activeModelId) {
      this.defaultModelSelect.value = state.activeModelId;
    }

    if (settings.apiKeys) {
      if (this.openAiInput) this.openAiInput.value = settings.apiKeys.openai || "";
      if (this.anthropicInput) this.anthropicInput.value = settings.apiKeys.anthropic || "";
      if (this.geminiInput) this.geminiInput.value = settings.apiKeys.gemini || "";
      if (this.ollamaInput) this.ollamaInput.value = settings.apiKeys.ollamaUrl || "http://localhost:11434";
    }
  }

  applyTheme(theme) {
    document.documentElement.setAttribute("data-theme", theme);
    store.setState({ theme });
  }

  save() {
    const updatedSettings = {
      theme: this.themeSelect.value,
      defaultModel: this.defaultModelSelect.value,
      apiKeys: {
        openai: this.openAiInput.value.trim(),
        anthropic: this.anthropicInput.value.trim(),
        gemini: this.geminiInput.value.trim(),
        ollamaUrl: this.ollamaInput.value.trim()
      }
    };

    store.setState({
      settings: updatedSettings,
      theme: updatedSettings.theme,
      activeModelId: updatedSettings.defaultModel
    });

    this.applyTheme(updatedSettings.theme);
    this.showToast("Settings saved successfully.");
  }

  showToast(msg) {
    const container = document.getElementById("toastContainer");
    if (!container) return;
    const toast = document.createElement("div");
    toast.className = "toast";
    toast.textContent = msg;
    container.appendChild(toast);
    setTimeout(() => toast.classList.add("show"), 20);
    setTimeout(() => {
      toast.classList.remove("show");
      setTimeout(() => toast.remove(), 250);
    }, 2500);
  }
}
