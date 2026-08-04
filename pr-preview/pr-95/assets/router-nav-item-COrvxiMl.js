import{x as n}from"./iframe-tjgwNcj5.js";import{P as s}from"./product-lockup-BUZbXMCK.js";const d=({label:o="Product",app:a="experience-cloud",orientation:r="block",state:i="default",onClick:c}={})=>{const e=i==="active",t=r==="block";return n`
    <button
      class="c-router-nav-item"
      data-orientation=${t?"block":"inline"}
      data-state=${e?"active":"default"}
      type="button"
      aria-pressed=${e?"true":"false"}
      @click=${c}
    >
      ${s({label:o,app:a,orientation:t?"vertical":"horizontal",context:"on-dark",width:"fill",iconSize:t?"md":"sm"})}
      <span class="c-router-nav-item__progress" aria-hidden="true">
        <span class="c-router-nav-item__progress-fill"></span>
      </span>
    </button>
  `};export{d as R};
