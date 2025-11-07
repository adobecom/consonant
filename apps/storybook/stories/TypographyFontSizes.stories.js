
import { html } from 'lit';
import typographyScaleData from './generated/typographyScale.js';

const { typographyScale, lineHeights } = typographyScaleData;

export default {
  title: 'Tokens/Typography/Scale',
  parameters: {
    layout: 'padded'
  }
};

const sampleText = 'Happy spacing values and placeholder text';
const containerStyle = 'display:flex; flex-direction:column; gap:1.5rem;';
const headerStyle = 'font-size:0.9rem; text-transform:uppercase; letter-spacing:0.08em; color:#6d6d6d; margin-bottom:0.5rem;';
const metaStyle = 'font-size:0.875rem; color:#6d6d6d;';

export const FontSizesWithLineHeights = () => html`
  <section style=${containerStyle}>
    <header style=${headerStyle}>Font Sizes & Line Heights</header>
    ${typographyScale.map(
      ({ token, rem, px, lineHeightToken, lineHeight }) => html`
        <article style="display:flex; flex-direction:column; gap:0.35rem;">
          <div style="display:flex; align-items:baseline; justify-content:space-between; flex-wrap:wrap; gap:0.5rem;">
            <span style="font-size:${rem}; line-height:${lineHeight}; font-weight:600; font-family:'Adobe Clean', 'Trebuchet MS', sans-serif;">
              ${sampleText}
            </span>
            <code style=${metaStyle}>
              Size ${token}: ${rem}${px ? ` (${px})` : ''} • Line Height ${lineHeightToken ?? '-'}: ${lineHeight ?? '-'}
            </code>
          </div>
        </article>
      `
    )}
  </section>
`;

export const LineHeightsOnly = () => html`
  <section style=${containerStyle}>
    <header style=${headerStyle}>Line Heights (unitless)</header>
    <div style="display:flex; flex-direction:column; gap:0.75rem;">
      ${lineHeights.map(
        ({ token, value }) => html`
          <div style="display:flex; justify-content:space-between; align-items:center; font-family:'Adobe Clean', 'Trebuchet MS', sans-serif;">
            <span style="font-size:1rem;">Token ${token}</span>
            <code style=${metaStyle}>${value}</code>
          </div>
        `
      )}
    </div>
  </section>
`;
