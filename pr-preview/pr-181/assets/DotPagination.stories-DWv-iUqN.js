import{n as e}from"./rolldown-runtime-DkW27tQK.js";import{s as t,t as n}from"./lit-UMo5x0iS.js";var r,i;function a(){return(a=e((()=>{n(),r=e=>{let t=Number.parseInt(e,10);return Number.isNaN(t)?3:Math.min(5,Math.max(1,t))},i=({count:e=3,activeIndex:n=0,ariaLabel:i=`Slide navigation`,onSelect:a}={})=>{let o=r(e),s=Math.min(o-1,Math.max(0,Number.parseInt(n,10)||0)),c=Array.from({length:o},(e,t)=>t);return t`
    <nav class="c-dot-pagination" aria-label="${i}">
      ${c.map(e=>t`
          <button
            type="button"
            class="c-dot-pagination__dot"
            data-state="${e===s?`active`:`inactive`}"
            aria-label="Go to slide ${e+1}"
            aria-current="${e===s?`true`:`false`}"
            @click=${a?()=>a(e):void 0}
          ></button>
        `)}
    </nav>
  `}})))()}function o(){return(o=e((()=>{a()})))()}var s,c,l,u,d,f;function p(){return(p=e((()=>{n(),o(),s={title:`Atoms/DotPagination`,tags:[`autodocs`],render:e=>i(e),parameters:{layout:`centered`,docs:{description:{component:'\nRow of round dots indicating carousel/slideshow position.\n\n**Knockout-only styling** (Figma component 8350:234686 + Dot set 8350:234693):\nwhite dots on dark or media surfaces — the active dot is `content/knockout`,\ninactive dots are `transparent/white/64`. There is no on-light variant in Figma.\n\nDots render as real `<button>` elements in a `<nav>` landmark, with\n`aria-current="true"` on the active dot. Figma caps the set at 5 dots\n(Show Dot 1–5 booleans); `count` mirrors that clamp.\n        '},source:{language:`html`,code:`<nav class="c-dot-pagination" aria-label="Slide navigation">
  <button type="button" class="c-dot-pagination__dot" data-state="active" aria-label="Go to slide 1" aria-current="true"></button>
  <button type="button" class="c-dot-pagination__dot" data-state="inactive" aria-label="Go to slide 2" aria-current="false"></button>
  <button type="button" class="c-dot-pagination__dot" data-state="inactive" aria-label="Go to slide 3" aria-current="false"></button>
</nav>`}}},argTypes:{count:{control:{type:`range`,min:1,max:5,step:1},description:`Number of dots (1–5)`},activeIndex:{control:{type:`number`,min:0,max:4},description:`Zero-based index of the active dot`},ariaLabel:{control:`text`,description:`Accessible name for the nav landmark`}},args:{count:3,activeIndex:0,ariaLabel:`Slide navigation`}},c=e=>t`
  <div
    style="
      display: inline-flex;
      padding: 24px 48px;
      background: var(--s2a-color-background-knockout, #000);
      border-radius: 8px;
    "
  >
    ${e}
  </div>
`,l={render:e=>c(i(e))},u={args:{count:5,activeIndex:2},render:e=>c(i(e))},d={args:{count:4,activeIndex:3},render:e=>c(i(e))},l.parameters={...l.parameters,docs:{...l.parameters?.docs,source:{originalSource:`{
  render: args => darkSurface(DotPagination(args))
}`,...l.parameters?.docs?.source}}},u.parameters={...u.parameters,docs:{...u.parameters?.docs,source:{originalSource:`{
  args: {
    count: 5,
    activeIndex: 2
  },
  render: args => darkSurface(DotPagination(args))
}`,...u.parameters?.docs?.source}}},d.parameters={...d.parameters,docs:{...d.parameters?.docs,source:{originalSource:`{
  args: {
    count: 4,
    activeIndex: 3
  },
  render: args => darkSurface(DotPagination(args))
}`,...d.parameters?.docs?.source}}},f=[`Default`,`FiveDots`,`LastActive`]})))()}p();export{l as Default,u as FiveDots,d as LastActive,f as __namedExportsOrder,s as default};