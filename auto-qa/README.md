# Autonomous Quality Engineering (AQE) MVP

This is an AI-powered QA system designed to cut manual test maintenance and increase release confidence. It relies on Playwright for rock-solid interaction and Claude for reasoning-based self-healing and test generation.

## Features
- **Intent-Based Tests:** Define what the test achieves, not how it clicks.
- **Self-Healing:** If selectors break, Claude reads the accessibility tree to find the new element and caches it for future runs.
- **Diff-based Selection & Generation:** Analyzes your PR to only run affected tests, and drafts new ones for untested code.
- **Scanners:** Integrates with Axe-core, Lighthouse, and OWASP ZAP.
- **Go/No-Go Triage:** Accurately classifies intentional changes vs real defects.

## Setup

1. Make sure you have Node.js 18+ installed.
2. Install dependencies:
   ```bash
   npm install
   ```
3. (Optional) Install Playwright browsers if you want to run the Playwright runner:
   ```bash
   npx playwright install chromium
   ```
4. Configure your `.env` file with your Anthropic API Key for actual Claude integration:
   ```env
   ANTHROPIC_API_KEY=your_key_here
   ```
   *(Note: If you leave the key blank or use `dummy_key`, the script runs in MVP Mock mode and simulates Claude's responses.)*

## How to Run

1. **Start the Demo App**
   In another terminal, navigate to `../demo-app` and start the target application:
   ```bash
   cd ../demo-app
   npm run dev
   ```

2. **Execute AQE**
   Run the orchestrator script:
   ```bash
   npm run test
   # OR
   node index.js
   ```

3. **Check the Report**
   The AQE system will output a `pr_comment_report.md` file in the root of this folder containing the GitHub PR markdown comment, including the Go/No-Go decision and all quality metrics.
