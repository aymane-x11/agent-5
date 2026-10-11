# AGENT-5 Platform 🚀
### المنصة المتقدمة لإنشاء المواقع بمنظومة الوكلاء السبعة (Gemini 3.1 Flash-Lite)
### Autonomous 7-Agent Web Development Platform powered by Gemini 3.1 Flash-Lite

---

## 📖 نظرة عامة | Overview

**AGENT-5** هي منصة متكاملة ومتقدمة لإنشاء مواقع الويب التفاعلية الحديثة بشكل ذاتي وتفاعلي. تعتمد المنصة على خط إنتاج هندسي يقوده **7 وكلاء ذكاء اصطناعي متخصصين** يتعاونون معاً بدءاً من تحليل الفكرة وحتى اختبار الأكواد وتصحيحها ذاتياً.

---

## 🌟 المعمارية ومنظومة الوكلاء السبعة | 7-Agent Architecture

1. 👑 **Orchestrator Agent (الوكيل المدير)**:
   تحليل متطلبات المستخدم، تحديد فئة المشروع واللغة المستهدفة، وتوزيع المهام بدقة على الوكلاء.
2. 📐 **Site Architect Agent (مهندس الهيكلة)**:
   تخطيط هيكل الصفحة، الأقسام الإلزامية (Header, Hero, Features, Workflow, Testimonials, Pricing, FAQ, CTA, Footer)، وتوزيع شبكة التجاوب.
3. 🎨 **UI/UX Designer Agent (مصمم الواجهات)**:
   تطبيق الهوية البصرية، لوحة الألوان (أبيض وأسود، أزرق، زمردي، بنفسجي، ذهبي، قرمزي، أو لون مخصص)، واختيار الخطوط العالمية.
4. ✍️ **Content & Copywriter Agent (كاتب المحتوى)**:
   صياغة نصوص تسويقية حقيقية وجذابة باللغة المختارة (العربية، الإنجليزية، الفرنسية) دون أي نصوص وهمية.
5. 🖼️ **Asset & Media Specialist (مسؤول الأيقونات والوسائط)**:
   تفعيل مكتبة Lucide Icons العالمية وتجهيز الصور والأصول البصرية عالية الدقة.
6. 💻 **Frontend Engineer (مهندس البرمجة والواجهات)**:
   كتابة كود HTML5 نقي ومتكامل مع Tailwind CSS يدعم النمطين الداكن والفاتح، والأجهزة المختلفة، وتفاعلية JavaScript كاملة.
7. 🛡️ **QA & Self-Correction Engine (محرك التدقيق والإصلاح الذاتي)**:
   فحص الأكواد، قياسات الهواتف والتلفاز، ومنع الانزياح الأفقي، وإصدار تقرير جودة 100/100.

---

## ✨ المميزات الرئيسية | Key Features

* ⚡ **نموذج Gemini 3.1 Flash-Lite:** أداء سريع وفائق الذكاء مع إدارة آمنة لمفتاح الـ API المشترك.
* 🌍 **دعم ثلاثي اللغات (Trilingual):**
  * العربية (AR - RTL)
  * English (EN - LTR)
  * Français (FR - LTR)
* 🌗 **دعم النمطين الداكن والفاتح (Dark / Light Mode):** مفتاح تبديل فوري مع حفظ الحالة في `localStorage` داخل المنصة وفي المواقع المنشأة.
* 🎨 **تخصيص كامل للألوان والخطوط:**
  * 7 لوحات ألوان جاهزة + **منتقي لون مخصص (Custom Brand Color Picker)**.
  * 6 عائلات خطوط (IBM Plex Sans Arabic, Cairo & Inter, Alexandria, Tajawal, Amiri, Outfit).
* 📐 **استوديو معاينة متعدد القياسات (Multi-Device Viewport):**
  * 📱 هاتف ذكي (Mobile - 385px)
  * 📱 جهاز لوحي (Tablet - 768px)
  * 💻 حاسوب مكتبي (Desktop - 100%)
  * 📺 شاشة تلفاز / عريضة (Widescreen 4K Mode)
* 🔘 **أزرار ومكونات تفاعلية حقيقية 100%:**
  * تبديل خطط الأسعار (شهرياً / سنوياً) مع احتساب الخصم تلقائياً.
  * أكورديون تفاعلي للأسئلة الشائعة (FAQ Accordion).
  * قائمة تنقل الهواتف (Mobile Drawer).
  * نافذة تواصل واشتراك تفاعلية (Interactive Action Modal).
* 📦 **تصدير سهل ومتكامل:**
  * تحميل فوري لملف HTML مستقل.
  * تصدير حزمة أرشيف ZIP جاهزة للنشر والاستضافة.
  * نسخ الكود المصدري كاملاً بنقرة زر.
* 🔒 **أمان وحماية قصوى:**
  * Content-Security-Policy (CSP)
  * ترويسات الحماية: nosniff, SAMEORIGIN, Referrer-Policy
  * حماية من الإغراق ومعدل الطلبات (Rate Limiting).
  * عزل المعاينة داخل `iframe sandbox`.

---

## 🚀 التثبيت والتشغيل | Installation & Setup

### 1. المتطلبات | Prerequisites
* [Node.js](https://nodejs.org/) (v18+)
* مفتاح [Google Gemini API Key](https://aistudio.google.com/)

### 2. التثبيت | Install
```bash
git clone https://github.com/aymane-x11/agent-5.git
cd agent-5
npm install
```

### 3. إعداد المفتاح | Configure API Key
قم بإنشاء ملف `.env`:
```bash
cp .env.example .env
```
ثم ضع مفتاحك داخل `.env`:
```env
GEMINI_API_KEY=your_gemini_api_key_here
PORT=3000
```

### 4. التشغيل | Run Server
```bash
npm start
```

### 5. تشغيل الاختبارات | Run Tests
```bash
npm test
```

---

## 📱 الاتصال الداخلي والشبكة المحلية | Local & Wi-Fi LAN Access

عند تشغيل الخادم، يمكنك الوصول إلى المنصة عبر:
* **نفس الهاتف أو الجهاز:** `http://localhost:3000` أو `http://127.0.0.1:3000`
* **أي جهاز على نفس شبكة الـ Wi-Fi:** `http://<LAN_IP>:3000` (مثال: `http://192.168.1.122:3000`)

---

## 📄 الترخيص | License
ISC License © 2026 AGENT-5 Platform.
