import{n as e}from"./rolldown-runtime-C0FnF6B9.js";import{t}from"./lit-DRzJKe3d.js";import{n,r,t as i}from"./router-marquee-3nyV_zl3.js";function a(){return(a=e((()=>{r()})))()}var o,s,c,l,u,d,f,p;function m(){return(m=e((()=>{t(),a(),o=[{eyebrow:`Creative Cloud`,title:`Create at the highest level.`,body:`Photoshop, Illustrator, Premiere, and much more. Work with the tools behind the world's most iconic creative content.`,ctaLabel:`Free trial`,ctaHref:`https://www.adobe.com/creativecloud.html`,product:`Creativity and design`,app:`experience-cloud`,videoSrc:`https://www.adobe.com/upp/media_12b79042476ff5306e627654877c58085eacf9cf0.mp4`,posterSrc:`https://www.adobe.com/upp-shared/media_13242b5f4fbac166bb046b25eacc1fd0b026aeff4.png?width=2000&format=webply&optimize=medium`},{eyebrow:`Firefly`,title:`All the best models, all in one place.`,body:`Generate and edit images, video, audio, and designs using top AI models from Adobe, Google, OpenAI, and more.`,ctaLabel:`Create with Firefly`,ctaHref:`https://www.adobe.com/products/firefly.html`,product:`Content creation`,app:`experience-cloud`,videoSrc:`https://www.adobe.com/upp/media_1b79b8d240c8d6ea3dd5235f681a2bea24f0c5582.mp4`},{eyebrow:`Acrobat`,title:`Get work done. Faster.`,body:`Create, edit, share and sign documents with trusted PDF tools. Use AI to make easy edits, get answers, share information, and create polished content.`,ctaLabel:`Free trial`,ctaHref:`https://www.adobe.com/acrobat.html`,product:`PDF and document essentials`,app:`acrobat`,videoSrc:`https://www.adobe.com/upp/media_1a42397066428d422823ffd54e7a66ec4998a3fd8.mp4`},{eyebrow:`Adobe for Business`,title:`Orchestrate customer experiences with AI.`,body:`Unify data, content, and workflows with Adobe AI to move faster, personalize at scale, and prove impact across your business.`,ctaLabel:`It starts with Adobe`,ctaHref:`https://business.adobe.com/`,product:`Adobe for Business`,app:`experience-cloud`,videoSrc:`https://www.adobe.com/upp/media_1fa8617c753dadad2b5de772c544a1091570c94b4.mp4`},{eyebrow:`Education`,title:`Students and teachers save 71%.`,body:`Save big on industry-standard tools with Creative Cloud Pro. Create designs, videos, presentations, and more — while building skills for your future.`,ctaLabel:`Free trial`,ctaHref:`https://www.adobe.com/education.html`,product:`Students and teachers`,app:`experience-cloud`,videoSrc:`https://www.adobe.com/upp/media_172ab3221a924e6451f0eeae9224a41c84f93724e.mp4`}],s={title:`Organisms/RouterMarquee`,tags:[`autodocs`],parameters:{layout:`fullscreen`,docs:{description:{component:'\nFull-bleed hero carousel combining slide video backgrounds, RichContent copy, RouterNavItem\nnavigation tiles, and a play/pause control.\n\n**Behaviour (driven by `RouterMarqueeController`):**\n- Autoplays every 5 s, advancing through slides with a 300 ms `translateX` transition\n- Progress bar fill animates via CSS `transform: translateX(-101% → 0%)` over 5 s linear\n- Clicking a RouterNavItem pauses autoplay and jumps to that slide\n- Play/Pause button toggles `data-state="playing|paused"` on the wrapper\n- Content (eyebrow, title, body, CTA) staggers in from right on each slide enter\n- Videos lazy-load per slide (set `data-lazy-src` on `.rm-video` elements)\n\n**Data attributes:**\n- `[data-state="playing|paused"]` on `.c-router-marquee`\n- `[data-state="active|inactive"]` on `.rm-slide`\n- `[data-state="default|active"]` + `[data-orientation="block|inline"]` on each RouterNavItem\n        '},source:{language:`html`,code:`<section class="c-router-marquee" data-state="playing">
  <div class="rm-slides">
    <div class="rm-slide" data-state="active">
      <video class="rm-video" data-lazy-src="…" autoplay muted loop playsinline></video>
      <div class="rm-content" data-theme="dark"><div class="c-rich-content" data-density="tight" data-measure="narrow">
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
</section>`}}}},c=(e,t={})=>{let r=e.querySelector(`.c-router-marquee`);if(!r||r._rmController)return;let i=new n(r);t.paused&&(i.paused=!0,i._updatePlayPauseUI(),clearTimeout(i.timer)),r._rmController=i},l={name:`Playing (autoplay)`,render:()=>i({slides:o,activeIndex:0}),play:async({canvasElement:e})=>c(e)},u={name:`Paused (slide 2 active)`,render:()=>i({slides:o,activeIndex:1}),play:async({canvasElement:e})=>c(e,{paused:!0})},d={name:`Two slides`,render:()=>i({slides:o.slice(0,2),activeIndex:0}),play:async({canvasElement:e})=>c(e)},f={name:`Single slide`,render:()=>i({slides:o.slice(0,1),activeIndex:0}),play:async({canvasElement:e})=>c(e)},l.parameters={...l.parameters,docs:{...l.parameters?.docs,source:{originalSource:`{
  name: "Playing (autoplay)",
  render: () => RouterMarquee({
    slides: SLIDES,
    activeIndex: 0
  }),
  play: async ({
    canvasElement
  }) => init(canvasElement)
}`,...l.parameters?.docs?.source}}},u.parameters={...u.parameters,docs:{...u.parameters?.docs,source:{originalSource:`{
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
}`,...u.parameters?.docs?.source}}},d.parameters={...d.parameters,docs:{...d.parameters?.docs,source:{originalSource:`{
  name: "Two slides",
  render: () => RouterMarquee({
    slides: SLIDES.slice(0, 2),
    activeIndex: 0
  }),
  play: async ({
    canvasElement
  }) => init(canvasElement)
}`,...d.parameters?.docs?.source}}},f.parameters={...f.parameters,docs:{...f.parameters?.docs,source:{originalSource:`{
  name: "Single slide",
  render: () => RouterMarquee({
    slides: SLIDES.slice(0, 1),
    activeIndex: 0
  }),
  play: async ({
    canvasElement
  }) => init(canvasElement)
}`,...f.parameters?.docs?.source}}},p=[`Playing`,`Paused`,`TwoSlides`,`SingleSlide`]})))()}m();export{u as Paused,l as Playing,f as SingleSlide,d as TwoSlides,p as __namedExportsOrder,s as default};