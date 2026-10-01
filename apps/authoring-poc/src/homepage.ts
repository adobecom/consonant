import {
  newId,
  type ContentFields,
  type ContentItem,
  type ContentSection,
  type PageDocument,
} from "./model";
import { createQuote } from "./quote-fixture";

export const homeRecipes = [
  {
    component: "global-navigation",
    name: "Global navigation",
    icon: "navigation-arrow",
    description: "Adobe wordmark, primary links and sign-in",
  },
  {
    component: "router-marquee",
    name: "Homepage marquee",
    icon: "panorama",
    description: "Full-width hero with product tabs",
  },
  {
    component: "hub-router",
    name: "Category router",
    icon: "cards",
    description: "Category cards that expand on hover",
  },
  {
    component: "media-section",
    name: "Features and releases",
    icon: "image",
    description: "Feature story with a three-up card row",
  },
  {
    component: "news-section",
    name: "Adobe News",
    icon: "newspaper",
    description: "Three news stories with links",
  },
  {
    component: "product-router",
    name: "Product router",
    icon: "grid-four",
    description: "Product hero and linked product tiles",
  },
  {
    component: "site-footer",
    name: "Footer",
    icon: "rows",
    description: "Grouped links, copyright and wordmark",
  },
] as const;
export const itemLimits: Record<ContentSection["component"], number> = {
  "global-navigation": 6,
  "router-marquee": 5,
  "hub-router": 8,
  "media-section": 10,
  "news-section": 6,
  "product-router": 18,
  "site-footer": 60,
};
export const homeReview: Record<string, { node: string; notes: string[] }> = {
  "global-navigation": {
    node: "5011:275645",
    notes: [
      "Mega-menu patterns and utility states pending",
      "Bar labels use corrected intrinsic widths",
    ],
  },
  "router-marquee": {
    node: "12102:175105",
    notes: [
      "Five router slides mirror the live homepage (copy, tabs, videos)",
      "Stills are first frames of the live videos; approved art pending",
    ],
  },
  "hub-router": {
    node: "12102:175264",
    notes: ["Live category clips play on hover/focus; stills are the posters"],
  },
  "media-section": {
    node: "12102:175360",
    notes: [
      "Corrected merged headline and repeated CTA labels",
      "Product links need editorial approval",
    ],
  },
  "social-proof-carousel": {
    node: "12102:175374",
    notes: [
      "Homepage uses a deprecated Figma quote master",
      "Active v2 reconciliation and remaining stories pending",
    ],
  },
  "news-section": {
    node: "12102:175420",
    notes: ["Article destinations pending; links open Adobe News"],
  },
  "product-router": {
    node: "12102:175429",
    notes: [
      "Product hover artwork pending",
      "Mobile pattern requires design approval",
    ],
  },
  "site-footer": {
    node: "12102:175540",
    notes: [
      "Unversioned Figma page pattern",
      "Featured products, social and region utilities pending",
      "Consent and privacy integrations not connected",
    ],
  },
};
export const fields = (values: Partial<ContentFields> = {}): ContentFields => ({
  eyebrow: "",
  title: "",
  body: "",
  ctaLabel: "",
  ctaHref: "https://www.adobe.com/",
  imageAssetId: "",
  videoAssetId: "",
  imageAlt: "",
  ...values,
});
export const createContentItem = (
  values: Partial<ContentItem> = {},
): ContentItem => ({
  ...fields(),
  id: newId(),
  label: "New item",
  app: "creative-cloud",
  group: "",
  ...values,
});
const categories = () => [
  createContentItem({
    label: "Creativity and design",
    app: "creative-cloud",
    title: "Next-level creative",
    body: "Do it all with industry-leading apps for design, photo, video, and creative AI.",
    ctaHref: "https://www.adobe.com/creativecloud.html",
    imageAssetId: "hub-creative",
    videoAssetId: "video-hub-creative",
  }),
  createContentItem({
    label: "Content creation",
    app: "firefly",
    title: "Stunning content made easy",
    body: "Quickly create and edit images, video, and audio with creative AI.",
    ctaHref: "https://www.adobe.com/products/firefly.html",
    imageAssetId: "hub-firefly",
    videoAssetId: "video-hub-firefly",
  }),
  createContentItem({
    label: "PDF and productivity",
    app: "acrobat-pro",
    title: "Work done faster",
    body: "Create, edit, and share PDFs. Make edits and create presentations with AI.",
    ctaHref: "https://www.adobe.com/acrobat.html",
    imageAssetId: "hub-acrobat",
    videoAssetId: "video-hub-acrobat",
  }),
  createContentItem({
    label: "Adobe for Business",
    app: "experience-cloud",
    title: "Orchestrate customer experiences",
    body: "Deliver business impact, move faster, and personalize at scale.",
    ctaHref: "https://business.adobe.com/",
    imageAssetId: "hub-business",
    videoAssetId: "video-hub-business",
  }),
  createContentItem({
    label: "Students and teachers",
    app: "creative-cloud",
    title: "Discounts for students and teachers.",
    body: "Save a bundle on our biggest bundle of top industry creative tools.",
    ctaHref: "https://www.adobe.com/education.html",
    imageAssetId: "hub-students",
    videoAssetId: "video-hub-students",
  }),
];

const routerSlides = () => [
  createContentItem({
    label: "PDF and productivity",
    app: "acrobat-pro",
    eyebrow: "Acrobat",
    title: "Get work done. Faster.",
    body: "Create, edit, share, and sign documents with trusted PDF tools. Use AI to make easy edits, get answers, generate summaries, and create polished content.",
    ctaLabel: "Free trial",
    ctaHref: "https://www.adobe.com/acrobat/free-trial-download.html",
    imageAssetId: "hero-acrobat",
    videoAssetId: "video-hero-acrobat",
    imageAlt: "",
  }),
  createContentItem({
    label: "Creativity and design",
    app: "creative-cloud",
    eyebrow: "Creative Cloud",
    title: "Create at the highest level.",
    body: "Photoshop, Illustrator, Premiere, and much more. Work with the tools behind the world's most iconic creative content.",
    ctaLabel: "Free trial",
    ctaHref: "https://www.adobe.com/creativecloud.html",
    imageAssetId: "hero-creative",
    videoAssetId: "video-hero-creative",
    imageAlt: "",
  }),
  createContentItem({
    label: "Content creation",
    app: "firefly",
    eyebrow: "Firefly",
    title: "All the best models, all in one place.",
    body: "Generate and edit images, video, audio, and designs using top AI models from Adobe, Google, OpenAI, and more.",
    ctaLabel: "Create with Firefly",
    ctaHref: "https://www.adobe.com/products/firefly.html",
    imageAssetId: "hero-firefly",
    videoAssetId: "video-hero-firefly",
    imageAlt: "",
  }),
  createContentItem({
    label: "Adobe for Business",
    app: "experience-cloud",
    eyebrow: "Adobe for Business",
    title: "Orchestrate customer experiences with AI.",
    body: "Unify data, content, and workflows with Adobe AI to move faster, personalize at scale, and prove impact across your business.",
    ctaLabel: "It starts with Adobe",
    ctaHref: "https://business.adobe.com/",
    imageAssetId: "hero-business",
    videoAssetId: "video-hero-business",
    imageAlt: "",
  }),
  createContentItem({
    label: "Students and teachers",
    app: "creative-cloud",
    eyebrow: "Education",
    title: "Students and teachers save 71%.",
    body: "Save big on industry-standard tools with Creative Cloud Pro. Create designs, videos, presentations, and more, while building skills for your future.",
    ctaLabel: "Free trial",
    ctaHref: "https://www.adobe.com/education.html",
    imageAssetId: "hero-education",
    videoAssetId: "video-hero-education",
    imageAlt: "",
  }),
];

export function createHomeSection(
  component: ContentSection["component"],
): ContentSection {
  const section: ContentSection = {
    id: newId(),
    component,
    componentVersion: 1,
    props: fields(),
    items: [],
  };
  switch (component) {
    case "global-navigation":
      section.props = fields({
        title: "Adobe",
        ctaLabel: "Sign in",
        ctaHref: "https://account.adobe.com/",
      });
      section.items = [
        ["Products", "https://www.adobe.com/products/catalog.html"],
        ["Use cases", "https://www.adobe.com/creativecloud.html"],
        ["Solutions", "https://business.adobe.com/"],
        ["Learn & Support", "https://helpx.adobe.com/"],
        ["Plans", "https://www.adobe.com/creativecloud/plans.html"],
      ].map(([label, ctaHref]) => createContentItem({ label, ctaHref }));
      break;
    case "router-marquee":
      section.props = fields({ title: "Adobe" });
      // Five router slides, mirroring the live homepage router-marquee (same
      // order, tabs, copy and video sources as the Organisms/RouterMarquee
      // story). The Acrobat slide keeps the Figma-verified headline.
      section.items = routerSlides();
      break;
    case "hub-router":
      section.props = fields({
        title: "Everything you need to make anything.",
        body: "Whether you're a student, social influencer, creative professional, performance marketer, or global brand, Adobe has the apps you need to make it happen.",
      });
      section.items = categories();
      break;
    case "media-section":
      section.props = fields({
        eyebrow: "Features and Releases",
        title: "Explore what's new.",
        body: "Discover the latest product features from Adobe.",
      });
      section.items = [
        createContentItem({
          label: "Image upscale",
          app: "firefly",
          title: "Upscale images instantly with AI.",
          body: "Improve resolution, clarity, and sharpness while preserving detail. Perfect for photos, designs, and creatives.",
          ctaLabel: "Explore Firefly",
          ctaHref: "https://www.adobe.com/products/firefly.html",
          imageAssetId: "home-upscale",
          imageAlt:
            "A close-up of a fabric cap, showing fine stitching and texture.",
        }),
        createContentItem({
          label: "Documents",
          app: "acrobat-pro",
          title: "Work smarter than ever with documents.",
          body: "Trusted PDF tools, now with AI for editing, insights, and content creation.",
          ctaLabel: "Explore Acrobat",
          ctaHref: "https://www.adobe.com/acrobat.html",
          imageAssetId: "home-documents",
          imageAlt: "PDF Spaces and Generate presentation in Acrobat.",
        }),
        createContentItem({
          label: "AI models",
          app: "firefly",
          title: "Generate with top AI models in one place.",
          body: "Access Gemini 3.1 (with Nano Banana 2), GPT Image, Runway, FLUX models, Luma AI, and more.",
          ctaLabel: "Explore Firefly",
          ctaHref: "https://www.adobe.com/products/firefly.html",
          imageAssetId: "home-models",
          imageAlt:
            "A collection of images made with different creative AI models.",
        }),
        createContentItem({
          label: "Harmonize",
          app: "photoshop",
          title: "Blend images seamlessly with Harmonize.",
          body: "Combine people and objects into any background instantly.",
          ctaLabel: "Explore Photoshop",
          ctaHref: "https://www.adobe.com/products/photoshop.html",
          imageAssetId: "home-harmonize",
          imageAlt: "A car composited into a desert landscape using Harmonize.",
        }),
      ];
      break;
    case "news-section":
      section.props = fields({ title: "Adobe News" });
      section.items = [
        [
          "Sundance",
          "Adobe apps are top choice for Sundance filmmakers.",
          "85% of Sundance Filmmakers Choose Adobe as Company Releases New AI Video Innovations and $10M in Creator Grants.",
        ],
        [
          "Incubator",
          "Adobe's new Incubator creates the future.",
          "At Adobe, innovating for our customers has always been our north star. From pioneering digital creativity to reimagining the future of customer engagement, our mission has been to change the world through personalized digital experiences.",
        ],
        [
          "Customer experience",
          "Adobe partners with OpenAI to test ads in ChatGPT",
          "Adobe empowers marketing professionals with AI-driven Customer Experience Orchestration to create, deliver and optimize personalized digital experiences.",
        ],
      ].map(([label, title, body]) =>
        createContentItem({
          label,
          title,
          body,
          ctaLabel: "Visit Adobe News",
          ctaHref: "https://news.adobe.com/",
        }),
      );
      break;
    case "product-router":
      section.props = fields({
        title: "Tools that work for you.",
        body: "Bring any idea to life with products for creators, businesses, and beyond.",
        ctaLabel: "See all products",
        ctaHref: "https://www.adobe.com/products/catalog.html",
        imageAssetId: "home-tools",
        imageAlt:
          "Adobe creative apps running on a desktop display and tablet.",
      });
      section.items = [
        [
          "Firefly",
          "firefly",
          "Create and enhance images, video, and audio with AI-powered tools.",
          "https://www.adobe.com/products/firefly.html",
        ],
        [
          "Acrobat",
          "acrobat-pro",
          "The complete AI-powered PDF and design solution for business workflows.",
          "https://www.adobe.com/acrobat.html",
        ],
        [
          "Photoshop",
          "photoshop",
          "Create gorgeous images, rich graphics, and incredible art.",
          "https://www.adobe.com/products/photoshop.html",
        ],
        [
          "Premiere",
          "premiere-pro",
          "Create everything from social clips to feature films with the leading video editor.",
          "https://www.adobe.com/products/premiere.html",
        ],
        [
          "Creative Cloud",
          "creative-cloud",
          "Get 20+ apps, including Photoshop, Illustrator, Premiere Pro, and Acrobat Pro.",
          "https://www.adobe.com/creativecloud.html",
        ],
        [
          "GenStudio",
          "experience-cloud",
          "Scale your content supply chain.",
          "https://business.adobe.com/products/genstudio.html",
        ],
        [
          "All products",
          "creative-cloud",
          "See all Adobe products.",
          "https://www.adobe.com/products/catalog.html",
        ],
        [
          "Business Products",
          "experience-cloud",
          "Adobe solutions integrate our best-in-class products to help you tackle pressing business challenges.",
          "https://business.adobe.com/",
        ],
        [
          "Illustrator",
          "illustrator",
          "Design precision vector graphics, from branding to illustration, that stay sharp, scalable, and fully editable at any size.",
          "https://www.adobe.com/products/illustrator.html",
        ],
      ].map(([title, app, body, ctaHref]) =>
        createContentItem({ label: title, title, app, body, ctaHref }),
      );
      break;
    case "site-footer":
      section.props = fields({
        title: "Adobe",
        body: "Copyright 2026 Adobe Inc. All rights reserved.",
      });
      section.items = footerLinks.map(([group, label, ctaHref]) =>
        createContentItem({ group, label, ctaHref }),
      );
      break;
  }
  return section;
}

const footerLinks = [
  [
    "For individuals & small businesses",
    "Creative AI",
    "https://www.adobe.com/products/firefly.html",
  ],
  [
    "For individuals & small businesses",
    "Photography",
    "https://www.adobe.com/creativecloud/photography.html",
  ],
  [
    "For individuals & small businesses",
    "Design & illustration",
    "https://www.adobe.com/products/illustrator.html",
  ],
  [
    "For individuals & small businesses",
    "Video & animation",
    "https://www.adobe.com/products/premiere.html",
  ],
  [
    "For individuals & small businesses",
    "PDF & productivity",
    "https://www.adobe.com/acrobat.html",
  ],
  [
    "For individuals & small businesses",
    "3D",
    "https://www.adobe.com/products/substance3d.html",
  ],
  [
    "For individuals & small businesses",
    "Elements Family",
    "https://www.adobe.com/products/elements-family.html",
  ],
  [
    "For individuals & small businesses",
    "Stock images & video",
    "https://stock.adobe.com/",
  ],
  [
    "For individuals & small businesses",
    "View all products",
    "https://www.adobe.com/products/catalog.html",
  ],
  [
    "For medium & large businesses",
    "Personalization at scale",
    "https://business.adobe.com/",
  ],
  [
    "For medium & large businesses",
    "Content supply chain",
    "https://business.adobe.com/",
  ],
  [
    "For medium & large businesses",
    "Unified customer experience",
    "https://business.adobe.com/",
  ],
  [
    "For medium & large businesses",
    "Creativity and production",
    "https://business.adobe.com/",
  ],
  [
    "For medium & large businesses",
    "B2B GTM orchestration",
    "https://business.adobe.com/",
  ],
  [
    "For medium & large businesses",
    "View all products",
    "https://business.adobe.com/products.html",
  ],
  ["For organizations", "Education", "https://www.adobe.com/education.html"],
  ["For organizations", "Nonprofits", "https://www.adobe.com/nonprofits.html"],
  ["For organizations", "Government", "https://www.adobe.com/government.html"],
  ["Support", "Help Center", "https://helpx.adobe.com/"],
  [
    "Support",
    "Download and install",
    "https://helpx.adobe.com/download-install.html",
  ],
  ["Support", "Adobe Community", "https://community.adobe.com/"],
  ["Support", "Adobe Learn", "https://www.adobe.com/learn"],
  [
    "Support",
    "Medium & large business support",
    "https://business.adobe.com/support.html",
  ],
  [
    "Contact",
    "Contact sales",
    "https://www.adobe.com/about-adobe/contact.html",
  ],
  [
    "Contact",
    "Request information",
    "https://business.adobe.com/request-consultation.html",
  ],
  ["Adobe", "Log into your account", "https://account.adobe.com/"],
  ["Adobe", "About", "https://www.adobe.com/about-adobe.html"],
  ["Adobe", "Careers", "https://careers.adobe.com/"],
  ["Adobe", "Events", "https://www.adobe.com/events.html"],
  ["Adobe", "Newsroom", "https://news.adobe.com/"],
  [
    "Adobe",
    "Corporate Responsibility",
    "https://www.adobe.com/corporate-responsibility.html",
  ],
  [
    "Adobe",
    "Investor Relations",
    "https://www.adobe.com/investor-relations.html",
  ],
  ["Adobe", "Trust Center", "https://www.adobe.com/trust.html"],
  ["Adobe", "Adobe Blog", "https://blog.adobe.com/"],
  ["Adobe", "Terms", "https://www.adobe.com/legal/terms.html"],
  ["Adobe", "Privacy", "https://www.adobe.com/privacy.html"],
];

export function createHomepage(): PageDocument {
  const quote = createQuote(0);
  quote.props.imageAssetId = "home-michelle";
  quote.props.quote =
    "If it wasn't for Creative Cloud, I don't think I'd be here. I feel like I can create anything.";
  return {
    schemaVersion: 1,
    id: "adobe-homepage",
    title: "Adobe",
    locale: "en-US",
    theme: "light",
    sections: [
      ...(
        [
          "global-navigation",
          "router-marquee",
          "hub-router",
          "media-section",
        ] as const
      ).map(createHomeSection),
      {
        id: newId(),
        component: "social-proof-carousel",
        componentVersion: 1,
        items: [quote],
      },
      ...(["news-section", "product-router", "site-footer"] as const).map(
        createHomeSection,
      ),
    ],
  };
}
