const { callGemini, isKeyConfigured } = require('../gemini');

const ORCHESTRATOR_SYSTEM_PROMPT = `أنت "الوكيل المدير" (Orchestrator Agent) المسؤول عن قيادة وتنسيق منظومة الذكاء الاصطناعي لبناء المواقع الإلكترونية.
مهمتك:
1. تحليل فكرة المستخدم ومتطلبات الموقع بعمق.
2. الالتزام الصارم باللغة المختارة (ar للعربية، en للإنجليزية، fr للفرنسية) ونمط الألوان والخطوط.
3. صياغة خطة عمل محكمة وتوزيع المهام المحددة على الوكلاء الستة المتخصصين (الهيكلة، التصميم، المحتوى، الأكواد، الوسائط، والجودة).`;

async function runOrchestrator({ prompt, options = {}, emitLog }) {
  emitLog({
    agent: 'orchestrator',
    status: 'thinking',
    message: `جاري تحليل المتطلبات وصياغة الخطة التنفيذية باللغة [${(options.language || 'ar').toUpperCase()}] ونمط الألوان [${options.colorTheme || 'monochrome'}]...`
  });

  const targetLang = options.language || (/[a-zA-Z]/.test(prompt) && !/[\u0600-\u06FF]/.test(prompt) ? 'en' : 'ar');

  let plan;
  if (isKeyConfigured()) {
    try {
      const response = await callGemini({
        systemInstruction: ORCHESTRATOR_SYSTEM_PROMPT,
        jsonMode: true,
        prompt: `حلل فكرة الموقع التالية واكتب خطة عمل موجهة للوكلاء بصيغة JSON.
اللغة المطلوبة: ${targetLang}
نمط الألوان المختار: ${options.colorTheme || 'monochrome'}
الخط المختار: ${options.fontFamily || 'ibm-plex'}

فكرة المستخدم:
"${prompt}"

أعد JSON فقط بدون مقدمات:
{
  "projectTitle": "اسم المشروع",
  "category": "نوع الموقع",
  "language": "${targetLang}",
  "direction": "${targetLang === 'ar' ? 'rtl' : 'ltr'}",
  "colorTheme": "${options.colorTheme || 'monochrome'}",
  "fontFamily": "${options.fontFamily || 'ibm-plex'}",
  "targetAudience": "الجمهور المستهدف",
  "keyGoals": ["هدف 1", "هدف 2"]
}`
      });

      const jsonMatch = response.match(/\{[\s\S]*\}/);
      const cleanJson = jsonMatch ? jsonMatch[0] : response.replace(/```json/gi, '').replace(/```/g, '').trim();
      plan = JSON.parse(cleanJson);
      plan.language = targetLang;
    } catch (err) {
      console.warn('Orchestrator AI fallback:', err.message);
      plan = getDefaultPlan(prompt, targetLang, options);
    }
  } else {
    plan = getDefaultPlan(prompt, targetLang, options);
  }

  emitLog({
    agent: 'orchestrator',
    status: 'completed',
    message: `تم اعتماد الخطة التنفيذية بنجاح لمشروع "${plan.projectTitle}" [اللغة: ${plan.language.toUpperCase()}] وتفويض المهام للوكلاء.`,
    data: plan
  });

  return plan;
}

function getDefaultPlan(prompt, lang, options) {
  const isFrench = lang === 'fr';
  const isEnglish = lang === 'en';

  let title = 'منصة ويب متطورة';
  if (isFrench) title = 'Plateforme Web d\'Excellence';
  else if (isEnglish) title = 'Next-Gen Web Platform';

  return {
    projectTitle: title,
    category: isFrench ? 'Technologie & Innovation' : (isEnglish ? 'Tech Platform' : 'منصة تقنية متطورة'),
    language: lang,
    direction: lang === 'ar' ? 'rtl' : 'ltr',
    colorTheme: options.colorTheme || 'monochrome',
    fontFamily: options.fontFamily || 'ibm-plex',
    targetAudience: isFrench ? 'Entreprises et professionnels modernes' : (isEnglish ? 'Modern enterprises and creators' : 'المستخدمون والشركات ورواد الأعمال'),
    keyGoals: [
      isFrench ? 'Expérience visuelle de luxe ultra-réactive' : (isEnglish ? 'Ultra-responsive luxury user experience' : 'تقديم تجربة بصرية فائقة الأناقة وسريعة الاستجابة'),
      isFrench ? 'Clarté du message et taux de conversion maximal' : (isEnglish ? 'High-conversion clear value proposition' : 'إبراز القيمة المضافة مع دعوة واضحة لاتخاذ إجراء')
    ]
  };
}

module.exports = {
  runOrchestrator
};
