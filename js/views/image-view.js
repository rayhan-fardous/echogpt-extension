/**
 * EchoGPT Image & Video View Controllers
 */

export class ImageViewController {
  constructor() {
    this.promptInput = document.getElementById("imagePromptInput");
    this.styleGroup = document.getElementById("imageStyleGroup");
    this.generateBtn = document.getElementById("btnGenerateImage");
    this.resultSection = document.getElementById("imageResultSection");
    this.resultBox = document.getElementById("imageResultBox");
    this.selectedStyle = "photorealistic";
  }

  init() {
    if (!this.generateBtn) return;

    this.styleGroup?.querySelectorAll(".pill-option-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        this.styleGroup.querySelectorAll(".pill-option-btn").forEach(b => b.classList.remove("selected"));
        btn.classList.add("selected");
        this.selectedStyle = btn.dataset.value;
      });
    });

    this.generateBtn.addEventListener("click", () => this.generate());
  }

  generate() {
    const prompt = this.promptInput.value.trim() || "Futuristic workspace with holographic displays";
    this.resultSection.style.display = "flex";
    this.resultBox.innerHTML = `<em>Generating visual composition for "${prompt}" (${this.selectedStyle})...</em>`;

    setTimeout(() => {
      this.resultBox.innerHTML = `
        <div style="border-radius: 12px; overflow: hidden; border: 1px solid var(--border-subtle); background: linear-gradient(135deg, #4f46e5 0%, #a855f7 50%, #ec4899 100%); height: 180px; display: flex; align-items: center; justify-content: center; color: white; flex-direction: column; gap: 8px; text-shadow: 0 2px 4px rgba(0,0,0,0.5);">
          <span style="font-size: 32px;">🎨</span>
          <span style="font-weight: 700; font-size: 14px;">"${prompt.slice(0, 35)}..."</span>
          <span style="font-size: 11px; opacity: 0.9;">Style: ${this.selectedStyle} · 1024x1024</span>
        </div>
      `;
    }, 500);
  }
}

export class VideoViewController {
  constructor() {
    this.urlInput = document.getElementById("videoUrlInput");
    this.summarizeBtn = document.getElementById("btnSummarizeVideo");
    this.outputSection = document.getElementById("videoOutputSection");
    this.outputBox = document.getElementById("videoOutputBox");
  }

  init() {
    if (!this.summarizeBtn) return;
    this.summarizeBtn.addEventListener("click", () => this.summarize());
  }

  summarize() {
    const url = this.urlInput.value.trim() || "Active YouTube video tab";
    this.outputSection.style.display = "flex";
    this.outputBox.innerHTML = `<em>Fetching transcript and extracting chapter markers...</em>`;

    setTimeout(() => {
      this.outputBox.innerHTML = `
<strong>Key Video Highlights:</strong><br><br>
• <strong>00:00 - Introduction:</strong> Core concepts and architecture overview.<br>
• <strong>02:45 - Live Demo:</strong> Side-by-side performance benchmarks.<br>
• <strong>07:15 - Deep Dive:</strong> Optimizing tokens, cache invalidation, and UI responsiveness.<br>
• <strong>12:30 - Conclusion:</strong> Recommended production best practices.
      `.trim();
    }, 500);
  }
}
