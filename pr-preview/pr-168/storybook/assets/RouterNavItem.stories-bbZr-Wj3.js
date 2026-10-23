import{n as e}from"./rolldown-runtime-C0FnF6B9.js";import{c as t,t as n}from"./lit-DRzJKe3d.js";import{n as r,t as i}from"./router-nav-item-DIyC1ztS.js";function a(){return(a=e((()=>{r()})))()}var o,s,c,l,u,d,f,p;function m(){return(m=e((()=>{n(),a(),o={title:`Molecules/RouterNavItem`,tags:[`autodocs`],render:e=>i(e),parameters:{layout:`centered`,docs:{description:{component:`
Navigation tile atom used in the RouterMarquee controls bar. Each tile represents one slide —
clicking it jumps to that slide and the progress bar at the bottom fills over 5 seconds to
indicate autoplay timing.

**Data attributes:**
- \`data-orientation="block"\` — 220×68px vertical layout, 18px icon (desktop default)
- \`data-orientation="inline"\` — 192×48px horizontal layout, 18px icon (compact)
- \`data-state="default"\` — dark glass background, progress bar hidden
- \`data-state="active"\` — white background, progress bar visible and animating
        `},source:{language:`html`,code:`<!-- Block orientation (desktop default) -->
<button class="c-router-nav-item" data-orientation="block" data-state="default" type="button" aria-pressed="false">
  <div class="c-product-lockup" data-orientation="vertical" data-style="knockout" data-width="fill">…</div>
  <span class="c-router-nav-item__progress" aria-hidden="true">
    <span class="c-router-nav-item__progress-fill"></span>
  </span>
</button>

<!-- Active state — white surface, progress animating -->
<button class="c-router-nav-item" data-orientation="block" data-state="active" type="button" aria-pressed="true">
  …
</button>

<!-- Inline orientation (compact) -->
<button class="c-router-nav-item" data-orientation="inline" data-state="default" type="button" aria-pressed="false">
  …
</button>`}}},argTypes:{label:{control:`text`,description:`Product name label`},app:{control:{type:`select`},options:[`photoshop`,`illustrator`,`premiere-pro`,`after-effects`,`acrobat`,`experience-cloud`,`lightroom`,`indesign`],description:`Adobe app identifier for the icon`},orientation:{control:{type:`select`},options:[`block`,`inline`]},state:{control:{type:`select`},options:[`default`,`active`]}},args:{label:`Photoshop`,app:`photoshop`,orientation:`block`,state:`default`},decorators:[e=>t`
      <div data-theme="dark" style="background: var(--s2a-color-background-knockout); padding: var(--s2a-spacing-xl); border-radius: var(--s2a-border-radius-sm);">
        ${e()}
      </div>
    `]},s={name:`Block / Default`,args:{orientation:`block`,state:`default`,label:`Photoshop`,app:`photoshop`}},c={name:`Block / Active`,args:{orientation:`block`,state:`active`,label:`Photoshop`,app:`photoshop`}},l={name:`Inline / Default`,args:{orientation:`inline`,state:`default`,label:`Photoshop`,app:`photoshop`}},u={name:`Inline / Active`,args:{orientation:`inline`,state:`active`,label:`Photoshop`,app:`photoshop`}},d={name:`All variants`,render:()=>t`
    <div data-theme="dark" style="background: var(--s2a-color-background-knockout); padding: var(--s2a-spacing-xl); border-radius: var(--s2a-border-radius-sm); display: flex; flex-direction: column; gap: var(--s2a-spacing-xl);">
      <div>
        <p style="color: var(--s2a-color-content-body-subtle); font-size: var(--s2a-font-size-xs); margin: 0 0 var(--s2a-spacing-sm); font-family: var(--s2a-font-family-body); text-transform: uppercase; letter-spacing: var(--s2a-font-letter-spacing-6xl);">Block</p>
        <div style="display: flex; gap: var(--s2a-spacing-sm); flex-wrap: wrap;">
          ${i({label:`Photoshop`,app:`photoshop`,orientation:`block`,state:`default`})}
          ${i({label:`Photoshop`,app:`photoshop`,orientation:`block`,state:`active`})}
        </div>
      </div>
      <div>
        <p style="color: var(--s2a-color-content-body-subtle); font-size: var(--s2a-font-size-xs); margin: 0 0 var(--s2a-spacing-sm); font-family: var(--s2a-font-family-body); text-transform: uppercase; letter-spacing: var(--s2a-font-letter-spacing-6xl);">Inline</p>
        <div style="display: flex; gap: var(--s2a-spacing-sm); flex-wrap: wrap;">
          ${i({label:`Photoshop`,app:`photoshop`,orientation:`inline`,state:`default`})}
          ${i({label:`Photoshop`,app:`photoshop`,orientation:`inline`,state:`active`})}
        </div>
      </div>
    </div>
  `},f={name:`Multiple products (row)`,render:()=>t`
    <div data-theme="dark" style="background: var(--s2a-color-background-knockout); padding: var(--s2a-spacing-xl); border-radius: var(--s2a-border-radius-sm);">
      <div style="display: flex; gap: var(--s2a-spacing-sm); flex-wrap: wrap;">
        ${i({label:`Photoshop`,app:`photoshop`,orientation:`block`,state:`active`})}
        ${i({label:`Illustrator`,app:`illustrator`,orientation:`block`,state:`default`})}
        ${i({label:`Premiere Pro`,app:`premiere-pro`,orientation:`block`,state:`default`})}
        ${i({label:`Acrobat`,app:`acrobat`,orientation:`block`,state:`default`})}
      </div>
    </div>
  `},s.parameters={...s.parameters,docs:{...s.parameters?.docs,source:{originalSource:`{
  name: "Block / Default",
  args: {
    orientation: "block",
    state: "default",
    label: "Photoshop",
    app: "photoshop"
  }
}`,...s.parameters?.docs?.source}}},c.parameters={...c.parameters,docs:{...c.parameters?.docs,source:{originalSource:`{
  name: "Block / Active",
  args: {
    orientation: "block",
    state: "active",
    label: "Photoshop",
    app: "photoshop"
  }
}`,...c.parameters?.docs?.source}}},l.parameters={...l.parameters,docs:{...l.parameters?.docs,source:{originalSource:`{
  name: "Inline / Default",
  args: {
    orientation: "inline",
    state: "default",
    label: "Photoshop",
    app: "photoshop"
  }
}`,...l.parameters?.docs?.source}}},u.parameters={...u.parameters,docs:{...u.parameters?.docs,source:{originalSource:`{
  name: "Inline / Active",
  args: {
    orientation: "inline",
    state: "active",
    label: "Photoshop",
    app: "photoshop"
  }
}`,...u.parameters?.docs?.source}}},d.parameters={...d.parameters,docs:{...d.parameters?.docs,source:{originalSource:`{
  name: "All variants",
  render: () => html\`
    <div data-theme="dark" style="background: var(--s2a-color-background-knockout); padding: var(--s2a-spacing-xl); border-radius: var(--s2a-border-radius-sm); display: flex; flex-direction: column; gap: var(--s2a-spacing-xl);">
      <div>
        <p style="color: var(--s2a-color-content-body-subtle); font-size: var(--s2a-font-size-xs); margin: 0 0 var(--s2a-spacing-sm); font-family: var(--s2a-font-family-body); text-transform: uppercase; letter-spacing: var(--s2a-font-letter-spacing-6xl);">Block</p>
        <div style="display: flex; gap: var(--s2a-spacing-sm); flex-wrap: wrap;">
          \${RouterNavItem({
    label: "Photoshop",
    app: "photoshop",
    orientation: "block",
    state: "default"
  })}
          \${RouterNavItem({
    label: "Photoshop",
    app: "photoshop",
    orientation: "block",
    state: "active"
  })}
        </div>
      </div>
      <div>
        <p style="color: var(--s2a-color-content-body-subtle); font-size: var(--s2a-font-size-xs); margin: 0 0 var(--s2a-spacing-sm); font-family: var(--s2a-font-family-body); text-transform: uppercase; letter-spacing: var(--s2a-font-letter-spacing-6xl);">Inline</p>
        <div style="display: flex; gap: var(--s2a-spacing-sm); flex-wrap: wrap;">
          \${RouterNavItem({
    label: "Photoshop",
    app: "photoshop",
    orientation: "inline",
    state: "default"
  })}
          \${RouterNavItem({
    label: "Photoshop",
    app: "photoshop",
    orientation: "inline",
    state: "active"
  })}
        </div>
      </div>
    </div>
  \`
}`,...d.parameters?.docs?.source}}},f.parameters={...f.parameters,docs:{...f.parameters?.docs,source:{originalSource:`{
  name: "Multiple products (row)",
  render: () => html\`
    <div data-theme="dark" style="background: var(--s2a-color-background-knockout); padding: var(--s2a-spacing-xl); border-radius: var(--s2a-border-radius-sm);">
      <div style="display: flex; gap: var(--s2a-spacing-sm); flex-wrap: wrap;">
        \${RouterNavItem({
    label: "Photoshop",
    app: "photoshop",
    orientation: "block",
    state: "active"
  })}
        \${RouterNavItem({
    label: "Illustrator",
    app: "illustrator",
    orientation: "block",
    state: "default"
  })}
        \${RouterNavItem({
    label: "Premiere Pro",
    app: "premiere-pro",
    orientation: "block",
    state: "default"
  })}
        \${RouterNavItem({
    label: "Acrobat",
    app: "acrobat",
    orientation: "block",
    state: "default"
  })}
      </div>
    </div>
  \`
}`,...f.parameters?.docs?.source}}},p=[`BlockDefault`,`BlockActive`,`InlineDefault`,`InlineActive`,`AllVariants`,`MultipleProducts`]})))()}m();export{d as AllVariants,c as BlockActive,s as BlockDefault,u as InlineActive,l as InlineDefault,f as MultipleProducts,p as __namedExportsOrder,o as default};