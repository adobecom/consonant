import{n as e}from"./rolldown-runtime-C0FnF6B9.js";import{c as t,t as n}from"./lit-DRzJKe3d.js";import{n as r,t as i}from"./Collapsible-D_thVcFp.js";var a,o,s,c,l,u,d,f,p,m,h,g;function _(){return(_=e((()=>{n(),r(),a={title:`Generated/Collapsible`,component:`Collapsible`,render:e=>i(e),argTypes:{size:{control:`select`,options:[`default`,`lg`]},style:{control:`select`,options:[`default`,`control`]}}},o={name:`Default`,args:{},parameters:{figma:{fileKey:`qAF4nlt6O4ThbeXeO7jzdb`,nodeId:`10564:116540`}}},s={cols:[`open`,`closed`],rows:[`default / default`,`lg / default`,`lg / control`],cell:{w:410,h:160,pad:12}},c={name:`State matrix`,parameters:{figma:{fileKey:`qAF4nlt6O4ThbeXeO7jzdb`,sheet:!0,slug:`collapsible`,selector:`.s2a-matrix`},controls:{disable:!0}},render:()=>t`
    <div class="s2a-matrix-wrap">
      <div class="s2a-matrix-corner"></div>
      <div class="s2a-matrix-cols">
        ${s.cols.map(e=>t`<div class="s2a-matrix-col">${e}</div>`)}
      </div>
      <div class="s2a-matrix-rows">
        ${s.rows.map(e=>t`<div class="s2a-matrix-row">${e}</div>`)}
      </div>
      <div class="s2a-matrix">
        <div class="s2a-matrix__cell">${i({size:`default`,style:`default`,open:!0})}</div>
        <div class="s2a-matrix__cell">${i({size:`default`,style:`default`,open:!1})}</div>
        <div class="s2a-matrix__cell">${i({size:`lg`,style:`default`,open:!0})}</div>
        <div class="s2a-matrix__cell">${i({size:`lg`,style:`default`,open:!1})}</div>
        <div class="s2a-matrix__cell">${i({size:`lg`,style:`control`,open:!0})}</div>
        <div class="s2a-matrix__cell">${i({size:`lg`,style:`control`,open:!1})}</div>
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
      .s2a-matrix-cols { display: grid; grid-template-columns: repeat(${s.cols.length}, ${s.cell.w}px); }
      .s2a-matrix-rows { display: grid; grid-auto-rows: ${s.cell.h}px; }
      .s2a-matrix-col { text-align: center; }
      .s2a-matrix-row { display: grid; align-items: center; justify-content: end; white-space: nowrap; padding-right: var(--s2a-spacing-2xs); }
      /* Measured against the sheet: cells only, exact cell size, no gap. */
      .s2a-matrix {
        display: grid;
        grid-template-columns: repeat(${s.cols.length}, ${s.cell.w}px);
        grid-auto-rows: ${s.cell.h}px;
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
      .s2a-matrix__cell { display: grid; place-items: center; padding: ${s.cell.pad}px; box-sizing: border-box; }
    </style>
  `},l={name:`With content`,args:{content:t`<p style="margin:0">Content placed in the content slot.</p>`,open:!0}},u={name:`size: default`,args:{size:`default`},parameters:{figma:{fileKey:`qAF4nlt6O4ThbeXeO7jzdb`,nodeId:`10564:116540`}}},d={name:`size: lg`,args:{size:`lg`},parameters:{figma:{fileKey:`qAF4nlt6O4ThbeXeO7jzdb`,nodeId:`13542:44865`}}},f={name:`open on`,args:{open:!0},parameters:{figma:{fileKey:`qAF4nlt6O4ThbeXeO7jzdb`,nodeId:`10564:116540`}}},p={name:`open off`,args:{open:!1},parameters:{figma:{fileKey:`qAF4nlt6O4ThbeXeO7jzdb`,nodeId:`10564:116540`}}},m={name:`style: default`,args:{style:`default`},parameters:{figma:{fileKey:`qAF4nlt6O4ThbeXeO7jzdb`,nodeId:`10564:116540`}}},h={name:`style: control`,args:{style:`control`}},o.parameters={...o.parameters,docs:{...o.parameters?.docs,source:{originalSource:`{
  name: "Default",
  args: {},
  parameters: {
    figma: {
      fileKey: "qAF4nlt6O4ThbeXeO7jzdb",
      nodeId: "10564:116540"
    }
  }
}`,...o.parameters?.docs?.source}}},c.parameters={...c.parameters,docs:{...c.parameters?.docs,source:{originalSource:`{
  name: 'State matrix',
  parameters: {
    // \`sheet\` points the overlay at the composited golden for the whole set
    // rather than one variant's artwork.
    figma: {
      fileKey: "qAF4nlt6O4ThbeXeO7jzdb",
      sheet: true,
      slug: "collapsible",
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
        <div class="s2a-matrix__cell">\${Collapsible({
    "size": "default",
    "style": "default",
    "open": true
  })}</div>
        <div class="s2a-matrix__cell">\${Collapsible({
    "size": "default",
    "style": "default",
    "open": false
  })}</div>
        <div class="s2a-matrix__cell">\${Collapsible({
    "size": "lg",
    "style": "default",
    "open": true
  })}</div>
        <div class="s2a-matrix__cell">\${Collapsible({
    "size": "lg",
    "style": "default",
    "open": false
  })}</div>
        <div class="s2a-matrix__cell">\${Collapsible({
    "size": "lg",
    "style": "control",
    "open": true
  })}</div>
        <div class="s2a-matrix__cell">\${Collapsible({
    "size": "lg",
    "style": "control",
    "open": false
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
}`,...c.parameters?.docs?.source},description:{story:`Every variant at once. Turn on the Design overlay to wipe this whole grid
against the Figma set in a single comparison.`,...c.parameters?.docs?.description}}},l.parameters={...l.parameters,docs:{...l.parameters?.docs,source:{originalSource:`{
  name: "With content",
  args: {
    content: html\`<p style="margin:0">Content placed in the content slot.</p>\`,
    open: true
  }
}`,...l.parameters?.docs?.source}}},u.parameters={...u.parameters,docs:{...u.parameters?.docs,source:{originalSource:`{
  name: "size: default",
  args: {
    "size": "default"
  },
  parameters: {
    figma: {
      fileKey: "qAF4nlt6O4ThbeXeO7jzdb",
      nodeId: "10564:116540"
    }
  }
}`,...u.parameters?.docs?.source}}},d.parameters={...d.parameters,docs:{...d.parameters?.docs,source:{originalSource:`{
  name: "size: lg",
  args: {
    "size": "lg"
  },
  parameters: {
    figma: {
      fileKey: "qAF4nlt6O4ThbeXeO7jzdb",
      nodeId: "13542:44865"
    }
  }
}`,...d.parameters?.docs?.source}}},f.parameters={...f.parameters,docs:{...f.parameters?.docs,source:{originalSource:`{
  name: "open on",
  args: {
    "open": true
  },
  parameters: {
    figma: {
      fileKey: "qAF4nlt6O4ThbeXeO7jzdb",
      nodeId: "10564:116540"
    }
  }
}`,...f.parameters?.docs?.source}}},p.parameters={...p.parameters,docs:{...p.parameters?.docs,source:{originalSource:`{
  name: "open off",
  args: {
    "open": false
  },
  parameters: {
    figma: {
      fileKey: "qAF4nlt6O4ThbeXeO7jzdb",
      nodeId: "10564:116540"
    }
  }
}`,...p.parameters?.docs?.source}}},m.parameters={...m.parameters,docs:{...m.parameters?.docs,source:{originalSource:`{
  name: "style: default",
  args: {
    "style": "default"
  },
  parameters: {
    figma: {
      fileKey: "qAF4nlt6O4ThbeXeO7jzdb",
      nodeId: "10564:116540"
    }
  }
}`,...m.parameters?.docs?.source}}},h.parameters={...h.parameters,docs:{...h.parameters?.docs,source:{originalSource:`{
  name: "style: control",
  args: {
    "style": "control"
  }
}`,...h.parameters?.docs?.source}}},g=[`Default`,`StateMatrix`,`WithContent`,`SizeDefault`,`SizeLg`,`OpenOn`,`OpenOff`,`StyleDefault`,`StyleControl`]})))()}_();export{o as Default,p as OpenOff,f as OpenOn,u as SizeDefault,d as SizeLg,c as StateMatrix,h as StyleControl,m as StyleDefault,l as WithContent,g as __namedExportsOrder,a as default};