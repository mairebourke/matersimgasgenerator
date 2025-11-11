/*
 * script.js
 *
 * Handles user interaction on the ABG frontend page. When the form is submitted,
 * it constructs a prompt by combining the user‑entered scenario with a base
 * instruction template (see prompt_template.txt) and calls the OpenAI API.
 *
 * NOTE: Replace `YOUR_API_KEY_HERE` with a valid OpenAI API key. You should
 * secure your API key using environment variables or a backend proxy. Never
 * expose secrets in client‑side code for production use.
 */

document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('abgForm');
  const scenarioInput = document.getElementById('scenario');
  const outputPre = document.getElementById('output');

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    const scenario = scenarioInput.value.trim();
    if (!scenario) {
      outputPre.textContent = 'Please enter a clinical scenario.';
      return;
    }
    outputPre.textContent = 'Generating report…';
    try {
      // Read the base prompt template from the server. In a production setup
      // you might store this in an environment variable or serve it via your
      // backend to avoid exposing it publicly. Here we fetch it from a local
      // text file.
      const tmplRes = await fetch('prompt_template.txt');
      const basePrompt = await tmplRes.text();

      // Inject the user scenario into the template. The template contains
      // `{scenario}` as a placeholder for replacement.
      const finalPrompt = basePrompt.replace('{scenario}', scenario);

      // Call the OpenAI Chat Completion API. Adjust model name and parameters
      // as needed. See https://platform.openai.com/docs/api-reference for
      // details. Ensure CORS is handled by calling from a backend in production.
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer YOUR_API_KEY_HERE`
        },
        body: JSON.stringify({
          model: 'gpt-4-turbo',
          messages: [
            { role: 'system', content: 'You are a helpful assistant.' },
            { role: 'user', content: finalPrompt }
          ],
          max_tokens: 800,
          temperature: 0.5
        })
      });
      if (!response.ok) {
        throw new Error('OpenAI API error: ' + response.status);
      }
      const data = await response.json();
      const reply = data.choices[0]?.message?.content || 'No response received.';
      outputPre.textContent = reply;
    } catch (err) {
      outputPre.textContent = 'Error: ' + err.message;
    }
  });
});