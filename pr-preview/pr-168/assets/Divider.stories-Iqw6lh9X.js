import{n as e}from"./rolldown-runtime-C0FnF6B9.js";import{c as t,t as n}from"./lit-DRzJKe3d.js";import{n as r,t as i}from"./Divider-Bhq5fhgk.js";var a,o,s,c,l,u,d,f,p,m;function h(){return(h=e((()=>{n(),r(),a={title:`Generated/Divider`,component:`Divider`,render:e=>i(e),argTypes:{style:{control:`select`,options:[`default`,`subtle`,`knockout`,`inverse`,`subtle-inverse`]}}},o={name:`Default`,args:{},parameters:{figma:{fileKey:`qAF4nlt6O4ThbeXeO7jzdb`,nodeId:`10563:115905`}}},s={cols:[`default`],rows:[`default`,`subtle`,`knockout`,`inverse`,`subtle-inverse`],cell:{w:442,h:25,pad:12}},c={name:`State matrix`,parameters:{figma:{fileKey:`qAF4nlt6O4ThbeXeO7jzdb`,sheet:!0,slug:`divider`,selector:`.s2a-matrix`},controls:{disable:!0}},render:()=>t`
    <div class="s2a-matrix-wrap">
      <div class="s2a-matrix-corner"></div>
      <div class="s2a-matrix-cols">
        ${s.cols.map(e=>t`<div class="s2a-matrix-col">${e}</div>`)}
      </div>
      <div class="s2a-matrix-rows">
        ${s.rows.map(e=>t`<div class="s2a-matrix-row">${e}</div>`)}
      </div>
      <div class="s2a-matrix">
        <div class="s2a-matrix__cell">${i({style:`default`})}</div>
        <div class="s2a-matrix__cell">${i({style:`subtle`})}</div>
        <div class="s2a-matrix__cell">${i({style:`knockout`})}</div>
        <div class="s2a-matrix__cell">${i({style:`inverse`})}</div>
        <div class="s2a-matrix__cell">${i({style:`subtle-inverse`})}</div>
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
  `},l={name:`style: default`,args:{style:`default`},parameters:{figma:{fileKey:`qAF4nlt6O4ThbeXeO7jzdb`,nodeId:`10563:115905`}}},u={name:`style: subtle`,args:{style:`subtle`},parameters:{figma:{fileKey:`qAF4nlt6O4ThbeXeO7jzdb`,nodeId:`10910:21033`}}},d={name:`style: knockout`,args:{style:`knockout`},parameters:{figma:{fileKey:`qAF4nlt6O4ThbeXeO7jzdb`,nodeId:`10910:21034`}}},f={name:`style: inverse`,args:{style:`inverse`},parameters:{figma:{fileKey:`qAF4nlt6O4ThbeXeO7jzdb`,nodeId:`10910:21035`}}},p={name:`style: subtle-inverse`,args:{style:`subtle-inverse`},parameters:{figma:{fileKey:`qAF4nlt6O4ThbeXeO7jzdb`,nodeId:`10910:21037`}}},o.parameters={...o.parameters,docs:{...o.parameters?.docs,source:{originalSource:`{
  name: "Default",
  args: {},
  parameters: {
    figma: {
      fileKey: "qAF4nlt6O4ThbeXeO7jzdb",
      nodeId: "10563:115905"
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
      slug: "divider",
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
        <div class="s2a-matrix__cell">\${Divider({
    "style": "default"
  })}</div>
        <div class="s2a-matrix__cell">\${Divider({
    "style": "subtle"
  })}</div>
        <div class="s2a-matrix__cell">\${Divider({
    "style": "knockout"
  })}</div>
        <div class="s2a-matrix__cell">\${Divider({
    "style": "inverse"
  })}</div>
        <div class="s2a-matrix__cell">\${Divider({
    "style": "subtle-inverse"
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
  name: "style: default",
  args: {
    "style": "default"
  },
  parameters: {
    figma: {
      fileKey: "qAF4nlt6O4ThbeXeO7jzdb",
      nodeId: "10563:115905"
    }
  }
}`,...l.parameters?.docs?.source}}},u.parameters={...u.parameters,docs:{...u.parameters?.docs,source:{originalSource:`{
  name: "style: subtle",
  args: {
    "style": "subtle"
  },
  parameters: {
    figma: {
      fileKey: "qAF4nlt6O4ThbeXeO7jzdb",
      nodeId: "10910:21033"
    }
  }
}`,...u.parameters?.docs?.source}}},d.parameters={...d.parameters,docs:{...d.parameters?.docs,source:{originalSource:`{
  name: "style: knockout",
  args: {
    "style": "knockout"
  },
  parameters: {
    figma: {
      fileKey: "qAF4nlt6O4ThbeXeO7jzdb",
      nodeId: "10910:21034"
    }
  }
}`,...d.parameters?.docs?.source}}},f.parameters={...f.parameters,docs:{...f.parameters?.docs,source:{originalSource:`{
  name: "style: inverse",
  args: {
    "style": "inverse"
  },
  parameters: {
    figma: {
      fileKey: "qAF4nlt6O4ThbeXeO7jzdb",
      nodeId: "10910:21035"
    }
  }
}`,...f.parameters?.docs?.source}}},p.parameters={...p.parameters,docs:{...p.parameters?.docs,source:{originalSource:`{
  name: "style: subtle-inverse",
  args: {
    "style": "subtle-inverse"
  },
  parameters: {
    figma: {
      fileKey: "qAF4nlt6O4ThbeXeO7jzdb",
      nodeId: "10910:21037"
    }
  }
}`,...p.parameters?.docs?.source}}},m=[`Default`,`StateMatrix`,`StyleDefault`,`StyleSubtle`,`StyleKnockout`,`StyleInverse`,`StyleSubtleInverse`]})))()}h();export{o as Default,c as StateMatrix,l as StyleDefault,f as StyleInverse,d as StyleKnockout,u as StyleSubtle,p as StyleSubtleInverse,m as __namedExportsOrder,a as default};