/**
 * EchoGPT Modern AI Writer & Composer View Controller
 * Handles Multi-Mode Writing:
 * - Compose: Topic input with expanded formats (Paragraph, Idea, Outline, Blog Post, Article, etc.)
 * - Reply: Clean original text + What to reply with smart language & tone options
 * - Grammar: Direct proofreading with dedicated "Fix Grammar" workflow
 */

import { store } from "../state.js";
import { getModelById } from "../models.js";

export class WriteViewController {
  constructor() {
    this.currentMode = "reply"; // 'reply' | 'compose' | 'grammar'
    this.selectedFormat = "automatic";
    this.selectedTone = "automatic";
    this.selectedLength = "automatic";
    this.selectedLanguage = "German";

    // Mode Navigation Tabs
    this.modeTabs = document.querySelectorAll(".write-mode-tab");
    this.modePanels = {
      reply: document.getElementById("panelWriteReply"),
      compose: document.getElementById("panelWriteCompose"),
      grammar: document.getElementById("panelWriteGrammar")
    };

    // Reply Inputs
    this.origTextInput = document.getElementById("writeOrigTextInput");
    this.replyNotesInput = document.getElementById("writeReplyNotesInput");
    this.origTextCount = document.getElementById("origTextCount");
    this.btnPasteOrigText = document.getElementById("btnPasteOrigText");

    // Compose Inputs
    this.composePromptInput = document.getElementById("writePromptInput");
    this.composeCharCount = document.getElementById("composeCharCount");

    // Grammar Inputs
    this.grammarInput = document.getElementById("writeGrammarInput");
    this.grammarCharCount = document.getElementById("grammarCharCount");
    this.btnPasteGrammarText = document.getElementById("btnPasteGrammarText");

    // Option Chip Groups & Card
    this.controlsCard = document.getElementById("writeControlsCard");
    this.formatGroup = document.getElementById("writeFormatGroup");
    this.composeOnlyChips = document.querySelectorAll(".chip-compose-only");
    this.toneGroup = document.getElementById("writeToneGroup");
    this.lengthGroup = document.getElementById("writeLengthGroup");
    this.languageSelect = document.getElementById("writeLanguageSelect");

    // Actions & Buttons
    this.btnWriteModelSelect = document.getElementById("btnWriteModelSelect");
    this.generateBtn = document.getElementById("btnGenerateWrite");
    this.writeBtnLabel = document.getElementById("writeBtnLabel");
    this.resetBtn = document.getElementById("btnResetWrite");

    // Output & Result
    this.outputSection = document.getElementById("writeOutputSection");
    this.outputBox = document.getElementById("writeOutputBox");
    this.resultBadge = document.getElementById("writeResultBadge");
    this.copyBtn = document.getElementById("btnCopyWriteDraft");
    this.copyText = document.getElementById("copyWriteDraftText");
    this.regenerateBtn = document.getElementById("btnRegenerateWrite");
    this.refineBtns = document.querySelectorAll(".refine-btn");
  }

  init() {
    if (!this.generateBtn) return;

    // Ensure Original Text starts completely blank without prefilled "hi"
    if (this.origTextInput) {
      this.origTextInput.value = "";
      this.updateCharCount(this.origTextInput, this.origTextCount);
    }

    this.bindModeSwitcher();
    this.bindPillChips();
    this.bindLanguageSelect();
    this.bindInputCounters();
    this.bindClipboardTools();
    this.bindGeneration();
    this.bindCopy();
    this.bindRefinements();
    this.bindKeyboardShortcuts();
    this.bindReset();
    this.bindModelSelect();

    // Sync active model UI with state
    this.syncActiveModelUI();
    store.subscribe(() => this.syncActiveModelUI());

    // Initialize mode visibility
    this.applyModeState("reply");
  }

  syncActiveModelUI() {
    const state = store.getState();
    const model = getModelById(state.activeModelId);
    if (!model) return;

    const writeModelName = document.getElementById("writeModelName");
    if (writeModelName) writeModelName.textContent = model.shortName;

    const writeModelDot = document.getElementById("writeModelDot");
    if (writeModelDot) {
      writeModelDot.style.backgroundColor = model.color || "#6366f1";
      writeModelDot.style.boxShadow = `0 0 6px ${model.color || "#6366f1"}`;
    }

    const writeHeaderBadge = document.getElementById("writeHeaderModelBadge");
    if (writeHeaderBadge) writeHeaderBadge.textContent = model.shortName;

    const writeBtnBrand = document.getElementById("writeBtnModelBrand");
    if (writeBtnBrand) writeBtnBrand.textContent = model.shortName;
  }

  /**
   * Switch between Compose, Reply, and Grammar modes
   */
  bindModeSwitcher() {
    this.modeTabs.forEach(tab => {
      tab.addEventListener("click", () => {
        const targetMode = tab.dataset.mode;
        if (!targetMode) return;
        this.applyModeState(targetMode);
      });
    });

    // Preset prompts for Compose
    document.querySelectorAll(".write-preset-badge[data-fill]").forEach(badge => {
      badge.addEventListener("click", () => {
        if (this.composePromptInput) {
          this.composePromptInput.value = badge.dataset.fill;
          this.updateCharCount(this.composePromptInput, this.composeCharCount);
          this.composePromptInput.focus();
        }
      });
    });
  }

  applyModeState(mode) {
    this.currentMode = mode;
    this.modeTabs.forEach(t => t.classList.toggle("active", t.dataset.mode === mode));

    // Show active panel, hide others
    Object.keys(this.modePanels).forEach(m => {
      const panel = this.modePanels[m];
      if (panel) {
        panel.style.display = m === mode ? "flex" : "none";
        panel.classList.toggle("active", m === mode);
      }
    });

    if (mode === "grammar") {
      // Screenshot 1: In Grammar mode, hide format/tone/length controls
      if (this.controlsCard) this.controlsCard.style.display = "none";
      if (this.writeBtnLabel) this.writeBtnLabel.textContent = "Fix Grammar";
    } else if (mode === "compose") {
      // Screenshot 2: In Compose mode, show controls & expanded formats
      if (this.controlsCard) this.controlsCard.style.display = "flex";
      this.composeOnlyChips.forEach(chip => chip.style.display = "");
      if (this.writeBtnLabel) this.writeBtnLabel.textContent = "Generate";
    } else {
      // Reply Mode: show standard reply formats, hide compose-only
      if (this.controlsCard) this.controlsCard.style.display = "flex";
      this.composeOnlyChips.forEach(chip => chip.style.display = "none");
      
      // If a compose-only format was active, reset to automatic
      const currentSelected = this.formatGroup?.querySelector(".write-chip.selected");
      if (currentSelected && currentSelected.classList.contains("chip-compose-only")) {
        this.formatGroup.querySelectorAll(".write-chip").forEach(c => c.classList.remove("selected"));
        const autoChip = this.formatGroup.querySelector('.write-chip[data-value="automatic"]');
        autoChip?.classList.add("selected");
        this.selectedFormat = "automatic";
      }
      if (this.writeBtnLabel) this.writeBtnLabel.textContent = "Generate";
    }
  }

  /**
   * Chip selection for Format, Tone, Length
   */
  bindPillChips() {
    const setupChips = (group, callback) => {
      if (!group) return;
      group.querySelectorAll(".write-chip").forEach(chip => {
        chip.addEventListener("click", () => {
          group.querySelectorAll(".write-chip").forEach(c => c.classList.remove("selected"));
          chip.classList.add("selected");
          callback(chip.dataset.value);
        });
      });
    };

    setupChips(this.formatGroup, val => this.selectedFormat = val);
    setupChips(this.toneGroup, val => this.selectedTone = val);
    setupChips(this.lengthGroup, val => this.selectedLength = val);
  }

  bindLanguageSelect() {
    if (this.languageSelect) {
      this.selectedLanguage = this.languageSelect.value;
      this.languageSelect.addEventListener("change", (e) => {
        this.selectedLanguage = e.target.value;
      });
    }
  }

  bindInputCounters() {
    const bindCounter = (input, counter) => {
      if (!input || !counter) return;
      const update = () => {
        const len = input.value.length;
        counter.textContent = `${len} char${len === 1 ? "" : "s"}`;
      };
      input.addEventListener("input", update);
      update();
    };

    bindCounter(this.origTextInput, this.origTextCount);
    bindCounter(this.composePromptInput, this.composeCharCount);
    bindCounter(this.grammarInput, this.grammarCharCount);
  }

  updateCharCount(input, counter) {
    if (!input || !counter) return;
    const len = input.value.length;
    counter.textContent = `${len} char${len === 1 ? "" : "s"}`;
  }

  bindClipboardTools() {
    // Paste into Original Text
    this.btnPasteOrigText?.addEventListener("click", async () => {
      try {
        const text = await navigator.clipboard.readText();
        if (text && this.origTextInput) {
          this.origTextInput.value = text;
          this.updateCharCount(this.origTextInput, this.origTextCount);
        }
      } catch {
        this.origTextInput?.focus();
      }
    });

    // Paste into Grammar input
    this.btnPasteGrammarText?.addEventListener("click", async () => {
      try {
        const text = await navigator.clipboard.readText();
        if (text && this.grammarInput) {
          this.grammarInput.value = text;
          this.updateCharCount(this.grammarInput, this.grammarCharCount);
        }
      } catch {
        this.grammarInput?.focus();
      }
    });
  }

  bindKeyboardShortcuts() {
    document.addEventListener("keydown", (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
        const viewWrite = document.getElementById("viewWrite");
        if (viewWrite && viewWrite.classList.contains("active")) {
          e.preventDefault();
          this.generate();
        }
      }
    });
  }

  bindReset() {
    this.resetBtn?.addEventListener("click", () => {
      if (this.origTextInput) this.origTextInput.value = "";
      if (this.replyNotesInput) this.replyNotesInput.value = "";
      if (this.composePromptInput) this.composePromptInput.value = "";
      if (this.grammarInput) this.grammarInput.value = "";
      
      this.updateCharCount(this.origTextInput, this.origTextCount);
      this.updateCharCount(this.composePromptInput, this.composeCharCount);
      this.updateCharCount(this.grammarInput, this.grammarCharCount);

      if (this.outputBox) this.outputBox.textContent = "";
      if (this.resultBadge) this.resultBadge.textContent = "Reset";
    });
  }

  bindModelSelect() {
    this.btnWriteModelSelect?.addEventListener("click", () => {
      const modelPicker = document.getElementById("btnModelPicker");
      if (modelPicker) {
        modelPicker.click();
      } else {
        const overlay = document.getElementById("modelModalOverlay");
        if (overlay) overlay.classList.add("open");
      }
    });
  }

  bindGeneration() {
    this.generateBtn.addEventListener("click", () => this.generate());
    this.regenerateBtn?.addEventListener("click", () => this.generate(true));
  }

  generate(isRegeneration = false) {
    let contextData = null;
    
    if (this.currentMode === "reply") {
      const orig = this.origTextInput?.value.trim() || "";
      const replyNotes = this.replyNotesInput?.value.trim() || "";
      if (!orig && !replyNotes) {
        this.replyNotesInput?.focus();
        return;
      }
      contextData = { orig, replyNotes };
    } else if (this.currentMode === "compose") {
      const prompt = this.composePromptInput?.value.trim() || "";
      if (!prompt) {
        this.composePromptInput?.focus();
        return;
      }
      contextData = prompt;
    } else if (this.currentMode === "grammar") {
      const text = this.grammarInput?.value.trim() || "";
      if (!text) {
        this.grammarInput?.focus();
        return;
      }
      contextData = text;
    }

    if (this.outputSection) this.outputSection.style.display = "flex";
    if (this.resultBadge) this.resultBadge.textContent = this.currentMode === "grammar" ? "Checking..." : "Generating...";
    
    // Loading state on button
    this.generateBtn.classList.add("loading");
    if (this.outputBox) {
      const actionText = this.currentMode === "grammar" 
        ? "Analyzing grammar, spelling & punctuation..." 
        : `EchoGPT drafting ${this.selectedTone !== 'automatic' ? this.selectedTone : ''} ${this.selectedFormat !== 'automatic' ? this.selectedFormat : 'content'} in ${this.selectedLanguage}...`;

      this.outputBox.innerHTML = `<span style="opacity: 0.6; display: flex; align-items: center; gap: 6px;">` +
        `<span style="display:inline-block; animation: spin 1s infinite linear;">⚡</span> ` +
        `${actionText}</span>`;
    }

    setTimeout(() => {
      const draft = this.buildDraft(contextData);
      if (this.outputBox) {
        this.outputBox.textContent = draft;
      }
      if (this.resultBadge) {
        if (this.currentMode === "grammar") {
          this.resultBadge.textContent = "✓ Fixed";
        } else {
          const words = draft.trim().split(/\s+/).length;
          this.resultBadge.textContent = `${words} words`;
        }
      }
      this.generateBtn.classList.remove("loading");
    }, 400);
  }

  buildDraft(context) {
    const isGerman = this.selectedLanguage === "German";
    const isSpanish = this.selectedLanguage === "Spanish";
    const isFrench = this.selectedLanguage === "French";

    // 1. Grammar Mode Logic
    if (this.currentMode === "grammar") {
      const raw = typeof context === "string" ? context : "";
      if (!raw) return "No text provided to check.";

      // Realistic automated grammar & spelling corrections
      let fixed = raw
        // Capitalize first letter of sentences
        .replace(/(^\s*|[.!?]\s+)([a-z])/g, (_, p1, p2) => p1 + p2.toUpperCase())
        // Fix standalone 'i' to 'I'
        .replace(/\bi\b/g, "I")
        // Common typos
        .replace(/\bgrammer\b/gi, "grammar")
        .replace(/\bmistaks\b/gi, "mistakes")
        .replace(/\bteh\b/gi, "the")
        .replace(/\bdont\b/gi, "don't")
        .replace(/\bcant\b/gi, "can't")
        .replace(/\bwont\b/gi, "won't")
        .replace(/\bim\b/gi, "I'm")
        .replace(/\brecieve\b/gi, "receive")
        .replace(/\bseperate\b/gi, "separate")
        .replace(/\buntill\b/gi, "until");

      // Ensure ending punctuation
      if (fixed.length > 0 && !/[.!?]$/.test(fixed.trim())) {
        fixed = fixed.trim() + ".";
      }

      return fixed;
    }

    // 2. Compose Mode Logic (Supports Paragraph, Idea, Outline, Blog Post, Article, etc.)
    if (this.currentMode === "compose") {
      const topic = typeof context === "string" ? context : "Topic";
      const format = this.selectedFormat;

      if (isGerman) {
        if (format === "paragraph") {
          return `In Bezug auf „${topic}“ zeigt sich, dass eine präzise Umsetzung und klare Zielsetzung die entscheidenden Erfolgsfaktoren darstellen. Durch fokussierte Priorisierung lassen sich nachhaltige Ergebnisse erzielen, die sowohl Effizienz als auch Innovationskraft spürbar steigern.`;
        }
        if (format === "idea") {
          return `💡 Ideen-Brainstorming zu „${topic}“:\n\n1. Nutzerzentrierte Automatisierung: Workflows durch intelligente Vorlagen beschleunigen.\n2. Nahtlose Integration: Bestehende Systeme ohne Reibungsverluste verknüpfen.\n3. Skalierbare Architektur: Modulare Bausteine für schnelles Wachstum etablieren.`;
        }
        if (format === "outline") {
          return `📋 Gliederung: ${topic}\n\nI. Einleitung & Zieldefinition\n   A. Aktuelle Ausgangslage\n   B. Kernherausforderungen\nII. Hauptanalyse & Maßnahmen\n   A. Strategische Prioritäten\n   B. Meilensteine und Zeitplan\nIII. Fazit & Nächste Schritte`;
        }
        if (format === "blog post") {
          return `🚀 ${topic}: Warum jetzt der beste Zeitpunkt für den nächsten Schritt ist\n\nIn der heutigen digitalen Arbeitswelt ist Schnelligkeit ein entscheidender Vorteil. Wer sich mit „${topic}“ intensiv auseinandersetzt, schafft die Grundlage für messbaren Vorsprung.\n\n* Wichtigster Hebel: Qualität und Tempo in Einklang bringen.\n* Fazit: Einfach starten und kontinuierlich iterieren!`;
        }
        if (format === "article") {
          return `Fachartikel: Strategische Perspektiven auf ${topic}\n\nEine fundierte Auseinandersetzung mit modernen Arbeitsweisen verdeutlicht die Relevanz von klaren Strukturen. Dieser Beitrag beleuchtet Kernaspekte, Best Practices und konkrete Handlungsempfehlungen für Führungskräfte und Teams.`;
        }
        return `Betreff: Ausarbeitung zu ${topic}\n\nHallo zusammen,\n\nhier ist der aktuelle Entwurf zum Thema „${topic}“. Die wichtigsten Meilensteine sind definiert und die nächsten Schritte können zeitnah umgesetzt werden.\n\nBeste Grüße,\nRyhn`;
      }

      // English / Default Compose Output
      if (format === "paragraph") {
        return `Regarding ${topic}, achieving meaningful impact requires disciplined execution paired with strategic clarity. By aligning core priorities and focusing on high-leverage actions, teams can accelerate progress while maintaining uncompromising standards of quality.`;
      }
      if (format === "idea") {
        return `💡 Creative Concepts for "${topic}":\n\n1. Intelligent Copilot Integration: Embed automated assistance directly into daily workflows.\n2. Modular Component Design: Decouple features to enable independent iteration.\n3. Real-Time Feedback Loops: Accelerate validation through automated telemetry and user signals.`;
      }
      if (format === "outline") {
        return `📋 Comprehensive Outline: ${topic}\n\nI. Executive Summary & Context\n   A. Problem Statement\n   B. Core Objectives\nII. Strategic Pillars\n   A. Architecture & Design Principles\n   B. Implementation Roadmap\nIII. Key Performance Indicators\nIV. Next Steps & Action Items`;
      }
      if (format === "blog post") {
        return `✨ Navigating ${topic}: A Practical Guide for Modern Teams\n\nIn high-velocity engineering and product environments, mastering ${topic} is no longer optional—it is a core differentiator.\n\nHere are 3 fundamental takeaways:\n• Streamlined architecture drives velocity.\n• Consistency unlocks scale.\n• Rapid iteration beats delayed perfection.\n\nRead on to explore how these principles can transform your daily output.`;
      }
      if (format === "article") {
        return `In-Depth Analysis: The Evolution and Strategic Impact of ${topic}\n\nAs digital systems expand in complexity, our methodology for addressing fundamental challenges must evolve simultaneously. This article examines key dynamics, empirical findings, and actionable frameworks to successfully navigate ${topic}.`;
      }

      return `Subject: Overview & Action Plan: ${topic}\n\nHi team,\n\nFollowing up on ${topic}, here is a concise breakdown of the deliverables and current status:\n\n* Strategic priorities have been validated.\n* Delivery timeline remains firmly on track.\n\nPlease review and let me know if you have any questions.\n\nBest,\nRyhn`;
    }

    // 3. Reply Mode Logic
    if (this.currentMode === "reply") {
      const orig = typeof context === "object" ? context.orig : "";
      const notes = typeof context === "object" ? context.replyNotes : "";

      if (isGerman) {
        if (this.selectedFormat === "email") {
          return `Hallo!\n\nVielen Dank für deine Nachricht. ${notes ? notes + " " : ""}Ich habe dein Anliegen geprüft und melde mich zeitnah mit den weiteren Schritten.\n\nBeste Grüße,\nRyhn`;
        }
        if (this.selectedFormat === "twitter") {
          return `Hallo! Danke für den Hinweis. Wir sind schon dran und halten euch auf dem Laufenden! 🚀 #EchoGPT`;
        }
        if (this.selectedTone === "formal") {
          return `Sehr geehrte Damen und Herren,\n\nvielen Dank für Ihre Mitteilung. ${notes ? notes + ". " : ""}Wir haben den Vorgang erfasst und werden diesen schnellstmöglich bearbeiten.\n\nMit freundlichen Grüßen,\nRyhn`;
        }
        return `Hallo!\n\nVielen Dank für deine Rückmeldung. ${notes ? notes + ". " : ""}Lass mich wissen, falls du noch Fragen dazu hast!`;
      }

      if (isSpanish) {
        return `¡Hola!\n\nMuchas gracias por tu mensaje. ${notes ? notes + ". " : ""}Me pongo en contacto contigo pronto con más detalles.\n\n¡Un cordial saludo!`;
      }

      if (isFrench) {
        return `Bonjour !\n\nMerci beaucoup pour votre message. ${notes ? notes + ". " : ""}Je reviens vers vous dès que possible avec de plus amples informations.\n\nBien cordialement,`;
      }

      // English / Default
      if (this.selectedFormat === "email") {
        return `Hi there,\n\nThanks for reaching out! ${notes ? notes + " " : ""}I've reviewed the points and will follow up shortly with our updated roadmap.\n\nBest regards,\nRyhn`;
      }
      if (this.selectedFormat === "twitter") {
        return `Thanks for the shoutout! We're on it and rolling out updates soon. Appreciate your support! 🚀`;
      }
      if (this.selectedTone === "formal") {
        return `Dear Colleague,\n\nThank you for your inquiry. ${notes ? notes + ". " : ""}The requested items are being processed according to schedule.\n\nSincerely,\nRyhn`;
      }
      return `Hi!\n\nThanks for your note. ${notes ? notes + ". " : ""}Let me know if there's anything else needed on my end!`;
    }

    return "Hallo!";
  }

  bindCopy() {
    this.copyBtn?.addEventListener("click", () => {
      const textToCopy = this.outputBox?.innerText || "";
      if (!textToCopy) return;

      navigator.clipboard.writeText(textToCopy).then(() => {
        this.copyBtn.classList.add("copied");
        if (this.copyText) this.copyText.textContent = "Copied! ✓";
        setTimeout(() => {
          this.copyBtn.classList.remove("copied");
          if (this.copyText) this.copyText.textContent = "Copy";
        }, 1800);
      });
    });
  }

  bindRefinements() {
    this.refineBtns.forEach(btn => {
      btn.addEventListener("click", () => {
        const action = btn.dataset.action;
        const current = this.outputBox?.textContent || "";
        if (!current) return;

        let refined = current;
        if (action === "shorter") {
          refined = current.split("\n\n")[0] || current.slice(0, 100);
        } else if (action === "longer") {
          refined = current + `\n\nFeel free to review the attached documentation and let me know if you would like to schedule a quick sync.`;
        } else if (action === "formal") {
          refined = current.replace(/Hi|Hallo/g, "Dear Sir or Madam,").replace(/Cheers|Best/g, "With sincere regards,");
        } else if (action === "friendly") {
          refined = `Hope you're having a wonderful day! 😊\n\n` + current;
        }

        if (this.outputBox) this.outputBox.textContent = refined;
        if (this.resultBadge) {
          const words = refined.trim().split(/\s+/).length;
          this.resultBadge.textContent = `${words} words`;
        }
      });
    });
  }
}
