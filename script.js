/*
 * script.js
 *
 * Handles user interaction on the ABG frontend page. When the form is submitted,
 * it packages the user‑entered scenario and forwards it to a Netlify serverless
 * function. That backend function is responsible for assembling the full prompt
 * (using your prompt template) and communicating with the OpenAI API via a
 * secret API key stored in an environment variable. This ensures the client
 * never holds sensitive information.
 *
 * NOTE: Do **not** embed your OpenAI API key or the prompt template in this
 * client‑side code. Sensitive values should be stored on the server side,
 * for example in a Netlify Function, to keep them hidden from site visitors.
 */

document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('abgForm');
  const scenarioInput = document.getElementById('scenario');
  const outputPre = document.getElementById('output');

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    const scenario = scenarioInput.value.trim();
    // Ensure the user provided a scenario
    if (!scenario) {
      outputPre.textContent = 'Please enter a clinical scenario.';
      return;
    }

    // Notify the user that a request is in progress
    outputPre.textContent = 'Generating report…';

    try {
      /*
       * In a production environment your API key should never live in client‑side
       * JavaScript. Instead, we call a Netlify serverless function that holds
       * the secret key and communicates with the OpenAI API on our behalf.
       *
       * The serverless function is expected to be defined in
       * `netlify/functions/generate_abg.js` and to accept a JSON body with a
       * `scenario` property. It should return a JSON response with a `result`
       * property containing the formatted report. See README or docs for
       * details.
       */
      const response = await fetch('/.netlify/functions/generate_abg', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ scenario })
      });

      if (!response.ok) {
        throw new Error('Backend API error: ' + response.status);
      }

      const data = await response.json();
      // The serverless function returns an object with `result` or `error`
      if (data.error) {
        outputPre.textContent = 'Error: ' + data.error;
        return;
      }
      // Display the returned report (plain text)
      outputPre.textContent = data.result || 'No report received.';
    } catch (err) {
      outputPre.textContent = 'Error: ' + err.message;
    }
  });
});
