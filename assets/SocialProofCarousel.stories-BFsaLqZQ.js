import{x as d}from"./iframe-DkrSOBZ4.js";import{Q as S}from"./quote-card-BLQhjQer.js";import{I as b}from"./icon-button-9bq-bQ1c.js";import"./preload-helper-BSds_FOV.js";import"./button-D1so8Kax.js";import"./unsafe-html-CkDs-VLS.js";import"./chevron-down-Bqt06uWP.js";import"./play-6eLew0w_.js";import"./chevron-right-CnbUzkxe.js";import"./arrow-right-Do-kvyXB.js";const p=({slides:a=[],activeIndex:e=0}={})=>d`
  <div class="c-social-proof-carousel" data-active=${e}>
    <div class="spc-track">
      ${a.map((t,s)=>d`
          <div
            class="spc-slide"
            data-state=${s===e?"active":"inactive"}
            aria-hidden=${s===e?"false":"true"}
            ?inert=${s!==e}
          >
            ${S(t)}
          </div>
        `)}
    </div>

    <div class="spc-nav spc-nav--prev">
      ${b({icon:"arrow-left",style:"solid",context:"on-dark",size:"lg",ariaLabel:"Previous slide"})}
    </div>

    <div class="spc-nav spc-nav--next">
      ${b({icon:"arrow-right",style:"solid",context:"on-dark",size:"lg",ariaLabel:"Next slide"})}
    </div>

    <div class="spc-pagination" role="tablist" aria-label="Slide navigation">
      ${a.map((t,s)=>d`
          <button
            class="spc-dot"
            role="tab"
            type="button"
            aria-label="Slide ${s+1}"
            aria-selected=${s===e?"true":"false"}
          ></button>
        `)}
    </div>
  </div>
`,y=500,_="cubic-bezier(0.42, 0, 0, 1)",g=.1146,E=.086,u=8;class I{constructor(e){this.el=e,this.track=e.querySelector(".spc-track"),this.slides=[...e.querySelectorAll(".spc-slide")],this.dots=[...e.querySelectorAll(".spc-dot")],this.prevBtn=e.querySelector(".spc-nav--prev .c-icon-button"),this.nextBtn=e.querySelector(".spc-nav--next .c-icon-button"),this.activeIndex=Number(e.dataset.active??0),this._ro=null,this._bindEvents(),this._recalc(),this._goTo(this.activeIndex,!0)}_getPeek(){const e=this.el.offsetWidth;return Math.round(e*(e>=1600?g:E))}_recalc(){const e=this.el.offsetWidth,t=this._getPeek(),s=e-2*t-2*u;this.el.style.setProperty("--spc-slide-w",`${s}px`),this.el.style.setProperty("--spc-peek",`${t}px`),this._goTo(this.activeIndex,!0)}_goTo(e,t=!1){const s=this._getPeek(),m=this.el.offsetWidth-2*s-2*u,f=-(e*(m+u))+s;this.track.style.transition=t?"none":`transform ${y}ms ${_}`,this.track.style.transform=`translateX(${f}px)`,this.slides.forEach((i,c)=>{const l=c===e;i.dataset.state=l?"active":"inactive",i.setAttribute("aria-hidden",l?"false":"true"),l?i.removeAttribute("inert"):i.setAttribute("inert","")}),this.dots.forEach((i,c)=>{i.setAttribute("aria-selected",c===e?"true":"false")}),this.prevBtn&&(this.prevBtn.disabled=e===0),this.nextBtn&&(this.nextBtn.disabled=e===this.slides.length-1),this.el.dataset.active=e,this.activeIndex=e}_advance(e){const t=Math.max(0,Math.min(this.slides.length-1,this.activeIndex+e));t!==this.activeIndex&&this._goTo(t)}_bindEvents(){this.prevBtn?.addEventListener("click",()=>this._advance(-1)),this.nextBtn?.addEventListener("click",()=>this._advance(1)),this.dots.forEach((e,t)=>{e.addEventListener("click",()=>this._goTo(t))}),this.el.addEventListener("keydown",e=>{e.key==="ArrowLeft"&&(e.preventDefault(),this._advance(-1)),e.key==="ArrowRight"&&(e.preventDefault(),this._advance(1))}),typeof ResizeObserver<"u"&&(this._ro=new ResizeObserver(()=>this._recalc()),this._ro.observe(this.el))}destroy(){this._ro?.disconnect()}}const v=[{quote:`"If it wasn't for Creative Cloud, I don't think I'd be here. I feel like I can create anything."`,attributionName:"Michelle Phan",attributionRole:"Creator",ctaLabel:"Learn more",ctaHref:"#",imageSrc:"/assets/carousel/slide-1.jpg"},{quote:`"Adobe tools have transformed the way I tell stories. There's no limit to what I can imagine."`,attributionName:"Jordan Lee",attributionRole:"Filmmaker",ctaLabel:"Watch now",ctaHref:"#",imageSrc:"/assets/carousel/slide-2.jpg"},{quote:`"From concept to final cut, Creative Cloud keeps everything connected. It's how I work every single day."`,attributionName:"Priya Nair",attributionRole:"Motion Designer",ctaLabel:"Explore",ctaHref:"#",imageSrc:"/assets/carousel/slide-3.jpg"}],h=a=>{const e=a.querySelector(".c-social-proof-carousel");e&&!e.__spc&&(e.__spc=new I(e))},D={title:"Organisms/SocialProofCarousel",tags:["autodocs"],parameters:{layout:"fullscreen",docs:{description:{component:"<p>Full-bleed social proof carousel. QuoteCards slide horizontally with a peek of the previous and next slides visible on either side. Left/right arrow buttons and pagination dots handle navigation. Instantiate <code>SocialProofCarouselController</code> on the <code>.c-social-proof-carousel</code> element after render.</p>"},source:{language:"html",code:`<div class="c-social-proof-carousel" data-active="0">
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
</div>`}}}},o={render:()=>p({slides:v,activeIndex:0}),play:async({canvasElement:a})=>{h(a)}},n={name:"Start on slide 2",render:()=>p({slides:v,activeIndex:1}),play:async({canvasElement:a})=>{h(a)}},r={name:"Two slides",render:()=>p({slides:v.slice(0,2),activeIndex:0}),play:async({canvasElement:a})=>{h(a)}};o.parameters={...o.parameters,docs:{...o.parameters?.docs,source:{originalSource:`{
  render: () => SocialProofCarousel({
    slides: SAMPLE_SLIDES,
    activeIndex: 0
  }),
  play: async ({
    canvasElement
  }) => {
    mount(canvasElement);
  }
}`,...o.parameters?.docs?.source}}};n.parameters={...n.parameters,docs:{...n.parameters?.docs,source:{originalSource:`{
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
}`,...n.parameters?.docs?.source}}};r.parameters={...r.parameters,docs:{...r.parameters?.docs,source:{originalSource:`{
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
}`,...r.parameters?.docs?.source}}};const M=["Default","StartOnSecond","TwoSlides"];export{o as Default,n as StartOnSecond,r as TwoSlides,M as __namedExportsOrder,D as default};
