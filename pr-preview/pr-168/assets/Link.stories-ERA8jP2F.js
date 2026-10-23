import{n as e}from"./rolldown-runtime-C0FnF6B9.js";import{c as t,t as n}from"./lit-DRzJKe3d.js";import{n as r,t as i}from"./Link-AxwaVWF4.js";var a,o,s,c,l,u,d,f,p,m,h;function g(){return(g=e((()=>{n(),r(),a={title:`Generated/Link`,component:`Link`,render:e=>i(e),argTypes:{emphasis:{control:`select`,options:[`default`,`subtle`]},kind:{control:`select`,options:[`action`,`text`]}}},o={name:`Default`,args:{},parameters:{figma:{fileKey:`qAF4nlt6O4ThbeXeO7jzdb`,nodeId:`12823:184376`}}},s={cols:[`default`],rows:[`default / action`,`default / text`,`subtle / text`],cell:{w:80,h:48,pad:12}},c={name:`State matrix`,parameters:{figma:{fileKey:`qAF4nlt6O4ThbeXeO7jzdb`,sheet:!0,slug:`link`,selector:`.s2a-matrix`},controls:{disable:!0}},render:()=>t`
    <div class="s2a-matrix-wrap">
      <div class="s2a-matrix-corner"></div>
      <div class="s2a-matrix-cols">
        ${s.cols.map(e=>t`<div class="s2a-matrix-col">${e}</div>`)}
      </div>
      <div class="s2a-matrix-rows">
        ${s.rows.map(e=>t`<div class="s2a-matrix-row">${e}</div>`)}
      </div>
      <div class="s2a-matrix">
        <div class="s2a-matrix__cell">${i({emphasis:`default`,kind:`action`})}</div>
        <div class="s2a-matrix__cell">${i({emphasis:`default`,kind:`text`})}</div>
        <div class="s2a-matrix__cell">${i({emphasis:`subtle`,kind:`text`})}</div>
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
  `},l={name:`emphasis: default`,args:{emphasis:`default`},parameters:{figma:{fileKey:`qAF4nlt6O4ThbeXeO7jzdb`,nodeId:`12823:184376`}}},u={name:`emphasis: subtle`,args:{emphasis:`subtle`}},d={name:`kind: action`,args:{kind:`action`},parameters:{figma:{fileKey:`qAF4nlt6O4ThbeXeO7jzdb`,nodeId:`12823:184376`}}},f={name:`kind: text`,args:{kind:`text`},parameters:{figma:{fileKey:`qAF4nlt6O4ThbeXeO7jzdb`,nodeId:`12823:184392`}}},p={name:`underline on`,args:{underline:!0},parameters:{figma:{fileKey:`qAF4nlt6O4ThbeXeO7jzdb`,nodeId:`12823:184376`}}},m={name:`underline off`,args:{underline:!1},parameters:{figma:{fileKey:`qAF4nlt6O4ThbeXeO7jzdb`,nodeId:`12823:184376`}}},o.parameters={...o.parameters,docs:{...o.parameters?.docs,source:{originalSource:`{
  name: "Default",
  args: {},
  parameters: {
    figma: {
      fileKey: "qAF4nlt6O4ThbeXeO7jzdb",
      nodeId: "12823:184376"
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
      slug: "link",
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
        <div class="s2a-matrix__cell">\${Link({
    "emphasis": "default",
    "kind": "action"
  })}</div>
        <div class="s2a-matrix__cell">\${Link({
    "emphasis": "default",
    "kind": "text"
  })}</div>
        <div class="s2a-matrix__cell">\${Link({
    "emphasis": "subtle",
    "kind": "text"
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
  name: "emphasis: default",
  args: {
    "emphasis": "default"
  },
  parameters: {
    figma: {
      fileKey: "qAF4nlt6O4ThbeXeO7jzdb",
      nodeId: "12823:184376"
    }
  }
}`,...l.parameters?.docs?.source}}},u.parameters={...u.parameters,docs:{...u.parameters?.docs,source:{originalSource:`{
  name: "emphasis: subtle",
  args: {
    "emphasis": "subtle"
  }
}`,...u.parameters?.docs?.source}}},d.parameters={...d.parameters,docs:{...d.parameters?.docs,source:{originalSource:`{
  name: "kind: action",
  args: {
    "kind": "action"
  },
  parameters: {
    figma: {
      fileKey: "qAF4nlt6O4ThbeXeO7jzdb",
      nodeId: "12823:184376"
    }
  }
}`,...d.parameters?.docs?.source}}},f.parameters={...f.parameters,docs:{...f.parameters?.docs,source:{originalSource:`{
  name: "kind: text",
  args: {
    "kind": "text"
  },
  parameters: {
    figma: {
      fileKey: "qAF4nlt6O4ThbeXeO7jzdb",
      nodeId: "12823:184392"
    }
  }
}`,...f.parameters?.docs?.source}}},p.parameters={...p.parameters,docs:{...p.parameters?.docs,source:{originalSource:`{
  name: "underline on",
  args: {
    "underline": true
  },
  parameters: {
    figma: {
      fileKey: "qAF4nlt6O4ThbeXeO7jzdb",
      nodeId: "12823:184376"
    }
  }
}`,...p.parameters?.docs?.source}}},m.parameters={...m.parameters,docs:{...m.parameters?.docs,source:{originalSource:`{
  name: "underline off",
  args: {
    "underline": false
  },
  parameters: {
    figma: {
      fileKey: "qAF4nlt6O4ThbeXeO7jzdb",
      nodeId: "12823:184376"
    }
  }
}`,...m.parameters?.docs?.source}}},h=[`Default`,`StateMatrix`,`EmphasisDefault`,`EmphasisSubtle`,`KindAction`,`KindText`,`UnderlineOn`,`UnderlineOff`]})))()}g();export{o as Default,l as EmphasisDefault,u as EmphasisSubtle,d as KindAction,f as KindText,c as StateMatrix,m as UnderlineOff,p as UnderlineOn,h as __namedExportsOrder,a as default};