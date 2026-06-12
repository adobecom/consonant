import { html } from "lit";
import { SectionHeader } from "../section-header/section-header.js";
import { ElasticCard } from "../elastic-card/elastic-card.js";
import { Media } from "../media/media.js";
import "./hub-router.css";

const buildVideoMedia = (src) =>
  Media({ src, type: "video", autoplay: false, muted: true, loop: true, playsinline: true });

const pauseCardVideo = (e) => {
  const v = e.currentTarget.querySelector("video");
  if (v) { v.pause(); v.currentTime = 0; }
};

// Clear edge state when the mouse leaves the entire carousel.
// Listening here (not on individual listitems) breaks the CSS hover feedback
// loop: when a card snaps position the cursor may briefly leave the listitem
// but it stays within the carousel, so the edge state is preserved.
const clearEdge = (e) => e.currentTarget.removeAttribute("data-edge");

export const DEFAULT_HUB_ROUTER_CARDS = [
  {
    label: "Creativity and design",
    app: "creative-cloud",
    title: "Next-level creative",
    body: "Do it all with industry-leading apps for design, photo, video, and creative AI.",
    href: "https://www.adobe.com/creativecloud.html",
    mediaSrc: "https://www.adobe.com/upp/media_1badc9f153c69f16292c23f9752012c9ab7edb851.mp4",
  },
  {
    label: "Content creation",
    app: "firefly",
    title: "Stunning content made easy",
    body: "Quickly create and edit images, video, and audio with creative AI.",
    href: "https://www.adobe.com/products/firefly.html",
    mediaSrc: "https://www.adobe.com/upp/media_159d163e5e983109aed71b1cb4e1048b4f849ab72.mp4",
  },
  {
    label: "PDF and productivity",
    app: "acrobat",
    title: "Work done faster",
    body: "Create, edit, and share PDFs. Make edits and create presentations with AI.",
    href: "https://www.adobe.com/acrobat.html",
    mediaSrc: "https://www.adobe.com/upp/media_1928dd1a3e8e5ed6e7979b5bb37fcd4c273746e62.mp4",
  },
  {
    label: "Marketing content",
    app: "experience-cloud",
    title: "Orchestrate customer experiences",
    body: "Deliver business impact, move faster, and personalize at scale.",
    href: "https://business.adobe.com/",
    mediaSrc: "https://www.adobe.com/upp/media_14d261ad034b647cf9ec9e77e1a4e53cbbd31af35.mp4",
  },
  {
    label: "Students and teachers",
    app: "creative-cloud",
    title: "Discounts for students and teachers.",
    body: "Save a bundle on our biggest bundle of top industry creative tools.",
    href: "https://www.adobe.com/education.html",
    mediaSrc: "https://www.adobe.com/upp/media_11ef0b05657078d2235cbedc8322cd486a4d83a86.mp4",
  },
];

export const HubRouter = ({
  heading = "Everything you need to make anything.",
  body = "Whether you're a student, social influencer, creative professional, performance marketer, or global brand—Adobe has the apps you need to make it happen.",
  eyebrow,
  showEyebrow = false,
  theme = "on-light",
  cards = DEFAULT_HUB_ROUTER_CARDS,
} = {}) => html`
  <section class="c-hub-router" data-theme=${theme}>
    <div class="c-hub-router__heading">
      ${SectionHeader({ eyebrow, showEyebrow, title: heading, body, theme })}
    </div>
    <div class="c-hub-router__carousel" role="list" aria-label="Product categories"
      @mouseleave=${clearEdge}
    >
      ${cards.map((card, index) => {
        const edge = index === 0 ? "first" : index === cards.length - 1 ? "last" : null;
        return html`
          <div role="listitem"
            @mouseenter=${(e) => {
              e.currentTarget.querySelector("video")?.play();
              const carousel = e.currentTarget.parentElement;
              if (edge) carousel.dataset.edge = edge;
              else carousel.removeAttribute("data-edge");
            }}
            @mouseleave=${pauseCardVideo}
          >
            ${ElasticCard({
              ...card,
              state: "resting",
              mediaTemplate: card.mediaSrc ? buildVideoMedia(card.mediaSrc) : undefined,
            })}
          </div>
        `;
      })}
    </div>
  </section>
`;
