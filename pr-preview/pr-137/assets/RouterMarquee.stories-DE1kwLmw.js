import{E as v,x as h}from"./iframe-Jwfh8MPX.js";import{o as b}from"./unsafe-html-Cc2Vu3Ed.js";import{c as w}from"./button-Cebqltt4.js";import{R as S}from"./rich-content-CZZ9NAG6.js";import{R as _}from"./router-nav-item-HmPlJ7af.js";import{p as E,a as P}from"./play-6eLew0w_.js";import"./preload-helper-BU6q58kX.js";import"./directive-DoeGSK_T.js";import"./product-lockup-BuXk4S6R.js";import"./app-icon-CC8adVOX.js";import"./chevron-right-CnbUzkxe.js";const u=({slides:s=[],activeIndex:t=0}={})=>h`
  <div class="c-router-marquee" data-state="playing">
    <div class="rm-slides">
      ${s.map((e,a)=>h`
          <div
            class="rm-slide"
            data-state=${a===t?"active":"inactive"}
            aria-hidden=${a===t?"false":"true"}
            ?inert=${a!==t}
          >
            <div class="rm-background">
              ${e.videoSrc?h`<video
                    class="rm-video"
                    muted
                    loop
                    playsinline
                    data-lazy-src=${e.videoSrc}
                    poster=${e.posterSrc??""}
                  ></video>`:v}
            </div>
            <div class="rm-overlay"></div>
            <div class="rm-content">
              ${S({theme:"on-dark",density:"tight",measure:"none",eyebrow:e.eyebrow??"",showEyebrow:!!e.eyebrow,title:e.title??"",body:e.body??"",showActions:!!e.ctaLabel,actions:e.ctaLabel?w({label:e.ctaLabel,href:e.ctaHref??"#",style:"knockout"}):v})}
            </div>
          </div>
        `)}
    </div>

    <div class="rm-controls">
      <button
        class="rm-play-pause"
        type="button"
        aria-label="Pause autoplay"
      >
        <span class="rm-icon-pause" aria-hidden="true">${b(E)}</span>
        <span class="rm-icon-play" aria-hidden="true">${b(P)}</span>
      </button>
      <div class="rm-nav-items">
        ${s.map((e,a)=>_({label:e.product,app:e.app??"experience-cloud",orientation:"block",state:a===t?"active":"default"}))}
      </div>
    </div>
  </div>
`,f=5e3,A=[".c-rich-content__eyebrow",".c-rich-content__title",".c-rich-content__body",".c-rich-content__actions"],I=60,T=20,g=700,C="cubic-bezier(0.42, 0, 0, 1)";class R{constructor(t){this.el=t,this.slides=[...t.querySelectorAll(".rm-slide")],this.navItems=[...t.querySelectorAll(".c-router-nav-item")],this.fills=[...t.querySelectorAll(".c-router-nav-item__progress-fill")],this.playPauseBtn=t.querySelector(".rm-play-pause"),this.activeIndex=0,this.paused=!1,this.timer=null,this._bindEvents(),this._goTo(0,!0)}_bindEvents(){this.navItems.forEach((t,e)=>{t.addEventListener("mouseenter",()=>{this._goTo(e)}),t.addEventListener("click",()=>{this.paused=!0,this._updatePlayPauseUI(),clearTimeout(this.timer),this._goTo(e)})}),this.playPauseBtn?.addEventListener("click",()=>this._togglePlayPause())}_goTo(t,e=!1){this.slides.forEach((a,r)=>{const i=r===t;a.dataset.state=i?"active":"inactive",a.setAttribute("aria-hidden",i?"false":"true"),i?(a.removeAttribute("inert"),this._loadAndPlayVideo(a)):(a.setAttribute("inert",""),this._pauseVideo(a))}),this.navItems.forEach((a,r)=>{a.dataset.state=r===t?"active":"default",a.setAttribute("aria-pressed",r===t?"true":"false")}),this.navItems[t]?.scrollIntoView({inline:"nearest",behavior:"smooth"}),this._resetFill(t),this.paused||requestAnimationFrame(()=>this._startFill(t)),this._staggerContent(t,e),this.activeIndex=t,clearTimeout(this.timer),this.paused||(this.timer=setTimeout(()=>this._advance(),f))}_advance(){const t=(this.activeIndex+1)%this.slides.length;this._goTo(t)}_resetFill(t){const e=this.fills[t];e&&(e.style.transition="none",e.style.transform="translateX(-101%)",e.offsetHeight)}_startFill(t){const e=this.fills[t];e&&(e.style.transition=`transform ${f}ms linear`,e.style.transform="translateX(0%)")}_staggerContent(t,e=!1){const a=this.slides[t];A.forEach((r,i)=>{const o=a?.querySelector(r);if(!o)return;if(e){o.style.cssText="";return}o.style.transition="none",o.style.transform=`translateX(${I+i*T}px)`,o.style.opacity="0",o.offsetHeight;const y=i*60;o.style.transition=[`transform ${g}ms ${C} ${y}ms`,`opacity ${g}ms ease ${y}ms`].join(", "),o.style.transform="translateX(0)",o.style.opacity="1"})}_loadAndPlayVideo(t){const e=t.querySelector(".rm-video");if(e){if(!e.dataset.loaded){const a=e.dataset.lazySrc;if(a){const r=document.createElement("source");r.src=a,r.type="video/mp4",e.appendChild(r),e.load(),e.dataset.loaded="true"}}this.paused||e.play().catch(()=>{})}}_pauseVideo(t){const e=t.querySelector(".rm-video");e&&(e.pause(),e.currentTime=0)}_togglePlayPause(){if(this.paused=!this.paused,this._updatePlayPauseUI(),this.paused){clearTimeout(this.timer),this._pauseVideo(this.slides[this.activeIndex]);const t=this.fills[this.activeIndex];if(t){const e=getComputedStyle(t).transform;t.style.transition="none",t.style.transform=e}}else this._goTo(this.activeIndex)}_updatePlayPauseUI(){this.el.dataset.state=this.paused?"paused":"playing";const t=this.paused?"Play autoplay":"Pause autoplay";this.playPauseBtn?.setAttribute("aria-label",t)}destroy(){clearTimeout(this.timer)}}const p=[{eyebrow:"Creative Cloud",title:"Create at the highest level.",body:"Photoshop, Illustrator, Premiere, and much more. Work with the tools behind the world's most iconic creative content.",ctaLabel:"Free trial",ctaHref:"https://www.adobe.com/creativecloud.html",product:"Creativity and design",app:"experience-cloud",videoSrc:"https://www.adobe.com/upp/media_12b79042476ff5306e627654877c58085eacf9cf0.mp4",posterSrc:"https://www.adobe.com/upp-shared/media_13242b5f4fbac166bb046b25eacc1fd0b026aeff4.png?width=2000&format=webply&optimize=medium"},{eyebrow:"Firefly",title:"All the best models, all in one place.",body:"Generate and edit images, video, audio, and designs using top AI models from Adobe, Google, OpenAI, and more.",ctaLabel:"Create with Firefly",ctaHref:"https://www.adobe.com/products/firefly.html",product:"Content creation",app:"experience-cloud",videoSrc:"https://www.adobe.com/upp/media_1b79b8d240c8d6ea3dd5235f681a2bea24f0c5582.mp4"},{eyebrow:"Acrobat",title:"Get work done. Faster.",body:"Create, edit, share and sign documents with trusted PDF tools. Use AI to make easy edits, get answers, share information, and create polished content.",ctaLabel:"Free trial",ctaHref:"https://www.adobe.com/acrobat.html",product:"PDF and document essentials",app:"acrobat",videoSrc:"https://www.adobe.com/upp/media_1a42397066428d422823ffd54e7a66ec4998a3fd8.mp4"},{eyebrow:"Adobe for Business",title:"Orchestrate customer experiences with AI.",body:"Unify data, content, and workflows with Adobe AI to move faster, personalize at scale, and prove impact across your business.",ctaLabel:"It starts with Adobe",ctaHref:"https://business.adobe.com/",product:"Adobe for Business",app:"experience-cloud",videoSrc:"https://www.adobe.com/upp/media_1fa8617c753dadad2b5de772c544a1091570c94b4.mp4"},{eyebrow:"Education",title:"Students and teachers save 71%.",body:"Save big on industry-standard tools with Creative Cloud Pro. Create designs, videos, presentations, and more — while building skills for your future.",ctaLabel:"Free trial",ctaHref:"https://www.adobe.com/education.html",product:"Students and teachers",app:"experience-cloud",videoSrc:"https://www.adobe.com/upp/media_172ab3221a924e6451f0eeae9224a41c84f93724e.mp4"}],H={title:"Organisms/RouterMarquee",tags:["autodocs"],parameters:{layout:"fullscreen",docs:{description:{component:'\nFull-bleed hero carousel combining slide video backgrounds, RichContent copy, RouterNavItem\nnavigation tiles, and a play/pause control.\n\n**Behaviour (driven by `RouterMarqueeController`):**\n- Autoplays every 5 s, advancing through slides with a 300 ms `translateX` transition\n- Progress bar fill animates via CSS `transform: translateX(-101% → 0%)` over 5 s linear\n- Clicking a RouterNavItem pauses autoplay and jumps to that slide\n- Play/Pause button toggles `data-state="playing|paused"` on the wrapper\n- Content (eyebrow, title, body, CTA) staggers in from right on each slide enter\n- Videos lazy-load per slide (set `data-lazy-src` on `.rm-video` elements)\n\n**Data attributes:**\n- `[data-state="playing|paused"]` on `.c-router-marquee`\n- `[data-state="active|inactive"]` on `.rm-slide`\n- `[data-state="default|active"]` + `[data-orientation="block|inline"]` on each RouterNavItem\n        '},source:{language:"html",code:`<section class="c-router-marquee" data-state="playing">
  <div class="rm-slides">
    <div class="rm-slide" data-state="active">
      <video class="rm-video" data-lazy-src="…" autoplay muted loop playsinline></video>
      <div class="c-rich-content" data-theme="on-dark" data-density="tight" data-measure="narrow">
        <p class="c-rich-content__eyebrow">Eyebrow</p>
        <h2 class="c-rich-content__title">Slide heading</h2>
        <p class="c-rich-content__body">Slide description.</p>
        <div class="c-rich-content__actions">
          <a class="c-button" data-style="knockout" data-size="md" href="#">CTA</a>
        </div>
      </div>
    </div>
    <!-- additional .rm-slide elements -->
  </div>
  <nav class="rm-nav" aria-label="Slides">
    <div class="c-router-nav-item" data-state="active" data-orientation="block">
      <div class="c-product-lockup" data-orientation="vertical">…</div>
      <div class="c-progress-bar" role="progressbar" aria-valuenow="60">…</div>
    </div>
    <!-- one .c-router-nav-item per slide -->
  </nav>
  <button class="rm-play-pause c-icon-button" data-state="playing" aria-label="Pause autoplay">…</button>
</section>`}}}},m=(s,t={})=>{const e=s.querySelector(".c-router-marquee");if(!e||e._rmController)return;const a=new R(e);t.paused&&(a.paused=!0,a._updatePlayPauseUI(),clearTimeout(a.timer)),e._rmController=a},n={name:"Playing (autoplay)",render:()=>u({slides:p,activeIndex:0}),play:async({canvasElement:s})=>m(s)},c={name:"Paused (slide 2 active)",render:()=>u({slides:p,activeIndex:1}),play:async({canvasElement:s})=>m(s,{paused:!0})},l={name:"Two slides",render:()=>u({slides:p.slice(0,2),activeIndex:0}),play:async({canvasElement:s})=>m(s)},d={name:"Single slide",render:()=>u({slides:p.slice(0,1),activeIndex:0}),play:async({canvasElement:s})=>m(s)};n.parameters={...n.parameters,docs:{...n.parameters?.docs,source:{originalSource:`{
  name: "Playing (autoplay)",
  render: () => RouterMarquee({
    slides: SLIDES,
    activeIndex: 0
  }),
  play: async ({
    canvasElement
  }) => init(canvasElement)
}`,...n.parameters?.docs?.source}}};c.parameters={...c.parameters,docs:{...c.parameters?.docs,source:{originalSource:`{
  name: "Paused (slide 2 active)",
  render: () => RouterMarquee({
    slides: SLIDES,
    activeIndex: 1
  }),
  play: async ({
    canvasElement
  }) => init(canvasElement, {
    paused: true
  })
}`,...c.parameters?.docs?.source}}};l.parameters={...l.parameters,docs:{...l.parameters?.docs,source:{originalSource:`{
  name: "Two slides",
  render: () => RouterMarquee({
    slides: SLIDES.slice(0, 2),
    activeIndex: 0
  }),
  play: async ({
    canvasElement
  }) => init(canvasElement)
}`,...l.parameters?.docs?.source}}};d.parameters={...d.parameters,docs:{...d.parameters?.docs,source:{originalSource:`{
  name: "Single slide",
  render: () => RouterMarquee({
    slides: SLIDES.slice(0, 1),
    activeIndex: 0
  }),
  play: async ({
    canvasElement
  }) => init(canvasElement)
}`,...d.parameters?.docs?.source}}};const U=["Playing","Paused","TwoSlides","SingleSlide"];export{c as Paused,n as Playing,d as SingleSlide,l as TwoSlides,U as __namedExportsOrder,H as default};
