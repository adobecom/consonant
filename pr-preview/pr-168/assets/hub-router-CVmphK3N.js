import{n as e}from"./rolldown-runtime-C0FnF6B9.js";import{c as t,i as n,t as r}from"./lit-DRzJKe3d.js";import{n as i,t as a}from"./media-C03lr5S2.js";import{n as o,t as s}from"./elastic-card-BTjuezLq.js";import{n as c,t as l}from"./section-header-DClU8v79.js";var u,d,f,p,m;function h(){return(h=e((()=>{r(),c(),o(),i(),u=e=>a({src:e,type:`video`,autoplay:!1,muted:!0,loop:!0,playsinline:!0}),d=e=>{let t=e.currentTarget.querySelector(`video`);t&&(t.pause(),t.currentTime=0)},f=e=>e.currentTarget.removeAttribute(`data-edge`),p=[{label:`Creativity and design`,app:`creative-cloud`,title:`Next-level creative`,body:`Do it all with industry-leading apps for design, photo, video, and creative AI.`,href:`https://www.adobe.com/creativecloud.html`,mediaSrc:`https://www.adobe.com/upp/media_1badc9f153c69f16292c23f9752012c9ab7edb851.mp4`},{label:`Content creation`,app:`firefly`,title:`Stunning content made easy`,body:`Quickly create and edit images, video, and audio with creative AI.`,href:`https://www.adobe.com/products/firefly.html`,mediaSrc:`https://www.adobe.com/upp/media_159d163e5e983109aed71b1cb4e1048b4f849ab72.mp4`},{label:`PDF and productivity`,app:`acrobat`,title:`Work done faster`,body:`Create, edit, and share PDFs. Make edits and create presentations with AI.`,href:`https://www.adobe.com/acrobat.html`,mediaSrc:`https://www.adobe.com/upp/media_1928dd1a3e8e5ed6e7979b5bb37fcd4c273746e62.mp4`},{label:`Marketing content`,app:`experience-cloud`,title:`Orchestrate customer experiences`,body:`Deliver business impact, move faster, and personalize at scale.`,href:`https://business.adobe.com/`,mediaSrc:`https://www.adobe.com/upp/media_14d261ad034b647cf9ec9e77e1a4e53cbbd31af35.mp4`},{label:`Students and teachers`,app:`creative-cloud`,title:`Discounts for students and teachers.`,body:`Save a bundle on our biggest bundle of top industry creative tools.`,href:`https://www.adobe.com/education.html`,mediaSrc:`https://www.adobe.com/upp/media_11ef0b05657078d2235cbedc8322cd486a4d83a86.mp4`}],m=({heading:e=`Everything you need to make anything.`,body:r=`Whether you're a student, social influencer, creative professional, performance marketer, or global brand—Adobe has the apps you need to make it happen.`,eyebrow:i,showEyebrow:a=!1,theme:o=`on-light`,cards:c=p}={})=>t`
  <section class="c-hub-router" data-theme=${o===`on-dark`||o===`dark`?`dark`:n}>
    <div class="c-hub-router__heading">
      ${l({eyebrow:i,showEyebrow:a,title:e,body:r})}
    </div>
    <div class="c-hub-router__carousel" role="list" aria-label="Product categories"
      @mouseleave=${f}
    >
      ${c.map((e,n)=>{let r=n===0?`first`:n===c.length-1?`last`:null;return t`
          <div role="listitem"
            @mouseenter=${e=>{matchMedia(`(prefers-reduced-motion: reduce)`).matches||e.currentTarget.querySelector(`video`)?.play()?.catch(()=>{});let t=e.currentTarget.parentElement;r?t.dataset.edge=r:t.removeAttribute(`data-edge`)}}
            @mouseleave=${d}
            @focusin=${e=>{matchMedia(`(prefers-reduced-motion: reduce)`).matches||e.currentTarget.querySelector(`video`)?.play()?.catch(()=>{})}}
            @focusout=${d}
          >
            ${s({...e,state:`resting`,mediaTemplate:e.mediaTemplate??(e.mediaSrc?u(e.mediaSrc):void 0)})}
          </div>
        `})}
    </div>
  </section>
`})))()}export{m as n,h as r,p as t};