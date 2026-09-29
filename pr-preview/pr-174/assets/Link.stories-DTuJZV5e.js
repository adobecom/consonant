import{n as e}from"./rolldown-runtime-DkW27tQK.js";import{i as t,s as n,t as r}from"./lit-UMo5x0iS.js";var i,a;function o(){return(o=e((()=>{r(),i=n`<svg
  xmlns="http://www.w3.org/2000/svg"
  width="12"
  height="12"
  viewBox="0 0 12 12"
  fill="none"
  aria-hidden="true"
>
  <path
    d="M3.64278 11.3571C3.42347 11.3571 3.20417 11.2734 3.03676 11.106C2.70194 10.7712 2.70194 10.2288 3.03676 9.89394L6.93073 5.99996L3.03676 2.10599C2.70194 1.77117 2.70194 1.22875 3.03676 0.893937C3.37157 0.559129 3.91399 0.559129 4.24881 0.893937L8.74881 5.39394C9.08363 5.72875 9.08363 6.27117 8.74881 6.60599L4.24881 11.106C4.0814 11.2734 3.86209 11.3571 3.64278 11.3571Z"
    fill="currentColor"
  /></svg
>`,a=({label:e=`Label`,href:r=`#`,kind:a=`action`,emphasis:o=`default`,context:s=`on-light`,underline:c=!1,showIconEnd:l=!0}={})=>n`
  <a
    class="c-link"
    href=${r}
    data-kind=${a}
    data-emphasis=${o}
    data-context=${s}
    data-underline=${c?``:t}
  >
    <span class="c-link__label">${e}</span>
    ${l?n`<span class="c-link__icon-end">${i}</span>`:t}
  </a>
`})))()}function s(){return(s=e((()=>{o()})))()}var c,l,u,d,f,p,m,h,g;function _(){return(_=e((()=>{r(),s(),c={title:`Atoms/Link`,tags:[`autodocs`],render:e=>a(e),parameters:{layout:`centered`,docs:{description:{component:`
Standalone text link atom — Figma component set \`2609:873\`.

Two kinds: **action** (14px Bold label ramp with trailing chevron — a CTA-style link)
and **text** (16px Regular body-md ramp — an inline body link). Per Figma, hover and
active states carry no visual delta; only \`:focus-visible\` adds the 1px focus ring.
Use the \`underline\` prop when the link sits inside body copy so color is not the
only affordance.
        `},source:{language:`html`,code:`<a class="c-link" href="#" data-kind="action" data-emphasis="default" data-context="on-light">
  <span class="c-link__label">Label</span>
  <span class="c-link__icon-end"><!-- 12px chevron --></span>
</a>`}}},argTypes:{label:{control:`text`,description:`Link text`},href:{control:`text`},kind:{control:`radio`,options:[`action`,`text`],description:`action = label-ramp CTA link · text = body-md inline link`},emphasis:{control:`radio`,options:[`default`,`subtle`],description:`text kind only — subtle drops to content/body-subtle`},context:{control:`radio`,options:[`on-light`,`on-dark`]},underline:{control:`boolean`},showIconEnd:{control:`boolean`}},args:{label:`Learn more`,href:`#`,kind:`action`,emphasis:`default`,context:`on-light`,underline:!1,showIconEnd:!0}},l=e=>n`
  <div
    style="
      padding: 24px 32px;
      background: var(--s2a-color-background-knockout, #000);
      border-radius: 8px;
    "
  >
    ${e}
  </div>
`,u={},d={args:{kind:`text`,label:`Read the documentation`,showIconEnd:!1,underline:!0}},f={args:{kind:`text`,emphasis:`subtle`,label:`Terms of use`,showIconEnd:!1}},p={args:{context:`on-dark`},render:e=>l(a(e))},m={args:{context:`on-dark`,kind:`text`,emphasis:`subtle`,label:`Privacy policy`,showIconEnd:!1},render:e=>l(a(e))},h={parameters:{controls:{disable:!0}},render:()=>n`
    <div style="display: grid; gap: 16px; justify-items: start;">
      ${a({label:`Action link`})}
      ${a({label:`Text link`,kind:`text`,showIconEnd:!1})}
      ${a({label:`Text link · underline`,kind:`text`,underline:!0,showIconEnd:!1})}
      ${a({label:`Text subtle`,kind:`text`,emphasis:`subtle`,showIconEnd:!1})}
      ${l(n`<div style="display: grid; gap: 16px; justify-items: start;">
          ${a({label:`Action on dark`,context:`on-dark`})}
          ${a({label:`Text subtle on dark`,context:`on-dark`,kind:`text`,emphasis:`subtle`,showIconEnd:!1})}
        </div>`)}
    </div>
  `},u.parameters={...u.parameters,docs:{...u.parameters?.docs,source:{originalSource:`{}`,...u.parameters?.docs?.source}}},d.parameters={...d.parameters,docs:{...d.parameters?.docs,source:{originalSource:`{
  args: {
    kind: "text",
    label: "Read the documentation",
    showIconEnd: false,
    underline: true
  }
}`,...d.parameters?.docs?.source}}},f.parameters={...f.parameters,docs:{...f.parameters?.docs,source:{originalSource:`{
  args: {
    kind: "text",
    emphasis: "subtle",
    label: "Terms of use",
    showIconEnd: false
  }
}`,...f.parameters?.docs?.source}}},p.parameters={...p.parameters,docs:{...p.parameters?.docs,source:{originalSource:`{
  args: {
    context: "on-dark"
  },
  render: args => darkSurface(Link(args))
}`,...p.parameters?.docs?.source}}},m.parameters={...m.parameters,docs:{...m.parameters?.docs,source:{originalSource:`{
  args: {
    context: "on-dark",
    kind: "text",
    emphasis: "subtle",
    label: "Privacy policy",
    showIconEnd: false
  },
  render: args => darkSurface(Link(args))
}`,...m.parameters?.docs?.source}}},h.parameters={...h.parameters,docs:{...h.parameters?.docs,source:{originalSource:`{
  parameters: {
    controls: {
      disable: true
    }
  },
  render: () => html\`
    <div style="display: grid; gap: 16px; justify-items: start;">
      \${Link({
    label: "Action link"
  })}
      \${Link({
    label: "Text link",
    kind: "text",
    showIconEnd: false
  })}
      \${Link({
    label: "Text link · underline",
    kind: "text",
    underline: true,
    showIconEnd: false
  })}
      \${Link({
    label: "Text subtle",
    kind: "text",
    emphasis: "subtle",
    showIconEnd: false
  })}
      \${darkSurface(html\`<div style="display: grid; gap: 16px; justify-items: start;">
          \${Link({
    label: "Action on dark",
    context: "on-dark"
  })}
          \${Link({
    label: "Text subtle on dark",
    context: "on-dark",
    kind: "text",
    emphasis: "subtle",
    showIconEnd: false
  })}
        </div>\`)}
    </div>
  \`
}`,...h.parameters?.docs?.source}}},g=[`Action`,`TextLink`,`TextSubtle`,`OnDark`,`OnDarkTextSubtle`,`AllVariants`]})))()}_();export{u as Action,h as AllVariants,p as OnDark,m as OnDarkTextSubtle,d as TextLink,f as TextSubtle,g as __namedExportsOrder,c as default};