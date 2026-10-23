import{n as e}from"./rolldown-runtime-C0FnF6B9.js";import{c as t,t as n}from"./lit-DRzJKe3d.js";import{n as r,r as i,t as a}from"./app-icon-JdLRqGJJ.js";import{t as o}from"./AppIcon-BCqSFiLW.js";var s,c,l,u,d,f,p,m,h,g,_,v,y,b;function x(){return(x=e((()=>{n(),o(),s=[`Cross Cloud`,`Gen AI`,`Adobe Express`,`Document Cloud`,`Digital Imaging`,`Digital Video & Audio`,`Print & Publishing`,`3D & AR`,`Experience Cloud`,`Services & Utilities`,`Beta`],c=[...r].sort((e,t)=>s.indexOf(e.category)-s.indexOf(t.category)||e.label.localeCompare(t.label)),l=[...a].sort((e,t)=>s.indexOf(e.category)-s.indexOf(t.category)||e.label.localeCompare(t.label)),u=c.map(e=>e.slug),d=new Set(u),f=s.map(e=>({category:e,apps:c.filter(t=>t.category===e)})).filter(e=>e.apps.length>0),p={title:`Atoms/AppIcon`,tags:[`autodocs`],render:e=>i(e),parameters:{docs:{description:{component:`
<p>Adobe product badge used inside RouterMarquee/ProductLockup. The Figma component is <code>AppIcon</code> in S2A Foundations (<code>3582:130846</code>) with <code>Size=xs|sm|md|lg</code> and an <code>Icon</code> instance-swap sourced from the published App Icons Library.</p>
<p>Storybook controls expose only verified CDN-backed slugs from the published library catalog plus existing S2A product aliases. The reference catalog still lists library-only entries, but those use an A4U placeholder until a verified CDN URL or internal package asset is wired in.</p>
`},source:{language:`html`,code:`<!-- Medium (24px) — default, used in ProductLockup and MediaCard -->
<span class="c-app-icon" data-size="24" role="img" aria-hidden="true">
  <img class="c-app-icon__img" src="https://www.adobe.com/content/dam/shared/images/product-icons/svg/photoshop.svg" alt="" width="24" height="24" loading="lazy" decoding="async" />
</span>

<!-- Large (32px) -->
<span class="c-app-icon" data-size="32" role="img" aria-label="Adobe Firefly">
  <img class="c-app-icon__img" src="…/firefly.svg" alt="" width="32" height="32" loading="lazy" decoding="async" />
</span>`}}},argTypes:{app:{control:{type:`select`},options:u,description:`Adobe product variant`},size:{control:{type:`select`},options:[`xs`,`sm`,`md`,`lg`],description:`Tile size (xs=16px, sm=18px, md=24px, lg=32px)`},ariaHidden:{control:`boolean`,description:`Hide the icon from assistive tech (default true)`},ariaLabel:{control:`text`,description:`Custom aria-label when the icon conveys standalone meaning`}},args:{app:`experience-cloud`,size:`md`,ariaHidden:!0}},m={},h={args:{app:`firefly`}},g={render:e=>t`
    <div style="display: flex; gap: var(--s2a-spacing-lg); align-items: center;">
      ${[`xs`,`sm`,`md`,`lg`].map(n=>t`
          <div
            style="display: flex; flex-direction: column; gap: var(--s2a-spacing-sm); align-items: center;"
          >
            ${i({...e,size:n})}
            <span
              style="color: var(--s2a-color-content-body-subtle); font: var(--s2a-font-size-xs)/var(--s2a-font-line-height-xs) var(--s2a-font-family-body);"
              >${n.toUpperCase()}</span
            >
          </div>
        `)}
    </div>
  `},_={render:()=>t`
    <div style="display: flex; flex-direction: column; gap: var(--s2a-spacing-xl);">
      ${f.map(e=>t`
          <section>
            <h3
              style="margin: 0 0 var(--s2a-spacing-md); font: var(--s2a-font-size-xs)/var(--s2a-font-line-height-xs) var(--s2a-font-family-body);"
            >
              ${e.category}
            </h3>
            <div
              style="display: grid; grid-template-columns: repeat(auto-fit, minmax(144px, 1fr)); gap: var(--s2a-spacing-md);"
            >
              ${e.apps.map(e=>t`
                  <div
                    style="display: flex; flex-direction: column; gap: var(--s2a-spacing-xs); align-items: center; text-align: center;"
                  >
                    ${i({app:e.slug,size:`32`})}
                    <span
                      style="font: var(--s2a-font-size-xs)/var(--s2a-font-line-height-xs) var(--s2a-font-family-body); color: var(--s2a-color-content-body-subtle);"
                      >${e.label}</span
                    >
                    <code
                      style="font: var(--s2a-font-size-xs)/var(--s2a-font-line-height-xs) var(--s2a-font-family-body); color: var(--s2a-color-content-body-subtle);"
                      >${e.slug}</code
                    >
                  </div>
                `)}
            </div>
          </section>
        `)}
    </div>
  `},v={render:()=>t`
    <div style="display: grid; gap: var(--s2a-spacing-xs);">
      ${l.map(e=>t`
          <div
            style="display: grid; grid-template-columns: 32px minmax(160px, 1fr) minmax(180px, 1fr) minmax(180px, 1fr); gap: var(--s2a-spacing-sm); align-items: center; padding: var(--s2a-spacing-xs) 0; border-bottom: var(--s2a-border-width-sm) solid var(--s2a-color-border-subtle);"
          >
            ${d.has(e.slug)?i({app:e.slug,size:`24`}):t`<span
                  title="Library-only asset: not rendered until a verified CDN URL or A4U package asset is wired in."
                  style="display: inline-grid; place-items: center; width: 24px; height: 24px; border-radius: var(--s2a-border-radius-2xs); background: var(--s2a-color-surface-subtle); color: var(--s2a-color-content-body-subtle); font: var(--s2a-font-size-xs)/var(--s2a-font-line-height-xs) var(--s2a-font-family-body);"
                  >A4U</span
                >`}
            <span
              style="font: var(--s2a-font-size-xs)/var(--s2a-font-line-height-xs) var(--s2a-font-family-body);"
              >${e.label}</span
            >
            <code
              style="font: var(--s2a-font-size-xs)/var(--s2a-font-line-height-xs) var(--s2a-font-family-body);"
              >${e.slug}</code
            >
            <code
              style="font: var(--s2a-font-size-xs)/var(--s2a-font-line-height-xs) var(--s2a-font-family-body);"
              >${e.figmaName??`S2A alias`}</code
            >
          </div>
        `)}
    </div>
  `,parameters:{docs:{description:{story:`Reference catalog for AppIcon slugs. The Figma column maps back to the published App Icons Library component name when available.`}}}},y={render:()=>t`
    <div style="display: flex; flex-direction: column; gap: var(--s2a-spacing-xs);">
      <p
        style="font: var(--s2a-font-size-xs)/var(--s2a-font-line-height-xs) var(--s2a-font-family-body); color: var(--s2a-color-content-default);"
      >
        Icons are decorative when a visible product name follows. When the icon
        stands alone, pass <code>ariaHidden={false}</code> and an accessible
        label.
      </p>
      ${i({app:`firefly`,ariaHidden:!1,ariaLabel:`Adobe Firefly app icon`,size:`32`})}
    </div>
  `},m.parameters={...m.parameters,docs:{...m.parameters?.docs,source:{originalSource:`{}`,...m.parameters?.docs?.source}}},h.parameters={...h.parameters,docs:{...h.parameters?.docs,source:{originalSource:`{
  args: {
    app: "firefly"
  }
}`,...h.parameters?.docs?.source}}},g.parameters={...g.parameters,docs:{...g.parameters?.docs,source:{originalSource:`{
  render: args => html\`
    <div style="display: flex; gap: var(--s2a-spacing-lg); align-items: center;">
      \${["xs", "sm", "md", "lg"].map(size => html\`
          <div
            style="display: flex; flex-direction: column; gap: var(--s2a-spacing-sm); align-items: center;"
          >
            \${AppIcon({
    ...args,
    size
  })}
            <span
              style="color: var(--s2a-color-content-body-subtle); font: var(--s2a-font-size-xs)/var(--s2a-font-line-height-xs) var(--s2a-font-family-body);"
              >\${size.toUpperCase()}</span
            >
          </div>
        \`)}
    </div>
  \`
}`,...g.parameters?.docs?.source}}},_.parameters={..._.parameters,docs:{..._.parameters?.docs,source:{originalSource:`{
  render: () => html\`
    <div style="display: flex; flex-direction: column; gap: var(--s2a-spacing-xl);">
      \${appsByCategory.map(group => html\`
          <section>
            <h3
              style="margin: 0 0 var(--s2a-spacing-md); font: var(--s2a-font-size-xs)/var(--s2a-font-line-height-xs) var(--s2a-font-family-body);"
            >
              \${group.category}
            </h3>
            <div
              style="display: grid; grid-template-columns: repeat(auto-fit, minmax(144px, 1fr)); gap: var(--s2a-spacing-md);"
            >
              \${group.apps.map(app => html\`
                  <div
                    style="display: flex; flex-direction: column; gap: var(--s2a-spacing-xs); align-items: center; text-align: center;"
                  >
                    \${AppIcon({
    app: app.slug,
    size: "32"
  })}
                    <span
                      style="font: var(--s2a-font-size-xs)/var(--s2a-font-line-height-xs) var(--s2a-font-family-body); color: var(--s2a-color-content-body-subtle);"
                      >\${app.label}</span
                    >
                    <code
                      style="font: var(--s2a-font-size-xs)/var(--s2a-font-line-height-xs) var(--s2a-font-family-body); color: var(--s2a-color-content-body-subtle);"
                      >\${app.slug}</code
                    >
                  </div>
                \`)}
            </div>
          </section>
        \`)}
    </div>
  \`
}`,..._.parameters?.docs?.source}}},v.parameters={...v.parameters,docs:{...v.parameters?.docs,source:{originalSource:`{
  render: () => html\`
    <div style="display: grid; gap: var(--s2a-spacing-xs);">
      \${CATALOG_APPS.map(app => html\`
          <div
            style="display: grid; grid-template-columns: 32px minmax(160px, 1fr) minmax(180px, 1fr) minmax(180px, 1fr); gap: var(--s2a-spacing-sm); align-items: center; padding: var(--s2a-spacing-xs) 0; border-bottom: var(--s2a-border-width-sm) solid var(--s2a-color-border-subtle);"
          >
            \${RENDERABLE_SLUGS.has(app.slug) ? AppIcon({
    app: app.slug,
    size: "24"
  }) : html\`<span
                  title="Library-only asset: not rendered until a verified CDN URL or A4U package asset is wired in."
                  style="display: inline-grid; place-items: center; width: 24px; height: 24px; border-radius: var(--s2a-border-radius-2xs); background: var(--s2a-color-surface-subtle); color: var(--s2a-color-content-body-subtle); font: var(--s2a-font-size-xs)/var(--s2a-font-line-height-xs) var(--s2a-font-family-body);"
                  >A4U</span
                >\`}
            <span
              style="font: var(--s2a-font-size-xs)/var(--s2a-font-line-height-xs) var(--s2a-font-family-body);"
              >\${app.label}</span
            >
            <code
              style="font: var(--s2a-font-size-xs)/var(--s2a-font-line-height-xs) var(--s2a-font-family-body);"
              >\${app.slug}</code
            >
            <code
              style="font: var(--s2a-font-size-xs)/var(--s2a-font-line-height-xs) var(--s2a-font-family-body);"
              >\${app.figmaName ?? "S2A alias"}</code
            >
          </div>
        \`)}
    </div>
  \`,
  parameters: {
    docs: {
      description: {
        story: "Reference catalog for AppIcon slugs. The Figma column maps back to the published App Icons Library component name when available."
      }
    }
  }
}`,...v.parameters?.docs?.source}}},y.parameters={...y.parameters,docs:{...y.parameters?.docs,source:{originalSource:`{
  render: () => html\`
    <div style="display: flex; flex-direction: column; gap: var(--s2a-spacing-xs);">
      <p
        style="font: var(--s2a-font-size-xs)/var(--s2a-font-line-height-xs) var(--s2a-font-family-body); color: var(--s2a-color-content-default);"
      >
        Icons are decorative when a visible product name follows. When the icon
        stands alone, pass <code>ariaHidden={false}</code> and an accessible
        label.
      </p>
      \${AppIcon({
    app: "firefly",
    ariaHidden: false,
    ariaLabel: "Adobe Firefly app icon",
    size: "32"
  })}
    </div>
  \`
}`,...y.parameters?.docs?.source}}},b=[`CreativeCloud`,`Firefly`,`Sizes`,`AllVariants`,`LibraryCatalog`,`AccessibleLabel`]})))()}x();export{y as AccessibleLabel,_ as AllVariants,m as CreativeCloud,h as Firefly,v as LibraryCatalog,g as Sizes,b as __namedExportsOrder,p as default};