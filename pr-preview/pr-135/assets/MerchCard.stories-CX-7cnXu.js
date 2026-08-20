import{E as a,x as e}from"./iframe-Cu0bMW1j.js";import{A as D}from"./app-icon-CrocyBi9.js";import"./preload-helper-BZk2PG9u.js";const T=e`
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
    <path
      d="M14.5 8.5V6a4.5 4.5 0 1 0-9 0v2.5H4.25A1.25 1.25 0 0 0 3 9.75v6.5a1.25 1.25 0 0 0 1.25 1.25h11.5A1.25 1.25 0 0 0 17 16.25v-6.5a1.25 1.25 0 0 0-1.25-1.25H14.5Zm-7.25-2.5a2.75 2.75 0 1 1 5.5 0v2.5h-5.5V6Z"
      fill="currentColor"
    />
  </svg>
`,H=e`
  <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
    <path d="M2.5 4.25 6 7.75l3.5-3.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
  </svg>
`,s=({style:r="default",featuresList:f="default",planName:C="Plan Name",description:$="Plan description goes here.",app:L="acrobat-pro",planLabel:b="",price:p="",comparePrice:h="",priceNote:v="",priceTerms:y="",showPricing:k=!0,showOptions:A=!0,options:F=null,optionLabel:u="",optionPromo:m="",features:g=[],featuresTitle:_="",primaryCtaLabel:x="",secondaryCtaLabel:S="",trustLabel:w="",onPrimaryCta:P,onSecondaryCta:M}={})=>{const O=u||m?e`
          <button type="button" class="c-merch-card__option">
            <span class="c-merch-card__option-text">
              ${u?e`<span class="c-merch-card__option-label">${u}</span>`:a}
              ${m?e`<span class="c-merch-card__option-promo">${m}</span>`:a}
            </span>
            <span class="c-merch-card__option-chevron">${H}</span>
          </button>
        `:a;return e`
    <article class="c-merch-card" data-style=${r} data-features-list=${f}>
      <div class="c-merch-card__body">
        <div class="c-merch-card__content">
          ${b?e`
                <div class="c-merch-card__header">
                  <span class="c-merch-card__lockup-icon" aria-hidden="true">${D({app:L,size:"sm"})}</span>
                  <span class="c-merch-card__lockup-label">${b}</span>
                </div>
              `:a}
          <div class="c-merch-card__plan-header">
            <div class="c-merch-card__name-area">
              <h3 class="c-merch-card__plan-name">${C}</h3>
              ${$?e`<p class="c-merch-card__description">${$}</p>`:a}
            </div>
            ${k&&(p||h)?e`
                  <div class="c-merch-card__pricing">
                    ${h?e`<p class="c-merch-card__compare-price">${h}</p>`:a}
                    ${p?e`<p class="c-merch-card__price">${p}</p>`:a}
                    ${v?e`<p class="c-merch-card__price-note">${v}</p>`:a}
                    ${y?e`<p class="c-merch-card__price-terms">${y}</p>`:a}
                  </div>
                `:a}
          </div>
          ${A?e`<div class="c-merch-card__options">${F??O}</div>`:a}
        </div>
        <div class="c-merch-card__cta">
          <div class="c-merch-card__actions">
            ${x?e`
                  <button type="button" class="c-merch-card__button c-merch-card__button--accent" @click=${P??a}>
                    ${x}
                  </button>
                `:a}
            ${S?e`
                  <button type="button" class="c-merch-card__button c-merch-card__button--outlined" @click=${M??a}>
                    ${S}
                  </button>
                `:a}
          </div>
          ${w?e`
                <p class="c-merch-card__trust">
                  <span class="c-merch-card__trust-icon">${T}</span>
                  ${w}
                </p>
              `:a}
        </div>
      </div>
      <div class="c-merch-card__features">
        ${f!=="closed"&&(_||g.length)?e`
              <div class="c-merch-card__features-content">
                ${_?e`<p class="c-merch-card__features-title">${_}</p>`:a}
                ${g.length?e`
                      <ul class="c-merch-card__features-list">
                        ${g.map(N=>e`<li class="c-merch-card__feature">${N}</li>`)}
                      </ul>
                    `:a}
              </div>
            `:a}
      </div>
    </article>
  `},B={title:"Cards/MerchCard",tags:["autodocs"],render:r=>s(r),parameters:{layout:"centered",docs:{description:{component:'\nA merchandising card for a product plan — plan name, pricing, a feature list, and CTAs —\nused in pricing tables and plan comparisons. Matches the Figma component set\n**MerchCard — v1** (node `10826:13312`).\n\nTwo style variants: `default` and `highlight`. Highlight is the featured / recommended\nplan — its outer surface flips to `surface/inverse-subtle` while the card body\nintentionally stays a light surface in both themes (a definition-level pin in Figma).\nDon\'t signal "recommended" with the highlight surface alone — pair it with a text label.\n\n`Features List: closed` collapses the feature apron below the body.\nOptional regions (`showPricing`, `showOptions`, secondary CTA) toggle independently.\n        '}}},argTypes:{style:{control:{type:"inline-radio"},options:["default","highlight"],description:"highlight = featured / recommended plan"},featuresList:{control:{type:"inline-radio"},options:["default","closed"],description:"closed collapses the feature list apron"},planName:{control:"text"},description:{control:"text"},planLabel:{control:"text"},app:{control:"text"},price:{control:"text"},comparePrice:{control:"text"},priceNote:{control:"text"},priceTerms:{control:"text"},showPricing:{control:"boolean"},showOptions:{control:"boolean"},optionLabel:{control:"text"},optionPromo:{control:"text"},featuresTitle:{control:"text"},features:{control:"object"},primaryCtaLabel:{control:"text"},secondaryCtaLabel:{control:"text"},trustLabel:{control:"text"}},args:{style:"default",featuresList:"default",planName:"Acrobat Standard",description:"Simple PDF tools to edit, convert, and e-sign.",planLabel:"Standard PDF toolset",app:"acrobat-pro",comparePrice:"US$599.88/yr",price:"US$49.99/mo",priceNote:"Billed monthly, cancel anytime",priceTerms:"Offer terms apply",showPricing:!0,showOptions:!0,optionLabel:"1 License",optionPromo:"Save 7.5% your first year with 3+ licenses. See terms",featuresTitle:"Section title",features:["Feature item 1","Feature item 2","Feature item 3","Feature item 4"],primaryCtaLabel:"Get free app",secondaryCtaLabel:"Learn more",trustLabel:"Secure transaction"}},c={},o={args:{style:"highlight"}},n={args:{featuresList:"closed"}},i={args:{style:"highlight",featuresList:"closed"}},l={args:{showPricing:!1,showOptions:!1,secondaryCtaLabel:"",trustLabel:"",featuresList:"closed"}},t={render:r=>e`
    <div style="padding: 48px; background: #131313; border-radius: 8px; display: flex; gap: 24px;">
      ${s(r)} ${s({...r,style:"highlight"})}
    </div>
  `,parameters:{backgrounds:{disable:!0}}},d={render:r=>e`
    <div style="display: flex; gap: 16px; align-items: flex-start;">
      ${s({...r,planName:"Acrobat Standard",price:"US$22.99/mo"})}
      ${s({...r,style:"highlight",planName:"Acrobat Pro",price:"US$29.99/mo",description:"The all-in-one PDF and e-signature solution, plus advanced tools and AI Assistant."})}
    </div>
  `};c.parameters={...c.parameters,docs:{...c.parameters?.docs,source:{originalSource:"{}",...c.parameters?.docs?.source}}};o.parameters={...o.parameters,docs:{...o.parameters?.docs,source:{originalSource:`{
  args: {
    style: "highlight"
  }
}`,...o.parameters?.docs?.source}}};n.parameters={...n.parameters,docs:{...n.parameters?.docs,source:{originalSource:`{
  args: {
    featuresList: "closed"
  }
}`,...n.parameters?.docs?.source}}};i.parameters={...i.parameters,docs:{...i.parameters?.docs,source:{originalSource:`{
  args: {
    style: "highlight",
    featuresList: "closed"
  }
}`,...i.parameters?.docs?.source}}};l.parameters={...l.parameters,docs:{...l.parameters?.docs,source:{originalSource:`{
  args: {
    showPricing: false,
    showOptions: false,
    secondaryCtaLabel: "",
    trustLabel: "",
    featuresList: "closed"
  }
}`,...l.parameters?.docs?.source}}};t.parameters={...t.parameters,docs:{...t.parameters?.docs,source:{originalSource:`{
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
}`,...t.parameters?.docs?.source},description:{story:`The highlight body is definition-pinned Light in Figma — on a dark page
surface the outer card flips but the body stays a light surface.`,...t.parameters?.docs?.description}}};d.parameters={...d.parameters,docs:{...d.parameters?.docs,source:{originalSource:`{
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
}`,...d.parameters?.docs?.source}}};const j=["Default","Highlight","FeaturesClosed","HighlightFeaturesClosed","MinimalNoOptionalRegions","OnDarkSurface","PlanComparisonRow"];export{c as Default,n as FeaturesClosed,o as Highlight,i as HighlightFeaturesClosed,l as MinimalNoOptionalRegions,t as OnDarkSurface,d as PlanComparisonRow,j as __namedExportsOrder,B as default};
