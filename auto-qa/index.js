const fs = require('fs');
const yaml = require('js-yaml');
const llm = require('./src/llm');
const runner = require('./src/runner');
const scanners = require('./src/scanners');
const reportGen = require('./src/report');

async function getGitDiff() {
  // In a real scenario, use simple-git to get the diff.
  // For the demo, we simulate the PR diff where the checkout button changed and a total bug was introduced.
  return `
diff --git a/demo-app/src/app/checkout/page.tsx b/demo-app/src/app/checkout/page.tsx
--- a/demo-app/src/app/checkout/page.tsx
+++ b/demo-app/src/app/checkout/page.tsx
-              <span>\${total}</span>
+              <span>\${Math.max(0, total - 10)}</span>
-            <button id="btn-checkout-v1" type="submit" className="...">
-              Pay Now
+            <button id="btn-confirm-order-v2" type="submit" className="...">
+              Place Order
  `;
}

async function main() {
  console.log("=== Autonomous Quality Engineering (AQE) MVP ===");
  
  const reportObj = { tests: [], security: [], accessibility: [], performance: {} };
  const diff = await getGitDiff();

  // 1. Load available tests
  console.log("\\n[1/5] Loading available tests...");
  const availableTests = [];
  const files = fs.readdirSync("./tests").filter(f => f.endsWith('.yaml'));
  for (const f of files) {
    const content = yaml.load(fs.readFileSync(`./tests/${f}`, 'utf8'));
    const tArr = Array.isArray(content) ? content : [content];
    availableTests.push(...tArr);
  }

  // 2. Risk-based test selection & Test Generation
  console.log("[2/5] Analyzing PR diff for test selection & generation...");
  const selectionResult = await llm.selectTests(diff, availableTests);
  console.log(`   Selected tests: ${selectionResult.selectedTestIds.join(", ")} (${selectionResult.reasoning})`);
  
  const generatedTests = await llm.generateTests(diff);
  if (generatedTests && generatedTests.length > 0) {
    console.log(`   Generated ${generatedTests.length} advisory tests from diff.`);
  }

  const testsToRun = availableTests.filter(t => selectionResult.selectedTestIds.includes(t.id));

  // 3. Playwright execution & Self-healing
  console.log("\\n[3/5] Executing Intent Tests via Playwright...");
  for (const test of testsToRun) {
    await runner.runTest(test, reportObj);
  }

  // 4. Scanners (Accessibility, Performance, Security)
  console.log("\\n[4/5] Running Quality Scanners...");
  await scanners.runScanners(reportObj);

  // 5. Generate Report
  console.log("\\n[5/5] Generating PR Quality Report...");
  reportGen.generateMarkdownReport(reportObj);
  
  console.log("\\n=== AQE Run Complete ===");
}

main().catch(console.error);
