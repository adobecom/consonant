import{E as C,x as a}from"./iframe-CYTFe2ZW.js";import{P as y,p as _}from"./progress-bar-BCpaSPpN.js";import{A as S}from"./app-icon-CvuHz2SJ.js";import"./preload-helper-DfC75TPN.js";const o=({label:n="Card label",body:e,tone:t="knockout",orientation:k="horizontal",active:w=!1,showProgress:P=!1,progress:$=0,onClick:I}={})=>{const m=!!P,x=t==="default"?"default":"knockout";return a`
    <button
      class="c-card"
      data-tone=${x}
      data-orientation=${k==="vertical"?"vertical":"horizontal"}
      data-active=${w?"true":"false"}
      data-has-progress=${m?"true":"false"}
      type="button"
      @click=${I}
    >
      <div class="c-card__body">
        ${e??a`<span class="c-card__label">${n}</span>`}
      </div>
      ${m?a`<span class="c-card__progress" aria-hidden="true">
            ${y({progress:$,tone:x})}
          </span>`:C}
    </button>
  `},z=`.c-card {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--s2a-spacing-sm, 12px);
  min-width: 0;
  padding: var(--s2a-spacing-sm, 12px) var(--s2a-spacing-lg, 24px);
  border-radius: var(--s2a-border-radius-xxl, 48px);
  border: var(--s2a-border-width-sm, 1px) solid transparent;
  background-color: var(--s2a-color-background-knockout, #000000);
  color: var(--s2a-color-content-knockout, #ffffff);
  font-family: var(--s2a-font-family-default, "adobe-clean", "Adobe Clean", sans-serif);
  cursor: pointer;
  text-align: left;
  transition: background-color 150ms ease, border-color 150ms ease, color 150ms ease,
    box-shadow 150ms ease;
}

.c-card:focus-visible {
  outline: var(--s2a-border-width-sm, 1px) solid var(--s2a-color-focus-ring-default, #1473e6);
  outline-offset: 2px;
}

.c-card[data-orientation="vertical"] {
  flex-direction: column;
  align-items: flex-start;
  border-radius: var(--s2a-border-radius-xl, 32px);
  padding: var(--s2a-spacing-lg, 24px);
  gap: var(--s2a-spacing-md, 16px);
}

.c-card[data-tone="default"] {
  background-color: var(--s2a-color-background-default, #ffffff);
  color: var(--s2a-color-content-default, #000000);
  border-color: var(--s2a-color-border-subtle, #dadada);
}

.c-card[data-tone="default"][data-active="true"] {
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.12);
}

.c-card[data-tone="knockout"][data-active="true"] {
  background-color: var(--s2a-color-background-default, #ffffff);
  color: var(--s2a-color-content-default, #000000);
}

.c-card[data-tone="knockout"]:not([data-active="true"]) {
  box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.08);
}

.c-card[data-orientation="horizontal"] .c-card__body {
  display: inline-flex;
  align-items: center;
  gap: var(--s2a-spacing-sm, 12px);
}

.c-card[data-orientation="vertical"] .c-card__body {
  display: flex;
  flex-direction: column;
  gap: var(--s2a-spacing-sm, 12px);
  width: 100%;
}

.c-card__label {
  font-size: var(--s2a-font-size-md, 16px);
  font-weight: var(--s2a-font-weight-adobe-clean-semibold, 600);
  line-height: 1.25;
}

.c-card__progress {
  position: absolute;
  left: var(--s2a-spacing-lg, 24px);
  right: var(--s2a-spacing-lg, 24px);
  bottom: var(--s2a-spacing-xs, 8px);
  pointer-events: none;
}

.c-card[data-has-progress="true"] {
  padding-bottom: calc(var(--s2a-spacing-lg, 24px) + var(--s2a-spacing-md, 16px));
}

.c-card[data-orientation="vertical"][data-has-progress="true"] {
  padding-bottom: calc(var(--s2a-spacing-xl, 32px) + var(--s2a-spacing-md, 16px));
}
`,{fn:h}=__STORYBOOK_MODULE_TEST__,A=["creative-cloud","firefly","acrobat-pdf","photoshop","illustrator","experience-cloud","premiere-pro","experience-platform","acrobat-pro","express","after-effects","lightroom","indesign","stock"],r=({label:n,app:e="creative-cloud",orientation:t="horizontal"})=>a`
  <span class="c-card__app-icon" aria-hidden="true">
    ${S({app:e,size:t==="vertical"?"xl":"md"})}
  </span>
  <span class="c-card__label">${n}</span>
  ${t==="vertical"?"":a`<i class="ph-bold ph-caret-right c-card__caret" aria-hidden="true"></i>`}
`,M={title:"Components/Card",tags:["autodocs"],render:({appIcon:n,...e})=>o({...e,body:r({label:e.label,app:n,orientation:e.orientation})}),parameters:{docs:{description:{component:`
Flexible card with a body slot and an absolutely-positioned \`ProgressBar\` timer atom.

**First use case:** RouterMarquee navigational tab — ProductLockup (horizontal, fill width) with a progress/timer bar pinned to the bottom-left.

**Slots:** Pass a custom \`body\` template to compose media cards, eyebrow cards, or action cards without touching the shell.

**CSS structure:** All variants driven by \`data-*\` attributes. No class modifiers.

\`\`\`css
${z}
\`\`\`

---

#### ProgressBar atom

\`\`\`css
${_}
\`\`\`
        `}}},argTypes:{label:{control:"text",description:"Product/card label (used in default body)"},tone:{control:{type:"select"},options:["knockout","default"],description:'"knockout" = dark glass surface · "default" = white surface'},orientation:{control:{type:"select"},options:["horizontal","vertical"],description:'"horizontal" = inline nav (RouterMarquee) · "vertical" = stacked tile/grid'},active:{control:"boolean",description:"Active/selected state — knockout flips to white surface"},showProgress:{control:"boolean",description:"Show the ProgressBar timer atom"},progress:{control:{type:"select"},options:["0","25","50","75","100"],description:"ProgressBar width step (25% increments)"},appIcon:{control:{type:"select"},options:A,description:"AppIcon variant shown in the default body (storybook helper)"}},args:{label:"PDF and productivity",tone:"knockout",orientation:"horizontal",active:!1,showProgress:!0,progress:"50",onClick:h(),appIcon:"experience-cloud"}},s={},i={args:{active:!0,progress:"100"}},c={render:({appIcon:n,...e})=>a`
    <div style="background: #f3f3f3; padding: 24px; display: inline-block;">
      ${o({...e,tone:"default",body:r({label:e.label,app:n,orientation:e.orientation})})}
    </div>
  `},d={render:({appIcon:n,...e})=>a`
    <div style="background: #f3f3f3; padding: 24px; display: inline-block;">
      ${o({...e,tone:"default",active:!0,body:r({label:e.label,app:n,orientation:e.orientation})})}
    </div>
  `},l={render:({appIcon:n,...e})=>a`
    <div style="background: #000; padding: 24px; display: flex; flex-direction: column; gap: 16px; width: 220px;">
      ${["0","25","50","75","100"].map(t=>o({...e,tone:"knockout",progress:t,showProgress:!0,body:r({label:`Progress ${t}%`,app:n,orientation:e.orientation})}))}
    </div>
  `},p={render:()=>a`
    <div style="display: flex; flex-direction: column; gap: 12px; width: 220px; padding: 24px; background: #1a1a1a;">
      ${["0","25","50","75","100"].map(n=>a`
          <div>
            <div style="font: 11px/1 monospace; color: #aaa; margin-bottom: 4px;">progress=${n}</div>
            <div style="background: rgba(255,255,255,0.08); border-radius: 2px; overflow: hidden;">
              ${y({progress:n})}
            </div>
          </div>
        `)}
    </div>
  `},u={render:()=>a`
      <div style="background: #000; padding: 32px; display: flex; gap: 8px; max-width: 960px;">
        ${[{label:"Creative Cloud",app:"creative-cloud",active:!0,progress:"100",showProgress:!0},{label:"PDF and productivity",app:"acrobat-pdf",active:!1,progress:"0",showProgress:!1},{label:"Photography",app:"lightroom",active:!1,progress:"0",showProgress:!1},{label:"Video and motion",app:"premiere-pro",active:!1,progress:"0",showProgress:!1}].map(e=>o({...e,tone:"knockout",body:r({label:e.label,app:e.app,orientation:e.orientation??"horizontal"}),onClick:h()}))}
      </div>
    `},g={args:{orientation:"vertical",showProgress:!1},render:({appIcon:n,...e})=>a`
    <div style="background: #000; padding: 32px; display: inline-block; width: 160px;">
          ${o({...e,body:r({label:e.label,app:n,orientation:e.orientation})})}
    </div>
  `},v={args:{orientation:"vertical",tone:"default",showProgress:!1},render:({appIcon:n,...e})=>a`
    <div style="background: #f3f3f3; padding: 32px; display: inline-block; width: 160px;">
      ${o({...e,body:r({label:e.label,app:n,orientation:e.orientation})})}
    </div>
  `},b={render:({appIcon:n,...e})=>a`
    <div style="display: flex; gap: 32px; padding: 32px; background: #000; align-items: flex-start;">
      <div>
        <p style="color: #888; font: 11px/1 monospace; margin: 0 0 12px;">orientation=horizontal</p>
          ${o({...e,orientation:"horizontal",body:r({label:e.label,app:n,orientation:"horizontal"})})}
      </div>
      <div>
        <p style="color: #888; font: 11px/1 monospace; margin: 0 0 12px;">orientation=vertical</p>
        <div style="width: 160px;">
          ${o({...e,orientation:"vertical",showProgress:!1,body:r({label:e.label,app:n,orientation:"vertical"})})}
        </div>
      </div>
    </div>
  `},f={render:({appIcon:n,...e})=>a`
    <div style="display: flex; gap: 0;">
      <div style="background: #000; padding: 32px; flex: 1;">
        <p style="color: #888; font: 11px/1 monospace; margin: 0 0 16px;">tone=knockout / active=false</p>
        ${o({...e,tone:"knockout",active:!1,body:r({label:e.label,app:n,orientation:e.orientation})})}
        <br/>
        <p style="color: #888; font: 11px/1 monospace; margin: 16px 0;">tone=knockout / active=true</p>
        ${o({...e,tone:"knockout",active:!0,progress:"100",body:r({label:e.label,app:n,orientation:e.orientation})})}
      </div>
      <div style="background: #f3f3f3; padding: 32px; flex: 1;">
        <p style="color: #888; font: 11px/1 monospace; margin: 0 0 16px;">tone=default / active=false</p>
        ${o({...e,tone:"default",active:!1,body:r({label:e.label,app:n,orientation:e.orientation})})}
        <br/>
        <p style="color: #888; font: 11px/1 monospace; margin: 16px 0;">tone=default / active=true</p>
        ${o({...e,tone:"default",active:!0,progress:"100",body:r({label:e.label,app:n,orientation:e.orientation})})}
      </div>
    </div>
  `};s.parameters={...s.parameters,docs:{...s.parameters?.docs,source:{originalSource:"{}",...s.parameters?.docs?.source},description:{story:"Inactive tab on a dark surface. Default RouterMarquee state.",...s.parameters?.docs?.description}}};i.parameters={...i.parameters,docs:{...i.parameters?.docs,source:{originalSource:`{
  args: {
    active: true,
    progress: "100"
  }
}`,...i.parameters?.docs?.source},description:{story:"Active tab on a dark surface — surface flips to white, progress at 100%.",...i.parameters?.docs?.description}}};c.parameters={...c.parameters,docs:{...c.parameters?.docs,source:{originalSource:`{
  render: ({
    appIcon,
    ...rest
  }) => html\`
    <div style="background: #f3f3f3; padding: 24px; display: inline-block;">
      \${Card({
    ...rest,
    tone: "default",
    body: bodyWithIcon({
      label: rest.label,
      app: appIcon,
      orientation: rest.orientation
    })
  })}
    </div>
  \`
}`,...c.parameters?.docs?.source},description:{story:"White surface variant (on-light context).",...c.parameters?.docs?.description}}};d.parameters={...d.parameters,docs:{...d.parameters?.docs,source:{originalSource:`{
  render: ({
    appIcon,
    ...rest
  }) => html\`
    <div style="background: #f3f3f3; padding: 24px; display: inline-block;">
      \${Card({
    ...rest,
    tone: "default",
    active: true,
    body: bodyWithIcon({
      label: rest.label,
      app: appIcon,
      orientation: rest.orientation
    })
  })}
    </div>
  \`
}`,...d.parameters?.docs?.source},description:{story:"White surface, active state.",...d.parameters?.docs?.description}}};l.parameters={...l.parameters,docs:{...l.parameters?.docs,source:{originalSource:`{
  render: ({
    appIcon,
    ...rest
  }) => html\`
    <div style="background: #000; padding: 24px; display: flex; flex-direction: column; gap: 16px; width: 220px;">
      \${["0", "25", "50", "75", "100"].map(p => Card({
    ...rest,
    tone: "knockout",
    progress: p,
    showProgress: true,
    body: bodyWithIcon({
      label: \`Progress \${p}%\`,
      app: appIcon,
      orientation: rest.orientation
    })
  }))}
    </div>
  \`
}`,...l.parameters?.docs?.source},description:{story:`All five ProgressBar steps side-by-side.
Demonstrates the timer growing from 0 → 100 on a 220px card baseline.`,...l.parameters?.docs?.description}}};p.parameters={...p.parameters,docs:{...p.parameters?.docs,source:{originalSource:`{
  render: () => html\`
    <div style="display: flex; flex-direction: column; gap: 12px; width: 220px; padding: 24px; background: #1a1a1a;">
      \${["0", "25", "50", "75", "100"].map(p => html\`
          <div>
            <div style="font: 11px/1 monospace; color: #aaa; margin-bottom: 4px;">progress=\${p}</div>
            <div style="background: rgba(255,255,255,0.08); border-radius: 2px; overflow: hidden;">
              \${ProgressBar({
    progress: p
  })}
            </div>
          </div>
        \`)}
    </div>
  \`
}`,...p.parameters?.docs?.source},description:{story:`ProgressBar atom in isolation.
Shows all steps rendered inside a reference container (220×4px).`,...p.parameters?.docs?.description}}};u.parameters={...u.parameters,docs:{...u.parameters?.docs,source:{originalSource:`{
  render: () => {
    const tabs = [{
      label: "Creative Cloud",
      app: "creative-cloud",
      active: true,
      progress: "100",
      showProgress: true
    }, {
      label: "PDF and productivity",
      app: "acrobat-pdf",
      active: false,
      progress: "0",
      showProgress: false
    }, {
      label: "Photography",
      app: "lightroom",
      active: false,
      progress: "0",
      showProgress: false
    }, {
      label: "Video and motion",
      app: "premiere-pro",
      active: false,
      progress: "0",
      showProgress: false
    }];
    return html\`
      <div style="background: #000; padding: 32px; display: flex; gap: 8px; max-width: 960px;">
        \${tabs.map(tab => Card({
      ...tab,
      tone: "knockout",
      body: bodyWithIcon({
        label: tab.label,
        app: tab.app,
        orientation: tab.orientation ?? "horizontal"
      }),
      onClick: fn()
    }))}
      </div>
    \`;
  }
}`,...u.parameters?.docs?.source},description:{story:`RouterMarquee strip — four tabs at 220px each.
One active (white surface, full progress), three inactive (dark glass, no progress).
Matches the Figma "Home - 1441+" exploration at node 3502:1253378.`,...u.parameters?.docs?.description}}};g.parameters={...g.parameters,docs:{...g.parameters?.docs,source:{originalSource:`{
  args: {
    orientation: "vertical",
    showProgress: false
  },
  render: ({
    appIcon,
    ...rest
  }) => html\`
    <div style="background: #000; padding: 32px; display: inline-block; width: 160px;">
          \${Card({
    ...rest,
    body: bodyWithIcon({
      label: rest.label,
      app: appIcon,
      orientation: rest.orientation
    })
  })}
    </div>
  \`
}`,...g.parameters?.docs?.source},description:{story:`Vertical orientation — stacked icon + label, no caret.
Mirrors Figma ProductLockup Orientation=vertical. Use in card/tile grids.`,...g.parameters?.docs?.description}}};v.parameters={...v.parameters,docs:{...v.parameters?.docs,source:{originalSource:`{
  args: {
    orientation: "vertical",
    tone: "default",
    showProgress: false
  },
  render: ({
    appIcon,
    ...rest
  }) => html\`
    <div style="background: #f3f3f3; padding: 32px; display: inline-block; width: 160px;">
      \${Card({
    ...rest,
    body: bodyWithIcon({
      label: rest.label,
      app: appIcon,
      orientation: rest.orientation
    })
  })}
    </div>
  \`
}`,...v.parameters?.docs?.source}}};b.parameters={...b.parameters,docs:{...b.parameters?.docs,source:{originalSource:`{
  render: ({
    appIcon,
    ...rest
  }) => html\`
    <div style="display: flex; gap: 32px; padding: 32px; background: #000; align-items: flex-start;">
      <div>
        <p style="color: #888; font: 11px/1 monospace; margin: 0 0 12px;">orientation=horizontal</p>
          \${Card({
    ...rest,
    orientation: "horizontal",
    body: bodyWithIcon({
      label: rest.label,
      app: appIcon,
      orientation: "horizontal"
    })
  })}
      </div>
      <div>
        <p style="color: #888; font: 11px/1 monospace; margin: 0 0 12px;">orientation=vertical</p>
        <div style="width: 160px;">
          \${Card({
    ...rest,
    orientation: "vertical",
    showProgress: false,
    body: bodyWithIcon({
      label: rest.label,
      app: appIcon,
      orientation: "vertical"
    })
  })}
        </div>
      </div>
    </div>
  \`
}`,...b.parameters?.docs?.source},description:{story:"Horizontal vs vertical side-by-side — same label, both tones.",...b.parameters?.docs?.description}}};f.parameters={...f.parameters,docs:{...f.parameters?.docs,source:{originalSource:`{
  render: ({
    appIcon,
    ...rest
  }) => html\`
    <div style="display: flex; gap: 0;">
      <div style="background: #000; padding: 32px; flex: 1;">
        <p style="color: #888; font: 11px/1 monospace; margin: 0 0 16px;">tone=knockout / active=false</p>
        \${Card({
    ...rest,
    tone: "knockout",
    active: false,
    body: bodyWithIcon({
      label: rest.label,
      app: appIcon,
      orientation: rest.orientation
    })
  })}
        <br/>
        <p style="color: #888; font: 11px/1 monospace; margin: 16px 0;">tone=knockout / active=true</p>
        \${Card({
    ...rest,
    tone: "knockout",
    active: true,
    progress: "100",
    body: bodyWithIcon({
      label: rest.label,
      app: appIcon,
      orientation: rest.orientation
    })
  })}
      </div>
      <div style="background: #f3f3f3; padding: 32px; flex: 1;">
        <p style="color: #888; font: 11px/1 monospace; margin: 0 0 16px;">tone=default / active=false</p>
        \${Card({
    ...rest,
    tone: "default",
    active: false,
    body: bodyWithIcon({
      label: rest.label,
      app: appIcon,
      orientation: rest.orientation
    })
  })}
        <br/>
        <p style="color: #888; font: 11px/1 monospace; margin: 16px 0;">tone=default / active=true</p>
        \${Card({
    ...rest,
    tone: "default",
    active: true,
    progress: "100",
    body: bodyWithIcon({
      label: rest.label,
      app: appIcon,
      orientation: rest.orientation
    })
  })}
      </div>
    </div>
  \`
}`,...f.parameters?.docs?.source},description:{story:"Both context tones side-by-side on their respective surfaces.",...f.parameters?.docs?.description}}};const R=["KnockoutInactive","KnockoutActive","DefaultOnLight","DefaultOnLightActive","ProgressStates","ProgressBarAtom","RouterMarqueeStrip","VerticalKnockout","VerticalDefault","OrientationComparison","ToneComparison"];export{c as DefaultOnLight,d as DefaultOnLightActive,i as KnockoutActive,s as KnockoutInactive,b as OrientationComparison,p as ProgressBarAtom,l as ProgressStates,u as RouterMarqueeStrip,f as ToneComparison,v as VerticalDefault,g as VerticalKnockout,R as __namedExportsOrder,M as default};
