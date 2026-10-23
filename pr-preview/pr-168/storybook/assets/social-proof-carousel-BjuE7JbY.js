import{n as e}from"./rolldown-runtime-C0FnF6B9.js";import{c as t,t as n}from"./lit-DRzJKe3d.js";import{n as r,t as i}from"./icon-button-CHg_-mtg.js";import{n as a,t as o}from"./quote-card-BFsVw0aA.js";var s,c,l,u,d,f,p;function m(){return(m=e((()=>{n(),a(),r(),s=({slides:e=[],activeIndex:n=0}={})=>t`
  <div class="c-social-proof-carousel" data-active=${n} data-single=${String(e.length<2)}>
    <div class="spc-track">
      ${e.map((e,r)=>t`
          <div
            class="spc-slide"
            data-state=${r===n?`active`:`inactive`}
            aria-hidden=${r===n?`false`:`true`}
            ?inert=${r!==n}
          >
            ${o(e)}
          </div>
        `)}
    </div>

    <div class="spc-nav spc-nav--prev">
      ${i({icon:`arrow-left`,style:`knockout`,size:`lg`,ariaLabel:`Previous slide`})}
    </div>

    <div class="spc-nav spc-nav--next">
      ${i({icon:`arrow-right`,style:`knockout`,size:`lg`,ariaLabel:`Next slide`})}
    </div>

    <div class="spc-pagination" role="group" aria-label="Slide navigation">
      ${e.map((e,r)=>t`
          <button
            class="spc-dot"
            type="button"
            aria-label="Slide ${r+1}"
            aria-pressed=${r===n?`true`:`false`}
          ></button>
        `)}
    </div>
  </div>
`,c=500,l=`cubic-bezier(0.42, 0, 0, 1)`,u=.1146,d=.086,f=8,p=class{constructor(e){this.el=e,this.track=e.querySelector(`.spc-track`),this.slides=[...e.querySelectorAll(`.spc-slide`)],this.dots=[...e.querySelectorAll(`.spc-dot`)],this.prevBtn=e.querySelector(`.spc-nav--prev .c-icon-button`),this.nextBtn=e.querySelector(`.spc-nav--next .c-icon-button`),this.activeIndex=Number(e.dataset.active??0),this._ro=null,this._events=new AbortController,this._destroyed=!1,this._bindEvents(),this._recalc(),this._goTo(this.activeIndex,!0)}_getPeek(){let e=this.el.offsetWidth;return e<600?16:Math.round(e*(e>=1441?u:d))}_getSlideWidth(e){let t=this.el.offsetWidth;return e?t-2*e-16:t}_recalc(){if(this._destroyed)return;if(!this.el.offsetWidth){this.el.style.removeProperty(`--spc-slide-w`),this.el.style.removeProperty(`--spc-peek`);return}let e=this._getPeek(),t=this._getSlideWidth(e);this.el.style.setProperty(`--spc-slide-w`,`${t}px`),this.el.style.setProperty(`--spc-peek`,`${e}px`),this._goTo(this.activeIndex,!0)}_goTo(e,t=!1){if(this._destroyed)return;e=Math.max(0,Math.min(this.slides.length-1,Number.isFinite(e)?Math.trunc(e):0));let n=this._getPeek(),r=this._getSlideWidth(n),i=-(e*(r+f))+n+f;this.track.style.transition=t?`none`:`transform ${c}ms ${l}`,this.track.style.transform=`translateX(${i}px)`,this.slides.forEach((t,n)=>{let r=n===e;t.dataset.state=r?`active`:`inactive`,t.setAttribute(`aria-hidden`,r?`false`:`true`),r?t.removeAttribute(`inert`):t.setAttribute(`inert`,``)}),this.dots.forEach((t,n)=>{t.setAttribute(`aria-pressed`,n===e?`true`:`false`)}),this.prevBtn&&(this.prevBtn.disabled=e===0),this.nextBtn&&(this.nextBtn.disabled=e>=this.slides.length-1),this.el.dataset.active=e,this.activeIndex=e}_advance(e){let t=Math.max(0,Math.min(this.slides.length-1,this.activeIndex+e));t!==this.activeIndex&&this._goTo(t)}_bindEvents(){let e={signal:this._events.signal};this.prevBtn?.addEventListener(`click`,()=>this._advance(-1),e),this.nextBtn?.addEventListener(`click`,()=>this._advance(1),e),this.dots.forEach((t,n)=>{t.addEventListener(`click`,()=>this._goTo(n),e)}),this.el.addEventListener(`keydown`,e=>{e.target.closest(`input, textarea, select, [contenteditable="true"]`)||(e.key===`ArrowLeft`&&(e.preventDefault(),this._advance(-1)),e.key===`ArrowRight`&&(e.preventDefault(),this._advance(1)))},e),typeof ResizeObserver<`u`&&(this._ro=new ResizeObserver(()=>this._recalc()),this._ro.observe(this.el))}destroy(){this._destroyed||(this._destroyed=!0,this._events.abort(),this._ro?.disconnect())}}})))()}export{p as n,m as r,s as t};