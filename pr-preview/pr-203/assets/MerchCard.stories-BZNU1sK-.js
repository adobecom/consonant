import{n as e}from"./rolldown-runtime-DkW27tQK.js";import{i as t,s as n,t as r}from"./lit-UMo5x0iS.js";import{i,r as a}from"./app-icon-kJOUm1g_.js";var o,s,c;function l(){return(l=e((()=>{r(),i(),o=n`
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
    <path
      d="M14.5 8.5V6a4.5 4.5 0 1 0-9 0v2.5H4.25A1.25 1.25 0 0 0 3 9.75v6.5a1.25 1.25 0 0 0 1.25 1.25h11.5A1.25 1.25 0 0 0 17 16.25v-6.5a1.25 1.25 0 0 0-1.25-1.25H14.5Zm-7.25-2.5a2.75 2.75 0 1 1 5.5 0v2.5h-5.5V6Z"
      fill="currentColor"
    />
  </svg>
`,s=n`
  <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
    <path d="M2.5 4.25 6 7.75l3.5-3.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
  </svg>
`,c=({style:e=`default`,featuresList:r=`default`,planName:i=`Plan Name`,description:c=`Plan description goes here.`,app:l=`acrobat-pro`,planLabel:u=``,price:d=``,comparePrice:f=``,priceNote:p=``,priceTerms:m=``,showPricing:h=!0,showOptions:g=!0,options:_=null,optionLabel:v=``,optionPromo:y=``,features:b=[],featuresTitle:x=``,primaryCtaLabel:S=``,secondaryCtaLabel:C=``,trustLabel:w=``,onPrimaryCta:T,onSecondaryCta:E}={})=>{let D=v||y?n`
          <button type="button" class="c-merch-card__option">
            <span class="c-merch-card__option-text">
              ${v?n`<span class="c-merch-card__option-label">${v}</span>`:t}
              ${y?n`<span class="c-merch-card__option-promo">${y}</span>`:t}
            </span>
            <span class="c-merch-card__option-chevron">${s}</span>
          </button>
        `:t;return n`
    <article class="c-merch-card" data-style=${e} data-features-list=${r}>
      <div class="c-merch-card__body">
        <div class="c-merch-card__content">
          ${u?n`
                <div class="c-merch-card__header">
                  <span class="c-merch-card__lockup-icon" aria-hidden="true">${a({app:l,size:`sm`})}</span>
                  <span class="c-merch-card__lockup-label">${u}</span>
                </div>
              `:t}
          <div class="c-merch-card__plan-header">
            <div class="c-merch-card__name-area">
              <h3 class="c-merch-card__plan-name">${i}</h3>
              ${c?n`<p class="c-merch-card__description">${c}</p>`:t}
            </div>
            ${h&&(d||f)?n`
                  <div class="c-merch-card__pricing">
                    ${f?n`<p class="c-merch-card__compare-price">${f}</p>`:t}
                    ${d?n`<p class="c-merch-card__price">${d}</p>`:t}
                    ${p?n`<p class="c-merch-card__price-note">${p}</p>`:t}
                    ${m?n`<p class="c-merch-card__price-terms">${m}</p>`:t}
                  </div>
                `:t}
          </div>
          ${g?n`<div class="c-merch-card__options">${_??D}</div>`:t}
        </div>
        <div class="c-merch-card__cta">
          <div class="c-merch-card__actions">
            ${S?n`
                  <button type="button" class="c-merch-card__button c-merch-card__button--accent" @click=${T??t}>
                    ${S}
                  </button>
                `:t}
            ${C?n`
                  <button type="button" class="c-merch-card__button c-merch-card__button--outlined" @click=${E??t}>
                    ${C}
                  </button>
                `:t}
          </div>
          ${w?n`
                <p class="c-merch-card__trust">
                  <span class="c-merch-card__trust-icon">${o}</span>
                  ${w}
                </p>
              `:t}
        </div>
      </div>
      <div class="c-merch-card__features">
        ${r!==`closed`&&(x||b.length)?n`
              <div class="c-merch-card__features-content">
                ${x?n`<p class="c-merch-card__features-title">${x}</p>`:t}
                ${b.length?n`
                      <ul class="c-merch-card__features-list">
                        ${b.map(e=>n`<li class="c-merch-card__feature">${e}</li>`)}
                      </ul>
                    `:t}
              </div>
            `:t}
      </div>
    </article>
  `}})))()}function u(){return(u=e((()=>{l()})))()}var d,f,p,m,h,g,_,v,y;function b(){return(b=e((()=>{r(),u(),d={title:`Cards/MerchCard`,tags:[`autodocs`],render:e=>c(e),parameters:{layout:`centered`,docs:{description:{component:'\nA merchandising card for a product plan — plan name, pricing, a feature list, and CTAs —\nused in pricing tables and plan comparisons. Matches the Figma component set\n**MerchCard — v1** (node `10826:13312`).\n\nTwo style variants: `default` and `highlight`. Highlight is the featured / recommended\nplan — its outer surface flips to `surface/inverse-subtle` while the card body\nintentionally stays a light surface in both themes (a definition-level pin in Figma).\nDon\'t signal "recommended" with the highlight surface alone — pair it with a text label.\n\n`Features List: closed` collapses the feature apron below the body.\nOptional regions (`showPricing`, `showOptions`, secondary CTA) toggle independently.\n        '}}},argTypes:{style:{control:{type:`inline-radio`},options:[`default`,`highlight`],description:`highlight = featured / recommended plan`},featuresList:{control:{type:`inline-radio`},options:[`default`,`closed`],description:`closed collapses the feature list apron`},planName:{control:`text`},description:{control:`text`},planLabel:{control:`text`},app:{control:`text`},price:{control:`text`},comparePrice:{control:`text`},priceNote:{control:`text`},priceTerms:{control:`text`},showPricing:{control:`boolean`},showOptions:{control:`boolean`},optionLabel:{control:`text`},optionPromo:{control:`text`},featuresTitle:{control:`text`},features:{control:`object`},primaryCtaLabel:{control:`text`},secondaryCtaLabel:{control:`text`},trustLabel:{control:`text`}},args:{style:`default`,featuresList:`default`,planName:`Acrobat Standard`,description:`Simple PDF tools to edit, convert, and e-sign.`,planLabel:`Standard PDF toolset`,app:`acrobat-pro`,comparePrice:`US$599.88/yr`,price:`US$49.99/mo`,priceNote:`Billed monthly, cancel anytime`,priceTerms:`Offer terms apply`,showPricing:!0,showOptions:!0,optionLabel:`1 License`,optionPromo:`Save 7.5% your first year with 3+ licenses. See terms`,featuresTitle:`Section title`,features:[`Feature item 1`,`Feature item 2`,`Feature item 3`,`Feature item 4`],primaryCtaLabel:`Get free app`,secondaryCtaLabel:`Learn more`,trustLabel:`Secure transaction`}},f={},p={args:{style:`highlight`}},m={args:{featuresList:`closed`}},h={args:{style:`highlight`,featuresList:`closed`}},g={args:{showPricing:!1,showOptions:!1,secondaryCtaLabel:``,trustLabel:``,featuresList:`closed`}},_={render:e=>n`
    <div style="padding: 48px; background: #131313; border-radius: 8px; display: flex; gap: 24px;">
      ${c(e)} ${c({...e,style:`highlight`})}
    </div>
  `,parameters:{backgrounds:{disable:!0}}},v={render:e=>n`
    <div style="display: flex; gap: 16px; align-items: flex-start;">
      ${c({...e,planName:`Acrobat Standard`,price:`US$22.99/mo`})}
      ${c({...e,style:`highlight`,planName:`Acrobat Pro`,price:`US$29.99/mo`,description:`The all-in-one PDF and e-signature solution, plus advanced tools and AI Assistant.`})}
    </div>
  `},f.parameters={...f.parameters,docs:{...f.parameters?.docs,source:{originalSource:`{}`,...f.parameters?.docs?.source}}},p.parameters={...p.parameters,docs:{...p.parameters?.docs,source:{originalSource:`{
  args: {
    style: "highlight"
  }
}`,...p.parameters?.docs?.source}}},m.parameters={...m.parameters,docs:{...m.parameters?.docs,source:{originalSource:`{
  args: {
    featuresList: "closed"
  }
}`,...m.parameters?.docs?.source}}},h.parameters={...h.parameters,docs:{...h.parameters?.docs,source:{originalSource:`{
  args: {
    style: "highlight",
    featuresList: "closed"
  }
}`,...h.parameters?.docs?.source}}},g.parameters={...g.parameters,docs:{...g.parameters?.docs,source:{originalSource:`{
  args: {
    showPricing: false,
    showOptions: false,
    secondaryCtaLabel: "",
    trustLabel: "",
    featuresList: "closed"
  }
}`,...g.parameters?.docs?.source}}},_.parameters={..._.parameters,docs:{..._.parameters?.docs,source:{originalSource:`{
  render: args => html\`
    <div style="padding: 48px; background: #131313; border-radius: 8px; display: flex; gap: 24px;">
      \${MerchCard(args)} \${MerchCard({
    ...args,
    style: "highlight"
  })}
    </div>
  \`,
  parameters: {
    backgrounds: {
      disable: true
    }
  }
}`,..._.parameters?.docs?.source},description:{story:`The highlight body is definition-pinned Light in Figma — on a dark page
surface the outer card flips but the body stays a light surface.`,..._.parameters?.docs?.description}}},v.parameters={...v.parameters,docs:{...v.parameters?.docs,source:{originalSource:`{
  render: args => html\`
    <div style="display: flex; gap: 16px; align-items: flex-start;">
      \${MerchCard({
    ...args,
    planName: "Acrobat Standard",
    price: "US$22.99/mo"
  })}
      \${MerchCard({
    ...args,
    style: "highlight",
    planName: "Acrobat Pro",
    price: "US$29.99/mo",
    description: "The all-in-one PDF and e-signature solution, plus advanced tools and AI Assistant."
  })}
    </div>
  \`
}`,...v.parameters?.docs?.source}}},y=[`Default`,`Highlight`,`FeaturesClosed`,`HighlightFeaturesClosed`,`MinimalNoOptionalRegions`,`OnDarkSurface`,`PlanComparisonRow`]})))()}b();export{f as Default,m as FeaturesClosed,p as Highlight,h as HighlightFeaturesClosed,g as MinimalNoOptionalRegions,_ as OnDarkSurface,v as PlanComparisonRow,y as __namedExportsOrder,d as default};