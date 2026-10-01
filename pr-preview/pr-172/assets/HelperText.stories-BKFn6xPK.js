import{n as e}from"./rolldown-runtime-DkW27tQK.js";import{i as t,s as n,t as r}from"./lit-UMo5x0iS.js";var i;function a(){return(a=e((()=>{r(),i=({text:e=`Helpful hint about this field.`,intent:r=`neutral`,id:i=``}={})=>n`
    <p class="c-helper-text" data-intent=${r} id=${i||t}>
      ${e}
    </p>
  `})))()}function o(){return(o=e((()=>{a()})))()}var s,c,l,u,d;function f(){return(f=e((()=>{r(),o(),s={title:`Atoms/HelperText`,tags:[`autodocs`],render:e=>i(e),parameters:{layout:`centered`,docs:{description:{component:"\nSupporting hint or error text rendered under a form field, in caption type.\n\nIntent `neutral` uses `content/subtle`; intent `error` uses\n`content/utility/error`. Give the element an `id` and reference it from the\npaired control with `aria-describedby`.\n\nMatches Figma component set `HelperText` (node 10243:101699).\n        "},source:{language:`html`,code:`<p class="c-helper-text" data-intent="neutral" id="email-hint">
  Helpful hint about this field.
</p>`}}},argTypes:{text:{control:`text`,description:`Helper text content`},intent:{control:`inline-radio`,options:[`neutral`,`error`],description:`neutral = subtle hint, error = validation message`},id:{control:`text`,description:`id for aria-describedby pairing`}},args:{text:`Helpful hint about this field.`,intent:`neutral`,id:``}},c={args:{intent:`neutral`}},l={args:{intent:`error`,text:`Enter a valid email address.`}},u={name:`In a field context`,render:()=>n`
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
      ${i({text:`Enter a valid email address.`,intent:`error`,id:`sb-helper-demo-hint`})}
    </div>
  `},c.parameters={...c.parameters,docs:{...c.parameters?.docs,source:{originalSource:`{
  args: {
    intent: "neutral"
  }
}`,...c.parameters?.docs?.source}}},l.parameters={...l.parameters,docs:{...l.parameters?.docs,source:{originalSource:`{
  args: {
    intent: "error",
    text: "Enter a valid email address."
  }
}`,...l.parameters?.docs?.source}}},u.parameters={...u.parameters,docs:{...u.parameters?.docs,source:{originalSource:`{
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
}`,...u.parameters?.docs?.source}}},d=[`Neutral`,`Error`,`InFieldContext`]})))()}f();export{l as Error,u as InFieldContext,c as Neutral,d as __namedExportsOrder,s as default};