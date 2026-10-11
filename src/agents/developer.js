const { callGemini, isKeyConfigured } = require('../gemini');

const DEVELOPER_SYSTEM_PROMPT = `You are a Principal Frontend Architect at top design-driven tech companies (Linear, Vercel, Apple).
Generate complete, standalone, production-grade HTML5 pages using Tailwind CSS and Lucide Icons.
Strict rules:
1. Complete self-contained single-page code starting with <!DOCTYPE html> and ending with </html>.
2. Flawless responsiveness across Mobile (360px+), Tablet, Desktop, and TV/Large Displays (up to 4K).
3. Zero horizontal scroll (overflow-x-hidden on body and containers).
4. Full support for Dark & Light modes with smooth toggle and localStorage persistence.
5. Real interactive elements: Theme toggle, Mobile drawer, FAQ accordions, Monthly/Annual pricing switcher, and Action modal.
6. Return raw HTML only without explanations or markdown fences.`;

async function runDeveloper({ prompt, plan, structure, designSystem, copy, media, emitLog }) {
  emitLog({
    agent: 'developer',
    status: 'thinking',
    message: `جاري كتابة الكود البرمجي المتكامل باللغة [${(plan.language || 'ar').toUpperCase()}], النمط [${designSystem.themeName}], وضبط مصفوفة التجاوب ومفتاح الأبيض/الأسود ومكتبة Lucide...`
  });

  let htmlCode;

  if (isKeyConfigured()) {
    try {
      const response = await callGemini({
        systemInstruction: DEVELOPER_SYSTEM_PROMPT,
        prompt: `Build a complete, stunning responsive website in HTML5 + Tailwind CSS.
Requirements:
- Project: ${prompt}
- Language: ${plan.language} (Direction: ${plan.language === 'ar' ? 'rtl' : 'ltr'})
- Brand: ${copy.brandName}
- Theme: ${designSystem.themeName} (Accent color: ${designSystem.accentColor})
- Font: ${designSystem.fontFamily}
- Content: ${JSON.stringify(copy)}
- Must include Lucide icons (<i data-lucide="..."></i> and lucide.createIcons())
- Must include Dark / Light mode toggle script
- Must include interactive Pricing toggle (monthly/annual) and FAQ accordions.
Output ONLY raw HTML.`
      });

      const cleaned = response.replace(/^```html\s*/i, '').replace(/```$/i, '').trim();
      if (cleaned.includes('<!DOCTYPE html>') && cleaned.includes('</html>') && cleaned.length > 2500) {
        htmlCode = cleaned;
      } else {
        htmlCode = assembleProductionHtml({ plan, structure, designSystem, copy, media });
      }
    } catch (err) {
      console.warn('Developer AI fallback to production template:', err.message);
      htmlCode = assembleProductionHtml({ plan, structure, designSystem, copy, media });
    }
  } else {
    htmlCode = assembleProductionHtml({ plan, structure, designSystem, copy, media });
  }

  emitLog({
    agent: 'developer',
    status: 'completed',
    message: `تم إنتاج كود الواجهة بنجاح (${htmlCode.length} حرف) مع دعم كامل للنمطين الأبيض والأسود والخطوط والتجاوب وأيقونات Lucide.`,
    data: { codeLength: htmlCode.length }
  });

  return htmlCode;
}

function assembleProductionHtml({ plan, structure, designSystem, copy, media }) {
  const lang = plan.language || 'ar';
  const isArabic = lang === 'ar';
  const isFrench = lang === 'fr';
  const dir = isArabic ? 'rtl' : 'ltr';

  // Trilingual UI dictionary for built-in labels & actions
  const i18n = {
    ar: {
      features: 'المميزات',
      workflow: 'آلية العمل',
      testimonials: 'الآراء',
      pricing: 'الأسعار',
      faq: 'الأسئلة',
      mostPopular: 'الأكثر اختياراً',
      getStarted: 'بدء الاستخدام الفوري',
      exploreDemo: 'استكشف العرض التفاعلي',
      monthly: 'شهرياً',
      annual: 'سنوياً (وفر 20%)',
      perMonth: '/شهرياً',
      perYear: '/سنوياً',
      modalTitle: 'انضم إلينا الآن',
      modalSub: 'أدخل بريدك الإلكتروني للبدء فوراً وتفعيل حسابك التجريبي مجاناً.',
      emailPlaceholder: 'name@example.com',
      submitBtn: 'تأكيد والانطلاق الفوري',
      closeBtn: 'إغلاق',
      successMsg: 'تم استلام طلبك بنجاح! سنتواصل معك خلال دقائق.'
    },
    en: {
      features: 'Features',
      workflow: 'Workflow',
      testimonials: 'Testimonials',
      pricing: 'Pricing',
      faq: 'FAQ',
      mostPopular: 'Most Popular',
      getStarted: 'Get Started Now',
      exploreDemo: 'Explore Interactive Demo',
      monthly: 'Monthly',
      annual: 'Annual (Save 20%)',
      perMonth: '/month',
      perYear: '/year',
      modalTitle: 'Welcome Aboard',
      modalSub: 'Enter your email to activate your instant free access right now.',
      emailPlaceholder: 'name@example.com',
      submitBtn: 'Confirm & Launch Now',
      closeBtn: 'Close',
      successMsg: 'Request received successfully! We will get in touch shortly.'
    },
    fr: {
      features: 'Fonctionnalités',
      workflow: 'Fonctionnement',
      testimonials: 'Témoignages',
      pricing: 'Tarifs',
      faq: 'FAQ',
      mostPopular: 'Plus Populaire',
      getStarted: 'Commencer Maintenant',
      exploreDemo: 'Découvrir la Démo',
      monthly: 'Mensuel',
      annual: 'Annuel (-20%)',
      perMonth: '/mois',
      perYear: '/an',
      modalTitle: 'Rejoignez-nous',
      modalSub: 'Entrez votre adresse email pour activer votre compte dès maintenant.',
      emailPlaceholder: 'nom@exemple.com',
      submitBtn: 'Valider et Commencer',
      closeBtn: 'Fermer',
      successMsg: 'Demande reçue avec succès ! Nous vous recontacterons rapidement.'
    }
  }[lang] || {
    features: 'Features',
    workflow: 'Workflow',
    testimonials: 'Testimonials',
    pricing: 'Pricing',
    faq: 'FAQ',
    mostPopular: 'Most Popular',
    getStarted: 'Get Started Now',
    exploreDemo: 'Explore Demo',
    monthly: 'Monthly',
    annual: 'Annual (Save 20%)',
    perMonth: '/month',
    perYear: '/year',
    modalTitle: 'Welcome',
    modalSub: 'Enter your email to get started.',
    emailPlaceholder: 'name@example.com',
    submitBtn: 'Get Started',
    closeBtn: 'Close',
    successMsg: 'Thank you! We will be in touch.'
  };

  const accentHex = designSystem.accentColor || '#3b82f6';
  const fontFam = designSystem.fontFamily || "'IBM Plex Sans Arabic', 'Plus Jakarta Sans', sans-serif";
  const fontUrl = designSystem.googleFontUrl || 'https://fonts.googleapis.com/css2?family=IBM+Plex+Sans+Arabic:wght@400;500;600;700;800&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap';

  const featuresCards = (copy.features?.items || []).map((item, idx) => {
    const lucideIcons = ['zap', 'shield-check', 'layers', 'cpu', 'sparkles', 'bar-chart-3', 'globe', 'compass'];
    const iconName = item.iconKey || lucideIcons[idx % lucideIcons.length];
    return `
      <div class="group relative rounded-2xl p-6 sm:p-8 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 hover:border-zinc-400 dark:hover:border-zinc-600 transition-all duration-300 shadow-sm hover:shadow-md">
        <div class="w-12 h-12 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800" style="color: ${accentHex};">
          <i data-lucide="${iconName}" class="w-6 h-6"></i>
        </div>
        <h3 class="text-xl font-bold text-zinc-950 dark:text-white mb-3 tracking-tight">${item.title}</h3>
        <p class="text-zinc-600 dark:text-zinc-400 text-sm leading-relaxed">${item.desc}</p>
      </div>
    `;
  }).join('');

  const stepsCards = (copy.showcase?.steps || []).map((st) => {
    return `
      <div class="rounded-2xl p-6 sm:p-8 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 relative shadow-sm">
        <div class="flex items-center justify-between mb-6">
          <span class="text-4xl font-mono font-black" style="color: ${accentHex};">${st.step}</span>
          <span class="w-2.5 h-2.5 rounded-full animate-pulse" style="background-color: ${accentHex};"></span>
        </div>
        <h4 class="text-lg font-bold text-zinc-950 dark:text-white mb-2">${st.title}</h4>
        <p class="text-zinc-600 dark:text-zinc-400 text-sm leading-relaxed">${st.desc}</p>
      </div>
    `;
  }).join('');

  const testimonialsCards = (copy.testimonials?.items || []).map((t, idx) => {
    const avatar = (media && media.images && (media.images[`avatar${idx + 1}`] || media.images.avatar1)) || `https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80`;
    return `
      <div class="rounded-2xl p-6 sm:p-8 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 flex flex-col justify-between shadow-sm">
        <div class="flex items-center space-x-1 rtl:space-x-reverse mb-4 text-amber-400">
          <i data-lucide="star" class="w-4 h-4 fill-current"></i>
          <i data-lucide="star" class="w-4 h-4 fill-current"></i>
          <i data-lucide="star" class="w-4 h-4 fill-current"></i>
          <i data-lucide="star" class="w-4 h-4 fill-current"></i>
          <i data-lucide="star" class="w-4 h-4 fill-current"></i>
        </div>
        <p class="text-zinc-700 dark:text-zinc-300 text-sm sm:text-base leading-relaxed mb-6 italic">"${t.quote}"</p>
        <div class="flex items-center space-x-3.5 rtl:space-x-reverse pt-4 border-t border-zinc-200 dark:border-zinc-800">
          <img src="${avatar}" alt="${t.name}" class="w-11 h-11 rounded-full object-cover border border-zinc-300 dark:border-zinc-700" loading="lazy" />
          <div>
            <div class="text-sm font-bold text-zinc-950 dark:text-white">${t.name}</div>
            <div class="text-xs text-zinc-500 dark:text-zinc-400">${t.role} · ${t.company}</div>
          </div>
        </div>
      </div>
    `;
  }).join('');

  const pricingCards = (copy.pricing?.tiers || []).map((tier, idx) => {
    const isPopular = tier.popular || idx === 1;
    const borderClass = isPopular
      ? 'border-2 border-zinc-950 dark:border-white shadow-xl scale-[1.02]'
      : 'border border-zinc-200 dark:border-zinc-800 shadow-sm';

    const badge = isPopular
      ? `<div class="absolute -top-3.5 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full text-black font-black text-[11px] uppercase tracking-wider shadow-sm" style="background-color: ${accentHex === '#ffffff' ? '#ffffff' : accentHex}; color: ${accentHex === '#ffffff' ? '#000000' : '#ffffff'};">${i18n.mostPopular}</div>`
      : '';

    const featuresList = (tier.features || []).map(f => `
      <li class="flex items-center space-x-2.5 rtl:space-x-reverse text-sm text-zinc-700 dark:text-zinc-300">
        <i data-lucide="check" class="w-4 h-4 flex-shrink-0" style="color: ${accentHex};"></i>
        <span>${f}</span>
      </li>
    `).join('');

    const basePriceNum = parseInt((tier.price || '').replace(/[^0-9]/g, '')) || 49;
    const annualPriceNum = Math.round(basePriceNum * 0.8);
    const currencySymbol = (tier.price || '').replace(/[0-9\s]/g, '') || '$';

    return `
      <div class="relative rounded-2xl p-6 sm:p-8 bg-white dark:bg-zinc-950 ${borderClass} flex flex-col justify-between">
        ${badge}
        <div>
          <h4 class="text-xl font-bold text-zinc-950 dark:text-white mb-2">${tier.name}</h4>
          <p class="text-zinc-600 dark:text-zinc-400 text-xs sm:text-sm mb-6">${tier.desc}</p>
          <div class="flex items-baseline space-x-1.5 rtl:space-x-reverse mb-6">
            <span class="text-4xl sm:text-5xl font-black font-mono text-zinc-950 dark:text-white price-value" data-monthly="${currencySymbol}${basePriceNum}" data-annual="${currencySymbol}${annualPriceNum}">${tier.price}</span>
            <span class="text-zinc-500 dark:text-zinc-400 text-xs sm:text-sm price-period">${tier.period || i18n.perMonth}</span>
          </div>
          <ul class="space-y-3 mb-8 pt-4 border-t border-zinc-200 dark:border-zinc-800">
            ${featuresList}
          </ul>
        </div>
        <button onclick="openModal('${tier.name}')" class="w-full py-3.5 rounded-full font-bold text-sm transition-all shadow-md active:scale-95 ${isPopular ? 'bg-zinc-950 text-white dark:bg-white dark:text-black hover:opacity-90' : 'bg-zinc-100 dark:bg-zinc-900 text-zinc-900 dark:text-white border border-zinc-300 dark:border-zinc-700 hover:bg-zinc-200 dark:hover:bg-zinc-800'}">
          ${i18n.getStarted}
        </button>
      </div>
    `;
  }).join('');

  const faqCards = (copy.faq?.items || []).map((item, idx) => {
    return `
      <div class="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 overflow-hidden transition-all shadow-sm">
        <button onclick="toggleFaq(${idx})" class="w-full p-5 sm:p-6 text-${isArabic ? 'right' : 'left'} flex items-center justify-between font-bold text-zinc-950 dark:text-white focus:outline-none hover:bg-zinc-50 dark:hover:bg-zinc-900/50 transition-colors">
          <span class="text-sm sm:text-base">${item.q}</span>
          <i id="faq-icon-${idx}" data-lucide="chevron-down" class="w-5 h-5 text-zinc-400 transition-transform duration-200 flex-shrink-0"></i>
        </button>
        <div id="faq-ans-${idx}" class="hidden px-5 sm:px-6 pb-6 text-zinc-600 dark:text-zinc-400 text-sm leading-relaxed border-t border-zinc-200 dark:border-zinc-800/60 pt-4">
          ${item.a}
        </div>
      </div>
    `;
  }).join('');

  return `<!DOCTYPE html>
<html lang="${lang}" dir="${dir}" class="dark scroll-smooth">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=5.0">
  <title>${copy.brandName || 'Platform'} | Next-Gen Edition</title>
  <meta name="description" content="${(copy.hero && copy.hero.description) || 'Autonomous Web Experience'}">

  <!-- Google Font: ${fontFam.split(',')[0]} -->
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="${fontUrl}" rel="stylesheet">

  <!-- Tailwind CSS CDN -->
  <script src="https://cdn.tailwindcss.com"></script>
  <script>
    tailwind.config = {
      darkMode: 'class',
      theme: {
        extend: {
          fontFamily: {
            sans: [${fontFam}],
            mono: ['"JetBrains Mono"', 'monospace']
          }
        }
      }
    }
  </script>

  <!-- Lucide Icons -->
  <script src="https://unpkg.com/lucide@latest"></script>

  <style>
    :root {
      --accent: ${accentHex};
    }
    body {
      font-family: ${fontFam};
      overflow-x: hidden;
      transition: background-color 0.3s ease, color 0.3s ease;
    }
    html.dark body {
      background-color: #000000;
      color: #ffffff;
    }
    html:not(.dark) body {
      background-color: #ffffff;
      color: #09090b;
    }
    .grid-lines {
      background-size: 32px 32px;
      background-image: 
        linear-gradient(to right, rgba(0, 0, 0, 0.04) 1px, transparent 1px),
        linear-gradient(to bottom, rgba(0, 0, 0, 0.04) 1px, transparent 1px);
    }
    html.dark .grid-lines {
      background-image: 
        linear-gradient(to right, rgba(255, 255, 255, 0.05) 1px, transparent 1px),
        linear-gradient(to bottom, rgba(255, 255, 255, 0.05) 1px, transparent 1px);
    }
  </style>
</head>
<body class="min-h-screen antialiased selection:bg-zinc-800 selection:text-white dark:selection:bg-white dark:selection:text-black">

  <!-- Navigation Bar (Fully Responsive) -->
  <header class="sticky top-0 z-50 backdrop-blur-xl border-b border-zinc-200 dark:border-zinc-800 bg-white/90 dark:bg-black/90 transition-colors">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
      
      <!-- Brand Logo -->
      <a href="#" class="flex items-center space-x-3 rtl:space-x-reverse group">
        <div class="w-10 h-10 rounded-xl bg-zinc-950 text-white dark:bg-white dark:text-black flex items-center justify-center font-black text-sm tracking-wider shadow-sm group-hover:scale-105 transition-transform" style="background-color: ${accentHex}; color: #ffffff;">
          ${(copy.brandName || 'A5').substring(0, 2).toUpperCase()}
        </div>
        <span class="text-lg sm:text-xl font-black tracking-tight text-zinc-950 dark:text-white">
          ${copy.brandName || 'Platform'}
        </span>
      </a>

      <!-- Desktop Links -->
      <nav class="hidden md:flex items-center space-x-8 rtl:space-x-reverse text-sm font-semibold text-zinc-600 dark:text-zinc-400">
        <a href="#features" class="hover:text-zinc-950 dark:hover:text-white transition-colors">${i18n.features}</a>
        <a href="#how-it-works" class="hover:text-zinc-950 dark:hover:text-white transition-colors">${i18n.workflow}</a>
        <a href="#testimonials" class="hover:text-zinc-950 dark:hover:text-white transition-colors">${i18n.testimonials}</a>
        <a href="#pricing" class="hover:text-zinc-950 dark:hover:text-white transition-colors">${i18n.pricing}</a>
        <a href="#faq" class="hover:text-zinc-950 dark:hover:text-white transition-colors">${i18n.faq}</a>
      </nav>

      <!-- Right Controls: Theme Switcher & Primary CTA -->
      <div class="flex items-center space-x-3 rtl:space-x-reverse">
        <!-- Dark / Light Mode Switcher Button -->
        <button onclick="toggleTheme()" class="p-2.5 rounded-full border border-zinc-200 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 hover:text-black dark:hover:text-white transition-all shadow-sm" aria-label="Toggle Theme" title="Toggle Light / Dark Mode">
          <i id="theme-icon" data-lucide="sun" class="w-4 h-4"></i>
        </button>

        <button onclick="openModal('${(copy.hero && copy.hero.primaryCta) || i18n.getStarted}')" class="hidden sm:inline-flex px-5 py-2.5 rounded-full font-bold text-xs sm:text-sm bg-zinc-950 text-white dark:bg-white dark:text-black hover:opacity-90 active:scale-95 transition-all shadow-md">
          ${(copy.hero && copy.hero.primaryCta) || i18n.getStarted}
        </button>

        <!-- Mobile Drawer Trigger -->
        <button onclick="toggleMobileMenu()" class="md:hidden p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 text-zinc-800 dark:text-zinc-200" aria-label="Open Mobile Navigation">
          <i data-lucide="menu" class="w-5 h-5"></i>
        </button>
      </div>

    </div>

    <!-- Mobile Drawer Container -->
    <div id="mobile-menu" class="hidden md:hidden px-6 pt-4 pb-8 border-t border-zinc-200 dark:border-zinc-800 bg-white dark:bg-black space-y-4 shadow-xl">
      <a href="#features" onclick="toggleMobileMenu()" class="block text-zinc-700 dark:text-zinc-300 font-semibold text-sm">${i18n.features}</a>
      <a href="#how-it-works" onclick="toggleMobileMenu()" class="block text-zinc-700 dark:text-zinc-300 font-semibold text-sm">${i18n.workflow}</a>
      <a href="#testimonials" onclick="toggleMobileMenu()" class="block text-zinc-700 dark:text-zinc-300 font-semibold text-sm">${i18n.testimonials}</a>
      <a href="#pricing" onclick="toggleMobileMenu()" class="block text-zinc-700 dark:text-zinc-300 font-semibold text-sm">${i18n.pricing}</a>
      <a href="#faq" onclick="toggleMobileMenu()" class="block text-zinc-700 dark:text-zinc-300 font-semibold text-sm">${i18n.faq}</a>
      <button onclick="openModal('${(copy.hero && copy.hero.primaryCta) || i18n.getStarted}'); toggleMobileMenu()" class="w-full py-3.5 rounded-full font-bold text-sm bg-zinc-950 text-white dark:bg-white dark:text-black shadow-md">
        ${(copy.hero && copy.hero.primaryCta) || i18n.getStarted}
      </button>
    </div>
  </header>

  <!-- Hero Section -->
  <section class="relative pt-20 pb-28 sm:pt-28 sm:pb-36 overflow-hidden grid-lines">
    <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
      
      <!-- Top Badge -->
      <div class="inline-flex items-center space-x-2 rtl:space-x-reverse px-4 py-1.5 rounded-full border border-zinc-200 dark:border-zinc-800 bg-zinc-100/80 dark:bg-zinc-900/80 text-xs text-zinc-800 dark:text-zinc-200 mb-8 backdrop-blur shadow-sm">
        <i data-lucide="sparkles" class="w-3.5 h-3.5" style="color: ${accentHex};"></i>
        <span class="font-semibold">${copy.badge || 'Executive Edition 2026'}</span>
      </div>

      <!-- Main Headline -->
      <h1 class="text-4xl sm:text-6xl md:text-7xl font-black tracking-tight text-zinc-950 dark:text-white mb-8 leading-[1.15] max-w-5xl mx-auto">
        ${(copy.hero && copy.hero.titlePrefix) || ''} 
        <span class="underline underline-offset-8" style="text-decoration-color: ${accentHex};">
          ${(copy.hero && copy.hero.titleHighlight) || copy.brandName}
        </span>
        ${(copy.hero && copy.hero.titleSuffix) ? ' ' + copy.hero.titleSuffix : ''}
      </h1>

      <!-- Description -->
      <p class="max-w-2xl mx-auto text-base sm:text-xl text-zinc-600 dark:text-zinc-400 mb-12 leading-relaxed">
        ${(copy.hero && copy.hero.description) || ''}
      </p>

      <!-- CTAs -->
      <div class="flex flex-col sm:flex-row items-center justify-center gap-4 mb-20">
        <button onclick="openModal('${(copy.hero && copy.hero.primaryCta) || i18n.getStarted}')" class="w-full sm:w-auto px-8 py-4 rounded-full font-black text-sm bg-zinc-950 text-white dark:bg-white dark:text-black hover:opacity-90 active:scale-95 transition-all shadow-xl flex items-center justify-center space-x-2 rtl:space-x-reverse">
          <span>${(copy.hero && copy.hero.primaryCta) || i18n.getStarted}</span>
          <i data-lucide="${isArabic ? 'arrow-left' : 'arrow-right'}" class="w-4 h-4"></i>
        </button>
        <a href="#features" class="w-full sm:w-auto px-8 py-4 rounded-full font-bold text-sm border border-zinc-300 dark:border-zinc-800 text-zinc-800 dark:text-zinc-300 hover:border-zinc-500 transition-all flex items-center justify-center">
          ${(copy.hero && copy.hero.secondaryCta) || i18n.exploreDemo}
        </a>
      </div>

      <!-- Key Metrics -->
      <div class="grid grid-cols-3 gap-6 max-w-3xl mx-auto py-8 border-y border-zinc-200 dark:border-zinc-800">
        ${((copy.hero && copy.hero.metrics) || []).map(m => `
          <div>
            <div class="text-2xl sm:text-4xl font-black font-mono text-zinc-950 dark:text-white" style="color: ${accentHex};">${m.number}</div>
            <div class="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 mt-1">${m.label}</div>
          </div>
        `).join('')}
      </div>

    </div>
  </section>

  <!-- Features Grid -->
  <section id="features" class="py-24 sm:py-32 border-t border-zinc-200 dark:border-zinc-900">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      
      <div class="max-w-3xl mb-16 text-start">
        <span class="text-xs font-mono font-bold tracking-widest uppercase text-zinc-500" style="color: ${accentHex};">
          // ${(copy.features && copy.features.sectionBadge) || i18n.features}
        </span>
        <h2 class="text-3xl sm:text-5xl font-black text-zinc-950 dark:text-white mt-3 mb-4 tracking-tight">
          ${(copy.features && copy.features.sectionTitle) || 'Capabilities'}
        </h2>
        <p class="text-zinc-600 dark:text-zinc-400 text-base sm:text-lg">
          ${(copy.features && copy.features.sectionSubtitle) || ''}
        </p>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        ${featuresCards}
      </div>

    </div>
  </section>

  <!-- How It Works / Workflow -->
  <section id="how-it-works" class="py-24 sm:py-32 border-t border-zinc-200 dark:border-zinc-900 bg-zinc-50 dark:bg-zinc-950/40">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      
      <div class="text-center max-w-3xl mx-auto mb-16">
        <span class="text-xs font-mono font-bold tracking-widest uppercase text-zinc-500" style="color: ${accentHex};">
          // ${(copy.showcase && copy.showcase.badge) || i18n.workflow}
        </span>
        <h2 class="text-3xl sm:text-5xl font-black text-zinc-950 dark:text-white mt-3 mb-4">
          ${(copy.showcase && copy.showcase.title) || 'How It Works'}
        </h2>
        <p class="text-zinc-600 dark:text-zinc-400 text-base sm:text-lg">
          ${(copy.showcase && copy.showcase.subtitle) || ''}
        </p>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        ${stepsCards}
      </div>

    </div>
  </section>

  <!-- Testimonials Section -->
  <section id="testimonials" class="py-24 sm:py-32 border-t border-zinc-200 dark:border-zinc-900">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      
      <div class="text-center max-w-3xl mx-auto mb-16">
        <span class="text-xs font-mono font-bold tracking-widest uppercase text-zinc-500" style="color: ${accentHex};">
          // ${(copy.testimonials && copy.testimonials.badge) || i18n.testimonials}
        </span>
        <h2 class="text-3xl sm:text-5xl font-black text-zinc-950 dark:text-white mt-3">
          ${(copy.testimonials && copy.testimonials.title) || 'Stories'}
        </h2>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        ${testimonialsCards}
      </div>

    </div>
  </section>

  <!-- Pricing Table with Monthly / Annual Switcher -->
  <section id="pricing" class="py-24 sm:py-32 border-t border-zinc-200 dark:border-zinc-900 bg-zinc-50 dark:bg-zinc-950/40">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      
      <div class="text-center max-w-3xl mx-auto mb-12">
        <span class="text-xs font-mono font-bold tracking-widest uppercase text-zinc-500" style="color: ${accentHex};">
          // ${(copy.pricing && copy.pricing.badge) || i18n.pricing}
        </span>
        <h2 class="text-3xl sm:text-5xl font-black text-zinc-950 dark:text-white mt-3 mb-4">
          ${(copy.pricing && copy.pricing.title) || 'Pricing'}
        </h2>
        <p class="text-zinc-600 dark:text-zinc-400 text-base sm:text-lg mb-8">
          ${(copy.pricing && copy.pricing.subtitle) || ''}
        </p>

        <!-- Pricing Billing Switcher Toggle -->
        <div class="inline-flex items-center p-1 rounded-full border border-zinc-300 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm">
          <button id="billing-monthly-btn" onclick="toggleBillingPeriod('monthly')" class="px-5 py-2 rounded-full font-bold text-xs sm:text-sm bg-zinc-950 text-white dark:bg-white dark:text-black transition-all">
            ${i18n.monthly}
          </button>
          <button id="billing-annual-btn" onclick="toggleBillingPeriod('annual')" class="px-5 py-2 rounded-full font-bold text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white transition-all">
            ${i18n.annual}
          </button>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
        ${pricingCards}
      </div>

    </div>
  </section>

  <!-- FAQ Accordion Section -->
  <section id="faq" class="py-24 sm:py-32 border-t border-zinc-200 dark:border-zinc-900">
    <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
      
      <div class="text-center mb-16">
        <span class="text-xs font-mono font-bold tracking-widest uppercase text-zinc-500" style="color: ${accentHex};">
          // ${(copy.faq && copy.faq.badge) || i18n.faq}
        </span>
        <h2 class="text-3xl sm:text-5xl font-black text-zinc-950 dark:text-white mt-3">
          ${(copy.faq && copy.faq.title) || 'FAQ'}
        </h2>
      </div>

      <div class="space-y-4">
        ${faqCards}
      </div>

    </div>
  </section>

  <!-- CTA Banner -->
  <section class="py-20 border-t border-zinc-200 dark:border-zinc-900">
    <div class="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="rounded-3xl p-10 sm:p-16 border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 text-center relative overflow-hidden shadow-lg">
        <h2 class="text-3xl sm:text-5xl font-black text-zinc-950 dark:text-white mb-6 tracking-tight">
          ${(copy.ctaBanner && copy.ctaBanner.title) || 'Ready to start?'}
        </h2>
        <p class="text-zinc-600 dark:text-zinc-400 text-base sm:text-lg mb-8 max-w-2xl mx-auto">
          ${(copy.ctaBanner && copy.ctaBanner.subtitle) || ''}
        </p>
        <button onclick="openModal('${(copy.ctaBanner && copy.ctaBanner.buttonText) || i18n.getStarted}')" class="px-8 py-4 rounded-full font-black text-sm bg-zinc-950 text-white dark:bg-white dark:text-black hover:opacity-90 active:scale-95 transition-all shadow-xl">
          ${(copy.ctaBanner && copy.ctaBanner.buttonText) || i18n.getStarted}
        </button>
      </div>
    </div>
  </section>

  <!-- Footer -->
  <footer class="border-t border-zinc-200 dark:border-zinc-900 py-12 bg-white dark:bg-black">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6">
      <div class="flex items-center space-x-3 rtl:space-x-reverse">
        <div class="w-8 h-8 rounded-lg bg-zinc-950 text-white dark:bg-white dark:text-black flex items-center justify-center font-bold text-xs" style="background-color: ${accentHex}; color: #ffffff;">
          ${(copy.brandName || 'A5').substring(0, 2).toUpperCase()}
        </div>
        <span class="text-sm font-bold text-zinc-950 dark:text-white">${copy.brandName || 'Platform'}</span>
      </div>
      <p class="text-xs text-zinc-500 text-center md:text-start max-w-md">${(copy.footer && copy.footer.bio) || ''}</p>
      <div class="text-xs text-zinc-500 font-mono">${(copy.footer && copy.footer.copyright) || '© 2026 All Rights Reserved.'}</div>
    </div>
  </footer>

  <!-- Interactive Action Modal (Real Functional Dialog) -->
  <div id="action-modal" class="fixed inset-0 z-50 hidden bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
    <div class="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl relative animate-in fade-in zoom-in duration-200">
      <button onclick="closeModal()" class="absolute top-5 left-5 rtl:left-auto rtl:right-5 p-2 rounded-full text-zinc-400 hover:text-black dark:hover:text-white" aria-label="Close modal">
        <i data-lucide="x" class="w-5 h-5"></i>
      </button>
      <div class="w-12 h-12 rounded-2xl flex items-center justify-center mb-4" style="background-color: ${accentHex}20; color: ${accentHex};">
        <i data-lucide="sparkles" class="w-6 h-6"></i>
      </div>
      <h3 id="modal-title" class="text-xl sm:text-2xl font-bold text-zinc-950 dark:text-white mb-2">${i18n.modalTitle}</h3>
      <p class="text-zinc-600 dark:text-zinc-400 text-sm mb-6">${i18n.modalSub}</p>
      
      <form onsubmit="handleModalSubmit(event)" class="space-y-4">
        <div>
          <input type="email" id="modal-email-input" required placeholder="${i18n.emailPlaceholder}" class="w-full px-4 py-3 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 text-zinc-950 dark:text-white placeholder-zinc-400 focus:outline-none focus:border-black dark:focus:border-white text-sm">
        </div>
        <button type="submit" class="w-full py-3.5 rounded-xl font-bold text-sm bg-zinc-950 text-white dark:bg-white dark:text-black hover:opacity-90 active:scale-98 transition-all shadow-md">
          ${i18n.submitBtn}
        </button>
      </form>
      <div id="modal-success" class="hidden mt-4 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs font-semibold text-center">
        ${i18n.successMsg}
      </div>
    </div>
  </div>

  <!-- Pure Interactive JS -->
  <script>
    document.addEventListener('DOMContentLoaded', () => {
      if (window.lucide) {
        window.lucide.createIcons();
      }
      applySavedTheme();
    });

    // Theme Switcher (Dark / Light)
    function toggleTheme() {
      const html = document.documentElement;
      const isDark = html.classList.contains('dark');
      if (isDark) {
        html.classList.remove('dark');
        localStorage.setItem('site_theme', 'light');
      } else {
        html.classList.add('dark');
        localStorage.setItem('site_theme', 'dark');
      }
      updateThemeIcon();
    }

    function updateThemeIcon() {
      const isDark = document.documentElement.classList.contains('dark');
      const icon = document.getElementById('theme-icon');
      if (icon) {
        icon.setAttribute('data-lucide', isDark ? 'sun' : 'moon');
        if (window.lucide) window.lucide.createIcons();
      }
    }

    function applySavedTheme() {
      const savedTheme = localStorage.getItem('site_theme');
      if (savedTheme === 'light') {
        document.documentElement.classList.remove('dark');
      } else {
        document.documentElement.classList.add('dark');
      }
      updateThemeIcon();
    }

    // Mobile Menu
    function toggleMobileMenu() {
      const menu = document.getElementById('mobile-menu');
      if (menu) menu.classList.toggle('hidden');
    }

    // FAQ Accordion
    function toggleFaq(index) {
      const ans = document.getElementById('faq-ans-' + index);
      const icon = document.getElementById('faq-icon-' + index);
      if (!ans) return;
      if (ans.classList.contains('hidden')) {
        ans.classList.remove('hidden');
        if (icon) icon.style.transform = 'rotate(180deg)';
      } else {
        ans.classList.add('hidden');
        if (icon) icon.style.transform = 'rotate(0deg)';
      }
    }

    // Pricing Billing Switcher (Monthly vs Annual)
    function toggleBillingPeriod(period) {
      const monthlyBtn = document.getElementById('billing-monthly-btn');
      const annualBtn = document.getElementById('billing-annual-btn');
      const prices = document.querySelectorAll('.price-value');
      const periods = document.querySelectorAll('.price-period');

      const isAnnual = period === 'annual';
      if (isAnnual) {
        annualBtn.className = 'px-5 py-2 rounded-full font-bold text-xs sm:text-sm bg-zinc-950 text-white dark:bg-white dark:text-black transition-all';
        monthlyBtn.className = 'px-5 py-2 rounded-full font-bold text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white transition-all';
      } else {
        monthlyBtn.className = 'px-5 py-2 rounded-full font-bold text-xs sm:text-sm bg-zinc-950 text-white dark:bg-white dark:text-black transition-all';
        annualBtn.className = 'px-5 py-2 rounded-full font-bold text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white transition-all';
      }

      prices.forEach(el => {
        const val = isAnnual ? el.getAttribute('data-annual') : el.getAttribute('data-monthly');
        if (val) el.textContent = val;
      });

      periods.forEach(el => {
        el.textContent = isAnnual ? '${i18n.perYear}' : '${i18n.perMonth}';
      });
    }

    // Action Modal
    function openModal(title) {
      const modal = document.getElementById('action-modal');
      const modalTitle = document.getElementById('modal-title');
      if (modalTitle && title) modalTitle.textContent = title;
      if (modal) modal.classList.remove('hidden');
      if (window.lucide) window.lucide.createIcons();
    }

    function closeModal() {
      const modal = document.getElementById('action-modal');
      if (modal) modal.classList.add('hidden');
      const success = document.getElementById('modal-success');
      if (success) success.classList.add('hidden');
    }

    function handleModalSubmit(e) {
      e.preventDefault();
      const success = document.getElementById('modal-success');
      if (success) success.classList.remove('hidden');
      setTimeout(() => {
        closeModal();
      }, 2500);
    }
  </script>
</body>
</html>`;
}

module.exports = {
  runDeveloper,
  assembleProductionHtml
};
