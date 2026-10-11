const { callGemini, isKeyConfigured } = require('../gemini');

const COPYWRITER_SYSTEM_PROMPT = `أنت "وكيل المحتوى والتسويق" (Content Strategist & Copywriter Agent).
مسؤوليتك:
1. صياغة محتوى نصي تسويقي مقنع واحترافي وشديد الجاذبية يعكس فكرة الموقع تماماً.
2. تجنب النصوص التوضيحية الباهتة (مثل Lorem Ipsum) وكتابة محتوى أصيل وملهم.
3. صياغة عناوين قوية (Headlines)، نصوص وصفية (Subtext)، نقاط قوة، إحصائيات واقعية، أسئلة شائعة، وباقات أسعار ذكية.
4. الالتزام بلغة الموقع المختارة بدقة لغوية ونحوية عالية.`;

async function runCopywriter({ prompt, plan, structure, designSystem, emitLog }) {
  emitLog({
    agent: 'copywriter',
    status: 'thinking',
    message: 'جاري كتابة المحتوى التسويقي، العناوين الإبداعية، والبيانات التفاعلية...'
  });

  let copy;
  if (isKeyConfigured()) {
    try {
      const response = await callGemini({
        systemInstruction: COPYWRITER_SYSTEM_PROMPT,
        jsonMode: true,
        prompt: `اكتب المحتوى الكامل لصفحة موقع بناءً على التفاصيل:
فكرة المستخدم: "${prompt}"
خطة المشروع: ${JSON.stringify(plan)}
لغة الموقع: ${plan.language}

أعد JSON فقط بدون أي مقدمات بالصيغة التالية:
{
  "brandName": "اسم البراند أو المنصة",
  "badge": "شارة مميزة أعلى العنوان الرئيسي",
  "hero": {
    "titlePrefix": "كلمات البداية",
    "titleHighlight": "الكلمة المميزة بالتدرج اللوني",
    "titleSuffix": "باقي العنوان",
    "description": "فقرة تقديمية مقنعة من سطرين إلى ثلاثة تشرح القيمة الفريدة للمشروع",
    "primaryCta": "نص زر الإجراء الرئيسي",
    "secondaryCta": "نص زر الإجراء الثانوي",
    "metrics": [
      { "number": "99.9%", "label": "وصف المؤشر" },
      { "number": "+50,000", "label": "وصف المؤشر" },
      { "number": "10x", "label": "وصف المؤشر" }
    ]
  },
  "features": {
    "sectionBadge": "المميزات المتقدمة",
    "sectionTitle": "عنوان قسم المميزات",
    "sectionSubtitle": "وصف مختصر لقسم المميزات",
    "items": [
      { "title": "ميزة 1", "desc": "شرح عملي ومقنع للميزة وكيف تفيد العميل", "iconKey": "zap" },
      { "title": "ميزة 2", "desc": "شرح عملي ومقنع للميزة وكيف تفيد العميل", "iconKey": "shield" },
      { "title": "ميزة 3", "desc": "شرح عملي ومقنع للميزة وكيف تفيد العميل", "iconKey": "rocket" },
      { "title": "ميزة 4", "desc": "شرح عملي ومقنع للميزة وكيف تفيد العميل", "iconKey": "cpu" },
      { "title": "ميزة 5", "desc": "شرح عملي ومقنع للميزة وكيف تفيد العميل", "iconKey": "sparkles" },
      { "title": "ميزة 6", "desc": "شرح عملي ومقنع للميزة وكيف تفيد العميل", "iconKey": "barChart" }
    ]
  },
  "showcase": {
    "badge": "كيف يعمل",
    "title": "رحلة انطلاقك في خطوات معدودة",
    "subtitle": "صممنا التجربة لتكون في غاية السلاسة والسرعة والفعالية",
    "steps": [
      { "step": "01", "title": "الخطوة الأولى", "desc": "شرح الخطوة الأولى" },
      { "step": "02", "title": "الخطوة الثانية", "desc": "شرح الخطوة الثانية" },
      { "step": "03", "title": "الخطوة الثالثة", "desc": "شرح الخطوة الثالثة" }
    ]
  },
  "testimonials": {
    "badge": "قصص النجاح",
    "title": "ماذا يقول شركاؤنا وعملاؤنا",
    "items": [
      { "name": "أحمد المنصوري", "role": "مؤسس تنفيذي", "company": "تيك لابس", "quote": "شهادة واقعية تشيد بالمنصة ونتائجها الاستثنائية.", "rating": 5 },
      { "name": "سارة الخالدي", "role": "مديرة التسويق الرقمي", "company": "ڤينشر بلاس", "quote": "شهادة واقعية حول توفير الوقت والاحترافية.", "rating": 5 },
      { "name": "عمر الشامي", "role": "مطور تقني", "company": "كلاود ستريم", "quote": "تجربة متكاملة غيرت طريقة إنجاز أعمالنا بالكامل.", "rating": 5 }
    ]
  },
  "pricing": {
    "badge": "خطط الاستثمار",
    "title": "اختر الخطة المناسبة لاحتياجاتك",
    "subtitle": "بدون أي رسوم خفية، مع إمكانية الترقية أو الإلغاء في أي وقت",
    "tiers": [
      {
        "name": "البداية (Starter)",
        "price": "$29",
        "period": "/شهرياً",
        "desc": "مثالية للأفراد والمشاريع الناشئة التي تريد الانطلاق السريع",
        "popular": false,
        "features": ["كل الميزات الأساسية", "دعم فني سريع", "تحديثات دورية", "تصدير فوري"]
      },
      {
        "name": "المحترفين (Pro)",
        "price": "$79",
        "period": "/شهرياً",
        "desc": "الخيار الأفضل للشركات السريعة النمو وفرق العمل الطموحة",
        "popular": true,
        "features": ["كل ما في الباقة السابقة", "تخصيص غير محدود", "تحليلات متقدمة", "أولوية الدعم على مدار الساعة", "تكاملات برمجية كاملة"]
      },
      {
        "name": "الشركات (Enterprise)",
        "price": "$199",
        "period": "/شهرياً",
        "desc": "حلول مخصصة وشاملة للمؤسسات الكبرى ذات المتطلبات العالية",
        "popular": false,
        "features": ["كل ما في باقة المحترفين", "مدير حساب مخصص", "نطاق ترددي غير محدود", "اتفاقية مستوى الخدمة SLA", "أمان مخصص ومعزز"]
      }
    ]
  },
  "faq": {
    "badge": "الأسئلة المتكررة",
    "title": "كل ما تود معرفته",
    "items": [
      { "q": "كيف يمكنني البدء واستخدام المنصة؟", "a": "يمكنك البدء مباشرة خلال ثوانٍ معدودة دون الحاجة لخبرة برمجية مسبقة، مع إمكانية المعاينة الفورية." },
      { "q": "هل يمكنني تصدير الكود واستضافته في أي مكان؟", "a": "نعم بالتأكيد! المنصة تتيح لك تصدير كود نظيف ومتكامل بنقرة زر واحدة أو تحميله كملف مضغوط." },
      { "q": "هل المنصة متوافقة بالكامل مع الهواتف الذكية؟", "a": "نعم، جميع النماذج والمكونات مصممة بأحدث معايير التجاوب التام لتناسب كل أحجام الشاشات." },
      { "q": "كيف يضمن النظام جودة وتكامل النتائج؟", "a": "تعمل منظومة الوكلاء السبعة بشكل متسلسل وتكاملي لمراجعة البنية، التصميم، المحتوى والأكواد وفحص الجودة." }
    ]
  },
  "ctaBanner": {
    "title": "جاهز لتحويل رؤيتك إلى واقع ملموس؟",
    "subtitle": "انضم إلى آلاف المستخدمين وابدأ بناء موقعك المتكامل في دقائق معدودة.",
    "buttonText": "ابدأ الآن مجاناً"
  },
  "footer": {
    "bio": "المنصة الرائدة لبناء وتطوير المواقع بالذكاء الاصطناعي عبر منظومة وكلاء متخصصة ومتكاملة.",
    "copyright": "جميع الحقوق محفوظة © 2026 AGENT-5. صُمم بأحدث تقنيات الويب."
  }
}`
      });

      const jsonMatch = response.match(/\{[\s\S]*\}/);
      const cleanJson = jsonMatch ? jsonMatch[0] : response.replace(/```json/gi, '').replace(/```/g, '').trim();
      copy = JSON.parse(cleanJson);
    } catch (err) {
      console.warn('Copywriter AI fallback:', err.message);
      copy = getDefaultCopy(prompt, plan);
    }
  } else {
    copy = getDefaultCopy(prompt, plan);
  }

  emitLog({
    agent: 'copywriter',
    status: 'completed',
    message: `تمت صياغة المحتوى التسويقي الكامل للعلامة "${copy.brandName}" مع نصوص الأقسام والعروض والأسئلة.`,
    data: copy
  });

  return copy;
}

function getDefaultCopy(prompt, plan) {
  const isArabic = plan.language === 'ar';
  if (isArabic) {
    return {
      brandName: 'نوفا تيك | NovaTech',
      badge: '✨ المنظومة الذكية الرائدة لعام 2026',
      hero: {
        titlePrefix: 'المستقبل يبدأ هنا مع',
        titleHighlight: 'الحلول الذكية المتكاملة',
        titleSuffix: 'لمشروعك القادم',
        description: 'حوّل أفكارك ومتطلباتك إلى واقع رقمي متكامل بأعلى معايير السرعة، الدقة، والتصميم العصري، مدعوماً بأحدث تقنيات الذكاء الاصطناعي.',
        primaryCta: 'ابدأ تجربتك المجانية',
        secondaryCta: 'استكشف العرض التفاعلي',
        metrics: [
          { number: '99.9%', label: 'نسبة الدقة والتوافق' },
          { number: '+120,000', label: 'مستخدم نشط حول العالم' },
          { number: '10x', label: 'سرعة أعلى في الإنجاز' }
        ]
      },
      features: {
        sectionBadge: 'القوة والابتكار',
        sectionTitle: 'مميزات هندسية صُممت لنجاحك',
        sectionSubtitle: 'كل أداة تحتاجها لبناء تجربة مستخدم استثنائية وزيادة تفاعل عملائك.',
        items: [
          { title: 'سرعة فائقة وأداء استثنائي', desc: 'بنية برمجية فائقة الخفة تضمن تحميل موقعك في أجزاء من الثانية.', iconKey: 'zap' },
          { title: 'أمان مؤسسي متقدم', desc: 'حماية متكاملة بأحدث بروتوكولات التشفير والامتثال لمعايير الخصوصية العالمية.', iconKey: 'shield' },
          { title: 'تجاوب ذكي لكافة الأجهزة', desc: 'تصميم مرن يتكيف بدقة مع شاشات الهواتف، الأجهزة اللوحية، والحواسيب.', iconKey: 'rocket' },
          { title: 'محركات ذكاء اصطناعي متطورة', desc: 'توليد ديناميكي ذكي للمحتوى والهياكل والمكونات البرمجية بدقة لا تضاهى.', iconKey: 'cpu' },
          { title: 'تجربة بصرية مذهلة', desc: 'واجهات زجاجية وتدرجات لونية عصرية تمنح مشروعك حضوراً بصرياً فريداً.', iconKey: 'sparkles' },
          { title: 'تحليلات ونمو متواصل', desc: 'لوحات قياس ذكية تزودك برؤى تفصيلية حول سلوك الزوار ونسب التحويل.', iconKey: 'barChart' }
        ]
      },
      showcase: {
        badge: 'مسار العمل',
        title: 'ثلاث خطوات تقودك نحو التميز',
        subtitle: 'من الفكرة إلى الإطلاق الكامل دون تعقيد تقني أو انتظار طويل.',
        steps: [
          { step: '01', title: 'صياغة الرؤية والمتطلبات', desc: 'حدد فكرتك وأهدافك بدقة وسيتولى الوكلاء تحليلها فورياً.' },
          { step: '02', title: 'البناء الهندسي والتصميمي', desc: 'تتعاون منظومة الوكلاء لتطوير الهيكل، المحتوى، والتصميم في تناغم تام.' },
          { step: '03', title: 'المعاينة والإطلاق الفوري', desc: 'عاين موقعك بدقة عالية واصدر الكود أو اطلقه مباشرة للعالم.' }
        ]
      },
      testimonials: {
        badge: 'آراء وشهادات',
        title: 'ثقة يبنيها الأثر والنتائج',
        items: [
          { name: 'م. طارق العسيري', role: 'الرئيس التقني', company: 'فيوتشر هاب', quote: 'المنصة وفّرت علينا أسابيع من التطوير وقدمت جودة تفوق التوقعات.', rating: 5 },
          { name: 'ليلى بنسليمان', role: 'مديرة المنتجات', company: 'ديجيتال أورا', quote: 'تناغم الوكلاء ودقة المحتوى والتصميم شيء غير مسبوق في أدوات الويب.', rating: 5 },
          { name: 'د. خالد الزهراني', role: 'مؤسس ستارت آب', company: 'كوانتم لابس', quote: 'أفضل استثمار قمنا به لمشاريعنا الرقمية، سهولة لا تضاهى وأداء متقن.', rating: 5 }
        ]
      },
      pricing: {
        badge: 'الخطط والأسعار',
        title: 'باقات شفافة تلائم طموحك',
        subtitle: 'استثمر في مستقبلك الرقمي مع خطط مرنة وقابلة للتطوير المستمر.',
        tiers: [
          {
            name: 'البداية السريعة (Starter)',
            price: '$29',
            period: '/شهرياً',
            desc: 'مناسبة للمشاريع الجديدة والمستقلين للانطلاق بقوة.',
            popular: false,
            features: ['كل الميزات الأساسية', 'قوالب متجاوبة بالكامل', 'تصدير كود نظيف', 'دعم فني متاح']
          },
          {
            name: 'النمو الاحترافي (Pro)',
            price: '$79',
            period: '/شهرياً',
            desc: 'الخيار الأكثر طلباً للشركات الواعدة والفرق المتنامية.',
            popular: true,
            features: ['كل مميزات البداية', 'تخصيص كامل للهوية', 'توليد ذكاء اصطناعي غير محدود', 'أولوية دعم مباشر 24/7', 'تكاملات مع منصات الدفع']
          },
          {
            name: 'المؤسسات الكبرى (Enterprise)',
            price: '$199',
            period: '/شهرياً',
            desc: 'أعلى مستويات الأداء والأمان للمشاريع الضخمة.',
            popular: false,
            features: ['خوادم مخصصة ذات أداء عالي', 'مدير حساب ودعم فوري', 'اتفاقية مستوى الخدمة SLA', 'حماية بيانات مشددة']
          }
        ]
      },
      faq: {
        badge: 'مركز المساعدة',
        title: 'إجابات على أكثر الأسئلة شيوعاً',
        items: [
          { q: 'ما الذي يميز AGENT-5 عن أي منشئ مواقع آخر؟', a: 'يعتمد AGENT-5 على 7 وكلاء ذكاء اصطناعي متخصصين يعملون كفريق هندسي متكامل بدلاً من مجرد نموذج واحد يولد نصوصاً عامة.' },
          { q: 'هل يمكنني تنزيل الكود بالكامل واستخدامه بحرية؟', a: 'نعم بالتأكيد! الكود بالكامل ملكك بنسبة 100% ويمكنك تصديره كملف HTML أو أرشيف ZIP وتشغيله على أي خادم أو منصة استضافة.' },
          { q: 'هل يدعم الموقع اللغة العربية والاتجاه من اليمين لليسار (RTL)؟', a: 'نعم، تم بناء النظام ليدعم اللغة العربية وخطوط Google العربية والاتجاه RTL بتناسق هندسي كامل.' },
          { q: 'كيف يمكنني تعديل الموقع بعد إنشائه؟', a: 'يمكنك استخدام نافذة التعديل التفاعلية لكتابة أي طلب تعديل وسيقوم الوكيل المعني بتطبيقه فوراً على المعاينة المباشرة.' }
        ]
      },
      ctaBanner: {
        title: 'ابدأ اليوم وابنِ موقعك القادم مع فريق من الوكلاء الأذكياء',
        subtitle: 'لا داعي للانتظار، جرب المنصة الآن واختبر السرعة والجودة بنفسك.',
        buttonText: 'ابدأ البناء فوراً'
      },
      footer: {
        bio: 'AGENT-5 هي المنصة الثورية الأولى لإنشاء المواقع المتكاملة عبر منظومة الوكلاء السبعة المتخصصة.',
        copyright: 'جميع الحقوق محفوظة © 2026 AGENT-5 Platform. صُمم بحب وإتقان.'
      }
    };
  }

  // French fallback
  if (plan.language === 'fr') {
    return {
      brandName: 'NovaTech Paris',
      badge: '✨ Plateforme Web Haute Performance 2026',
      hero: {
        titlePrefix: 'Transformez vos idées en',
        titleHighlight: 'Expériences Digitales d\'Exception',
        titleSuffix: 'en quelques secondes',
        description: 'La première plateforme autonome propulsée par 7 agents d\'intelligence artificielle collaborant pour créer des sites web remarquables, réactifs et prêts pour la production.',
        primaryCta: 'Commencer Gratuitement',
        secondaryCta: 'Découvrir la Démo',
        metrics: [
          { number: '99.9%', label: 'Disponibilité & Fiabilité' },
          { number: '+120K', label: 'Créateurs Actifs' },
          { number: '10x', label: 'Rapidité de Déploiement' }
        ]
      },
      features: {
        sectionBadge: 'Fonctionnalités Clés',
        sectionTitle: 'Conçu pour une Performance Absolue',
        sectionSubtitle: 'Tous les outils nécessaires pour développer votre marque et séduire vos visiteurs.',
        items: [
          { title: 'Vitesse Ultra-Rapide', desc: 'Une architecture ultra-légère garantissant des temps de chargement inférieurs à la seconde.', iconKey: 'zap' },
          { title: 'Sécurité Maximale', desc: 'Chiffrement de niveau entreprise et respect strict des normes de protection des données.', iconKey: 'shield' },
          { title: 'Adaptabilité Totale', desc: 'Parfaitement calibré pour les smartphones, tablettes, ordinateurs et écrans TV.', iconKey: 'rocket' },
          { title: 'Synergie Multi-Agents', desc: 'Sept agents spécialisés coordonnent l\'architecture, le design, la rédaction et le code.', iconKey: 'cpu' },
          { title: 'Esthétique Épurée', desc: 'Typographie soignée, contrastes élégants et micro-interactions interactives fluides.', iconKey: 'sparkles' },
          { title: 'Analyses de Croissance', desc: 'Composants optimisés pour convertir vos visiteurs en clients fidèles.', iconKey: 'barChart' }
        ]
      },
      showcase: {
        badge: 'Comment ça marche',
        title: 'De la Vision au Déploiement en Trois Étapes',
        subtitle: 'Une expérience autonome qui livre un code de qualité professionnelle.',
        steps: [
          { step: '01', title: 'Décrivez votre Vision', desc: 'Exprimez votre besoin en langage naturel et choisissez vos préférences stylistiques.' },
          { step: '02', title: 'Création Autonome', desc: 'Les agents coordonnent le design, le contenu marketing et le développement web.' },
          { step: '03', title: 'Aperçu & Export', desc: 'Testez en direct, personnalisez et téléchargez votre code prêt à l\'hébergement.' }
        ]
      },
      testimonials: {
        badge: 'Témoignages Clients',
        title: 'Approuvé par les Créateurs & Entreprises',
        items: [
          { name: 'Alexandre Mercier', role: 'Directeur Général', company: 'Atelier Digital', quote: 'AGENT-5 a transformé notre méthode de travail. La clarté du code et du design est impressionnante.', rating: 5 },
          { name: 'Camille Laurent', role: 'Responsable Produit', company: 'Studio Pulse', quote: 'Une qualité d\'exécution remarquable et une prise en charge mobile irréprochable.', rating: 5 },
          { name: 'Julien Moreau', role: 'Fondateur', company: 'Venture Lab', quote: 'Le meilleur investissement pour lancer nos projets avec rapidité et élégance.', rating: 5 }
        ]
      },
      pricing: {
        badge: 'Tarification Transparente',
        title: 'Des Formules Claires et Évolutives',
        subtitle: 'Sans engagement. Faites évoluer votre plan selon la croissance de votre projet.',
        tiers: [
          {
            name: 'Starter',
            price: '29 €',
            period: '/mois',
            desc: 'Idéal pour les indépendants et créateurs lançant leur premier projet.',
            popular: false,
            features: ['Toutes les fonctionnalités de base', 'Composants entièrement réactifs', 'Export de code propre', 'Support réactif']
          },
          {
            name: 'Professionnel',
            price: '79 €',
            period: '/mois',
            desc: 'Le choix privilégié des startups en pleine croissance et des agences.',
            popular: true,
            features: ['Tout ce qui est inclus dans Starter', 'Personnalisation complète de la marque', 'Génération IA illimitée', 'Support prioritaire 24/7', 'Intégrations complètes']
          },
          {
            name: 'Entreprise',
            price: '199 €',
            period: '/mois',
            desc: 'Infrastructure dédiée et garanties renforcées pour grands comptes.',
            popular: false,
            features: ['Serveur dédié haute performance', 'Gestionnaire de compte attitré', 'SLA 99.99%', 'Sécurité sur mesure']
          }
        ]
      },
      faq: {
        badge: 'Questions Fréquentes',
        title: 'Tout ce que vous devez savoir',
        items: [
          { q: 'En quoi AGENT-5 est-il différent des autres créateurs de sites ?', a: 'AGENT-5 utilise 7 agents spécialisés travaillant comme une équipe d\'ingénieurs complète pour concevoir un résultat sur mesure.' },
          { q: 'Suis-je propriétaire du code généré ?', a: 'Oui, à 100%. Vous recevez du code HTML5, Tailwind CSS et JavaScript propre, prêt à être hébergé où vous le souhaitez.' },
          { q: 'Le site est-il compatible avec les mobiles et tablettes ?', a: 'Absolument. Chaque section est vérifiée et optimisée pour tous les types d\'écrans sans aucun dépassement horizontal.' }
        ]
      },
      ctaBanner: {
        title: 'Prêt à donner vie à votre projet digital ?',
        subtitle: 'Rejoignez des milliers de créateurs et lancez votre site web d\'excellence dès aujourd\'hui.',
        buttonText: 'Commencer dès Maintenant'
      },
      footer: {
        bio: 'AGENT-5 est la plateforme pionnière multi-agents pour la création de sites web professionnels autonomes.',
        copyright: '© 2026 Plateforme AGENT-5. Conçu avec excellence et passion.'
      }
    };
  }

  // English fallback
  return {
    brandName: 'NovaTech AI',
    badge: '✨ Next-Generation Web Platform 2026',
    hero: {
      titlePrefix: 'Transform Ideas Into',
      titleHighlight: 'Stunning Digital Realities',
      titleSuffix: 'In Seconds',
      description: 'The first AI-powered website creation engine driven by 7 specialized agents collaborating to build pixel-perfect, high-converting platforms.',
      primaryCta: 'Start Free Trial',
      secondaryCta: 'Watch Interactive Demo',
      metrics: [
        { number: '99.9%', label: 'Uptime & Reliability' },
        { number: '+120K', label: 'Active Global Creators' },
        { number: '10x', label: 'Faster Time to Launch' }
      ]
    },
    features: {
      sectionBadge: 'Capabilities',
      sectionTitle: 'Architected for Peak Performance',
      sectionSubtitle: 'Everything you need to build, scale, and captivate your audience.',
      items: [
        { title: 'Lightning Fast Speed', desc: 'Engineered with zero bloat to guarantee sub-second load times worldwide.', iconKey: 'zap' },
        { title: 'Enterprise Hardened', desc: 'Top tier encryption, data privacy, and modern security best practices.', iconKey: 'shield' },
        { title: 'Fully Responsive', desc: 'Seamlessly calibrated across mobile, tablet, and widescreen devices.', iconKey: 'rocket' },
        { title: 'Deep AI Synergy', desc: 'Seven purpose-built agents cooperating to generate coherent layouts and code.', iconKey: 'cpu' },
        { title: 'Luxe Glassmorphism', desc: 'Modern visual tokens, glowing gradients, and polished micro-interactions.', iconKey: 'sparkles' },
        { title: 'Growth Analytics', desc: 'Built-in tracking frameworks and conversion-optimized components.', iconKey: 'barChart' }
      ]
    },
    showcase: {
      badge: 'How It Works',
      title: 'From Vision to Deployment in Three Simple Steps',
      subtitle: 'Experience an autonomous workflow that delivers complete production code.',
      steps: [
        { step: '01', title: 'Define Your Vision', desc: 'Describe your project in natural language and set your desired vibe.' },
        { step: '02', title: 'Autonomous Multi-Agent Build', desc: 'Architect, Designer, Copywriter, and Developer build your site in unison.' },
        { step: '03', title: 'Live Preview & Export', desc: 'Test interactively in real-time, tweak with prompts, and export clean code.' }
      ]
    },
    testimonials: {
      badge: 'Client Stories',
      title: 'Loved by Creators & Teams Worldwide',
      items: [
        { name: 'Sarah Jenkins', role: 'Head of Product', company: 'VentureScale', quote: 'AGENT-5 replaced days of wireframing and coding with a single delightful workflow.', rating: 5 },
        { name: 'Marcus Chen', role: 'CTO & Founder', company: 'HyperCloud', quote: 'The cleanest HTML & Tailwind output I have ever seen from an AI system.', rating: 5 },
        { name: 'Elena Rostova', role: 'Creative Director', company: 'Apex Studio', quote: 'The visual balance and typography pairing are pure artistry. Remarkable work.', rating: 5 }
      ]
    },
    pricing: {
      badge: 'Transparent Pricing',
      title: 'Simple Plans for Big Ambitions',
      subtitle: 'No hidden fees. Scale up or pause anytime with full code ownership.',
      tiers: [
        {
          name: 'Starter',
          price: '$29',
          period: '/month',
          desc: 'Perfect for indie hackers and solo founders launching their MVP.',
          popular: false,
          features: ['All Core Generation Tools', 'Responsive Components', 'Direct Clean Code Export', 'Community Support']
        },
        {
          name: 'Professional',
          price: '$79',
          period: '/month',
          desc: 'The favorite choice for fast-growing startups and agencies.',
          popular: true,
          features: ['Everything in Starter', 'Unlimited Revisions', 'Priority 24/7 Support', 'Custom Branding Tokens', 'Integrations Hub']
        },
        {
          name: 'Enterprise',
          price: '$199',
          period: '/month',
          desc: 'Bespoke infrastructure, guaranteed SLAs, and dedicated security.',
          popular: false,
          features: ['Dedicated High-Speed Node', 'Personal Account Lead', 'Full Commercial License', '99.99% Uptime SLA']
        }
      ]
    },
    faq: {
      badge: 'FAQ',
      title: 'Frequently Asked Questions',
      items: [
        { q: 'How does AGENT-5 differ from generic AI builders?', a: 'AGENT-5 delegates responsibilities across 7 specialized agents (Architect, Designer, Copywriter, Developer, Media, QA, and Manager) preventing generic output.' },
        { q: 'Do I own the generated code?', a: '100% yes. You receive production-ready HTML, Tailwind CSS, and JS that you can host anywhere with zero vendor lock-in.' },
        { q: 'Can I export the project as a ZIP archive?', a: 'Yes, single-click ZIP export bundles all assets, styles, and markup ready to deploy.' }
      ]
    },
    ctaBanner: {
      title: 'Ready to bring your digital vision to life?',
      subtitle: 'Join over 120,000 forward-thinking builders and launch today.',
      buttonText: 'Start Building Now'
    },
    footer: {
      bio: 'AGENT-5 is the pioneer multi-agent platform for autonomous, production-grade web creation.',
      copyright: '© 2026 AGENT-5 Platform. Crafted with engineering excellence.'
    }
  };
}

module.exports = {
  runCopywriter
};
