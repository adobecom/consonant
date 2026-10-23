import{n as e}from"./rolldown-runtime-C0FnF6B9.js";import{c as t,i as n,t as r}from"./lit-DRzJKe3d.js";var i,a;function o(){return(o=e((()=>{r(),i=e=>{let t=e.currentTarget,n=t.closest(`.c-radio`);n&&n.setAttribute(`data-selected`,String(t.checked))},a=({label:e=`Individuals`,selected:r=!1,disabled:a=!1,name:o=`radio-group`,value:s=``,forceState:c=`default`}={})=>t`
      <label
        class="c-radio"
        data-selected=${String(r)}
        data-state=${c&&c!=="default"?c:n}
      >
        <input type="radio" class="c-radio__input" ?checked=${r} ?disabled=${a} name=${o} .value=${s} @change=${i} />
      <div class="c-radio__control">
        <div class="c-radio__ring"></div>
        <div class="c-radio__dot"></div>
      </div>
      <span class="c-radio__label">${e||`Individuals`}</span>
      </label>
`})))()}var s,c,l,u,d,f,p,m,h,g;function _(){return(_=e((()=>{r(),o(),s={title:`Generated/Radio`,component:`Radio`,render:e=>a(e),argTypes:{forceState:{control:`select`,options:[`default`,`hover`,`focus`,`disabled`]}}},c={name:`Default`,args:{},parameters:{figma:{fileKey:`qAF4nlt6O4ThbeXeO7jzdb`,nodeId:`11586:206580`}}},l={cols:[`default`,`hover`,`focus`,`disabled`],rows:[`false`,`true`],cell:{w:117,h:44,pad:12}},u={name:`State matrix`,parameters:{figma:{fileKey:`qAF4nlt6O4ThbeXeO7jzdb`,sheet:!0,slug:`radio`,selector:`.s2a-matrix`},controls:{disable:!0}},render:()=>t`
    <div class="s2a-matrix-wrap">
      <div class="s2a-matrix-corner"></div>
      <div class="s2a-matrix-cols">
        ${l.cols.map(e=>t`<div class="s2a-matrix-col">${e}</div>`)}
      </div>
      <div class="s2a-matrix-rows">
        ${l.rows.map(e=>t`<div class="s2a-matrix-row">${e}</div>`)}
      </div>
      <div class="s2a-matrix">
        <div class="s2a-matrix__cell">${a({selected:!1})}</div>
        <div class="s2a-matrix__cell">${a({selected:!1,forceState:`hover`})}</div>
        <div class="s2a-matrix__cell">${a({selected:!1,forceState:`focus`})}</div>
        <div class="s2a-matrix__cell">${a({selected:!1,forceState:`disabled`})}</div>
        <div class="s2a-matrix__cell">${a({selected:!0})}</div>
        <div class="s2a-matrix__cell">${a({selected:!0,forceState:`hover`})}</div>
        <div class="s2a-matrix__cell">${a({selected:!0,forceState:`focus`})}</div>
        <div class="s2a-matrix__cell">${a({selected:!0,forceState:`disabled`})}</div>
      </div>
    </div>
    <style>
      .s2a-matrix-wrap {
        display: inline-grid;
        grid-template-columns: auto auto;
        gap: var(--s2a-spacing-xs);
        align-items: start;
        font: var(--s2a-font-size-xs)/var(--s2a-font-line-height-xs) var(--s2a-font-family-body);
        color: var(--s2a-color-content-body-subtle);
      }
      .s2a-matrix-cols { display: grid; grid-template-columns: repeat(${l.cols.length}, ${l.cell.w}px); }
      .s2a-matrix-rows { display: grid; grid-auto-rows: ${l.cell.h}px; }
      .s2a-matrix-col { text-align: center; }
      .s2a-matrix-row { display: grid; align-items: center; justify-content: end; white-space: nowrap; padding-right: var(--s2a-spacing-2xs); }
      /* Measured against the sheet: cells only, exact cell size, no gap. */
      .s2a-matrix {
        display: grid;
        grid-template-columns: repeat(${l.cols.length}, ${l.cell.w}px);
        grid-auto-rows: ${l.cell.h}px;
        gap: 0;
      }
      /* The cells are real buttons, and a real pointer passing over one adds a
         genuine :hover on top of whatever state the cell is supposed to be
         showing — so dragging the wipe across the grid silently corrupts every
         cell the cursor crosses. In a matrix the state is SET, never pointed
         at, so nothing here takes pointer input. */
      .s2a-matrix, .s2a-matrix * { pointer-events: none; }
      /* The pad is the cell's padding, so a component that fills its
         container fills the artwork's box, not the cell's. */
      .s2a-matrix__cell { display: grid; place-items: center; padding: ${l.cell.pad}px; box-sizing: border-box; }
    </style>
  `},d={name:`With content`,args:{value:t`<p style="margin:0">Content placed in the value slot.</p>`,selected:!0}},f={name:`selected on`,args:{selected:!0},parameters:{figma:{fileKey:`qAF4nlt6O4ThbeXeO7jzdb`,nodeId:`11586:206598`}}},p={name:`selected off`,args:{selected:!1},parameters:{figma:{fileKey:`qAF4nlt6O4ThbeXeO7jzdb`,nodeId:`11586:206580`}}},m={name:`disabled on`,args:{disabled:!0},parameters:{figma:{fileKey:`qAF4nlt6O4ThbeXeO7jzdb`,nodeId:`11586:206580`}}},h={name:`disabled off`,args:{disabled:!1},parameters:{figma:{fileKey:`qAF4nlt6O4ThbeXeO7jzdb`,nodeId:`11586:206580`}}},c.parameters={...c.parameters,docs:{...c.parameters?.docs,source:{originalSource:`{
  name: "Default",
  args: {},
  parameters: {
    figma: {
      fileKey: "qAF4nlt6O4ThbeXeO7jzdb",
      nodeId: "11586:206580"
    }
  }
}`,...c.parameters?.docs?.source}}},u.parameters={...u.parameters,docs:{...u.parameters?.docs,source:{originalSource:`{
  name: 'State matrix',
  parameters: {
    // \`sheet\` points the overlay at the composited golden for the whole set
    // rather than one variant's artwork.
    figma: {
      fileKey: "qAF4nlt6O4ThbeXeO7jzdb",
      sheet: true,
      slug: "radio",
      selector: '.s2a-matrix'
    },
    controls: {
      disable: true
    }
  },
  render: () => html\`
    <div class="s2a-matrix-wrap">
      <div class="s2a-matrix-corner"></div>
      <div class="s2a-matrix-cols">
        \${MATRIX.cols.map(c => html\`<div class="s2a-matrix-col">\${c}</div>\`)}
      </div>
      <div class="s2a-matrix-rows">
        \${MATRIX.rows.map(r => html\`<div class="s2a-matrix-row">\${r}</div>\`)}
      </div>
      <div class="s2a-matrix">
        <div class="s2a-matrix__cell">\${Radio({
    "selected": false
  })}</div>
        <div class="s2a-matrix__cell">\${Radio({
    "selected": false,
    "forceState": "hover"
  })}</div>
        <div class="s2a-matrix__cell">\${Radio({
    "selected": false,
    "forceState": "focus"
  })}</div>
        <div class="s2a-matrix__cell">\${Radio({
    "selected": false,
    "forceState": "disabled"
  })}</div>
        <div class="s2a-matrix__cell">\${Radio({
    "selected": true
  })}</div>
        <div class="s2a-matrix__cell">\${Radio({
    "selected": true,
    "forceState": "hover"
  })}</div>
        <div class="s2a-matrix__cell">\${Radio({
    "selected": true,
    "forceState": "focus"
  })}</div>
        <div class="s2a-matrix__cell">\${Radio({
    "selected": true,
    "forceState": "disabled"
  })}</div>
      </div>
    </div>
    <style>
      .s2a-matrix-wrap {
        display: inline-grid;
        grid-template-columns: auto auto;
        gap: var(--s2a-spacing-xs);
        align-items: start;
        font: var(--s2a-font-size-xs)/var(--s2a-font-line-height-xs) var(--s2a-font-family-body);
        color: var(--s2a-color-content-body-subtle);
      }
      .s2a-matrix-cols { display: grid; grid-template-columns: repeat(\${MATRIX.cols.length}, \${MATRIX.cell.w}px); }
      .s2a-matrix-rows { display: grid; grid-auto-rows: \${MATRIX.cell.h}px; }
      .s2a-matrix-col { text-align: center; }
      .s2a-matrix-row { display: grid; align-items: center; justify-content: end; white-space: nowrap; padding-right: var(--s2a-spacing-2xs); }
      /* Measured against the sheet: cells only, exact cell size, no gap. */
      .s2a-matrix {
        display: grid;
        grid-template-columns: repeat(\${MATRIX.cols.length}, \${MATRIX.cell.w}px);
        grid-auto-rows: \${MATRIX.cell.h}px;
        gap: 0;
      }
      /* The cells are real buttons, and a real pointer passing over one adds a
         genuine :hover on top of whatever state the cell is supposed to be
         showing — so dragging the wipe across the grid silently corrupts every
         cell the cursor crosses. In a matrix the state is SET, never pointed
         at, so nothing here takes pointer input. */
      .s2a-matrix, .s2a-matrix * { pointer-events: none; }
      /* The pad is the cell's padding, so a component that fills its
         container fills the artwork's box, not the cell's. */
      .s2a-matrix__cell { display: grid; place-items: center; padding: \${MATRIX.cell.pad}px; box-sizing: border-box; }
    </style>
  \`
}`,...u.parameters?.docs?.source},description:{story:`Every variant at once. Turn on the Design overlay to wipe this whole grid
against the Figma set in a single comparison.`,...u.parameters?.docs?.description}}},d.parameters={...d.parameters,docs:{...d.parameters?.docs,source:{originalSource:`{
  name: "With content",
  args: {
    value: html\`<p style="margin:0">Content placed in the value slot.</p>\`,
    selected: true
  }
}`,...d.parameters?.docs?.source}}},f.parameters={...f.parameters,docs:{...f.parameters?.docs,source:{originalSource:`{
  name: "selected on",
  args: {
    "selected": true
  },
  parameters: {
    figma: {
      fileKey: "qAF4nlt6O4ThbeXeO7jzdb",
      nodeId: "11586:206598"
    }
  }
}`,...f.parameters?.docs?.source}}},p.parameters={...p.parameters,docs:{...p.parameters?.docs,source:{originalSource:`{
  name: "selected off",
  args: {
    "selected": false
  },
  parameters: {
    figma: {
      fileKey: "qAF4nlt6O4ThbeXeO7jzdb",
      nodeId: "11586:206580"
    }
  }
}`,...p.parameters?.docs?.source}}},m.parameters={...m.parameters,docs:{...m.parameters?.docs,source:{originalSource:`{
  name: "disabled on",
  args: {
    "disabled": true
  },
  parameters: {
    figma: {
      fileKey: "qAF4nlt6O4ThbeXeO7jzdb",
      nodeId: "11586:206580"
    }
  }
}`,...m.parameters?.docs?.source}}},h.parameters={...h.parameters,docs:{...h.parameters?.docs,source:{originalSource:`{
  name: "disabled off",
  args: {
    "disabled": false
  },
  parameters: {
    figma: {
      fileKey: "qAF4nlt6O4ThbeXeO7jzdb",
      nodeId: "11586:206580"
    }
  }
}`,...h.parameters?.docs?.source}}},g=[`Default`,`StateMatrix`,`WithContent`,`SelectedOn`,`SelectedOff`,`DisabledOn`,`DisabledOff`]})))()}_();export{c as Default,h as DisabledOff,m as DisabledOn,p as SelectedOff,f as SelectedOn,u as StateMatrix,d as WithContent,g as __namedExportsOrder,s as default};