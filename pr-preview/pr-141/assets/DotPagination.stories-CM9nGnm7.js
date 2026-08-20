import{x as s}from"./iframe-D7du4RHc.js";import"./preload-helper-DyU_JVX_.js";const v=t=>{const e=Number.parseInt(t,10);return Number.isNaN(e)?3:Math.min(5,Math.max(1,e))},i=({count:t=3,activeIndex:e=0,ariaLabel:p="Slide navigation",onSelect:d}={})=>{const u=v(t),l=Math.min(u-1,Math.max(0,Number.parseInt(e,10)||0)),m=Array.from({length:u},(a,g)=>g);return s`
    <nav class="c-dot-pagination" aria-label="${p}">
      ${m.map(a=>s`
          <button
            type="button"
            class="c-dot-pagination__dot"
            data-state="${a===l?"active":"inactive"}"
            aria-label="Go to slide ${a+1}"
            aria-current="${a===l?"true":"false"}"
            @click=${d?()=>d(a):void 0}
          ></button>
        `)}
    </nav>
  `},h={title:"Atoms/DotPagination",tags:["autodocs"],render:t=>i(t),parameters:{layout:"centered",docs:{description:{component:'\nRow of round dots indicating carousel/slideshow position.\n\n**Knockout-only styling** (Figma component 8350:234686 + Dot set 8350:234693):\nwhite dots on dark or media surfaces — the active dot is `content/knockout`,\ninactive dots are `transparent/white/64`. There is no on-light variant in Figma.\n\nDots render as real `<button>` elements in a `<nav>` landmark, with\n`aria-current="true"` on the active dot. Figma caps the set at 5 dots\n(Show Dot 1–5 booleans); `count` mirrors that clamp.\n        '},source:{language:"html",code:`<nav class="c-dot-pagination" aria-label="Slide navigation">
  <button type="button" class="c-dot-pagination__dot" data-state="active" aria-label="Go to slide 1" aria-current="true"></button>
  <button type="button" class="c-dot-pagination__dot" data-state="inactive" aria-label="Go to slide 2" aria-current="false"></button>
  <button type="button" class="c-dot-pagination__dot" data-state="inactive" aria-label="Go to slide 3" aria-current="false"></button>
</nav>`}}},argTypes:{count:{control:{type:"range",min:1,max:5,step:1},description:"Number of dots (1–5)"},activeIndex:{control:{type:"number",min:0,max:4},description:"Zero-based index of the active dot"},ariaLabel:{control:"text",description:"Accessible name for the nav landmark"}},args:{count:3,activeIndex:0,ariaLabel:"Slide navigation"}},c=t=>s`
  <div
    style="
      display: inline-flex;
      padding: 24px 48px;
      background: var(--s2a-color-background-knockout, #000);
      border-radius: 8px;
    "
  >
    ${t}
  </div>
`,n={render:t=>c(i(t))},o={args:{count:5,activeIndex:2},render:t=>c(i(t))},r={args:{count:4,activeIndex:3},render:t=>c(i(t))};n.parameters={...n.parameters,docs:{...n.parameters?.docs,source:{originalSource:`{
  render: args => darkSurface(DotPagination(args))
}`,...n.parameters?.docs?.source}}};o.parameters={...o.parameters,docs:{...o.parameters?.docs,source:{originalSource:`{
  args: {
    count: 5,
    activeIndex: 2
  },
  render: args => darkSurface(DotPagination(args))
}`,...o.parameters?.docs?.source}}};r.parameters={...r.parameters,docs:{...r.parameters?.docs,source:{originalSource:`{
  args: {
    count: 4,
    activeIndex: 3
  },
  render: args => darkSurface(DotPagination(args))
}`,...r.parameters?.docs?.source}}};const x=["Default","FiveDots","LastActive"];export{n as Default,o as FiveDots,r as LastActive,x as __namedExportsOrder,h as default};
