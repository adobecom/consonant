import {
  createHomepage,
  createHomeSection,
} from "../../authoring-poc/src/homepage";
import { assets, videos } from "../../authoring-poc/src/assets";
import { mountSection, pageSlot } from "../../authoring-poc/src/registry";
import { configureAppIconAssets } from "../../../packages/components/src/app-icon/app-icon.js";
import "./Homepage.stories.css";

const base = import.meta.env.BASE_URL || "/";
const resolveAsset = (id) =>
  `${base}assets/${assets.find((asset) => asset.id === id).source}`;
const resolveVideo = (id) =>
  `${base}assets/homepage/video/${videos.find((video) => video.id === id).file}.mp4`;

// The mount logic lives on a hot-swappable handle: a custom element class can
// be defined only once per page, so without this, Storybook's hot reload would
// keep rendering the first version of the story until a full refresh.
const impl = {
  connect(host) {
    host.className = "homepage-story";
    host.dataset.theme = host.page.theme;
    configureAppIconAssets(`${base}assets/homepage/icons`);
    try {
      host.mounts = host.page.sections.map((section, index) =>
        mountSection(section, index < 2, 0, resolveAsset, resolveVideo),
      );
      // Navigation before <main>, footer after it, content inside it.
      const main = document.createElement("main");
      host.append(main);
      host.mounts.forEach((mount, index) => {
        const slot = pageSlot(host.page.sections[index].component);
        if (slot === "before") host.insertBefore(mount.element, main);
        else if (slot === "after") host.append(mount.element);
        else main.append(mount.element);
      });
      requestAnimationFrame(() =>
        host.mounts?.forEach((mount) => mount.controller?._recalc?.()),
      );
    } finally {
      configureAppIconAssets(
        "https://www.adobe.com/content/dam/shared/images/product-icons/svg",
      );
    }
  },
  disconnect(host) {
    host.mounts?.forEach((mount) => mount.dispose());
    host.mounts = undefined;
    host.replaceChildren();
  },
};
globalThis.__s2aHomepageStory = impl;
class HomepageStory extends HTMLElement {
  connectedCallback() {
    globalThis.__s2aHomepageStory.connect(this);
  }
  disconnectedCallback() {
    globalThis.__s2aHomepageStory.disconnect(this);
  }
}
if (!customElements.get("s2a-homepage-story"))
  customElements.define("s2a-homepage-story", HomepageStory);
const renderPage = (page) => {
  const element = document.createElement("s2a-homepage-story");
  element.page = page;
  return element;
};
const sectionStory = (component) => ({
  args: { section: createHomeSection(component) },
  render: ({ section }) => renderPage({ theme: "light", sections: [section] }),
});

export default {
  title: "Pages/Homepage",
  globals: { theme: "light" },
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component:
          "Authored Homepage starter from Figma 12102:175100, themed light like the Original Design Specs (9672:83669) and the live homepage. Uses the Studio document and component registry, not a separate page implementation. GNav is the link-only bar; mega-menus and platform utilities remain pending. Footer is an unversioned Figma page pattern. See docs/future-notes/s2a-homepage-gap-register.md for parity status and content decisions.",
      },
    },
    design: {
      type: "figma",
      url: "https://www.figma.com/design/qAF4nlt6O4ThbeXeO7jzdb/?node-id=12102-175100",
    },
  },
};

export const FullPage = { render: () => renderPage(createHomepage()) };
export const GlobalNavigation = sectionStory("global-navigation");
export const Marquee = sectionStory("router-marquee");
export const CategoryRouter = sectionStory("hub-router");
export const FeaturesAndReleases = sectionStory("media-section");
export const News = sectionStory("news-section");
export const Products = sectionStory("product-router");
export const FooterPattern = sectionStory("site-footer");
