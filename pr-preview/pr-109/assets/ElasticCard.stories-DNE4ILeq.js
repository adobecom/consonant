import{x as n}from"./iframe-CnwbX9eU.js";import{E as t,M as f}from"./elastic-card-DT10j-mS.js";import{I as x}from"./icon-button-4x0TwcW1.js";import{t as g,I as v,s as b,o as y}from"./define-element-DnPp1Div.js";import"./preload-helper-CQ-LpfZZ.js";import"./unsafe-html-B_Pr6woV.js";import"./directive-DoeGSK_T.js";import"./product-lockup-B2W_GPrO.js";import"./app-icon-DqFOmCmY.js";import"./chevron-right-CnbUzkxe.js";import"./arrow-right-Do-kvyXB.js";import"./play-6eLew0w_.js";const I=({width:e=24,height:a=24,hidden:r=!1,title:i="More"}={})=>g`<svg
    xmlns="http://www.w3.org/2000/svg"
    width="${e}"
    height="${a}"
    viewBox="0 0 20 20"
    aria-hidden=${r?"true":"false"}
    role="img"
    fill="currentColor"
    aria-label="${i}"
  >
    <circle cx="10" cy="10.02114" r="1.5" fill="currentColor" />
    <path
      d="m10,8.5c-.82843,0-1.5.67157-1.5,1.5s.67157,1.5,1.5,1.5,1.5-.67157,1.5-1.5-.67157-1.5-1.5-1.5Z"
      fill="currentColor"
    />
    <circle cx="4" cy="10.02114" r="1.5" fill="currentColor" />
    <circle cx="4" cy="10" r="1.5" fill="currentColor" />
    <circle cx="16" cy="10.02114" r="1.5" fill="currentColor" />
    <circle cx="16" cy="10" r="1.5" fill="currentColor" />
  </svg>`,T=({width:e=24,height:a=24,hidden:r=!1,title:i="More"}={})=>g`<svg
    xmlns="http://www.w3.org/2000/svg"
    width="${e}"
    height="${a}"
    viewBox="0 0 36 36"
    aria-hidden=${r?"true":"false"}
    role="img"
    fill="currentColor"
    aria-label="${i}"
  >
    <circle cx="17.8" cy="18.2" r="3.4" />
    <circle cx="29.5" cy="18.2" r="3.4" />
    <circle cx="6.1" cy="18.2" r="3.4" />
  </svg>`;class _ extends v{render(){return b(n),this.spectrumVersion===2?I({hidden:!this.label,title:this.label}):T({hidden:!this.label,title:this.label})}}y("sp-icon-more",_);const D=({width:e=24,height:a=24,hidden:r=!1,title:i="Chevron Right"}={})=>g`<svg
    xmlns="http://www.w3.org/2000/svg"
    width="${e}"
    height="${a}"
    viewBox="0 0 20 20"
    aria-hidden=${r?"true":"false"}
    role="img"
    fill="currentColor"
    aria-label="${i}"
  >
    <path
      d="m7.75,16.46484c-.1875,0-.37402-.06934-.51953-.20996-.29883-.28711-.30859-.76172-.02051-1.05957l4.99902-5.19727-4.98633-5.18359c-.28809-.29785-.27832-.77246.02051-1.05957.2959-.28711.77344-.2793,1.05957.02051l5.4873,5.70312c.28027.29004.28027.74902,0,1.03906l-5.5,5.7168c-.14648.15332-.34375.23047-.54004.23047Z"
      fill="currentColor"
    />
  </svg>`,E=({width:e=24,height:a=24,hidden:r=!1,title:i="Chevron Right"}={})=>g`<svg
    xmlns="http://www.w3.org/2000/svg"
    height="${a}"
    viewBox="0 0 36 36"
    width="${e}"
    aria-hidden=${r?"true":"false"}
    role="img"
    fill="currentColor"
    aria-label="${i}"
  >
    <path
      d="M24 18a1.988 1.988 0 0 1-.585 1.409l-7.983 7.98a2 2 0 1 1-2.871-2.772l.049-.049L19.181 18l-6.572-6.57a2 2 0 0 1 2.773-2.87l.049.049 7.983 7.98A1.988 1.988 0 0 1 24 18Z"
    />
  </svg>`;class $ extends v{render(){return b(n),this.spectrumVersion===2?D({hidden:!this.label,title:this.label}):E({hidden:!this.label,title:this.label})}}y("sp-icon-chevron-right",$);const{fn:A}=__STORYBOOK_MODULE_TEST__,s="https://www.adobe.com/upp",w=`${s}/media_1badc9f153c69f16292c23f9752012c9ab7edb851.mp4`,C=`${s}/media_159d163e5e983109aed71b1cb4e1048b4f849ab72.mp4`,S=`${s}/media_1928dd1a3e8e5ed6e7979b5bb37fcd4c273746e62.mp4`,M=`${s}/media_14d261ad034b647cf9ec9e77e1a4e53cbbd31af35.mp4`,V=`${s}/media_11ef0b05657078d2235cbedc8322cd486a4d83a86.mp4`,o=e=>f({src:e,type:"video",aspectRatio:"3:4",autoplay:!0,muted:!0,loop:!0,playsinline:!0,overlay:void 0}),R="https://www.figma.com/api/mcp/asset/10228c1c-8d4f-42dc-93df-6ed860f219d1",k=n`<sp-icon-more aria-hidden="true" style="width:16px;height:16px"></sp-icon-more>`,O=(e="expanded")=>x({ariaLabel:"Open router context",icon:k,size:"md",context:e==="resting"?"on-light":"on-dark"}),W={title:"Molecules/ElasticCard",tags:["autodocs"],render:e=>t(e),parameters:{docs:{description:{component:'<p>Media-forward tile used in Router hero carousels. Mirrors matt-atoms component set (<a href="https://www.figma.com/design/svi0B0G925V2XG0yX0DDaz/matt-atoms?node-id=4006-461133" target="_blank" rel="noreferrer">node 4006-461133</a>).</p>'},source:{language:"html",code:`<!-- Resting state (default — all cards rest until hovered) -->
<article class="c-elastic-card" data-state="resting" data-media-aspect="3:4">
  <header class="c-elastic-card__header">
    <div class="c-product-lockup" data-orientation="horizontal" data-style="label" data-context="on-light" data-width="fill">…</div>
  </header>
  <div class="c-elastic-card__media">
    <figure class="c-media" data-aspect="3:4" data-fit="cover">
      <video src="…" autoplay muted loop playsinline></video>
      <span class="c-media__overlay" aria-hidden="true"></span>
    </figure>
  </div>
  <div class="c-elastic-card__body">
    <div class="c-elastic-card__body-content">
      <p class="c-elastic-card__title">Adobe Express</p>
      <p class="c-elastic-card__body-text">Create standout content with quick actions and guided templates.</p>
    </div>
  </div>
</article>

<!-- Expanded state (on hover — dark surface, full copy visible) -->
<article class="c-elastic-card" data-state="expanded" data-media-aspect="3:4">
  …
</article>`}}},argTypes:{label:{control:"text",description:"Product Lockup label"},app:{control:"text",description:"App slug passed to ProductLockup"},title:{control:"text",description:"Card title — styled as eyebrow (s2a/typography/eyebrow)"},body:{control:"text",description:"Body copy — styled as body-md (s2a/typography/body-md)"},state:{control:{type:"select"},options:["resting","expanded","mobile"],description:"Matches the Figma State property (node 4006-461133)"},mediaSrc:{control:"text",description:"Image URL — fills the card full-bleed"},mediaAspect:{control:{type:"select"},options:["3:4","4:3","16:9","1:1"],description:"Aspect ratio token applied to the Media component"},mediaOverlay:{control:"boolean",description:"Toggle the scrim gradient overlay"},showCaret:{control:"boolean",description:"Toggle the caret icon in the header"},href:{control:"text",description:"Makes the card an <a> element"},ariaLabel:{control:"text",description:"Accessible label for link/button semantics"},onClick:{action:"clicked"}},args:{label:"Creativity and design",app:"firefly",title:"Create with the top tools.",body:"Do it all with industry-leading apps for design, photo, video, and creative AI.",state:"resting",mediaAspect:"3:4",mediaOverlay:!0,onClick:A()}},d={render:e=>t({...e,mediaTemplate:o(w)})},l={render:e=>t({...e,mediaTemplate:o(C)}),args:{state:"expanded",label:"Content creation",app:"creative-cloud",title:"Generate stunning content easily.",body:"Quickly create and edit images, video, and audio with creative AI.",showCaret:!1}},c={render:e=>t({...e,mediaTemplate:f({src:R,alt:"",aspectRatio:"3:4",overlay:!1})}),args:{state:"mobile",label:"Creativity and design",app:"creative-cloud",title:"Create at the highest level.",body:"Do it all with industry-leading apps for design, photo, video, and creative AI.",showCaret:!1},parameters:{figma:{fileKey:"svi0B0G925V2XG0yX0DDaz",nodeId:"4274:30919"}}},p={args:{state:"expanded",showCaret:!1,actionTemplate:O("expanded"),actionLabel:"Open router context"}},m={render:e=>t({...e,state:"expanded",showCaret:!1,mediaTemplate:n`
        <picture>
          <source srcset="https://images.unsplash.com/photo-1470246973918-29a93221c455?auto=format&fit=crop&w=1600&q=80" media="(min-width: 600px)" />
          <img src="https://images.unsplash.com/photo-1470104240373-bc1812eddc9f?auto=format&fit=crop&w=900&q=80" alt="Abstract gradients" loading="lazy" decoding="async" />
        </picture>
      `,mediaOverlay:!0})},u={args:{state:"resting",mediaOverlay:!0}},h={name:"Routing Carousel (adobe.com live)",parameters:{layout:"fullscreen",docs:{description:{story:"Five cards in a centered overflow carousel — one pre-expanded, four resting. Hover any resting card to expand it. Mirrors the HubRouter organism; use HubRouter for the full page-level implementation."}}},render:()=>n`
    <div style="overflow:hidden; padding-block:24px; background:#f5f5f5; border-radius:24px; width:100%">
      <div style="display:flex; gap:8px; align-items:stretch; justify-content:center;">
        ${t({label:"Creativity and design",app:"firefly",title:"Create with the top tools.",body:"Do it all with industry-leading apps for design, photo, video, and creative AI.",state:"resting",mediaTemplate:o(w)})}
        ${t({label:"Content creation",app:"creative-cloud",title:"Generate stunning content easily.",body:"Quickly create and edit images, video, and audio with creative AI.",state:"expanded",mediaTemplate:o(C),showCaret:!1})}
        ${t({label:"PDF and productivity",app:"acrobat",title:"Do it all in less time.",body:"Create, edit, and share PDFs. Make edits and create presentations with AI.",state:"resting",mediaTemplate:o(S)})}
        ${t({label:"Adobe for Business",app:"genstudio",title:"Orchestrate customer experiences.",body:"Deliver business impact, move faster, and personalize at scale.",state:"resting",mediaTemplate:o(M)})}
        ${t({label:"Students and teachers",app:"creative-cloud",title:"Students and teachers save big.",body:"Save a bundle on our biggest bundle of top industry creative tools.",state:"resting",mediaTemplate:o(V)})}
      </div>
    </div>
  `};d.parameters={...d.parameters,docs:{...d.parameters?.docs,source:{originalSource:`{
  render: args => ElasticCard({
    ...args,
    mediaTemplate: cardVideo(VID_CREATIVITY)
  })
}`,...d.parameters?.docs?.source}}};l.parameters={...l.parameters,docs:{...l.parameters?.docs,source:{originalSource:`{
  render: args => ElasticCard({
    ...args,
    mediaTemplate: cardVideo(VID_CONTENT)
  }),
  args: {
    state: "expanded",
    label: "Content creation",
    app: "creative-cloud",
    title: "Generate stunning content easily.",
    body: "Quickly create and edit images, video, and audio with creative AI.",
    showCaret: false
  }
}`,...l.parameters?.docs?.source}}};c.parameters={...c.parameters,docs:{...c.parameters?.docs,source:{originalSource:`{
  render: args => ElasticCard({
    ...args,
    mediaTemplate: Media({
      src: MEDIA_MOBILE,
      alt: "",
      aspectRatio: "3:4",
      overlay: false
    })
  }),
  args: {
    state: "mobile",
    label: "Creativity and design",
    app: "creative-cloud",
    title: "Create at the highest level.",
    body: "Do it all with industry-leading apps for design, photo, video, and creative AI.",
    showCaret: false
  },
  parameters: {
    figma: {
      fileKey: "svi0B0G925V2XG0yX0DDaz",
      nodeId: "4274:30919"
    }
  }
}`,...c.parameters?.docs?.source}}};p.parameters={...p.parameters,docs:{...p.parameters?.docs,source:{originalSource:`{
  args: {
    state: "expanded",
    showCaret: false,
    actionTemplate: elasticCardWithAction("expanded"),
    actionLabel: "Open router context"
  }
}`,...p.parameters?.docs?.source}}};m.parameters={...m.parameters,docs:{...m.parameters?.docs,source:{originalSource:`{
  render: args => ElasticCard({
    ...args,
    state: "expanded",
    showCaret: false,
    mediaTemplate: html\`
        <picture>
          <source srcset="https://images.unsplash.com/photo-1470246973918-29a93221c455?auto=format&fit=crop&w=1600&q=80" media="(min-width: 600px)" />
          <img src="https://images.unsplash.com/photo-1470104240373-bc1812eddc9f?auto=format&fit=crop&w=900&q=80" alt="Abstract gradients" loading="lazy" decoding="async" />
        </picture>
      \`,
    mediaOverlay: true
  })
}`,...m.parameters?.docs?.source}}};u.parameters={...u.parameters,docs:{...u.parameters?.docs,source:{originalSource:`{
  args: {
    state: "resting",
    mediaOverlay: true
  }
}`,...u.parameters?.docs?.source}}};h.parameters={...h.parameters,docs:{...h.parameters?.docs,source:{originalSource:`{
  name: "Routing Carousel (adobe.com live)",
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        story: "Five cards in a centered overflow carousel — one pre-expanded, four resting. Hover any resting card to expand it. " + "Mirrors the HubRouter organism; use HubRouter for the full page-level implementation."
      }
    }
  },
  render: () => html\`
    <div style="overflow:hidden; padding-block:24px; background:#f5f5f5; border-radius:24px; width:100%">
      <div style="display:flex; gap:8px; align-items:stretch; justify-content:center;">
        \${ElasticCard({
    label: "Creativity and design",
    app: "firefly",
    title: "Create with the top tools.",
    body: "Do it all with industry-leading apps for design, photo, video, and creative AI.",
    state: "resting",
    mediaTemplate: cardVideo(VID_CREATIVITY)
  })}
        \${ElasticCard({
    label: "Content creation",
    app: "creative-cloud",
    title: "Generate stunning content easily.",
    body: "Quickly create and edit images, video, and audio with creative AI.",
    state: "expanded",
    mediaTemplate: cardVideo(VID_CONTENT),
    showCaret: false
  })}
        \${ElasticCard({
    label: "PDF and productivity",
    app: "acrobat",
    title: "Do it all in less time.",
    body: "Create, edit, and share PDFs. Make edits and create presentations with AI.",
    state: "resting",
    mediaTemplate: cardVideo(VID_PDF)
  })}
        \${ElasticCard({
    label: "Adobe for Business",
    app: "genstudio",
    title: "Orchestrate customer experiences.",
    body: "Deliver business impact, move faster, and personalize at scale.",
    state: "resting",
    mediaTemplate: cardVideo(VID_BUSINESS)
  })}
        \${ElasticCard({
    label: "Students and teachers",
    app: "creative-cloud",
    title: "Students and teachers save big.",
    body: "Save a bundle on our biggest bundle of top industry creative tools.",
    state: "resting",
    mediaTemplate: cardVideo(VID_STUDENTS)
  })}
      </div>
    </div>
  \`
}`,...h.parameters?.docs?.source}}};const Y=["Resting","Expanded","Mobile","WithActionButton","CustomMediaSlot","OverlayScrim","RoutingCarousel"];export{m as CustomMediaSlot,l as Expanded,c as Mobile,u as OverlayScrim,d as Resting,h as RoutingCarousel,p as WithActionButton,Y as __namedExportsOrder,W as default};
