import{A as e,C as t,D as n,E as r,N as i,O as a,P as o,S as s,T as c,_ as l,a as u,b as d,c as f,d as p,f as m,g as ee,h as te,i as ne,j as re,k as h,l as ie,m as ae,n as oe,o as se,p as ce,r as le,s as ue,t as de,u as g,v as fe,x as pe}from"./tokens-9OPEQUrS.js";var me=``+new URL(`global-navigation-CFRi5wcQ.webp`,import.meta.url).href,he=``+new URL(`hub-router-CEsT3tHA.webp`,import.meta.url).href,ge=``+new URL(`media-section-BZGL8MPK.webp`,import.meta.url).href,_e=``+new URL(`news-section-CFVj0hPH.webp`,import.meta.url).href,ve=``+new URL(`product-router-DRJCu_6A.webp`,import.meta.url).href,ye=``+new URL(`quote-card-CoUCT0m0.webp`,import.meta.url).href,be=``+new URL(`router-marquee-BFyG104O.webp`,import.meta.url).href,xe=``+new URL(`site-footer-D-uRXSbR.webp`,import.meta.url).href,Se=``+new URL(`social-proof-carousel-CI4eP7Dw.webp`,import.meta.url).href,{I:Ce}=o,we=e=>e,Te=()=>document.createComment(``),_=(e,t,n)=>{let r=e._$AA.parentNode,i=t===void 0?e._$AB:t._$AA;if(n===void 0)n=new Ce(r.insertBefore(Te(),i),r.insertBefore(Te(),i),e,e.options);else{let t=n._$AB.nextSibling,a=n._$AM,o=a!==e;if(o){let t;n._$AQ?.(e),n._$AM=e,n._$AP!==void 0&&(t=e._$AU)!==a._$AU&&n._$AP(t)}if(t!==i||o){let e=n._$AA;for(;e!==t;){let t=we(e).nextSibling;we(r).insertBefore(e,i),e=t}}}return n},v=(e,t,n=e)=>(e._$AI(t,n),e),Ee={},De=(e,t=Ee)=>e._$AH=t,Oe=e=>e._$AH,ke=e=>{e._$AR(),e._$AA.remove()},Ae=(e,t,n)=>{let r=new Map;for(let i=t;i<=n;i++)r.set(e[i],i);return r},je=r(class extends n{constructor(e){if(super(e),e.type!==a.CHILD)throw Error(`repeat() can only be used in text expressions`)}dt(e,t,n){let r;n===void 0?n=t:t!==void 0&&(r=t);let i=[],a=[],o=0;for(let t of e)i[o]=r?r(t,o):o,a[o]=n(t,o),o++;return{values:a,keys:i}}render(e,t,n){return this.dt(e,t,n).values}update(e,[t,n,r]){let i=Oe(e),{values:a,keys:o}=this.dt(t,n,r);if(!Array.isArray(i))return this.ut=o,a;let s=this.ut??=[],c=[],l,u,d=0,f=i.length-1,p=0,m=a.length-1;for(;d<=f&&p<=m;)if(i[d]===null)d++;else if(i[f]===null)f--;else if(s[d]===o[p])c[p]=v(i[d],a[p]),d++,p++;else if(s[f]===o[m])c[m]=v(i[f],a[m]),f--,m--;else if(s[d]===o[m])c[m]=v(i[d],a[m]),_(e,c[m+1],i[d]),d++,m--;else if(s[f]===o[p])c[p]=v(i[f],a[p]),_(e,i[d],i[f]),f--,p++;else if(l===void 0&&(l=Ae(o,p,m),u=Ae(s,d,f)),l.has(s[d])){if(l.has(s[f])){let t=u.get(o[p]),n=t===void 0?null:i[t];if(n===null){let t=_(e,i[d]);v(t,a[p]),c[p]=t}else c[p]=v(n,a[p]),_(e,i[d],n),i[t]=null;p++}else ke(i[f]),f--}else ke(i[d]),d++;for(;p<=m;){let t=_(e,c[m+1]);v(t,a[p]),c[p++]=t}for(;d<=f;){let e=i[d++];e!==null&&ke(e)}return this.ut=o,De(e,c),re}}),Me=r(class extends n{constructor(){super(...arguments),this.key=h}render(e,t){return this.key=e,t}update(e,[t,n]){return t!==this.key&&(De(e),this.key=t),n}}),y=document.querySelector(`#app`),Ne=crypto.randomUUID(),b=new ce(new URLSearchParams(location.search).get(`starter`)===`homepage`?ie():ne()),x=b.current.sections[0].id,S=0,C=1440,w=`edit`,Pe=`canvas`,T=!1,E=!1,D=!1,Fe,Ie,Le,O={lcpMs:1500,cls:.05,jsBytes:102400,cssBytes:40960,longTaskBlockingMs:100},k=e=>`${Math.round(e/1024)} KB`,Re=e=>e==null?`—`:`${Math.round(e)} ms`;async function ze(){let e=async e=>{try{let t=await fetch(`./reports/${e}`,{cache:`no-store`});return t.ok?await t.json():null}catch{return null}};[Ie,Le]=await Promise.all([e(`homepage-performance.json`),e(`accessibility-audit.json`)]),$()}function Be(){D=!0,Ie=void 0,Le=void 0,$(),Q(),ze()}var A=(e,t,n,r)=>i`<span class="metric" data-state=${n===null?`unknown`:n?`ok`:`warn`} title=${r}><span>${e}</span><strong>${t}</strong></span>`;function Ve(){if(!Fe)return i`<span class="metrics" aria-label="Preview metrics">Measuring preview…</span>`;let e=Fe;return i`<span class="metrics" role="group" aria-label=${`Preview metrics, this machine, unthrottled`}>
    ${A(`LCP`,Re(e.lcpMs),e.lcpMs===null?null:e.lcpMs<=O.lcpMs,`Largest Contentful Paint of the preview frame on this machine (lab gate: 1,500 ms desktop, 2,000 ms mobile throttled)`)}
    ${A(`CLS`,e.cls.toFixed(3),e.cls<=O.cls,`Cumulative Layout Shift (gate 0.05)`)}
    ${A(`JS`,k(e.jsBytes),e.jsBytes<=O.jsBytes,`Compressed JavaScript transferred (gate 100 KB)`)}
    ${A(`CSS`,k(e.cssBytes),e.cssBytes<=O.cssBytes,`Compressed CSS transferred (gate 40 KB)`)}
    ${A(`Images`,k(e.imageBytes),null,`${e.images} images in the page; bytes loaded so far`)}
    ${e.videoBytes?A(`Video`,k(e.videoBytes),null,`Video bytes fetched so far`):h}
    ${A(`Blocking`,Re(e.longTaskBlockingMs),e.longTaskBlockingMs<=O.longTaskBlockingMs,`Long-task blocking time observed (gate 100 ms desktop)`)}
  </span>`}function He(){let e=Ie,t=Le,n=(t,n,r)=>i`<tr><th scope="row">${t}</th>${Object.values(e.results).map(e=>i`<td data-state=${e.metrics[n]<=e.limits[n]?`ok`:`warn`}>${r(e.metrics[n])}<small>≤ ${r(e.limits[n])}</small></td>`)}</tr>`;return i`<div class="perf-panel">
    <section aria-labelledby="perf-live">
      <h3 id="perf-live">This preview, right now</h3>
      <p class="hint">Measured inside the canvas on this machine without throttling. Use it to catch a heavy image or an early video while you edit; the lab run below is the number that counts.</p>
      ${Ve()}
    </section>
    <section aria-labelledby="perf-lab">
      <h3 id="perf-lab">Last lab run</h3>
      ${e===void 0?i`<p class="hint">Loading…</p>`:e===null?i`<p class="hint">No lab report is staged. Run <code>nx run authoring-poc:homepage-perf</code>, then rebuild or restart Studio to stage <code>reports/homepage-performance.json</code>.</p>`:i`<p class="hint">${new Date(e.date).toLocaleString()} · ${e.browser} · ${e.commit.slice(0,7)}${e.dirty?` (dirty tree)`:``} · ${e.reducedMotion??`reduce`} motion · five cold runs per profile, medians shown</p>
            <div class="table-scroll"><table>
              <thead><tr><th scope="col">Metric</th>${Object.keys(e.results).map(t=>i`<th scope="col">${t} ${e.results[t].passed?`✓`:`✗`}</th>`)}</tr></thead>
              <tbody>
                ${n(`Median LCP`,`lcpMs`,e=>`${Math.round(e)} ms`)}
                ${n(`CLS`,`cls`,e=>e.toFixed(3))}
                ${n(`JS`,`jsBytes`,k)}
                ${n(`CSS`,`cssBytes`,k)}
                ${n(`Initial transfer`,`totalBytes`,k)}
                ${n(`Blocking`,`longTaskBlockingMs`,e=>`${Math.round(e)} ms`)}
              </tbody>
            </table></div>
            ${e.editor?i`<p class="hint">Editor stress: 20 sections ready in ${Math.round(e.editor.readyMs)} ms (≤ ${e.editor.limits.readyMs}), update round-trip p95 ${e.editor.updateRoundtripP95Ms} ms (≤ ${e.editor.limits.updateRoundtripP95Ms}) · seeded fault ${e.negative?.detected?`detected`:`NOT detected`}</p>`:h}
            ${Object.values(e.results).some(e=>e.failures.length)?i`<ul class="failures">${Object.entries(e.results).flatMap(([e,t])=>t.failures.map(t=>i`<li>${e}: ${t}</li>`))}</ul>`:h}`}
    </section>
    <section aria-labelledby="perf-a11y">
      <h3 id="perf-a11y">Accessibility audit</h3>
      ${t===void 0?i`<p class="hint">Loading…</p>`:t===null?i`<p class="hint">No audit is staged. Run <code>nx run authoring-poc:a11y-audit</code>.</p>`:i`<p class="hint">${new Date(t.date).toLocaleString()} · ${t.summary.findings} findings (${Object.entries(t.summary.bySeverity).map(([e,t])=>`${t} ${e}`).join(`, `)||`none`}) · axe violations: ${Object.entries(t.surfaces).map(([e,t])=>`${e} ${t.axe?.violations??`n/a`}`).join(` · `)}</p>`}
    </section>
  </div>`}var j=`quote`,M=``,N=`Opening draft`,P=!1,Ue=!1,F=0,We=0,I=!1,L=!1,R,z,Ge,B=0,V=new Map,H=e=>i`<i class=${`ph ph-${e}`} aria-hidden="true"></i>`,Ke=e=>se.find(t=>t.component===e)?.icon??`slideshow`,qe=Object.assign({"./recipe-previews/global-navigation.webp":me,"./recipe-previews/hub-router.webp":he,"./recipe-previews/media-section.webp":ge,"./recipe-previews/news-section.webp":_e,"./recipe-previews/product-router.webp":ve,"./recipe-previews/quote-card.webp":ye,"./recipe-previews/router-marquee.webp":be,"./recipe-previews/site-footer.webp":xe,"./recipe-previews/social-proof-carousel.webp":Se}),Je=e=>qe[`./recipe-previews/${e}.webp`],Ye={"creative-cloud":`Creative Cloud`,firefly:`Firefly`,"acrobat-pro":`Acrobat Pro`,photoshop:`Photoshop`,illustrator:`Illustrator`,"premiere-pro":`Premiere Pro`,express:`Express`,lightroom:`Lightroom`,"experience-cloud":`Experience Cloud`,stock:`Stock`},Xe={"global-navigation":{section:{ctaLabel:`Sign-in label`,ctaHref:`Sign-in URL`},item:{label:`Link text`,ctaHref:`Link URL`}},"router-marquee":{item:{label:`Product tab label`,ctaLabel:`Button label`,ctaHref:`Button URL`,videoAssetId:`Background video`}},"hub-router":{item:{label:`Category label`,title:`Card title`,ctaHref:`Category URL`,videoAssetId:`Hover video`}},"media-section":{item:{label:`Item name`}},"news-section":{item:{label:`Story name`}},"product-router":{section:{ctaLabel:`Button label`,ctaHref:`Button URL`},item:{label:`Product name`,title:`Product name`,ctaHref:`Product URL`}},"site-footer":{section:{body:`Copyright line`},item:{label:`Link text`,ctaHref:`Link URL`,group:`Column heading`}}},Ze={"global-navigation":`Links`,"router-marquee":`Slides`,"hub-router":`Categories`,"media-section":`Items`,"news-section":`Stories`,"product-router":`Products`,"site-footer":`Links`};function U(e,t,n){let r=Xe[e]?.[t]?.[n];if(r)return r;if(n===`label`)return`Item label`;if(n===`group`)return`Link group`;let i=d.$defs.fields.properties[n].title??n;return t===`section`?`Section ${i.toLowerCase()}`:i}var W=(e,t,n,r=!1,a)=>i` <button
    class="tool"
    type="button"
    title=${e}
    aria-label=${e}
    ?disabled=${r}
    aria-pressed=${a===void 0?h:String(a)}
    @click=${n}
  >
    ${H(t)}
  </button>`,G=()=>b.current.sections.find(e=>e.id===x),Qe=()=>{let e=G();return e?.component===`quote-card`?e:e?.component===`social-proof-carousel`?e.items[S]:void 0};function K(e){M=e instanceof Error?e.message:`Something went wrong.`,$()}function $e(){G()||(x=b.current.sections[0]?.id??``);let e=G();S=e&&e.component!==`quote-card`?Math.min(S,e.items.length-1):0}function q(e){try{let t=structuredClone(b.current);e(t);let n=document.activeElement,r=n?.matches(`textarea, input:not([type="checkbox"]):not([type="file"])`)?`${x}:${S}:${n?.labels?.[0]?.textContent}`:void 0;if(!b.commit(t,r))return;M=``,$e(),Y(),$(),X()}catch(e){K(e)}}function J(e){q(t=>{let n=t.sections.find(e=>e.id===x);n.component===`quote-card`?e(n):n.component===`social-proof-carousel`&&e(n.items[S])})}function Y(){I=!0,N=L?`Not saved`:`Saving locally`,clearTimeout(R),L||(R=setTimeout(()=>void et(),250))}async function et(){if(clearTimeout(R),z){await z;return}L||!I||(z=(async()=>{for(;I&&!L;){let e=structuredClone(b.current);I=!1;try{F=(await le(e,F)).revision,N=I?`Saving locally`:`Saved on this device`}catch(e){I=!0,L=!0,N=`Not saved`,M=e instanceof Error?e.message:`Draft storage is unavailable. Export your page to keep your changes.`}$()}})(),await z,z=void 0)}async function tt(){if(!(I&&!confirm(`Replace unsaved changes with the saved draft?`)))try{clearTimeout(R),await z;let e=await oe();if(!e)throw Error(`No saved draft was found.`);b=new ce(e.document),F=e.revision,L=!1,I=!1,M=``,N=`Saved on this device`,$e(),$(),X()}catch(e){K(e)}}function nt(e){b[e]()&&($e(),Y(),$(),X())}function rt(e){x!==e&&(S=0),x=e,$(),X()}function it(e){q(t=>{let n=t.sections.findIndex(e=>e.id===x),r=n+e;r<0||r>=t.sections.length||([t.sections[n],t.sections[r]]=[t.sections[r],t.sections[n]])})}function at(e){let t=S+e,n=G();n?.component!==`social-proof-carousel`||t<0||t>=n.items.length||q(e=>{let n=e.sections.find(e=>e.id===x);n.component===`social-proof-carousel`&&([n.items[S],n.items[t]]=[n.items[t],n.items[S]],S=t)})}function ot(){let e=URL.createObjectURL(new Blob([fe(b.current)],{type:`application/json`})),t=document.createElement(`a`);t.href=e,t.download=`${b.current.id}.json`,t.click(),setTimeout(()=>URL.revokeObjectURL(e),1e3)}async function st(e){let t=e.target,n=t.files?.[0];if(n){try{if(n.size>2097152)throw Error(`Page exceeds the 2 MiB import limit.`);let e=l(await n.text());q(t=>Object.assign(t,e))}catch(e){K(e)}t.value=``}}async function ct(){let e=window.open(`about:blank`,`_blank`);if(e&&(e.opener=null),await et(),I||L){e?.close(),K(Error(`Save or export your changes before opening the saved preview.`));return}e&&(e.location.href=new URL(`preview.html`,location.href).href)}function X(){if(!Ue||!P)return;let e=document.querySelector(`#canvas-frame`),t={channel:Ne,type:`render`,revision:++We,document:b.current,selectedId:x,slideIndex:S,editing:w===`edit`};V.set(We,performance.now()),V.size>100&&V.delete(V.keys().next().value),e?.contentWindow?.postMessage(t,location.origin)}window.addEventListener(`message`,e=>{let t=document.querySelector(`#canvas-frame`),n=e.data;if(e.origin===location.origin&&e.source===t?.contentWindow&&n?.channel===Ne&&(n.type===`ready`&&(Ue=!0,X()),n.type===`select`&&b.current.sections.some(e=>e.id===n.id)&&rt(n.id),n.type===`error`&&K(Error(n.message||`Preview failed.`)),n.type===`metrics`&&n.metrics&&(Fe=n.metrics,$()),n.type===`rendered`)){let e=V.get(n.revision);e!==void 0&&(B=Math.round(performance.now()-e),V.delete(n.revision),y.dataset.previewRevision=String(n.revision),y.dataset.previewLatency=String(B),y.dataset.controllers=String(n.controllers),y.dataset.ready=`true`,$())}});function lt(){let e=document.querySelector(`.stage`),t=document.querySelector(`.frame-shell`),n=document.querySelector(`#canvas-frame`);if(!e||!t||!n||e.clientWidth<1)return;let r=Math.min(1,Math.max(.1,(e.clientWidth-32)/C)),i=Math.max(400,(e.clientHeight-32)/r);t.style.width=`${C*r}px`,t.style.height=`${i*r}px`,n.style.width=`${C}px`,n.style.height=`${i}px`,n.style.transform=`scale(${r})`}function ut(e){C=e,$(),lt()}function dt(e){w=e,$(),X()}function ft(e){let n=pe.$defs.quoteProps.properties;return i` <label class="field"
      >${n.quote.title}<textarea
        rows="4"
        maxlength=${n.quote.maxLength}
        .value=${e.props.quote}
        @input=${e=>J(t=>{t.props.quote=e.target.value})}
      ></textarea>
    </label>
    <div class="field-heading"><h3>Attribution</h3></div>
    ${[`attributionName`,`attributionRole`].map(t=>i` <label class="field"
          >${n[t].title}<input
            maxlength=${n[t].maxLength}
            .value=${e.props[t]}
            @input=${e=>J(n=>{n.props[t]=e.target.value})}
        /></label>`)}
    <label class="check"
      ><input
        type="checkbox"
        .checked=${e.props.showAttribution}
        @change=${e=>J(t=>{t.props.showAttribution=e.target.checked})}
      />${n.showAttribution.title}</label
    >
    <div class="field-heading">
      <h3>Image</h3>
      ${W(`Choose image`,`images`,()=>{j=`quote`,E=!0,$(),Q()})}
    </div>
    <button
      class="image-picker"
      aria-label="Choose image"
      @click=${()=>{j=`quote`,E=!0,$(),Q()}}
    >
      <img
        src=${s(e.props.imageAssetId,`small`)}
        alt=${t.find(t=>t.id===e.props.imageAssetId).name}
      /><span
        >${t.find(t=>t.id===e.props.imageAssetId).name}${H(`arrows-clockwise`)}</span
      >
    </button>
    <div class="field-heading"><h3>Call to action</h3></div>
    <label class="field"
      >Label<input
        maxlength="60"
        .value=${e.slots.cta.label}
        @input=${e=>J(t=>{t.slots.cta.label=e.target.value})}
    /></label>
    <label class="field"
      >Link<input
        type="text"
        .value=${e.slots.cta.href}
        @change=${e=>{let t=e.target;J(e=>{e.slots.cta.href=t.value}),t.value=Qe()?.slots.cta.href??`#`}}
    /></label>
    <label class="check"
      ><input
        type="checkbox"
        .checked=${e.props.showCta}
        @change=${e=>J(t=>{t.props.showCta=e.target.checked})}
      />${n.showCta.title}</label
    >`}function Z(e,t){q(n=>{let r=n.sections.find(e=>e.id===x);r&&te(r)&&t(e===`section`?r.props:r.items[S])})}function pt(e){j=e,E=!0,$(),Q()}function mt(e,n,r,a){let o=a.includes(`ctaLabel`)&&a.includes(`ctaHref`),l=U(e,r,`ctaLabel`).startsWith(`Button`)?`Button`:`Call to action`;return i`${a.map(a=>{if(a===`imageAssetId`)return i`<div class="field-heading"><h3>Image</h3>${W(`Remove image`,`minus`,()=>Z(r,e=>{e.imageAssetId=``}),!n.imageAssetId)}</div>
      <button class="image-picker" aria-label="Choose content image" @click=${()=>pt(r)}>
        ${n.imageAssetId?i`<img src=${s(n.imageAssetId,`small`)} alt="" />`:i`<span class="image-placeholder">${H(`image`)}</span>`}<span>${n.imageAssetId?t.find(e=>e.id===n.imageAssetId)?.name:`Choose image`}${H(`images`)}</span>
      </button>`;if(a===`videoAssetId`)return i`<label class="field">${U(e,r,a)}<select .value=${n.videoAssetId??``} @change=${e=>Z(r,t=>{t.videoAssetId=e.target.value})}><option value="" ?selected=${!n.videoAssetId}>None (still image only)</option>${c.map(e=>i`<option value=${e.id} ?selected=${e.id===n.videoAssetId}>${e.name}</option>`)}</select></label>`;let u=d.$defs.fields.properties[a],f=a===`ctaLabel`&&o?i`<div class="field-heading"><h3>${l}</h3></div>`:h,p=e=>Z(r,t=>{t[a]=e.target.value}),m=a===`ctaHref`;return i`${f}<label class="field">${U(e,r,a)}${a===`body`?i`<textarea rows="4" maxlength=${u.maxLength} .value=${n[a]} @input=${p}></textarea>`:i`<input maxlength=${u.maxLength} .value=${n[a]??``} @input=${m?h:p} @change=${m?p:h} />`}</label>`})}`}function ht(e){let t=e.items[S],n=e.component===`global-navigation`||e.component===`site-footer`,r=e.component===`router-marquee`?[]:e.component===`site-footer`?[`body`]:e.component===`global-navigation`?[`ctaLabel`,`ctaHref`]:e.component===`news-section`?[`title`]:e.component===`product-router`?[`title`,`body`,`ctaLabel`,`ctaHref`,`imageAssetId`,`imageAlt`]:[`eyebrow`,`title`,`body`],a=n?[`ctaHref`]:e.component===`news-section`?[`title`,`body`,`ctaLabel`,`ctaHref`]:e.component===`product-router`?[`title`,`body`,`ctaHref`,`imageAssetId`,`imageAlt`]:e.component===`hub-router`?[`title`,`body`,`ctaHref`,`imageAssetId`,`videoAssetId`,`imageAlt`]:e.component===`media-section`?[`title`,`body`,`ctaLabel`,`ctaHref`,`imageAssetId`,`imageAlt`]:[`eyebrow`,`title`,`body`,`ctaLabel`,`ctaHref`,`imageAssetId`,`videoAssetId`,`imageAlt`],o=e=>q(t=>{let n=t.sections.find(e=>e.id===x);n&&te(n)&&e(n)}),s=e=>o(t=>{let n=S+e;[t.items[S],t.items[n]]=[t.items[n],t.items[S]],S=n}),c=Ze[e.component],l=mt(e.component,e.props,`section`,r);return i`
    ${r.length?i`<div class="field-heading"><h3>Section</h3></div>${l}`:h}
    <div class="field-heading"><h3>${c} <span>${e.items.length}</span></h3>${W(`Add item`,`plus`,()=>o(e=>{e.items.push(f()),S=e.items.length-1}),e.items.length>=p[e.component])}</div>
    <div class="item-list" role="group" aria-label=${c}>
      ${je(e.items,e=>e.id,(t,r)=>i`<button type="button" class="item-row" aria-label=${`${r+1}. ${t.label}`} aria-pressed=${String(r===S)} @click=${()=>{S=r,$(),X()}}><span class="index">${String(r+1).padStart(2,`0`)}</span><span>${t.label}</span>${t.app&&!n&&e.component!==`news-section`?i`<small>${Ye[t.app]??t.app}</small>`:h}</button>`)}
    </div>
    <div class="slide-tools"><span>${c.replace(/ies$/,`y`).replace(/s$/,``)} ${S+1} of ${e.items.length}</span>${W(`Move item earlier`,`arrow-left`,()=>s(-1),S===0)}${W(`Move item later`,`arrow-right`,()=>s(1),S===e.items.length-1)}${W(`Duplicate item`,`copy`,()=>o(e=>{e.items.splice(S+1,0,{...structuredClone(t),id:ee()}),S++}),e.items.length>=p[e.component])}${W(`Delete item`,`trash`,()=>o(e=>{e.items.splice(S,1)}),e.items.length===1)}</div>
    ${Me(t.id,i`
      <label class="field">${U(e.component,`item`,`label`)}<input maxlength="80" .value=${t.label} @change=${e=>Z(`item`,t=>{t.label=e.target.value})} /></label>
      ${e.component===`site-footer`?i`<label class="field">${U(e.component,`item`,`group`)}<input maxlength="80" .value=${t.group} @input=${e=>Z(`item`,t=>{t.group=e.target.value})} /></label>`:h}
      ${!n&&e.component!==`news-section`?i`<label class="field">Product icon<select aria-label="Product icon" .value=${t.app} @change=${e=>Z(`item`,t=>{t.app=e.target.value})}>${d.$defs.item.properties.app.enum.map(e=>i`<option value=${e} ?selected=${e===t.app}>${Ye[e]??e}</option>`)}</select></label>`:h}
      ${mt(e.component,t,`item`,a)}
    `)}
  `}function gt(){confirm(`Replace this draft with the Homepage starter? You can undo this change. Export first to keep a separate copy.`)&&q(e=>{Object.assign(e,ie()),x=e.sections[1].id,S=0})}function Q(){document.querySelector(`#picker`)?.showModal()}function _t(){document.querySelector(`#picker`)?.close(),T=!1,E=!1,D=!1,$()}function $(){let n=G(),r=Qe(),a=b.current.sections.findIndex(e=>e.id===x);e(i`
      <header class="topbar">
        <h1 class="brand">
          <span class="brand-mark">S2A</span><strong>Studio</strong
          ><span class="poc-badge">POC</span>
        </h1>
        <div class="document-meta">
          <span>${b.current.title}</span
          ><span class="save-state" role="status"
            >${H(L?`warning-circle`:I?`circle-notch`:`check-circle`)}${N}</span
          >
        </div>
        <div class="header-actions">
          ${W(`Load Homepage starter`,`house`,gt,!P)}
          ${W(`Undo`,`arrow-counter-clockwise`,()=>nt(`undo`),!b.canUndo)}${W(`Redo`,`arrow-clockwise`,()=>nt(`redo`),!b.canRedo)}<span
            class="rule"
          ></span
          >${W(`Import JSON`,`upload-simple`,()=>document.querySelector(`#import`).click(),!P)}${W(`Export JSON`,`download-simple`,ot,!P)}${W(`Performance`,`gauge`,Be,!P,D)}<button
            class="command primary"
            aria-label="Open preview"
            @click=${ct}
            ?disabled=${!P}
          >
            ${H(`arrow-square-out`)}<span>Open preview</span>
          </button>
        </div>
        <input
          id="import"
          class="hidden"
          type="file"
          accept=".json,application/json"
          @change=${st}
        />
      </header>
      ${M?i`<div class="error-banner" role="alert">
            ${H(`warning-circle`)}<span>${M}</span>${L?i`<button class="command" @click=${tt}>Load saved draft</button>`:h}${W(`Dismiss error`,`x`,()=>{M=``,$()})}
          </div>`:h}
      <main class="workspace" data-panel=${Pe}>
        <aside class="outline" aria-label="Page outline">
          <div class="panel-heading">
            <h2>Page</h2>
            ${W(`Add section`,`plus`,()=>{T=!0,$(),Q()},!P||b.current.sections.length>=100)}
          </div>
          <label class="field page-name"
            >Page title<input
              maxlength="120"
              .value=${b.current.title}
              @input=${e=>q(t=>{t.title=e.target.value})}
          /></label>
          <div class="list-heading">
            SECTIONS <span>${b.current.sections.length}</span>
          </div>
          <nav aria-label="Sections">
            ${je(b.current.sections,e=>e.id,(e,t)=>i`
            <button
              class="section-row"
              aria-current=${e.id===x?`true`:`false`}
              @click=${()=>rt(e.id)}
            >
              ${H(Ke(e.component))}<span
                >${ue(e)}<small
                  >${e.component===`quote-card`?`1 story`:`${e.items.length} ${e.component===`social-proof-carousel`?`stories`:`items`}`}</small
                ></span
              >${b.current.id===`adobe-homepage`&&g[e.component]?i`<i class="ph ph-warning-circle review-marker" role="img" title="Design review pending" aria-label="Design review pending"></i>`:h}<span class="index">${String(t+1).padStart(2,`0`)}</span>
            </button>
          `)}
          </nav>
          <button
            class="command add-section"
            @click=${()=>{T=!0,$(),Q()}}
            ?disabled=${b.current.sections.length>=100}
          >
            ${H(`plus`)}Add section
          </button>
          <div class="outline-footer">
            ${H(`translate`)}<span>English (US)</span><span>en-US</span>
          </div>
        </aside>
        <section class="canvas-area" aria-label="Page canvas">
          <div class="canvas-toolbar">
            <div class="segmented" aria-label="Canvas mode">
              <button
                aria-pressed=${String(w===`edit`)}
                @click=${()=>dt(`edit`)}
              >
                ${H(`cursor`)}Edit</button
              ><button
                aria-pressed=${String(w===`preview`)}
                @click=${()=>dt(`preview`)}
              >
                ${H(`eye`)}Preview
              </button>
            </div>
            <div class="viewport-tools">
              ${W(`Desktop viewport`,`desktop`,()=>ut(1440),!1,C===1440)}${W(`Tablet viewport`,`device-tablet`,()=>ut(768),!1,C===768)}${W(`Mobile viewport`,`device-mobile`,()=>ut(390),!1,C===390)}<span
                class="viewport-size"
                >${C}px</span
              >
            </div>
            <div class="theme-tools">
              ${W(`Light theme`,`sun`,()=>q(e=>{e.theme=`light`}),!1,b.current.theme===`light`)}${W(`Dark theme`,`moon`,()=>q(e=>{e.theme=`dark`}),!1,b.current.theme===`dark`)}
            </div>
          </div>
          <div class="stage">
            <div class="frame-shell">
              <iframe
                id="canvas-frame"
                title=${w===`edit`?`Page preview. Select sections from the Page outline; switch to Preview to use the page with the keyboard.`:`Page preview`}
                tabindex=${w===`edit`?`-1`:h}
                src=${`./preview.html?channel=${Ne}`}
                sandbox="allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox"
                referrerpolicy="no-referrer"
              ></iframe>
            </div>
          </div>
          <footer class="canvas-status">
            <span
              >${n?ue(n):`No section selected`}${n?.component===`social-proof-carousel`?` / Story ${S+1}`:``}</span
            >${Ve()}<span
              >${B?`${B} ms preview update`:`Connecting preview`}</span
            >
          </footer>
        </section>
        <aside class="inspector" aria-label="Section properties">
          <div class="panel-heading">
            <h2>${n?ue(n):`Page`}</h2>
            ${H(`sliders-horizontal`)}
          </div>
          ${n?i`<div class="section-tools">
                ${W(`Move section up`,`arrow-up`,()=>it(-1),a<=0)}${W(`Move section down`,`arrow-down`,()=>it(1),a===b.current.sections.length-1)}${W(`Duplicate section`,`copy`,()=>q(e=>{let t=ae(n);e.sections.splice(a+1,0,t),x=t.id}),b.current.sections.length>=100)}${W(`Delete section`,`trash`,()=>q(e=>{e.sections.splice(a,1)}))}<span>Section ${a+1}</span>
              </div>`:h}
          <div class="inspector-body">
            ${n&&b.current.id===`adobe-homepage`&&g[n.component]?i`<details class="design-review"><summary>Design review</summary><ul>${g[n.component].notes.map(e=>i`<li>${e}</li>`)}</ul><a href=${`https://www.figma.com/design/qAF4nlt6O4ThbeXeO7jzdb/?node-id=${g[n.component].node.replace(`:`,`-`)}`} target="_blank" rel="noreferrer">Figma source ${H(`arrow-square-out`)}</a></details>`:h}
            ${n?.component===`social-proof-carousel`?i`
                  <div class="field-heading">
                    <h3>Stories <span>${n.items.length}</span></h3>
                    ${W(`Add slide`,`plus`,()=>q(e=>{let t=e.sections.find(e=>e.id===x);t.component===`social-proof-carousel`&&(t.items.push(m(t.items.length)),S=t.items.length-1)}),n.items.length>=8)}
                  </div>
                  <div class="slides" aria-label="Carousel stories">
                    ${je(n.items,e=>e.id,(e,t)=>i`<button
                  class="slide"
                  aria-label=${`Edit story ${t+1}`}
                  aria-pressed=${String(S===t)}
                  @click=${()=>{S=t,$(),X()}}
                >
                  <img
                    src=${s(e.props.imageAssetId,`small`)}
                    alt=""
                  /><span>${t+1}</span>
                </button>`)}
                  </div>
                  <div class="slide-tools">
                    <span>Story ${S+1}</span
                    >${W(`Move slide earlier`,`arrow-left`,()=>at(-1),S===0)}${W(`Move slide later`,`arrow-right`,()=>at(1),S===n.items.length-1)}${W(`Delete slide`,`trash`,()=>q(e=>{let t=e.sections.find(e=>e.id===x);t.component===`social-proof-carousel`&&t.items.splice(S,1)}),n.items.length===1)}
                  </div>
                `:h}
            ${r?Me(r.id,ft(r)):n&&te(n)?Me(n.id,ht(n)):i`<button
                  class="command"
                  @click=${()=>{T=!0,$(),Q()}}
                >
                  ${H(`plus`)}Add section
                </button>`}
          </div>
        </aside>
      </main>
      <nav class="mobile-nav" aria-label="Workspace panels">
        ${[[`outline`,`stack`,`Page`],[`canvas`,`desktop`,`Canvas`],[`inspector`,`sliders-horizontal`,`Properties`]].map(([e,t,n])=>i`<button
          aria-pressed=${String(Pe===e)}
          @click=${()=>{Pe=e,$(),requestAnimationFrame(lt)}}
        >
          ${H(t)}${n}
        </button>`)}
      </nav>
      <dialog
        id="picker"
        aria-labelledby="picker-title"
        @cancel=${()=>{T=!1,E=!1,D=!1}}
        @click=${e=>{e.target===e.currentTarget&&_t()}}
      >
        <div class="dialog-inner">
          <div class="panel-heading">
            <h2 id="picker-title">
              ${D?`Performance`:E?`Choose image`:`Add section`}
            </h2>
            ${W(`Close dialog`,`x`,_t)}
          </div>
          ${D?He():h}
          <div class="picker-grid" ?hidden=${D}>
            ${E?t.filter(e=>j!==`quote`||pe.$defs.quoteProps.properties.imageAssetId.enum.includes(e.id)).map(e=>i`<button
                  class="asset-option"
                  @click=${()=>{j===`quote`?J(t=>{t.props.imageAssetId=e.id}):Z(j,t=>{t.imageAssetId=e.id}),_t()}}
                >
                  <img src=${s(e.id,`small`)} alt="" /><strong
                    >${e.name}</strong
                  >
                </button>`):T?se.map(e=>i`<button
                    class="recipe-option"
                    @click=${()=>{q(t=>{let n=u(e.component);t.sections.push(n),x=n.id,S=0}),_t()}}
                  >
                    ${Je(e.component)?i`<img src=${Je(e.component)} alt="" />`:i`<span class="recipe-placeholder">${H(e.icon)}</span>`}<span
                      >${H(e.icon)}<span class="recipe-copy"><strong>${e.name}</strong><small>${e.description}</small></span>${H(`plus`)}</span
                    >
                  </button>`):h}
          </div>
        </div>
      </dialog>
    `,y),Ge||(Ge=new ResizeObserver(lt),Ge.observe(document.querySelector(`.stage`))),requestAnimationFrame(lt)}window.addEventListener(`beforeunload`,e=>{(I||z)&&(e.preventDefault(),e.returnValue=``)}),document.addEventListener(`visibilitychange`,()=>{document.visibilityState===`hidden`&&et()}),document.addEventListener(`keydown`,e=>{!(e.metaKey||e.ctrlKey)||e.key.toLowerCase()!==`z`||e.target.closest(`input, textarea, [contenteditable]`)||(e.preventDefault(),nt(e.shiftKey?`redo`:`undo`))}),$();try{let e=await oe();e?(b=new ce(e.document),F=e.revision,N=`Saved on this device`):Y()}catch(e){e instanceof de?(F=e.revision,N=`Replacing an incompatible draft`,M=`The draft saved on this device was written by an older Studio build and cannot be opened (${e.message}). Studio opened the starter instead and will replace the old draft on save.`,Y()):(L=!0,N=`Local storage unavailable`,K(e))}P=!0,$e(),$(),X();