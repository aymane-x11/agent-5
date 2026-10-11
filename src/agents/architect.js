const { callGemini, isKeyConfigured } = require('../gemini');

const ARCHITECT_SYSTEM_PROMPT = `أنت "وكيل هيكلة المواقع" (Site Architect Agent).
مسؤوليتك:
1. تخطيط الهيكل التنظيمي الكامل لصفحة الويب (Page Architecture & Wireframe).
2. تحديد الأقسام الإلزامية وتسلسلها المنطقي لتحقيق أفضل تجربة تصفح ومعدل تحويل.
3. تحديد متطلبات التجاوب (Responsive Breakpoints: Mobile, Tablet, Desktop).
4. تحديد العناصر التفاعلية اللازمة في كل قسم (Navigation menu, Tabs, FAQ Accordion, Pricing switchers, Contact Modals).`;

async function runArchitect({ prompt, plan, emitLog }) {
  emitLog({
    agent: 'architect',
    status: 'thinking',
    message: 'جاري تخطيط البنية الهيكلية للموقع وتحديد شبكة العناصر والأقسام...'
  });

  let structure;
  if (isKeyConfigured()) {
    try {
      const response = await callGemini({
        systemInstruction: ARCHITECT_SYSTEM_PROMPT,
        jsonMode: true,
        prompt: `بناءً على خطة المدير التالية:
${JSON.stringify(plan, null, 2)}

وفكرة المستخدم: "${prompt}"

قم بتخطيط هيكل الصفحة وأعد JSON فقط بالصيغة التالية:
{
  "layoutType": "Modern Responsive Landing Page",
  "direction": "${plan.language === 'ar' ? 'rtl' : 'ltr'}",
  "sections": [
    {
      "id": "navbar",
      "type": "navigation",
      "elements": ["Logo", "Navigation Links", "Call To Action Button", "Mobile Menu Trigger"]
    },
    {
      "id": "hero",
      "type": "hero-section",
      "elements": ["Badge", "Main Headline", "Subheadline", "CTA Primary & Secondary", "Social Proof / Trust Badges", "Visual Preview Mockup"]
    },
    {
      "id": "features",
      "type": "feature-grid",
      "elements": ["Section Header", "Grid of 3 to 6 Feature Cards", "Interactive Details"]
    },
    {
      "id": "showcase",
      "type": "interactive-showcase",
      "elements": ["Product Workflow / Steps", "Visual Highlights", "Key Metrics"]
    },
    {
      "id": "testimonials",
      "type": "social-proof",
      "elements": ["Client Ratings", "Testimonial Cards", "Brand Logos"]
    },
    {
      "id": "pricing",
      "type": "pricing-table",
      "elements": ["Monthly/Annual Toggle", "Tier Cards", "Feature Lists", "Checkout CTA"]
    },
    {
      "id": "faq",
      "type": "accordion-faq",
      "elements": ["Accordion Items", "Help Box"]
    },
    {
      "id": "cta-banner",
      "type": "conversion-banner",
      "elements": ["Action Banner", "Urgency message", "Instant action form"]
    },
    {
      "id": "footer",
      "type": "site-footer",
      "elements": ["Brand Bio", "Quick Links", "Legal Links", "Newsletter Subscription", "Copyright"]
    }
  ],
  "interactiveComponents": ["mobileMenuDrawer", "faqAccordionToggle", "pricingPeriodToggle", "smoothScroll"]
}`
      });

      const jsonMatch = response.match(/\{[\s\S]*\}/);
      const cleanJson = jsonMatch ? jsonMatch[0] : response.replace(/```json/gi, '').replace(/```/g, '').trim();
      structure = JSON.parse(cleanJson);
    } catch (err) {
      console.warn('Architect AI fallback:', err.message);
      structure = getDefaultStructure(plan);
    }
  } else {
    structure = getDefaultStructure(plan);
  }

  emitLog({
    agent: 'architect',
    status: 'completed',
    message: `تم اعتماد الهيكل التنظيمي للموقع بعدد ${structure.sections.length} أقسام متكاملة مع نظام التجاوب الكامل.`,
    data: structure
  });

  return structure;
}

function getDefaultStructure(plan) {
  const isArabic = plan.language === 'ar';
  return {
    layoutType: 'Responsive High-Converting Landing Platform',
    direction: isArabic ? 'rtl' : 'ltr',
    sections: [
      { id: 'navbar', type: 'navigation', title: isArabic ? 'شريط التنقل العلوي' : 'Navbar Header' },
      { id: 'hero', type: 'hero-section', title: isArabic ? 'القسم التعريفي الرئيسي' : 'Hero Section' },
      { id: 'features', type: 'feature-grid', title: isArabic ? 'المميزات والخدمات' : 'Core Features' },
      { id: 'showcase', type: 'interactive-showcase', title: isArabic ? 'آلية العمل والتجربة' : 'Interactive Showcase' },
      { id: 'testimonials', type: 'social-proof', title: isArabic ? 'آراء العملاء والشركاء' : 'Testimonials & Proof' },
      { id: 'pricing', type: 'pricing-table', title: isArabic ? 'خطط الأسعار' : 'Pricing Plans' },
      { id: 'faq', type: 'accordion-faq', title: isArabic ? 'الأسئلة الشائعة' : 'FAQ Accordion' },
      { id: 'cta-banner', type: 'conversion-banner', title: isArabic ? 'دعوة الانضمام' : 'Conversion CTA' },
      { id: 'footer', type: 'site-footer', title: isArabic ? 'المذيّل ومعلومات الاتصال' : 'Footer' }
    ],
    interactiveComponents: ['mobileMenuDrawer', 'faqAccordionToggle', 'pricingPeriodToggle', 'smoothScroll']
  };
}

module.exports = {
  runArchitect
};
