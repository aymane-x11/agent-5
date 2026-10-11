const { runOrchestrator } = require('./agents/orchestrator');
const { runArchitect } = require('./agents/architect');
const { runDesigner } = require('./agents/designer');
const { runCopywriter } = require('./agents/copywriter');
const { runMediaSpecialist } = require('./agents/media');
const { runDeveloper } = require('./agents/developer');
const { runQA } = require('./agents/qa');

// Active sessions memory store
const sessions = new Map();

/**
 * Execute the 7-agent generation pipeline with user-selected options
 */
async function executeGenerationPipeline({ sessionId, prompt, options = {}, onLog }) {
  const session = {
    id: sessionId,
    prompt,
    options: {
      language: options.language || 'ar',
      colorTheme: options.colorTheme || 'monochrome',
      fontFamily: options.fontFamily || 'ibm-plex',
      customColor: options.customColor || null
    },
    createdAt: new Date().toISOString(),
    logs: [],
    html: '',
    audit: null,
    plan: null,
    status: 'running'
  };
  sessions.set(sessionId, session);

  const emitLog = (entry) => {
    const enriched = {
      timestamp: new Date().toISOString(),
      ...entry
    };
    session.logs.push(enriched);
    if (typeof onLog === 'function') {
      onLog(enriched);
    }
  };

  try {
    emitLog({
      agent: 'system',
      status: 'started',
      message: `بدء تشغيل منظومة AGENT-5 (نموذج Gemini 3.1 Flash-Lite) مع خيارات التخصيص: [اللغة: ${session.options.language.toUpperCase()}, النمط: ${session.options.colorTheme}, الخط: ${session.options.fontFamily}]`
    });

    // 1. Orchestrator Agent
    const plan = await runOrchestrator({ prompt, options: session.options, emitLog });
    session.plan = plan;

    // 2. Architect Agent
    const structure = await runArchitect({ prompt, plan, options: session.options, emitLog });

    // 3. UI/UX Designer Agent
    const designSystem = await runDesigner({ prompt, plan, structure, options: session.options, emitLog });

    // 4. Content & Copywriter Agent
    const copy = await runCopywriter({ prompt, plan, structure, designSystem, options: session.options, emitLog });

    // 5. Media & Asset Specialist Agent
    const media = await runMediaSpecialist({ prompt, plan, structure, copy, options: session.options, emitLog });

    // 6. Frontend Developer Agent
    const htmlCode = await runDeveloper({ prompt, plan, structure, designSystem, copy, media, options: session.options, emitLog });

    // 7. QA & Self-Correction Agent
    const qaResult = await runQA({ prompt, htmlCode, plan, options: session.options, emitLog });

    session.html = qaResult.verifiedHtml;
    session.audit = qaResult.auditReport;
    session.status = 'completed';

    emitLog({
      agent: 'system',
      status: 'ready',
      message: 'تم اكتمال بناء وتدقيق الموقع بنجاح بنسبة 100%! جاهز للمعاينة الفورية والتصدير.',
      data: {
        sessionId,
        score: qaResult.auditReport.overallScore,
        codeLength: session.html.length
      }
    });

    return session;
  } catch (error) {
    session.status = 'error';
    session.error = error.message;
    emitLog({
      agent: 'system',
      status: 'failed',
      message: `حدث خطأ أثناء التنفيذ: ${error.message}`
    });
    throw error;
  }
}

/**
 * Handle user modifications via agents
 */
async function executeModification({ sessionId, modificationPrompt, onLog }) {
  const session = sessions.get(sessionId);
  if (!session || !session.html) {
    throw new Error('الجلسة غير موجودة أو لم يتم بناء موقع بعد.');
  }

  const emitLog = (entry) => {
    const enriched = {
      timestamp: new Date().toISOString(),
      ...entry
    };
    session.logs.push(enriched);
    if (typeof onLog === 'function') onLog(enriched);
  };

  emitLog({
    agent: 'orchestrator',
    status: 'thinking',
    message: `تحليل طلب التعديل: "${modificationPrompt}" وإعادة التوجيه للوكلاء...`
  });

  const fullPrompt = `${session.prompt} | تعديل إضافي: ${modificationPrompt}`;
  return executeGenerationPipeline({
    sessionId,
    prompt: fullPrompt,
    options: session.options,
    onLog
  });
}

function getSession(id) {
  return sessions.get(id);
}

module.exports = {
  executeGenerationPipeline,
  executeModification,
  getSession,
  sessions
};
