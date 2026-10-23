import{n as e}from"./rolldown-runtime-C0FnF6B9.js";import{c as t,i as n,t as r}from"./lit-DRzJKe3d.js";import{n as i,t as a}from"./Button-CXGneoQw.js";import{n as o,t as s}from"./Collapsible-D_thVcFp.js";import{n as c,t as l}from"./List-BxOrHFUs.js";import{n as u,t as d}from"./MerchCardPricingDisplay-DVfhYvgd.js";import{n as f,t as p}from"./MerchCardSelectPromo-BToqNs_h.js";import{n as m,t as h}from"./MerchCardTrustBadge-034HvqhS.js";import{n as g,t as _}from"./ProductLockup-DKo5vZP0.js";var v,y;function b(){return(b=e((()=>{r(),i(),o(),c(),u(),f(),m(),g(),v=e=>e!=null&&e!==``&&e!==!1&&!(Array.isArray(e)&&!e.length),y=({description:e=`Plan description goes here.`,featuresList:r=`default`,features:i=[],options:o=``,planName:c=`Plan Name`,showOptions:u=!0,showPricing:f=!0,showSecondaryCta:m=!0,style:g=`default`,app:y=`acrobat-pro`,planLabel:b=``,price:x=``,comparePrice:S=``,priceNote:C=``,priceTerms:w=``,optionLabel:T=``,optionPromo:E=``,featuresTitle:D=``,primaryCtaLabel:O=``,secondaryCtaLabel:k=``,trustLabel:A=``,onPrimaryCta:j=``,onSecondaryCta:M=``}={})=>t`
      <article
        class="c-merch-card"
        data-features-list=${r}
        data-style=${g}
      >
      <div class="c-merch-card__body">
        <div class="c-merch-card__content">
          <div class="c-merch-card__header">
            <div class="c-merch-card__header">
              <div class="c-merch-card__product-lockup">${_({showSecondAppIcon:!1,showAppIcon:!0,showIconEnd:!1,label:`Standard PDF toolset`,orientation:`horizontal`,style:`label`,width:`hug`})}</div>
            </div>
          </div>
          <div class="c-merch-card__plan-header">
            <div class="c-merch-card__name-area">
              <span class="c-merch-card__plan-name">${c||`Plan Name`}</span>
              <span class="c-merch-card__description">${e||`Plan description goes here.`}</span>
            </div>
            <div class="c-merch-card__merch-card-pricing-display">${d({showDetails:!0,additionalDetails:`Offer terms apply`,strikethroughPricing:`US$599.88/yr`,showStrikethrough:!0,billingCadence:`Billed monthly, cancel anytime`,price:`US$49.99/mo`})}</div>
          </div>
          <div class="c-merch-card__options">
            <div class="c-merch-card__merch-card-select-promo">${p({state:`collapsed`})}</div>
          </div>
        </div>
        <div class="c-merch-card__cta">
          <div class="c-merch-card__actions">
            <div class="c-merch-card__button">${a({label:`Get free app`,showIconEnd:!1,showIconStart:!1,style:`accent`,state:`default`})}</div>
            <div class="c-merch-card__button-2">${a({label:`Label`,showIconEnd:!1,showIconStart:!1,style:`outlined`,state:`default`})}</div>
          </div>
          <div class="c-merch-card__merch-card-trust-badge">${h({label:`Secure transaction`})}</div>
        </div>
      </div>
      ${(e=>e===n?n:t`<div class="c-merch-card__features">${e}</div>`)(v(i)?i:r===`closed`?s({open:!1,size:`default`,style:`default`,content:l({})}):l({}))}
      </article>
`})))()}var x,S,C,w,T,E,D,O,k,A,j,M,N,P,F,I;function L(){return(L=e((()=>{r(),b(),x={title:`Generated/MerchCard`,component:`MerchCard`,render:e=>y(e),argTypes:{featuresList:{control:`select`,options:[`default`,`closed`]},style:{control:`select`,options:[`default`,`highlight`]}}},S={name:`Default`,args:{},parameters:{figma:{fileKey:`qAF4nlt6O4ThbeXeO7jzdb`,nodeId:`10826:13313`}}},C={cols:[`default`],rows:[`default / default`,`default / highlight`,`closed / default`,`closed / highlight`],cell:{w:498,h:682,pad:12}},w={name:`State matrix`,parameters:{figma:{fileKey:`qAF4nlt6O4ThbeXeO7jzdb`,sheet:!0,slug:`merch-card`,selector:`.s2a-matrix`},controls:{disable:!0}},render:()=>t`
    <div class="s2a-matrix-wrap">
      <div class="s2a-matrix-corner"></div>
      <div class="s2a-matrix-cols">
        ${C.cols.map(e=>t`<div class="s2a-matrix-col">${e}</div>`)}
      </div>
      <div class="s2a-matrix-rows">
        ${C.rows.map(e=>t`<div class="s2a-matrix-row">${e}</div>`)}
      </div>
      <div class="s2a-matrix">
        <div class="s2a-matrix__cell">${y({featuresList:`default`,style:`default`})}</div>
        <div class="s2a-matrix__cell">${y({featuresList:`default`,style:`highlight`})}</div>
        <div class="s2a-matrix__cell">${y({featuresList:`closed`,style:`default`})}</div>
        <div class="s2a-matrix__cell">${y({featuresList:`closed`,style:`highlight`})}</div>
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
      .s2a-matrix-cols { display: grid; grid-template-columns: repeat(${C.cols.length}, ${C.cell.w}px); }
      .s2a-matrix-rows { display: grid; grid-auto-rows: ${C.cell.h}px; }
      .s2a-matrix-col { text-align: center; }
      .s2a-matrix-row { display: grid; align-items: center; justify-content: end; white-space: nowrap; padding-right: var(--s2a-spacing-2xs); }
      /* Measured against the sheet: cells only, exact cell size, no gap. */
      .s2a-matrix {
        display: grid;
        grid-template-columns: repeat(${C.cols.length}, ${C.cell.w}px);
        grid-auto-rows: ${C.cell.h}px;
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
      .s2a-matrix__cell { display: grid; place-items: center; padding: ${C.cell.pad}px; box-sizing: border-box; }
    </style>
  `},T={name:`With content`,args:{features:t`<p style="margin:0">Content placed in the features slot.</p>`,options:t`<p style="margin:0">Content placed in the options slot.</p>`}},E={name:`featuresList: default`,args:{featuresList:`default`},parameters:{figma:{fileKey:`qAF4nlt6O4ThbeXeO7jzdb`,nodeId:`10826:13313`}}},D={name:`featuresList: closed`,args:{featuresList:`closed`},parameters:{figma:{fileKey:`qAF4nlt6O4ThbeXeO7jzdb`,nodeId:`10826:13313`}}},O={name:`showOptions on`,args:{showOptions:!0},parameters:{figma:{fileKey:`qAF4nlt6O4ThbeXeO7jzdb`,nodeId:`10826:13313`}}},k={name:`showOptions off`,args:{showOptions:!1},parameters:{figma:{fileKey:`qAF4nlt6O4ThbeXeO7jzdb`,nodeId:`10826:13313`}}},A={name:`showPricing on`,args:{showPricing:!0},parameters:{figma:{fileKey:`qAF4nlt6O4ThbeXeO7jzdb`,nodeId:`10826:13313`}}},j={name:`showPricing off`,args:{showPricing:!1},parameters:{figma:{fileKey:`qAF4nlt6O4ThbeXeO7jzdb`,nodeId:`10826:13313`}}},M={name:`showSecondaryCta on`,args:{showSecondaryCta:!0},parameters:{figma:{fileKey:`qAF4nlt6O4ThbeXeO7jzdb`,nodeId:`10826:13313`}}},N={name:`showSecondaryCta off`,args:{showSecondaryCta:!1},parameters:{figma:{fileKey:`qAF4nlt6O4ThbeXeO7jzdb`,nodeId:`10826:13313`}}},P={name:`style: default`,args:{style:`default`},parameters:{figma:{fileKey:`qAF4nlt6O4ThbeXeO7jzdb`,nodeId:`10826:13313`}}},F={name:`style: highlight`,args:{style:`highlight`},parameters:{figma:{fileKey:`qAF4nlt6O4ThbeXeO7jzdb`,nodeId:`10826:13343`}}},S.parameters={...S.parameters,docs:{...S.parameters?.docs,source:{originalSource:`{
  name: "Default",
  args: {},
  parameters: {
    figma: {
      fileKey: "qAF4nlt6O4ThbeXeO7jzdb",
      nodeId: "10826:13313"
    }
  }
}`,...S.parameters?.docs?.source}}},w.parameters={...w.parameters,docs:{...w.parameters?.docs,source:{originalSource:`{
  name: 'State matrix',
  parameters: {
    // \`sheet\` points the overlay at the composited golden for the whole set
    // rather than one variant's artwork.
    figma: {
      fileKey: "qAF4nlt6O4ThbeXeO7jzdb",
      sheet: true,
      slug: "merch-card",
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
        <div class="s2a-matrix__cell">\${MerchCard({
    "featuresList": "default",
    "style": "default"
  })}</div>
        <div class="s2a-matrix__cell">\${MerchCard({
    "featuresList": "default",
    "style": "highlight"
  })}</div>
        <div class="s2a-matrix__cell">\${MerchCard({
    "featuresList": "closed",
    "style": "default"
  })}</div>
        <div class="s2a-matrix__cell">\${MerchCard({
    "featuresList": "closed",
    "style": "highlight"
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
}`,...w.parameters?.docs?.source},description:{story:`Every variant at once. Turn on the Design overlay to wipe this whole grid
against the Figma set in a single comparison.`,...w.parameters?.docs?.description}}},T.parameters={...T.parameters,docs:{...T.parameters?.docs,source:{originalSource:`{
  name: "With content",
  args: {
    features: html\`<p style="margin:0">Content placed in the features slot.</p>\`,
    options: html\`<p style="margin:0">Content placed in the options slot.</p>\`
  }
}`,...T.parameters?.docs?.source}}},E.parameters={...E.parameters,docs:{...E.parameters?.docs,source:{originalSource:`{
  name: "featuresList: default",
  args: {
    "featuresList": "default"
  },
  parameters: {
    figma: {
      fileKey: "qAF4nlt6O4ThbeXeO7jzdb",
      nodeId: "10826:13313"
    }
  }
}`,...E.parameters?.docs?.source}}},D.parameters={...D.parameters,docs:{...D.parameters?.docs,source:{originalSource:`{
  name: "featuresList: closed",
  args: {
    "featuresList": "closed"
  },
  parameters: {
    figma: {
      fileKey: "qAF4nlt6O4ThbeXeO7jzdb",
      nodeId: "10826:13313"
    }
  }
}`,...D.parameters?.docs?.source}}},O.parameters={...O.parameters,docs:{...O.parameters?.docs,source:{originalSource:`{
  name: "showOptions on",
  args: {
    "showOptions": true
  },
  parameters: {
    figma: {
      fileKey: "qAF4nlt6O4ThbeXeO7jzdb",
      nodeId: "10826:13313"
    }
  }
}`,...O.parameters?.docs?.source}}},k.parameters={...k.parameters,docs:{...k.parameters?.docs,source:{originalSource:`{
  name: "showOptions off",
  args: {
    "showOptions": false
  },
  parameters: {
    figma: {
      fileKey: "qAF4nlt6O4ThbeXeO7jzdb",
      nodeId: "10826:13313"
    }
  }
}`,...k.parameters?.docs?.source}}},A.parameters={...A.parameters,docs:{...A.parameters?.docs,source:{originalSource:`{
  name: "showPricing on",
  args: {
    "showPricing": true
  },
  parameters: {
    figma: {
      fileKey: "qAF4nlt6O4ThbeXeO7jzdb",
      nodeId: "10826:13313"
    }
  }
}`,...A.parameters?.docs?.source}}},j.parameters={...j.parameters,docs:{...j.parameters?.docs,source:{originalSource:`{
  name: "showPricing off",
  args: {
    "showPricing": false
  },
  parameters: {
    figma: {
      fileKey: "qAF4nlt6O4ThbeXeO7jzdb",
      nodeId: "10826:13313"
    }
  }
}`,...j.parameters?.docs?.source}}},M.parameters={...M.parameters,docs:{...M.parameters?.docs,source:{originalSource:`{
  name: "showSecondaryCta on",
  args: {
    "showSecondaryCta": true
  },
  parameters: {
    figma: {
      fileKey: "qAF4nlt6O4ThbeXeO7jzdb",
      nodeId: "10826:13313"
    }
  }
}`,...M.parameters?.docs?.source}}},N.parameters={...N.parameters,docs:{...N.parameters?.docs,source:{originalSource:`{
  name: "showSecondaryCta off",
  args: {
    "showSecondaryCta": false
  },
  parameters: {
    figma: {
      fileKey: "qAF4nlt6O4ThbeXeO7jzdb",
      nodeId: "10826:13313"
    }
  }
}`,...N.parameters?.docs?.source}}},P.parameters={...P.parameters,docs:{...P.parameters?.docs,source:{originalSource:`{
  name: "style: default",
  args: {
    "style": "default"
  },
  parameters: {
    figma: {
      fileKey: "qAF4nlt6O4ThbeXeO7jzdb",
      nodeId: "10826:13313"
    }
  }
}`,...P.parameters?.docs?.source}}},F.parameters={...F.parameters,docs:{...F.parameters?.docs,source:{originalSource:`{
  name: "style: highlight",
  args: {
    "style": "highlight"
  },
  parameters: {
    figma: {
      fileKey: "qAF4nlt6O4ThbeXeO7jzdb",
      nodeId: "10826:13343"
    }
  }
}`,...F.parameters?.docs?.source}}},I=[`Default`,`StateMatrix`,`WithContent`,`FeatureslistDefault`,`FeatureslistClosed`,`ShowoptionsOn`,`ShowoptionsOff`,`ShowpricingOn`,`ShowpricingOff`,`ShowsecondaryctaOn`,`ShowsecondaryctaOff`,`StyleDefault`,`StyleHighlight`]})))()}L();export{S as Default,D as FeatureslistClosed,E as FeatureslistDefault,k as ShowoptionsOff,O as ShowoptionsOn,j as ShowpricingOff,A as ShowpricingOn,N as ShowsecondaryctaOff,M as ShowsecondaryctaOn,w as StateMatrix,P as StyleDefault,F as StyleHighlight,T as WithContent,I as __namedExportsOrder,x as default};