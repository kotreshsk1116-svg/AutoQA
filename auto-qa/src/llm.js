require('dotenv').config();
const Anthropic = require('@anthropic-ai/sdk');
const yaml = require('js-yaml');

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || 'dummy_key',
});

const MODEL = 'claude-3-5-sonnet-20240620';

/**
 * Resolves an intent to a concrete Playwright action using the accessibility tree.
 */
async function resolveIntent(intent, a11yTree) {
  const prompt = `
You are an Autonomous Quality Engineering Agent. 
Your goal is to map a user's intent to a specific UI element using the provided accessibility tree.

Intent: "${intent}"

Accessibility Tree:
${a11yTree}

Return ONLY a JSON object with the following schema, and no other text:
{
  "action": "click" | "fill",
  "selector": "playwright locator string based on role and name",
  "value": "string value to fill (only if action is fill)",
  "confidence": number between 0 and 1,
  "reasoning": "brief explanation of why this element matches the intent"
}

Example selector: "role=button[name='Add to Cart'i]"
`;

  if (!process.env.ANTHROPIC_API_KEY || process.env.ANTHROPIC_API_KEY === 'dummy_key') {
    return _mockResolve(intent);
  }

  const response = await anthropic.messages.create({
    model: MODEL,
    max_tokens: 500,
    messages: [{ role: 'user', content: prompt }]
  });

  try {
    const text = response.content[0].text;
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    return JSON.parse(jsonMatch[0]);
  } catch (e) {
    throw new Error("Failed to parse Claude resolution response.");
  }
}

/**
 * Triages a failure to determine if it's intentional, a bug, or flaky.
 */
async function triageFailure(intent, expected, domSnapshot, errorMsg) {
  const prompt = `
A test failed. You must determine if this is a real defect or something else.
Intent: ${intent}
Expected Outcome: ${expected}
Error: ${errorMsg}

DOM Snapshot at failure:
${domSnapshot}

Return ONLY a JSON object:
{
  "classification": "Changed" | "Broken" | "Flaky",
  "reasoning": "Explain why"
}
`;

  if (!process.env.ANTHROPIC_API_KEY || process.env.ANTHROPIC_API_KEY === 'dummy_key') {
    return { classification: "Broken", reasoning: "Mock triage: The checkout total calculation is incorrect." };
  }

  const response = await anthropic.messages.create({
    model: MODEL,
    max_tokens: 500,
    messages: [{ role: 'user', content: prompt }]
  });

  try {
    const text = response.content[0].text;
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    return JSON.parse(jsonMatch[0]);
  } catch (e) {
    return { classification: "Broken", reasoning: "Fallback triage due to parse error." };
  }
}

/**
 * Selects tests based on git diff.
 */
async function selectTests(gitDiff, availableTests) {
  const prompt = `
Analyze the following Git diff and select which tests should be run. Prioritize tests affected by these changes.

Git Diff:
${gitDiff}

Available Tests:
${JSON.stringify(availableTests, null, 2)}

Return ONLY a JSON object:
{
  "selectedTestIds": ["id1", "id2"],
  "reasoning": "Why these tests were selected"
}
`;
  if (!process.env.ANTHROPIC_API_KEY || process.env.ANTHROPIC_API_KEY === 'dummy_key') {
    return { selectedTestIds: availableTests.map(t => t.id), reasoning: "Mock: Selected all tests." };
  }

  const response = await anthropic.messages.create({
    model: MODEL,
    max_tokens: 500,
    messages: [{ role: 'user', content: prompt }]
  });

  return JSON.parse(response.content[0].text.match(/\{[\s\S]*\}/)[0]);
}

/**
 * Generates new tests based on code changes.
 */
async function generateTests(gitDiff) {
  const prompt = `
Generate plain-English intent tests for the newly added features in this diff.
Git Diff:
${gitDiff}

Return ONLY a JSON array of objects:
[
  { "id": "test-id", "intent": "User does X", "steps": ["Step 1"], "expect": "Outcome Y", "priority": "high" }
]
`;
  if (!process.env.ANTHROPIC_API_KEY || process.env.ANTHROPIC_API_KEY === 'dummy_key') {
    return [];
  }
  const response = await anthropic.messages.create({
    model: MODEL,
    max_tokens: 1000,
    messages: [{ role: 'user', content: prompt }]
  });
  return JSON.parse(response.content[0].text.match(/\[[\s\S]*\]/)[0]);
}

function _mockResolve(intent) {
  const l = intent.toLowerCase();
  let actionObj = { action: "click", selector: `role=button[name="${intent}"]`, confidence: 0.9, reasoning: "Mock" };
  
  if (l.includes("add to cart")) {
    actionObj = { action: "click", selector: "role=button[name='Add to Cart'i]", confidence: 0.99, reasoning: "Matched add to cart" };
  } else if (l.includes("go to cart")) {
    actionObj = { action: "click", selector: "role=link[name='Cart (1)'i]", confidence: 0.99, reasoning: "Matched cart link" };
  } else if (l.includes("proceed to checkout")) {
    actionObj = { action: "click", selector: "role=link[name='Proceed to Checkout'i]", confidence: 0.99, reasoning: "Matched checkout link" };
  } else if (l.includes("fill in name")) {
    actionObj = { action: "fill", selector: "role=textbox[name='Full Name'i]", value: "Test User", confidence: 0.99, reasoning: "Matched name field" };
  } else if (l.includes("fill in address")) {
    actionObj = { action: "fill", selector: "role=textbox[name='Address'i]", value: "123 Test St", confidence: 0.99, reasoning: "Matched address field" };
  } else if (l.includes("fill in card")) {
    actionObj = { action: "fill", selector: "role=textbox[name='Card Number'i]", value: "1234", confidence: 0.99, reasoning: "Matched card field" };
  } else if (l.includes("place order")) {
    actionObj = { action: "click", selector: "role=button[name='Place Order'i]", confidence: 0.95, reasoning: "Found new Place Order button" };
  }
  return actionObj;
}

module.exports = { resolveIntent, triageFailure, selectTests, generateTests };
