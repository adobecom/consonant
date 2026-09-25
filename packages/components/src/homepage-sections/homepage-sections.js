import { html, nothing } from "lit";
import { SectionHeader } from "../section-header/section-header.js";
import { MediaCard } from "../media-card/media-card.js";
import { TextCard } from "../text-card/text-card.js";
import { ProductCard } from "../product-card/product-card.js";
import { AppIcon } from "../app-icon/app-icon.js";
import { Logo } from "../logo/logo.js";
import { createButton } from "../button/button.js";
import "./homepage-sections.css";
/**
 * @typedef {Object} HomepageItem
 * @property {string} [title]
 * @property {string} [body]
 * @property {string} [app]
 * @property {string} [ctaLabel]
 * @property {string} [ctaHref]
 * @property {string} [imageSrc]
 * @property {string} [imageSrcset]
 * @property {string} [imageAlt]
 */

// The frame carries the scroll reveal; the image carries the hover zoom, so the
// two transforms never compete on one element.
const media = (item, sizes) =>
  item.imageSrc
    ? html`<span class="home-media-frame"
        ><img
          class="home-media"
          src=${item.imageSrc}
          srcset=${item.imageSrcset || nothing}
          sizes=${sizes}
          alt=${item.imageAlt || ""}
          loading="lazy"
          decoding="async"
          width="1480"
          height="1110"
      /></span>`
    : nothing;

/** @param {{eyebrow?: string, title?: string, body?: string, items?: HomepageItem[], theme?: string}} [options] */
export const MediaSection = ({
  eyebrow = "",
  title = "",
  body = "",
  items = [],
  theme = "on-light",
} = {}) => html`
  <div class="c-media-section home-section" data-theme=${theme === "on-dark" || theme === "dark" ? "dark" : nothing}>
    <div class="home-reveal">
      ${SectionHeader({ eyebrow, showEyebrow: Boolean(eyebrow), title, body })}
    </div>
    <div class="home-media-grid home-reveal-stagger">
      ${items.map(
      (item, index) =>
        html` <article class=${index === 0 ? "home-feature" : "home-card"}>
          ${MediaCard({ ...item, size: index === 0 ? "feature" : "card", mediaTemplate: media(item, index === 0 ? "(max-width: 600px) 100vw, 88vw" : "(max-width: 767px) 100vw, 33vw") })}
        </article>`,
    )}
    </div>
  </div>
`;

/** @param {{title?: string, items?: HomepageItem[]}} [options] */
export const NewsSection = ({ title = "Adobe News", items = [] } = {}) => html`
  <div class="c-news-section home-section">
    <h2 class="home-news-heading home-reveal">
      ${AppIcon({ app: "experience-cloud", size: "md" })}<span>${title}</span>
    </h2>
    <div class="home-news-grid home-reveal-stagger">
      ${items.map((item) => html`<article>${TextCard({ ...item, headline: item.title })}</article>`)}
    </div>
  </div>
`;

/** @param {{title?: string, body?: string, ctaLabel?: string, ctaHref?: string, imageSrc?: string, imageSrcset?: string, imageAlt?: string, items?: HomepageItem[]}} [options] */
export const ProductRouter = ({
  title = "",
  body = "",
  ctaLabel = "",
  ctaHref = "",
  imageSrc,
  imageSrcset,
  imageAlt = "",
  items = [],
} = {}) => html`
  <div class="c-product-router">
    <div class="home-product-hero">
      ${imageSrc ? html`<img src=${imageSrc} srcset=${imageSrcset || nothing} sizes="100vw" alt=${imageAlt} loading="lazy" decoding="async" width="1920" height="1040" />` : nothing}
      <div class="home-product-copy home-reveal" data-theme="dark">
        ${SectionHeader({ title, body, showEyebrow: false, showActions: Boolean(ctaLabel), actions: createButton({ label: ctaLabel, href: ctaHref, style: "outline-inverse" }) })}
      </div>
    </div>
    <div class="home-product-grid home-section home-reveal-stagger">
      ${items.map((item) => ProductCard({ app: item.app, heading: item.title, body: item.body, href: item.ctaHref, imageSrc: item.imageSrc, imageAlt: "" }))}
    </div>
  </div>
`;

// Footer page pattern 12102:175540; intentionally not advertised as a versioned S2A master.
/** @param {{items?: {group: string, label: string, href: string}[], copyright?: string, brandHref?: string}} [options] */
export const SiteFooter = ({
  items = [],
  copyright = "",
  brandHref = "https://www.adobe.com/",
} = {}) => {
  const groups = [...new Set(items.map((item) => item.group))];
  return html`<footer class="c-site-footer" role="contentinfo">
    <nav class="home-footer-links home-section" aria-label="Footer navigation">
      ${groups.map(
        (group, index) =>
          html`<div>
            <h2 id=${`home-footer-group-${index}`}>${group}</h2>
            <ul aria-labelledby=${`home-footer-group-${index}`}>
              ${items.filter((item) => item.group === group).map((item) => html`<li><a href=${item.href}>${item.label}</a></li>`)}
            </ul>
          </div>`,
      )}
    </nav>
    <div class="home-footer-legal home-section">
      <small>${copyright}</small>
    </div>
    <a class="home-footer-wordmark" href=${brandHref} aria-label="Adobe home" data-theme="dark"
      >${Logo()}</a
    >
  </footer>`;
};
