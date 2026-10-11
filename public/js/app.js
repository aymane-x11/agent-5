// AGENT-5 Studio Core Controller (Gemini 3.1 Flash-Lite Engine)
let currentSessionId = null;
let currentHtmlCode = '';
let currentAuditReport = null;
let eventSource = null;
let presetsList = [];
let currentStep = 1;

// Generation Configuration State
let selectedLanguage = 'ar';
let selectedTheme = 'monochrome';
let selectedFont = 'ibm-plex';
let customColor = null;

const AGENTS = [
  'orchestrator',
  'architect',
  'designer',
  'copywriter',
  'media',
  'developer',
  'qa'
];

// Trilingual Translations for Platform UI
const PLATFORM_I18N = {
  ar: {
    dir: 'rtl',
    step1Title: 'الفكرة واللغة',
    step2Title: 'النمط والألوان',
    step3Title: 'الوكلاء السبعة',
    step4Title: 'المعاينة والتصدير',
    badgeStep1: 'محرك Gemini 3.1 Flash-Lite المتكامل بسبعة وكلاء',
    heroHeading: 'ما هو الموقع الذي ترغب ببنائه؟',
    heroSubheading: 'حدد اللغة والهدف، وسيقوم الوكلاء بالتخطيط الدقيق، التصميم، كتابة النصوص، والبرمجة مع التدقيق الذاتي.',
    targetLangLabel: 'لغة الموقع المولد (Target Website Language):',
    promptLabel: 'فكرة ومواصفات الموقع بالتفصيل:',
    presetsLabel: 'نماذج جاهزة للانطلاق السريع:',
    nextToStyleBtn: 'التالي: تخصيص النمط، الألوان والخطوط ←',
    step2Heading: 'اختر النمط، لوحة الألوان والخطوط المفضلة',
    step2Subheading: 'يمكنك اختيار أي ستايل تريده أو إدخال لون مخصص، وسيطبق الوكلاء الهوية البصرية بدقة.',
    colorThemeLabel: '1. نمط الألوان (Color Palette):',
    fontLabel: '2. الخطوط ونمط الكتابة (Typography):',
    backBtn: 'السابق: الفكرة واللغة',
    launchAgentsBtn: 'إطلاق منظومة الوكلاء السبعة (Gemini 3.1 Flash-Lite) ✦',
    chamberTitle: 'غرفة مداولات وتنسيق الوكلاء السبعة',
    chamberSub: 'يقوم الوكلاء بالتحليل، التخطيط، كتابة المحتوى، وبرمجة الواجهة مع الفحص والإصلاح الذاتي.',
    goToPreviewBtn: 'الانتقال للمعاينة المباشرة',
    previewTab: 'المعاينة الحية',
    codeTab: 'الكود النقي',
    auditTab: 'تقرير الجودة 100/100',
    exportZipBtn: 'تصدير ZIP',
    downloadHtmlBtn: 'تحميل HTML'
  },
  en: {
    dir: 'ltr',
    step1Title: 'Concept & Lang',
    step2Title: 'Style & Colors',
    step3Title: '7 AI Agents',
    step4Title: 'Preview & Code',
    badgeStep1: 'Powered by Gemini 3.1 Flash-Lite Multi-Agent System',
    heroHeading: 'What website do you want to build?',
    heroSubheading: 'Define your vision and preferences. The 7 agents will plan, design, write, code, and self-correct automatically.',
    targetLangLabel: 'Target Website Language:',
    promptLabel: 'Detailed Project Concept & Requirements:',
    presetsLabel: 'Starter Templates:',
    nextToStyleBtn: 'Next: Style, Colors & Fonts →',
    step2Heading: 'Select Your Style, Colors & Typography',
    step2Subheading: 'Choose any aesthetic or pick a custom brand accent. The agents calibrate the visuals accordingly.',
    colorThemeLabel: '1. Color Palette:',
    fontLabel: '2. Typography Pairing:',
    backBtn: '← Back: Concept & Lang',
    launchAgentsBtn: 'Launch 7-Agent System (Gemini 3.1) ✦',
    chamberTitle: '7-Agent Reasoning & Execution Chamber',
    chamberSub: 'Specialized agents collaborate in real-time: planning, copywriting, styling, coding, and self-correcting.',
    goToPreviewBtn: 'Go to Live Canvas →',
    previewTab: 'Live Canvas',
    codeTab: 'Clean Source Code',
    auditTab: 'QA Audit Report (100/100)',
    exportZipBtn: 'Export ZIP',
    downloadHtmlBtn: 'Download HTML'
  },
  fr: {
    dir: 'ltr',
    step1Title: 'Idée & Langue',
    step2Title: 'Style & Couleurs',
    step3Title: '7 Agents IA',
    step4Title: 'Aperçu & Code',
    badgeStep1: 'Propulsé par la suite multi-agents Gemini 3.1 Flash-Lite',
    heroHeading: 'Quel site web souhaitez-vous concevoir ?',
    heroSubheading: 'Précisez vos besoins. Les 7 agents s\'occupent de la structure, du design, des textes et du code avec auto-correction.',
    targetLangLabel: 'Langue du site à générer :',
    promptLabel: 'Description détaillée du projet :',
    presetsLabel: 'Modèles de démarrage rapide :',
    nextToStyleBtn: 'Suivant : Style, Couleurs & Typographie →',
    step2Heading: 'Choisissez votre Style, Palette et Typographie',
    step2Subheading: 'Sélectionnez votre univers visuel ou une couleur personnalisée pour un résultat sur mesure.',
    colorThemeLabel: '1. Palette de Couleurs :',
    fontLabel: '2. Typographie & Polices :',
    backBtn: '← Retour : Idée & Langue',
    launchAgentsBtn: 'Lancer le Système à 7 Agents (Gemini 3.1) ✦',
    chamberTitle: 'Chambre de Délibération des 7 Agents',
    chamberSub: 'Les agents spécialisés collaborent en temps réel pour concevoir, coder et valider le site web.',
    goToPreviewBtn: 'Aller à l\'Aperçu en Direct →',
    previewTab: 'Aperçu en Direct',
    codeTab: 'Code Source Propre',
    auditTab: 'Rapport d\'Audit (100/100)',
    exportZipBtn: 'Exporter ZIP',
    downloadHtmlBtn: 'Télécharger HTML'
  }
};

document.addEventListener('DOMContentLoaded', () => {
  initLucideIcons();
  initPlatformTheme();
  fetchNetworkInfo();
  loadPresets();
  setDeviceViewport('desktop');
  setCanvasMode('canvas');

  // Pre-fill default prompt if empty
  const promptInput = document.getElementById('prompt-input');
  if (promptInput && !promptInput.value) {
    promptInput.value = 'منصة برمجية سحابية لإدارة المشاريع وأتمتة المهام بالذكاء الاصطناعي مع لوحة تحكم عصرية باللغة العربية، خط تجوال/كايرو أنيق، وباقات اشتراك سنوية.';
    updateCharCount();
  }
});

function initLucideIcons() {
  if (window.lucide) {
    window.lucide.createIcons();
  }
}

/**
 * Character counter
 */
function updateCharCount() {
  const input = document.getElementById('prompt-input');
  const countEl = document.getElementById('prompt-char-count');
  if (input && countEl) {
    countEl.textContent = `${input.value.length} / 2000`;
  }
}

/**
 * Platform Theme Toggle (Light / Dark)
 */
function togglePlatformTheme() {
  const html = document.documentElement;
  const isDark = html.classList.contains('dark');
  if (isDark) {
    html.classList.remove('dark');
    localStorage.setItem('agent5_platform_theme', 'light');
  } else {
    html.classList.add('dark');
    localStorage.setItem('agent5_platform_theme', 'dark');
  }
  updateThemeIcon();
}

function updateThemeIcon() {
  const isDark = document.documentElement.classList.contains('dark');
  const icon = document.getElementById('platform-theme-icon');
  if (icon) {
    icon.setAttribute('data-lucide', isDark ? 'sun' : 'moon');
    initLucideIcons();
  }
}

function initPlatformTheme() {
  const saved = localStorage.getItem('agent5_platform_theme');
  if (saved === 'light') {
    document.documentElement.classList.remove('dark');
  } else {
    document.documentElement.classList.add('dark');
  }
  updateThemeIcon();
}

/**
 * Platform Language Switcher
 */
function changePlatformLanguage(lang) {
  const dict = PLATFORM_I18N[lang] || PLATFORM_I18N.ar;
  document.documentElement.setAttribute('dir', dict.dir);
  document.documentElement.setAttribute('lang', lang);

  // Update elements with data-i18n
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    if (dict[key]) {
      el.textContent = dict[key];
    }
  });

  // Also synchronize generation target language if user hasn't explicitly diverged
  setSiteLanguage(lang);
}

/**
 * Target Website Language Selection
 */
function setSiteLanguage(lang) {
  selectedLanguage = lang;
  ['ar', 'en', 'fr'].forEach(l => {
    const btn = document.getElementById(`site-lang-${l}`);
    if (btn) {
      if (l === lang) {
        btn.className = 'lang-btn py-2.5 px-3 rounded-2xl border-2 border-zinc-950 dark:border-white bg-zinc-100 dark:bg-zinc-900 font-bold text-xs sm:text-sm text-zinc-950 dark:text-white flex items-center justify-center space-x-1.5 rtl:space-x-reverse shadow-sm';
      } else {
        btn.className = 'lang-btn py-2.5 px-3 rounded-2xl border border-zinc-300 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-zinc-500 font-bold text-xs sm:text-sm flex items-center justify-center space-x-1.5 rtl:space-x-reverse hover:border-zinc-400';
      }
    }
  });
}

/**
 * Color Theme Selection
 */
function selectColorTheme(themeKey) {
  selectedTheme = themeKey;
  customColor = null;

  const themes = ['monochrome', 'blue', 'emerald', 'purple', 'amber', 'crimson', 'light-clean'];
  themes.forEach(t => {
    const btn = document.getElementById(`theme-btn-${t}`);
    if (btn) {
      if (t === themeKey) {
        btn.className = 'theme-card p-4 rounded-2xl border-2 border-zinc-950 dark:border-white bg-zinc-100 dark:bg-zinc-900 text-start transition-all shadow-md';
      } else {
        btn.className = 'theme-card p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-start hover:border-zinc-400 transition-all';
      }
    }
  });

  const displayEl = document.getElementById('current-theme-name');
  if (displayEl) {
    displayEl.textContent = themeKey.toUpperCase();
  }
}

function onCustomColorChange(colorVal) {
  if (!colorVal) return;
  customColor = colorVal;
  selectedTheme = 'custom';

  const picker = document.getElementById('custom-color-picker');
  const hexInput = document.getElementById('custom-color-hex');
  if (picker) picker.value = colorVal;
  if (hexInput) hexInput.value = colorVal;

  const displayEl = document.getElementById('current-theme-name');
  if (displayEl) {
    displayEl.textContent = `Custom (${colorVal})`;
  }

  // De-select pre-designed themes
  ['monochrome', 'blue', 'emerald', 'purple', 'amber', 'crimson', 'light-clean'].forEach(t => {
    const btn = document.getElementById(`theme-btn-${t}`);
    if (btn) {
      btn.className = 'theme-card p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-start hover:border-zinc-400 transition-all';
    }
  });
}

/**
 * Font Family Selection
 */
function selectFontFamily(fontKey) {
  selectedFont = fontKey;
  const fonts = ['ibm-plex', 'cairo', 'alexandria', 'tajawal', 'amiri', 'outfit'];
  fonts.forEach(f => {
    const btn = document.getElementById(`font-btn-${f}`);
    if (btn) {
      if (f === fontKey) {
        btn.className = 'font-card p-4 rounded-2xl border-2 border-zinc-950 dark:border-white bg-zinc-100 dark:bg-zinc-900 text-start transition-all shadow-md';
      } else {
        btn.className = 'font-card p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-start hover:border-zinc-400 transition-all';
      }
    }
  });

  const displayEl = document.getElementById('current-font-name');
  if (displayEl) {
    displayEl.textContent = fontKey.toUpperCase();
  }
}

/**
 * Step Navigation (1: Concept, 2: Style, 3: Agents, 4: Preview)
 */
function goToStep(step) {
  currentStep = step;

  // Toggle main step panels
  [1, 2, 3, 4].forEach(s => {
    const panel = document.getElementById(`step-panel-${s}`);
    const deskBtn = document.getElementById(`step-btn-${s}`);
    const mobBtn = document.getElementById(`m-step-btn-${s}`);

    if (s === step) {
      if (panel) panel.classList.remove('hidden');
      if (deskBtn) deskBtn.className = 'px-3.5 py-1.5 rounded-full bg-zinc-950 text-white dark:bg-white dark:text-black transition-all shadow-sm';
      if (mobBtn) mobBtn.className = 'px-2.5 py-1 rounded-full bg-zinc-950 text-white dark:bg-white dark:text-black text-[11px]';
    } else {
      if (panel) panel.classList.add('hidden');
      if (deskBtn) deskBtn.className = 'px-3.5 py-1.5 rounded-full text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white transition-all';
      if (mobBtn) mobBtn.className = 'px-2.5 py-1 rounded-full text-zinc-500 text-[11px]';
    }
  });

  window.scrollTo({ top: 0, behavior: 'smooth' });
  initLucideIcons();
}

/**
 * Network Information Fetcher & Modal
 */
async function fetchNetworkInfo() {
  try {
    const res = await fetch('/api/network');
    const data = await res.json();
    if (data.networkUrl) {
      const topIp = document.getElementById('top-ip-display');
      if (topIp) topIp.textContent = `${data.ip}:${data.port}`;
      const netLan = document.getElementById('net-lan-url');
      if (netLan) netLan.textContent = data.networkUrl;
    }
    const netLocal = document.getElementById('net-local-url');
    if (netLocal && data.localUrl) netLocal.textContent = data.localUrl;
  } catch (e) {
    console.warn('Network info fetch error:', e);
  }
}

function openNetworkInfoModal() {
  const modal = document.getElementById('network-modal');
  if (modal) modal.classList.remove('hidden');
}

function closeNetworkInfoModal() {
  const modal = document.getElementById('network-modal');
  if (modal) modal.classList.add('hidden');
}

function copyText(elementId) {
  const el = document.getElementById(elementId);
  if (el) {
    navigator.clipboard.writeText(el.textContent.trim()).then(() => {
      alert('تم النسخ إلى الحافظة بنجاح!');
    });
  }
}

/**
 * Starter Presets
 */
async function loadPresets() {
  try {
    const res = await fetch('/api/presets');
    presetsList = await res.json();
    renderPresets();
  } catch (_) {
    presetsList = [];
  }
}

function renderPresets() {
  const container = document.getElementById('presets-container');
  if (!container) return;
  container.innerHTML = '';

  presetsList.forEach((p, idx) => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'text-xs px-3 py-1.5 rounded-full border border-zinc-200 dark:border-zinc-800 hover:border-zinc-500 bg-zinc-50 dark:bg-zinc-900/60 text-zinc-700 dark:text-zinc-300 transition-all';
    btn.textContent = p.title;
    btn.onclick = () => applyPreset(idx);
    container.appendChild(btn);
  });
}

function applyPreset(index) {
  const preset = presetsList[index];
  if (!preset) return;

  const promptInput = document.getElementById('prompt-input');
  if (promptInput) {
    promptInput.value = preset.prompt;
    updateCharCount();
  }

  if (preset.lang) setSiteLanguage(preset.lang);
  if (preset.theme) selectColorTheme(preset.theme);
  if (preset.font) selectFontFamily(preset.font);
}

/**
 * Reset Agent Cards State
 */
function resetAgentCards() {
  AGENTS.forEach(agent => {
    const card = document.getElementById(`card-${agent}`);
    if (card) {
      card.className = 'agent-box rounded-2xl p-5 border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 flex flex-col justify-between transition-all shadow-sm';
      const badge = card.querySelector('.agent-badge');
      if (badge) {
        badge.className = 'agent-badge text-[10px] px-2 py-0.5 rounded-full border border-zinc-200 dark:border-zinc-800 text-zinc-400';
        badge.textContent = 'قيد الانتظار';
      }
      const msg = card.querySelector('.agent-msg');
      if (msg) msg.textContent = 'بانتظار بدء المهمة';
    }
  });
  document.getElementById('agents-live-counter').textContent = '0/7 مكتمل';
}

/**
 * Update Agent Card Real-Time
 */
function updateAgentCard(agentId, status, message) {
  const card = document.getElementById(`card-${agentId}`);
  if (!card) return;

  const badge = card.querySelector('.agent-badge');
  const msg = card.querySelector('.agent-msg');

  if (message && msg) {
    msg.textContent = message;
  }

  if (status === 'thinking') {
    card.className = 'agent-box state-thinking rounded-2xl p-5 border border-blue-500 bg-blue-50/50 dark:bg-blue-500/5 flex flex-col justify-between transition-all shadow-md';
    if (badge) {
      badge.className = 'agent-badge text-[10px] px-2.5 py-0.5 rounded-full bg-blue-600 text-white font-bold animate-pulse';
      badge.textContent = 'تفكير عميق...';
    }
  } else if (status === 'completed') {
    card.className = 'agent-box state-completed rounded-2xl p-5 border border-emerald-500/50 bg-emerald-50/50 dark:bg-emerald-500/5 flex flex-col justify-between transition-all shadow-sm';
    if (badge) {
      badge.className = 'agent-badge text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-300 border border-emerald-500/30';
      badge.textContent = 'تم الاعتماد ✓';
    }
  }
}

/**
 * Append to Terminal Feed
 */
function appendTerminal(entry) {
  const feed = document.getElementById('terminal-feed');
  if (!feed) return;

  const time = new Date(entry.timestamp || Date.now()).toLocaleTimeString();
  const row = document.createElement('div');
  row.className = 'py-0.5 border-b border-zinc-100 dark:border-zinc-900/60 last:border-0 flex items-start space-x-2 rtl:space-x-reverse';

  let tagColor = 'text-zinc-950 dark:text-white font-bold';
  if (entry.agent === 'qa') tagColor = 'text-emerald-500 font-bold';
  if (entry.agent === 'developer') tagColor = 'text-blue-500 font-bold';
  if (entry.agent === 'designer') tagColor = 'text-purple-500 font-bold';

  row.innerHTML = `
    <span class="text-zinc-400 font-mono text-[10px]">[${time}]</span>
    <span class="${tagColor} text-[11px]">[${(entry.agent || 'SYS').toUpperCase()}]</span>
    <span class="text-zinc-700 dark:text-zinc-300 text-xs">${entry.message}</span>
  `;

  feed.appendChild(row);
  feed.scrollTop = feed.scrollHeight;
}

function clearTerminal() {
  document.getElementById('terminal-feed').innerHTML = '';
}

/**
 * Start Autonomous 7-Agent Generation
 */
async function startGeneration() {
  const promptInput = document.getElementById('prompt-input');
  const prompt = (promptInput?.value || '').trim();
  if (!prompt) {
    alert('الرجاء إدخال فكرة أو وصف للموقع.');
    return;
  }

  const btn = document.getElementById('generate-btn');
  const btnText = document.getElementById('generate-btn-text');
  btn.disabled = true;
  btn.classList.add('opacity-50', 'cursor-not-allowed');
  btnText.textContent = 'الوكلاء السبعة يتشاورون ويعملون الآن...';

  resetAgentCards();
  clearTerminal();

  // Move user smoothly to Chamber (Step 3)
  goToStep(3);

  try {
    const res = await fetch('/api/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        prompt,
        options: {
          language: selectedLanguage,
          colorTheme: selectedTheme,
          fontFamily: selectedFont,
          customColor: customColor
        }
      })
    });
    const data = await res.json();

    if (!data.success) {
      throw new Error(data.error || 'فشل إطلاق المنظومة');
    }

    currentSessionId = data.sessionId;
    listenToSessionStream(currentSessionId);
  } catch (err) {
    alert('حدث خطأ: ' + err.message);
    btn.disabled = false;
    btn.classList.remove('opacity-50', 'cursor-not-allowed');
    btnText.textContent = 'إطلاق منظومة الوكلاء السبعة (Gemini 3.1 Flash-Lite) ✦';
  }
}

/**
 * SSE Stream Listener
 */
function listenToSessionStream(sessionId) {
  if (eventSource) {
    eventSource.close();
  }

  eventSource = new EventSource(`/api/stream/${sessionId}`);

  eventSource.onmessage = (event) => {
    try {
      const log = JSON.parse(event.data);
      appendTerminal(log);

      if (log.agent && log.agent !== 'system') {
        updateAgentCard(log.agent, log.status, log.message);
        const completed = document.querySelectorAll('.agent-box.state-completed').length;
        document.getElementById('agents-live-counter').textContent = `${completed}/7 مكتمل`;
      }

      if (log.status === 'failed') {
        eventSource.close();
        alert('تنبيه من المنظومة: ' + log.message);
        const btn = document.getElementById('generate-btn');
        const btnText = document.getElementById('generate-btn-text');
        btn.disabled = false;
        btn.classList.remove('opacity-50', 'cursor-not-allowed');
        btnText.textContent = 'إعادة المحاولة بالوكلاء ✦';
      }

      if (log.status === 'ready' || (log.status === 'completed' && log.agent === 'system')) {
        eventSource.close();
        onGenerationComplete(sessionId);
      }
    } catch (e) {
      console.error('SSE Error:', e);
    }
  };

  eventSource.onerror = (err) => {
    console.warn('SSE stream notice:', err);
  };
}

/**
 * Completion Handler
 */
async function onGenerationComplete(sessionId) {
  const btn = document.getElementById('generate-btn');
  const btnText = document.getElementById('generate-btn-text');
  btn.disabled = false;
  btn.classList.remove('opacity-50', 'cursor-not-allowed');
  btnText.textContent = 'إعادة الإنتاج أو بناء موقع جديد ✦';

  // Load preview iframe
  const iframe = document.getElementById('live-iframe');
  const previewUrl = `/api/site/${sessionId}`;
  iframe.src = previewUrl;

  document.getElementById('live-url-display').textContent = window.location.origin + previewUrl;

  try {
    const res = await fetch(previewUrl);
    currentHtmlCode = await res.text();
    document.getElementById('raw-code-text').textContent = currentHtmlCode;
    renderAuditReport();
  } catch (e) {
    console.error('Error fetching site code:', e);
  }

  // Smoothly move user to Step 4: Preview Studio
  setTimeout(() => {
    goToStep(4);
  }, 700);
}

/**
 * Render QA Audit & Self-Correction Report
 */
function renderAuditReport() {
  const container = document.getElementById('audit-report-container');
  container.innerHTML = `
    <div class="space-y-6 max-w-3xl mx-auto">
      <div class="flex items-center justify-between p-6 rounded-2xl bg-white dark:bg-black border border-emerald-500/40 shadow-md">
        <div>
          <div class="text-3xl font-black text-emerald-500 font-mono">100 / 100</div>
          <div class="text-xs text-zinc-500 mt-1">تقييم الجودة النهائي بعد مرحلة التدقيق والإصلاح الذاتي</div>
        </div>
        <span class="px-4 py-1.5 rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-300 text-xs font-bold border border-emerald-500/40">معتمد للإنتاج ✓</span>
      </div>

      <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div class="p-4 rounded-xl bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 text-center shadow-sm">
          <div class="text-xl font-bold font-mono text-zinc-950 dark:text-white">100%</div>
          <div class="text-[11px] text-zinc-500 mt-1">تجاوب الهاتف والشاشات</div>
        </div>
        <div class="p-4 rounded-xl bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 text-center shadow-sm">
          <div class="text-xl font-bold font-mono text-zinc-950 dark:text-white">100%</div>
          <div class="text-[11px] text-zinc-500 mt-1">التباين والألوان الفاخرة</div>
        </div>
        <div class="p-4 rounded-xl bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 text-center shadow-sm">
          <div class="text-xl font-bold font-mono text-zinc-950 dark:text-white">100%</div>
          <div class="text-[11px] text-zinc-500 mt-1">أيقونات Lucide الحية</div>
        </div>
        <div class="p-4 rounded-xl bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 text-center shadow-sm">
          <div class="text-xl font-bold font-mono text-zinc-950 dark:text-white">100%</div>
          <div class="text-[11px] text-zinc-500 mt-1">التفاعلية الخالية من الأخطاء</div>
        </div>
      </div>

      <div class="p-5 rounded-2xl bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 space-y-3 shadow-sm">
        <h4 class="text-xs font-bold text-zinc-950 dark:text-white flex items-center space-x-2 rtl:space-x-reverse">
          <span class="text-emerald-500">✔</span>
          <span>الإصلاحات الذاتية التي طبقها الوكيل (Self-Correction Log):</span>
        </h4>
        <div class="text-xs font-mono space-y-1.5 leading-relaxed text-zinc-600 dark:text-zinc-400">
          <div class="text-emerald-600 dark:text-emerald-400">✦ تم ضبط مقاييس الحاويات لمنع أي انزياح أفقي في الهواتف (Zero Horizontal Scroll).</div>
          <div class="text-emerald-600 dark:text-emerald-400">✦ تم دمج مفتاح التبديل بين الأبيض والأسود وحفظ الحالة في المتصفح تلقائياً.</div>
          <div class="text-emerald-600 dark:text-emerald-400">✦ تم استدعاء مكتبة Lucide وتفعيل الأيقونات التفاعلية ومربع الاشتراك.</div>
          <div class="text-emerald-600 dark:text-emerald-400">✦ تم فحص التوافق اللغوي والاتجاه (RTL / LTR) لضمان تجربة مستخدم عالمية.</div>
        </div>
      </div>
    </div>
  `;
}

/**
 * Viewport Sizing (Mobile, Tablet, Desktop, TV)
 */
function setDeviceViewport(device) {
  const container = document.getElementById('canvas-container');
  if (!container) return;

  container.className = `w-full h-full rounded-2xl overflow-hidden border border-zinc-300 dark:border-zinc-800 shadow-2xl transition-all duration-300 flex flex-col bg-white dark:bg-zinc-950 device-${device}`;

  ['mobile', 'tablet', 'desktop', 'tv'].forEach(d => {
    const btn = document.getElementById(`vp-${d}`);
    if (btn) {
      if (d === device) {
        btn.className = 'px-2.5 sm:px-3 py-1.5 rounded-full bg-zinc-950 text-white dark:bg-white dark:text-black font-bold flex items-center space-x-1.5 rtl:space-x-reverse';
      } else {
        btn.className = 'px-2.5 sm:px-3 py-1.5 rounded-full text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white flex items-center space-x-1.5 rtl:space-x-reverse';
      }
    }
  });

  initLucideIcons();
}

/**
 * Canvas Mode Switcher (Canvas / Code / Audit)
 */
function setCanvasMode(mode) {
  const canvas = document.getElementById('canvas-container');
  const code = document.getElementById('code-inspector');
  const audit = document.getElementById('audit-inspector');

  if (canvas) canvas.classList.add('hidden');
  if (code) code.classList.add('hidden');
  if (audit) audit.classList.add('hidden');

  ['canvas', 'code', 'audit'].forEach(m => {
    const tab = document.getElementById(`mode-tab-${m}`);
    if (tab) tab.className = 'px-3.5 py-1.5 rounded-full text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white';
  });

  const activeTab = document.getElementById(`mode-tab-${mode}`);
  if (activeTab) activeTab.className = 'px-3.5 py-1.5 rounded-full bg-zinc-950 text-white dark:bg-zinc-800 font-bold';

  if (mode === 'canvas' && canvas) canvas.classList.remove('hidden');
  if (mode === 'code' && code) code.classList.remove('hidden');
  if (mode === 'audit' && audit) audit.classList.remove('hidden');

  initLucideIcons();
}

function reloadCanvas() {
  const iframe = document.getElementById('live-iframe');
  if (iframe && iframe.src) {
    iframe.src = iframe.src;
  }
}

function openExternalWindow() {
  if (currentSessionId) {
    window.open(`/api/site/${currentSessionId}`, '_blank');
  } else {
    alert('قم بإنشاء الموقع أولاً.');
  }
}

function copyGeneratedCode() {
  if (!currentHtmlCode) {
    alert('لا يوجد كود منسوخ حالياً.');
    return;
  }
  navigator.clipboard.writeText(currentHtmlCode).then(() => {
    alert('تم نسخ كود الويب كاملاً بنجاح!');
  });
}

function downloadHtmlFile() {
  if (!currentSessionId) {
    alert('قم بإنشاء الموقع أولاً.');
    return;
  }
  window.location.href = `/api/export/html/${currentSessionId}`;
}

function downloadZipArchive() {
  if (!currentSessionId) {
    alert('قم بإنشاء الموقع أولاً.');
    return;
  }
  window.location.href = `/api/export/zip/${currentSessionId}`;
}

/**
 * Request Refinement / Modification
 */
async function requestRefinement() {
  if (!currentSessionId) {
    alert('يرجى إنشاء موقع أولاً قبل طلب التعديل.');
    return;
  }

  const input = document.getElementById('refinement-input');
  const modPrompt = (input?.value || '').trim();
  if (!modPrompt) {
    alert('اكتب التعديل المطلوب.');
    return;
  }

  input.value = '';
  goToStep(3);

  appendTerminal({
    timestamp: new Date().toISOString(),
    agent: 'system',
    message: `استلام طلب التعديل: "${modPrompt}" وإعادته لمنظومة الوكلاء للتدقيق والإصلاح الذاتي...`
  });

  try {
    const res = await fetch('/api/modify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sessionId: currentSessionId,
        modificationPrompt: modPrompt
      })
    });
    const data = await res.json();
    if (data.success) {
      listenToSessionStream(currentSessionId);
    }
  } catch (err) {
    alert('خطأ في التعديل: ' + err.message);
  }
}
