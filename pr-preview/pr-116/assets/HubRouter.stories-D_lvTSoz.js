import{x as b}from"./iframe-CAsuZFen.js";import{S as g}from"./section-header-eqJyZfAj.js";import{E as f,M as v}from"./elastic-card-BxxgCFLG.js";import"./preload-helper-DELpcZtk.js";import"./rich-content-COuIYFW8.js";import"./unsafe-html-CT5zK2L9.js";import"./directive-DoeGSK_T.js";import"./product-lockup-BLH6UdkP.js";import"./app-icon-u8Xw6X-2.js";import"./chevron-right-CnbUzkxe.js";import"./arrow-right-Do-kvyXB.js";const w=e=>v({src:e,type:"video",autoplay:!1,muted:!0,loop:!0,playsinline:!0}),_=e=>{const t=e.currentTarget.querySelector("video");t&&(t.pause(),t.currentTime=0)},S=e=>e.currentTarget.removeAttribute("data-edge"),n=[{label:"Creativity and design",app:"creative-cloud",title:"Next-level creative",body:"Do it all with industry-leading apps for design, photo, video, and creative AI.",href:"https://www.adobe.com/creativecloud.html",mediaSrc:"https://www.adobe.com/upp/media_1badc9f153c69f16292c23f9752012c9ab7edb851.mp4"},{label:"Content creation",app:"firefly",title:"Stunning content made easy",body:"Quickly create and edit images, video, and audio with creative AI.",href:"https://www.adobe.com/products/firefly.html",mediaSrc:"https://www.adobe.com/upp/media_159d163e5e983109aed71b1cb4e1048b4f849ab72.mp4"},{label:"PDF and productivity",app:"acrobat",title:"Work done faster",body:"Create, edit, and share PDFs. Make edits and create presentations with AI.",href:"https://www.adobe.com/acrobat.html",mediaSrc:"https://www.adobe.com/upp/media_1928dd1a3e8e5ed6e7979b5bb37fcd4c273746e62.mp4"},{label:"Marketing content",app:"experience-cloud",title:"Orchestrate customer experiences",body:"Deliver business impact, move faster, and personalize at scale.",href:"https://business.adobe.com/",mediaSrc:"https://www.adobe.com/upp/media_14d261ad034b647cf9ec9e77e1a4e53cbbd31af35.mp4"},{label:"Students and teachers",app:"creative-cloud",title:"Discounts for students and teachers.",body:"Save a bundle on our biggest bundle of top industry creative tools.",href:"https://www.adobe.com/education.html",mediaSrc:"https://www.adobe.com/upp/media_11ef0b05657078d2235cbedc8322cd486a4d83a86.mp4"}],E=({heading:e="Everything you need to make anything.",body:t="Whether you're a student, social influencer, creative professional, performance marketer, or global brand—Adobe has the apps you need to make it happen.",eyebrow:i,showEyebrow:y=!1,theme:d="on-light",cards:l=n}={})=>b`
  <section class="c-hub-router" data-theme=${d}>
    <div class="c-hub-router__heading">
      ${g({eyebrow:i,showEyebrow:y,title:e,body:t,theme:d})}
    </div>
    <div class="c-hub-router__carousel" role="list" aria-label="Product categories"
      @mouseleave=${S}
    >
      ${l.map((c,p)=>{const u=p===0?"first":p===l.length-1?"last":null;return b`
          <div role="listitem"
            @mouseenter=${m=>{m.currentTarget.querySelector("video")?.play();const h=m.currentTarget.parentElement;u?h.dataset.edge=u:h.removeAttribute("data-edge")}}
            @mouseleave=${_}
          >
            ${f({...c,state:"resting",mediaTemplate:c.mediaSrc?w(c.mediaSrc):void 0})}
          </div>
        `})}
    </div>
  </section>
`,{userEvent:k}=__STORYBOOK_MODULE_TEST__,U={title:"Organisms/HubRouter",tags:["autodocs"],render:e=>E(e),parameters:{docs:{description:{component:"**HubRouter** — Section header + flex-accordion elastic card carousel. All cards are resting by default. Hover any card to expand it; siblings contract proportionally. Maps to the “Everything you need to make anything.” section on the Adobe homepage."},source:{language:"html",code:`<section class="c-hub-router" data-theme="on-light">
  <div class="c-hub-router__heading">
    <section class="c-section-header">
      <div class="c-rich-content" data-density="tight" data-justify="center" data-measure="wide">
        <h2 class="c-rich-content__title">Everything you need to make anything.</h2>
        <p class="c-rich-content__body">…</p>
      </div>
    </section>
  </div>
  <ul class="c-hub-router__carousel" role="list" aria-label="Product categories">
    <li role="listitem">
      <article class="c-elastic-card" data-state="resting" data-media-aspect="3:4">
        <header class="c-elastic-card__header">
          <div class="c-product-lockup" data-orientation="horizontal" data-style="label">…</div>
        </header>
        <div class="c-elastic-card__media">…</div>
        <div class="c-elastic-card__body">
          <p class="c-elastic-card__title">Card title</p>
          <p class="c-elastic-card__body-text">Card description.</p>
        </div>
      </article>
    </li>
    <!-- × 5 cards -->
  </ul>
</section>`}},layout:"fullscreen"},argTypes:{heading:{control:"text",description:"Section heading (title-2)"},body:{control:"text",description:"Section subtext (body-lg)"},eyebrow:{control:"text",description:"Optional eyebrow above heading"},showEyebrow:{control:"boolean"},theme:{control:"select",options:["on-light","on-dark"]}},args:{heading:"Everything you need to make anything.",body:"Whether you’re a student, social influencer, creative professional, performance marketer, or global brand—Adobe has the apps you need to make it happen.",showEyebrow:!1,theme:"on-light",cards:n}},a={play:async({canvasElement:e})=>{await new Promise(i=>setTimeout(i,1200));const t=e.querySelectorAll(".c-elastic-card");t[2]&&await k.hover(t[2])}},o={name:"No Media (Skeleton)",args:{cards:n.map(({mediaSrc:e,...t})=>t)},parameters:{docs:{description:{story:"Cards without video sources show the gradient placeholder — useful for testing layout and typography in isolation."}}}},r={name:"With Eyebrow",args:{eyebrow:"Adobe products",showEyebrow:!0}},s={name:"Mobile",parameters:{viewport:{defaultViewport:"mobile1"},docs:{description:{story:"At ≤768px the accordion becomes a horizontal snap-scroll carousel (one card at a time). The 3D depth-stack from Figma is a future iteration."}}}};a.parameters={...a.parameters,docs:{...a.parameters?.docs,source:{originalSource:`{
  play: async ({
    canvasElement
  }) => {
    // Brief pause so videos and layout settle before the demo hover fires
    await new Promise(r => setTimeout(r, 1200));
    // Target the center card by looking for the PDF card's elastic card element
    const cards = canvasElement.querySelectorAll(".c-elastic-card");
    // Hover the 3rd card (index 2 — PDF and productivity, center position)
    if (cards[2]) await userEvent.hover(cards[2]);
  }
}`,...a.parameters?.docs?.source}}};o.parameters={...o.parameters,docs:{...o.parameters?.docs,source:{originalSource:`{
  name: "No Media (Skeleton)",
  args: {
    cards: DEFAULT_HUB_ROUTER_CARDS.map(({
      mediaSrc: _m,
      ...card
    }) => card)
  },
  parameters: {
    docs: {
      description: {
        story: "Cards without video sources show the gradient placeholder — useful for testing layout and typography in isolation."
      }
    }
  }
}`,...o.parameters?.docs?.source}}};r.parameters={...r.parameters,docs:{...r.parameters?.docs,source:{originalSource:`{
  name: "With Eyebrow",
  args: {
    eyebrow: "Adobe products",
    showEyebrow: true
  }
}`,...r.parameters?.docs?.source}}};s.parameters={...s.parameters,docs:{...s.parameters?.docs,source:{originalSource:`{
  name: "Mobile",
  parameters: {
    viewport: {
      defaultViewport: "mobile1"
    },
    docs: {
      description: {
        story: "At ≤768px the accordion becomes a horizontal snap-scroll carousel (one card at a time). The 3D depth-stack from Figma is a future iteration."
      }
    }
  }
}`,...s.parameters?.docs?.source}}};const W=["Default","NoMedia","WithEyebrow","Mobile"];export{a as Default,s as Mobile,o as NoMedia,r as WithEyebrow,W as __namedExportsOrder,U as default};
