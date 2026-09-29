/**
 * EchoGPT Dual-AI Compare View Controller
 */

export class CompareViewController {
  constructor() {
    this.promptInput = document.getElementById("comparePromptInput");
    this.compareBtn = document.getElementById("btnRunCompare");
    this.resultA = document.getElementById("compareResultA");
    this.resultB = document.getElementById("compareResultB");
  }

  init() {
    if (!this.compareBtn) return;
    this.compareBtn.addEventListener("click", () => this.runComparison());
  }

  runComparison() {
    const prompt = this.promptInput.value.trim() || "Explain SQL vs NoSQL";
    this.resultA.innerHTML = `<em>EchoGPT Turbo streaming...</em>`;
    this.resultB.innerHTML = `<em>Claude 3.5 Sonnet streaming...</em>`;

    setTimeout(() => {
      this.resultA.innerHTML = `
<strong>EchoGPT Turbo (Speed & Practical Focus):</strong><br>
• <strong>SQL:</strong> Relational, fixed schema, ACID compliant. Ideal for finance, orders, and complex relational JOINs.<br>
• <strong>NoSQL:</strong> Non-relational (Document, Key-Value, Graph), horizontal scalability. Ideal for high write loads and unstructured telemetry.<br><br>
<em>Speed: 42ms · Verdict: Fast concise breakdown</em>
      `;

      this.resultB.innerHTML = `
<strong>Claude 3.5 Sonnet (Deep Architectural Nuance):</strong><br>
The trade-off hinges on the <strong>CAP theorem</strong> and consistency models:<br>
• <strong>Relational (PostgreSQL):</strong> Strong consistency, strict foreign keys, predictable query planners, vertical scale with read replicas.<br>
• <strong>Distributed (MongoDB/Cassandra):</strong> Eventual consistency, partitioned sharding, schema flexibility at the cost of atomic cross-table transactions.<br><br>
<em>Speed: 98ms · Verdict: Comprehensive systems insight</em>
      `;
    }, 500);
  }
}
