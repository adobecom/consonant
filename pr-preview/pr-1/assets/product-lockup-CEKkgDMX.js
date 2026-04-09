import{x as n,E as i}from"./iframe-CV0psIaR.js";import{A as b}from"./app-icon-CNUsW4ZO.js";const v=()=>n`
  <svg
    width="6"
    height="6"
    viewBox="0 0 6 6"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
  >
    <path
      d="M2 1 4.25 3 2 5"
      stroke="currentColor"
      stroke-width="1.25"
      stroke-linecap="round"
      stroke-linejoin="round"
    />
  </svg>
`,y=new Set(["xs","sm","md","lg"]),_=o=>o==="vertical"?"vertical":"horizontal",C=o=>o==="eyebrow"?"eyebrow":"label",I=o=>o==="on-dark"?"on-dark":"on-light",O=o=>o==="fill"?"fill":"hug",P=(o,e)=>o&&o!=="auto"&&y.has(o)?o:"md",L=({label:o="Product label",productName:e,app:c="experience-cloud",orientation:d="horizontal",styleVariant:p="label",context:u="on-light",width:h="hug",showIconStart:m=!0,showIcon:r,showIconEnd:z=!0,iconSize:w="auto",caret:t=v}={})=>{const a=_(d),f=C(p),k=I(u),$=O(h),l=typeof r=="boolean"?r:m,g=P(w,a),s=a==="horizontal"&&z,S=e??o,x=s&&t!==null?n`<span class="c-product-lockup__caret" aria-hidden="true">
          ${typeof t=="function"?t():t}
        </span>`:i;return n`
    <span
      class="c-product-lockup"
      data-orientation=${a}
      data-style=${f}
      data-context=${k}
      data-width=${$}
      data-has-icon-start=${l?"true":"false"}
      data-has-caret=${s?"true":"false"}
    >
      ${l?n`<span class="c-product-lockup__icon" aria-hidden="true">
            ${b({app:c,size:g})}
          </span>`:i}
      <span class="c-product-lockup__label">${S}</span>
      ${x}
    </span>
  `};export{L as P};
