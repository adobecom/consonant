import{n as e}from"./rolldown-runtime-DkW27tQK.js";import{s as t,t as n}from"./lit-UMo5x0iS.js";import{i as r,n as i,r as a,t as o}from"./elastic-card-BCp_W_Lv.js";import{n as s,t as c}from"./section-header-DtWLNJs_.js";var l,u,d,f,p;function m(){return(m=e((()=>{n(),s(),i(),r(),l=e=>a({src:e,type:`video`,autoplay:!1,muted:!0,loop:!0,playsinline:!0}),u=e=>{let t=e.currentTarget.querySelector(`video`);t&&(t.pause(),t.currentTime=0)},d=e=>e.currentTarget.removeAttribute(`data-edge`),f=[{label:`Creativity and design`,app:`creative-cloud`,title:`Next-level creative`,body:`Do it all with industry-leading apps for design, photo, video, and creative AI.`,href:`https://www.adobe.com/creativecloud.html`,mediaSrc:`https://www.adobe.com/upp/media_1badc9f153c69f16292c23f9752012c9ab7edb851.mp4`},{label:`Content creation`,app:`firefly`,title:`Stunning content made easy`,body:`Quickly create and edit images, video, and audio with creative AI.`,href:`https://www.adobe.com/products/firefly.html`,mediaSrc:`https://www.adobe.com/upp/media_159d163e5e983109aed71b1cb4e1048b4f849ab72.mp4`},{label:`PDF and productivity`,app:`acrobat`,title:`Work done faster`,body:`Create, edit, and share PDFs. Make edits and create presentations with AI.`,href:`https://www.adobe.com/acrobat.html`,mediaSrc:`https://www.adobe.com/upp/media_1928dd1a3e8e5ed6e7979b5bb37fcd4c273746e62.mp4`},{label:`Marketing content`,app:`experience-cloud`,title:`Orchestrate customer experiences`,body:`Deliver business impact, move faster, and personalize at scale.`,href:`https://business.adobe.com/`,mediaSrc:`https://www.adobe.com/upp/media_14d261ad034b647cf9ec9e77e1a4e53cbbd31af35.mp4`},{label:`Students and teachers`,app:`creative-cloud`,title:`Discounts for students and teachers.`,body:`Save a bundle on our biggest bundle of top industry creative tools.`,href:`https://www.adobe.com/education.html`,mediaSrc:`https://www.adobe.com/upp/media_11ef0b05657078d2235cbedc8322cd486a4d83a86.mp4`}],p=({heading:e=`Everything you need to make anything.`,body:n=`Whether you're a student, social influencer, creative professional, performance marketer, or global brand—Adobe has the apps you need to make it happen.`,eyebrow:r,showEyebrow:i=!1,theme:a=`on-light`,cards:s=f}={})=>t`
  <section class="c-hub-router" data-theme=${a}>
    <div class="c-hub-router__heading">
      ${c({eyebrow:r,showEyebrow:i,title:e,body:n,theme:a})}
    </div>
    <div class="c-hub-router__carousel" role="list" aria-label="Product categories"
      @mouseleave=${d}
    >
      ${s.map((e,n)=>{let r=n===0?`first`:n===s.length-1?`last`:null;return t`
          <div role="listitem"
            @mouseenter=${e=>{e.currentTarget.querySelector(`video`)?.play();let t=e.currentTarget.parentElement;r?t.dataset.edge=r:t.removeAttribute(`data-edge`)}}
            @mouseleave=${u}
          >
            ${o({...e,state:`resting`,mediaTemplate:e.mediaSrc?l(e.mediaSrc):void 0})}
          </div>
        `})}
    </div>
  </section>
`})))()}function h(){return(h=e((()=>{m()})))()}function g(){return(g=e((()=>{h()})))()}var _,v,y,b,x,S,C;function w(){return(w=e((()=>{g(),{userEvent:_}=__STORYBOOK_MODULE_TEST__,v={title:`Organisms/HubRouter`,tags:[`autodocs`],render:e=>p(e),parameters:{docs:{description:{component:`**HubRouter** — Section header + flex-accordion elastic card carousel. All cards are resting by default. Hover any card to expand it; siblings contract proportionally. Maps to the “Everything you need to make anything.” section on the Adobe homepage.`},source:{language:`html`,code:`<section class="c-hub-router" data-theme="on-light">
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
</section>`}},layout:`fullscreen`},argTypes:{heading:{control:`text`,description:`Section heading (title-2)`},body:{control:`text`,description:`Section subtext (body-lg)`},eyebrow:{control:`text`,description:`Optional eyebrow above heading`},showEyebrow:{control:`boolean`},theme:{control:`select`,options:[`on-light`,`on-dark`]}},args:{heading:`Everything you need to make anything.`,body:`Whether you’re a student, social influencer, creative professional, performance marketer, or global brand—Adobe has the apps you need to make it happen.`,showEyebrow:!1,theme:`on-light`,cards:f}},y={play:async({canvasElement:e})=>{await new Promise(e=>setTimeout(e,1200));let t=e.querySelectorAll(`.c-elastic-card`);t[2]&&await _.hover(t[2])}},b={name:`No Media (Skeleton)`,args:{cards:f.map(({mediaSrc:e,...t})=>t)},parameters:{docs:{description:{story:`Cards without video sources show the gradient placeholder — useful for testing layout and typography in isolation.`}}}},x={name:`With Eyebrow`,args:{eyebrow:`Adobe products`,showEyebrow:!0}},S={name:`Mobile`,parameters:{viewport:{defaultViewport:`mobile1`},docs:{description:{story:`At ≤768px the accordion becomes a horizontal snap-scroll carousel (one card at a time). The 3D depth-stack from Figma is a future iteration.`}}}},y.parameters={...y.parameters,docs:{...y.parameters?.docs,source:{originalSource:`{
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
}`,...y.parameters?.docs?.source}}},b.parameters={...b.parameters,docs:{...b.parameters?.docs,source:{originalSource:`{
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
}`,...b.parameters?.docs?.source}}},x.parameters={...x.parameters,docs:{...x.parameters?.docs,source:{originalSource:`{
  name: "With Eyebrow",
  args: {
    eyebrow: "Adobe products",
    showEyebrow: true
  }
}`,...x.parameters?.docs?.source}}},S.parameters={...S.parameters,docs:{...S.parameters?.docs,source:{originalSource:`{
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
}`,...S.parameters?.docs?.source}}},C=[`Default`,`NoMedia`,`WithEyebrow`,`Mobile`]})))()}w();export{y as Default,S as Mobile,b as NoMedia,x as WithEyebrow,C as __namedExportsOrder,v as default};