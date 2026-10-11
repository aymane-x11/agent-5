const { callGemini, isKeyConfigured } = require('../gemini');

// Official Lucide Icon mapping for clean modern look
const LUCIDE_ICONS_CONFIG = {
  hero: 'sparkles',
  speed: 'zap',
  security: 'shield-check',
  scale: 'layers',
  ai: 'cpu',
  analytics: 'bar-chart-3',
  support: 'life-buoy',
  arrowRight: 'arrow-left', // RTL context
  arrowLeft: 'arrow-right',
  check: 'check',
  sun: 'sun',
  moon: 'moon',
  globe: 'globe',
  terminal: 'terminal'
};

const HIGH_END_PHOTOS = {
  heroVisual: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1400&q=85',
  showcaseWorkspace: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=1200&q=85',
  avatar1: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=240&q=80',
  avatar2: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=240&q=80',
  avatar3: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=240&q=80'
};

async function runMediaSpecialist({ prompt, plan, structure, copy, emitLog }) {
  emitLog({
    agent: 'media',
    status: 'thinking',
    message: 'جاري تفعيل مكتبة Lucide Icons العالمية وتجهيز أصول بصرية مونوكروم فائقة الدقة...'
  });

  const assets = {
    lucideCDN: 'https://unpkg.com/lucide@latest',
    iconKeys: LUCIDE_ICONS_CONFIG,
    images: HIGH_END_PHOTOS
  };

  emitLog({
    agent: 'media',
    status: 'completed',
    message: 'تم تفعيل مكتبة الأيقونات الرسمية Lucide وتجهيز الأصول البصرية المعمارية بنجاح.',
    data: assets
  });

  return assets;
}

module.exports = {
  runMediaSpecialist,
  LUCIDE_ICONS_CONFIG
};
