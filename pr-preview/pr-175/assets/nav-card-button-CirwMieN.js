import{n as e}from"./rolldown-runtime-DkW27tQK.js";import{i as t,s as n,t as r}from"./lit-UMo5x0iS.js";var i,a;function o(){return(o=e((()=>{r(),i=new Set([`default`,`hover`,`active`,`focus`,`disabled`]),a=({label:e=`Explore`,href:r=``,state:a=`default`,onClick:o}={})=>{let s=i.has(a)?a:`default`,c=s==="default"?null:s,l=s===`disabled`,u=!!r&&!l,d={class:`c-nav-card-button__button`,"data-force-state":c??t,"data-variant":`outlined`,"data-context":`on-light`};return u?n`
      <div class="c-nav-card-button">
        <a
          class=${d.class}
          data-force-state=${d[`data-force-state`]}
          data-variant="outlined"
          data-context="on-light"
          href=${r}
          @click=${o}
        >
          <span class="c-nav-card-button__label">${e}</span>
        </a>
      </div>
    `:n`
    <div class="c-nav-card-button">
      <button
        class=${d.class}
        data-force-state=${d[`data-force-state`]}
        data-variant="outlined"
        data-context="on-light"
        type="button"
        ?disabled=${l}
        @click=${o}
      >
        <span class="c-nav-card-button__label">${e}</span>
      </button>
    </div>
  `}})))()}export{o as n,a as t};