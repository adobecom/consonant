import { html, render } from "lit";
import { QuoteCard } from "../../../packages/components/src/quote-card/quote-card.js";
import {
  SocialProofCarousel,
  SocialProofCarouselController,
} from "../../../packages/components/src/social-proof-carousel/social-proof-carousel.js";
import { assetUrl } from "./fixtures";
import { videoUrl } from "./assets";
import { Media } from "../../../packages/components/src/media/media.js";
import type { Quote, Section, ContentFields, ContentItem } from "./model";
import { RouterMarquee, RouterMarqueeController } from "../../../packages/components/src/router-marquee/router-marquee.js";
import { HubRouter } from "../../../packages/components/src/hub-router/hub-router.js";
import { GlobalNavigation, GlobalNavigationController } from "../../../packages/components/src/global-navigation/global-navigation.js";
import { MediaSection, NewsSection, ProductRouter, SiteFooter } from "../../../packages/components/src/homepage-sections/homepage-sections.js";

export type AssetResolver = typeof assetUrl;
export type VideoResolver = typeof videoUrl;
/** Where a section sits in the page's landmark structure: navigation before
 *  <main>, footer after it, everything else inside it. */
export const pageSlot = (component: Section["component"]): "before" | "main" | "after" =>
  component === "global-navigation" ? "before" : component === "site-footer" ? "after" : "main";
export const contentProps = (fields: ContentFields, resolveAsset: AssetResolver = assetUrl) => ({
  ...fields,
  imageSrc: fields.imageAssetId ? resolveAsset(fields.imageAssetId) : undefined,
  imageSrcset: fields.imageAssetId ? `${resolveAsset(fields.imageAssetId, "small")} 640w, ${resolveAsset(fields.imageAssetId)} 1480w` : undefined,
});

function quoteProps(quote: Quote, eager: boolean, resolveAsset: AssetResolver) {
  return {
    ...quote.props,
    ctaLabel: quote.slots.cta.label,
    ctaHref: quote.slots.cta.href,
    imageSrc: resolveAsset(quote.props.imageAssetId),
    imageSrcset: `${resolveAsset(quote.props.imageAssetId, "small")} 640w, ${resolveAsset(quote.props.imageAssetId)} 1480w`,
    imageSizes: "(max-width: 599px) 85vw, 100vw",
    imageAlt: "",
    imageLoading: eager ? "eager" : "lazy",
  };
}
export interface Mount {
  element: HTMLElement;
  signature: string;
  controller?: { activeIndex?: number; pause?(): void; resume?(): void; _goTo?(index: number, instant?: boolean): void; _recalc?(): void; destroy(): void };
  dispose(): void;
}
export function mountSection(
  section: Section,
  eager: boolean,
  activeIndex = 0,
  resolveAsset: AssetResolver = assetUrl,
  resolveVideo: VideoResolver = videoUrl,
): Mount {
  const element = document.createElement("section");
  element.dataset.sectionId = section.id;
  element.className = "page-section";
  element.dataset.component = section.component;
  // Content sections are named regions. Navigation and footer wrappers stay
  // plain so the banner and contentinfo landmarks inside them remain top-level.
  if (pageSlot(section.component) === "main")
    element.setAttribute(
      "aria-label",
      section.component === "quote-card"
        ? "Featured quote"
        : section.component === "social-proof-carousel" ? "Customer stories carousel" : section.props.title || section.component,
    );
  let controller: Mount["controller"];
  if (section.component === "quote-card")
    render(QuoteCard(quoteProps(section, eager, resolveAsset)), element);
  else if (section.component === "social-proof-carousel") {
    render(
      SocialProofCarousel({
        slides: section.items.map((item, i) =>
          quoteProps(item, eager && i === activeIndex, resolveAsset),
        ),
        activeIndex,
      }),
      element,
    );
    controller = new SocialProofCarouselController(
      element.querySelector(".c-social-proof-carousel")!,
    );
  } else {
    const props = contentProps(section.props, resolveAsset);
    const items = section.items.map((item: ContentItem) => ({ ...item, ...contentProps(item, resolveAsset) }));
    switch (section.component) {
      case "global-navigation":
        render(GlobalNavigation({ links: items.map((item) => ({ label: item.label, href: item.ctaHref })), signInLabel: props.ctaLabel, signInHref: props.ctaHref }), element);
        controller = new GlobalNavigationController(element.querySelector(".c-global-navigation"));
        break;
      case "router-marquee":
        render(RouterMarquee({ slides: items.map((item) => ({ ...item, product: item.label, videoSrc: item.videoAssetId ? resolveVideo(item.videoAssetId) : undefined })), activeIndex: Math.min(activeIndex, items.length - 1) }), element);
        controller = new RouterMarqueeController(element.querySelector(".c-router-marquee"));
        break;
      case "hub-router":
        // Category cards: a still as the poster, and the live clip (self-hosted)
        // playing on hover/focus with preload="none" so no video bytes load first.
        render(HubRouter({ heading: props.title, body: props.body, eyebrow: props.eyebrow, showEyebrow: Boolean(props.eyebrow), cards: items.map((item) => ({ ...item, href: item.ctaHref, mediaTemplate: item.videoAssetId && item.imageSrc
          ? Media({ src: resolveVideo(item.videoAssetId), type: "video", poster: item.imageSrc, autoplay: false, muted: true, loop: true, playsinline: true, preload: "none", overlay: undefined })
          : item.imageSrc ? html`<img src=${item.imageSrc} srcset=${item.imageSrcset} sizes="(max-width: 767px) 294px, 496px" alt=${item.imageAlt} loading="lazy" decoding="async" width="496" height="520" style="width:100%;height:100%;object-fit:cover" />` : undefined })) }), element);
        break;
      case "media-section": render(MediaSection({ ...props, items }), element); break;
      case "news-section": render(NewsSection({ ...props, items }), element); break;
      case "product-router": render(ProductRouter({ ...props, items }), element); break;
      case "site-footer": render(SiteFooter({ copyright: props.body, items: items.map((item) => ({ group: item.group, label: item.label, href: item.ctaHref })) }), element); break;
    }
  }
  let disposed = false;
  return {
    element,
    controller,
    signature: JSON.stringify(section),
    dispose() {
      if (disposed) return;
      disposed = true;
      controller?.destroy();
      render(html``, element);
      element.remove();
    },
  };
}
