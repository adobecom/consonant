import{n as e}from"./rolldown-runtime-C0FnF6B9.js";import{t}from"./lit-DRzJKe3d.js";import{n,r,t as i}from"./social-proof-carousel-BjuE7JbY.js";import{a,i as o,n as s,o as c,r as l,t as u}from"./slide-3-DfbDcc9v.js";function d(){return(d=e((()=>{r()})))()}var f,p,m,h,g,_,v;function y(){return(y=e((()=>{t(),d(),a(),l(),u(),f=[{quote:`"If it wasn't for Creative Cloud, I don't think I'd be here. I feel like I can create anything."`,attributionName:`Michelle Phan`,attributionRole:`Creator`,ctaLabel:`Learn more`,ctaHref:`#`,imageSrc:c},{quote:`"Adobe tools have transformed the way I tell stories. There's no limit to what I can imagine."`,attributionName:`Jordan Lee`,attributionRole:`Filmmaker`,ctaLabel:`Watch now`,ctaHref:`#`,imageSrc:o},{quote:`"From concept to final cut, Creative Cloud keeps everything connected. It's how I work every single day."`,attributionName:`Priya Nair`,attributionRole:`Motion Designer`,ctaLabel:`Explore`,ctaHref:`#`,imageSrc:s}],p=e=>{let t=e.querySelector(`.c-social-proof-carousel`);t&&!t.__spc&&(t.__spc=new n(t))},m={title:`Organisms/SocialProofCarousel`,tags:[`autodocs`],parameters:{layout:`fullscreen`,docs:{description:{component:`<p>Full-bleed social proof carousel. QuoteCards slide horizontally with a peek of the previous and next slides visible on either side. Left/right arrow buttons and pagination dots handle navigation. Instantiate <code>SocialProofCarouselController</code> on the <code>.c-social-proof-carousel</code> element after render.</p>`},source:{language:`html`,code:`<div class="c-social-proof-carousel" data-active="0">
  <div class="spc-track">
    <div class="spc-slide" data-state="active"><!-- QuoteCard --></div>
    <div class="spc-slide" data-state="inactive" aria-hidden="true" inert><!-- QuoteCard --></div>
    <div class="spc-slide" data-state="inactive" aria-hidden="true" inert><!-- QuoteCard --></div>
  </div>
  <div class="spc-nav spc-nav--prev">
    <button class="spc-nav__btn c-icon-button" data-style="solid" data-context="on-light" data-size="lg" type="button" aria-label="Previous slide">
      <span class="c-icon-button__icon" aria-hidden="true"><!-- arrow-left SVG --></span>
    </button>
  </div>
  <div class="spc-nav spc-nav--next">
    <button class="spc-nav__btn c-icon-button" data-style="solid" data-context="on-light" data-size="lg" type="button" aria-label="Next slide">
      <span class="c-icon-button__icon" aria-hidden="true"><!-- arrow-right SVG --></span>
    </button>
  </div>
  <div class="spc-pagination" role="group" aria-label="Slide navigation">
    <button class="spc-dot" type="button" aria-label="Slide 1" aria-pressed="true"></button>
    <button class="spc-dot" type="button" aria-label="Slide 2" aria-pressed="false"></button>
    <button class="spc-dot" type="button" aria-label="Slide 3" aria-pressed="false"></button>
  </div>
</div>`}}}},h={render:()=>i({slides:f,activeIndex:0}),play:async({canvasElement:e})=>{p(e)}},g={name:`Start on slide 2`,render:()=>i({slides:f,activeIndex:1}),play:async({canvasElement:e})=>{p(e)}},_={name:`Two slides`,render:()=>i({slides:f.slice(0,2),activeIndex:0}),play:async({canvasElement:e})=>{p(e)}},h.parameters={...h.parameters,docs:{...h.parameters?.docs,source:{originalSource:`{
  render: () => SocialProofCarousel({
    slides: SAMPLE_SLIDES,
    activeIndex: 0
  }),
  play: async ({
    canvasElement
  }) => {
    mount(canvasElement);
  }
}`,...h.parameters?.docs?.source}}},g.parameters={...g.parameters,docs:{...g.parameters?.docs,source:{originalSource:`{
  name: "Start on slide 2",
  render: () => SocialProofCarousel({
    slides: SAMPLE_SLIDES,
    activeIndex: 1
  }),
  play: async ({
    canvasElement
  }) => {
    mount(canvasElement);
  }
}`,...g.parameters?.docs?.source}}},_.parameters={..._.parameters,docs:{..._.parameters?.docs,source:{originalSource:`{
  name: "Two slides",
  render: () => SocialProofCarousel({
    slides: SAMPLE_SLIDES.slice(0, 2),
    activeIndex: 0
  }),
  play: async ({
    canvasElement
  }) => {
    mount(canvasElement);
  }
}`,..._.parameters?.docs?.source}}},v=[`Default`,`StartOnSecond`,`TwoSlides`]})))()}y();export{h as Default,g as StartOnSecond,_ as TwoSlides,v as __namedExportsOrder,m as default};