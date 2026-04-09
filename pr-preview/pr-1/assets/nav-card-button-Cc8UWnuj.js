import{E as i,x as d}from"./iframe-CygNGfig.js";const u=new Set(["default","hover","active","focus","disabled"]),v=({label:s="Explore",href:n="",state:c="default",onClick:o}={})=>{const a=u.has(c)?c:"default",l=a!=="default"?a:null,e=a==="disabled",r=!!n&&!e,t={class:"c-nav-card-button__button","data-force-state":l??i};return r?d`
      <div class="c-nav-card-button">
        <a
          class=${t.class}
          data-force-state=${t["data-force-state"]}
          data-variant="outlined"
          data-context="on-light"
          href=${n}
          @click=${o}
        >
          <span class="c-nav-card-button__label">${s}</span>
        </a>
      </div>
    `:d`
    <div class="c-nav-card-button">
      <button
        class=${t.class}
        data-force-state=${t["data-force-state"]}
        data-variant="outlined"
        data-context="on-light"
        type="button"
        ?disabled=${e}
        @click=${o}
      >
        <span class="c-nav-card-button__label">${s}</span>
      </button>
    </div>
  `};export{v as N};
