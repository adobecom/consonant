import{x as e}from"./iframe-Tc7CWXVM.js";import{I}from"./icon-button-DtFwLSIc.js";import{t as c,I as v,s as f,o as x}from"./define-element-hZqclnjs.js";import"./preload-helper-CT4MYQ55.js";const C=`.c-icon-button {
  --c-icon-button-size: var(--s2a-spacing-2xl, 40px);
  --c-icon-button-icon-size: var(--s2a-spacing-lg, 24px);
  --c-icon-button-border-width: 0px;
  --c-icon-button-focus-inner: var(--s2a-color-background-default, #ffffff);
  --c-icon-button-focus-outer: var(--s2a-color-focus-ring-default, #1473e6);

  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: var(--c-icon-button-size);
  height: var(--c-icon-button-size);
  padding: calc(
      (var(--c-icon-button-size) - var(--c-icon-button-icon-size)) / 2 -
        var(--c-icon-button-border-width)
    );
  box-sizing: border-box;
  border-radius: var(--s2a-border-radius-round, 999px);
  border: var(--c-icon-button-border-width) solid transparent;
  background-color: transparent;
  color: var(--s2a-color-content-default, #000000);
  cursor: pointer;
  transition: background-color 200ms ease, border-color 200ms ease, color 200ms ease,
    box-shadow 200ms ease, opacity 120ms ease;
}

.c-icon-button[data-size="md"] {
  --c-icon-button-size: var(--s2a-spacing-xl, 32px);
  --c-icon-button-icon-size: var(--s2a-spacing-md, 16px);
}

.c-icon-button[data-context="on-dark"] {
  --c-icon-button-focus-inner: var(--s2a-color-background-knockout, #000000);
}

.c-icon-button[data-context="on-dark"][data-background="solid"] {
  --c-icon-button-focus-inner: var(--s2a-color-background-default, #ffffff);
}

.c-icon-button:disabled,
.c-icon-button[data-force-state="disabled"] {
  opacity: var(--s2a-opacity-disabled, 0.48);
  cursor: not-allowed;
  pointer-events: none;
}

.c-icon-button__icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: var(--c-icon-button-icon-size);
  height: var(--c-icon-button-icon-size);
  font-size: var(--c-icon-button-icon-size);
  color: currentColor;
}

.c-icon-button:is(:focus-visible, [data-force-state="focus"]) {
  outline: none;
  box-shadow:
    0 0 0 var(--s2a-spacing-3xs, 2px) var(--c-icon-button-focus-inner),
    0 0 0 var(--s2a-spacing-2xs, 4px) var(--c-icon-button-focus-outer);
}

/* ---------- Primary · solid ---------- */

.c-icon-button[data-background="solid"][data-context="on-light"] {
  --c-icon-button-border-width: var(--s2a-border-width-sm, 1px);
  background-color: var(
    --s2a-color-iconbutton-background-primary-solid-on-light-default,
    var(--s2a-color-background-knockout, #000000)
  );
  color: var(
    --s2a-color-iconbutton-content-primary-solid-default,
    var(--s2a-color-content-knockout, #ffffff)
  );
  border-color: var(--s2a-color-transparent-white-12, rgba(255, 255, 255, 0.12));
  /* Primitive: white stroke opacity from Figma */
}

.c-icon-button[data-background="solid"][data-context="on-light"]:not(:disabled):is(
    :hover,
    [data-force-state="hover"],
  ) {
  background-color: var(
    --s2a-color-iconbutton-background-primary-solid-on-light-hover,
    var(--s2a-color-gray-900, #131313)
  ); /* Primitive: hover fallback until semantic token ships */
}

.c-icon-button[data-background="solid"][data-context="on-light"]:not(:disabled):is(
    :active,
    [data-force-state="active"],
  ) {
  background-color: var(
    --s2a-color-iconbutton-background-primary-solid-on-light-active,
    var(--s2a-color-gray-800, #292929)
  ); /* Primitive: active fallback until semantic token ships */
}

.c-icon-button[data-background="solid"][data-context="on-dark"] {
  background-color: var(
    --s2a-color-iconbutton-background-primary-solid-on-dark-default,
    var(--s2a-color-background-default, #ffffff)
  );
  color: var(
    --s2a-color-iconbutton-content-primary-solid-inverse,
    var(--s2a-color-content-default, #000000)
  );
}

.c-icon-button[data-background="solid"][data-context="on-dark"]:not(:disabled):is(
    :hover,
    [data-force-state="hover"],
  ) {
  background-color: var(
    --s2a-color-iconbutton-background-primary-solid-on-dark-hover,
    var(--s2a-color-background-subtle, #f3f3f3)
  );
}

.c-icon-button[data-background="solid"][data-context="on-dark"]:not(:disabled):is(
    :active,
    [data-force-state="active"],
  ) {
  background-color: var(
    --s2a-color-iconbutton-background-primary-solid-on-dark-active,
    var(--s2a-color-gray-200, #e1e1e1)
  );
}

/* ---------- Primary · outlined ---------- */

.c-icon-button[data-background="outlined"] {
  --c-icon-button-border-width: var(--s2a-border-width-sm, 1px);
}

.c-icon-button[data-background="outlined"][data-context="on-light"] {
  border-color: var(
    --s2a-color-iconbutton-border-primary-outlined-default,
    var(--s2a-color-content-default, #000000)
  );
  color: var(
    --s2a-color-iconbutton-content-primary-outlined-default,
    var(--s2a-color-content-default, #000000)
  );
}

.c-icon-button[data-background="outlined"][data-context="on-light"]:not(:disabled):is(
    :hover,
    [data-force-state="hover"],
  ) {
  background-color: var(
    --s2a-color-iconbutton-background-primary-outlined-on-light-hover,
    var(--s2a-color-transparent-black-08, rgba(0, 0, 0, 0.08))
  );
}

.c-icon-button[data-background="outlined"][data-context="on-light"]:not(:disabled):is(
    :active,
    [data-force-state="active"],
  ) {
  background-color: var(
    --s2a-color-iconbutton-background-primary-outlined-on-light-active,
    var(--s2a-color-transparent-black-12, rgba(0, 0, 0, 0.12))
  );
}

.c-icon-button[data-background="outlined"][data-context="on-dark"] {
  border-color: var(
    --s2a-color-iconbutton-border-primary-outlined-on-dark,
    var(--s2a-color-content-knockout, #ffffff)
  );
  color: var(
    --s2a-color-iconbutton-content-primary-outlined-knockout,
    var(--s2a-color-content-knockout, #ffffff)
  );
}

.c-icon-button[data-background="outlined"][data-context="on-dark"]:not(:disabled):is(
    :hover,
    [data-force-state="hover"],
  ) {
  background-color: var(
    --s2a-color-iconbutton-background-primary-outlined-on-dark-hover,
    var(--s2a-color-transparent-white-08, rgba(255, 255, 255, 0.08))
  );
}

.c-icon-button[data-background="outlined"][data-context="on-dark"]:not(:disabled):is(
    :active,
    [data-force-state="active"],
  ) {
  background-color: var(
    --s2a-color-iconbutton-background-primary-outlined-on-dark-active,
    var(--s2a-color-transparent-white-12, rgba(255, 255, 255, 0.12))
  );
}

/* ---------- Primary · transparent ---------- */

.c-icon-button[data-background="transparent"] {
  backdrop-filter: blur(var(--s2a-blur-md, 32px));
  -webkit-backdrop-filter: blur(var(--s2a-blur-md, 32px));
}

.c-icon-button[data-background="transparent"][data-context="on-light"] {
  color: var(
    --s2a-color-iconbutton-content-primary-transparent-default,
    var(--s2a-color-content-default, #000000)
  );
}

.c-icon-button[data-background="transparent"][data-context="on-light"]:not(:disabled):is(
    :hover,
    [data-force-state="hover"],
  ) {
  background-color: var(
    --s2a-color-iconbutton-background-primary-transparent-hover,
    var(--s2a-color-transparent-black-08, rgba(0, 0, 0, 0.08))
  );
}

.c-icon-button[data-background="transparent"][data-context="on-light"]:not(:disabled):is(
    :active,
    [data-force-state="active"],
  ) {
  background-color: var(
    --s2a-color-iconbutton-background-primary-transparent-active,
    var(--s2a-color-transparent-black-12, rgba(0, 0, 0, 0.12))
  );
}

.c-icon-button[data-background="transparent"][data-context="on-dark"] {
  color: var(
    --s2a-color-iconbutton-content-primary-transparent-knockout,
    var(--s2a-color-content-knockout, #ffffff)
  );
}

.c-icon-button[data-background="transparent"][data-context="on-dark"]:not(:disabled):is(
    :hover,
    [data-force-state="hover"],
  ) {
  background-color: var(
    --s2a-color-iconbutton-background-primary-transparent-on-dark-hover,
    var(--s2a-color-transparent-white-08, rgba(255, 255, 255, 0.08))
  );
}

.c-icon-button[data-background="transparent"][data-context="on-dark"]:not(:disabled):is(
    :active,
    [data-force-state="active"],
  ) {
  background-color: var(
    --s2a-color-iconbutton-background-primary-transparent-on-dark-active,
    var(--s2a-color-transparent-white-12, rgba(255, 255, 255, 0.12))
  );
}

/* Accent intent removed – design system exposes primary tokens only. */
`,S=({width:n=24,height:o=24,hidden:a=!1,title:t="Play"}={})=>c`<svg
    data-name="ICONS"
    xmlns="http://www.w3.org/2000/svg"
    width="${n}"
    height="${o}"
    viewBox="0 0 20 20"
    aria-hidden=${a?"true":"false"}
    role="img"
    fill="currentColor"
    aria-label="${t}"
  >
    <path
      d="M4.74902,18.00391c-.39795,0-.79541-.10742-1.15332-.32129-.68604-.41016-1.0957-1.13281-1.0957-1.93164V4.24902c0-.79883.40967-1.52148,1.0957-1.93164.68555-.40918,1.51514-.42969,2.21924-.0498l10.70117,5.75098c.73047.39258,1.18408,1.15234,1.18408,1.98145s-.45361,1.58887-1.18408,1.98145l-10.70117,5.75098c-.33643.18164-.70166.27148-1.06592.27148ZM4.75244,3.49609c-.17822,0-.31836.06836-.38721.10938-.10986.06543-.36523.25977-.36523.64355v11.50195c0,.38379.25537.57812.36523.64355s.40137.19824.73975.01758l10.70068-5.75098c.35596-.19238.39453-.52637.39453-.66113s-.03857-.46875-.39453-.66113L5.10498,3.58789c-.12646-.06738-.24609-.0918-.35254-.0918Z"
      fill="currentColor"
    />
  </svg>`,L=({width:n=24,height:o=24,hidden:a=!1,title:t="Play"}={})=>c`<svg
    xmlns="http://www.w3.org/2000/svg"
    height="${o}"
    viewBox="0 0 36 36"
    width="${n}"
    aria-hidden=${a?"true":"false"}
    role="img"
    fill="currentColor"
    aria-label="${t}"
  >
    <path
      d="M9.46 4H7a1 1 0 0 0-1 1v26a1 1 0 0 0 1 1h2.46a2 2 0 0 0 1.007-.272l22.064-12.866a1 1 0 0 0 0-1.724L10.467 4.272A2 2 0 0 0 9.46 4Z"
    />
  </svg>`;class P extends v{render(){return f(e),this.spectrumVersion===2?S({hidden:!this.label,title:this.label}):L({hidden:!this.label,title:this.label})}}x("sp-icon-play",P);const B=({width:n=24,height:o=24,hidden:a=!1,title:t="Pause"}={})=>c`<svg
    xmlns="http://www.w3.org/2000/svg"
    width="${n}"
    height="${o}"
    viewBox="0 0 20 20"
    aria-hidden=${a?"true":"false"}
    role="img"
    fill="currentColor"
    aria-label="${t}"
  >
    <path
      d="m6.75,18h-2.5c-1.24072,0-2.25-1.00977-2.25-2.25V4.25c0-1.24023,1.00928-2.25,2.25-2.25h2.5c1.24072,0,2.25,1.00977,2.25,2.25v11.5c0,1.24023-1.00928,2.25-2.25,2.25ZM4.25,3.5c-.41357,0-.75.33691-.75.75v11.5c0,.41309.33643.75.75.75h2.5c.41357,0,.75-.33691.75-.75V4.25c0-.41309-.33643-.75-.75-.75h-2.5Z"
      fill="currentColor"
    />
    <path
      d="m15.75,18h-2.5c-1.24072,0-2.25-1.00977-2.25-2.25V4.25c0-1.24023,1.00928-2.25,2.25-2.25h2.5c1.24072,0,2.25,1.00977,2.25,2.25v11.5c0,1.24023-1.00928,2.25-2.25,2.25Zm-2.5-14.5c-.41357,0-.75.33691-.75.75v11.5c0,.41309.33643.75.75.75h2.5c.41357,0,.75-.33691.75-.75V4.25c0-.41309-.33643-.75-.75-.75h-2.5Z"
      fill="currentColor"
    />
    <path
      d="m6.75,18h-2.5c-1.24072,0-2.25-1.00977-2.25-2.25V4.25c0-1.24023,1.00928-2.25,2.25-2.25h2.5c1.24072,0,2.25,1.00977,2.25,2.25v11.5c0,1.24023-1.00928,2.25-2.25,2.25ZM4.25,3.5c-.41357,0-.75.33691-.75.75v11.5c0,.41309.33643.75.75.75h2.5c.41357,0,.75-.33691.75-.75V4.25c0-.41309-.33643-.75-.75-.75h-2.5Z"
      fill="currentColor"
    />
    <path
      d="m15.75,18h-2.5c-1.24072,0-2.25-1.00977-2.25-2.25V4.25c0-1.24023,1.00928-2.25,2.25-2.25h2.5c1.24072,0,2.25,1.00977,2.25,2.25v11.5c0,1.24023-1.00928,2.25-2.25,2.25Zm-2.5-14.5c-.41357,0-.75.33691-.75.75v11.5c0,.41309.33643.75.75.75h2.5c.41357,0,.75-.33691.75-.75V4.25c0-.41309-.33643-.75-.75-.75h-2.5Z"
      fill="currentColor"
    />
  </svg>`,M=({width:n=24,height:o=24,hidden:a=!1,title:t="Pause"}={})=>c`<svg
    xmlns="http://www.w3.org/2000/svg"
    height="${o}"
    viewBox="0 0 36 36"
    width="${n}"
    aria-hidden=${a?"true":"false"}
    role="img"
    fill="currentColor"
    aria-label="${t}"
  >
    <g>
      <rect height="28" rx="1" width="8" x="6" y="4" />
      <rect height="28" rx="1" width="8" x="20" y="4" />
    </g>
  </svg>`;class V extends v{render(){return f(e),this.spectrumVersion===2?B({hidden:!this.label,title:this.label}):M({hidden:!this.label,title:this.label})}}x("sp-icon-pause",V);const Z=({width:n=24,height:o=24,hidden:a=!1,title:t="Close"}={})=>c`<svg
    xmlns="http://www.w3.org/2000/svg"
    width="${n}"
    height="${o}"
    viewBox="0 0 20 20"
    aria-hidden=${a?"true":"false"}
    role="img"
    fill="currentColor"
    aria-label="${t}"
  >
    <path
      d="m11.06061,10l5.20648-5.20605c.29297-.29297.29297-.76758,0-1.06055s-.76758-.29297-1.06055,0l-5.20654,5.20605L4.79346,3.7334c-.29297-.29297-.76758-.29297-1.06055,0s-.29297.76758,0,1.06055l5.20648,5.20605-5.20648,5.20605c-.29297.29297-.29297.76758,0,1.06055.14648.14648.33838.21973.53027.21973s.38379-.07324.53027-.21973l5.20654-5.20605,5.20654,5.20605c.14648.14648.33838.21973.53027.21973s.38379-.07324.53027-.21973c.29297-.29297.29297-.76758,0-1.06055l-5.20648-5.20605Z"
      fill="currentColor"
    />
  </svg>`,_=({width:n=24,height:o=24,hidden:a=!1,title:t="Close"}={})=>c`<svg
    xmlns="http://www.w3.org/2000/svg"
    width="${n}"
    height="${o}"
    viewBox="0 0 36 36"
    aria-hidden=${a?"true":"false"}
    role="img"
    fill="currentColor"
    aria-label="${t}"
  >
    <path
      d="M26.485 6.686 18 15.172 9.515 6.686a1 1 0 0 0-1.414 0L6.686 8.101a1 1 0 0 0 0 1.414L15.172 18l-8.486 8.485a1 1 0 0 0 0 1.414l1.415 1.415a1 1 0 0 0 1.414 0L18 20.828l8.485 8.486a1 1 0 0 0 1.414 0l1.415-1.415a1 1 0 0 0 0-1.414L20.828 18l8.486-8.485a1 1 0 0 0 0-1.414l-1.415-1.415a1 1 0 0 0-1.414 0Z"
    />
  </svg>`;class O extends v{render(){return f(e),this.spectrumVersion===2?Z({hidden:!this.label,title:this.label}):_({hidden:!this.label,title:this.label})}}x("sp-icon-close",O);const A=({width:n=24,height:o=24,hidden:a=!1,title:t="Volume Mute"}={})=>c`<svg
    xmlns="http://www.w3.org/2000/svg"
    height="${o}"
    viewBox="0 0 36 36"
    width="${n}"
    aria-hidden=${a?"true":"false"}
    role="img"
    fill="currentColor"
    aria-label="${t}"
  >
    <path
      d="M12 27a10.983 10.983 0 0 1 4-8.478V5a.726.726 0 0 0-1.194-.571l-6.639 6.8c-.439.446-.726.844-1.422.844H1a1 1 0 0 0-1 1v9.923a1 1 0 0 0 1 1h5.745c.697 0 .996.411 1.422.845l4.005 4.102A11.022 11.022 0 0 1 12 27Z"
    />
    <path
      d="M23 18.1a8.9 8.9 0 1 0 8.9 8.9 8.9 8.9 0 0 0-8.9-8.9ZM16 27a6.935 6.935 0 0 1 1.475-4.252l9.777 9.777A6.966 6.966 0 0 1 16 27Zm12.525 4.252-9.777-9.777a6.966 6.966 0 0 1 9.777 9.777Z"
    />
  </svg>`,T=({width:n=24,height:o=24,hidden:a=!1,title:t="Volume Off"}={})=>c`<svg
    xmlns="http://www.w3.org/2000/svg"
    width="${n}"
    height="${o}"
    viewBox="0 0 20 20"
    aria-hidden=${a?"true":"false"}
    role="img"
    fill="currentColor"
    aria-label="${t}"
  >
    <path
      d="m18.78027,17.73926L2.28027,1.23926c-.29297-.29297-.76758-.29297-1.06055,0s-.29297.76758,0,1.06055l2.72168,2.72168h-.69141c-1.24023,0-2.25,1.00977-2.25,2.25v5.5c0,1.24023,1.00977,2.25,2.25,2.25h1.62891c.19824,0,.3916.08008.53027.21875l2.60352,2.60449c.33594.33594.78125.51367,1.23535.51367.22559,0,.45312-.04395.6709-.13477.65723-.27148,1.08105-.90625,1.08105-1.61719v-4.52637l6.71973,6.71973c.14648.14648.33789.21973.53027.21973s.38379-.07324.53027-.21973c.29297-.29297.29297-.76758,0-1.06055Zm-9.28027-1.13281c0,.14551-.09668.20801-.1543.23145-.05859.02441-.1709.04688-.27246-.05371l-2.60352-2.60449c-.4248-.4248-.98926-.6582-1.59082-.6582h-1.62891c-.41309,0-.75-.33691-.75-.75v-5.5c0-.41309.33691-.75.75-.75h2.19141l4.05859,4.05859v6.02637Z"
      fill="currentColor"
    />
    <path
      d="m8.25879,4.07324l.81445-.81445c.10449-.10254.21582-.07617.27246-.05469.07031.0293.1543.09277.1543.23145v2.59082c0,.41406.33594.75.75.75s.75-.33594.75-.75v-2.59082c0-.70996-.42383-1.34473-1.08008-1.61719-.65723-.27051-1.4043-.12207-1.90723.37988l-.81445.81445c-.29297.29297-.29297.76758,0,1.06055s.76758.29297,1.06055,0Z"
      fill="currentColor"
    />
    <path
      d="m13.22266,9.8252c.04004.38574.36523.67285.74512.67285.02539,0,.05176-.00098.07812-.00391.41211-.04297.71191-.41113.66895-.82324-.09961-.96289-.57324-1.79395-1.29883-2.27734-.34473-.22852-.81055-.13574-1.04004.20801-.22949.34473-.13672.81055.20801,1.04004.34766.23145.58594.67383.63867,1.18359Z"
      fill="currentColor"
    />
    <path
      d="m17.25,10.01758c0,.86621-.28418,1.68652-.80078,2.30957-.26367.31934-.21875.79199.09961,1.05664.14062.11523.30957.17188.47852.17188.21484,0,.42969-.09277.57812-.27148.73828-.89258,1.14453-2.05273,1.14453-3.2666,0-1.68555-.79785-3.26562-2.08301-4.12402-.34766-.22949-.81152-.13672-1.04102.20703-.22949.34473-.13672.81055.20703,1.04102.87402.58301,1.41699,1.68555,1.41699,2.87598Z"
      fill="currentColor"
    />
  </svg>`;class F extends v{render(){return f(e),this.spectrumVersion===1?A({hidden:!this.label,title:this.label}):T({hidden:!this.label,title:this.label})}}x("sp-icon-volume-mute",F);const{fn:R}=__STORYBOOK_MODULE_TEST__,k=(n="lg")=>n==="lg"?"width:24px;height:24px;display:inline-flex;align-items:center;justify-content:center;":"width:16px;height:16px;display:inline-flex;align-items:center;justify-content:center;",w=(n="lg")=>e`<sp-icon-play aria-hidden="true" style="${k(n)}"></sp-icon-play>`,$=(n="lg")=>e`<sp-icon-pause aria-hidden="true" style="${k(n)}"></sp-icon-pause>`,z=(n="md")=>e`<sp-icon-close aria-hidden="true" style="${k(n)}"></sp-icon-close>`,h=(n="md")=>e`<sp-icon-volume-mute aria-hidden="true" style="${k(n)}"></sp-icon-volume-mute>`,E={pause:$,play:w,close:z,"volume-mute":h,mute:h},j=(n,o="lg")=>{if(typeof n!="string")return n;const a=E[n];return a?a(o):n},D=(n,o)=>n==="active"?w(o):n==="disabled"?h(o):$(o),r=(n={})=>{const o=n.size==="md"?"md":"lg";return I({...n,size:o,icon:j(n.icon,o)})},W={title:"Components/IconButton",tags:["autodocs"],render:n=>r(n),parameters:{docs:{description:{component:`
<style>
.doc-pattern {
  border: 1px solid rgba(0,0,0,0.08);
  border-radius: 16px;
  margin: 12px 0;
  background: linear-gradient(180deg, rgba(255,255,255,0.96), rgba(248,248,248,0.9));
}
.doc-collapse summary {
  list-style: none;
  cursor: pointer;
  padding: 18px 24px;
  font-size: 15px;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.doc-collapse summary::-webkit-details-marker { display: none; }
.doc-collapse summary span { color: #555; font-size: 13px; font-weight: 600; }
.doc-collapse[open] summary { border-bottom: 1px solid rgba(0,0,0,0.08); }
.doc-body { padding: 20px 24px 24px; }
.doc-body p { margin: 0 0 12px; font-size: 14px; color: #333; }
.doc-body code { font-weight: 600; }
</style>
<p>Icon-only action button straight from matt-atoms. Icons below use Spectrum 2 Workflow icons—run <code>npm run icons:fetch Play Pause Close</code> to download raw SVGs into <code>packages/components/src/icon-button/assets/</code> when you need inline art.</p>

<details class="doc-pattern doc-collapse">
  <summary>Preferred · Data-attribute HTML structure <span>Recommended</span></summary>
  <div class="doc-body">
    <p>Map Figma axes to <code>data-*</code> attributes. Icon slots accept inline SVG, Spectrum Web Components, or Lit templates.</p>

\`\`\`html
<button
  class="c-icon-button"
  data-background="solid"
  data-context="on-light"
  data-size="lg"
  aria-label="Pause playback"
>
  <span class="c-icon-button__icon" aria-hidden="true">
    <sp-icon-pause style="width:24px;height:24px" aria-hidden="true"></sp-icon-pause>
  </span>
</button>
\`\`\`

\`\`\`css
.c-icon-button[data-background="solid"][data-context="on-light"] {
  background-color: var(--s2a-color-iconbutton-background-primary-solid-on-light-default);
  color: var(--s2a-color-iconbutton-content-primary-solid-default);
}

.c-icon-button[data-background="outlined"][data-context="on-dark"] {
  border: var(--s2a-border-width-sm) solid var(--s2a-color-iconbutton-border-primary-outlined-on-dark);
  color: var(--s2a-color-iconbutton-content-primary-outlined-knockout);
}
\`\`\`
  </div>
</details>

<details class="doc-pattern doc-collapse">
  <summary>Alternative · BEM / utility classes <span>Class-based</span></summary>
  <div class="doc-body">
    <p>Utility-heavy stacks can alias variant axes to class modifiers while keeping specificity flat.</p>

\`\`\`html
<button class="c-icon-button c-icon-button--solid c-icon-button--on-light c-icon-button--lg" aria-label="Play">
  <span class="c-icon-button__icon" aria-hidden="true">
    <sp-icon-play style="width:24px;height:24px" aria-hidden="true"></sp-icon-play>
  </span>
</button>

<button class="c-icon-button c-icon-button--outlined c-icon-button--on-dark c-icon-button--md" aria-label="Mute">
  <span class="c-icon-button__icon" aria-hidden="true">
    <sp-icon-volume-mute style="width:16px;height:16px" aria-hidden="true"></sp-icon-volume-mute>
  </span>
</button>
\`\`\`

\`\`\`css
.c-icon-button--solid.c-icon-button--on-light {
  background-color: var(--s2a-color-iconbutton-background-primary-solid-on-light-default);
  color: var(--s2a-color-iconbutton-content-primary-solid-default);
}

.c-icon-button--outlined.c-icon-button--on-dark {
  border: var(--s2a-border-width-sm) solid var(--s2a-color-iconbutton-border-primary-outlined-on-dark);
  color: var(--s2a-color-iconbutton-content-primary-outlined-knockout);
}
\`\`\`
  </div>
</details>

<details class="doc-pattern doc-collapse">
  <summary>Full CSS reference <span>Source of truth</span></summary>
  <div class="doc-body">
    <p>Direct copy of <code>packages/components/src/icon-button/icon-button.css</code>.</p>

\`\`\`css
${C}
\`\`\`
  </div>
</details>
        `}}},argTypes:{ariaLabel:{control:"text",description:"Accessible label (required)"},icon:{control:"text",description:"Phosphor icon name (pause, play) or pass a Lit template (e.g. <sp-icon-play>)"},context:{control:{type:"select"},options:["on-light","on-dark"],description:"Surface context the icon button lives on"},background:{control:{type:"select"},options:["solid","outlined","transparent"],description:"Background variant"},size:{control:{type:"select"},options:["md","lg"],description:"Size variant (lg = hero controls, md = compact toolbars)"},state:{control:{type:"select"},options:["default","hover","active","focus","disabled"],description:"Force a visual state for documentation"}},args:{onClick:R(),ariaLabel:"Pause",icon:"pause",context:"on-light",background:"solid",size:"lg",state:"default"}},s={},l={args:{background:"outlined"}},d={args:{background:"transparent"}},u={args:{state:"disabled"}},p={render:()=>e`
    <div style="display: flex; gap: 16px; flex-wrap: wrap; align-items: center;">
      ${r({ariaLabel:"Play media",icon:w("lg"),size:"lg",background:"solid"})}
      ${r({ariaLabel:"Mute audio",icon:h("md"),size:"md",background:"outlined"})}
      <div style="background: #0b0b0b; padding: 12px; border-radius: 16px; display: inline-flex;">
        ${r({ariaLabel:"Close dialog",icon:z("md"),context:"on-dark",background:"transparent"})}
      </div>
    </div>
  `},b={render:()=>e`
    <div style="display: flex; gap: 16px; align-items: center;">
      ${r({ariaLabel:"Play (md)",icon:"play",size:"md"})}
      ${r({ariaLabel:"Pause (lg)",icon:"pause",size:"lg"})}
    </div>
  `},g={render:()=>{const n=["solid","outlined","transparent"];return e`
      <div style="display: flex; flex-direction: column; gap: 24px;">
        <div style="display: flex; gap: 16px; flex-wrap: wrap;">
          ${n.map(o=>r({background:o,context:"on-light",ariaLabel:o,icon:"pause",size:"lg"}))}
        </div>
        <div style="background: #0b0b0b; padding: 24px; border-radius: 24px; display: flex; gap: 16px; flex-wrap: wrap;">
          ${n.map(o=>r({background:o,context:"on-dark",ariaLabel:`${o} on dark`,icon:"pause",size:"lg"}))}
        </div>
      </div>
    `}},m={render:()=>{const n=["default","hover","active","focus","disabled"],o=(a,t)=>e`
      <div style="display: flex; gap: 16px; flex-wrap: wrap; align-items: center;">
        ${n.map(y=>r({icon:D(y,t),ariaLabel:`${a} icon button ${y}`,state:y,size:t}))}
      </div>
    `;return e`
      <div style="display: flex; flex-direction: column; gap: 16px;">
        <span style="font: 12px/1.4 var(--s2a-font-family-default, 'Adobe Clean', sans-serif); color: #5c5c5c;">Large (lg · 40px)</span>
        ${o("Large","lg")}
        <span style="font: 12px/1.4 var(--s2a-font-family-default, 'Adobe Clean', sans-serif); color: #5c5c5c;">Medium (md · 32px)</span>
        ${o("Medium","md")}
      </div>
    `}},i={render:()=>e`
    <div style="display: flex; flex-wrap: wrap; gap: 16px; padding: 20px; align-items: center;">
      ${r({background:"solid",ariaLabel:"Pause (tab to focus)",state:"focus",icon:"pause",size:"lg"})}
      ${r({background:"outlined",ariaLabel:"Pause (tab to focus)",state:"focus",icon:"pause",size:"lg"})}
      ${r({background:"transparent",ariaLabel:"Pause (tab to focus)",state:"focus",icon:"pause",size:"lg"})}
    </div>
  `};s.parameters={...s.parameters,docs:{...s.parameters?.docs,source:{originalSource:"{}",...s.parameters?.docs?.source}}};l.parameters={...l.parameters,docs:{...l.parameters?.docs,source:{originalSource:`{
  args: {
    background: "outlined"
  }
}`,...l.parameters?.docs?.source}}};d.parameters={...d.parameters,docs:{...d.parameters?.docs,source:{originalSource:`{
  args: {
    background: "transparent"
  }
}`,...d.parameters?.docs?.source}}};u.parameters={...u.parameters,docs:{...u.parameters?.docs,source:{originalSource:`{
  args: {
    state: "disabled"
  }
}`,...u.parameters?.docs?.source}}};p.parameters={...p.parameters,docs:{...p.parameters?.docs,source:{originalSource:`{
  render: () => html\`
    <div style="display: flex; gap: 16px; flex-wrap: wrap; align-items: center;">
      \${renderIconButton({
    ariaLabel: "Play media",
    icon: SpectrumPlayIcon("lg"),
    size: "lg",
    background: "solid"
  })}
      \${renderIconButton({
    ariaLabel: "Mute audio",
    icon: SpectrumMuteIcon("md"),
    size: "md",
    background: "outlined"
  })}
      <div style="background: #0b0b0b; padding: 12px; border-radius: 16px; display: inline-flex;">
        \${renderIconButton({
    ariaLabel: "Close dialog",
    icon: SpectrumCloseIcon("md"),
    context: "on-dark",
    background: "transparent"
  })}
      </div>
    </div>
  \`
}`,...p.parameters?.docs?.source}}};b.parameters={...b.parameters,docs:{...b.parameters?.docs,source:{originalSource:`{
  render: () => html\`
    <div style="display: flex; gap: 16px; align-items: center;">
      \${renderIconButton({
    ariaLabel: "Play (md)",
    icon: "play",
    size: "md"
  })}
      \${renderIconButton({
    ariaLabel: "Pause (lg)",
    icon: "pause",
    size: "lg"
  })}
    </div>
  \`
}`,...b.parameters?.docs?.source}}};g.parameters={...g.parameters,docs:{...g.parameters?.docs,source:{originalSource:`{
  render: () => {
    const backgrounds = ["solid", "outlined", "transparent"];
    return html\`
      <div style="display: flex; flex-direction: column; gap: 24px;">
        <div style="display: flex; gap: 16px; flex-wrap: wrap;">
          \${backgrounds.map(background => renderIconButton({
      background,
      context: "on-light",
      ariaLabel: background,
      icon: "pause",
      size: "lg"
    }))}
        </div>
        <div style="background: #0b0b0b; padding: 24px; border-radius: 24px; display: flex; gap: 16px; flex-wrap: wrap;">
          \${backgrounds.map(background => renderIconButton({
      background,
      context: "on-dark",
      ariaLabel: \`\${background} on dark\`,
      icon: "pause",
      size: "lg"
    }))}
        </div>
      </div>
    \`;
  }
}`,...g.parameters?.docs?.source}}};m.parameters={...m.parameters,docs:{...m.parameters?.docs,source:{originalSource:`{
  render: () => {
    const states = ["default", "hover", "active", "focus", "disabled"];
    const renderRow = (sizeLabel, sizeValue) => html\`
      <div style="display: flex; gap: 16px; flex-wrap: wrap; align-items: center;">
        \${states.map(state => renderIconButton({
      icon: forcedStateIcon(state, sizeValue),
      ariaLabel: \`\${sizeLabel} icon button \${state}\`,
      state,
      size: sizeValue
    }))}
      </div>
    \`;
    return html\`
      <div style="display: flex; flex-direction: column; gap: 16px;">
        <span style="font: 12px/1.4 var(--s2a-font-family-default, 'Adobe Clean', sans-serif); color: #5c5c5c;">Large (lg · 40px)</span>
        \${renderRow("Large", "lg")}
        <span style="font: 12px/1.4 var(--s2a-font-family-default, 'Adobe Clean', sans-serif); color: #5c5c5c;">Medium (md · 32px)</span>
        \${renderRow("Medium", "md")}
      </div>
    \`;
  }
}`,...m.parameters?.docs?.source}}};i.parameters={...i.parameters,docs:{...i.parameters?.docs,source:{originalSource:`{
  render: () => html\`
    <div style="display: flex; flex-wrap: wrap; gap: 16px; padding: 20px; align-items: center;">
      \${renderIconButton({
    background: "solid",
    ariaLabel: "Pause (tab to focus)",
    state: "focus",
    icon: "pause",
    size: "lg"
  })}
      \${renderIconButton({
    background: "outlined",
    ariaLabel: "Pause (tab to focus)",
    state: "focus",
    icon: "pause",
    size: "lg"
  })}
      \${renderIconButton({
    background: "transparent",
    ariaLabel: "Pause (tab to focus)",
    state: "focus",
    icon: "pause",
    size: "lg"
  })}
    </div>
  \`
}`,...i.parameters?.docs?.source},description:{story:"Focus ring appears when tabbing to the button.",...i.parameters?.docs?.description}}};const q=["Solid","Outlined","Transparent","Disabled","SpectrumIcons","Sizes","ContextGrid","ForcedStates","FocusStates"];export{g as ContextGrid,u as Disabled,i as FocusStates,m as ForcedStates,l as Outlined,b as Sizes,s as Solid,p as SpectrumIcons,d as Transparent,q as __namedExportsOrder,W as default};
