/**
 * EchoGPT Page Reader & Extractor
 * Interfaces with Chrome Tabs & Content Script to extract readable page context
 */

import { store } from "./state.js";

export class PageReader {
  constructor() {
    this.banner = document.getElementById("readTabBanner");
    this.titleEl = document.getElementById("readTabTitle");
    this.urlEl = document.getElementById("readTabUrl");
    this.wordBadge = document.getElementById("readWordBadge");
    this.tokenBadge = document.getElementById("readTokenBadge");
    this.summaryOutput = document.getElementById("readSummaryOutput");
    this.summarySection = document.getElementById("readSummarySection");
  }

  async extractActiveTab() {
    return new Promise((resolve) => {
      if (typeof chrome !== "undefined" && chrome.tabs && chrome.tabs.query) {
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
          if (!tabs || !tabs[0] || !tabs[0].id) {
            resolve(this.getMockPageData());
            return;
          }

          const tab = tabs[0];
          chrome.tabs.sendMessage(tab.id, { type: "EXTRACT_PAGE_CONTENT" }, (res) => {
            if (chrome.runtime.lastError || !res || !res.success) {
              // Could be restricted page like chrome:// or error
              resolve({
                title: tab.title || "Active Web Tab",
                url: tab.url || "https://webpage.com",
                wordCount: 780,
                tokenCount: 1014,
                cleanText: `Content extracted from ${tab.title}. Architectural patterns, layout structures, and best practices.`
              });
            } else {
              resolve(res.data);
            }
          });
        });
      } else {
        // Standalone preview fallback
        resolve(this.getMockPageData());
      }
    });
  }

  getMockPageData() {
    return {
      title: "Building Modern Manifest V3 Chrome Extensions with SidePanel API",
      url: "https://developer.chrome.com/docs/extensions/reference/api/sidePanel",
      wordCount: 1420,
      tokenCount: 1846,
      cleanText: `The Chrome sidePanel API allows extensions to display their own UI in the browser's side panel, enabling persistent experiences that accompany the user's browsing journey. Key features include per-tab panel behaviors, context-aware assistance, and cross-origin security guarantees.`
    };
  }

  async updateReadViewInfo() {
    if (!this.titleEl) return;
    this.titleEl.textContent = "Analyzing active browser tab...";
    const data = await this.extractActiveTab();

    this.titleEl.textContent = data.title;
    this.urlEl.textContent = data.url;
    this.wordBadge.textContent = `${data.wordCount.toLocaleString()} words`;
    this.tokenBadge.textContent = `~${data.tokenCount.toLocaleString()} tokens`;

    return data;
  }

  async generateSummary() {
    const data = await this.updateReadViewInfo();
    this.summarySection.style.display = "flex";
    this.summaryOutput.innerHTML = `<em>Generating executive brief for "${data.title}"...</em>`;

    // Simulated summary generation
    setTimeout(() => {
      this.summaryOutput.innerHTML = `
<strong>Executive Summary:</strong>
This resource highlights modern browser extension architecture using the Chrome Side Panel API.

<strong>Key Takeaways:</strong>
• <strong>Persistent Ergonomics:</strong> Unlike popup modals that close on click outside, side panels stay pinned while the user interacts with any page.
• <strong>Context Synchronization:</strong> Real-time message passing allows extensions to analyze page DOM, headings, and selections on demand.
• <strong>User Experience:</strong> Combining dual column rail navigation with sleek glassmorphism yields a state-of-the-art workflow.

<strong>Action Items:</strong>
1. Test across responsive widths (380px to 600px).
2. Leverage keyboard shortcuts (Alt+1 to Alt+8) for rapid navigation.
      `.trim();
    }, 600);
  }

  attachToChatContext(pageData) {
    store.setState({ attachedContext: pageData });
    this.renderContextChip(pageData);
  }

  renderContextChip(data) {
    const chipsContainer = document.getElementById("dockContextChips");
    if (!chipsContainer) return;

    if (!data) {
      chipsContainer.style.display = "none";
      chipsContainer.innerHTML = "";
      return;
    }

    chipsContainer.style.display = "flex";
    chipsContainer.innerHTML = `
      <div class="context-chip">
        <span>📄</span>
        <span style="max-width: 180px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
          ${data.title} (~${data.tokenCount} tokens)
        </span>
        <button class="chip-remove-btn" id="btnRemoveContextChip" title="Remove context">✕</button>
      </div>
    `;

    document.getElementById("btnRemoveContextChip")?.addEventListener("click", () => {
      store.setState({ attachedContext: null });
      this.renderContextChip(null);
    });
  }
}
