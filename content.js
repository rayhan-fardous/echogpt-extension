/**
 * EchoGPT Content Script
 * Extracts readable article content, metadata, and user selections
 */

function extractPageContent() {
  const title = document.title || "";
  const url = window.location.href;
  
  // Try to find meta description
  const metaDesc = document.querySelector('meta[name="description"]')?.getAttribute("content") || "";

  // Clone document body to clean it without modifying the live DOM
  const clone = document.body.cloneNode(true);

  // Remove clutter elements
  const removeSelectors = [
    "script", "style", "noscript", "svg", "header", "footer", "nav",
    "aside", ".ad", ".ads", ".advertisement", ".cookie-banner", "#comments"
  ];
  removeSelectors.forEach(sel => {
    clone.querySelectorAll(sel).forEach(el => el.remove());
  });

  // Extract headings
  const headings = Array.from(clone.querySelectorAll("h1, h2, h3"))
    .map(h => h.innerText.trim())
    .filter(Boolean)
    .slice(0, 8);

  // Extract clean text
  let rawText = clone.innerText || "";
  // Clean multiple newlines and spaces
  const cleanText = rawText.replace(/\n\s*\n+/g, "\n\n").trim();
  
  // Approximate word count
  const words = cleanText.split(/\s+/).filter(Boolean);
  const wordCount = words.length;
  // Estimate tokens (~0.75 words per token)
  const tokenCount = Math.round(wordCount * 1.3);

  // Take up to first 4,000 words for context safety
  const excerpt = words.slice(0, 3500).join(" ");

  return {
    title,
    url,
    metaDesc,
    headings,
    cleanText: excerpt,
    wordCount,
    tokenCount,
    hasSelection: !!window.getSelection()?.toString().trim(),
    selectionText: window.getSelection()?.toString().trim() || ""
  };
}

// Listen for requests from popup or sidepanel
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === "EXTRACT_PAGE_CONTENT") {
    try {
      const data = extractPageContent();
      sendResponse({ success: true, data });
    } catch (err) {
      sendResponse({ success: false, error: err.message });
    }
  }

  if (request.type === "GET_SELECTION") {
    const text = window.getSelection()?.toString().trim() || "";
    sendResponse({ text });
  }

  return true;
});
