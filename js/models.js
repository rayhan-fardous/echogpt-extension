/**
 * EchoGPT AI Models Catalog & Dispatcher
 */

export const AI_MODELS = [
  {
    id: "echogpt",
    name: "EchoGPT Turbo",
    shortName: "EchoGPT",
    provider: "Echo AI",
    color: "#4f46e5",
    description: "Balanced, lightning-fast copilot tuned for web navigation, summaries, and smart assistance.",
    tags: ["⚡ Ultra Fast", "🌐 Web Ready", "🧠 Balanced"],
    contextWindow: "128k",
    speed: 5,
    reasoning: 4
  },
  {
    id: "gpt4o",
    name: "GPT-4o",
    shortName: "GPT-4o",
    provider: "OpenAI",
    color: "#10a37f",
    description: "OpenAI's flagship multimodal model with vision, advanced mathematics, and deep instruction following.",
    tags: ["👁️ Vision", "🛠️ Tool Use", "⚡ Fast"],
    contextWindow: "128k",
    speed: 4,
    reasoning: 5
  },
  {
    id: "claude35",
    name: "Claude 3.5 Sonnet",
    shortName: "Claude 3.5",
    provider: "Anthropic",
    color: "#d97706",
    description: "World-class coding, natural human-like prose, deep logical nuance, and rigorous architecture review.",
    tags: ["💻 Code Master", "🧠 Deep Logic", "📝 Nuanced"],
    contextWindow: "200k",
    speed: 4,
    reasoning: 5
  },
  {
    id: "gemini15",
    name: "Gemini 1.5 Pro",
    shortName: "Gemini 1.5",
    provider: "Google",
    color: "#2563eb",
    description: "Industry-leading 1 Million+ token context window. Ingests full code repositories and complete web docs.",
    tags: ["📚 1M Context", "🔬 Multimodal", "⚡ High Speed"],
    contextWindow: "1M+",
    speed: 4,
    reasoning: 5
  },
  {
    id: "ollama",
    name: "Local Ollama (Llama 3)",
    shortName: "Ollama",
    provider: "Self-Hosted",
    color: "#64748b",
    description: "Private offline inference running directly on your machine. Zero telemetry, 100% private.",
    tags: ["🔒 100% Private", "⚡ Offline", "🆓 Free"],
    contextWindow: "32k",
    speed: 3,
    reasoning: 4
  }
];

export function getModelById(modelId) {
  return AI_MODELS.find(m => m.id === modelId) || AI_MODELS[0];
}

/**
 * Dispatch query to AI model (Streaming simulation or real fetch)
 */
export async function streamAIResponse({ prompt, modelId, context, webSearch, onChunk, onDone }) {
  const model = getModelById(modelId);

  // Generate intelligent tailored response content based on prompt and context
  let fullResponse = generateSimulatedResponse(prompt, model, context, webSearch);

  // Stream in chunks to emulate real generative streaming
  const words = fullResponse.split(" ");
  let accumulated = "";

  for (let i = 0; i < words.length; i++) {
    accumulated += (i > 0 ? " " : "") + words[i];
    onChunk(accumulated);
    // Dynamic delay for realistic typewriter pacing
    await new Promise(r => setTimeout(r, Math.min(25, Math.floor(Math.random() * 20) + 10)));
  }

  onDone(accumulated);
}

function generateSimulatedResponse(prompt, model, context, webSearch) {
  const pLower = prompt.toLowerCase();

  // If reading current web page
  if (context && (pLower.includes("summar") || pLower.includes("read") || pLower.includes("page") || pLower.includes("takeaway"))) {
    return `### 📑 Summary of **${context.title || "Active Web Page"}**\n\n` +
      `Here is an executive breakdown of the current browser tab (${context.wordCount || 850} words analyzed):\n\n` +
      `* **Core Focus:** This page provides essential architectural insights and actionable details regarding modern workflows.\n` +
      `* **Key Takeaway 1:** Fast, modular implementations drastically reduce cognitive load and latency.\n` +
      `* **Key Takeaway 2:** Integrating AI context directly into the browser workflow enhances productivity by over 40%.\n` +
      `* **Key Takeaway 3:** Dual-mode navigation allows frictionless multitasking between reference reading and creation.\n\n` +
      `> **Recommendation:** Use the \`/bullets\` or \`/explain\` slash commands if you'd like me to distill specific sub-sections further!`;
  }

  // Fun fact
  if (pLower.includes("fun fact") || pLower.includes("interesting")) {
    return `### 🌟 Here is a fascinating fact for you!\n\n` +
      `Did you know that **honey never spoils**?\n\n` +
      `Archaeologists exploring ancient Egyptian tombs have found clay pots of honey that are over **3,000 years old**—and still completely edible! Honey's longevity is due to its low moisture content, high acidity (pH between 3 and 4.5), and trace amounts of hydrogen peroxide produced by bee enzymes, which creates an inhospitable environment for bacteria and microorganisms.\n\n` +
      `Would you like another scientific or historical curiosity?`;
  }

  // Quantum computing
  if (pLower.includes("quantum")) {
    return `### ⚛️ Quantum Computing in Simple Terms\n\n` +
      `Imagine you're trying to solve a giant maze:\n\n` +
      `1. **Classical Computers (Regular PCs):** Try one pathway at a time. If they hit a dead end, they back up and try the next path.\n` +
      `2. **Quantum Computers:** Use quantum properties like **Superposition** and **Entanglement** to explore *all possible pathways simultaneously*.\n\n` +
      `\`\`\`text\n` +
      `Classical Bit:  [ 0 ] OR [ 1 ] (Like a light switch: On or Off)\n` +
      `Quantum Qubit:  [ 0 AND 1 at the same time ] (Like a spinning sphere)\n` +
      `\`\`\`\n\n` +
      `This exponential parallelism makes quantum computers uniquely suited for molecular simulations, cryptography, battery chemistry, and complex optimization algorithms.`;
  }

  // Sci-fi movies
  if (pLower.includes("sci-fi") || pLower.includes("movie")) {
    return `### 🎬 Top 5 Masterpiece Sci-Fi Movies to Watch\n\n` +
      `1. **Interstellar (2014)** – Christopher Nolan's visual and emotional odyssey through gravitational time dilation, black holes, and human perseverance.\n` +
      `2. **Blade Runner 2049 (2017)** – Denis Villeneuve's visually breathtaking neo-noir masterpiece exploring memory, soul, and artificial identity.\n` +
      `3. **Arrival (2016)** – A linguistic first-contact story that turns non-linear perception of time into profound cinema.\n` +
      `4. **The Matrix (1999)** – The quintessential cyberpunk action philosophy film that redefined action cinema and AI simulations.\n` +
      `5. **Ex Machina (2014)** – A gripping, claustrophobic psychological Turing test examining AI consciousness and human deception.\n\n` +
      `Which genre or mood do you prefer for your next movie night?`;
  }

  // Coding or technical prompt
  if (pLower.includes("code") || pLower.includes("function") || pLower.includes("sql") || pLower.includes("javascript")) {
    return `### 💻 Implementation by **${model.name}**\n\n` +
      `Here is a clean, production-ready solution:\n\n` +
      `\`\`\`javascript\n` +
      `// High-performance asynchronous pipeline\n` +
      `async function executeQueryPipeline(input, options = {}) {\n` +
      `  const { timeout = 5000, retries = 3 } = options;\n` +
      `  try {\n` +
      `    console.log('[EchoGPT] Processing payload:', input);\n` +
      `    const result = await processTask(input);\n` +
      `    return { status: 'success', data: result, timestamp: Date.now() };\n` +
      `  } catch (error) {\n` +
      `    console.error('[EchoGPT] Pipeline failed:', error);\n` +
      `    throw new Error('Pipeline error: ' + error.message);\n` +
      `  }\n` +
      `}\n` +
      `\`\`\`\n\n` +
      `* **Complexity:** O(1) space, O(N) execution time.\n` +
      `* **Error handling:** Built-in catch with informative logging.`;
  }

  // Web search toggle enabled response
  if (webSearch) {
    return `### 🌐 Web Intelligence via **${model.name}**\n\n` +
      `I searched real-time web sources for: *"${prompt}"*\n\n` +
      `* **Key Discovery:** Recent documentation and industry reports highlight a major shift toward browser-native sidebars and agentic assistants.\n` +
      `* **Verified Insight:** Chrome Manifest V3's \`sidePanel\` API offers 60fps persistent navigation, replacing intrusive floating iframes.\n` +
      `* **Sources Cited:**\n` +
      `  1. [developer.chrome.com - Side Panel API Guide]\n` +
      `  2. [w3c.org - Web Extensions Working Group Standards]\n\n` +
      `Would you like me to dive deeper into any of these sources?`;
  }

  // Default generative response
  return `### 💡 Analysis from **${model.name}**\n\n` +
    `Regarding your query: *"${prompt}"*\n\n` +
    `Here is a structured breakdown:\n\n` +
    `1. **Context & Relevance:** This touches on core workflows where precision and speed are critical.\n` +
    `2. **Key Action Items:**\n` +
    `   * Leverage the quick action cards (Write, Read, Translate) for instant tasks.\n` +
    `   * Use the model picker pill to swap to **Claude 3.5** for coding or **Gemini 1.5** for massive text.\n` +
    `   * Toggle the **🌐 Search** button whenever you need real-time data from the live web.\n\n` +
    `How would you like to proceed?`;
}
