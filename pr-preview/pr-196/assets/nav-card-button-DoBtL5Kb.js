import{n as e}from"./rolldown-runtime-sJBDdmOt.js";import{i as t,s as n,u as r}from"./iframe-BgLmQkiJ.js";var i,a;function o(){return(o=e((()=>{t(),i=new Set([`default`,`hover`,`active`,`focus`,`disabled`]),a=({label:e=`Explore`,href:t=``,state:a=`default`,onClick:o}={})=>{let s=i.has(a)?a:`default`,c=s==="default"?null:s,l=s===`disabled`,u=!!t&&!l,d={class:`c-nav-card-button__button`,"data-force-state":c??n,"data-variant":`outlined`,"data-context":`on-light`};return u?r`
      <div class="c-nav-card-button">
        <a
          class=${d.class}
          data-force-state=${d[`data-force-state`]}
          data-variant="outlined"
          data-context="on-light"
          href=${t}
          @click=${o}
        >
          <span class="c-nav-card-button__label">${e}</span>
        </a>
      </div>
    `:r`
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