import { render } from 'lit';
import { AppIcon } from '../../../../packages/components/src/app-icon/app-icon.js';
import { Button } from '../../../../packages/components/src/button/button.js';

import '../../_shared/grid-overlay.js';
import '../../_shared/ref-overlay.js';

const TABS = [
  {
    app: 'creative-cloud',
    label: 'Creativity and design',
    eyebrow: 'Creative Cloud',
    headline: 'Unleash your creativity.',
    body: 'Get 20+ creative apps including Photoshop, Illustrator, Premiere Pro, and more — all in one plan.',
    ctaPrimary: 'Free trial',
    ctaSecondary: 'See plans',
    duration: 5,
  },
  {
    app: 'firefly',
    label: 'Content creation',
    eyebrow: 'Adobe Firefly',
    headline: 'Create anything. Faster.',
    body: 'Generate images, text effects, and creative content in seconds with Adobe generative AI.',
    ctaPrimary: 'Try Firefly',
    ctaSecondary: 'Learn more',
    duration: 5,
  },
  {
    app: 'acrobat-pdf',
    label: 'PDF and productivity',
    eyebrow: 'Acrobat',
    headline: 'Get work done. Faster.',
    body: 'Create, edit, share, and sign documents with trusted PDF tools. Use AI to make easy edits, get answers, generate summaries, and create polished content.',
    ctaPrimary: 'Free trial',
    ctaSecondary: 'See plans',
    duration: 5,
  },
  {
    app: 'experience-cloud',
    label: 'Adobe for Business',
    eyebrow: 'Experience Cloud',
    headline: 'Scale your business.',
    body: 'Marketing, analytics, commerce, and advertising solutions built for enterprise brands.',
    ctaPrimary: 'Learn more',
    ctaSecondary: 'Contact sales',
    duration: 5,
  },
  {
    app: 'creative-cloud',
    label: 'Students and teachers',
    eyebrow: 'Creative Cloud',
    headline: 'Learn. Create. Inspire.',
    body: 'Get all the creative apps at a special discounted price — available for students and educators.',
    ctaPrimary: 'See plans',
    ctaSecondary: 'Learn more',
    duration: 5,
  },
];

let activeIndex = 2;
let paused = false;

const eyebrowEl   = document.getElementById('hero-eyebrow');
const headlineEl  = document.getElementById('hero-headline');
const bodyEl      = document.getElementById('hero-body');
const ctaPrimaryEl   = document.getElementById('cta-primary');
const ctaSecondaryEl = document.getElementById('cta-secondary');
const playPauseBtn   = document.getElementById('play-pause');
const playPauseIcon  = document.getElementById('play-pause-icon');
const cards = document.querySelectorAll('.nav-card');

// Render AppIcon into every icon slot
document.querySelectorAll('.nav-card__icon[data-app]').forEach(el => {
  render(AppIcon({ app: el.dataset.app, size: 'sm', ariaHidden: true }), el);
});

function renderContent() {
  const tab = TABS[activeIndex];
  eyebrowEl.textContent  = tab.eyebrow;
  headlineEl.textContent = tab.headline;
  bodyEl.textContent     = tab.body;
  render(Button({ label: tab.ctaPrimary,   background: 'solid',    context: 'on-dark' }), ctaPrimaryEl);
  render(Button({ label: tab.ctaSecondary, background: 'outlined', context: 'on-dark' }), ctaSecondaryEl);
}

function renderCards() {
  cards.forEach((card, i) => {
    const isActive = i === activeIndex;
    card.classList.toggle('active', isActive);
    card.setAttribute('aria-pressed', String(isActive));
    card.style.setProperty('--nav-duration', `${TABS[i].duration}s`);

    const fill = card.querySelector('.nav-card__indicator-fill');
    fill.style.animation = 'none';
    fill.offsetHeight; // force reflow to restart animation
    fill.style.animation = '';
  });
}

function advance() {
  activeIndex = (activeIndex + 1) % TABS.length;
  renderContent();
  renderCards();
}

// Cycle on animation end of the active progress fill
document.getElementById('nav-cards').addEventListener('animationend', e => {
  if (!paused && e.target.classList.contains('nav-card__indicator-fill')) {
    advance();
  }
});

const ICON_PAUSE = `<rect x="3" y="2" width="4" height="12" rx="1"/><rect x="9" y="2" width="4" height="12" rx="1"/>`;
const ICON_PLAY  = `<polygon points="3,1 15,8 3,15"/>`;

function setPlayPauseIcon(isPaused) {
  playPauseIcon.innerHTML = isPaused ? ICON_PLAY : ICON_PAUSE;
  playPauseBtn.setAttribute('aria-label', isPaused ? 'Play auto-advance' : 'Pause auto-advance');
}

// Play / Pause
playPauseBtn.addEventListener('click', () => {
  paused = !paused;
  const activeFill = document.querySelector('.nav-card.active .nav-card__indicator-fill');
  if (activeFill) activeFill.style.animationPlayState = paused ? 'paused' : 'running';
  setPlayPauseIcon(paused);
});

// Card click
cards.forEach((card, i) => {
  const activate = () => {
    activeIndex = i;
    paused = false;
    setPlayPauseIcon(false);
    renderContent();
    renderCards();
  };
  card.addEventListener('click', activate);
  card.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); activate(); } });
});

// Initial render
renderContent();
renderCards();
