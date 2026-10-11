const path = require('path');
const fs = require('fs');
require('dotenv').config();

const envFilePath = path.join(__dirname, '..', '.env');

const config = {
  port: process.env.PORT || 3000,
  host: '0.0.0.0',
  geminiModel: 'gemini-3.1-flash-lite',
  geminiApiBaseUrl: 'https://generativelanguage.googleapis.com/v1beta'
};

/**
 * Dynamically get the API key, checking environment and .env file
 */
function getApiKey() {
  if (process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY.trim().length > 10) {
    return process.env.GEMINI_API_KEY.trim();
  }

  if (fs.existsSync(envFilePath)) {
    try {
      const content = fs.readFileSync(envFilePath, 'utf8');
      const match = content.match(/GEMINI_API_KEY\s*=\s*([^\r\n#]+)/);
      if (match && match[1]) {
        const key = match[1].trim().replace(/^['"]|['"]$/g, '');
        if (key.length > 10) {
          process.env.GEMINI_API_KEY = key;
          return key;
        }
      }
    } catch (_) {}
  }

  return '';
}

function setApiKey(key) {
  const cleanKey = (key || '').trim();
  process.env.GEMINI_API_KEY = cleanKey;
  try {
    let envContent = '';
    if (fs.existsSync(envFilePath)) {
      envContent = fs.readFileSync(envFilePath, 'utf8');
    }
    if (/GEMINI_API_KEY=/.test(envContent)) {
      envContent = envContent.replace(/GEMINI_API_KEY=.*/g, `GEMINI_API_KEY=${cleanKey}`);
    } else {
      envContent += `\nGEMINI_API_KEY=${cleanKey}\n`;
    }
    fs.writeFileSync(envFilePath, envContent.trim() + '\n', 'utf8');
  } catch (err) {
    console.error('Error writing .env file:', err.message);
  }
}

function isKeyConfigured() {
  const key = getApiKey();
  return Boolean(key && key.length > 10);
}

const os = require('os');

function getNetworkAddresses() {
  const interfaces = os.networkInterfaces();
  const addresses = {
    local: '127.0.0.1',
    network: null
  };

  for (const name of Object.keys(interfaces)) {
    for (const net of interfaces[name]) {
      // Look for IPv4 non-internal address
      if (net.family === 'IPv4' && !net.internal) {
        addresses.network = net.address;
        break;
      }
    }
    if (addresses.network) break;
  }

  return addresses;
}

module.exports = {
  config,
  getApiKey,
  setApiKey,
  isKeyConfigured,
  getNetworkAddresses,
  envFilePath
};
