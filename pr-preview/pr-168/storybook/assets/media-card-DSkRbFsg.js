import{n as e}from"./rolldown-runtime-C0FnF6B9.js";import{c as t,i as n,t as r}from"./lit-DRzJKe3d.js";import{a as i,r as a}from"./app-icon-JdLRqGJJ.js";import{r as o}from"./unsafe-html-t7SGSaWI.js";import{t as s}from"./unsafe-html-BN0uzf8m.js";import{n as c,t as l}from"./arrow-right-DzMRham4.js";var u,d,f,p;function m(){return(m=e((()=>{r(),s(),i(),c(),u=new Set([`card`,`feature`]),d=(e,t,n)=>t.has(e)?e:n,f=()=>t`<span class="c-media-card__cta-arrow" aria-hidden="true">${o(l)}</span>`,p=({size:e=`card`,density:r=`comfortable`,app:i=`experience-cloud`,showIcon:o=!0,mediaSrc:s,mediaAlt:c=``,mediaTemplate:l,title:p=``,body:m=``,ctaLabel:h=``,ctaHref:g,onClick:_}={})=>{let v=d(e,u,`card`),y=l??(s?t`<img class="c-media-card__media-img" src=${s} alt=${c} loading="lazy" decoding="async" />`:t`<span class="c-media-card__media-placeholder" aria-hidden="true"></span>`),b=h?g?t`<a class="c-media-card__cta" href=${g}><span class="c-media-card__cta-label">${h}</span>${f()}</a>`:t`<button class="c-media-card__cta" type="button" @click=${_??n}><span class="c-media-card__cta-label">${h}</span>${f()}</button>`:n;return t`
    <div class="c-media-card" data-size=${v} data-density=${r===`compact`?`compact`:`comfortable`}>
      <div class="c-media-card__media">
        ${y}
        ${o?t`<span class="c-media-card__icon" aria-hidden="true">${a({app:i,size:`24`})}</span>`:n}
      </div>
      <div class="c-media-card__copy">
        <div class="c-media-card__headline-body">
          ${p?t`<h3 class="c-media-card__title">${p}</h3>`:n}
          ${m?t`<p class="c-media-card__body">${m}</p>`:n}
        </div>
        ${b}
      </div>
    </div>
  `}})))()}export{m as n,p as t};