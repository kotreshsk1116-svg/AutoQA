const { chromium } = require('playwright');
const { injectAxe, getViolations } = require('axe-playwright');
const { execSync } = require('child_process');

async function runScanners(report) {
  console.log("Running Accessibility Scan...");
  await runAxe(report);
  
  console.log("Running Performance Scan (Lighthouse)...");
  await runLighthouse(report);
  
  console.log("Running Security Scan (ZAP)...");
  await runZap(report);
}

async function runAxe(report) {
  try {
    const browser = await chromium.launch();
    const page = await browser.newPage();
    await page.goto('http://localhost:3000');
    await injectAxe(page);
    const violations = await getViolations(page);
    report.accessibility = violations.map(v => ({ id: v.id, impact: v.impact, description: v.description }));
    await browser.close();
  } catch (e) {
    report.accessibility = [{ error: e.message }];
  }
}

async function runLighthouse(report) {
  try {
    // For MVP, we mock the lighthouse CLI call to avoid installing huge dependencies globally
    // Real implementation: execSync('lighthouse http://localhost:3000 --output json --output-path ./lh-report.json')
    report.performance = {
      score: 0.95,
      metrics: {
        FCP: "1.2s",
        LCP: "2.1s",
        TTI: "1.5s"
      },
      note: "Mocked for MVP. Run 'npm install -g lighthouse' to enable real scans."
    };
  } catch (e) {
    report.performance = { error: e.message };
  }
}

async function runZap(report) {
  try {
    // For MVP, we mock the ZAP baseline scan
    // Real implementation: execSync('docker run -t owasp/zap2docker-stable zap-baseline.py -t http://host.docker.internal:3000')
    report.security = [
      { alert: "X-Content-Type-Options Header Missing", risk: "Low" },
      { alert: "Mocked ZAP results. Requires docker for real scan.", risk: "Info" }
    ];
  } catch (e) {
    report.security = [{ error: e.message }];
  }
}

module.exports = { runScanners };
