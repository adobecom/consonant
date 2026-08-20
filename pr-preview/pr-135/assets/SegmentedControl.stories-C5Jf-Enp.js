import{x as o}from"./iframe-Cu0bMW1j.js";import"./preload-helper-BZk2PG9u.js";const i=({segments:e=["Individuals","Businesses","AI Pro"],selected:c=0,ariaLabel:d="Audience"}={})=>o`
  <div class="c-segmented-control" role="tablist" aria-label="${d}">
    ${e.map((m,l)=>o`
        <button
          class="c-segmented-control__item"
          role="tab"
          aria-selected="${l===c?"true":"false"}"
          tabindex=${l===c?"0":"-1"}
        >
          <span class="c-segmented-control__cta">${m}</span>
        </button>
      `)}
  </div>
`,g={title:"Atoms/SegmentedControl",tags:["autodocs"],render:e=>i(e),parameters:{layout:"centered",docs:{description:{component:`
Pill switcher on a transparent-black-04 wash. The active segment is a fully-rounded
knockout-black pill inset 4px top/bottom with a white label; inactive labels sit at
transparent-black-64.

Figma ships a fixed 3-up set (Selected=1|2|3); this implementation generalizes to any
segment count with the same visual spec. Modeled as a tablist (content switcher) —
swap to radiogroup semantics if capturing a form value. Arrow-key navigation must be
wired by the consumer.

Matches Figma \`SegmentItem\` (10104:100998) + \`SegmentedControl/3-up\` (10104:101023).
        `},source:{language:"html",code:`<div class="c-segmented-control" role="tablist" aria-label="Audience">
  <button class="c-segmented-control__item" role="tab" aria-selected="true">
    <span class="c-segmented-control__cta">Individuals</span>
  </button>
  <button class="c-segmented-control__item" role="tab" aria-selected="false" tabindex="-1">
    <span class="c-segmented-control__cta">Businesses</span>
  </button>
</div>`}}},argTypes:{selected:{control:{type:"number",min:0,max:2,step:1},description:"Index of the active segment (0-based)"}}},t={args:{segments:["Individuals","Businesses","AI Pro"],selected:0}},a={args:{segments:["Individuals","Businesses","AI Pro"],selected:1}},n={args:{segments:["Individuals","Businesses","AI Pro"],selected:2}},r={args:{segments:["Monthly","Yearly"],selected:0}},s={render:()=>o`
    <div style="display: flex; flex-direction: column; gap: 24px; align-items: flex-start;">
      ${[0,1,2].map(e=>i({selected:e}))}
    </div>
  `};t.parameters={...t.parameters,docs:{...t.parameters?.docs,source:{originalSource:`{
  args: {
    segments: ["Individuals", "Businesses", "AI Pro"],
    selected: 0
  }
}`,...t.parameters?.docs?.source}}};a.parameters={...a.parameters,docs:{...a.parameters?.docs,source:{originalSource:`{
  args: {
    segments: ["Individuals", "Businesses", "AI Pro"],
    selected: 1
  }
}`,...a.parameters?.docs?.source}}};n.parameters={...n.parameters,docs:{...n.parameters?.docs,source:{originalSource:`{
  args: {
    segments: ["Individuals", "Businesses", "AI Pro"],
    selected: 2
  }
}`,...n.parameters?.docs?.source}}};r.parameters={...r.parameters,docs:{...r.parameters?.docs,source:{originalSource:`{
  args: {
    segments: ["Monthly", "Yearly"],
    selected: 0
  }
}`,...r.parameters?.docs?.source}}};s.parameters={...s.parameters,docs:{...s.parameters?.docs,source:{originalSource:`{
  render: () => html\`
    <div style="display: flex; flex-direction: column; gap: 24px; align-items: flex-start;">
      \${[0, 1, 2].map(selected => SegmentedControl({
    selected
  }))}
    </div>
  \`
}`,...s.parameters?.docs?.source},description:{story:"All three Figma Selected variants side by side.",...s.parameters?.docs?.description}}};const b=["Default","SecondSelected","ThirdSelected","TwoSegments","AllVariants"];export{s as AllVariants,t as Default,a as SecondSelected,n as ThirdSelected,r as TwoSegments,b as __namedExportsOrder,g as default};
