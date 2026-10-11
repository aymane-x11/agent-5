const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const { config, setApiKey, isKeyConfigured, getNetworkAddresses } = require('./src/config');
const { executeGenerationPipeline, executeModification, getSession } = require('./src/pipeline');

const app = express();
const PORT = config.port || 3000;

// Security Middleware & Headers
app.use(cors({
  origin: true,
  credentials: true
}));

app.use(express.json({ limit: '1mb' }));
app.use(express.static(path.join(__dirname, 'public'), {
  maxAge: '1h',
  etag: true
}));

// Comprehensive Security Headers
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  // Content Security Policy permitting CDNs used by platform and preview
  res.setHeader('Content-Security-Policy', "default-src 'self'; script-src 'self' 'unsafe-inline' https://cdn.tailwindcss.com https://unpkg.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com data:; img-src 'self' data: https: blob:; connect-src 'self'; frame-src 'self'; frame-ancestors 'self';");
  next();
});

// Lightweight Sliding Window Rate Limiter
const rateLimitMap = new Map();
function rateLimiter(limitCount = 20, windowMs = 60000) {
  return (req, res, next) => {
    const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'unknown';
    const now = Date.now();
    const clientData = rateLimitMap.get(ip) || { count: 0, resetTime: now + windowMs };

    if (now > clientData.resetTime) {
      clientData.count = 1;
      clientData.resetTime = now + windowMs;
    } else {
      clientData.count++;
    }

    rateLimitMap.set(ip, clientData);

    if (clientData.count > limitCount) {
      return res.status(429).json({
        error: 'تم تجاوز الحد المسموح من الطلبات. يرجى الانتظار دقيقة والمحاولة مجدداً.'
      });
    }

    next();
  };
}

// Clean up stale rate limits periodically
setInterval(() => {
  const now = Date.now();
  for (const [ip, data] of rateLimitMap.entries()) {
    if (now > data.resetTime) rateLimitMap.delete(ip);
  }
}, 120000);

// Store active SSE connections by sessionId
const sseClients = new Map();

function broadcastToClient(sessionId, data) {
  const client = sseClients.get(sessionId);
  if (client) {
    client.write(`data: ${JSON.stringify(data)}\n\n`);
  }
}

/**
 * Health check & status
 */
app.get('/api/status', (req, res) => {
  const nets = getNetworkAddresses();
  res.json({
    status: 'online',
    platform: 'AGENT-5 Multi-Agent Platform',
    version: '2.5.0',
    model: config.geminiModel,
    isKeyConfigured: isKeyConfigured(),
    network: {
      port: PORT,
      local: `http://localhost:${PORT}`,
      lan: nets.network ? `http://${nets.network}:${PORT}` : null
    },
    timestamp: new Date().toISOString()
  });
});

/**
 * Network info endpoint for testing on same phone and local Wi-Fi network
 */
app.get('/api/network', (req, res) => {
  const nets = getNetworkAddresses();
  res.json({
    port: PORT,
    localUrl: `http://localhost:${PORT}`,
    loopbackUrl: `http://127.0.0.1:${PORT}`,
    networkUrl: nets.network ? `http://${nets.network}:${PORT}` : null,
    ip: nets.network || '127.0.0.1'
  });
});

/**
 * Start generation pipeline
 */
app.post('/api/generate', rateLimiter(15, 60000), async (req, res) => {
  const { prompt, options } = req.body;
  if (!prompt || typeof prompt !== 'string' || !prompt.trim()) {
    return res.status(400).json({ error: 'الرجاء إدخال فكرة أو وصف للموقع.' });
  }

  const cleanPrompt = prompt.trim().substring(0, 2000);

  // Validate options
  const sanitizedOptions = {
    language: ['ar', 'en', 'fr'].includes(options?.language) ? options.language : 'ar',
    colorTheme: typeof options?.colorTheme === 'string' ? options.colorTheme.substring(0, 30) : 'monochrome',
    fontFamily: typeof options?.fontFamily === 'string' ? options.fontFamily.substring(0, 30) : 'ibm-plex',
    customColor: (options?.customColor && /^#([0-9a-fA-F]{3}){1,2}$/.test(options.customColor)) ? options.customColor : null
  };

  // Secure unique sessionId
  const sessionId = 'session_' + Date.now() + '_' + Math.random().toString(36).substring(2, 8);

  res.json({
    success: true,
    sessionId,
    message: 'تم إطلاق منظومة الوكلاء السبعة بنجاح.'
  });

  // Execute asynchronously with live SSE logging
  setTimeout(async () => {
    try {
      await executeGenerationPipeline({
        sessionId,
        prompt: cleanPrompt,
        options: sanitizedOptions,
        onLog: (logEntry) => broadcastToClient(sessionId, logEntry)
      });
    } catch (err) {
      console.error('Pipeline error:', err.message);
      broadcastToClient(sessionId, {
        agent: 'system',
        status: 'failed',
        message: 'فشل التوليد: ' + err.message
      });
    }
  }, 50);
});

/**
 * SSE stream for live agent updates
 */
app.get('/api/stream/:sessionId', (req, res) => {
  const { sessionId } = req.params;
  if (!/^session_[0-9]+_[a-zA-Z0-9]+$/.test(sessionId)) {
    return res.status(400).end();
  }

  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders();

  sseClients.set(sessionId, res);

  const existing = getSession(sessionId);
  if (existing) {
    existing.logs.forEach(log => {
      res.write(`data: ${JSON.stringify(log)}\n\n`);
    });
  }

  req.on('close', () => {
    sseClients.delete(sessionId);
  });
});

/**
 * Get session status and metrics
 */
app.get('/api/session/:sessionId', (req, res) => {
  const { sessionId } = req.params;
  if (!/^session_[0-9]+_[a-zA-Z0-9]+$/.test(sessionId)) {
    return res.status(400).json({ error: 'Invalid session ID' });
  }

  const session = getSession(sessionId);
  if (!session) {
    return res.status(404).json({ error: 'Session not found' });
  }

  res.json({
    id: session.id,
    status: session.status,
    hasHtml: Boolean(session.html && session.html.length > 0),
    htmlLength: session.html ? session.html.length : 0,
    logsCount: session.logs ? session.logs.length : 0,
    audit: session.audit || null,
    options: session.options || {}
  });
});

/**
 * Get raw HTML for iframe preview
 */
app.get('/api/site/:sessionId', (req, res) => {
  const { sessionId } = req.params;
  if (!/^session_[0-9]+_[a-zA-Z0-9]+$/.test(sessionId)) {
    return res.status(400).send('Invalid session ID');
  }

  const session = getSession(sessionId);
  if (!session || !session.html) {
    return res.status(404).send(`
      <!DOCTYPE html>
      <html dir="rtl">
      <head><meta charset="utf-8"><title>غير متوفر</title></head>
      <body style="font-family:sans-serif;background:#000;color:#fff;display:flex;align-items:center;justify-content:center;height:100vh;margin:0;">
        <div style="text-align:center;">
          <h2 style="color:#ffffff;">الموقع قيد الإنشاء بواسطة الوكلاء السبعة...</h2>
          <p style="color:#a1a1aa;">يرجى الانتظار حتى يكتمل الفحص والتدقيق الذاتي.</p>
        </div>
      </body>
      </html>
    `);
  }
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.send(session.html);
});

/**
 * Request modification
 */
app.post('/api/modify', rateLimiter(15, 60000), async (req, res) => {
  const { sessionId, modificationPrompt } = req.body;
  if (!sessionId || !modificationPrompt || !/^session_[0-9]+_[a-zA-Z0-9]+$/.test(sessionId)) {
    return res.status(400).json({ error: 'معرف الجلسة وطلب التعديل مطلوبان.' });
  }

  const cleanMod = String(modificationPrompt).trim().substring(0, 1000);

  res.json({ success: true, message: 'جاري تطبيق التعديل عبر الوكلاء...' });

  setTimeout(async () => {
    try {
      await executeModification({
        sessionId,
        modificationPrompt: cleanMod,
        onLog: (logEntry) => broadcastToClient(sessionId, logEntry)
      });
    } catch (err) {
      console.error('Modification error:', err.message);
      broadcastToClient(sessionId, {
        agent: 'system',
        status: 'failed',
        message: 'فشل التعديل: ' + err.message
      });
    }
  }, 50);
});

/**
 * Download single HTML file
 */
app.get('/api/export/html/:sessionId', (req, res) => {
  const { sessionId } = req.params;
  if (!/^session_[0-9]+_[a-zA-Z0-9]+$/.test(sessionId)) {
    return res.status(400).send('Invalid session ID');
  }

  const session = getSession(sessionId);
  if (!session || !session.html) {
    return res.status(404).send('Session not found');
  }

  const filename = (session.plan?.projectTitle || 'agent-5-website').replace(/[^a-zA-Z0-9\u0600-\u06FF_-]/g, '_') + '.html';
  res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(filename)}"`);
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.send(session.html);
});

/**
 * Download as ZIP package
 */
app.get('/api/export/zip/:sessionId', (req, res) => {
  const { sessionId } = req.params;
  if (!/^session_[0-9]+_[a-zA-Z0-9]+$/.test(sessionId)) {
    return res.status(400).send('Invalid session ID');
  }

  const session = getSession(sessionId);
  if (!session || !session.html) {
    return res.status(404).send('Session not found');
  }

  let archive;
  try {
    const archiverPkg = require('archiver');
    if (typeof archiverPkg === 'function') {
      archive = archiverPkg('zip', { zlib: { level: 9 } });
    } else if (archiverPkg.ZipArchive) {
      archive = new archiverPkg.ZipArchive({ zlib: { level: 9 } });
    } else if (archiverPkg.Archiver) {
      archive = new archiverPkg.Archiver('zip', { zlib: { level: 9 } });
    } else {
      throw new Error('Unsupported archiver module');
    }
  } catch (err) {
    console.warn('Archiver fallback to direct HTML:', err.message);
    return res.redirect(`/api/export/html/${sessionId}`);
  }

  const filename = (session.plan?.projectTitle || 'agent-5-website').replace(/[^a-zA-Z0-9\u0600-\u06FF_-]/g, '_') + '.zip';

  res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(filename)}"`);
  res.setHeader('Content-Type', 'application/zip');

  archive.pipe(res);
  archive.append(session.html, { name: 'index.html' });

  const readmeContent = `# ${session.plan?.projectTitle || 'Generated Website'}
Generated by AGENT-5 Autonomous Multi-Agent Platform (Gemini 3.1 Flash-Lite).
- Language: ${session.options?.language || 'ar'}
- Theme: ${session.options?.colorTheme || 'monochrome'}
- Font: ${session.options?.fontFamily || 'ibm-plex'}
`;
  archive.append(readmeContent, { name: 'README.md' });
  archive.finalize();
});

/**
 * Starter Presets (Trilingual: Arabic, English, French)
 */
app.get('/api/presets', (req, res) => {
  res.json([
    {
      id: 'saas-ar',
      title: '✨ منصة SaaS برمجية متطورة',
      lang: 'ar',
      theme: 'blue',
      font: 'ibm-plex',
      prompt: 'منصة برمجية سحابية لإدارة المشاريع وأتمتة المهام بالذكاء الاصطناعي مع لوحة تحكم عصرية باللغة العربية، خط تجوال/كايرو أنيق، وباقات اشتراك سنوية.'
    },
    {
      id: 'coffee-ar',
      title: '☕ قهوة مختصة فاخرة',
      lang: 'ar',
      theme: 'amber',
      font: 'cairo',
      prompt: 'موقع علامة تجارية فاخرة للقهوة المختصة والتحميص الحرفي، بتصميم مونوكروم أبيض وأسود فخم، خط عربي مميز، وقسم لتجربة التذوق.'
    },
    {
      id: 'startup-en',
      title: '🚀 Elite AI Infrastructure',
      lang: 'en',
      theme: 'emerald',
      font: 'alexandria',
      prompt: 'Next-generation AI developer infrastructure platform with sub-second latency, dark monochrome sleek aesthetic, interactive pricing table, and global API documentation.'
    },
    {
      id: 'agency-fr',
      title: '🇫🇷 Agence Numérique & Design Paris',
      lang: 'fr',
      theme: 'monochrome',
      font: 'ibm-plex',
      prompt: 'Site vitrine haut de gamme pour une agence de design et d\'intelligence artificielle à Paris, esthétique minimaliste noir et blanc, typographie suisse et présentation de réalisations.'
    },
    {
      id: 'portfolio-ar',
      title: '💼 بورتفوليو مهندس واستشاري',
      lang: 'ar',
      theme: 'purple',
      font: 'alexandria',
      prompt: 'موقع شخصي وبورتفوليو احترافي لمهندس برمجيات واستشاري تحول رقمي، يعرض أهم المشاريع المنجزة، التقييمات، ومواعيد الاستشارة.'
    }
  ]);
});

app.listen(PORT, '0.0.0.0', () => {
  const nets = getNetworkAddresses();
  console.log(`\n======================================================`);
  console.log(`🚀 AGENT-5 Platform is running! (Gemini 3.1 Flash-Lite)`);
  console.log(`📱 Same Phone (Local):      http://localhost:${PORT}`);
  console.log(`📱 Same Phone (Loopback):   http://127.0.0.1:${PORT}`);
  if (nets.network) {
    console.log(`🌐 Same Wi-Fi Network (LAN): http://${nets.network}:${PORT}`);
  }
  console.log(`======================================================\n`);
});
