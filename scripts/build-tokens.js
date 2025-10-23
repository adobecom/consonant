const StyleDictionary = require('style-dictionary').default;

const FOUNDATION_SOURCES = [
  'primitives/borders/**/*.json',
  'primitives/opacity/**/*.json',
  'primitives/shadow/**/*.json',
  'primitives/spacing/**/*.json',
  'primitives/typography/**/*.json',
  'primitives/z-index/**/*.json',
  'alias/borders/**/*.json',
  'alias/spacing/**/*.json',
  'alias/typography/**/*.json'
];

const THEMES = [
  { name: 'light', selector: ':root[data-theme="light"]' },
  { name: 'dark', selector: ':root[data-theme="dark"]' }
];

async function buildFoundations() {
  const sd = new StyleDictionary({
    source: FOUNDATION_SOURCES,
    platforms: {
      css: {
        transformGroup: 'css',
        buildPath: 'build/css/',
        files: [
          {
            destination: 'tokens-base.css',
            format: 'css/variables',
            options: {
              outputReferences: true,
              selector: ':root'
            }
          }
        ]
      }
    }
  });

  await sd.buildAllPlatforms();
}

async function buildTheme({ name, selector }) {
  const sd = new StyleDictionary({
    source: [`primitives/colors/${name}.json`, `alias/colors/${name}.json`],
    platforms: {
      css: {
        transformGroup: 'css',
        buildPath: 'build/css/',
        files: [
          {
            destination: `tokens-${name}.css`,
            format: 'css/variables',
            options: {
              outputReferences: true,
              selector
            }
          }
        ]
      }
    }
  });

  await sd.buildAllPlatforms();
}

(async () => {
  try {
    await buildFoundations();
    for (const theme of THEMES) {
      await buildTheme(theme);
    }
    // eslint-disable-next-line no-console
    console.log('✅ Design tokens built to CSS custom properties.');
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error(error);
    process.exit(1);
  }
})();
