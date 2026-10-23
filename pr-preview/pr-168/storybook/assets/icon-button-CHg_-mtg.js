import{n as e}from"./rolldown-runtime-C0FnF6B9.js";import{c as t,i as n,t as r}from"./lit-DRzJKe3d.js";import{r as i}from"./unsafe-html-t7SGSaWI.js";import{t as a}from"./unsafe-html-BN0uzf8m.js";import{n as o,t as s}from"./chevron-right-D_w3jOSY.js";import{n as c,t as l}from"./arrow-right-DzMRham4.js";import{i as u,n as d,r as f,t as p}from"./play-7CotRpfO.js";import{a as m,c as h,d as g,f as _,g as v,h as y,i as b,l as x,m as S,n as C,o as w,p as T,r as E,s as D,t as O,u as k}from"./hamburger-menu-B0pww2y2.js";function A({style:e,context:t}={}){return t===`on-dark`&&(e===`solid`||e===void 0)?`knockout`:N.includes(e)?e:`solid`}var j,M,N,P;function F(){return(F=e((()=>{r(),a(),f(),p(),v(),S(),_(),k(),h(),o(),w(),c(),E(),C(),j={pause:u,play:d,cross:y,close:y,add:T,"chevron-down":g,"chevron-up":x,"chevron-left":D,"chevron-right":s,"arrow-left":m,"arrow-right":l,"link-out":b,hamburger:O},M=e=>{let t=j[e];return t?i(t):n},N=[`solid`,`transparent`,`knockout`],P=(e={})=>{let{ariaLabel:r,icon:i=`pause`,size:a=`lg`,state:o=`default`,onClick:s}=e,c=a===`sm`||a===`md`||a===`lg`?a:`lg`,l=o&&o!=="default"?o:null,u=o===`disabled`,d=typeof i==`string`?M(i):i;return t`
    <button
      class="c-icon-button"
      data-style=${A(e)}
      data-size=${c}
      data-force-state=${l??n}
      ?disabled=${u}
      aria-label=${r??`Icon button`}
      @click=${s}
      type="button"
    >
      <span class="c-icon-button__icon" aria-hidden="true">${d}</span>
    </button>
  `}})))()}export{F as n,P as t};