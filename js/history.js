/**
 * EchoGPT History Drawer Controller
 * Handles conversation search, time grouping, pinning, export, and deletion
 */

import { store } from "./state.js";

export class HistoryController {
  constructor() {
    this.drawer = document.getElementById("historyDrawer");
    this.openBtn = document.getElementById("btnHistoryDrawer");
    this.closeBtn = document.getElementById("btnCloseHistoryDrawer");
    this.searchInput = document.getElementById("historySearchInput");
    this.container = document.getElementById("historyItemsContainer");
    this.filterQuery = "";
  }

  init() {
    if (!this.drawer) return;

    this.openBtn?.addEventListener("click", () => this.open());
    this.closeBtn?.addEventListener("click", () => this.close());

    this.searchInput?.addEventListener("input", (e) => {
      this.filterQuery = e.target.value.toLowerCase();
      this.render();
    });

    store.subscribe(() => {
      if (this.drawer.classList.contains("open")) {
        this.render();
      }
    });
  }

  open() {
    this.drawer.classList.add("open");
    this.searchInput.value = "";
    this.filterQuery = "";
    this.render();
  }

  close() {
    this.drawer.classList.remove("open");
  }

  render() {
    const state = store.getState();
    const conversations = state.conversations || [];

    const filtered = conversations.filter(c => {
      if (!this.filterQuery) return true;
      const titleMatch = c.title.toLowerCase().includes(this.filterQuery);
      const msgMatch = (c.messages || []).some(m => m.content.toLowerCase().includes(this.filterQuery));
      return titleMatch || msgMatch;
    });

    if (filtered.length === 0) {
      this.container.innerHTML = `
        <div class="history-empty-state">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <circle cx="12" cy="12" r="10"></circle>
            <polyline points="12 6 12 12 16 14"></polyline>
          </svg>
          <span>No conversations found</span>
        </div>
      `;
      return;
    }

    // Split pinned vs recent
    const pinned = filtered.filter(c => c.pinned);
    const regular = filtered.filter(c => !c.pinned);

    let html = "";

    if (pinned.length > 0) {
      html += `<div class="history-group-title">⭐ Pinned</div><div class="history-items-group">`;
      pinned.forEach(c => {
        html += this.renderItemHtml(c, state.currentConversationId);
      });
      html += `</div>`;
    }

    if (regular.length > 0) {
      html += `<div class="history-group-title" style="margin-top: 8px;">Recent Chats</div><div class="history-items-group">`;
      regular.forEach(c => {
        html += this.renderItemHtml(c, state.currentConversationId);
      });
      html += `</div>`;
    }

    this.container.innerHTML = html;
    this.bindItemActions();
  }

  renderItemHtml(conv, currentId) {
    const isActive = conv.id === currentId;
    const msgCount = (conv.messages || []).length;
    const dateStr = new Date(conv.createdAt).toLocaleDateString([], { month: "short", day: "numeric" });

    return `
      <div class="history-item ${isActive ? "active" : ""}" data-id="${conv.id}">
        <div class="history-item-left">
          <span class="history-item-title">${this.escape(conv.title)}</span>
          <span class="history-item-meta">${dateStr} · ${msgCount} msgs</span>
        </div>
        <div class="history-item-actions">
          <button class="btn-item-action btn-pin-conv" data-id="${conv.id}" title="${conv.pinned ? "Unpin" : "Pin"}">
            ${conv.pinned ? "★" : "☆"}
          </button>
          <button class="btn-item-action btn-export-conv" data-id="${conv.id}" title="Export Markdown">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
              <polyline points="7 10 12 15 17 10"></polyline>
              <line x1="12" y1="15" x2="12" y2="3"></line>
            </svg>
          </button>
          <button class="btn-item-action btn-del-conv" data-id="${conv.id}" title="Delete">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="3 6 5 6 21 6"></polyline>
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
            </svg>
          </button>
        </div>
      </div>
    `;
  }

  bindItemActions() {
    // Select conversation
    this.container.querySelectorAll(".history-item").forEach(item => {
      item.addEventListener("click", (e) => {
        if (e.target.closest(".history-item-actions")) return;
        const id = item.dataset.id;
        store.setState({ currentConversationId: id, activeView: "viewChat" });
        this.close();
      });
    });

    // Pin toggle
    this.container.querySelectorAll(".btn-pin-conv").forEach(btn => {
      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        store.togglePinConversation(btn.dataset.id);
        this.render();
      });
    });

    // Export markdown
    this.container.querySelectorAll(".btn-export-conv").forEach(btn => {
      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        this.exportConversation(btn.dataset.id);
      });
    });

    // Delete
    this.container.querySelectorAll(".btn-del-conv").forEach(btn => {
      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        if (confirm("Delete this conversation?")) {
          store.deleteConversation(btn.dataset.id);
          this.render();
        }
      });
    });
  }

  exportConversation(id) {
    const conv = store.getState().conversations.find(c => c.id === id);
    if (!conv) return;

    let md = `# ${conv.title}\n\n*Exported from EchoGPT on ${new Date().toLocaleString()}*\n\n---\n\n`;
    (conv.messages || []).forEach(m => {
      const role = m.role === "user" ? "User" : "EchoGPT";
      md += `### ${role}:\n\n${m.content}\n\n`;
    });

    const blob = new Blob([md], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${conv.title.replace(/[^a-z0-9]/gi, "_").toLowerCase()}.md`;
    a.click();
    URL.revokeObjectURL(url);
  }

  escape(str) {
    return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  }
}
