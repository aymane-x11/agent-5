const { callGemini, isKeyConfigured } = require('../gemini');

const FONT_MAP = {
  'ibm-plex': {
    name: 'IBM Plex Sans Arabic & Plus Jakarta Sans',
    family: "'IBM Plex Sans Arabic', 'Plus Jakarta Sans', sans-serif",
    url: 'https://fonts.googleapis.com/css2?family=IBM+Plex+Sans+Arabic:wght@400;500;600;700;800&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap'
  },
  'cairo': {
    name: 'Cairo & Inter',
    family: "'Cairo', 'Inter', sans-serif",
    url: 'https://fonts.googleapis.com/css2?family=Cairo:wght@400;500;600;700;800;900&family=Inter:wght@400;500;600;700;800&display=swap'
  },
  'alexandria': {
    name: 'Alexandria & Geist',
    family: "'Alexandria', 'Geist', sans-serif",
    url: 'https://fonts.googleapis.com/css2?family=Alexandria:wght@400;500;600;700;800;900&display=swap'
  },
  'tajawal': {
    name: 'Tajawal & Roboto',
    family: "'Tajawal', 'Roboto', sans-serif",
    url: 'https://fonts.googleapis.com/css2?family=Tajawal:wght@400;500;700;800;900&family=Roboto:wght@400;500;700&display=swap'
  },
  'amiri': {
    name: 'Amiri & Playfair (Classic Luxury)',
    family: "'Amiri', 'Playfair Display', serif",
    url: 'https://fonts.googleapis.com/css2?family=Amiri:ital,wght@0,400;0,700;1,400&family=Playfair+Display:wght@500;700;900&display=swap'
  },
  'outfit': {
    name: 'Outfit & Readex Pro',
    family: "'Readex Pro', 'Outfit', sans-serif",
    url: 'https://fonts.googleapis.com/css2?family=Outfit:wght@400;600;800&family=Readex+Pro:wght@400;600;700&display=swap'
  }
};

const THEME_MAP = {
  'monochrome': {
    name: 'Monochrome Executive (B&W)',
    accentColor: '#ffffff',
    primaryBtn: 'bg-white text-black dark:bg-white dark:text-black light:bg-black light:text-white hover:opacity-90',
    secondaryBtn: 'border border-zinc-700 dark:border-zinc-700 light:border-zinc-300 text-zinc-200 dark:text-zinc-200 light:text-zinc-800 hover:border-zinc-500',
    highlightClass: 'underline decoration-zinc-500 underline-offset-8 text-white dark:text-white light:text-black',
    glowColor: 'rgba(255, 255, 255, 0.15)'
  },
  'blue': {
    name: 'Deep Tech Blue',
    accentColor: '#3b82f6',
    primaryBtn: 'bg-blue-600 text-white hover:bg-blue-500 shadow-lg shadow-blue-600/30',
    secondaryBtn: 'border border-blue-800/60 dark:border-blue-800/60 light:border-blue-300 text-blue-400 dark:text-blue-300 light:text-blue-700 hover:border-blue-600',
    highlightClass: 'text-blue-500 dark:text-blue-400 underline decoration-blue-500 underline-offset-8',
    glowColor: 'rgba(59, 130, 246, 0.25)'
  },
  'emerald': {
    name: 'Emerald Obsidian',
    accentColor: '#10b981',
    primaryBtn: 'bg-emerald-600 text-white hover:bg-emerald-500 shadow-lg shadow-emerald-600/30',
    secondaryBtn: 'border border-emerald-800/60 dark:border-emerald-800/60 light:border-emerald-300 text-emerald-400 dark:text-emerald-300 light:text-emerald-700 hover:border-emerald-600',
    highlightClass: 'text-emerald-500 dark:text-emerald-400 underline decoration-emerald-500 underline-offset-8',
    glowColor: 'rgba(16, 185, 129, 0.25)'
  },
  'purple': {
    name: 'Cyber Violet',
    accentColor: '#a855f7',
    primaryBtn: 'bg-purple-600 text-white hover:bg-purple-500 shadow-lg shadow-purple-600/30',
    secondaryBtn: 'border border-purple-800/60 dark:border-purple-800/60 light:border-purple-300 text-purple-400 dark:text-purple-300 light:text-purple-700 hover:border-purple-600',
    highlightClass: 'text-purple-500 dark:text-purple-400 underline decoration-purple-500 underline-offset-8',
    glowColor: 'rgba(168, 85, 247, 0.25)'
  },
  'amber': {
    name: 'Sunset Gold',
    accentColor: '#f59e0b',
    primaryBtn: 'bg-amber-500 text-black font-bold hover:bg-amber-400 shadow-lg shadow-amber-500/30',
    secondaryBtn: 'border border-amber-800/60 dark:border-amber-800/60 light:border-amber-300 text-amber-400 dark:text-amber-300 light:text-amber-700 hover:border-amber-600',
    highlightClass: 'text-amber-500 dark:text-amber-400 underline decoration-amber-500 underline-offset-8',
    glowColor: 'rgba(245, 158, 11, 0.25)'
  },
  'crimson': {
    name: 'Crimson Ruby',
    accentColor: '#e11d48',
    primaryBtn: 'bg-rose-600 text-white hover:bg-rose-500 shadow-lg shadow-rose-600/30',
    secondaryBtn: 'border border-rose-800/60 dark:border-rose-800/60 light:border-rose-300 text-rose-400 dark:text-rose-300 light:text-rose-700 hover:border-rose-600',
    highlightClass: 'text-rose-500 dark:text-rose-400 underline decoration-rose-500 underline-offset-8',
    glowColor: 'rgba(225, 29, 72, 0.25)'
  },
  'light-clean': {
    name: 'Pure Minimalist Light',
    accentColor: '#18181b',
    primaryBtn: 'bg-zinc-950 text-white dark:bg-white dark:text-black hover:opacity-90 shadow-md',
    secondaryBtn: 'border border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-zinc-200 hover:border-zinc-500',
    highlightClass: 'text-zinc-900 dark:text-white underline decoration-zinc-400 underline-offset-8',
    glowColor: 'rgba(0, 0, 0, 0.1)'
  }
};

async function runDesigner({ prompt, plan, structure, options = {}, emitLog }) {
  emitLog({
    agent: 'designer',
    status: 'thinking',
    message: `جاري تخصيص الهوية البصرية وفقاً لاختيار المستخدم: [النمط: ${options.colorTheme || 'monochrome'}, الخط: ${options.fontFamily || 'ibm-plex'}${options.customColor ? `, لون مخصص: ${options.customColor}` : ''}]...`
  });

  const fontConfig = FONT_MAP[options.fontFamily] || FONT_MAP['ibm-plex'];
  let themeConfig = THEME_MAP[options.colorTheme] || THEME_MAP['monochrome'];

  // Handle custom hex color if provided
  if (options.customColor && /^#([0-9a-fA-F]{3}){1,2}$/.test(options.customColor)) {
    themeConfig = {
      name: `Custom Palette (${options.customColor})`,
      accentColor: options.customColor,
      primaryBtn: `bg-[${options.customColor}] text-white hover:opacity-90 shadow-lg`,
      secondaryBtn: `border border-zinc-700 hover:border-[${options.customColor}] text-zinc-200`,
      highlightClass: `underline decoration-[${options.customColor}] underline-offset-8 text-white`,
      glowColor: options.customColor + '40',
      isCustom: true
    };
  }

  const designSystem = {
    themeKey: options.colorTheme || 'monochrome',
    themeName: themeConfig.name,
    fontFamily: fontConfig.family,
    googleFontUrl: fontConfig.url,
    accentColor: themeConfig.accentColor,
    glowColor: themeConfig.glowColor,
    primaryBtnClass: themeConfig.primaryBtn,
    secondaryBtnClass: themeConfig.secondaryBtn,
    highlightClass: themeConfig.highlightClass,
    customColor: options.customColor || null
  };

  emitLog({
    agent: 'designer',
    status: 'completed',
    message: `تم اعتماد الهوية البصرية "${designSystem.themeName}" ولون التمييز [${designSystem.accentColor}] مع الخط [${fontConfig.name}].`,
    data: designSystem
  });

  return designSystem;
}

module.exports = {
  runDesigner,
  FONT_MAP,
  THEME_MAP
};
