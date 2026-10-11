const { config, getApiKey, isKeyConfigured } = require('./config');

const PREFERRED_MODELS = [
  'gemini-3.1-flash-lite',
  'gemini-3.1-flash-lite-preview',
  'gemini-2.5-flash-lite',
  'gemini-2.5-flash'
];

/**
 * Robust Gemini API caller strictly prioritizing Gemini 3.1 Flash-Lite
 */
async function callGemini({ systemInstruction, prompt, temperature = 0.7, maxTokens = 8192, jsonMode = false, retries = 2 }) {
  const apiKey = getApiKey();
  if (!apiKey) {
    throw new Error('Gemini API key is not configured in .env or environment.');
  }

  const modelsToTry = [
    config.geminiModel || 'gemini-3.1-flash-lite',
    ...PREFERRED_MODELS.filter(m => m !== (config.geminiModel || 'gemini-3.1-flash-lite'))
  ];

  let lastError = null;

  for (const model of modelsToTry) {
    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        const url = `${config.geminiApiBaseUrl}/models/${model}:generateContent?key=${apiKey}`;

        const body = {
          contents: [
            {
              role: 'user',
              parts: [{ text: prompt }]
            }
          ],
          generationConfig: {
            temperature,
            maxOutputTokens: maxTokens,
            responseMimeType: jsonMode ? 'application/json' : 'text/plain'
          }
        };

        if (systemInstruction) {
          body.systemInstruction = {
            parts: [{ text: systemInstruction }]
          };
        }

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 35000);

        const response = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
          signal: controller.signal
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          const errorText = await response.text();
          // Rate limit or server error: wait before retry
          if (response.status === 429 || response.status >= 500) {
            console.warn(`Model ${model} returned status ${response.status}. Retrying in 1.5s...`);
            await new Promise(r => setTimeout(r, 1500));
            continue;
          }
          throw new Error(`Model ${model} responded with ${response.status}: ${errorText}`);
        }

        const data = await response.json();
        const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (!text) {
          throw new Error(`Model ${model} returned empty response.`);
        }

        config.geminiModel = model;
        return text;
      } catch (err) {
        lastError = err;
        console.warn(`Attempt ${attempt} with model ${model} failed:`, err.message);
        if (attempt < retries) {
          await new Promise(r => setTimeout(r, 1200));
        }
      }
    }
  }

  throw lastError || new Error('All Gemini model endpoints failed.');
}

module.exports = {
  callGemini,
  isKeyConfigured,
  PREFERRED_MODELS
};
