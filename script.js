/*
 * script.js

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
