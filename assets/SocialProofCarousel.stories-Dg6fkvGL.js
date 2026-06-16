import{x as d}from"./iframe-Dvdium2s.js";import{Q as S}from"./quote-card-DdrJ-X9z.js";import{I as b}from"./icon-button-Dd5oT11K.js";import"./preload-helper-BSds_FOV.js";import"./button-BSqM1uBc.js";import"./unsafe-html-B8fzM46G.js";import"./chevron-down-Bqt06uWP.js";import"./play-6eLew0w_.js";import"./chevron-right-CnbUzkxe.js";import"./arrow-right-Do-kvyXB.js";const u=({slides:a=[],activeIndex:t=0}={})=>d`
  <div class="c-social-proof-carousel" data-active=${t}>
    <div class="spc-track">
      ${a.map((e,s)=>d`
          <div
            class="spc-slide"
            data-state=${s===t?"active":"inactive"}
            aria-hidden=${s===t?"false":"true"}
            ?inert=${s!==t}
          >
            ${S(e)}
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
      ${a.map((e,s)=>d`
          <button
            class="spc-dot"
            role="tab"
            type="button"
            aria-label="Slide ${s+1}"
            aria-selected=${s===t?"true":"false"}
          ></button>
        `)}
    </div>
  </div>
`,y=500,_="cubic-bezier(0.42, 0, 0, 1)",g=.1146,E=.086,p=8;class I{constructor(t){this.el=t,this.track=t.querySelector(".spc-track"),this.slides=[...t.querySelectorAll(".spc-slide")],this.dots=[...t.querySelectorAll(".spc-dot")],this.prevBtn=t.querySelector(".spc-nav--prev .c-icon-button"),this.nextBtn=t.querySelector(".spc-nav--next .c-icon-button"),this.activeIndex=Number(t.dataset.active??0),this._ro=null,this._bindEvents(),this._recalc(),this._goTo(this.activeIndex,!0)}_getPeek(){const t=this.el.offsetWidth;return Math.round(t*(t>=1600?g:E))}_recalc(){const t=this.el.offsetWidth,e=this._getPeek(),s=t-2*e-2*p;this.el.style.setProperty("--spc-slide-w",`${s}px`),this.el.style.setProperty("--spc-peek",`${e}px`),this._goTo(this.activeIndex,!0)}_goTo(t,e=!1){const s=this._getPeek(),m=this.el.offsetWidth-2*s-2*p,f=-(t*(m+p))+s;this.track.style.transition=e?"none":`transform ${y}ms ${_}`,this.track.style.transform=`translateX(${f}px)`,this.slides.forEach((i,c)=>{const l=c===t;i.dataset.state=l?"active":"inactive",i.setAttribute("aria-hidden",l?"false":"true"),l?i.removeAttribute("inert"):i.setAttribute("inert","")}),this.dots.forEach((i,c)=>{i.setAttribute("aria-selected",c===t?"true":"false")}),this.prevBtn&&(this.prevBtn.disabled=t===0),this.nextBtn&&(this.nextBtn.disabled=t===this.slides.length-1),this.el.dataset.active=t,this.activeIndex=t}_advance(t){const e=Math.max(0,Math.min(this.slides.length-1,this.activeIndex+t));e!==this.activeIndex&&this._goTo(e)}_bindEvents(){this.prevBtn?.addEventListener("click",()=>this._advance(-1)),this.nextBtn?.addEventListener("click",()=>this._advance(1)),this.dots.forEach((t,e)=>{t.addEventListener("click",()=>this._goTo(e))}),this.el.addEventListener("keydown",t=>{t.key==="ArrowLeft"&&(t.preventDefault(),this._advance(-1)),t.key==="ArrowRight"&&(t.preventDefault(),this._advance(1))}),typeof ResizeObserver<"u"&&(this._ro=new ResizeObserver(()=>this._recalc()),this._ro.observe(this.el))}destroy(){this._ro?.disconnect()}}const k="/consonant/assets/slide-1-OrkBQbCA.jpg",x="/consonant/assets/slide-2-BCVuwyjx.jpg",P="/consonant/assets/slide-3-CE2qaWzE.jpg",v=[{quote:`"If it wasn't for Creative Cloud, I don't think I'd be here. I feel like I can create anything."`,attributionName:"Michelle Phan",attributionRole:"Creator",ctaLabel:"Learn more",ctaHref:"#",imageSrc:k},{quote:`"Adobe tools have transformed the way I tell stories. There's no limit to what I can imagine."`,attributionName:"Jordan Lee",attributionRole:"Filmmaker",ctaLabel:"Watch now",ctaHref:"#",imageSrc:x},{quote:`"From concept to final cut, Creative Cloud keeps everything connected. It's how I work every single day."`,attributionName:"Priya Nair",attributionRole:"Motion Designer",ctaLabel:"Explore",ctaHref:"#",imageSrc:P}],h=a=>{const t=a.querySelector(".c-social-proof-carousel");t&&!t.__spc&&(t.__spc=new I(t))},D={title:"Organisms/SocialProofCarousel",tags:["autodocs"],parameters:{layout:"fullscreen",docs:{description:{component:"<p>Full-bleed social proof carousel. QuoteCards slide horizontally with a peek of the previous and next slides visible on either side. Left/right arrow buttons and pagination dots handle navigation. Instantiate <code>SocialProofCarouselController</code> on the <code>.c-social-proof-carousel</code> element after render.</p>"},source:{language:"html",code:`<div class="c-social-proof-carousel" data-active="0">
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
</div>`}}}},o={render:()=>u({slides:v,activeIndex:0}),play:async({canvasElement:a})=>{h(a)}},n={name:"Start on slide 2",render:()=>u({slides:v,activeIndex:1}),play:async({canvasElement:a})=>{h(a)}},r={name:"Two slides",render:()=>u({slides:v.slice(0,2),activeIndex:0}),play:async({canvasElement:a})=>{h(a)}};o.parameters={...o.parameters,docs:{...o.parameters?.docs,source:{originalSource:`{
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
