import{x as c}from"./iframe-Jwfh8MPX.js";import{P as n}from"./product-lockup-BuXk4S6R.js";const p=({label:a="Product",app:o="experience-cloud",orientation:r="block",state:i="default",onClick:s}={})=>{const t=i==="active",e=r==="block";return c`
    <button
      class="c-router-nav-item"
      data-orientation=${e?"block":"inline"}
      data-state=${t?"active":"default"}
      type="button"
      aria-pressed=${t?"true":"false"}
      @click=${s}
    >
      ${n({label:a,app:o,orientation:e?"vertical":"horizontal",styleVariant:t?"label":"knockout",width:"fill",iconSize:"sm"})}
      <span class="c-router-nav-item__progress" aria-hidden="true">
        <span class="c-router-nav-item__progress-fill"></span>
      </span>
    </button>
  `};export{p as R};
