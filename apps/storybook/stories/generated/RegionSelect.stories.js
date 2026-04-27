import { html } from 'lit';

export default {
  title: 'Generated/RegionSelect',
  tags: ['autodocs'],
  parameters: { layout: 'fullscreen' },
};

const chevron = html`<svg width="3" height="6" viewBox="0 0 3 6" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
  <path d="M0 0L3 3L0 6" stroke="currentColor" stroke-width="1"/>
</svg>`;

const navItem = (label) => html`
  <a href="#" style="
    display: flex;
    align-items: center;
    gap: var(--s2a-spacing-xs, 8px);
    padding-top: var(--s2a-spacing-2xs, 4px);
    padding-bottom: var(--s2a-spacing-2xs, 4px);
    border-radius: var(--s2a-spacing-2xs, 4px);
    color: var(--s2a-color-content-default, #000);
    font-family: var(--s2a-font-family-body, 'Adobe Clean', sans-serif);
    font-size: var(--s2a-typography-font-size-body-sm, 14px);
    line-height: var(--s2a-typography-line-height-body-sm, 18px);
    letter-spacing: var(--s2a-typography-letter-spacing-body-sm, 0.14px);
    font-weight: var(--s2a-font-weight-body, 400);
    text-decoration: none;
    white-space: nowrap;
  ">${label} ${chevron}</a>`;

const regionHeading = (label, visible = true) => html`
  <p style="
    font-family: var(--s2a-font-family-eyebrow, 'Adobe Clean', sans-serif);
    font-size: var(--s2a-typography-font-size-eyebrow, 16px);
    line-height: var(--s2a-typography-line-height-eyebrow, 20px);
    letter-spacing: var(--s2a-typography-letter-spacing-eyebrow, -0.2px);
    font-weight: var(--s2a-font-weight-eyebrow, 700);
    color: var(--s2a-color-content-title, #000);
    margin: 0 0 var(--s2a-spacing-lg, 24px) 0;
    opacity: ${visible ? '1' : '0'};
  ">${label}</p>`;

export const Default = {
  render: () => html`
    <div style="
      background: var(--s2a-color-background-default, #fff);
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: var(--s2a-spacing-xl, 32px);
    ">
      <div style="
        background: var(--s2a-color-background-default, #fff);
        border-radius: var(--s2a-border-radius-md, 16px);
        width: 1200px;
        max-width: 100%;
        position: relative;
        box-shadow: 0 8px 32px rgba(0,0,0,0.12);
      ">
        <!-- Header -->
        <div style="
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          padding: var(--s2a-spacing-lg, 24px);
        ">
          <div style="
            display: flex;
            flex-direction: column;
            gap: var(--s2a-spacing-2xs, 4px);
          ">
            <h2 style="
              margin: 0;
              font-family: var(--s2a-font-family-title, 'Adobe Clean Display', sans-serif);
              font-size: var(--s2a-typography-font-size-title-4, 20px);
              line-height: var(--s2a-typography-line-height-title-4, 20px);
              letter-spacing: var(--s2a-typography-letter-spacing-title-4, -0.48px);
              font-weight: var(--s2a-font-weight-title, 900);
              color: var(--s2a-color-content-title, #000);
            ">Choose your region</h2>
            <p style="
              margin: 0;
              font-family: var(--s2a-font-family-body, 'Adobe Clean', sans-serif);
              font-size: var(--s2a-typography-font-size-body-md, 16px);
              line-height: var(--s2a-typography-line-height-body-md, 20px);
              letter-spacing: var(--s2a-typography-letter-spacing-body-md, 0.16px);
              font-weight: var(--s2a-font-weight-body, 400);
              color: var(--s2a-color-content-default, #000);
            ">Selecting a region changes the language and/or content on Adobe.com.</p>
          </div>
          <button aria-label="Close" style="
            width: 60px;
            height: 60px;
            display: flex;
            align-items: center;
            justify-content: center;
            background: none;
            border: none;
            cursor: pointer;
            color: var(--s2a-color-content-default, #000);
            padding: var(--s2a-spacing-lg, 24px);
          ">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
              <path d="M2 2L14 14M14 2L2 14" stroke="currentColor" stroke-width="1.5"/>
            </svg>
          </button>
        </div>

        <!-- Region columns -->
        <div style="
          display: flex;
          padding: 0 var(--s2a-spacing-lg, 24px) var(--s2a-spacing-lg, 24px);
          gap: 0;
        ">
          <!-- Americas -->
          <div style="flex: 1; min-width: 0; display: flex; flex-direction: column;">
            ${regionHeading('Americas')}
            ${navItem('Argentina')}
            ${navItem('Brasil')}
            ${navItem('Canada - English')}
            ${navItem('Canada - Français')}
            ${navItem('Chile')}
            ${navItem('Colombia')}
            ${navItem('Costa Rica')}
            ${navItem('Ecuador')}
            ${navItem('Guatemala')}
            ${navItem('Latinoamérica')}
            ${navItem('México')}
            ${navItem('Perú')}
            ${navItem('Puerto Rico')}
            ${navItem('United States')}
          </div>

          <!-- EMEA col 1 -->
          <div style="flex: 1; min-width: 0; display: flex; flex-direction: column;">
            ${regionHeading('Europe, Middle East and Africa')}
            ${navItem('Africa - English')}
            ${navItem('Belgique - Français')}
            ${navItem('Belgium - English')}
            ${navItem('België - Nederlands')}
            ${navItem('Danmark')}
            ${navItem('Deutschland')}
            ${navItem('Eesti')}
            ${navItem('Egypt - English')}
            ${navItem('مصر - اللغة العربية')}
            ${navItem('España')}
            ${navItem('France')}
            ${navItem('Greece - English')}
            ${navItem('Ελλάδα')}
            ${navItem('Ireland')}
            ${navItem('Israel - English')}
            ${navItem('Kuwait - English')}
            ${navItem('الكويت - اللغة العربية')}
            ${navItem('Latvija')}
            ${navItem('Lietuva')}
          </div>

          <!-- EMEA col 2 -->
          <div style="flex: 1; min-width: 0; display: flex; flex-direction: column;">
            ${regionHeading('Europe, Middle East and Africa', false)}
            ${navItem('Luxembourg - Deutsch')}
            ${navItem('Luxembourg - English')}
            ${navItem('Luxembourg - Français')}
            ${navItem('Magyarország')}
            ${navItem('Middle East and North Africa - English')}
            ${navItem('Nederland')}
            ${navItem('Nigeria')}
            ${navItem('Norge')}
            ${navItem('Polska')}
            ${navItem('Portugal')}
            ${navItem('Qatar - English')}
            ${navItem('قطر - اللغة العربية')}
            ${navItem('România')}
            ${navItem('Saudi Arabia - English')}
            ${navItem('Schweiz')}
            ${navItem('Slovenija')}
            ${navItem('Slovensko')}
            ${navItem('South Africa')}
            ${navItem('Suisse')}
          </div>

          <!-- EMEA col 3 -->
          <div style="flex: 1; min-width: 0; display: flex; flex-direction: column;">
            ${regionHeading('Europe, Middle East and Africa', false)}
            ${navItem('Suomi')}
            ${navItem('Sverige')}
            ${navItem('Svizzera')}
            ${navItem('Türkiye')}
            ${navItem('United Arab Emirates - English')}
            ${navItem('United Kingdom')}
            ${navItem('Česká republika')}
            ${navItem('България')}
            ${navItem('Россия')}
            ${navItem('Україна')}
            ${navItem('ישראל - עברית')}
            ${navItem('الإمارات العربية المتحدة')}
            ${navItem('الشرق الأوسط وشمال أفريقيا - اللغة العربية')}
            ${navItem('المملكة العربية السعودية')}
          </div>

          <!-- Asia Pacific -->
          <div style="flex: 1; min-width: 0; display: flex; flex-direction: column;">
            ${regionHeading('Asia Pacific')}
            ${navItem('Australia')}
            ${navItem('Hong Kong S.A.R. of China')}
            ${navItem('India')}
            ${navItem('Indonesia')}
            ${navItem('Indonesia - English')}
            ${navItem('Malaysia')}
            ${navItem('Malaysia - English')}
            ${navItem('New Zealand')}
            ${navItem('Philippines - English')}
            ${navItem('Pilipinas')}
            ${navItem('Singapore')}
            ${navItem('Thailand - English')}
            ${navItem('Vietnam - English')}
            ${navItem('Việt Nam')}
            ${navItem('भारत')}
            ${navItem('ประเทศไทย')}
            ${navItem('中国')}
            ${navItem('中國香港特別行政區')}
            ${navItem('台灣地區')}
            ${navItem('日本')}
            ${navItem('한국')}
          </div>
        </div>
      </div>
    </div>
  `,
};
