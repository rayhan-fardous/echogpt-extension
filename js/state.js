/**
 * EchoGPT State Management
 * Persistent reactive store backed by chrome.storage.local (with localStorage fallback)
 */

const STORAGE_KEY = "echogpt_store_v1";

const defaultState = {
  activeView: "viewChat",
  activeModelId: "echogpt",
  enableWebSearch: false,
  theme: "light",
  attachedContext: null, // e.g. { title, url, tokenCount, cleanText }
  currentConversationId: null,
  conversations: [],
  settings: {
    theme: "light",
    defaultModel: "echogpt",
    apiKeys: {
      openai: "",
      anthropic: "",
      gemini: "",
      ollamaUrl: "http://localhost:11434"
    }
  }
};

class StateStore {
  constructor() {
    this.state = { ...defaultState };
    this.listeners = new Set();
    this.initPromise = this.load();
  }

  async load() {
    return new Promise((resolve) => {
      if (typeof chrome !== "undefined" && chrome.storage && chrome.storage.local) {
        chrome.storage.local.get([STORAGE_KEY], (result) => {
          if (result && result[STORAGE_KEY]) {
            this.state = { ...this.state, ...result[STORAGE_KEY] };
          } else {
            this.seedInitialConversation();
          }
          resolve(this.state);
        });
      } else {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (raw) {
          try {
            this.state = { ...this.state, ...JSON.parse(raw) };
          } catch (e) {
            this.seedInitialConversation();
          }
        } else {
          this.seedInitialConversation();
        }
        resolve(this.state);
      }
    });
  }

  seedInitialConversation() {
    const initConv = {
      id: "conv_" + Date.now(),
      title: "Welcome to EchoGPT",
      createdAt: Date.now(),
      pinned: false,
      messages: []
    };
    this.state.conversations = [initConv];
    this.state.currentConversationId = initConv.id;
    this.save();
  }

  save() {
    if (typeof chrome !== "undefined" && chrome.storage && chrome.storage.local) {
      chrome.storage.local.set({ [STORAGE_KEY]: this.state });
    } else {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.state));
    }
    this.notify();
  }

  getState() {
    return this.state;
  }

  setState(updates) {
    this.state = { ...this.state, ...updates };
    this.save();
  }

  subscribe(listener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  notify() {
    for (const listener of this.listeners) {
      try {
        listener(this.state);
      } catch (err) {
        console.error("State listener error:", err);
      }
    }
  }

  getCurrentConversation() {
    return this.state.conversations.find(c => c.id === this.state.currentConversationId) || null;
  }

  addMessageToCurrent(message) {
    const current = this.getCurrentConversation();
    if (!current) {
      this.createNewConversation(message.content.slice(0, 30));
    }
    const conv = this.getCurrentConversation();
    if (conv) {
      conv.messages.push({
        id: "msg_" + Date.now() + "_" + Math.random().toString(36).substr(2, 4),
        timestamp: Date.now(),
        ...message
      });
      // Update title from first user prompt if still default
      if (conv.messages.length === 1 && message.role === "user") {
        conv.title = message.content.slice(0, 32) + (message.content.length > 32 ? "..." : "");
      }
      this.save();
    }
  }

  createNewConversation(initialTitle = "New Chat") {
    const newConv = {
      id: "conv_" + Date.now(),
      title: initialTitle,
      createdAt: Date.now(),
      pinned: false,
      messages: []
    };
    this.state.conversations.unshift(newConv);
    this.state.currentConversationId = newConv.id;
    this.state.attachedContext = null;
    this.save();
    return newConv;
  }

  deleteConversation(id) {
    this.state.conversations = this.state.conversations.filter(c => c.id !== id);
    if (this.state.currentConversationId === id) {
      if (this.state.conversations.length > 0) {
        this.state.currentConversationId = this.state.conversations[0].id;
      } else {
        this.seedInitialConversation();
      }
    }
    this.save();
  }

  togglePinConversation(id) {
    const conv = this.state.conversations.find(c => c.id === id);
    if (conv) {
      conv.pinned = !conv.pinned;
      this.save();
    }
  }
}

export const store = new StateStore();
