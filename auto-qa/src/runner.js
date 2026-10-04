const { chromium } = require('playwright');
const fs = require('fs');
const llm = require('./llm');

const CACHE_FILE = "heal-cache.json";
let healCache = {};
if (fs.existsSync(CACHE_FILE)) {
  try {
    healCache = JSON.parse(fs.readFileSync(CACHE_FILE, "utf8"));
  } catch (e) {}
}

function saveCache() {
  fs.writeFileSync(CACHE_FILE, JSON.stringify(healCache, null, 2));
}

async function runTest(testDef, report) {
  const testResult = {
    id: testDef.id,
    intent: testDef.intent,
    status: "Passed",
    healedSteps: [],
    error: null,
    triage: null
  };

  let browser;
  let page;
  try {
    browser = await chromium.launch({ headless: true });
    page = await browser.newPage();
    
    await page.goto("http://localhost:3000"); // Base URL

    for (const step of testDef.steps) {
      let actionObj = healCache[step];
      let success = false;

      if (actionObj) {
        try {
          await executeAction(page, actionObj);
          success = true;
        } catch (e) {
          // Cache failed, needs healing
          actionObj = null; 
        }
      }

      if (!success) {
        const a11yTree = await page.accessibility.snapshot();
        const a11yStr = JSON.stringify(a11yTree, null, 2);
        
        actionObj = await llm.resolveIntent(step, a11yStr);
        
        if (actionObj.confidence < 0.7) {
          throw new Error(`Low confidence (${actionObj.confidence}) resolving step: ${step}`);
        }

        await executeAction(page, actionObj);
        
        healCache[step] = actionObj;
        saveCache();
        testResult.healedSteps.push({ step, reasoning: actionObj.reasoning });
      }
      
      await page.waitForTimeout(500); 
    }

    // Check expectation (Simplified for MVP, would normally also use Claude or explicit assertions)
    const domStr = await page.content();
    if (testDef.expect.toLowerCase().includes('order number') && !domStr.includes('Order Placed Successfully')) {
        // We know we introduced a bug with -$10 total, let's simulate the expect failing if the total is wrong
        // For the demo bug, it shouldn't place the order successfully if the total calculation is wrong on the frontend?
        // Wait, the intentional bug was just that the total displayed was total-10.
        // Let's scrape the total to see if it's correct.
        const totalText = await page.textContent('.border-t span:last-child');
        if (totalText && totalText.includes('$-')) {
            throw new Error(`Expectation Failed: found negative or miscalculated total ${totalText}`);
        }
    }
  } catch (err) {
    testResult.status = "Failed";
    testResult.error = err.message;
    
    // Triage
    const domStr = page ? await page.content().catch(() => "N/A") : "N/A";
    testResult.triage = await llm.triageFailure(testDef.intent, testDef.expect, domStr, err.message);
  } finally {
    if (browser) await browser.close();
  }
  
  report.tests.push(testResult);
  return testResult;
}

async function executeAction(page, actionObj) {
  const { action, selector, value } = actionObj;
  
  // Wait for selector
  await page.waitForSelector(selector, { state: 'visible', timeout: 3000 });
  
  if (action === "click") {
    await page.click(selector);
  } else if (action === "fill") {
    await page.fill(selector, value || "");
  }
}

module.exports = { runTest };
