import{n as e}from"./rolldown-runtime-C0FnF6B9.js";import{c as t,t as n}from"./lit-DRzJKe3d.js";import{n as r,t as i}from"./ProductLockup-DKo5vZP0.js";var a,o,s,c,l,u,d,f,p,m,h,g,_,v,y,b,x,S,C,w,T,E,D,O;function k(){return(k=e((()=>{n(),r(),a={title:`Generated/ProductLockup`,component:`ProductLockup`,render:e=>i(e),argTypes:{orientation:{control:`select`,options:[`horizontal`,`vertical`]},style:{control:`select`,options:[`label`,`eyebrow`,`knockout`,`inverse`]},width:{control:`select`,options:[`hug`,`fill`]}}},o={name:`Default`,args:{},parameters:{figma:{fileKey:`qAF4nlt6O4ThbeXeO7jzdb`,nodeId:`11272:217584`}}},s={cols:[`default`],rows:[`horizontal / label / hug`,`horizontal / label / fill`,`horizontal / eyebrow / hug`,`horizontal / eyebrow / fill`,`horizontal / knockout / hug`,`horizontal / knockout / fill`,`horizontal / inverse / hug`,`horizontal / inverse / fill`,`vertical / label / hug`,`vertical / label / fill`,`vertical / eyebrow / hug`,`vertical / eyebrow / fill`,`vertical / knockout / hug`,`vertical / knockout / fill`,`vertical / inverse / hug`,`vertical / inverse / fill`],cell:{w:178,h:80,pad:12}},c={name:`State matrix`,parameters:{figma:{fileKey:`qAF4nlt6O4ThbeXeO7jzdb`,sheet:!0,slug:`product-lockup`,selector:`.s2a-matrix`},controls:{disable:!0}},render:()=>t`
    <div class="s2a-matrix-wrap">
      <div class="s2a-matrix-corner"></div>
      <div class="s2a-matrix-cols">
        ${s.cols.map(e=>t`<div class="s2a-matrix-col">${e}</div>`)}
      </div>
      <div class="s2a-matrix-rows">
        ${s.rows.map(e=>t`<div class="s2a-matrix-row">${e}</div>`)}
      </div>
      <div class="s2a-matrix">
        <div class="s2a-matrix__cell">${i({orientation:`horizontal`,style:`label`,width:`hug`})}</div>
        <div class="s2a-matrix__cell">${i({orientation:`horizontal`,style:`label`,width:`fill`})}</div>
        <div class="s2a-matrix__cell">${i({orientation:`horizontal`,style:`eyebrow`,width:`hug`})}</div>
        <div class="s2a-matrix__cell">${i({orientation:`horizontal`,style:`eyebrow`,width:`fill`})}</div>
        <div class="s2a-matrix__cell">${i({orientation:`horizontal`,style:`knockout`,width:`hug`})}</div>
        <div class="s2a-matrix__cell">${i({orientation:`horizontal`,style:`knockout`,width:`fill`})}</div>
        <div class="s2a-matrix__cell">${i({orientation:`horizontal`,style:`inverse`,width:`hug`})}</div>
        <div class="s2a-matrix__cell">${i({orientation:`horizontal`,style:`inverse`,width:`fill`})}</div>
        <div class="s2a-matrix__cell">${i({orientation:`vertical`,style:`label`,width:`hug`})}</div>
        <div class="s2a-matrix__cell">${i({orientation:`vertical`,style:`label`,width:`fill`})}</div>
        <div class="s2a-matrix__cell">${i({orientation:`vertical`,style:`eyebrow`,width:`hug`})}</div>
        <div class="s2a-matrix__cell">${i({orientation:`vertical`,style:`eyebrow`,width:`fill`})}</div>
        <div class="s2a-matrix__cell">${i({orientation:`vertical`,style:`knockout`,width:`hug`})}</div>
        <div class="s2a-matrix__cell">${i({orientation:`vertical`,style:`knockout`,width:`fill`})}</div>
        <div class="s2a-matrix__cell">${i({orientation:`vertical`,style:`inverse`,width:`hug`})}</div>
        <div class="s2a-matrix__cell">${i({orientation:`vertical`,style:`inverse`,width:`fill`})}</div>
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
  `},l={name:`With content`,args:{caret:t`<p style="margin:0">Content placed in the caret slot.</p>`}},u={name:`orientation: horizontal`,args:{orientation:`horizontal`},parameters:{figma:{fileKey:`qAF4nlt6O4ThbeXeO7jzdb`,nodeId:`11272:217584`}}},d={name:`orientation: vertical`,args:{orientation:`vertical`},parameters:{figma:{fileKey:`qAF4nlt6O4ThbeXeO7jzdb`,nodeId:`11272:217598`}}},f={name:`showAppIcon on`,args:{showAppIcon:!0},parameters:{figma:{fileKey:`qAF4nlt6O4ThbeXeO7jzdb`,nodeId:`11272:217584`}}},p={name:`showAppIcon off`,args:{showAppIcon:!1},parameters:{figma:{fileKey:`qAF4nlt6O4ThbeXeO7jzdb`,nodeId:`11272:217584`}}},m={name:`showIconEnd on`,args:{showIconEnd:!0},parameters:{figma:{fileKey:`qAF4nlt6O4ThbeXeO7jzdb`,nodeId:`11272:217584`}}},h={name:`showIconEnd off`,args:{showIconEnd:!1},parameters:{figma:{fileKey:`qAF4nlt6O4ThbeXeO7jzdb`,nodeId:`11272:217584`}}},g={name:`showSecondAppIcon on`,args:{showSecondAppIcon:!0},parameters:{figma:{fileKey:`qAF4nlt6O4ThbeXeO7jzdb`,nodeId:`11272:217584`}}},_={name:`showSecondAppIcon off`,args:{showSecondAppIcon:!1},parameters:{figma:{fileKey:`qAF4nlt6O4ThbeXeO7jzdb`,nodeId:`11272:217584`}}},v={name:`style: label`,args:{style:`label`},parameters:{figma:{fileKey:`qAF4nlt6O4ThbeXeO7jzdb`,nodeId:`11272:217584`}}},y={name:`style: eyebrow`,args:{style:`eyebrow`},parameters:{figma:{fileKey:`qAF4nlt6O4ThbeXeO7jzdb`,nodeId:`11272:217591`}}},b={name:`style: knockout`,args:{style:`knockout`},parameters:{figma:{fileKey:`qAF4nlt6O4ThbeXeO7jzdb`,nodeId:`11273:218228`}}},x={name:`style: inverse`,args:{style:`inverse`},parameters:{figma:{fileKey:`qAF4nlt6O4ThbeXeO7jzdb`,nodeId:`11320:226620`}}},S={name:`width: hug`,args:{width:`hug`},parameters:{figma:{fileKey:`qAF4nlt6O4ThbeXeO7jzdb`,nodeId:`11272:217584`}}},C={name:`width: fill`,args:{width:`fill`},parameters:{figma:{fileKey:`qAF4nlt6O4ThbeXeO7jzdb`,nodeId:`11272:217612`}}},w={name:`showSecondIcon on`,args:{showSecondIcon:!0},parameters:{figma:{fileKey:`qAF4nlt6O4ThbeXeO7jzdb`,nodeId:`11272:217584`}}},T={name:`showSecondIcon off`,args:{showSecondIcon:!1},parameters:{figma:{fileKey:`qAF4nlt6O4ThbeXeO7jzdb`,nodeId:`11272:217584`}}},E={name:`showIconStart on`,args:{showIconStart:!0},parameters:{figma:{fileKey:`qAF4nlt6O4ThbeXeO7jzdb`,nodeId:`11272:217584`}}},D={name:`showIconStart off`,args:{showIconStart:!1},parameters:{figma:{fileKey:`qAF4nlt6O4ThbeXeO7jzdb`,nodeId:`11272:217584`}}},o.parameters={...o.parameters,docs:{...o.parameters?.docs,source:{originalSource:`{
  name: "Default",
  args: {},
  parameters: {
    figma: {
      fileKey: "qAF4nlt6O4ThbeXeO7jzdb",
      nodeId: "11272:217584"
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
      slug: "product-lockup",
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
        <div class="s2a-matrix__cell">\${ProductLockup({
    "orientation": "horizontal",
    "style": "label",
    "width": "hug"
  })}</div>
        <div class="s2a-matrix__cell">\${ProductLockup({
    "orientation": "horizontal",
    "style": "label",
    "width": "fill"
  })}</div>
        <div class="s2a-matrix__cell">\${ProductLockup({
    "orientation": "horizontal",
    "style": "eyebrow",
    "width": "hug"
  })}</div>
        <div class="s2a-matrix__cell">\${ProductLockup({
    "orientation": "horizontal",
    "style": "eyebrow",
    "width": "fill"
  })}</div>
        <div class="s2a-matrix__cell">\${ProductLockup({
    "orientation": "horizontal",
    "style": "knockout",
    "width": "hug"
  })}</div>
        <div class="s2a-matrix__cell">\${ProductLockup({
    "orientation": "horizontal",
    "style": "knockout",
    "width": "fill"
  })}</div>
        <div class="s2a-matrix__cell">\${ProductLockup({
    "orientation": "horizontal",
    "style": "inverse",
    "width": "hug"
  })}</div>
        <div class="s2a-matrix__cell">\${ProductLockup({
    "orientation": "horizontal",
    "style": "inverse",
    "width": "fill"
  })}</div>
        <div class="s2a-matrix__cell">\${ProductLockup({
    "orientation": "vertical",
    "style": "label",
    "width": "hug"
  })}</div>
        <div class="s2a-matrix__cell">\${ProductLockup({
    "orientation": "vertical",
    "style": "label",
    "width": "fill"
  })}</div>
        <div class="s2a-matrix__cell">\${ProductLockup({
    "orientation": "vertical",
    "style": "eyebrow",
    "width": "hug"
  })}</div>
        <div class="s2a-matrix__cell">\${ProductLockup({
    "orientation": "vertical",
    "style": "eyebrow",
    "width": "fill"
  })}</div>
        <div class="s2a-matrix__cell">\${ProductLockup({
    "orientation": "vertical",
    "style": "knockout",
    "width": "hug"
  })}</div>
        <div class="s2a-matrix__cell">\${ProductLockup({
    "orientation": "vertical",
    "style": "knockout",
    "width": "fill"
  })}</div>
        <div class="s2a-matrix__cell">\${ProductLockup({
    "orientation": "vertical",
    "style": "inverse",
    "width": "hug"
  })}</div>
        <div class="s2a-matrix__cell">\${ProductLockup({
    "orientation": "vertical",
    "style": "inverse",
    "width": "fill"
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
    caret: html\`<p style="margin:0">Content placed in the caret slot.</p>\`
  }
}`,...l.parameters?.docs?.source}}},u.parameters={...u.parameters,docs:{...u.parameters?.docs,source:{originalSource:`{
  name: "orientation: horizontal",
  args: {
    "orientation": "horizontal"
  },
  parameters: {
    figma: {
      fileKey: "qAF4nlt6O4ThbeXeO7jzdb",
      nodeId: "11272:217584"
    }
  }
}`,...u.parameters?.docs?.source}}},d.parameters={...d.parameters,docs:{...d.parameters?.docs,source:{originalSource:`{
  name: "orientation: vertical",
  args: {
    "orientation": "vertical"
  },
  parameters: {
    figma: {
      fileKey: "qAF4nlt6O4ThbeXeO7jzdb",
      nodeId: "11272:217598"
    }
  }
}`,...d.parameters?.docs?.source}}},f.parameters={...f.parameters,docs:{...f.parameters?.docs,source:{originalSource:`{
  name: "showAppIcon on",
  args: {
    "showAppIcon": true
  },
  parameters: {
    figma: {
      fileKey: "qAF4nlt6O4ThbeXeO7jzdb",
      nodeId: "11272:217584"
    }
  }
}`,...f.parameters?.docs?.source}}},p.parameters={...p.parameters,docs:{...p.parameters?.docs,source:{originalSource:`{
  name: "showAppIcon off",
  args: {
    "showAppIcon": false
  },
  parameters: {
    figma: {
      fileKey: "qAF4nlt6O4ThbeXeO7jzdb",
      nodeId: "11272:217584"
    }
  }
}`,...p.parameters?.docs?.source}}},m.parameters={...m.parameters,docs:{...m.parameters?.docs,source:{originalSource:`{
  name: "showIconEnd on",
  args: {
    "showIconEnd": true
  },
  parameters: {
    figma: {
      fileKey: "qAF4nlt6O4ThbeXeO7jzdb",
      nodeId: "11272:217584"
    }
  }
}`,...m.parameters?.docs?.source}}},h.parameters={...h.parameters,docs:{...h.parameters?.docs,source:{originalSource:`{
  name: "showIconEnd off",
  args: {
    "showIconEnd": false
  },
  parameters: {
    figma: {
      fileKey: "qAF4nlt6O4ThbeXeO7jzdb",
      nodeId: "11272:217584"
    }
  }
}`,...h.parameters?.docs?.source}}},g.parameters={...g.parameters,docs:{...g.parameters?.docs,source:{originalSource:`{
  name: "showSecondAppIcon on",
  args: {
    "showSecondAppIcon": true
  },
  parameters: {
    figma: {
      fileKey: "qAF4nlt6O4ThbeXeO7jzdb",
      nodeId: "11272:217584"
    }
  }
}`,...g.parameters?.docs?.source}}},_.parameters={..._.parameters,docs:{..._.parameters?.docs,source:{originalSource:`{
  name: "showSecondAppIcon off",
  args: {
    "showSecondAppIcon": false
  },
  parameters: {
    figma: {
      fileKey: "qAF4nlt6O4ThbeXeO7jzdb",
      nodeId: "11272:217584"
    }
  }
}`,..._.parameters?.docs?.source}}},v.parameters={...v.parameters,docs:{...v.parameters?.docs,source:{originalSource:`{
  name: "style: label",
  args: {
    "style": "label"
  },
  parameters: {
    figma: {
      fileKey: "qAF4nlt6O4ThbeXeO7jzdb",
      nodeId: "11272:217584"
    }
  }
}`,...v.parameters?.docs?.source}}},y.parameters={...y.parameters,docs:{...y.parameters?.docs,source:{originalSource:`{
  name: "style: eyebrow",
  args: {
    "style": "eyebrow"
  },
  parameters: {
    figma: {
      fileKey: "qAF4nlt6O4ThbeXeO7jzdb",
      nodeId: "11272:217591"
    }
  }
}`,...y.parameters?.docs?.source}}},b.parameters={...b.parameters,docs:{...b.parameters?.docs,source:{originalSource:`{
  name: "style: knockout",
  args: {
    "style": "knockout"
  },
  parameters: {
    figma: {
      fileKey: "qAF4nlt6O4ThbeXeO7jzdb",
      nodeId: "11273:218228"
    }
  }
}`,...b.parameters?.docs?.source}}},x.parameters={...x.parameters,docs:{...x.parameters?.docs,source:{originalSource:`{
  name: "style: inverse",
  args: {
    "style": "inverse"
  },
  parameters: {
    figma: {
      fileKey: "qAF4nlt6O4ThbeXeO7jzdb",
      nodeId: "11320:226620"
    }
  }
}`,...x.parameters?.docs?.source}}},S.parameters={...S.parameters,docs:{...S.parameters?.docs,source:{originalSource:`{
  name: "width: hug",
  args: {
    "width": "hug"
  },
  parameters: {
    figma: {
      fileKey: "qAF4nlt6O4ThbeXeO7jzdb",
      nodeId: "11272:217584"
    }
  }
}`,...S.parameters?.docs?.source}}},C.parameters={...C.parameters,docs:{...C.parameters?.docs,source:{originalSource:`{
  name: "width: fill",
  args: {
    "width": "fill"
  },
  parameters: {
    figma: {
      fileKey: "qAF4nlt6O4ThbeXeO7jzdb",
      nodeId: "11272:217612"
    }
  }
}`,...C.parameters?.docs?.source}}},w.parameters={...w.parameters,docs:{...w.parameters?.docs,source:{originalSource:`{
  name: "showSecondIcon on",
  args: {
    "showSecondIcon": true
  },
  parameters: {
    figma: {
      fileKey: "qAF4nlt6O4ThbeXeO7jzdb",
      nodeId: "11272:217584"
    }
  }
}`,...w.parameters?.docs?.source}}},T.parameters={...T.parameters,docs:{...T.parameters?.docs,source:{originalSource:`{
  name: "showSecondIcon off",
  args: {
    "showSecondIcon": false
  },
  parameters: {
    figma: {
      fileKey: "qAF4nlt6O4ThbeXeO7jzdb",
      nodeId: "11272:217584"
    }
  }
}`,...T.parameters?.docs?.source}}},E.parameters={...E.parameters,docs:{...E.parameters?.docs,source:{originalSource:`{
  name: "showIconStart on",
  args: {
    "showIconStart": true
  },
  parameters: {
    figma: {
      fileKey: "qAF4nlt6O4ThbeXeO7jzdb",
      nodeId: "11272:217584"
    }
  }
}`,...E.parameters?.docs?.source}}},D.parameters={...D.parameters,docs:{...D.parameters?.docs,source:{originalSource:`{
  name: "showIconStart off",
  args: {
    "showIconStart": false
  },
  parameters: {
    figma: {
      fileKey: "qAF4nlt6O4ThbeXeO7jzdb",
      nodeId: "11272:217584"
    }
  }
}`,...D.parameters?.docs?.source}}},O=[`Default`,`StateMatrix`,`WithContent`,`OrientationHorizontal`,`OrientationVertical`,`ShowappiconOn`,`ShowappiconOff`,`ShowiconendOn`,`ShowiconendOff`,`ShowsecondappiconOn`,`ShowsecondappiconOff`,`StyleLabel`,`StyleEyebrow`,`StyleKnockout`,`StyleInverse`,`WidthHug`,`WidthFill`,`ShowsecondiconOn`,`ShowsecondiconOff`,`ShowiconstartOn`,`ShowiconstartOff`]})))()}k();export{o as Default,u as OrientationHorizontal,d as OrientationVertical,p as ShowappiconOff,f as ShowappiconOn,h as ShowiconendOff,m as ShowiconendOn,D as ShowiconstartOff,E as ShowiconstartOn,_ as ShowsecondappiconOff,g as ShowsecondappiconOn,T as ShowsecondiconOff,w as ShowsecondiconOn,c as StateMatrix,y as StyleEyebrow,x as StyleInverse,b as StyleKnockout,v as StyleLabel,C as WidthFill,S as WidthHug,l as WithContent,O as __namedExportsOrder,a as default};