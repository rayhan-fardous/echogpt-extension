/**
 * EchoGPT Slash Commands & Prompt Enhancer
 */

export class SlashCommandsController {
  constructor(textarea, onSelectCommand) {
    this.textarea = textarea;
    this.popover = document.getElementById("slashPopover");
    this.onSelectCommand = onSelectCommand;
  }

  init() {
    if (!this.textarea || !this.popover) return;

    this.textarea.addEventListener("input", () => {
      const val = this.textarea.value;
      if (val === "/" || val.endsWith(" /")) {
        this.show();
      } else {
        this.hide();
      }
    });

    this.popover.querySelectorAll(".slash-item").forEach(item => {
      item.addEventListener("click", () => {
        const cmd = item.dataset.cmd;
        this.applyCommand(cmd);
      });
    });

    document.addEventListener("click", (e) => {
      if (!this.popover.contains(e.target) && e.target !== this.textarea) {
        this.hide();
      }
    });
  }

  show() {
    this.popover.style.display = "flex";
  }

  hide() {
    this.popover.style.display = "none";
  }

  applyCommand(cmd) {
    let template = "";
    if (cmd === "/summarize") {
      template = "Please provide an executive summary of this content, emphasizing key takeaways and strategic implications.";
    } else if (cmd === "/bullets") {
      template = "Extract the top 5 most important insights as concise bullet points.";
    } else if (cmd === "/code") {
      template = "Write clean, modular, and performant code for this requirement, including type hints and unit tests.";
    } else if (cmd === "/explain") {
      template = "Explain this concept in simple, intuitive terms as if explaining to a beginner, with a clear analogy.";
    } else if (cmd === "/fix") {
      template = "Proofread, fix any grammar issues, and elevate the tone to sound professional and articulate.";
    }

    this.textarea.value = template;
    this.hide();
    this.textarea.focus();
    if (this.onSelectCommand) this.onSelectCommand(template);
  }
}

export class PromptEnhancer {
  constructor(textarea, enhanceBtn) {
    this.textarea = textarea;
    this.enhanceBtn = enhanceBtn;
  }

  init() {
    if (!this.enhanceBtn || !this.textarea) return;

    this.enhanceBtn.addEventListener("click", () => this.enhance());
  }

  enhance() {
    const raw = this.textarea.value.trim();
    if (!raw) {
      this.textarea.value = "Analyze the primary concepts, outline strategic steps, and provide code or concrete examples.";
      this.textarea.focus();
      return;
    }

    // Transform into structured high-performance prompt
    this.enhanceBtn.style.color = "var(--brand-primary)";
    const enhanced = `Act as an expert technical consultant. Provide a comprehensive, step-by-step breakdown regarding:\n"${raw}"\n\nStructure your response with:\n1. Core Principles\n2. Concrete Recommendations\n3. Actionable Examples or Code`;
    this.textarea.value = enhanced;
    this.textarea.style.height = "auto";
    this.textarea.style.height = Math.min(this.textarea.scrollHeight, 130) + "px";
    this.textarea.focus();

    setTimeout(() => {
      this.enhanceBtn.style.color = "";
    }, 1200);
  }
}
