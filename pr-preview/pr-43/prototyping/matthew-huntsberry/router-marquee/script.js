import { render } from 'lit';
import { AppIcon } from '../../../../packages/components/src/app-icon/app-icon.js';

const TABS = [
  {
    app: 'firefly',
    label: 'Firefly',
    eyebrow: 'Adobe Firefly',
    headline: 'Turn your imagination into extraordinary images',
    body: 'Generate stunning visuals, edit images with simple text prompts, and bring creative ideas to life instantly.',
    ctaPrimary: 'Try for free',
    ctaSecondary: 'Learn more',
    duration: 5,
  },
  {
    app: 'photoshop',
    label: 'Photoshop',
    eyebrow: 'Adobe Photoshop',
    headline: 'Edit like a pro with AI-powered tools',
    body: 'Remove objects, change backgrounds, enhance portraits, and create composites with precision and speed.',
    ctaPrimary: 'Try for free',
    ctaSecondary: 'Learn more',
    duration: 5,
  },
  {
    app: 'acrobat-pdf',
    label: 'Acrobat',
    eyebrow: 'Adobe Acrobat',
    headline: 'Do more with your PDFs using AI',
    body: 'Ask questions about any document, generate summaries, and create polished content from your PDFs.',
    ctaPrimary: 'Try for free',
    ctaSecondary: 'Learn more',
    duration: 5,
  },
  {
    app: 'illustrator',
    label: 'Illustrator',
    eyebrow: 'Adobe Illustrator',
    headline: 'Create vector art and illustrations with AI',
    body: 'Design logos, icons, and illustrations with generative AI tools that expand your creative possibilities.',
    ctaPrimary: 'Try for free',
    ctaSecondary: 'Learn more',
    duration: 5,
  },
  {
    app: 'creative-cloud',
    label: 'Creative Cloud',
    eyebrow: 'Adobe Creative Cloud',
    headline: 'All your creative tools, all in one place',
    body: 'Access 20+ industry-leading apps, AI features, cloud storage, and collaboration tools with one subscription.',
    ctaPrimary: 'Get Creative Cloud',
    ctaSecondary: 'Learn more',
    duration: 5,
  },
];

let activeIndex = 2;
let isPaused = false;

const hero = document.getElementById('hero');
const navCards = document.getElementById('nav-cards');
const playPauseBtn = document.getElementById('nav-play-pause');
const playPauseIcon = document.getElementById('play-pause-icon');

const ICON_PAUSE = `<rect x="3" y="2" width="4" height="12" rx="1"/><rect x="9" y="2" width="4" height="12" rx="1"/>`;
const ICON_PLAY  = `<polygon points="3,1 15,8 3,15"/>`;

function setPlayPauseIcon(paused) {
  playPauseIcon.innerHTML = paused ? ICON_PLAY : ICON_PAUSE;
  playPauseBtn.setAttribute('aria-label', paused ? 'Play auto-advance' : 'Pause auto-advance');
}

function activate(index) {
  activeIndex = index;
  const tab = TABS[index];

  document.getElementById('hero-eyebrow').textContent = tab.eyebrow;
  document.getElementById('hero-headline').textContent = tab.headline;
  document.getElementById('hero-body').textContent = tab.body;

  const ctaPrimary = document.getElementById('cta-primary');
  ctaPrimary.innerHTML = `<button class="cta-btn cta-btn-primary">${tab.ctaPrimary}</button>`;

  const ctaSecondary = document.getElementById('cta-secondary');
  ctaSecondary.innerHTML = `<button class="cta-btn cta-btn-secondary">${tab.ctaSecondary}</button>`;

  document.querySelectorAll('.nav-card').forEach((card, i) => {
    const selected = i === index;
    card.setAttribute('aria-selected', String(selected));
    if (selected) {
      card.style.setProperty('--tab-duration', `${tab.duration}s`);
    }
  });
}

function renderIcons() {
  document.querySelectorAll('.tab-icon[data-app]').forEach((el) => {
    render(AppIcon({ app: el.dataset.app, size: 'sm' }), el);
  });
}

navCards.addEventListener('animationend', (e) => {
  if (e.target.classList.contains('nav-progress') && !isPaused) {
    activate((activeIndex + 1) % TABS.length);
  }
});

document.querySelectorAll('.nav-card').forEach((card) => {
  card.addEventListener('click', () => {
    activate(parseInt(card.dataset.index, 10));
  });
  card.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      activate(parseInt(card.dataset.index, 10));
    }
  });
});

playPauseBtn.addEventListener('click', () => {
  isPaused = !isPaused;
  hero.classList.toggle('paused', isPaused);
  setPlayPauseIcon(isPaused);
});

renderIcons();
activate(activeIndex);
