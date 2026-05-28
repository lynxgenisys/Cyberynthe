---
name: Ask Ollama
description: Query the user's local Ollama instance for a second opinion, privacy-safe analysis, or creative generation.
---

# Ask Ollama

This skill allows you to "phone a friend" by querying the user's local Ollama LLM. behavior.

## When to use
*   **Privacy**: When you need to process sensitive data (API keys, PII) and don't want to send it to the cloud.
*   **Cost/Efficiency**: For long, repetitive tasks like summarization or checking for typos.
*   **Specialization**: If the user has a specific fine-tuned model (e.g., for coding or roleplay) that you want to leverage.
*   **Subjectivity**: To get a "second opinion" on code or creative writing.

## How to use

Run the `run_command` tool to execute the bridge script.

### Arguments
*   `intent`: One of `code`, `creative`, `chat`, `general`.
*   `prompt`: The text to send.

### Examples

**1. Code Review (Privacy Safe)**
```bash
node "C:/Users/lynxg/Documents/Agent_Tools/universal_ollama_bridge.mjs" --intent code "Review this function for security flaws: function login(u,p) { ... }"
```

**2. Brainstorming (Creative)**
```bash
node "C:/Users/lynxg/Documents/Agent_Tools/universal_ollama_bridge.mjs" --intent creative "Give me 5 cool names for a Cyberpunk bar."
```

**3. Summarization with Piped Input**
```bash
type large_log_file.txt | node "C:/Users/lynxg/Documents/Agent_Tools/universal_ollama_bridge.mjs" --intent general "Summarize the errors in this log."
```
