import{x as r}from"./iframe-Dbi1KmIa.js";import{N as o}from"./nav-card-menu-item-DOa1bsAn.js";import"./preload-helper-HGGjUe6X.js";import"./nav-card-shell-B6Ge4Bai.js";import"./nav-card-button-2b1EhS6H.js";const i=`.c-nav-card-menu-item {
  --c-nav-card-menu-item-title-color: var(--s2a-color-content-default, #000000);
  --c-nav-card-menu-item-link-color: var(--s2a-color-content-default, #000000);
  --c-nav-card-menu-item-link-hover-color: var(--s2a-color-content-default, #000000);
  --c-nav-card-shell-radius: var(--s2a-border-radius-16, 16px);

}

.c-nav-card-menu-item__heading {
  display: flex;
  flex-direction: column;
  gap: var(--s2a-spacing-xs, 8px);
}

.c-nav-card-menu-item__title {
  margin: 0;
  font-family: var(--s2a-font-family-adobe-clean-display, "Adobe Clean Display", sans-serif);
  font-weight: var(--s2a-font-weight-adobe-clean-display-black, 900);
  font-size: var(--s2a-typography-font-size-title-4, 24px);
  line-height: var(--s2a-typography-line-height-title-4, 24px);
  letter-spacing: var(--s2a-typography-letter-spacing-title-4, -0.48px);
  color: var(--c-nav-card-menu-item-title-color);
}

.c-nav-card-menu-item__list {
  display: flex;
  flex-direction: column;
  gap: var(--s2a-spacing-xs, 8px);
  padding: 0;
  margin: 0;
  list-style: none;
}

.c-nav-card-menu-item__row {
  margin: 0;
}

.c-nav-card-menu-item__link {
  display: inline-flex;
  align-items: center;
  gap: var(--s2a-spacing-xs, 8px);
  padding-block: var(--s2a-spacing-xs, 8px);
  font-family: var(--s2a-font-family-adobe-clean, "Adobe Clean", sans-serif);
  font-weight: var(--s2a-font-weight-adobe-clean-regular, 400);
  font-size: var(--s2a-typography-font-size-body-sm, 14px);
  line-height: var(--s2a-typography-line-height-body-sm, 18px);
  letter-spacing: var(--s2a-typography-letter-spacing-body-sm, 0.16px);
  color: var(--c-nav-card-menu-item-link-color);
  text-decoration: none;
  border-radius: var(--s2a-border-radius-2xs, 6px);
  transition: color 160ms ease;
}

.c-nav-card-menu-item__link:hover,
.c-nav-card-menu-item__link[data-state="hover"] {
  color: var(--c-nav-card-menu-item-link-hover-color);
  text-decoration: underline;
  text-underline-offset: 2px;
  text-decoration-thickness: 1px;
}

.c-nav-card-menu-item__link[data-state="active"] {
  font-weight: var(--s2a-font-weight-adobe-clean-bold, 700);
}

.c-nav-card-menu-item__link:focus-visible {
  outline: var(--s2a-border-width-sm, 1px) solid var(--s2a-color-focus-ring-default, #1473e6);
  outline-offset: 2px;
  text-decoration: none;
}

.c-nav-card-menu-item__link-label {
  display: inline-flex;
  align-items: center;
}

.c-nav-card-menu-item__link-icon {
  display: inline-flex;
  align-items: center;
  color: currentColor;
}
`,t=[{label:"Creative Cloud",href:"#"},{label:"Illustrator",href:"#"},{label:"Photoshop",href:"#"},{label:"Premiere Pro",href:"#"},{label:"After Effects",href:"#"},{label:"Substance 3D",href:"#"}],p={title:"Navigation/Nav Card/Menu",tags:["autodocs"],render:a=>r`<div style="padding: 32px; background: #f5f5f5; display: inline-flex;">${o(a)}</div>`,parameters:{docs:{description:{component:`
Navigation card (title + links + CTA).

\`\`\`css
${i}
\`\`\`
        `}}},argTypes:{title:{control:"text",description:"Menu heading"},ctaLabel:{control:"text",description:"Bottom CTA label"},ctaHref:{control:"text",description:"Bottom CTA link"},items:{control:"object",description:"Nav link data"}},args:{title:"Browse",items:t,ctaLabel:"Explore",ctaHref:"#"}},n={},e={args:{items:t.map(a=>({...a,showIconEnd:!0}))}};n.parameters={...n.parameters,docs:{...n.parameters?.docs,source:{originalSource:"{}",...n.parameters?.docs?.source}}};e.parameters={...e.parameters,docs:{...e.parameters?.docs,source:{originalSource:`{
  args: {
    items: sampleItems.map(item => ({
      ...item,
      showIconEnd: true
    }))
  }
}`,...e.parameters?.docs?.source}}};const v=["Default","WithIcons"];export{n as Default,e as WithIcons,v as __namedExportsOrder,p as default};
