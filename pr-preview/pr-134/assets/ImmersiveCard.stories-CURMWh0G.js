import{E as s,x as d,B as f}from"./iframe-BoGTDT1x.js";import{e as x,i as C}from"./directive-DoeGSK_T.js";import{C as I,I as _,a as S}from"./icons-mCnKmWKC.js";import"./preload-helper-BvGMX4d4.js";class k extends C{update(o,[e]){const a=o.element;return e?a.play?.().catch?.(()=>{}):a.pause?.(),s}render(){return s}}const A=x(k),h=({imageSrc:n,imageAlt:o="",videoSrc:e,headline:a="",body:r="",showControl:i=!0,playing:t=!0,onControlClick:b}={})=>d`
  <div class="c-immersive-card">
    ${e?d`
        <div class="c-immersive-card__media" aria-hidden="true">
          <video
            class="c-immersive-card__video"
            src=${e}
            ${A(t)}
            autoplay
            loop
            muted
            playsinline
            preload="metadata"
          ></video>
          <span class="c-immersive-card__overlay"></span>
        </div>
      `:n?d`
        <div class="c-immersive-card__media" aria-hidden="true">
          <img class="c-immersive-card__image" src=${n} alt=${o} loading="lazy" decoding="async" />
          <span class="c-immersive-card__overlay"></span>
        </div>
      `:s}
    <div class="c-immersive-card__text">
      ${a?d`<p class="c-immersive-card__headline">${a}</p>`:s}
      ${r?d`<p class="c-immersive-card__body">${r}</p>`:s}
    </div>
    ${i?I({icon:t?_():S(),label:t?"Pause":"Play",size:"md",onClick:b}):s}
  </div>
`,{useArgs:E}=__STORYBOOK_MODULE_PREVIEW_API__,g="https://www.adobe.com/upp/media_12b79042476ff5306e627654877c58085eacf9cf0.mp4",v="https://www.adobe.com/upp/media_1b79b8d240c8d6ea3dd5235f681a2bea24f0c5582.mp4",w="https://www.adobe.com/upp/media_1a42397066428d422823ffd54e7a66ec4998a3fd8.mp4",P=(n,o)=>d`
  <div style="width:${n}px;background:#111;border-radius:20px;padding:24px;">
    ${o}
  </div>
`,B={title:"Cards/ImmersiveCard",tags:["autodocs"],render:n=>{const[{playing:o},e]=E();return P(327,h({...n,playing:o,onControlClick:()=>e({playing:!o})}))},parameters:{layout:"centered",backgrounds:{default:"dark",values:[{name:"dark",value:"#111"}]},docs:{description:{component:"\nFull-bleed video card. Text (headline + body) anchored top-left, ControlButton anchored bottom-right.\nAspect ratio is fixed at 259:300 — the card scales with its container width.\n\nClicking the ControlButton toggles play/pause state and updates the icon.\n\n**Props:**\n- `videoSrc` — background video URL; renders as `<video autoplay loop muted playsinline>`\n- `imageSrc` — background image URL (fallback when no videoSrc)\n- `headline` — primary heading (heading-6)\n- `body` — supporting copy (body-md)\n- `showControl` — show/hide the ControlButton\n- `playing` — toggles pause vs play icon; also drives `autoplay` on the video element\n- `onControlClick` — click handler for the ControlButton\n\n**Figma:** [ImmersiveCard](https://www.figma.com/design/oXIFqtnrYNdTIjqb1sbJau/elastic-card-updates?node-id=10152-12358) · [Examples](https://www.figma.com/design/oXIFqtnrYNdTIjqb1sbJau/elastic-card-updates?node-id=10152-12297)\n        "}}},argTypes:{videoSrc:{control:"text",description:"Background video URL"},imageSrc:{control:"text",description:"Background image URL (fallback)"},headline:{control:"text",description:"Card headline (heading-6)"},body:{control:"text",description:"Supporting copy (body-md)"},showControl:{control:"boolean",description:"Show / hide the ControlButton"},playing:{control:"boolean",description:"Playing state — click button or toggle here"}},args:{videoSrc:g,headline:"Generate anything.",body:"Images, video, audio, and designs — powered by top AI models from Adobe, Google, and OpenAI.",showControl:!0,playing:!0}},l={},c={name:"Playing state",args:{videoSrc:g,playing:!0,headline:"Generate anything.",body:"Images, video, audio, and designs — powered by top AI models."}},p={name:"Paused state",args:{videoSrc:v,playing:!1,headline:"Create faster.",body:"AI-powered tools built into every step of your creative workflow."}},m={name:"No control button",args:{videoSrc:w,showControl:!1,headline:"Stay in flow.",body:"Everything you need, right where you need it."}},u={name:"No media — dark surface",args:{videoSrc:"",imageSrc:"",headline:"Understand quickly.",body:"Ask AI Assistant to summarize and provide insights."}},y={name:"Responsive sizes",render:()=>{const n=[{width:327,videoSrc:g,headline:"Generate anything.",body:"Images, video, audio, and designs powered by AI.",playing:!0},{width:610,videoSrc:v,headline:"Create faster.",body:"AI-powered tools built into every step of your workflow.",playing:!0},{width:862,videoSrc:w,headline:"Stay in flow.",body:"Everything you need, right where you need it.",playing:!1}],o=document.createElement("div");return o.style.cssText="display:flex;flex-direction:column;gap:24px;padding:40px;background:#111;border-radius:20px;align-items:flex-start;",n.forEach(e=>{const a=document.createElement("div");a.style.cssText="display:flex;gap:8px;align-items:flex-start;";const r=document.createElement("span");r.style.cssText="color:#555;font:11px/2.4 'Adobe Clean',sans-serif;width:48px;flex-shrink:0;",r.textContent=`${e.width}px`;const i=document.createElement("div");i.style.width=`${e.width}px`;const t=()=>{f(h({videoSrc:e.videoSrc,headline:e.headline,body:e.body,playing:e.playing,showControl:!0,onControlClick:()=>{e.playing=!e.playing,t()}}),i)};t(),a.appendChild(r),a.appendChild(i),o.appendChild(a)}),o}};l.parameters={...l.parameters,docs:{...l.parameters?.docs,source:{originalSource:"{}",...l.parameters?.docs?.source}}};c.parameters={...c.parameters,docs:{...c.parameters?.docs,source:{originalSource:`{
  name: 'Playing state',
  args: {
    videoSrc: VID_1,
    playing: true,
    headline: 'Generate anything.',
    body: 'Images, video, audio, and designs — powered by top AI models.'
  }
}`,...c.parameters?.docs?.source}}};p.parameters={...p.parameters,docs:{...p.parameters?.docs,source:{originalSource:`{
  name: 'Paused state',
  args: {
    videoSrc: VID_2,
    playing: false,
    headline: 'Create faster.',
    body: 'AI-powered tools built into every step of your creative workflow.'
  }
}`,...p.parameters?.docs?.source}}};m.parameters={...m.parameters,docs:{...m.parameters?.docs,source:{originalSource:`{
  name: 'No control button',
  args: {
    videoSrc: VID_3,
    showControl: false,
    headline: 'Stay in flow.',
    body: 'Everything you need, right where you need it.'
  }
}`,...m.parameters?.docs?.source}}};u.parameters={...u.parameters,docs:{...u.parameters?.docs,source:{originalSource:`{
  name: 'No media — dark surface',
  args: {
    videoSrc: '',
    imageSrc: '',
    headline: 'Understand quickly.',
    body: 'Ask AI Assistant to summarize and provide insights.'
  }
}`,...u.parameters?.docs?.source}}};y.parameters={...y.parameters,docs:{...y.parameters?.docs,source:{originalSource:`{
  name: 'Responsive sizes',
  render: () => {
    const cards = [{
      width: 327,
      videoSrc: VID_1,
      headline: 'Generate anything.',
      body: 'Images, video, audio, and designs powered by AI.',
      playing: true
    }, {
      width: 610,
      videoSrc: VID_2,
      headline: 'Create faster.',
      body: 'AI-powered tools built into every step of your workflow.',
      playing: true
    }, {
      width: 862,
      videoSrc: VID_3,
      headline: 'Stay in flow.',
      body: 'Everything you need, right where you need it.',
      playing: false
    }];
    const root = document.createElement('div');
    root.style.cssText = 'display:flex;flex-direction:column;gap:24px;padding:40px;background:#111;border-radius:20px;align-items:flex-start;';
    cards.forEach(card => {
      const row = document.createElement('div');
      row.style.cssText = 'display:flex;gap:8px;align-items:flex-start;';
      const label = document.createElement('span');
      label.style.cssText = "color:#555;font:11px/2.4 'Adobe Clean',sans-serif;width:48px;flex-shrink:0;";
      label.textContent = \`\${card.width}px\`;
      const slot = document.createElement('div');
      slot.style.width = \`\${card.width}px\`;
      const rerender = () => {
        render(ImmersiveCard({
          videoSrc: card.videoSrc,
          headline: card.headline,
          body: card.body,
          playing: card.playing,
          showControl: true,
          onControlClick: () => {
            card.playing = !card.playing;
            rerender();
          }
        }), slot);
      };
      rerender();
      row.appendChild(label);
      row.appendChild(slot);
      root.appendChild(row);
    });
    return root;
  }
}`,...y.parameters?.docs?.source}}};const N=["Default","Playing","Paused","NoControl","NoMedia","Sizes"];export{l as Default,m as NoControl,u as NoMedia,p as Paused,c as Playing,y as Sizes,N as __namedExportsOrder,B as default};
