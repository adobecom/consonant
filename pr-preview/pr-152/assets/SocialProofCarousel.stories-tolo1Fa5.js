import{n as e}from"./rolldown-runtime-DkW27tQK.js";import{s as t,t as n}from"./lit-UMo5x0iS.js";import{n as r,t as i}from"./icon-button-zPVaV7eM.js";import{a,c as o,i as s,n as c,o as l,r as u,s as d,t as f}from"./slide-3-BTxhcAVz.js";var p,m,h,g,_,v,y;function b(){return(b=e((()=>{n(),o(),r(),p=({slides:e=[],activeIndex:n=0}={})=>t`
  <div class="c-social-proof-carousel" data-active=${n}>
    <div class="spc-track">
      ${e.map((e,r)=>t`
          <div
            class="spc-slide"
            data-state=${r===n?`active`:`inactive`}
            aria-hidden=${r===n?`false`:`true`}
            ?inert=${r!==n}
          >
            ${d(e)}
          </div>
        `)}
    </div>

    <div class="spc-nav spc-nav--prev">
      ${i({icon:`arrow-left`,style:`knockout`,size:`lg`,ariaLabel:`Previous slide`})}
    </div>

    <div class="spc-nav spc-nav--next">
      ${i({icon:`arrow-right`,style:`knockout`,size:`lg`,ariaLabel:`Next slide`})}
    </div>

    <div class="spc-pagination" role="tablist" aria-label="Slide navigation">
      ${e.map((e,r)=>t`
          <button
            class="spc-dot"
            role="tab"
            type="button"
            aria-label="Slide ${r+1}"
            aria-selected=${r===n?`true`:`false`}
          ></button>
        `)}
    </div>
  </div>
`,m=500,h=`cubic-bezier(0.42, 0, 0, 1)`,g=.1146,_=.086,v=8,y=class{constructor(e){this.el=e,this.track=e.querySelector(`.spc-track`),this.slides=[...e.querySelectorAll(`.spc-slide`)],this.dots=[...e.querySelectorAll(`.spc-dot`)],this.prevBtn=e.querySelector(`.spc-nav--prev .c-icon-button`),this.nextBtn=e.querySelector(`.spc-nav--next .c-icon-button`),this.activeIndex=Number(e.dataset.active??0),this._ro=null,this._bindEvents(),this._recalc(),this._goTo(this.activeIndex,!0)}_getPeek(){let e=this.el.offsetWidth;return Math.round(e*(e>=1600?g:_))}_recalc(){let e=this.el.offsetWidth,t=this._getPeek(),n=e-2*t-16;this.el.style.setProperty(`--spc-slide-w`,`${n}px`),this.el.style.setProperty(`--spc-peek`,`${t}px`),this._goTo(this.activeIndex,!0)}_goTo(e,t=!1){let n=this._getPeek(),r=-(e*(this.el.offsetWidth-2*n-16+v))+n;this.track.style.transition=t?`none`:`transform ${m}ms ${h}`,this.track.style.transform=`translateX(${r}px)`,this.slides.forEach((t,n)=>{let r=n===e;t.dataset.state=r?`active`:`inactive`,t.setAttribute(`aria-hidden`,r?`false`:`true`),r?t.removeAttribute(`inert`):t.setAttribute(`inert`,``)}),this.dots.forEach((t,n)=>{t.setAttribute(`aria-selected`,n===e?`true`:`false`)}),this.prevBtn&&(this.prevBtn.disabled=e===0),this.nextBtn&&(this.nextBtn.disabled=e===this.slides.length-1),this.el.dataset.active=e,this.activeIndex=e}_advance(e){let t=Math.max(0,Math.min(this.slides.length-1,this.activeIndex+e));t!==this.activeIndex&&this._goTo(t)}_bindEvents(){this.prevBtn?.addEventListener(`click`,()=>this._advance(-1)),this.nextBtn?.addEventListener(`click`,()=>this._advance(1)),this.dots.forEach((e,t)=>{e.addEventListener(`click`,()=>this._goTo(t))}),this.el.addEventListener(`keydown`,e=>{e.key===`ArrowLeft`&&(e.preventDefault(),this._advance(-1)),e.key===`ArrowRight`&&(e.preventDefault(),this._advance(1))}),typeof ResizeObserver<`u`&&(this._ro=new ResizeObserver(()=>this._recalc()),this._ro.observe(this.el))}destroy(){this._ro?.disconnect()}}})))()}function x(){return(x=e((()=>{b()})))()}var S,C,w,T,E,D,O;function k(){return(k=e((()=>{n(),x(),a(),u(),f(),S=[{quote:`"If it wasn't for Creative Cloud, I don't think I'd be here. I feel like I can create anything."`,attributionName:`Michelle Phan`,attributionRole:`Creator`,ctaLabel:`Learn more`,ctaHref:`#`,imageSrc:l},{quote:`"Adobe tools have transformed the way I tell stories. There's no limit to what I can imagine."`,attributionName:`Jordan Lee`,attributionRole:`Filmmaker`,ctaLabel:`Watch now`,ctaHref:`#`,imageSrc:s},{quote:`"From concept to final cut, Creative Cloud keeps everything connected. It's how I work every single day."`,attributionName:`Priya Nair`,attributionRole:`Motion Designer`,ctaLabel:`Explore`,ctaHref:`#`,imageSrc:c}],C=e=>{let t=e.querySelector(`.c-social-proof-carousel`);t&&!t.__spc&&(t.__spc=new y(t))},w={title:`Organisms/SocialProofCarousel`,tags:[`autodocs`],parameters:{layout:`fullscreen`,docs:{description:{component:`<p>Full-bleed social proof carousel. QuoteCards slide horizontally with a peek of the previous and next slides visible on either side. Left/right arrow buttons and pagination dots handle navigation. Instantiate <code>SocialProofCarouselController</code> on the <code>.c-social-proof-carousel</code> element after render.</p>`},source:{language:`html`,code:`<div class="c-social-proof-carousel" data-active="0">
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
  <div class="spc-pagination" role="tablist" aria-label="Slide navigation">
    <button class="spc-dot" role="tab" type="button" aria-label="Slide 1" aria-selected="true"></button>
    <button class="spc-dot" role="tab" type="button" aria-label="Slide 2" aria-selected="false"></button>
    <button class="spc-dot" role="tab" type="button" aria-label="Slide 3" aria-selected="false"></button>
  </div>
</div>`}}}},T={render:()=>p({slides:S,activeIndex:0}),play:async({canvasElement:e})=>{C(e)}},E={name:`Start on slide 2`,render:()=>p({slides:S,activeIndex:1}),play:async({canvasElement:e})=>{C(e)}},D={name:`Two slides`,render:()=>p({slides:S.slice(0,2),activeIndex:0}),play:async({canvasElement:e})=>{C(e)}},T.parameters={...T.parameters,docs:{...T.parameters?.docs,source:{originalSource:`{
  render: () => SocialProofCarousel({
    slides: SAMPLE_SLIDES,
    activeIndex: 0
  }),
  play: async ({
    canvasElement
  }) => {
    mount(canvasElement);
  }
}`,...T.parameters?.docs?.source}}},E.parameters={...E.parameters,docs:{...E.parameters?.docs,source:{originalSource:`{
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
}`,...E.parameters?.docs?.source}}},D.parameters={...D.parameters,docs:{...D.parameters?.docs,source:{originalSource:`{
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
}`,...D.parameters?.docs?.source}}},O=[`Default`,`StartOnSecond`,`TwoSlides`]})))()}k();export{T as Default,E as StartOnSecond,D as TwoSlides,O as __namedExportsOrder,w as default};