/**
 * EchoGPT Write View Controller
 */

export class WriteViewController {
  constructor() {
    this.promptInput = document.getElementById("writePromptInput");
    this.formatGroup = document.getElementById("writeFormatGroup");
    this.toneGroup = document.getElementById("writeToneGroup");
    this.generateBtn = document.getElementById("btnGenerateWrite");
    this.outputSection = document.getElementById("writeOutputSection");
    this.outputBox = document.getElementById("writeOutputBox");
    this.copyBtn = document.getElementById("btnCopyWriteDraft");

    this.selectedFormat = "email";
    this.selectedTone = "professional";
  }

  init() {
    if (!this.generateBtn) return;

    this.formatGroup?.querySelectorAll(".pill-option-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        this.formatGroup.querySelectorAll(".pill-option-btn").forEach(b => b.classList.remove("selected"));
        btn.classList.add("selected");
        this.selectedFormat = btn.dataset.value;
      });
    });

    this.toneGroup?.querySelectorAll(".pill-option-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        this.toneGroup.querySelectorAll(".pill-option-btn").forEach(b => b.classList.remove("selected"));
        btn.classList.add("selected");
        this.selectedTone = btn.dataset.value;
      });
    });

    this.generateBtn.addEventListener("click", () => this.generate());

    this.copyBtn?.addEventListener("click", () => {
      navigator.clipboard.writeText(this.outputBox.innerText).then(() => {
        const orig = this.copyBtn.textContent;
        this.copyBtn.textContent = "Copied!";
        setTimeout(() => { this.copyBtn.textContent = orig; }, 1500);
      });
    });
  }

  generate() {
    const prompt = this.promptInput.value.trim();
    if (!prompt) {
      alert("Please describe what you want to write.");
      return;
    }

    this.outputSection.style.display = "flex";
    this.outputBox.innerHTML = `<em>Drafting ${this.selectedTone} ${this.selectedFormat}...</em>`;

    setTimeout(() => {
      let draft = "";
      if (this.selectedFormat === "email") {
        draft = `Subject: Quick follow-up regarding our recent discussion\n\n` +
          `Hi team,\n\n` +
          `I wanted to share a concise update regarding ${prompt}.\n\n` +
          `Our primary objectives are aligned, and we are on track to finalize the core milestones by the end of this sprint. Please review the attached notes and let me know if you have any questions or feedback.\n\n` +
          `Best regards,\nRyhn`;
      } else if (this.selectedFormat === "social") {
        draft = `🚀 Excited to share our latest breakthrough in ${prompt}!\n\n` +
          `By streamlining our workflow and focusing on speed, we've unlocked a 10x improvement in daily output.\n\n` +
          `Check it out and let me know your thoughts! 👇\n#Productivity #Innovation #AI`;
      } else {
        draft = `## Executive Overview: ${prompt}\n\n` +
          `In today's fast-paced environment, executing with clarity and precision is key. This piece explores the primary drivers of success, highlighting actionable takeaways and future strategies.\n\n` +
          `* **Core Premise:** Quality and velocity are not mutually exclusive.\n` +
          `* **Implementation:** Deploy modular patterns that scale effortlessly.\n` +
          `* **Next Steps:** Iterate rapidly based on continuous feedback.`;
      }
      this.outputBox.textContent = draft;
    }, 450);
  }
}
