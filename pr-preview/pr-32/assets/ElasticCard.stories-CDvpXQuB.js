import{E as o,x as t}from"./iframe-Dmq61beB.js";import{P as Y}from"./product-lockup-CEe1EX8h.js";import{I as J}from"./icon-button-hce9pjYY.js";import{t as S,I as j,s as F,o as G}from"./define-element-BK7BFVPj.js";import"./preload-helper-BbL0o52_.js";import"./app-icon-DIRXDc7w.js";const Q=new Set(["16:9","4:3","1:1","3:2","3:4","21:9"]),ee=new Set(["xs","sm","md","lg","xl","full"]),ae=new Set(["cover","contain","fill","none","scale-down"]),te=new Set(["center","top","bottom","left","right","top-left","top-right","bottom-left","bottom-right"]),y=(e,n,a)=>n.has(e)?e:a,ne=({src:e,alt:n,lazy:a,decoding:i="async",objectPosition:s})=>t`
  <img
    src=${e??""}
    alt=${n??""}
    loading=${a?"lazy":"eager"}
    decoding=${i}
    style=${s?`object-position: ${s};`:o}
  />
`,oe=({src:e,poster:n,autoplay:a,muted:i,loop:s,controls:m,playsinline:d,sources:l})=>t`
  <video
    src=${e??o}
    poster=${n??o}
    ?autoplay=${a}
    ?muted=${i}
    ?loop=${s}
    ?playsinline=${d}
    ?controls=${m}
    preload="metadata"
  >
    ${Array.isArray(l)?l.map(c=>t`<source src=${c.src} type=${c.type??o} media=${c.media??o} />`):o}
  </video>
`,P=t`<span class="c-media__overlay" aria-hidden="true"></span>`,q=({src:e,alt:n="",aspectRatio:a="3:4",size:i="full",objectFit:s="cover",objectPosition:m="center",type:d="image",lazy:l=!0,poster:c,autoplay:A=!1,muted:u=!0,loop:M=!0,controls:x=!1,playsinline:E=!0,overlay:p=P,sources:I,mediaTemplate:f}={})=>{const b=y(a,Q,"3:4"),g=y(i,ee,"full"),T=y(s,ae,"cover"),r=y(m,te,"center"),h=p===!1?o:p??P,v=f||(d==="video"?oe({src:e,poster:c,autoplay:A,muted:u,loop:M,controls:x,playsinline:E,sources:I}):ne({src:e,alt:n,lazy:l,objectPosition:r}));return t`
    <figure
      class="c-media"
      data-aspect=${b}
      data-size=${g}
      data-fit=${T}
      data-position=${r}
    >
      ${v}
      ${h}
    </figure>
  `},ie=new Set(["resting","expanded","mobile"]),re=new Set(["3:4","4:3","16:9","1:1"]),se=()=>t`
  <svg width="6" height="10" viewBox="0 0 6 10" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <path d="M1 1 5 5 1 9" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
  </svg>
`,R=()=>t`
  <span class="c-elastic-card__action c-elastic-card__action--button" aria-hidden="true">
    <svg width="10" height="10" viewBox="0 0 10 10" xmlns="http://www.w3.org/2000/svg">
      <path transform="translate(1.926, 0.076)" d="M1.166 9.848C0.852 9.848 0.558 9.725 0.336 9.501C0.117 9.279-0.002 8.985 0 8.673C0.002 8.362 0.125 8.07 0.347 7.852L3.323 4.912L0.371 1.997C0.15 1.778 0.026 1.486 0.024 1.174C0.022 0.863 0.142 0.569 0.361 0.347C0.582 0.124 0.876 0 1.191 0C1.5 0 1.791 0.12 2.011 0.337L5.802 4.082C6.032 4.315 6.152 4.609 6.149 4.92C6.147 5.232 6.024 5.524 5.802 5.742L1.987 9.512C1.767 9.728 1.475 9.848 1.166 9.848Z" fill="currentColor"/>
    </svg>
  </span>
`,ce=(e,n,a)=>e||(n?"a":typeof a=="function"?"button":"article"),V=(e,n,a)=>n.has(e)?e:a,L=({label:e="Creativity and design",app:n="experience-cloud",product:a={},title:i="Card title",body:s="Card description goes here and can wrap to multiple lines.",state:m="resting",mediaSrc:d,mediaAlt:l="",mediaTemplate:c,mediaAspect:A="3:4",mediaOverlay:u=!0,bodyTemplate:M,children:x,showCaret:E,actionTemplate:p,actionLabel:I,href:f,ariaLabel:b,onClick:g,tag:T}={})=>{const r=V(m,ie,"resting"),h=V(A,re,"3:4"),v=ce(T,f,g),W=r==="resting"?"on-light":"on-dark",X={width:r==="resting"?a.width??"hug":"fill",showIconEnd:a.showIconEnd??!1,context:a.context??W,orientation:a.orientation??"horizontal",styleVariant:a.styleVariant??a.style??"label",...a,label:a.label??e,app:a.app??n},O=p!=null,Z=O?t`<span class="c-elastic-card__action" aria-label=${I??o}>${p}</span>`:r==="mobile"?R():E??!1?t`<span class="c-elastic-card__action c-elastic-card__action--caret" aria-hidden="true">
            ${se()}
          </span>`:o,D=O?o:r==="mobile"?o:R(),H=u===!1?!1:u===!0?void 0:u,K=d?void 0:t`<span class="c-elastic-card__media-placeholder" aria-hidden="true"></span>`,N=c??q({src:d,alt:l,aspectRatio:h,overlay:H,mediaTemplate:K}),U=M??t`
    <p class="c-elastic-card__title">${i}</p>
    ${s?t`<p class="c-elastic-card__body-text">${s}</p>`:o}
    ${x?t`<div class="c-elastic-card__extra">${x}</div>`:o}
  `,B=t`
    <div class="c-elastic-card__header">
      ${Y(X)}
      ${Z}
    </div>
    <div class="c-elastic-card__media">${N}</div>
    <div class="c-elastic-card__body">
      <div class="c-elastic-card__body-content">
        ${U}
      </div>
      ${D?t`<div class="c-elastic-card__body-action">${D}</div>`:o}
    </div>
  `;return v==="a"?t`
      <a
        class="c-elastic-card"
        data-state=${r}
        data-media-aspect=${h}
        href=${f??o}
        aria-label=${b??o}
        @click=${g??o}
      >${B}</a>
    `:v==="button"?t`
      <button
        class="c-elastic-card"
        data-state=${r}
        data-media-aspect=${h}
        aria-label=${b??o}
        @click=${g??o}
        type="button"
      >${B}</button>
    `:t`
    <article
      class="c-elastic-card"
      data-state=${r}
      data-media-aspect=${h}
      aria-label=${b??o}
      @click=${g??o}
    >${B}</article>
  `},de=`/* ElasticCard — implements .ElasticCard (Figma node 4006:461133)
 *
 * Structure (three zones, all full-width; media is full-bleed with border-radius-md in resting):
 *   .c-elastic-card__header   → horizontal: ProductLockup + action icon
 *   .c-elastic-card__media    → full-bleed image (fills remaining height)
 *   .c-elastic-card__body     → padding all sides; vertical (resting) or horizontal (expanded/mobile)
 *
 * Sizing tokens come from the responsive CSS pipeline:
 *   tokens.responsive.lg.css  → --s2a-elastic-card-width-resting: 294px / height-max: 576px / padding: 24px
 *   tokens.responsive.md.css  → --s2a-elastic-card-width-resting: 243px / height-max: 510px / padding: 16px
 */

/* ─── Root ─────────────────────────────────────────────────────────────────── */
.c-elastic-card {
  display: flex;
  flex-direction: column;
  overflow: hidden;

  /* Dimensions from responsive token pipeline */
  inline-size: var(--s2a-elastic-card-width-resting, 294px);
  block-size: var(--s2a-elastic-card-height-max, 576px);

  /* Style */
  border-radius: var(--s2a-border-radius-md, 16px);
  background-color: var(--s2a-color-background-default);
  color: var(--s2a-color-content-default);
  text-decoration: none;
  font: inherit;
  font-family: var(--s2a-font-family-default, "Adobe Clean");
  text-align: left;
  cursor: default;

  /* Reset browser defaults for <button> and <a> */
  appearance: none;
  border: none;
  padding: 0;

  transition:
    inline-size 220ms ease,
    background-color 200ms ease,
    color 200ms ease;
}

.c-elastic-card:is(a, button) {
  cursor: pointer;
}

/* ─── Hover state — resting card expands to inverse (same visuals as expanded state) ── */
.c-elastic-card[data-state="resting"]:hover {
  inline-size: var(--s2a-elastic-card-width-expanded, 496px);
  background-color: var(--s2a-color-background-inverse);
  color: var(--s2a-color-content-knockout);
}

.c-elastic-card[data-state="resting"]:hover .c-elastic-card__body {
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
}

.c-elastic-card[data-state="resting"]:hover .c-elastic-card__body-content {
  gap: var(--s2a-spacing-2xs, 4px);
}

.c-elastic-card[data-state="resting"]:hover .c-elastic-card__body-action {
  display: flex;
}

/* ProductLockup sets its own color explicitly — override it on hover */
.c-elastic-card[data-state="resting"]:hover .c-product-lockup {
  color: var(--s2a-color-content-knockout, #ffffff);
}

.c-elastic-card:focus-visible {
  outline: 2px solid var(--s2a-color-focus-ring-default, #1473e6);
  outline-offset: 2px;
}

/* ─── Header zone ──────────────────────────────────────────────────────────── */
/* Horizontal: ProductLockup on the left, action icon on the right.
   Padding: responsive (24px desktop / 16px tablet-down) via --s2a-elastic-card-padding.
   Gap: s2a/spacing/md = 16px (fixed across breakpoints). */
.c-elastic-card__header {
  display: flex;
  align-items: center;
  justify-content: space-between;

  padding: var(--s2a-elastic-card-padding, 24px);
  flex-shrink: 0;
}

/* ─── Action ───────────────────────────────────────────────────────────────── */
.c-elastic-card__action {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  color: inherit;
}

.c-elastic-card__action--caret {
  border-radius: 999px;
  padding: var(--s2a-spacing-2xs, 4px);
}

.c-elastic-card__action--caret svg {
  display: block;
  inline-size: 6px;
  block-size: 10px;
}

/* CTA puck — white 24×24 pill (blur/md = 32px), dark chevron inside */
.c-elastic-card__action--button {
  width: 24px;
  height: 24px;
  padding: 0;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background-color: var(--s2a-color-content-knockout, #ffffff);
  color: var(--s2a-color-content-default, #050505);
  border-radius: var(--s2a-blur-md, 32px);
  flex-shrink: 0;
}

.c-elastic-card__action--button svg {
  display: block;
  inline-size: 10px;
  block-size: 10px;
}

/* ─── Media zone — full bleed ──────────────────────────────────────────────── */
/* flex: 1 1 0 fills all remaining height.
   Block container (not flex) so <figure> is block-level and naturally full-width.
   height: 100% on inner .c-media fills the zone height. */
.c-elastic-card__media {
  flex: 1 1 0;
  min-block-size: 0;
  overflow: hidden;
}

/* Block-level figure fills zone naturally — no margin, no aspect-ratio constraint. */
.c-elastic-card__media .c-media {
  display: block;
  width: 100%;
  height: 100%;
  margin: 0;
  border-radius: var(--s2a-border-radius-md, 16px);
  aspect-ratio: unset;
}



/* Mobile: 4px inline inset + border-radius-12 primitive (12px) */
.c-elastic-card[data-state="mobile"] .c-elastic-card__media {
  padding-inline: var(--s2a-spacing-2xs, 4px);
}

.c-elastic-card[data-state="mobile"] .c-elastic-card__media .c-media {
  border-radius: var(--s2a-border-radius-12, 12px);
}

/* Mobile: match Figma image treatment — 169% height, -9% top offset (from design node 4274:30919) */
.c-elastic-card[data-state="mobile"] .c-elastic-card__media .c-media img,
.c-elastic-card[data-state="mobile"] .c-elastic-card__media .c-media picture > img {
  position: absolute;
  width: 100%;
  height: 169.06%;
  top: -8.96%;
  left: 0;
  object-fit: cover;
  object-position: center;
}

.c-elastic-card__media-placeholder {
  display: block;
  width: 100%;
  height: 100%;
  background: linear-gradient(
    135deg,
    var(--s2a-color-background-subtle, #f5f5f5),
    var(--s2a-color-border-subtle, #e0e0e0)
  );
}

/* ─── Body zone ────────────────────────────────────────────────────────────── */
/* Padding all four sides from --s2a-elastic-card-padding (responsive).
   Default direction: vertical (resting state).
   Gap between card-title and card-body: 2px (s2a/spacing/3xs). */
.c-elastic-card__body {
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: var(--s2a-elastic-card-padding, 24px);
  flex-shrink: 0;
}

.c-elastic-card__body-content {
  display: flex;
  flex-direction: column;
  gap: var(--s2a-spacing-3xs, 2px);
  flex: 1 1 auto;
  min-inline-size: 0;
}

.c-elastic-card__body-action {
  display: none;
  flex-shrink: 0;
  align-items: center;
}

/* ─── Body text ─────────────────────────────────────────────────────────────── */
.c-elastic-card__title {
  margin: 0;
  font-family: var(--s2a-font-family-eyebrow, "Adobe Clean");
  font-size: var(--s2a-typography-font-size-eyebrow, 16px);
  line-height: var(--s2a-typography-line-height-eyebrow, 20px);
  font-weight: var(--s2a-font-weight-adobe-clean-bold, 700);
  letter-spacing: var(--s2a-typography-letter-spacing-eyebrow, -0.16px);
  color: var(--s2a-color-content-default, #050505);
}

.c-elastic-card__body-text {
  margin: 0;
  font-family: var(--s2a-font-family-body, "Adobe Clean");
  font-size: var(--s2a-typography-font-size-body-md, 16px);
  line-height: var(--s2a-typography-line-height-body-md, 20px);
  font-weight: var(--s2a-font-weight-adobe-clean, 400);
  letter-spacing: var(--s2a-font-letter-spacing-7xl, 0.16px);
  color: var(--s2a-color-content-subtle, rgba(0, 0, 0, 0.64));
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* Expanded / mobile: knockout colors (dark surface) */
.c-elastic-card[data-state="expanded"] .c-elastic-card__title,
.c-elastic-card[data-state="mobile"] .c-elastic-card__title {
  color: var(--s2a-color-content-knockout, #ffffff);
}

.c-elastic-card[data-state="expanded"] .c-elastic-card__body-text,
.c-elastic-card[data-state="mobile"] .c-elastic-card__body-text {
  color: var(--s2a-color-transparent-white-64, rgba(255, 255, 255, 0.64));
}

/* Hover on resting: knockout colors (dark surface) */
.c-elastic-card[data-state="resting"]:hover .c-elastic-card__title {
  color: var(--s2a-color-content-knockout, #ffffff);
}

.c-elastic-card[data-state="resting"]:hover .c-elastic-card__body-text {
  color: var(--s2a-color-transparent-white-64, rgba(255, 255, 255, 0.64));
}

/* ─── State: expanded ──────────────────────────────────────────────────────── */
/* Wider card, dark background (s2a/color/background/inverse),
   bottom zone switches to horizontal layout (text-content left, CTA puck right). */
.c-elastic-card[data-state="expanded"] {
  inline-size: var(--s2a-elastic-card-width-expanded, 496px);
  background-color: var(--s2a-color-background-inverse);
  color: var(--s2a-color-content-knockout);
}

/* Body becomes horizontal: text-content on left, CTA puck on right */
.c-elastic-card[data-state="expanded"] .c-elastic-card__body {
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
}

/* Expanded text-content gap is 4px (s2a/spacing/2xs) vs 2px for resting */
.c-elastic-card[data-state="expanded"] .c-elastic-card__body-content {
  gap: var(--s2a-spacing-2xs, 4px);
}

.c-elastic-card[data-state="expanded"] .c-elastic-card__body-action {
  display: flex;
}

/* Resting caret disappears on the expanded state */
.c-elastic-card[data-state="expanded"] .c-elastic-card__action--caret {
  display: none;
}

/* ─── State: mobile ────────────────────────────────────────────────────────── */
/* Fixed 360px width. Dark background. CTA puck is in the header.
   Body is horizontal layout (mirrors expanded pattern but CTA is in header). */
.c-elastic-card[data-state="mobile"] {
  inline-size: min(360px, 100%);
  block-size: 464px;
  background-color: var(--s2a-color-background-inverse);
  color: var(--s2a-color-content-knockout);
}

.c-elastic-card[data-state="mobile"] .c-elastic-card__body {
  flex-direction: row;
  align-items: center;
}

.c-elastic-card[data-state="mobile"] .c-elastic-card__body-content {
  gap: var(--s2a-spacing-2xs, 4px);
}

/* ─── Resting: scrim overlay hidden, reveals on interaction ────────────────── */
.c-elastic-card[data-state="resting"] .c-media__overlay {
  opacity: 0;
  transition: opacity 200ms ease;
}

.c-elastic-card[data-state="resting"]:is(:hover, :focus-visible)
  .c-media__overlay {
  opacity: 1;
}
`,le=({width:e=24,height:n=24,hidden:a=!1,title:i="More"}={})=>S`<svg
    xmlns="http://www.w3.org/2000/svg"
    width="${e}"
    height="${n}"
    viewBox="0 0 20 20"
    aria-hidden=${a?"true":"false"}
    role="img"
    fill="currentColor"
    aria-label="${i}"
  >
    <circle cx="10" cy="10.02114" r="1.5" fill="currentColor" />
    <path
      d="m10,8.5c-.82843,0-1.5.67157-1.5,1.5s.67157,1.5,1.5,1.5,1.5-.67157,1.5-1.5-.67157-1.5-1.5-1.5Z"
      fill="currentColor"
    />
    <circle cx="4" cy="10.02114" r="1.5" fill="currentColor" />
    <circle cx="4" cy="10" r="1.5" fill="currentColor" />
    <circle cx="16" cy="10.02114" r="1.5" fill="currentColor" />
    <circle cx="16" cy="10" r="1.5" fill="currentColor" />
  </svg>`,pe=({width:e=24,height:n=24,hidden:a=!1,title:i="More"}={})=>S`<svg
    xmlns="http://www.w3.org/2000/svg"
    width="${e}"
    height="${n}"
    viewBox="0 0 36 36"
    aria-hidden=${a?"true":"false"}
    role="img"
    fill="currentColor"
    aria-label="${i}"
  >
    <circle cx="17.8" cy="18.2" r="3.4" />
    <circle cx="29.5" cy="18.2" r="3.4" />
    <circle cx="6.1" cy="18.2" r="3.4" />
  </svg>`;class ge extends j{render(){return F(t),this.spectrumVersion===2?le({hidden:!this.label,title:this.label}):pe({hidden:!this.label,title:this.label})}}G("sp-icon-more",ge);const he=({width:e=24,height:n=24,hidden:a=!1,title:i="Chevron Right"}={})=>S`<svg
    xmlns="http://www.w3.org/2000/svg"
    width="${e}"
    height="${n}"
    viewBox="0 0 20 20"
    aria-hidden=${a?"true":"false"}
    role="img"
    fill="currentColor"
    aria-label="${i}"
  >
    <path
      d="m7.75,16.46484c-.1875,0-.37402-.06934-.51953-.20996-.29883-.28711-.30859-.76172-.02051-1.05957l4.99902-5.19727-4.98633-5.18359c-.28809-.29785-.27832-.77246.02051-1.05957.2959-.28711.77344-.2793,1.05957.02051l5.4873,5.70312c.28027.29004.28027.74902,0,1.03906l-5.5,5.7168c-.14648.15332-.34375.23047-.54004.23047Z"
      fill="currentColor"
    />
  </svg>`,me=({width:e=24,height:n=24,hidden:a=!1,title:i="Chevron Right"}={})=>S`<svg
    xmlns="http://www.w3.org/2000/svg"
    height="${n}"
    viewBox="0 0 36 36"
    width="${e}"
    aria-hidden=${a?"true":"false"}
    role="img"
    fill="currentColor"
    aria-label="${i}"
  >
    <path
      d="M24 18a1.988 1.988 0 0 1-.585 1.409l-7.983 7.98a2 2 0 1 1-2.871-2.772l.049-.049L19.181 18l-6.572-6.57a2 2 0 0 1 2.773-2.87l.049.049 7.983 7.98A1.988 1.988 0 0 1 24 18Z"
    />
  </svg>`;class ue extends j{render(){return F(t),this.spectrumVersion===2?he({hidden:!this.label,title:this.label}):me({hidden:!this.label,title:this.label})}}G("sp-icon-chevron-right",ue);const{fn:fe}=__STORYBOOK_MODULE_TEST__,be="https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=80",xe="https://www.figma.com/api/mcp/asset/10228c1c-8d4f-42dc-93df-6ed860f219d1",ve=t`<sp-icon-more aria-hidden="true" style="width:16px;height:16px"></sp-icon-more>`,ye=(e="expanded")=>J({ariaLabel:"Open router context",icon:ve,size:"md",background:"outlined",context:e==="resting"?"on-light":"on-dark"}),Ae={title:"Components/ElasticCard",tags:["autodocs"],render:e=>L(e),parameters:{docs:{description:{component:`
<style>
.doc-pattern { border: 1px solid rgba(0,0,0,0.08); border-radius: 16px; margin: 12px 0; background: linear-gradient(180deg, rgba(255,255,255,0.96), rgba(248,248,248,0.9)); }
.doc-collapse summary { list-style: none; cursor: pointer; padding: 18px 24px; font-size: 15px; font-weight: 700; display: flex; align-items: center; justify-content: space-between; }
.doc-collapse summary::-webkit-details-marker { display: none; }
.doc-collapse summary span { color: #555; font-size: 13px; font-weight: 600; }
.doc-collapse[open] summary { border-bottom: 1px solid rgba(0,0,0,0.08); }
.doc-body { padding: 20px 24px 24px; }
.doc-body p { margin: 0 0 12px; font-size: 14px; color: #333; }
.doc-body code { font-weight: 600; }
</style>
<p>Media-forward tile used in Router hero carousels. Mirrors matt-atoms component set (<a href="https://www.figma.com/design/svi0B0G925V2XG0yX0DDaz/matt-atoms?node-id=4006-461133" target="_blank" rel="noreferrer">node 4006-461133</a>).</p>

<details class="doc-pattern doc-collapse">
  <summary>Preferred · Data-attribute markup <span>Recommended</span></summary>
  <div class="doc-body">
    <p>Map <code>State</code>, media ratio, and copy treatments with <code>data-state</code>, <code>data-media-aspect</code>, and the data attributes on <code>.c-media</code> + <code>.c-rich-content</code>. The card itself can be a <code>&lt;button&gt;</code>, <code>&lt;a&gt;</code>, or <code>&lt;article&gt;</code> depending on routing semantics.</p>

\`\`\`html
<article class="c-elastic-card" data-state="resting" data-media-aspect="3:4">
  <header class="c-elastic-card__header">
    <span class="c-product-lockup" data-orientation="horizontal" data-style="label" data-context="on-light" data-width="fill">
      <span class="c-product-lockup__icon" aria-hidden="true">…</span>
      <span class="c-product-lockup__label">Creativity and design</span>
    </span>
    <span class="c-elastic-card__action c-elastic-card__action--caret" aria-hidden="true">
      <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M4 3 7 6l-3 3" stroke="currentColor" stroke-width="1.25" stroke-linecap="round" stroke-linejoin="round" />
      </svg>
    </span>
  </header>
  <div class="c-elastic-card__media">
    <figure class="c-media" data-aspect="3:4" data-fit="cover" data-position="center">
      <img src="https://images.unsplash.com/photo-1500530855697-b586d89ba3ee" alt="" loading="lazy" decoding="async" />
      <span class="c-media__overlay" aria-hidden="true"></span>
    </figure>
  </div>
  <div class="c-elastic-card__body">
    <div class="c-elastic-card__body-content">
      <p class="c-elastic-card__title">Adobe Express</p>
      <p class="c-elastic-card__body-text">Create standout content with quick actions and guided templates.</p>
    </div>
  </div>
</article>
\`\`\`
  </div>
</details>

<details class="doc-pattern doc-collapse">
  <summary>Alternative · Utility / BEM classes <span>Class-based</span></summary>
  <div class="doc-body">
    <p>When data attributes aren't available, alias the same variant axes with modifier classes.</p>

\`\`\`html
<a class="c-elastic-card c-elastic-card--expanded c-elastic-card--aspect-16x9" href="#">
  …
</a>
\`\`\`

\`\`\`css
.c-elastic-card--expanded { background-color: var(--s2a-color-background-knockout); color: var(--s2a-color-content-knockout); }
.c-elastic-card--aspect-16x9 .c-media { aspect-ratio: 16 / 9; }
\`\`\`
  </div>
</details>

<details class="doc-pattern doc-collapse">
  <summary>Full CSS reference <span>Source of truth</span></summary>
  <div class="doc-body">
\`\`\`css
${de}
\`\`\`
  </div>
</details>
        `}}},argTypes:{label:{control:"text",description:"Product Lockup label"},app:{control:"text",description:"App slug passed to ProductLockup"},title:{control:"text",description:"Card title — styled as eyebrow (s2a/typography/eyebrow)"},body:{control:"text",description:"Body copy — styled as body-md (s2a/typography/body-md)"},state:{control:{type:"select"},options:["resting","expanded","mobile"],description:"Matches the Figma State property (node 4006-461133)"},mediaSrc:{control:"text",description:"Image URL — fills the card full-bleed"},mediaAspect:{control:{type:"select"},options:["3:4","4:3","16:9","1:1"],description:"Aspect ratio token applied to the Media component"},mediaOverlay:{control:"boolean",description:"Toggle the scrim gradient overlay"},showCaret:{control:"boolean",description:"Toggle the caret icon in the header"},href:{control:"text",description:"Makes the card an <a> element"},ariaLabel:{control:"text",description:"Accessible label for link/button semantics"},onClick:{action:"clicked"}},args:{label:"Creativity and design",app:"creative-cloud",title:"Adobe Express",body:"Create standout content with quick actions and guided templates.",state:"resting",mediaSrc:be,mediaAspect:"3:4",mediaOverlay:!0,onClick:fe()}},w={},_={args:{state:"expanded",title:"Photoshop + Lightroom",body:"Pro photography tools and new Firefly-powered workflows across surfaces.",showCaret:!1}},k={render:e=>L({...e,mediaTemplate:q({src:xe,alt:"",aspectRatio:"3:4",overlay:!1})}),args:{state:"mobile",label:"Creativity and design",app:"creative-cloud",title:"Create at the highest level.",body:"Do it all with industry-leading apps for design, photo, video, and creative AI.",showCaret:!1},parameters:{figma:{fileKey:"svi0B0G925V2XG0yX0DDaz",nodeId:"4274:30919"}}},C={args:{state:"expanded",showCaret:!1,actionTemplate:ye("expanded"),actionLabel:"Open router context"}},$={render:e=>L({...e,state:"expanded",showCaret:!1,mediaTemplate:t`
        <picture>
          <source srcset="https://images.unsplash.com/photo-1470246973918-29a93221c455?auto=format&fit=crop&w=1600&q=80" media="(min-width: 600px)" />
          <img src="https://images.unsplash.com/photo-1470104240373-bc1812eddc9f?auto=format&fit=crop&w=900&q=80" alt="Abstract gradients" loading="lazy" decoding="async" />
        </picture>
      `,mediaOverlay:!0})},z={args:{state:"resting",mediaOverlay:!0}};w.parameters={...w.parameters,docs:{...w.parameters?.docs,source:{originalSource:"{}",...w.parameters?.docs?.source}}};_.parameters={..._.parameters,docs:{..._.parameters?.docs,source:{originalSource:`{
  args: {
    state: "expanded",
    title: "Photoshop + Lightroom",
    body: "Pro photography tools and new Firefly-powered workflows across surfaces.",
    showCaret: false
  }
}`,..._.parameters?.docs?.source}}};k.parameters={...k.parameters,docs:{...k.parameters?.docs,source:{originalSource:`{
  render: args => ElasticCard({
    ...args,
    mediaTemplate: Media({
      src: MEDIA_MOBILE,
      alt: "",
      aspectRatio: "3:4",
      overlay: false
    })
  }),
  args: {
    state: "mobile",
    label: "Creativity and design",
    app: "creative-cloud",
    title: "Create at the highest level.",
    body: "Do it all with industry-leading apps for design, photo, video, and creative AI.",
    showCaret: false
  },
  parameters: {
    figma: {
      fileKey: "svi0B0G925V2XG0yX0DDaz",
      nodeId: "4274:30919"
    }
  }
}`,...k.parameters?.docs?.source}}};C.parameters={...C.parameters,docs:{...C.parameters?.docs,source:{originalSource:`{
  args: {
    state: "expanded",
    showCaret: false,
    actionTemplate: elasticCardWithAction("expanded"),
    actionLabel: "Open router context"
  }
}`,...C.parameters?.docs?.source}}};$.parameters={...$.parameters,docs:{...$.parameters?.docs,source:{originalSource:`{
  render: args => ElasticCard({
    ...args,
    state: "expanded",
    showCaret: false,
    mediaTemplate: html\`
        <picture>
          <source srcset="https://images.unsplash.com/photo-1470246973918-29a93221c455?auto=format&fit=crop&w=1600&q=80" media="(min-width: 600px)" />
          <img src="https://images.unsplash.com/photo-1470104240373-bc1812eddc9f?auto=format&fit=crop&w=900&q=80" alt="Abstract gradients" loading="lazy" decoding="async" />
        </picture>
      \`,
    mediaOverlay: true
  })
}`,...$.parameters?.docs?.source}}};z.parameters={...z.parameters,docs:{...z.parameters?.docs,source:{originalSource:`{
  args: {
    state: "resting",
    mediaOverlay: true
  }
}`,...z.parameters?.docs?.source}}};const Me=["Resting","Expanded","Mobile","WithActionButton","CustomMediaSlot","OverlayScrim"];export{$ as CustomMediaSlot,_ as Expanded,k as Mobile,z as OverlayScrim,w as Resting,C as WithActionButton,Me as __namedExportsOrder,Ae as default};
