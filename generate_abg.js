const fetch = require('node-fetch');
const fs = require('fs');
const path = require('path');

/*
 * Netlify Function: generate_abg
 *
 * This serverless function acts as a proxy between your front‑end and OpenAI.
 * It receives a JSON body with a `scenario` string, inserts that into a base
 * prompt template stored on disk, and then calls OpenAI's chat completion
 * endpoint. The API key is read from the OPENAI_API_KEY environment variable,
 * which you set via Netlify's UI or CLI so that it is not exposed to clients.
 *
 * See README or docs for details on environment variables and Netlify Functions.
 */

exports.handler = async (event) => {
  try {
    // Allow only POST requests
    if (event.httpMethod !== 'POST') {
      return { statusCode: 405, body: 'Method Not Allowed' };
    }

    const { scenario } = JSON.parse(event.body || '{}');
    if (!scenario) {
      return { statusCode: 400, body: JSON.stringify({ error: 'Missing scenario' }) };
    }

    // Read the base prompt template from the filesystem. The template should
    // reside in the abg_frontend directory and contain a `{scenario}` placeholder.
    const templatePath = path.join(__dirname, '..', '..', 'abg_frontend', 'prompt_template.txt');
    let basePrompt = '';
    try {
      basePrompt = fs.readFileSync(templatePath, 'utf8');
    } catch (readErr) {
      return { statusCode: 500, body: JSON.stringify({ error: 'Unable to read prompt template' }) };
    }

    // Insert the scenario into the template. Ensure the placeholder exists.
    const prompt = basePrompt.includes('{scenario}')
      ? basePrompt.replace('{scenario}', scenario)
      : `${basePrompt}\n\nSubject – ${scenario}`;

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return { statusCode: 500, body: JSON.stringify({ error: 'API key not configured' }) };
    }

    // Call OpenAI’s chat completion API. Adjust parameters as needed.
    const apiRes = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-4-turbo',
        messages: [
          { role: 'system', content: 'You are an ABG analyser.' },
          { role: 'user', content: prompt }
        ],
        max_tokens: 800,
        temperature: 0.5
      })
    });

    if (!apiRes.ok) {
      return { statusCode: apiRes.status, body: JSON.stringify({ error: 'OpenAI API error' }) };
    }
    const apiData = await apiRes.json();
    const content = apiData.choices?.[0]?.message?.content ?? '';

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ result: content })
    };
  } catch (err) {
    return { statusCode: 500, body: JSON.stringify({ error: err.message }) };
  }
};