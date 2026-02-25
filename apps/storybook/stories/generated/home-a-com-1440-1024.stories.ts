import { html } from 'lit';
import type { Meta, StoryObj } from '@storybook/web-components';
import { Button } from '../../../../packages/components/src/button/index.js';
import { ProductLockup } from '../../../../packages/components/src/product-lockup/index.js';

const meta: Meta = {
  title: 'Generated/Home — A.com (1440–1024)',
  id: 'home-a-com-1440-1024',
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
  },
};

export default meta;
type Story = StoryObj;

const HomeACom = () => {
  return html`
    <style>
      .c-home {
        min-height: 100vh;
        background-color: var(--s2a-color-background-default, #ffffff);
        color: var(--s2a-color-content-default, #292929);
      }

      .c-home__shell {
        max-width: 1440px;
        margin: 0 auto;
        padding: 0 var(--s2a-spacing-xl, 32px);
      }

      .c-home__nav {
        display: flex;
        align-items: center;
        justify-content: space-between;
        height: 72px;
      }

      .c-home__nav-left {
        display: flex;
        align-items: center;
        gap: var(--s2a-spacing-lg, 24px);
      }

      .c-home__nav-menu {
        display: none;
        align-items: center;
        justify-content: center;
        width: 32px;
        height: 32px;
        border-radius: var(--s2a-border-radius-round, 999px);
        border: var(--s2a-border-width-sm, 1px) solid
          var(--s2a-color-border-subtle, #c6c6c6);
        background-color: var(--s2a-color-background-default, #ffffff);
        padding: 0;
        cursor: pointer;
      }

      .c-home__nav-menu-icon {
        width: 14px;
        height: 10px;
        position: relative;
      }

      .c-home__nav-menu-icon::before,
      .c-home__nav-menu-icon::after,
      .c-home__nav-menu-icon span {
        content: '';
        position: absolute;
        left: 0;
        right: 0;
        height: 2px;
        border-radius: var(--s2a-border-radius-xs, 4px);
        background-color: var(--s2a-color-content-default, #292929);
      }

      .c-home__nav-menu-icon::before {
        top: 0;
      }

      .c-home__nav-menu-icon::after {
        bottom: 0;
      }

      .c-home__logo {
        width: 67px;
        height: 16px;
        background-color: var(--s2a-color-content-default, #292929);
        border-radius: var(--s2a-border-radius-xs, 4px);
      }

      .c-home__nav-links {
        display: flex;
        align-items: center;
        gap: var(--s2a-spacing-xl, 32px);
        font-size: var(--s2a-typography-font-size-sm, 14px);
      }

      .c-home__nav-link {
        display: inline-flex;
        align-items: center;
        gap: var(--s2a-spacing-2xs, 4px);
        cursor: pointer;
      }

      .c-home__nav-link-chevron {
        width: 6px;
        height: 3px;
        border-radius: var(--s2a-border-radius-xs, 4px);
        background-color: var(--s2a-color-content-subtle, #7a7a7a);
      }

      .c-home__nav-right {
        display: flex;
        align-items: center;
        gap: var(--s2a-spacing-md, 16px);
      }

      .c-home__apps-icon {
        width: 18px;
        height: 18px;
        border-radius: var(--s2a-border-radius-xs, 4px);
        border: var(--s2a-border-width-sm, 1px) solid
          var(--s2a-color-border-subtle, #c6c6c6);
      }

      .c-home__main {
        padding-top: var(--s2a-spacing-2xl, 40px);
      }

      .c-home__hero {
        position: relative;
        border-radius: var(--s2a-border-radius-lg, 32px);
        overflow: hidden;
        background-color: var(--s2a-color-background-emphasis, #202020);
        color: var(--s2a-color-content-knockout, #ffffff);
        min-height: 810px;
      }

      .c-home__hero-media {
        position: absolute;
        inset: 0;
        background: radial-gradient(
          circle at 20% 20%,
          #6241ff,
          transparent 55%
        ); /* Primitive: hero background gradient colors mapped directly from design; replace with semantic background token when available */
        opacity: var(--s2a-opacity-scrim-subtle, 0.32);
      }

      .c-home__hero-scrim {
        position: absolute;
        inset: 0;
        background: linear-gradient(
          180deg,
          rgba(0, 0, 0, 0.4),
          rgba(0, 0, 0, 0.9)
        );
        mix-blend-mode: multiply;
      }

      .c-home__hero-inner {
        position: relative;
        z-index: 1;
        padding: var(--s2a-spacing-4xl, 64px);
        display: grid;
        grid-template-columns: minmax(0, 3fr) minmax(0, 2fr);
        gap: var(--s2a-spacing-3xl, 48px);
      }

      .c-home__hero-copy {
        max-width: 667px;
        display: flex;
        flex-direction: column;
        gap: var(--s2a-spacing-lg, 24px);
      }

      .c-home__hero-eyebrow {
        font-size: var(--s2a-typography-font-size-sm, 14px);
        letter-spacing: var(--s2a-typography-letter-spacing-half, 0.5px);
        text-transform: uppercase;
      }

      .c-home__hero-heading {
        margin: 0;
        font-family:
          'adobe-clean-display',
          var(
            --s2a-typography-font-family-adobe-clean-display,
            'Adobe Clean Display'
          ),
          system-ui,
          -apple-system,
          BlinkMacSystemFont,
          'Segoe UI',
          sans-serif;
        font-weight: var(--s2a-typography-font-weight-bold, 700);
        font-size: var(--s2a-typography-font-size-5xl, 56px);
        line-height: var(--s2a-typography-line-height-5xl, 64px);
      }

      .c-home__hero-body {
        margin: 0;
        font-family:
          'adobe-clean',
          var(--s2a-typography-font-family-adobe-clean, 'Adobe Clean'),
          system-ui,
          -apple-system,
          BlinkMacSystemFont,
          'Segoe UI',
          sans-serif;
        font-size: var(--s2a-typography-font-size-lg, 18px);
        line-height: var(--s2a-typography-line-height-xl, 24px);
        max-width: 484px;
      }

      .c-home__hero-ctas {
        display: flex;
        flex-wrap: wrap;
        gap: var(--s2a-spacing-md, 16px);
        margin-top: var(--s2a-spacing-lg, 24px);
      }

      .c-home__hero-router {
        position: absolute;
        left: var(--s2a-spacing-3xl, 48px);
        right: var(--s2a-spacing-3xl, 48px);
        bottom: var(--s2a-spacing-3xl, 48px);
        display: flex;
        gap: var(--s2a-spacing-md, 16px);
        align-items: center;
      }

      .c-home__router-play {
        width: 40px;
        height: 40px;
        border-radius: var(--s2a-border-radius-round, 999px);
        border: var(--s2a-border-width-sm, 1px) solid
          var(--s2a-color-border-knockout-subtle, rgba(255, 255, 255, 0.32));
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .c-home__router-play-icon {
        width: 5px;
        height: 8px;
        border-radius: 1px;
        background-color: var(--s2a-color-content-knockout, #ffffff);
      }

      .c-home__router-tiles {
        display: flex;
        gap: var(--s2a-spacing-md, 16px);
        overflow-x: auto;
        padding-bottom: var(--s2a-spacing-xs, 8px);
      }

      .c-home__router-tile {
        min-width: 220px;
        max-width: 220px;
        padding: var(--s2a-spacing-md, 16px);
        border-radius: var(--s2a-border-radius-md, 16px);
        background-color: rgba(
          0,
          0,
          0,
          0.44
        ); /* Primitive: router tile scrim color uses direct rgba until semantic token is defined */
        display: flex;
        flex-direction: column;
        gap: var(--s2a-spacing-sm, 12px);
      }

      .c-home__router-tile--active {
        background-color: rgba(
          0,
          0,
          0,
          0.64
        ); /* Primitive: active router tile scrim color uses direct rgba until semantic token is defined */
      }

      .c-home__router-tile-id {
        display: flex;
        align-items: center;
        gap: var(--s2a-spacing-xs, 8px);
        font-size: var(--s2a-typography-font-size-sm, 14px);
      }

      .c-home__router-product-avatar {
        width: 18px;
        height: 18px;
        border-radius: var(--s2a-border-radius-xs, 4px);
        background: linear-gradient(135deg, #ff0000, #ff6a00);
      }

      .c-home__router-cta {
        display: inline-flex;
        align-items: center;
        justify-content: space-between;
        gap: var(--s2a-spacing-xs, 8px);
        font-size: var(--s2a-typography-font-size-xs, 12px);
      }

      .c-home__router-chevron {
        width: 3px;
        height: 6px;
        border-radius: 3px;
        background-color: var(--s2a-color-content-knockout-subtle, #e0e0e0);
      }

      .c-home__section {
        margin-top: var(--s2a-spacing-4xl, 64px);
      }

      .c-home__section-header {
        max-width: 1192px;
        margin: 0 auto var(--s2a-spacing-2xl, 40px);
        padding: 0 var(--s2a-spacing-xl, 32px);
      }

      .c-home__section-eyebrow {
        font-size: var(--s2a-typography-font-size-sm, 14px);
        text-transform: uppercase;
        letter-spacing: var(--s2a-typography-letter-spacing-half, 0.5px);
        color: var(--s2a-color-content-subtle, #7a7a7a);
      }

      .c-home__section-title {
        margin: var(--s2a-spacing-xs, 8px) 0;
        font-family:
          'adobe-clean-display',
          var(
            --s2a-typography-font-family-adobe-clean-display,
            'Adobe Clean Display'
          ),
          system-ui,
          -apple-system,
          BlinkMacSystemFont,
          'Segoe UI',
          sans-serif;
        font-weight: var(--s2a-typography-font-weight-bold, 700);
        font-size: var(--s2a-typography-font-size-3xl, 40px);
        line-height: var(--s2a-typography-line-height-3xl, 48px);
      }

      .c-home__section-body {
        margin: 0;
        max-width: 836px;
        font-size: var(--s2a-typography-font-size-md, 16px);
        line-height: var(--s2a-typography-line-height-lg, 32px);
      }

      .c-home__cards-row {
        max-width: 1192px;
        margin: 0 auto;
        padding: 0 var(--s2a-spacing-xl, 32px);
        display: grid;
        grid-template-columns: repeat(3, minmax(0, 1fr));
        gap: var(--s2a-spacing-xl, 32px);
      }

      .c-home__card {
        border-radius: var(--s2a-border-radius-md, 16px);
        background-color: var(--s2a-color-background-subtle, #f5f5f5);
        overflow: hidden;
        display: flex;
        flex-direction: column;
      }

      .c-home__card-media {
        min-height: 200px;
        background: linear-gradient(
          135deg,
          #4c6fff,
          #d14cff
        ); /* Primitive: card media gradient colors mapped directly from design */
      }

      .c-home__card-copy {
        padding: var(--s2a-spacing-lg, 24px);
        display: flex;
        flex-direction: column;
        gap: var(--s2a-spacing-sm, 12px);
      }

      .c-home__card-headline {
        margin: 0;
        font-weight: var(--s2a-typography-font-weight-bold, 700);
        font-size: var(--s2a-typography-font-size-md, 16px);
      }

      .c-home__card-subheadline {
        margin: 0;
        font-size: var(--s2a-typography-font-size-sm, 14px);
        line-height: var(--s2a-typography-line-height-md, 24px);
      }

      .c-home__card-link {
        margin-top: auto;
        display: inline-flex;
        align-items: center;
        gap: var(--s2a-spacing-2xs, 4px);
        font-size: var(--s2a-typography-font-size-xs, 12px);
      }

      .c-home__card-link-chevron {
        width: 3px;
        height: 6px;
        border-radius: 3px;
        background-color: var(--s2a-color-content-subtle, #7a7a7a);
      }

      .c-home__product-grid {
        max-width: 1192px;
        margin: 0 auto;
        padding: 0 var(--s2a-spacing-xl, 32px);
        display: grid;
        grid-template-columns: repeat(3, minmax(0, 1fr));
        gap: var(--s2a-spacing-xl, 32px);
      }

      .c-home__product-card {
        border-radius: var(--s2a-border-radius-md, 16px);
        background-color: var(--s2a-color-background-subtle, #f5f5f5);
        padding: var(--s2a-spacing-lg, 24px);
        display: flex;
        flex-direction: column;
        gap: var(--s2a-spacing-md, 16px);
      }

      .c-home__product-card-copy {
        display: flex;
        flex-direction: column;
        gap: var(--s2a-spacing-xs, 8px);
      }

      .c-home__product-card-headline {
        margin: 0;
        font-weight: var(--s2a-typography-font-weight-bold, 700);
        font-size: var(--s2a-typography-font-size-md, 16px);
      }

      .c-home__product-card-subheadline {
        margin: 0;
        font-size: var(--s2a-typography-font-size-sm, 14px);
        line-height: var(--s2a-typography-line-height-md, 24px);
      }

      .c-home__ai-band {
        margin-top: var(--s2a-spacing-4xl, 64px);
        padding: var(--s2a-spacing-4xl, 64px) var(--s2a-spacing-xl, 32px);
        background-color: var(--s2a-color-background-subtle, #f5f5f5);
      }

      .c-home__ai-inner {
        max-width: 1192px;
        margin: 0 auto;
        display: grid;
        grid-template-columns: minmax(0, 3fr) minmax(0, 2fr);
        gap: var(--s2a-spacing-3xl, 48px);
        align-items: center;
      }

      .c-home__ai-copy-heading {
        margin: 0;
        font-family:
          'adobe-clean-display',
          var(
            --s2a-typography-font-family-adobe-clean-display,
            'Adobe Clean Display'
          ),
          system-ui,
          -apple-system,
          BlinkMacSystemFont,
          'Segoe UI',
          sans-serif;
        font-weight: var(--s2a-typography-font-weight-bold, 700);
        font-size: var(--s2a-typography-font-size-3xl, 40px);
        line-height: var(--s2a-typography-line-height-3xl, 48px);
      }

      .c-home__ai-copy-body {
        margin: var(--s2a-spacing-sm, 12px) 0 0;
        font-size: var(--s2a-typography-font-size-md, 16px);
        line-height: var(--s2a-typography-line-height-lg, 32px);
      }

      .c-home__ai-input-shell {
        display: flex;
        flex-direction: column;
        gap: var(--s2a-spacing-xs, 8px);
      }

      .c-home__ai-input-row {
        display: grid;
        grid-template-columns: auto minmax(0, 1fr) auto;
        align-items: center;
        gap: var(--s2a-spacing-xs, 8px);
        border-radius: var(--s2a-border-radius-md, 16px);
        border: var(--s2a-border-width-sm, 1px) solid
          var(--s2a-color-border-subtle, #c6c6c6);
        background-color: var(--s2a-color-background-default, #ffffff);
        padding-inline: var(--s2a-spacing-md, 16px);
        height: 56px;
      }

      .c-home__ai-input-icon {
        width: 14px;
        height: 14px;
        border-radius: var(--s2a-border-radius-round, 999px);
        border: var(--s2a-border-width-sm, 1px) solid
          var(--s2a-color-border-subtle, #c6c6c6);
      }

      .c-home__ai-input-placeholder {
        font-size: var(--s2a-typography-font-size-md, 16px);
        color: var(--s2a-color-content-subtle, #7a7a7a);
      }

      .c-home__ai-input-mic {
        width: 32px;
        height: 32px;
        border-radius: var(--s2a-border-radius-round, 999px);
        background-color: var(
          --s2a-color-background-accent-subtle,
          #e5ecff
        ); /* Primitive: fallback blue accent background matches Figma until a dedicated semantic token is provided */
      }

      .c-home__footer {
        margin-top: var(--s2a-spacing-4xl, 64px);
        padding-top: var(--s2a-spacing-4xl, 64px);
        padding-bottom: var(--s2a-spacing-4xl, 64px);
        border-top: var(--s2a-border-width-sm, 1px) solid
          var(--s2a-color-border-subtle, #e0e0e0);
      }

      .c-home__footer-columns {
        max-width: 1192px;
        margin: 0 auto;
        padding: 0 var(--s2a-spacing-xl, 32px);
        display: grid;
        grid-template-columns: repeat(5, minmax(0, 1fr));
        gap: var(--s2a-spacing-xl, 32px);
        font-size: var(--s2a-typography-font-size-sm, 14px);
      }

      .c-home__footer-heading {
        margin: 0 0 var(--s2a-spacing-sm, 12px);
        font-weight: var(--s2a-typography-font-weight-bold, 700);
      }

      .c-home__footer-links {
        margin: 0;
        padding: 0;
        list-style: none;
        display: flex;
        flex-direction: column;
        gap: var(--s2a-spacing-2xs, 4px);
      }

      .c-home__footer-link {
        cursor: pointer;
      }

      .c-home__footer-featured {
        max-width: 1192px;
        margin: var(--s2a-spacing-3xl, 48px) auto 0;
        padding: 0 var(--s2a-spacing-xl, 32px);
      }

      .c-home__footer-featured-row {
        margin-top: var(--s2a-spacing-sm, 12px);
        display: flex;
        flex-wrap: wrap;
        gap: var(--s2a-spacing-md, 16px);
        align-items: center;
      }

      .c-home__footer-bottom {
        max-width: 1192px;
        margin: var(--s2a-spacing-3xl, 48px) auto 0;
        padding: 0 var(--s2a-spacing-xl, 32px);
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: var(--s2a-spacing-lg, 24px);
        font-size: var(--s2a-typography-font-size-xs, 12px);
      }

      .c-home__footer-bottom-left {
        display: flex;
        flex-wrap: wrap;
        gap: var(--s2a-spacing-md, 16px);
        align-items: center;
      }

      .c-home__footer-bottom-links {
        display: flex;
        flex-wrap: wrap;
        gap: var(--s2a-spacing-md, 16px);
      }

      .c-home__footer-social {
        display: flex;
        gap: var(--s2a-spacing-md, 16px);
      }

      .c-home__footer-social-icon {
        width: 18px;
        height: 18px;
        border-radius: var(--s2a-border-radius-round, 999px);
        background-color: var(--s2a-color-content-subtle, #7a7a7a);
      }

      .c-home__nav-link:focus-visible,
      .c-home__nav-link:hover {
        text-decoration: underline;
      }

      .c-home__router-tile:focus-visible,
      .c-home__router-tile:hover {
        outline: var(--s2a-border-width-md, 2px) solid
          var(
            --s2a-button-color-background-accent-solid-default,
            #3b63fb
          ); /* Primitive: router tile focus outline reuses accent button color until a dedicated outline token exists */
        outline-offset: 2px;
      }

      .c-home__card-link:focus-visible,
      .c-home__card-link:hover,
      .c-home__footer-link:focus-visible,
      .c-home__footer-link:hover {
        text-decoration: underline;
      }

      @media (max-width: 1200px) {
        .c-home__hero-inner {
          grid-template-columns: minmax(0, 1fr);
        }

        .c-home__hero-router {
          position: static;
          margin-top: var(--s2a-spacing-3xl, 48px);
          flex-direction: column;
          align-items: flex-start;
        }

        .c-home__ai-inner {
          grid-template-columns: minmax(0, 1fr);
        }

        .c-home__cards-row,
        .c-home__product-grid {
          grid-template-columns: repeat(2, minmax(0, 1fr));
        }

        .c-home__footer-columns {
          grid-template-columns: repeat(3, minmax(0, 1fr));
        }
      }

      @media (max-width: 900px) {
        .c-home__shell {
          padding-inline: var(--s2a-spacing-md, 16px);
        }

        .c-home__nav-left {
          gap: var(--s2a-spacing-md, 16px);
        }

        .c-home__nav-menu {
          display: inline-flex;
        }

        .c-home__nav-links {
          display: none;
        }

        .c-home__hero-inner {
          padding: var(--s2a-spacing-3xl, 48px) var(--s2a-spacing-lg, 24px);
        }

        .c-home__cards-row,
        .c-home__product-grid {
          grid-template-columns: minmax(0, 1fr);
        }

        .c-home__footer-columns {
          grid-template-columns: repeat(2, minmax(0, 1fr));
        }

        .c-home__footer-bottom {
          flex-direction: column;
          align-items: flex-start;
        }
      }
    </style>

    <div class="c-home" lang="en">
      <div class="c-home__shell">
        <header class="c-home__nav">
          <div class="c-home__nav-left">
            <button
              class="c-home__nav-menu"
              type="button"
              aria-label="Open navigation"
            >
              <span
                class="c-home__nav-menu-icon"
                aria-hidden="true"
              >
                <span></span>
              </span>
            </button>
            <div class="c-home__logo" aria-hidden="true"></div>
            <nav
              class="c-home__nav-links"
              aria-label="Primary navigation"
            >
              <div class="c-home__nav-link">
                <span>Creativity &amp; Design</span>
                <span class="c-home__nav-link-chevron" aria-hidden="true"></span>
              </div>
              <div class="c-home__nav-link">
                <span>PDF &amp; E‑signatures</span>
                <span class="c-home__nav-link-chevron" aria-hidden="true"></span>
              </div>
              <div class="c-home__nav-link">
                <span>Marketing &amp; Commerce</span>
                <span class="c-home__nav-link-chevron" aria-hidden="true"></span>
              </div>
              <div class="c-home__nav-link">
                <span>Help &amp; Support</span>
              </div>
            </nav>
          </div>
          <div class="c-home__nav-right">
            <div class="c-home__apps-icon" aria-hidden="true"></div>
            ${Button({
              label: 'Sign in',
              size: 'lg',
              kind: 'primary',
              background: 'outlined',
            })}
          </div>
        </header>

        <main class="c-home__main">
          <section class="c-home__hero" aria-labelledby="home-hero-heading">
            <div class="c-home__hero-media" aria-hidden="true"></div>
            <div class="c-home__hero-scrim" aria-hidden="true"></div>

            <div class="c-home__hero-inner">
              <div class="c-home__hero-copy">
                <p class="c-home__hero-eyebrow">
                  For individuals, students, and businesses
                </p>
                <h1 id="home-hero-heading" class="c-home__hero-heading">
                  AI‑powered apps to create, edit, and share your best work.
                </h1>
                <p class="c-home__hero-body">
                  Make standout content, PDFs, marketing, and more with Adobe
                  Firefly, Photoshop, Acrobat, and AI built into your favorite
                  tools.
                </p>
                <div class="c-home__hero-ctas">
                  ${Button({
                    label: 'Get Adobe Firefly',
                    size: '2xl',
                    kind: 'accent',
                    background: 'solid',
                  })}
                  ${Button({
                    label: 'View all plans',
                    size: '2xl',
                    kind: 'primary',
                    background: 'outlined',
                  })}
                </div>
              </div>
            </div>

            <div class="c-home__hero-router" aria-label="Product router">
              <button
                class="c-home__router-play"
                type="button"
                aria-label="Play hero video"
              >
                <span
                  class="c-home__router-play-icon"
                  aria-hidden="true"
                ></span>
              </button>
              <div class="c-home__router-tiles">
                <div class="c-home__router-tile">
                  <div class="c-home__router-tile-id">
                    <div
                      class="c-home__router-product-avatar"
                      aria-hidden="true"
                    ></div>
                    <span>Creative Cloud All Apps</span>
                  </div>
                  <div class="c-home__router-cta">
                    <span>Explore creative tools</span>
                    <span
                      class="c-home__router-chevron"
                      aria-hidden="true"
                    ></span>
                  </div>
                </div>

                <div class="c-home__router-tile">
                  <div class="c-home__router-tile-id">
                    <div
                      class="c-home__router-product-avatar"
                      aria-hidden="true"
                    ></div>
                    <span>Firefly</span>
                  </div>
                  <div class="c-home__router-cta">
                    <span>Create with generative AI</span>
                    <span
                      class="c-home__router-chevron"
                      aria-hidden="true"
                    ></span>
                  </div>
                </div>

                <div class="c-home__router-tile c-home__router-tile--active">
                  <div class="c-home__router-tile-id">
                    <div
                      class="c-home__router-product-avatar"
                      aria-hidden="true"
                    ></div>
                    <span>Acrobat</span>
                  </div>
                  <div class="c-home__router-cta">
                    <span>Edit, sign, and share PDFs</span>
                    <span
                      class="c-home__router-chevron"
                      aria-hidden="true"
                    ></span>
                  </div>
                </div>

                <div class="c-home__router-tile">
                  <div class="c-home__router-tile-id">
                    <div
                      class="c-home__router-product-avatar"
                      aria-hidden="true"
                    ></div>
                    <span>Experience Cloud</span>
                  </div>
                  <div class="c-home__router-cta">
                    <span>Personalize customer journeys</span>
                    <span
                      class="c-home__router-chevron"
                      aria-hidden="true"
                    ></span>
                  </div>
                </div>

                <div class="c-home__router-tile">
                  <div class="c-home__router-tile-id">
                    <div
                      class="c-home__router-product-avatar"
                      aria-hidden="true"
                    ></div>
                    <span>Students &amp; teachers</span>
                  </div>
                  <div class="c-home__router-cta">
                    <span>Save over 60% on Creative Cloud</span>
                    <span
                      class="c-home__router-chevron"
                      aria-hidden="true"
                    ></span>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section
            class="c-home__section"
            aria-labelledby="whats-new-heading"
          >
            <header class="c-home__section-header">
              <p class="c-home__section-eyebrow">What’s new</p>
              <h2 id="whats-new-heading" class="c-home__section-title">
                The latest in AI, creativity, and customer experience.
              </h2>
              <p class="c-home__section-body">
                Discover new ways to work smarter and move faster with Adobe
                Firefly, Creative Cloud, Acrobat, and Experience Cloud.
              </p>
            </header>

            <div class="c-home__cards-row">
              <article class="c-home__card">
                <div class="c-home__card-media" aria-hidden="true"></div>
                <div class="c-home__card-copy">
                  <h3 class="c-home__card-headline">
                    Firefly for fast, high‑quality content.
                  </h3>
                  <p class="c-home__card-subheadline">
                    Generate images and text effects from simple prompts directly
                    inside Adobe apps.
                  </p>
                  <button class="c-home__card-link" type="button">
                    <span>Explore Firefly</span>
                    <span
                      class="c-home__card-link-chevron"
                      aria-hidden="true"
                    ></span>
                  </button>
                </div>
              </article>

              <article class="c-home__card">
                <div class="c-home__card-media" aria-hidden="true"></div>
                <div class="c-home__card-copy">
                  <h3 class="c-home__card-headline">
                    Smarter PDFs with Acrobat AI Assistant.
                  </h3>
                  <p class="c-home__card-subheadline">
                    Ask questions about your documents and get instant answers,
                    summaries, and suggested actions.
                  </p>
                  <button class="c-home__card-link" type="button">
                    <span>Try Acrobat</span>
                    <span
                      class="c-home__card-link-chevron"
                      aria-hidden="true"
                    ></span>
                  </button>
                </div>
              </article>

              <article class="c-home__card">
                <div class="c-home__card-media" aria-hidden="true"></div>
                <div class="c-home__card-copy">
                  <h3 class="c-home__card-headline">
                    End‑to‑end customer experiences.
                  </h3>
                  <p class="c-home__card-subheadline">
                    Use Adobe Experience Cloud to orchestrate journeys and
                    activate real‑time insights at scale.
                  </p>
                  <button class="c-home__card-link" type="button">
                    <span>See Experience Cloud</span>
                    <span
                      class="c-home__card-link-chevron"
                      aria-hidden="true"
                    ></span>
                  </button>
                </div>
              </article>
            </div>
          </section>

          <section class="c-home__section" aria-label="Product grid">
            <header class="c-home__section-header">
              <p class="c-home__section-eyebrow">Adobe products</p>
              <h2 class="c-home__section-title">
                Find the right plan or product for you.
              </h2>
            </header>

            <div class="c-home__product-grid">
              <article class="c-home__product-card">
                ${ProductLockup({
                  productName: 'Firefly',
                  showName: true,
                  size: 'xl',
                  tileVariant: 'default',
                })}
                <div class="c-home__product-card-copy">
                  <h3 class="c-home__product-card-headline">
                    Firefly, Adobe’s generative AI.
                  </h3>
                  <p class="c-home__product-card-subheadline">
                    Create images, text effects, and more using simple prompts
                    in your favorite Adobe apps.
                  </p>
                </div>
              </article>

              <article class="c-home__product-card">
                ${ProductLockup({
                  productName: 'Acrobat',
                  showName: true,
                  size: 'xl',
                  tileVariant: 'default',
                })}
                <div class="c-home__product-card-copy">
                  <h3 class="c-home__product-card-headline">
                    Acrobat for every kind of PDF.
                  </h3>
                  <p class="c-home__product-card-subheadline">
                    Edit, sign, share, and collaborate on PDFs—on desktop, web,
                    or mobile.
                  </p>
                </div>
              </article>

              <article class="c-home__product-card">
                ${ProductLockup({
                  productName: 'Creative Cloud',
                  showName: true,
                  size: 'xl',
                  tileVariant: 'default',
                })}
                <div class="c-home__product-card-copy">
                  <h3 class="c-home__product-card-headline">
                    Creative Cloud All Apps.
                  </h3>
                  <p class="c-home__product-card-subheadline">
                    Get Photoshop, Illustrator, Premiere Pro, and more in a
                    single subscription.
                  </p>
                </div>
              </article>

              <article class="c-home__product-card">
                ${ProductLockup({
                  productName: 'Premiere Pro',
                  showName: true,
                  size: 'xl',
                  tileVariant: 'default',
                })}
                <div class="c-home__product-card-copy">
                  <h3 class="c-home__product-card-headline">
                    Premiere Pro for video editing.
                  </h3>
                  <p class="c-home__product-card-subheadline">
                    Craft content for social, streaming, and film with AI‑powered
                    video tools.
                  </p>
                </div>
              </article>

              <article class="c-home__product-card">
                ${ProductLockup({
                  productName: 'Experience Cloud',
                  showName: true,
                  size: 'xl',
                  tileVariant: 'experience-cloud',
                })}
                <div class="c-home__product-card-copy">
                  <h3 class="c-home__product-card-headline">
                    Experience Cloud for enterprises.
                  </h3>
                  <p class="c-home__product-card-subheadline">
                    Connect content, data, and journeys across the entire
                    customer lifecycle.
                  </p>
                </div>
              </article>

              <article class="c-home__product-card">
                ${ProductLockup({
                  productName: 'Photoshop',
                  showName: true,
                  size: 'xl',
                  tileVariant: 'default',
                })}
                <div class="c-home__product-card-copy">
                  <h3 class="c-home__product-card-headline">
                    Photoshop for imaging and design.
                  </h3>
                  <p class="c-home__product-card-subheadline">
                    Transform photos, graphics, and illustrations with precision
                    and AI‑powered tools.
                  </p>
                </div>
              </article>
            </div>
          </section>

          <section class="c-home__ai-band" aria-labelledby="ai-band-heading">
            <div class="c-home__ai-inner">
              <div>
                <h2 id="ai-band-heading" class="c-home__ai-copy-heading">
                  Ask Adobe AI for help with anything.
                </h2>
                <p class="c-home__ai-copy-body">
                  Get ideas, content, and answers faster with Adobe Firefly and
                  Acrobat AI Assistant built into the apps you use every day.
                </p>
              </div>
              <div class="c-home__ai-input-shell">
                <div class="c-home__ai-input-row">
                  <div class="c-home__ai-input-icon" aria-hidden="true"></div>
                  <div class="c-home__ai-input-placeholder">
                    Ask anything—like “Summarize this PDF” or “Make a product
                    hero image.”
                  </div>
                  <div class="c-home__ai-input-mic" aria-hidden="true"></div>
                </div>
              </div>
            </div>
          </section>
        </main>

        <footer class="c-home__footer" aria-label="Adobe footer">
          <div class="c-home__footer-columns">
            <section>
              <h3 class="c-home__footer-heading">
                For individuals &amp; small business
              </h3>
              <ul class="c-home__footer-links">
                <li class="c-home__footer-link">Creative AI</li>
                <li class="c-home__footer-link">Photography</li>
                <li class="c-home__footer-link">Design &amp; Illustration</li>
                <li class="c-home__footer-link">Video &amp; animation</li>
                <li class="c-home__footer-link">PDF</li>
                <li class="c-home__footer-link">3D &amp; AR</li>
                <li class="c-home__footer-link">Elements</li>
                <li class="c-home__footer-link">Stock images &amp; video</li>
                <li class="c-home__footer-link">View all products</li>
              </ul>
            </section>

            <section>
              <h3 class="c-home__footer-heading">
                For medium &amp; large business
              </h3>
              <ul class="c-home__footer-links">
                <li class="c-home__footer-link">Personalization at scale</li>
                <li class="c-home__footer-link">Content supply chain</li>
                <li class="c-home__footer-link">
                  Unified customer experience
                </li>
                <li class="c-home__footer-link">Creativity and production</li>
                <li class="c-home__footer-link">B2B go‑to‑market</li>
                <li class="c-home__footer-link">View all business products</li>
              </ul>
            </section>

            <section>
              <h3 class="c-home__footer-heading">For organizations</h3>
              <ul class="c-home__footer-links">
                <li class="c-home__footer-link">Education</li>
                <li class="c-home__footer-link">Nonprofits</li>
                <li class="c-home__footer-link">Government</li>
              </ul>
            </section>

            <section>
              <h3 class="c-home__footer-heading">Support</h3>
              <ul class="c-home__footer-links">
                <li class="c-home__footer-link">Help Center</li>
                <li class="c-home__footer-link">Download and install</li>
                <li class="c-home__footer-link">Adobe Community</li>
                <li class="c-home__footer-link">Adobe Learn</li>
                <li class="c-home__footer-link">
                  Medium &amp; large business support
                </li>
              </ul>
            </section>

            <section>
              <h3 class="c-home__footer-heading">Adobe</h3>
              <ul class="c-home__footer-links">
                <li class="c-home__footer-link">About</li>
                <li class="c-home__footer-link">Careers</li>
                <li class="c-home__footer-link">Newsroom</li>
                <li class="c-home__footer-link">
                  Corporate responsibility &amp; sustainability
                </li>
                <li class="c-home__footer-link">Investor relations</li>
                <li class="c-home__footer-link">Trust Center</li>
                <li class="c-home__footer-link">Adobe for All</li>
                <li class="c-home__footer-link">Adobe Blog</li>
                <li class="c-home__footer-link">Terms of use</li>
                <li class="c-home__footer-link">Privacy</li>
              </ul>
            </section>
          </div>

          <div class="c-home__footer-featured">
            <div class="c-home__section-eyebrow">Featured products</div>
            <div class="c-home__footer-featured-row">
              ${ProductLockup({
                productName: 'Acrobat Reader',
                showName: true,
                size: 'xl',
                tileVariant: 'default',
              })}
              ${ProductLockup({
                productName: 'Firefly',
                showName: true,
                size: 'xl',
                tileVariant: 'default',
              })}
              ${ProductLockup({
                productName: 'Adobe Express',
                showName: true,
                size: 'xl',
                tileVariant: 'experience-cloud',
              })}
              ${ProductLockup({
                productName: 'Photoshop',
                showName: true,
                size: 'xl',
                tileVariant: 'default',
              })}
            </div>
          </div>

          <div class="c-home__footer-bottom">
            <div class="c-home__footer-bottom-left">
              <span>Change region</span>
              <div class="c-home__footer-bottom-links">
                <span>© 2026 Adobe Inc. All rights reserved.</span>
                <span>Do not sell or share my personal information</span>
                <span>Cookie preferences</span>
              </div>
            </div>
            <div class="c-home__footer-social">
              <div class="c-home__footer-social-icon" aria-hidden="true"></div>
              <div class="c-home__footer-social-icon" aria-hidden="true"></div>
              <div class="c-home__footer-social-icon" aria-hidden="true"></div>
              <div class="c-home__footer-social-icon" aria-hidden="true"></div>
            </div>
          </div>
        </footer>
      </div>
    </div>
  `;
};

export const Default: Story = {
  render: () => HomeACom(),
};

