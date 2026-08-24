import{n as e}from"./rolldown-runtime-DkW27tQK.js";import{a as t,i as n,s as r,t as i}from"./lit-UMo5x0iS.js";import{n as a,r as o,t as s}from"./directive-CZiujxgm.js";import{a as c,c as l,l as u,o as d,s as f}from"./icons-CqFcFoMP.js";var p,m,h;function g(){return(g=e((()=>{i(),o(),u(),f(),p=class extends a{update(e,[t]){let r=e.element;return t?r.play?.().catch?.(()=>{}):r.pause?.(),n}render(){return n}},m=s(p),h=({imageSrc:e,imageAlt:t=``,videoSrc:i,headline:a=``,body:o=``,showControl:s=!0,playing:u=!0,onControlClick:f}={})=>r`
  <div class="c-immersive-card">
    ${i?r`
        <div class="c-immersive-card__media" aria-hidden="true">
          <video
            class="c-immersive-card__video"
            src=${i}
            ${m(u)}
            autoplay
            loop
            muted
            playsinline
            preload="metadata"
          ></video>
          <span class="c-immersive-card__overlay"></span>
        </div>
      `:e?r`
        <div class="c-immersive-card__media" aria-hidden="true">
          <img class="c-immersive-card__image" src=${e} alt=${t} loading="lazy" decoding="async" />
          <span class="c-immersive-card__overlay"></span>
        </div>
      `:n}
    <div class="c-immersive-card__text">
      ${a?r`<p class="c-immersive-card__headline">${a}</p>`:n}
      ${o?r`<p class="c-immersive-card__body">${o}</p>`:n}
    </div>
    ${s?l({icon:u?c():d(),label:u?`Pause`:`Play`,size:`md`,onClick:f}):n}
  </div>
`})))()}function _(){return(_=e((()=>{g()})))()}var v,y,b,x,S,C,w,T,E,D,O,k,A;function j(){return(j=e((()=>{i(),_(),{useArgs:v}=__STORYBOOK_MODULE_PREVIEW_API__,y=`https://www.adobe.com/upp/media_12b79042476ff5306e627654877c58085eacf9cf0.mp4`,b=`https://www.adobe.com/upp/media_1b79b8d240c8d6ea3dd5235f681a2bea24f0c5582.mp4`,x=`https://www.adobe.com/upp/media_1a42397066428d422823ffd54e7a66ec4998a3fd8.mp4`,S=(e,t)=>r`
  <div style="width:${e}px;background:#111;border-radius:20px;padding:24px;">
    ${t}
  </div>
`,C={title:`Cards/ImmersiveCard`,tags:[`autodocs`],render:e=>{let[{playing:t},n]=v();return S(327,h({...e,playing:t,onControlClick:()=>n({playing:!t})}))},parameters:{layout:`centered`,backgrounds:{default:`dark`,values:[{name:`dark`,value:`#111`}]},docs:{description:{component:"\nFull-bleed video card. Text (headline + body) anchored top-left, ControlButton anchored bottom-right.\nAspect ratio is fixed at 259:300 — the card scales with its container width.\n\nClicking the ControlButton toggles play/pause state and updates the icon.\n\n**Props:**\n- `videoSrc` — background video URL; renders as `<video autoplay loop muted playsinline>`\n- `imageSrc` — background image URL (fallback when no videoSrc)\n- `headline` — primary heading (heading-6)\n- `body` — supporting copy (body-md)\n- `showControl` — show/hide the ControlButton\n- `playing` — toggles pause vs play icon; also drives `autoplay` on the video element\n- `onControlClick` — click handler for the ControlButton\n\n**Figma:** [ImmersiveCard](https://www.figma.com/design/oXIFqtnrYNdTIjqb1sbJau/elastic-card-updates?node-id=10152-12358) · [Examples](https://www.figma.com/design/oXIFqtnrYNdTIjqb1sbJau/elastic-card-updates?node-id=10152-12297)\n        "}}},argTypes:{videoSrc:{control:`text`,description:`Background video URL`},imageSrc:{control:`text`,description:`Background image URL (fallback)`},headline:{control:`text`,description:`Card headline (heading-6)`},body:{control:`text`,description:`Supporting copy (body-md)`},showControl:{control:`boolean`,description:`Show / hide the ControlButton`},playing:{control:`boolean`,description:`Playing state — click button or toggle here`}},args:{videoSrc:y,headline:`Generate anything.`,body:`Images, video, audio, and designs — powered by top AI models from Adobe, Google, and OpenAI.`,showControl:!0,playing:!0}},w={},T={name:`Playing state`,args:{videoSrc:y,playing:!0,headline:`Generate anything.`,body:`Images, video, audio, and designs — powered by top AI models.`}},E={name:`Paused state`,args:{videoSrc:b,playing:!1,headline:`Create faster.`,body:`AI-powered tools built into every step of your creative workflow.`}},D={name:`No control button`,args:{videoSrc:x,showControl:!1,headline:`Stay in flow.`,body:`Everything you need, right where you need it.`}},O={name:`No media — dark surface`,args:{videoSrc:``,imageSrc:``,headline:`Understand quickly.`,body:`Ask AI Assistant to summarize and provide insights.`}},k={name:`Responsive sizes`,render:()=>{let e=[{width:327,videoSrc:y,headline:`Generate anything.`,body:`Images, video, audio, and designs powered by AI.`,playing:!0},{width:610,videoSrc:b,headline:`Create faster.`,body:`AI-powered tools built into every step of your workflow.`,playing:!0},{width:862,videoSrc:x,headline:`Stay in flow.`,body:`Everything you need, right where you need it.`,playing:!1}],n=document.createElement(`div`);return n.style.cssText=`display:flex;flex-direction:column;gap:24px;padding:40px;background:#111;border-radius:20px;align-items:flex-start;`,e.forEach(e=>{let r=document.createElement(`div`);r.style.cssText=`display:flex;gap:8px;align-items:flex-start;`;let i=document.createElement(`span`);i.style.cssText=`color:#555;font:11px/2.4 'Adobe Clean',sans-serif;width:48px;flex-shrink:0;`,i.textContent=`${e.width}px`;let a=document.createElement(`div`);a.style.width=`${e.width}px`;let o=()=>{t(h({videoSrc:e.videoSrc,headline:e.headline,body:e.body,playing:e.playing,showControl:!0,onControlClick:()=>{e.playing=!e.playing,o()}}),a)};o(),r.appendChild(i),r.appendChild(a),n.appendChild(r)}),n}},w.parameters={...w.parameters,docs:{...w.parameters?.docs,source:{originalSource:`{}`,...w.parameters?.docs?.source}}},T.parameters={...T.parameters,docs:{...T.parameters?.docs,source:{originalSource:`{
  name: 'Playing state',
  args: {
    videoSrc: VID_1,
    playing: true,
    headline: 'Generate anything.',
    body: 'Images, video, audio, and designs — powered by top AI models.'
  }
}`,...T.parameters?.docs?.source}}},E.parameters={...E.parameters,docs:{...E.parameters?.docs,source:{originalSource:`{
  name: 'Paused state',
  args: {
    videoSrc: VID_2,
    playing: false,
    headline: 'Create faster.',
    body: 'AI-powered tools built into every step of your creative workflow.'
  }
}`,...E.parameters?.docs?.source}}},D.parameters={...D.parameters,docs:{...D.parameters?.docs,source:{originalSource:`{
  name: 'No control button',
  args: {
    videoSrc: VID_3,
    showControl: false,
    headline: 'Stay in flow.',
    body: 'Everything you need, right where you need it.'
  }
}`,...D.parameters?.docs?.source}}},O.parameters={...O.parameters,docs:{...O.parameters?.docs,source:{originalSource:`{
  name: 'No media — dark surface',
  args: {
    videoSrc: '',
    imageSrc: '',
    headline: 'Understand quickly.',
    body: 'Ask AI Assistant to summarize and provide insights.'
  }
}`,...O.parameters?.docs?.source}}},k.parameters={...k.parameters,docs:{...k.parameters?.docs,source:{originalSource:`{
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
}`,...k.parameters?.docs?.source}}},A=[`Default`,`Playing`,`Paused`,`NoControl`,`NoMedia`,`Sizes`]})))()}j();export{w as Default,D as NoControl,O as NoMedia,E as Paused,T as Playing,k as Sizes,A as __namedExportsOrder,C as default};