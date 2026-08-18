import{x as n}from"./iframe-Byh1mjJZ.js";import{E as t,M as y}from"./elastic-card-CXmGA7h9.js";import{I as S}from"./icon-button-BpvPa_Ju.js";import{t as v,I as w,s as C,o as x}from"./define-element-DOS9Bj5s.js";import"./preload-helper-CNNBv0Bh.js";import"./unsafe-html-BUKUxZxV.js";import"./directive-DoeGSK_T.js";import"./product-lockup-D_LSQ2L-.js";import"./app-icon-BvxNSwkS.js";import"./chevron-right-CnbUzkxe.js";import"./arrow-right-Do-kvyXB.js";import"./play-wKvwUfiG.js";const _=({width:e=24,height:r=24,hidden:i=!1,title:s="More"}={})=>v`<svg
    xmlns="http://www.w3.org/2000/svg"
    width="${e}"
    height="${r}"
    viewBox="0 0 20 20"
    aria-hidden=${i?"true":"false"}
    role="img"
    fill="currentColor"
    aria-label="${s}"
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
  </svg>`,E=({width:e=24,height:r=24,hidden:i=!1,title:s="More"}={})=>v`<svg
    xmlns="http://www.w3.org/2000/svg"
    width="${e}"
    height="${r}"
    viewBox="0 0 36 36"
    aria-hidden=${i?"true":"false"}
    role="img"
    fill="currentColor"
    aria-label="${s}"
  >
    <circle cx="17.8" cy="18.2" r="3.4" />
    <circle cx="29.5" cy="18.2" r="3.4" />
    <circle cx="6.1" cy="18.2" r="3.4" />
  </svg>`;class D extends w{render(){return C(n),this.spectrumVersion===2?_({hidden:!this.label,title:this.label}):E({hidden:!this.label,title:this.label})}}x("sp-icon-more",D);const $=({width:e=24,height:r=24,hidden:i=!1,title:s="Chevron Right"}={})=>v`<svg
    xmlns="http://www.w3.org/2000/svg"
    width="${e}"
    height="${r}"
    viewBox="0 0 20 20"
    aria-hidden=${i?"true":"false"}
    role="img"
    fill="currentColor"
    aria-label="${s}"
  >
    <path
      d="m7.75,16.46484c-.1875,0-.37402-.06934-.51953-.20996-.29883-.28711-.30859-.76172-.02051-1.05957l4.99902-5.19727-4.98633-5.18359c-.28809-.29785-.27832-.77246.02051-1.05957.2959-.28711.77344-.2793,1.05957.02051l5.4873,5.70312c.28027.29004.28027.74902,0,1.03906l-5.5,5.7168c-.14648.15332-.34375.23047-.54004.23047Z"
      fill="currentColor"
    />
  </svg>`,A=({width:e=24,height:r=24,hidden:i=!1,title:s="Chevron Right"}={})=>v`<svg
    xmlns="http://www.w3.org/2000/svg"
    height="${r}"
    viewBox="0 0 36 36"
    width="${e}"
    aria-hidden=${i?"true":"false"}
    role="img"
    fill="currentColor"
    aria-label="${s}"
  >
    <path
      d="M24 18a1.988 1.988 0 0 1-.585 1.409l-7.983 7.98a2 2 0 1 1-2.871-2.772l.049-.049L19.181 18l-6.572-6.57a2 2 0 0 1 2.773-2.87l.049.049 7.983 7.98A1.988 1.988 0 0 1 24 18Z"
    />
  </svg>`;class k extends w{render(){return C(n),this.spectrumVersion===2?$({hidden:!this.label,title:this.label}):A({hidden:!this.label,title:this.label})}}x("sp-icon-chevron-right",k);const{fn:V}=__STORYBOOK_MODULE_TEST__,o="https://www.adobe.com/upp",T=`${o}/media_1badc9f153c69f16292c23f9752012c9ab7edb851.mp4`,I=`${o}/media_159d163e5e983109aed71b1cb4e1048b4f849ab72.mp4`,M=`${o}/media_1928dd1a3e8e5ed6e7979b5bb37fcd4c273746e62.mp4`,R=`${o}/media_14d261ad034b647cf9ec9e77e1a4e53cbbd31af35.mp4`,f=`${o}/media_11ef0b05657078d2235cbedc8322cd486a4d83a86.mp4`,a=e=>y({src:e,type:"video",aspectRatio:"3:4",autoplay:!0,muted:!0,loop:!0,playsinline:!0,overlay:void 0}),O="https://www.figma.com/api/mcp/asset/10228c1c-8d4f-42dc-93df-6ed860f219d1",B=n`<sp-icon-more aria-hidden="true" style="width:16px;height:16px"></sp-icon-more>`,F=(e="expanded")=>S({ariaLabel:"Open router context",icon:B,size:"md",style:e==="resting"?"solid":"knockout"}),j={title:"Cards/ElasticCard",tags:["autodocs"],render:e=>t(e),parameters:{docs:{description:{component:'<p>Media-forward tile used in Router hero carousels. Mirrors the <strong>ElasticCard — v2</strong> component set (<a href="https://www.figma.com/design/oXIFqtnrYNdTIjqb1sbJau/elastic-card-updates?node-id=11280-224039" target="_blank" rel="noreferrer">node 11280-224039</a>): State × Type axes, inverse-token dark surfaces — no Context axis.</p>'},source:{language:"html",code:`<!-- Resting state (default — all cards rest until hovered) -->
<article class="c-elastic-card" data-state="resting" data-type="standard" data-media-aspect="3:4">
  <header class="c-elastic-card__header">
    <div class="c-product-lockup" data-orientation="horizontal" data-style="label" data-width="fill">…</div>
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

<!-- Expanded state (on hover — dark surface via inverse tokens) -->
<article class="c-elastic-card" data-state="expanded" data-type="standard" data-media-aspect="3:4">
  …
</article>

<!-- Featured type — heading header instead of ProductLockup -->
<article class="c-elastic-card" data-state="resting" data-type="featured" data-media-aspect="3:4">
  <header class="c-elastic-card__header">
    <p class="c-elastic-card__heading">Featured heading</p>
  </header>
  …
</article>`}}},argTypes:{label:{control:"text",description:"Product Lockup label"},app:{control:"text",description:"App slug passed to ProductLockup"},title:{control:"text",description:"Card title — styled as eyebrow (s2a/typography/eyebrow)"},body:{control:"text",description:"Body copy — styled as body-md (s2a/typography/body-md)"},state:{control:{type:"select"},options:["resting","expanded","mobile"],description:"Matches the Figma State axis (ElasticCard — v2, node 11280-224039)"},type:{control:{type:"select"},options:["standard","featured"],description:"v2 Type axis — standard (ProductLockup header) or featured (heading header)"},heading:{control:"text",description:"Featured header text (falls back to label)"},mediaSrc:{control:"text",description:"Image URL — fills the card full-bleed"},mediaAspect:{control:{type:"select"},options:["3:4","4:3","16:9","1:1"],description:"Aspect ratio token applied to the Media component"},mediaOverlay:{control:"boolean",description:"Toggle the scrim gradient overlay"},showCaret:{control:"boolean",description:"Toggle the caret icon in the header"},href:{control:"text",description:"Makes the card an <a> element"},ariaLabel:{control:"text",description:"Accessible label for link/button semantics"},onClick:{action:"clicked"}},args:{label:"Creativity and design",app:"firefly",title:"Create with the top tools.",body:"Do it all with industry-leading apps for design, photo, video, and creative AI.",state:"resting",type:"standard",mediaAspect:"3:4",mediaOverlay:!0,onClick:V()}},d={render:e=>t({...e,mediaTemplate:a(T)})},c={render:e=>t({...e,mediaTemplate:a(I)}),args:{state:"expanded",label:"Content creation",app:"creative-cloud",title:"Generate stunning content easily.",body:"Quickly create and edit images, video, and audio with creative AI.",showCaret:!1}},l={render:e=>t({...e,mediaTemplate:y({src:O,alt:"",aspectRatio:"3:4",overlay:!1})}),args:{state:"mobile",label:"Creativity and design",app:"creative-cloud",title:"Create at the highest level.",body:"Do it all with industry-leading apps for design, photo, video, and creative AI.",showCaret:!1},parameters:{figma:{fileKey:"svi0B0G925V2XG0yX0DDaz",nodeId:"4274:30919"}}},p={render:e=>t({...e,mediaTemplate:a(f)}),args:{type:"featured",heading:"Students and teachers",title:"Students and teachers save big.",body:"Save a bundle on our biggest bundle of top industry creative tools."}},u={render:e=>t({...e,mediaTemplate:a(f)}),args:{type:"featured",state:"expanded",heading:"Students and teachers",title:"Students and teachers save 71%.",body:"Save a bundle on our biggest bundle of top industry creative tools.",showCaret:!1}},m={args:{state:"expanded",showCaret:!1,actionTemplate:F("expanded"),actionLabel:"Open router context"}},h={render:e=>t({...e,state:"expanded",showCaret:!1,mediaTemplate:n`
        <picture>
          <source srcset="https://images.unsplash.com/photo-1470246973918-29a93221c455?auto=format&fit=crop&w=1600&q=80" media="(min-width: 600px)" />
          <img src="https://images.unsplash.com/photo-1470104240373-bc1812eddc9f?auto=format&fit=crop&w=900&q=80" alt="Abstract gradients" loading="lazy" decoding="async" />
        </picture>
      `,mediaOverlay:!0})},g={args:{state:"resting",mediaOverlay:!0}},b={name:"Routing Carousel (adobe.com live)",parameters:{layout:"fullscreen",docs:{description:{story:"Five cards in a centered overflow carousel — one pre-expanded, four resting. Hover any resting card to expand it. Mirrors the HubRouter organism; use HubRouter for the full page-level implementation."}}},render:()=>n`
    <div style="overflow:hidden; padding-block:24px; background:#f5f5f5; border-radius:24px; width:100%">
      <div style="display:flex; gap:8px; align-items:stretch; justify-content:center;">
        ${t({label:"Creativity and design",app:"firefly",title:"Create with the top tools.",body:"Do it all with industry-leading apps for design, photo, video, and creative AI.",state:"resting",mediaTemplate:a(T)})}
        ${t({label:"Content creation",app:"creative-cloud",title:"Generate stunning content easily.",body:"Quickly create and edit images, video, and audio with creative AI.",state:"expanded",mediaTemplate:a(I),showCaret:!1})}
        ${t({label:"PDF and productivity",app:"acrobat-pro",title:"Do it all in less time.",body:"Create, edit, and share PDFs. Make edits and create presentations with AI.",state:"resting",mediaTemplate:a(M)})}
        ${t({label:"Adobe for Business",app:"genstudio",title:"Orchestrate customer experiences.",body:"Deliver business impact, move faster, and personalize at scale.",state:"resting",mediaTemplate:a(R)})}
        ${t({label:"Students and teachers",app:"creative-cloud",title:"Students and teachers save big.",body:"Save a bundle on our biggest bundle of top industry creative tools.",state:"resting",mediaTemplate:a(f)})}
      </div>
    </div>
  `};d.parameters={...d.parameters,docs:{...d.parameters?.docs,source:{originalSource:`{
  render: args => ElasticCard({
    ...args,
    mediaTemplate: cardVideo(VID_CREATIVITY)
  })
}`,...d.parameters?.docs?.source}}};c.parameters={...c.parameters,docs:{...c.parameters?.docs,source:{originalSource:`{
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
}`,...c.parameters?.docs?.source}}};l.parameters={...l.parameters,docs:{...l.parameters?.docs,source:{originalSource:`{
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
}`,...l.parameters?.docs?.source}}};p.parameters={...p.parameters,docs:{...p.parameters?.docs,source:{originalSource:`{
  render: args => ElasticCard({
    ...args,
    mediaTemplate: cardVideo(VID_STUDENTS)
  }),
  args: {
    type: "featured",
    heading: "Students and teachers",
    title: "Students and teachers save big.",
    body: "Save a bundle on our biggest bundle of top industry creative tools."
  }
}`,...p.parameters?.docs?.source}}};u.parameters={...u.parameters,docs:{...u.parameters?.docs,source:{originalSource:`{
  render: args => ElasticCard({
    ...args,
    mediaTemplate: cardVideo(VID_STUDENTS)
  }),
  args: {
    type: "featured",
    state: "expanded",
    heading: "Students and teachers",
    title: "Students and teachers save 71%.",
    body: "Save a bundle on our biggest bundle of top industry creative tools.",
    showCaret: false
  }
}`,...u.parameters?.docs?.source}}};m.parameters={...m.parameters,docs:{...m.parameters?.docs,source:{originalSource:`{
  args: {
    state: "expanded",
    showCaret: false,
    actionTemplate: elasticCardWithAction("expanded"),
    actionLabel: "Open router context"
  }
}`,...m.parameters?.docs?.source}}};h.parameters={...h.parameters,docs:{...h.parameters?.docs,source:{originalSource:`{
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
}`,...h.parameters?.docs?.source}}};g.parameters={...g.parameters,docs:{...g.parameters?.docs,source:{originalSource:`{
  args: {
    state: "resting",
    mediaOverlay: true
  }
}`,...g.parameters?.docs?.source}}};b.parameters={...b.parameters,docs:{...b.parameters?.docs,source:{originalSource:`{
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
    app: "acrobat-pro",
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
}`,...b.parameters?.docs?.source}}};const K=["Resting","Expanded","Mobile","Featured","FeaturedExpanded","WithActionButton","CustomMediaSlot","OverlayScrim","RoutingCarousel"];export{h as CustomMediaSlot,c as Expanded,p as Featured,u as FeaturedExpanded,l as Mobile,g as OverlayScrim,d as Resting,b as RoutingCarousel,m as WithActionButton,K as __namedExportsOrder,j as default};
