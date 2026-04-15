import{E as i,T as g,x as a}from"./iframe-Ddy8VkM0.js";const v={CHILD:2},_=n=>(...t)=>({_$litDirective$:n,values:t});class b{constructor(t){}get _$AU(){return this._$AM._$AU}_$AT(t,e,r){this._$Ct=t,this._$AM=e,this._$Ci=r}_$AS(t,e){return this.update(t,e)}update(t,e){return this.render(...e)}}class c extends b{constructor(t){if(super(t),this.it=i,t.type!==v.CHILD)throw Error(this.constructor.directiveName+"() can only be used in child bindings")}render(t){if(t===i||t==null)return this._t=void 0,this.it=t;if(t===g)return t;if(typeof t!="string")throw Error(this.constructor.directiveName+"() called with a non-string value");if(t===this.it)return this._t;this.it=t;const e=[t];return e.raw=e,this._t={_$litType$:this.constructor.resultType,strings:e,values:[]}}}c.directiveName="unsafeHTML",c.resultType=1;const w=_(c),k=`<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
  <path d="M9.5 16V8M14.5 16V8" stroke="currentColor" stroke-width="1.94" stroke-linecap="round" stroke-linejoin="round"/>
</svg>
`,m=()=>w(k),x=n=>a`<i class="ph-bold ph-${n}" aria-hidden="true"></i>`,C=({ariaLabel:n,icon:t="pause",background:e="solid",context:r,size:s="lg",state:o="default",tone:u="default",onClick:l}={})=>{const d=r??(u==="knockout"?"on-dark":"on-light"),h=s==="md"||s==="lg"?s:s==="xs"?"md":"lg",p=o&&o!=="default"?o:null,$=o==="disabled",f=typeof t=="string"?t==="pause"?m():x(t):t;return a`
    <button
      class="c-icon-button"
      data-background=${e}
      data-context=${d}
      data-size=${h}
      data-force-state=${p??i}
      ?disabled=${$}
      aria-label=${n??"Icon button"}
      @click=${l}
      type="button"
    >
      <span class="c-icon-button__icon" aria-hidden="true">${f}</span>
    </button>
  `};export{C as I};
