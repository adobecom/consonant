import{n as e}from"./rolldown-runtime-C0FnF6B9.js";import{n as t,r as n,t as r}from"./hub-router-CVmphK3N.js";function i(){return(i=e((()=>{n()})))()}function a(){return(a=e((()=>{i()})))()}var o,s,c,l,u,d,f;function p(){return(p=e((()=>{a(),{userEvent:o}=__STORYBOOK_MODULE_TEST__,s={title:`Organisms/HubRouter`,tags:[`autodocs`],render:e=>t(e),parameters:{docs:{description:{component:`**HubRouter** — Section header + flex-accordion elastic card carousel. All cards are resting by default. Hover any card to expand it; siblings contract proportionally. Maps to the “Everything you need to make anything.” section on the Adobe homepage.`},source:{language:`html`,code:`<section class="c-hub-router">
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
</section>`}},layout:`fullscreen`},argTypes:{heading:{control:`text`,description:`Section heading (title-2)`},body:{control:`text`,description:`Section subtext (body-lg)`},eyebrow:{control:`text`,description:`Optional eyebrow above heading`},showEyebrow:{control:`boolean`},theme:{control:`select`,options:[`on-light`,`on-dark`],description:`on-dark pins data-theme="dark" on the section (a surface mode); the heading and cards read theme tokens inside it`}},args:{heading:`Everything you need to make anything.`,body:`Whether you’re a student, social influencer, creative professional, performance marketer, or global brand—Adobe has the apps you need to make it happen.`,showEyebrow:!1,theme:`on-light`,cards:r}},c={play:async({canvasElement:e})=>{await new Promise(e=>setTimeout(e,1200));let t=e.querySelectorAll(`.c-elastic-card`);t[2]&&await o.hover(t[2])}},l={name:`No Media (Skeleton)`,args:{cards:r.map(({mediaSrc:e,...t})=>t)},parameters:{docs:{description:{story:`Cards without video sources show the gradient placeholder — useful for testing layout and typography in isolation.`}}}},u={name:`With Eyebrow`,args:{eyebrow:`Adobe products`,showEyebrow:!0}},d={name:`Mobile`,parameters:{viewport:{defaultViewport:`mobile1`},docs:{description:{story:`At ≤768px the accordion becomes a horizontal snap-scroll carousel (one card at a time). The 3D depth-stack from Figma is a future iteration.`}}}},c.parameters={...c.parameters,docs:{...c.parameters?.docs,source:{originalSource:`{
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
}`,...c.parameters?.docs?.source}}},l.parameters={...l.parameters,docs:{...l.parameters?.docs,source:{originalSource:`{
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
}`,...l.parameters?.docs?.source}}},u.parameters={...u.parameters,docs:{...u.parameters?.docs,source:{originalSource:`{
  name: "With Eyebrow",
  args: {
    eyebrow: "Adobe products",
    showEyebrow: true
  }
}`,...u.parameters?.docs?.source}}},d.parameters={...d.parameters,docs:{...d.parameters?.docs,source:{originalSource:`{
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
}`,...d.parameters?.docs?.source}}},f=[`Default`,`NoMedia`,`WithEyebrow`,`Mobile`]})))()}p();export{c as Default,d as Mobile,l as NoMedia,u as WithEyebrow,f as __namedExportsOrder,s as default};