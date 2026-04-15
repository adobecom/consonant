import{x as o}from"./iframe-Ddy8VkM0.js";import{N as s}from"./nav-card-button-DCMTKsmH.js";import"./preload-helper-Bg816JyP.js";const c=`.c-nav-card-button {
  display: flex;
  width: 100%;
}

.c-nav-card-button__button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  min-width: 0;
  padding: calc(
      var(--s2a-spacing-sm, 12px) - var(--s2a-border-width-sm, 1px)
    )
    var(--s2a-spacing-lg, 24px);
  gap: var(--s2a-spacing-xs, 8px);
  border: var(--s2a-border-width-sm, 1px) solid var(--s2a-color-content-default, #000000);
  border-radius: var(--s2a-border-radius-round, 999px);
  background-color: var(--s2a-color-background-default, #ffffff);
  color: var(--s2a-color-content-default, #000000);
  font-family: var(--s2a-font-family-adobe-clean, "Adobe Clean", sans-serif);
  font-size: var(--s2a-typography-font-size-label, 14px);
  font-weight: var(--s2a-font-weight-adobe-clean-bold, 700);
  line-height: var(--s2a-font-line-height-2xs, 1.142857);
  letter-spacing: var(--s2a-typography-letter-spacing-label, 0px);
  text-decoration: none;
  cursor: pointer;
  box-sizing: border-box;
  min-height: calc(
    (var(--s2a-spacing-sm, 12px) - var(--s2a-border-width-sm, 1px)) * 2 +
    var(--s2a-font-line-height-2xs, 1.142857) * var(--s2a-typography-font-size-label, 14px) +
    var(--s2a-border-width-sm, 1px) * 2
  );
  backdrop-filter: blur(18.75px); /* Primitive: nav button glass blur */
  transition: background-color 180ms ease, border-color 180ms ease, color 180ms ease;
}

.c-nav-card-button__button:disabled,
.c-nav-card-button__button[data-force-state="disabled"] {
  opacity: var(--s2a-opacity-disabled, 0.48);
  cursor: not-allowed;
}

.c-nav-card-button__button:is(:hover, [data-force-state="hover"]) {
  background-color: var(--s2a-color-background-knockout, #000000);
  border-color: var(--s2a-color-background-knockout, #000000);
  color: var(--s2a-color-content-knockout, #ffffff);
}

.c-nav-card-button__button:is(:active, [data-force-state="active"]) {
  background-color: var(--s2a-color-background-default, #ffffff);
  border-color: var(
    --s2a-color-transparent-white-00,
    rgba(255, 255, 255, 0)
  );
  color: var(--s2a-color-content-default, #000000);
}

.c-nav-card-button__button:is(:focus-visible, [data-force-state="focus"]) {
  outline: var(--s2a-border-width-sm, 1px) solid var(--s2a-color-focus-ring-default, #1473e6);
  outline-offset: 2px;
}

.c-nav-card-button__label {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 0;
}
`,u={title:"Navigation/Nav Card/CTA Button",tags:["autodocs"],render:e=>o`<div style="padding: 32px; background: #f5f5f5; width: 340px;">${s(e)}</div>`,parameters:{docs:{description:{component:`
GNAV pill CTA used under every nav card/menu item.

\`\`\`css
${c}
\`\`\`
        `}}},argTypes:{label:{control:"text",description:"CTA text"},href:{control:"text",description:"Optional link destination"},state:{control:"select",options:["default","hover","active","focus","disabled"],description:"Debug helper — forces a visual state"}},args:{label:"Explore",href:"#",state:"default"}},a={},n={args:{state:"hover"}},r={args:{state:"active"}},t={args:{state:"disabled",href:""}};a.parameters={...a.parameters,docs:{...a.parameters?.docs,source:{originalSource:"{}",...a.parameters?.docs?.source}}};n.parameters={...n.parameters,docs:{...n.parameters?.docs,source:{originalSource:`{
  args: {
    state: "hover"
  }
}`,...n.parameters?.docs?.source}}};r.parameters={...r.parameters,docs:{...r.parameters?.docs,source:{originalSource:`{
  args: {
    state: "active"
  }
}`,...r.parameters?.docs?.source}}};t.parameters={...t.parameters,docs:{...t.parameters?.docs,source:{originalSource:`{
  args: {
    state: "disabled",
    href: ""
  }
}`,...t.parameters?.docs?.source}}};const p=["Default","Hover","Active","Disabled"];export{r as Active,a as Default,t as Disabled,n as Hover,p as __namedExportsOrder,u as default};
