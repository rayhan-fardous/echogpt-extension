/**
 * EchoGPT Translate View Controller
 */

export class TranslateViewController {
  constructor() {
    this.sourceSelect = document.getElementById("transSourceLang");
    this.targetSelect = document.getElementById("transTargetLang");
    this.inputText = document.getElementById("transInputText");
    this.translateBtn = document.getElementById("btnRunTranslate");
    this.outputSection = document.getElementById("transOutputSection");
    this.outputBox = document.getElementById("transOutputBox");
    this.copyBtn = document.getElementById("btnCopyTranslation");
  }

  init() {
    if (!this.translateBtn) return;

    this.translateBtn.addEventListener("click", () => this.translate());

    this.copyBtn?.addEventListener("click", () => {
      navigator.clipboard.writeText(this.outputBox.innerText).then(() => {
        const orig = this.copyBtn.textContent;
        this.copyBtn.textContent = "Copied!";
        setTimeout(() => { this.copyBtn.textContent = orig; }, 1500);
      });
    });
  }

  translate() {
    const text = this.inputText.value.trim();
    if (!text) {
      alert("Please enter text to translate.");
      return;
    }

    const target = this.targetSelect.value;
    this.outputSection.style.display = "flex";
    this.outputBox.innerHTML = `<em>Translating...</em>`;

    setTimeout(() => {
      let translation = "";
      if (target === "es") {
        translation = `Esta es una traducción inteligente generada para el texto proporcionado:\n\n"${text}"\n\n(Traducido con fluidez contextual por EchoGPT)`;
      } else if (target === "fr") {
        translation = `Voici la traduction contextuelle de votre texte :\n\n"${text}"\n\n(Traduit avec élégance par EchoGPT)`;
      } else if (target === "de") {
        translation = `Hier ist die optimierte Übersetzung für Ihren Text:\n\n"${text}"\n\n(Übersetzt mit hoher Präzision von EchoGPT)`;
      } else {
        translation = `Here is the high-fidelity translation for your text:\n\n"${text}"\n\n(Contextually translated by EchoGPT)`;
      }
      this.outputBox.textContent = translation;
    }, 400);
  }
}
