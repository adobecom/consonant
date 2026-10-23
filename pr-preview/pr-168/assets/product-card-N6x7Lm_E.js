import{n as e}from"./rolldown-runtime-C0FnF6B9.js";import{c as t,d as n,i as r,l as i,s as a,t as o}from"./lit-DRzJKe3d.js";import{a as s,r as c}from"./app-icon-JdLRqGJJ.js";var l,u,d,f,p,m;function h(){return(h=e((()=>{i(),l=Symbol.for(``),u=e=>{if(e?.r===l)return e?._$litStatic$},d=(e,...t)=>({_$litStatic$:t.reduce((t,n,r)=>t+(e=>{if(e._$litStatic$!==void 0)return e._$litStatic$;throw Error(`Value passed to 'literal' function must be a 'literal' result: ${e}. Use 'unsafeStatic' to pass non-literal values, but\n            take care to ensure page security.`)})(n)+e[r+1],e[0]),r:l}),f=new Map,p=e=>(t,...n)=>{let r=n.length,i,a,o=[],s=[],c,l=0,d=!1;for(;l<r;){for(c=t[l];l<r&&(a=n[l],(i=u(a))!==void 0);)c+=i+t[++l],d=!0;l!==r&&s.push(a),o.push(c),l++}if(l===r&&o.push(t[r]),d){let e=o.join(`$$lit$$`);(t=f.get(e))===void 0&&(o.raw=o,f.set(e,t=o)),n=s}return e(t,...n)},m=p(t),p(n),p(a)})))()}function g(){return(g=e((()=>{h()})))()}var _;function v(){return(v=e((()=>{o(),g(),s(),_=({app:e=`creative-cloud`,showIcon:t=!0,imageSrc:n,imageAlt:i=``,heading:a=``,body:o=``,href:s,onClick:l}={})=>{let u=!!n,f=s?d`a`:d`div`;return m`
    <${f}
      class="c-product-card"
      href=${s||r}
      aria-label=${s?a:r}
      data-has-image=${u||r}
      role=${!s&&l?`button`:r}
      tabindex=${!s&&l?`0`:r}
      @click=${l??r}
      @keydown=${!s&&l?e=>{(e.key===`Enter`||e.key===` `)&&(e.preventDefault(),l(e))}:r}
    >
      ${u?m`<img class="c-product-card__image" src=${n} alt=${i} loading="lazy" decoding="async" />`:r}
      ${u?m`<span class="c-product-card__scrim" aria-hidden="true"></span>`:r}
      ${t?m`<span class="c-product-card__icon" aria-hidden="true">${c({app:e,size:`18`})}</span>`:r}
      <div class="c-product-card__text">
        ${a?m`<h3 class="c-product-card__heading">${a}</h3>`:r}
        ${o?m`<p class="c-product-card__body">${o}</p>`:r}
      </div>
    </${f}>
  `}})))()}export{v as n,_ as t};