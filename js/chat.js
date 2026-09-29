/**
 * EchoGPT Chat Controller
 * Manages message lists, markdown rendering, code copying, and streaming UI
 */

import { store } from "./state.js";
import { streamAIResponse, getModelById } from "./models.js";

export class ChatController {
  constructor() {
    this.scrollArea = document.getElementById("chatScrollArea");
    this.welcomeSection = document.getElementById("welcomeSection");
    this.messageList = document.getElementById("messageList");
    this.isStreaming = false;
  }

  init() {
    this.renderCurrentConversation();
    store.subscribe(() => {
      this.renderCurrentConversation();
    });
  }

  renderCurrentConversation() {
    const conv = store.getCurrentConversation();
    if (!conv || !conv.messages || conv.messages.length === 0) {
      this.welcomeSection.style.display = "flex";
      this.messageList.style.display = "none";
      this.messageList.innerHTML = "";
      return;
    }

    this.welcomeSection.style.display = "none";
    this.messageList.style.display = "flex";
    this.messageList.innerHTML = "";

    conv.messages.forEach(msg => {
      this.appendMessageElement(msg);
    });

    this.scrollToBottom();
  }

  appendMessageElement(msg) {
    const item = document.createElement("div");
    item.className = `chat-message ${msg.role === "user" ? "user-message" : "assistant-message"}`;
    item.id = msg.id;

    if (msg.role === "user") {
      item.innerHTML = `
        <div class="user-bubble">${this.escapeHtml(msg.content)}</div>
      `;
    } else {
      const model = getModelById(msg.modelId || store.getState().activeModelId);
      item.innerHTML = `
        <div class="assistant-card">
          <div class="assistant-meta">
            <div class="assistant-badge">
              <span class="model-dot" style="background-color: ${model.color};"></span>
              <span>${model.name}</span>
            </div>
          </div>
          <div class="assistant-body">${this.renderMarkdown(msg.content)}</div>
          <div class="assistant-actions">
            <button class="btn-msg-action btn-copy-msg" data-text="${encodeURIComponent(msg.content)}" title="Copy text">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
              </svg>
              <span>Copy</span>
            </button>
          </div>
        </div>
      `;
    }

    this.messageList.appendChild(item);
    this.bindCopyButtons(item);
  }

  async sendUserPrompt(promptText) {
    if (!promptText || !promptText.trim() || this.isStreaming) return;
    const cleanPrompt = promptText.trim();
    const state = store.getState();

    // 1. Append user message to store
    store.addMessageToCurrent({
      role: "user",
      content: cleanPrompt
    });

    this.isStreaming = true;
    this.welcomeSection.style.display = "none";
    this.messageList.style.display = "flex";

    // 2. Create placeholder assistant card for streaming
    const streamMsgId = "msg_stream_" + Date.now();
    const model = getModelById(state.activeModelId);
    
    const streamElement = document.createElement("div");
    streamElement.className = "chat-message assistant-message";
    streamElement.id = streamMsgId;
    streamElement.innerHTML = `
      <div class="assistant-card">
        <div class="assistant-meta">
          <div class="assistant-badge">
            <span class="model-dot" style="background-color: ${model.color};"></span>
            <span>${model.name}</span>
          </div>
        </div>
        <div class="assistant-body"><span class="streaming-cursor"></span></div>
      </div>
    `;
    this.messageList.appendChild(streamElement);
    this.scrollToBottom();

    const bodyEl = streamElement.querySelector(".assistant-body");

    // 3. Trigger streaming response
    await streamAIResponse({
      prompt: cleanPrompt,
      modelId: state.activeModelId,
      context: state.attachedContext,
      webSearch: state.enableWebSearch,
      onChunk: (accumulated) => {
        bodyEl.innerHTML = this.renderMarkdown(accumulated) + '<span class="streaming-cursor"></span>';
        this.scrollToBottom();
      },
      onDone: (finalText) => {
        this.isStreaming = false;
        // Save to state
        store.addMessageToCurrent({
          role: "assistant",
          content: finalText,
          modelId: state.activeModelId
        });
        // Render permanent message with copy button
        bodyEl.innerHTML = this.renderMarkdown(finalText);
        const actionsEl = document.createElement("div");
        actionsEl.className = "assistant-actions";
        actionsEl.innerHTML = `
          <button class="btn-msg-action btn-copy-msg" data-text="${encodeURIComponent(finalText)}" title="Copy text">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
              <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
            </svg>
            <span>Copy</span>
          </button>
        `;
        streamElement.querySelector(".assistant-card").appendChild(actionsEl);
        this.bindCopyButtons(streamElement);
        this.scrollToBottom();
      }
    });
  }

  scrollToBottom() {
    this.scrollArea.scrollTop = this.scrollArea.scrollHeight;
  }

  bindCopyButtons(container) {
    container.querySelectorAll(".btn-copy-msg").forEach(btn => {
      btn.addEventListener("click", () => {
        const text = decodeURIComponent(btn.dataset.text || "");
        navigator.clipboard.writeText(text).then(() => {
          const original = btn.innerHTML;
          btn.innerHTML = `<span>✓ Copied</span>`;
          setTimeout(() => { btn.innerHTML = original; }, 1500);
        });
      });
    });
  }

  escapeHtml(str) {
    return str
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
  }

  renderMarkdown(text) {
    if (!text) return "";
    let html = text;

    // Code blocks ```code```
    html = html.replace(/```([a-zA-Z0-9_-]*)\n([\s\S]*?)```/g, (match, lang, code) => {
      return `<pre><code>${this.escapeHtml(code.trim())}</code></pre>`;
    });

    // Inline code `code`
    html = html.replace(/`([^`]+)`/g, (match, code) => {
      return `<code>${this.escapeHtml(code)}</code>`;
    });

    // Headers
    html = html.replace(/^### (.*$)/gim, '<h3 style="font-size:14px; margin: 8px 0 4px 0; font-weight:700;">$1</h3>');
    html = html.replace(/^## (.*$)/gim, '<h2 style="font-size:15px; margin: 10px 0 4px 0; font-weight:700;">$1</h2>');
    html = html.replace(/^# (.*$)/gim, '<h1 style="font-size:16px; margin: 12px 0 6px 0; font-weight:700;">$1</h1>');

    // Blockquotes
    html = html.replace(/^> (.*$)/gim, '<blockquote style="border-left: 3px solid var(--brand-primary); padding-left: 8px; margin: 6px 0; color: var(--text-secondary); font-style: italic;">$1</blockquote>');

    // Bold & Italic
    html = html.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
    html = html.replace(/\*([^*]+)\*/g, '<em>$1</em>');

    // Bullet lists
    html = html.replace(/^\* (.*$)/gim, '<li>$1</li>');
    html = html.replace(/<li>.*<\/li>/gim, (match) => `<ul style="margin: 4px 0 8px 16px;">${match}</ul>`);

    // Line breaks to paragraphs
    html = html.replace(/\n\n/g, '<br><br>');

    return html;
  }
}
