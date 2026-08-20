import{E as s,x as a}from"./iframe-BoGTDT1x.js";import"./preload-helper-BvGMX4d4.js";const i=({text:n="Helpful hint about this field.",intent:o="neutral",id:d=""}={})=>a`
    <p class="c-helper-text" data-intent=${o} id=${d||s}>
      ${n}
    </p>
  `,c={title:"Atoms/HelperText",tags:["autodocs"],render:n=>i(n),parameters:{layout:"centered",docs:{description:{component:"\nSupporting hint or error text rendered under a form field, in caption type.\n\nIntent `neutral` uses `content/subtle`; intent `error` uses\n`content/utility/error`. Give the element an `id` and reference it from the\npaired control with `aria-describedby`.\n\nMatches Figma component set `HelperText` (node 10243:101699).\n        "},source:{language:"html",code:`<p class="c-helper-text" data-intent="neutral" id="email-hint">
  Helpful hint about this field.
</p>`}}},argTypes:{text:{control:"text",description:"Helper text content"},intent:{control:"inline-radio",options:["neutral","error"],description:"neutral = subtle hint, error = validation message"},id:{control:"text",description:"id for aria-describedby pairing"}},args:{text:"Helpful hint about this field.",intent:"neutral",id:""}},e={args:{intent:"neutral"}},r={args:{intent:"error",text:"Enter a valid email address."}},t={name:"In a field context",render:()=>a`
    <div style="display: flex; flex-direction: column; gap: 8px; width: 280px;">
      <label class="c-label" for="sb-helper-demo-input">Email address</label>
      <input
        id="sb-helper-demo-input"
        type="email"
        aria-describedby="sb-helper-demo-hint"
        aria-invalid="true"
        placeholder="you@example.com"
        style="
          padding: 12px 16px;
          font: inherit;
          border: 1px solid var(--s2a-color-border-utility-error, #d73220);
          border-radius: var(--s2a-border-radius-sm, 12px);
        "
      />
      ${i({text:"Enter a valid email address.",intent:"error",id:"sb-helper-demo-hint"})}
    </div>
  `};e.parameters={...e.parameters,docs:{...e.parameters?.docs,source:{originalSource:`{
  args: {
    intent: "neutral"
  }
}`,...e.parameters?.docs?.source}}};r.parameters={...r.parameters,docs:{...r.parameters?.docs,source:{originalSource:`{
  args: {
    intent: "error",
    text: "Enter a valid email address."
  }
}`,...r.parameters?.docs?.source}}};t.parameters={...t.parameters,docs:{...t.parameters?.docs,source:{originalSource:`{
  name: "In a field context",
  render: () => html\`
    <div style="display: flex; flex-direction: column; gap: 8px; width: 280px;">
      <label class="c-label" for="sb-helper-demo-input">Email address</label>
      <input
        id="sb-helper-demo-input"
        type="email"
        aria-describedby="sb-helper-demo-hint"
        aria-invalid="true"
        placeholder="you@example.com"
        style="
          padding: 12px 16px;
          font: inherit;
          border: 1px solid var(--s2a-color-border-utility-error, #d73220);
          border-radius: var(--s2a-border-radius-sm, 12px);
        "
      />
      \${HelperText({
    text: "Enter a valid email address.",
    intent: "error",
    id: "sb-helper-demo-hint"
  })}
    </div>
  \`
}`,...t.parameters?.docs?.source}}};const u=["Neutral","Error","InFieldContext"];export{r as Error,t as InFieldContext,e as Neutral,u as __namedExportsOrder,c as default};
