import{n as e}from"./rolldown-runtime-DkW27tQK.js";import{s as t,t as n}from"./lit-UMo5x0iS.js";var r;function i(){return(i=e((()=>{n(),r=({segments:e=[`Individuals`,`Businesses`,`AI Pro`],selected:n=0,ariaLabel:r=`Audience`}={})=>t`
  <div class="c-segmented-control" role="tablist" aria-label="${r}">
    ${e.map((e,r)=>t`
        <button
          class="c-segmented-control__item"
          role="tab"
          aria-selected="${r===n?`true`:`false`}"
          tabindex=${r===n?`0`:`-1`}
        >
          <span class="c-segmented-control__cta">${e}</span>
        </button>
      `)}
  </div>
`})))()}function a(){return(a=e((()=>{i()})))()}var o,s,c,l,u,d,f;function p(){return(p=e((()=>{n(),a(),o={title:`Atoms/SegmentedControl`,tags:[`autodocs`],render:e=>r(e),parameters:{layout:`centered`,docs:{description:{component:`
Pill switcher on a transparent-black-04 wash. The active segment is a fully-rounded
knockout-black pill inset 4px top/bottom with a white label; inactive labels sit at
transparent-black-64.

Figma ships a fixed 3-up set (Selected=1|2|3); this implementation generalizes to any
segment count with the same visual spec. Modeled as a tablist (content switcher) —
swap to radiogroup semantics if capturing a form value. Arrow-key navigation must be
wired by the consumer.

Matches Figma \`SegmentItem\` (10104:100998) + \`SegmentedControl/3-up\` (10104:101023).
        `},source:{language:`html`,code:`<div class="c-segmented-control" role="tablist" aria-label="Audience">
  <button class="c-segmented-control__item" role="tab" aria-selected="true">
    <span class="c-segmented-control__cta">Individuals</span>
  </button>
  <button class="c-segmented-control__item" role="tab" aria-selected="false" tabindex="-1">
    <span class="c-segmented-control__cta">Businesses</span>
  </button>
</div>`}}},argTypes:{selected:{control:{type:`number`,min:0,max:2,step:1},description:`Index of the active segment (0-based)`}}},s={args:{segments:[`Individuals`,`Businesses`,`AI Pro`],selected:0}},c={args:{segments:[`Individuals`,`Businesses`,`AI Pro`],selected:1}},l={args:{segments:[`Individuals`,`Businesses`,`AI Pro`],selected:2}},u={args:{segments:[`Monthly`,`Yearly`],selected:0}},d={render:()=>t`
    <div style="display: flex; flex-direction: column; gap: 24px; align-items: flex-start;">
      ${[0,1,2].map(e=>r({selected:e}))}
    </div>
  `},s.parameters={...s.parameters,docs:{...s.parameters?.docs,source:{originalSource:`{
  args: {
    segments: ["Individuals", "Businesses", "AI Pro"],
    selected: 0
  }
}`,...s.parameters?.docs?.source}}},c.parameters={...c.parameters,docs:{...c.parameters?.docs,source:{originalSource:`{
  args: {
    segments: ["Individuals", "Businesses", "AI Pro"],
    selected: 1
  }
}`,...c.parameters?.docs?.source}}},l.parameters={...l.parameters,docs:{...l.parameters?.docs,source:{originalSource:`{
  args: {
    segments: ["Individuals", "Businesses", "AI Pro"],
    selected: 2
  }
}`,...l.parameters?.docs?.source}}},u.parameters={...u.parameters,docs:{...u.parameters?.docs,source:{originalSource:`{
  args: {
    segments: ["Monthly", "Yearly"],
    selected: 0
  }
}`,...u.parameters?.docs?.source}}},d.parameters={...d.parameters,docs:{...d.parameters?.docs,source:{originalSource:`{
  render: () => html\`
    <div style="display: flex; flex-direction: column; gap: 24px; align-items: flex-start;">
      \${[0, 1, 2].map(selected => SegmentedControl({
    selected
  }))}
    </div>
  \`
}`,...d.parameters?.docs?.source},description:{story:`All three Figma Selected variants side by side.`,...d.parameters?.docs?.description}}},f=[`Default`,`SecondSelected`,`ThirdSelected`,`TwoSegments`,`AllVariants`]})))()}p();export{d as AllVariants,s as Default,c as SecondSelected,l as ThirdSelected,u as TwoSegments,f as __namedExportsOrder,o as default};