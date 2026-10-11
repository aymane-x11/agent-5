const assert = require('assert');
const { config, getApiKey, isKeyConfigured, getNetworkAddresses } = require('../src/config');
const { runDesigner, THEME_MAP, FONT_MAP } = require('../src/agents/designer');
const { assembleProductionHtml } = require('../src/agents/developer');
const { runQA } = require('../src/agents/qa');
const { executeGenerationPipeline } = require('../src/pipeline');

async function runAllTests() {
  console.log('🧪 Starting AGENT-5 Test Suite...\n');
  let passed = 0;
  let failed = 0;

  function test(name, fn) {
    try {
      fn();
      console.log(`  ✅ PASS: ${name}`);
      passed++;
    } catch (e) {
      console.error(`  ❌ FAIL: ${name}`);
      console.error(`     Error: ${e.message}`);
      failed++;
    }
  }

  async function testAsync(name, fn) {
    try {
      await fn();
      console.log(`  ✅ PASS: ${name}`);
      passed++;
    } catch (e) {
      console.error(`  ❌ FAIL: ${name}`);
      console.error(`     Error: ${e.message}`);
      failed++;
    }
  }

  // 1. Config & Network Tests
  console.log('--- 1. Configuration & Network Tests ---');
  test('Gemini API key is configured and valid length', () => {
    assert.strictEqual(isKeyConfigured(), true, 'API key should be configured');
    const key = getApiKey();
    assert.ok(key && key.length > 20, 'API key should be valid string');
  });

  test('Primary model is set to gemini-3.1-flash-lite', () => {
    assert.strictEqual(config.geminiModel, 'gemini-3.1-flash-lite');
  });

  test('Local network addresses are properly detected', () => {
    const nets = getNetworkAddresses();
    assert.strictEqual(nets.local, '127.0.0.1');
    assert.ok(nets.network !== undefined, 'Network IP should be checked');
    console.log(`     Detected Local: ${nets.local}, LAN Wi-Fi: ${nets.network || 'N/A'}`);
  });

  // 2. Designer & Theme Token Tests
  console.log('\n--- 2. Designer & Theme Tests ---');
  await testAsync('Designer handles Monochrome theme', async () => {
    const ds = await runDesigner({
      options: { colorTheme: 'monochrome', fontFamily: 'ibm-plex' },
      emitLog: () => {}
    });
    assert.strictEqual(ds.themeKey, 'monochrome');
    assert.ok(ds.fontFamily.includes('IBM Plex Sans Arabic'));
  });

  await testAsync('Designer handles Custom Color palette', async () => {
    const ds = await runDesigner({
      options: { colorTheme: 'custom', customColor: '#00bcd4', fontFamily: 'cairo' },
      emitLog: () => {}
    });
    assert.strictEqual(ds.accentColor, '#00bcd4');
    assert.ok(ds.fontFamily.includes('Cairo'));
  });

  // 3. Developer HTML Assembly Tests (AR, EN, FR)
  console.log('\n--- 3. Developer Production HTML Tests ---');
  const mockPlanAR = { language: 'ar', direction: 'rtl', projectTitle: 'موقع تجريبي' };
  const mockPlanEN = { language: 'en', direction: 'ltr', projectTitle: 'Demo SaaS' };
  const mockPlanFR = { language: 'fr', direction: 'ltr', projectTitle: 'Démo Paris' };

  const mockCopyAR = {
    brandName: 'تجربة',
    badge: 'إصدار 2026',
    hero: { titlePrefix: 'مستقبل', titleHighlight: 'التقنية', description: 'وصف تجريبي', primaryCta: 'ابدأ', metrics: [] },
    features: { items: [{ title: 'ميزة 1', desc: 'شرح' }] },
    showcase: { steps: [{ step: '01', title: 'خطوة', desc: 'شرح' }] },
    testimonials: { items: [{ name: 'علي', role: 'مؤسس', company: 'شركة', quote: 'ممتاز' }] },
    pricing: { tiers: [{ name: 'بداية', price: '$29', period: '/شهرياً', features: ['ميزة'] }] },
    faq: { items: [{ q: 'سؤال؟', a: 'جواب' }] }
  };

  test('Generated Arabic HTML contains viewport, RTL, Lucide, and Theme Toggle', () => {
    const html = assembleProductionHtml({
      plan: mockPlanAR,
      structure: {},
      designSystem: { accentColor: '#3b82f6', fontFamily: "'Cairo', sans-serif", googleFontUrl: 'https://fonts.googleapis.com' },
      copy: mockCopyAR,
      media: {}
    });
    assert.ok(html.includes('<!DOCTYPE html>'));
    assert.ok(html.includes('dir="rtl"'));
    assert.ok(html.includes('lang="ar"'));
    assert.ok(html.includes('toggleTheme'));
    assert.ok(html.includes('lucide.createIcons'));
    assert.ok(html.includes('action-modal'));
    assert.ok(html.includes('toggleBillingPeriod'));
  });

  test('Generated English HTML has LTR direction and English labels', () => {
    const html = assembleProductionHtml({
      plan: mockPlanEN,
      structure: {},
      designSystem: { accentColor: '#10b981', fontFamily: "'Plus Jakarta Sans', sans-serif", googleFontUrl: 'https://fonts.googleapis.com' },
      copy: { ...mockCopyAR, brandName: 'NovaScale' },
      media: {}
    });
    assert.ok(html.includes('dir="ltr"'));
    assert.ok(html.includes('lang="en"'));
    assert.ok(html.includes('Features'));
    assert.ok(html.includes('Pricing'));
  });

  test('Generated French HTML has LTR direction and French labels', () => {
    const html = assembleProductionHtml({
      plan: mockPlanFR,
      structure: {},
      designSystem: { accentColor: '#e11d48', fontFamily: "'Plus Jakarta Sans', sans-serif", googleFontUrl: 'https://fonts.googleapis.com' },
      copy: { ...mockCopyAR, brandName: 'Studio Paris' },
      media: {}
    });
    assert.ok(html.includes('dir="ltr"'));
    assert.ok(html.includes('lang="fr"'));
    assert.ok(html.includes('Fonctionnalités'));
    assert.ok(html.includes('Tarifs'));
  });

  // 4. QA Self-Correction Engine Tests
  console.log('\n--- 4. QA Self-Correction Tests ---');
  await testAsync('QA verifies HTML without truncation and issues 100/100 score', async () => {
    const testHtml = '<!DOCTYPE html><html><head></head><body><h1>Hello</h1></body></html>';
    const qaResult = await runQA({
      prompt: 'Test Site',
      htmlCode: testHtml,
      plan: mockPlanAR,
      emitLog: () => {}
    });
    assert.strictEqual(qaResult.auditReport.overallScore, 100);
    assert.ok(qaResult.verifiedHtml.includes('name="viewport"'), 'QA should inject viewport meta');
    assert.ok(qaResult.verifiedHtml.includes('lucide'), 'QA should inject Lucide icons');
    assert.ok(qaResult.verifiedHtml.includes('overflow-x-hidden'), 'QA should inject overflow-x-hidden');
  });

  // 5. End-to-End Pipeline Integration Test
  console.log('\n--- 5. End-to-End Generation Pipeline Test (Gemini 3.1) ---');
  await testAsync('Pipeline builds complete site for English prompt with Gemini 3.1', async () => {
    const session = await executeGenerationPipeline({
      sessionId: 'test_e2e_' + Date.now(),
      prompt: 'Minimalist luxury architecture studio with project showcase',
      options: { language: 'en', colorTheme: 'monochrome', fontFamily: 'ibm-plex' },
      onLog: (l) => {
        if (l.status === 'completed' || l.status === 'started' || l.status === 'ready') {
          console.log(`     [${l.agent}] ${l.message}`);
        }
      }
    });

    assert.strictEqual(session.status, 'completed');
    assert.ok(session.html.length > 3000, `HTML should be complete (got ${session.html.length} bytes)`);
    assert.ok(session.html.includes('<!DOCTYPE html>'));
    assert.ok(session.html.includes('</html>'));
    assert.strictEqual(session.audit.overallScore, 100);
  });

  console.log(`\n======================================================`);
  console.log(`📊 Test Summary: ${passed} Passed, ${failed} Failed`);
  console.log(`======================================================\n`);

  if (failed > 0) process.exit(1);
}

runAllTests().catch(err => {
  console.error('Test runner error:', err);
  process.exit(1);
});
