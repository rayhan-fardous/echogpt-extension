/**
 * EchoGPT Model Selection Modal
 */

import { store } from "../state.js";
import { AI_MODELS, getModelById } from "../models.js";

export class ModelModalController {
  constructor() {
    this.overlay = document.getElementById("modelModalOverlay");
    this.openBtn = document.getElementById("btnModelPicker");
    this.closeBtn = document.getElementById("btnCloseModelModal");
    this.listContainer = document.getElementById("modelOptionsList");
    this.activeModelLabel = document.getElementById("activeModelName");
  }

  init() {
    if (!this.overlay) return;

    if (this.openBtn) {
      this.openBtn.addEventListener("click", () => this.open());
    }

    // Direct bind to Write View model selector button
    const writeModelSelectBtn = document.getElementById("btnWriteModelSelect");
    if (writeModelSelectBtn) {
      writeModelSelectBtn.addEventListener("click", () => this.open());
    }

    this.closeBtn?.addEventListener("click", () => this.close());
    this.overlay.addEventListener("click", (e) => {
      if (e.target === this.overlay) this.close();
    });

    this.render();
    const updateActiveModelUI = (state) => {
      const model = getModelById(state.activeModelId);
      if (!model) return;

      // Sync Chat View UI
      if (this.activeModelLabel) {
        this.activeModelLabel.textContent = model.shortName;
      }
      const badge = this.openBtn?.querySelector(".model-logo-badge");
      if (badge) {
        badge.style.backgroundColor = model.color || "#6b21a8";
      }

      // Sync Write View UI
      const writeModelName = document.getElementById("writeModelName");
      if (writeModelName) {
        writeModelName.textContent = model.shortName;
      }

      const writeModelDot = document.getElementById("writeModelDot");
      if (writeModelDot) {
        writeModelDot.style.backgroundColor = model.color || "#6366f1";
        writeModelDot.style.boxShadow = `0 0 6px ${model.color || "#6366f1"}`;
      }

      const writeHeaderBadge = document.getElementById("writeHeaderModelBadge");
      if (writeHeaderBadge) {
        writeHeaderBadge.textContent = model.shortName;
      }

      const writeBtnBrand = document.getElementById("writeBtnModelBrand");
      if (writeBtnBrand) {
        writeBtnBrand.textContent = model.shortName;
      }
    };
    updateActiveModelUI(store.getState());
    store.subscribe((state) => updateActiveModelUI(state));
  }

  open() {
    this.render();
    this.overlay.classList.add("open");
  }

  close() {
    this.overlay.classList.remove("open");
  }

  render() {
    const currentModelId = store.getState().activeModelId;
    this.listContainer.innerHTML = "";

    AI_MODELS.forEach(m => {
      const card = document.createElement("div");
      card.className = `model-option-card ${m.id === currentModelId ? "selected" : ""}`;
      card.innerHTML = `
        <div class="model-card-info">
          <div class="model-card-name">
            <span class="model-dot" style="background-color: ${m.color}; width: 8px; height: 8px; border-radius: 50%;"></span>
            <span>${m.name}</span>
          </div>
          <div class="model-card-desc">${m.description}</div>
          <div class="model-card-tags">
            ${m.tags.map(t => `<span class="badge" style="background:var(--bg-primary); border:1px solid var(--border-subtle);">${t}</span>`).join("")}
          </div>
        </div>
        ${m.id === currentModelId ? '<span style="color:var(--brand-primary); font-weight:700;">✓</span>' : ''}
      `;

      card.addEventListener("click", () => {
        store.setState({ activeModelId: m.id });
        this.close();
      });

      this.listContainer.appendChild(card);
    });
  }
}
