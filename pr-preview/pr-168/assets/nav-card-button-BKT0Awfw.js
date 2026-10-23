import{n as e}from"./rolldown-runtime-C0FnF6B9.js";import{c as t,i as n,t as r}from"./lit-DRzJKe3d.js";var i,a;function o(){return(o=e((()=>{r(),i=new Set([`default`,`hover`,`active`,`focus`,`disabled`]),a=({label:e=`Explore`,href:r=``,state:a=`default`,onClick:o}={})=>{let s=i.has(a)?a:`default`,c=s==="default"?null:s,l=s===`disabled`,u=!!r&&!l,d={class:`c-nav-card-button__button`,"data-force-state":c??n,"data-variant":`outlined`,"data-context":`on-light`};return u?t`
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
    `:t`
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