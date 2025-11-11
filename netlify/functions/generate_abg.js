// netlify/functions/generate_abg.js
const fetch = require('node-fetch');

exports.handler = async (event) => {
  try {
    // The scenario is sent from the browser as JSON
    const { scenario } = JSON.parse(event.body);

    // Read your API key from an environment variable
    const apiKey = process.env.OPENAI_API_KEY;

    // Build the prompt (simplified example — insert your CRISPE prompt here)
    const prompt = `Context – You are operating in a high-fidelity simulation... Subject – ${scenario} ...`;

    // Call OpenAI’s chat completion endpoint
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
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

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || 'No output';

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ result: content })
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message })
    };
  }
};
