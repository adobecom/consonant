import{n as e}from"./rolldown-runtime-DkW27tQK.js";import{i as t,s as n,t as r}from"./lit-UMo5x0iS.js";import{n as i,t as a}from"./button-mrx1M3M1.js";import{r as o,t as s}from"./unsafe-html-K3HXmifv.js";import{i as c,n as l,r as u,t as d}from"./play-CAmK-qpW.js";import{n as f,t as p}from"./rich-content-C6e_ugTM.js";import{n as m,t as h}from"./router-nav-item-BdMnZcUa.js";var g,_,v,y,b,x,S,C;function w(){return(w=e((()=>{r(),s(),i(),f(),m(),u(),d(),g=({slides:e=[],activeIndex:r=0}={})=>n`
  <div class="c-router-marquee" data-state="playing">
    <div class="rm-slides">
      ${e.map((e,i)=>n`
          <div
            class="rm-slide"
            data-state=${i===r?`active`:`inactive`}
            aria-hidden=${i===r?`false`:`true`}
            ?inert=${i!==r}
          >
            <div class="rm-background">
              ${e.videoSrc?n`<video
                    class="rm-video"
                    muted
                    loop
                    playsinline
                    data-lazy-src=${e.videoSrc}
                    poster=${e.posterSrc??``}
                  ></video>`:t}
            </div>
            <div class="rm-overlay"></div>
            <div class="rm-content">
              ${p({theme:`on-dark`,density:`tight`,measure:`none`,eyebrow:e.eyebrow??``,showEyebrow:!!e.eyebrow,title:e.title??``,body:e.body??``,showActions:!!e.ctaLabel,actions:e.ctaLabel?a({label:e.ctaLabel,href:e.ctaHref??`#`,style:`knockout`}):t})}
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
        <span class="rm-icon-pause" aria-hidden="true">${o(c)}</span>
        <span class="rm-icon-play" aria-hidden="true">${o(l)}</span>
      </button>
      <div class="rm-nav-items">
        ${e.map((e,t)=>h({label:e.product,app:e.app??`experience-cloud`,orientation:`block`,state:t===r?`active`:`default`}))}
      </div>
    </div>
  </div>
`,_=5e3,v=[`.c-rich-content__eyebrow`,`.c-rich-content__title`,`.c-rich-content__body`,`.c-rich-content__actions`],y=60,b=20,x=700,S=`cubic-bezier(0.42, 0, 0, 1)`,C=class{constructor(e){this.el=e,this.slides=[...e.querySelectorAll(`.rm-slide`)],this.navItems=[...e.querySelectorAll(`.c-router-nav-item`)],this.fills=[...e.querySelectorAll(`.c-router-nav-item__progress-fill`)],this.playPauseBtn=e.querySelector(`.rm-play-pause`),this.activeIndex=0,this.paused=!1,this.timer=null,this._bindEvents(),this._goTo(0,!0)}_bindEvents(){this.navItems.forEach((e,t)=>{e.addEventListener(`mouseenter`,()=>{this._goTo(t)}),e.addEventListener(`click`,()=>{this.paused=!0,this._updatePlayPauseUI(),clearTimeout(this.timer),this._goTo(t)})}),this.playPauseBtn?.addEventListener(`click`,()=>this._togglePlayPause())}_goTo(e,t=!1){this.slides.forEach((t,n)=>{let r=n===e;t.dataset.state=r?`active`:`inactive`,t.setAttribute(`aria-hidden`,r?`false`:`true`),r?(t.removeAttribute(`inert`),this._loadAndPlayVideo(t)):(t.setAttribute(`inert`,``),this._pauseVideo(t))}),this.navItems.forEach((t,n)=>{t.dataset.state=n===e?`active`:`default`,t.setAttribute(`aria-pressed`,n===e?`true`:`false`)}),this.navItems[e]?.scrollIntoView({inline:`nearest`,behavior:`smooth`}),this._resetFill(e),this.paused||requestAnimationFrame(()=>this._startFill(e)),this._staggerContent(e,t),this.activeIndex=e,clearTimeout(this.timer),this.paused||(this.timer=setTimeout(()=>this._advance(),_))}_advance(){let e=(this.activeIndex+1)%this.slides.length;this._goTo(e)}_resetFill(e){let t=this.fills[e];t&&(t.style.transition=`none`,t.style.transform=`translateX(-101%)`,t.offsetHeight)}_startFill(e){let t=this.fills[e];t&&(t.style.transition=`transform ${_}ms linear`,t.style.transform=`translateX(0%)`)}_staggerContent(e,t=!1){let n=this.slides[e];v.forEach((e,r)=>{let i=n?.querySelector(e);if(!i)return;if(t){i.style.cssText=``;return}i.style.transition=`none`,i.style.transform=`translateX(${y+r*b}px)`,i.style.opacity=`0`,i.offsetHeight;let a=r*60;i.style.transition=[`transform ${x}ms ${S} ${a}ms`,`opacity ${x}ms ease ${a}ms`].join(`, `),i.style.transform=`translateX(0)`,i.style.opacity=`1`})}_loadAndPlayVideo(e){let t=e.querySelector(`.rm-video`);if(t){if(!t.dataset.loaded){let e=t.dataset.lazySrc;if(e){let n=document.createElement(`source`);n.src=e,n.type=`video/mp4`,t.appendChild(n),t.load(),t.dataset.loaded=`true`}}this.paused||t.play().catch(()=>{})}}_pauseVideo(e){let t=e.querySelector(`.rm-video`);t&&(t.pause(),t.currentTime=0)}_togglePlayPause(){if(this.paused=!this.paused,this._updatePlayPauseUI(),this.paused){clearTimeout(this.timer),this._pauseVideo(this.slides[this.activeIndex]);let e=this.fills[this.activeIndex];if(e){let t=getComputedStyle(e).transform;e.style.transition=`none`,e.style.transform=t}}else this._goTo(this.activeIndex)}_updatePlayPauseUI(){this.el.dataset.state=this.paused?`paused`:`playing`;let e=this.paused?`Play autoplay`:`Pause autoplay`;this.playPauseBtn?.setAttribute(`aria-label`,e)}destroy(){clearTimeout(this.timer)}}})))()}function T(){return(T=e((()=>{w()})))()}var E,D,O,k,A,j,M,N;function P(){return(P=e((()=>{r(),T(),E=[{eyebrow:`Creative Cloud`,title:`Create at the highest level.`,body:`Photoshop, Illustrator, Premiere, and much more. Work with the tools behind the world's most iconic creative content.`,ctaLabel:`Free trial`,ctaHref:`https://www.adobe.com/creativecloud.html`,product:`Creativity and design`,app:`experience-cloud`,videoSrc:`https://www.adobe.com/upp/media_12b79042476ff5306e627654877c58085eacf9cf0.mp4`,posterSrc:`https://www.adobe.com/upp-shared/media_13242b5f4fbac166bb046b25eacc1fd0b026aeff4.png?width=2000&format=webply&optimize=medium`},{eyebrow:`Firefly`,title:`All the best models, all in one place.`,body:`Generate and edit images, video, audio, and designs using top AI models from Adobe, Google, OpenAI, and more.`,ctaLabel:`Create with Firefly`,ctaHref:`https://www.adobe.com/products/firefly.html`,product:`Content creation`,app:`experience-cloud`,videoSrc:`https://www.adobe.com/upp/media_1b79b8d240c8d6ea3dd5235f681a2bea24f0c5582.mp4`},{eyebrow:`Acrobat`,title:`Get work done. Faster.`,body:`Create, edit, share and sign documents with trusted PDF tools. Use AI to make easy edits, get answers, share information, and create polished content.`,ctaLabel:`Free trial`,ctaHref:`https://www.adobe.com/acrobat.html`,product:`PDF and document essentials`,app:`acrobat`,videoSrc:`https://www.adobe.com/upp/media_1a42397066428d422823ffd54e7a66ec4998a3fd8.mp4`},{eyebrow:`Adobe for Business`,title:`Orchestrate customer experiences with AI.`,body:`Unify data, content, and workflows with Adobe AI to move faster, personalize at scale, and prove impact across your business.`,ctaLabel:`It starts with Adobe`,ctaHref:`https://business.adobe.com/`,product:`Adobe for Business`,app:`experience-cloud`,videoSrc:`https://www.adobe.com/upp/media_1fa8617c753dadad2b5de772c544a1091570c94b4.mp4`},{eyebrow:`Education`,title:`Students and teachers save 71%.`,body:`Save big on industry-standard tools with Creative Cloud Pro. Create designs, videos, presentations, and more — while building skills for your future.`,ctaLabel:`Free trial`,ctaHref:`https://www.adobe.com/education.html`,product:`Students and teachers`,app:`experience-cloud`,videoSrc:`https://www.adobe.com/upp/media_172ab3221a924e6451f0eeae9224a41c84f93724e.mp4`}],D={title:`Organisms/RouterMarquee`,tags:[`autodocs`],parameters:{layout:`fullscreen`,docs:{description:{component:'\nFull-bleed hero carousel combining slide video backgrounds, RichContent copy, RouterNavItem\nnavigation tiles, and a play/pause control.\n\n**Behaviour (driven by `RouterMarqueeController`):**\n- Autoplays every 5 s, advancing through slides with a 300 ms `translateX` transition\n- Progress bar fill animates via CSS `transform: translateX(-101% → 0%)` over 5 s linear\n- Clicking a RouterNavItem pauses autoplay and jumps to that slide\n- Play/Pause button toggles `data-state="playing|paused"` on the wrapper\n- Content (eyebrow, title, body, CTA) staggers in from right on each slide enter\n- Videos lazy-load per slide (set `data-lazy-src` on `.rm-video` elements)\n\n**Data attributes:**\n- `[data-state="playing|paused"]` on `.c-router-marquee`\n- `[data-state="active|inactive"]` on `.rm-slide`\n- `[data-state="default|active"]` + `[data-orientation="block|inline"]` on each RouterNavItem\n        '},source:{language:`html`,code:`<section class="c-router-marquee" data-state="playing">
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
</section>`}}}},O=(e,t={})=>{let n=e.querySelector(`.c-router-marquee`);if(!n||n._rmController)return;let r=new C(n);t.paused&&(r.paused=!0,r._updatePlayPauseUI(),clearTimeout(r.timer)),n._rmController=r},k={name:`Playing (autoplay)`,render:()=>g({slides:E,activeIndex:0}),play:async({canvasElement:e})=>O(e)},A={name:`Paused (slide 2 active)`,render:()=>g({slides:E,activeIndex:1}),play:async({canvasElement:e})=>O(e,{paused:!0})},j={name:`Two slides`,render:()=>g({slides:E.slice(0,2),activeIndex:0}),play:async({canvasElement:e})=>O(e)},M={name:`Single slide`,render:()=>g({slides:E.slice(0,1),activeIndex:0}),play:async({canvasElement:e})=>O(e)},k.parameters={...k.parameters,docs:{...k.parameters?.docs,source:{originalSource:`{
  name: "Playing (autoplay)",
  render: () => RouterMarquee({
    slides: SLIDES,
    activeIndex: 0
  }),
  play: async ({
    canvasElement
  }) => init(canvasElement)
}`,...k.parameters?.docs?.source}}},A.parameters={...A.parameters,docs:{...A.parameters?.docs,source:{originalSource:`{
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
}`,...A.parameters?.docs?.source}}},j.parameters={...j.parameters,docs:{...j.parameters?.docs,source:{originalSource:`{
  name: "Two slides",
  render: () => RouterMarquee({
    slides: SLIDES.slice(0, 2),
    activeIndex: 0
  }),
  play: async ({
    canvasElement
  }) => init(canvasElement)
}`,...j.parameters?.docs?.source}}},M.parameters={...M.parameters,docs:{...M.parameters?.docs,source:{originalSource:`{
  name: "Single slide",
  render: () => RouterMarquee({
    slides: SLIDES.slice(0, 1),
    activeIndex: 0
  }),
  play: async ({
    canvasElement
  }) => init(canvasElement)
}`,...M.parameters?.docs?.source}}},N=[`Playing`,`Paused`,`TwoSlides`,`SingleSlide`]})))()}P();export{A as Paused,k as Playing,M as SingleSlide,j as TwoSlides,N as __namedExportsOrder,D as default};