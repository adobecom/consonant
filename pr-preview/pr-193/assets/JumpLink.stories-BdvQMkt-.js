import{n as e}from"./rolldown-runtime-DkW27tQK.js";import{s as t,t as n}from"./lit-UMo5x0iS.js";import"./control-button-qARLjd4F.js";function r({label:e=`Section`,href:t=`#`,onClick:n}={}){let r=document.createElement(`a`);r.className=`c-jump-link`,r.href=t,n&&r.addEventListener(`click`,n);let i=document.createElement(`span`);i.className=`c-control-button`,i.dataset.size=`md`,i.setAttribute(`aria-hidden`,`true`);let o=document.createElement(`span`);o.className=`c-control-button__icon`,o.innerHTML=a,i.append(o),r.append(i);let s=document.createElement(`span`);return s.className=`c-jump-link__label`,s.textContent=e,r.append(s),r}function i({links:e=[{label:`Photography`,href:`#photography`},{label:`Video Production`,href:`#video-production`},{label:`Design`,href:`#design`}],orientation:t=`horizontal`,ariaLabel:n=`Jump to section`}={}){let i=document.createElement(`nav`);return i.className=`c-jump-link-nav`,i.dataset.orientation=t,i.setAttribute(`aria-label`,n),e.forEach(e=>i.append(r(e))),i}var a;function o(){return(o=e((()=>{a=`<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true" focusable="false"><path d="M11.106 5.39376L7.50582 1.79359C7.171 1.45878 6.62859 1.45878 6.29377 1.79359C5.95895 2.12841 5.95895 2.67083 6.29377 3.00564L8.43076 5.14264H1.49997C1.0262 5.14264 0.642822 5.52601 0.642822 5.99978C0.642822 6.47355 1.0262 6.85692 1.49997 6.85692H8.43077L6.29378 8.99392C5.95896 9.32874 5.95896 9.87115 6.29378 10.206C6.46119 10.3734 6.68049 10.4571 6.8998 10.4571C7.11911 10.4571 7.33842 10.3734 7.50583 10.206L11.106 6.6058C11.4408 6.27098 11.4408 5.72858 11.106 5.39376Z" fill="currentColor"/></svg>`})))()}function s(){return(s=e((()=>{o()})))()}var c,l,u,d,f,p,m;function h(){return(h=e((()=>{n(),s(),c=e=>t`
  <div
    style="padding:32px;background:url('https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?w=1200&q=80') center/cover;border-radius:12px;display:inline-flex;"
  >
    ${e}
  </div>
`,l={title:`Atoms/JumpLink`,tags:[`autodocs`],render:e=>c(i(e)),parameters:{layout:`padded`,docs:{description:{component:`
In-page anchor link: a ControlButton-style icon chip paired with a heading-5
label (Adobe Clean Display Black), 8px gap. JumpLinkNav arranges N JumpLinks
either as a row (32px gap) or a stack (16px gap) via \`orientation\` — the
same name, values, and default (\`"horizontal"\`) as Card and ProductLockup's
own Orientation prop. Both are knockout (white) by design — meant to sit over
a dark or media surface, matching ControlButton's own "any surface" scrim
styling.

The icon chip reuses ControlButton's CSS class for visual parity but renders
as a non-interactive span — nesting a real button inside the anchor would be
invalid markup — so the whole item is a single link target.

Matches Figma \`JumpLink\` (13360:188611) + \`JumpLinkNav\` component set
(13371:188842, Orientation: horizontal/vertical), page "↳ JumpLink".
        `},source:{language:`html`,code:`<nav class="c-jump-link-nav" aria-label="Jump to section">
  <a class="c-jump-link" href="#photography">
    <span class="c-control-button" data-size="md" aria-hidden="true">
      <span class="c-control-button__icon">…</span>
    </span>
    <span class="c-jump-link__label">Photography</span>
  </a>
</nav>`}}}},u={args:{links:[{label:`Photography`,href:`#photography`},{label:`Video Production`,href:`#video-production`},{label:`Design`,href:`#design`}]}},d={args:{links:[{label:`Overview`,href:`#overview`},{label:`Pricing`,href:`#pricing`}]}},f={args:{orientation:`vertical`,links:[{label:`Photography`,href:`#photography`},{label:`Video Production`,href:`#video-production`},{label:`Design`,href:`#design`}]}},p={render:()=>c(r({label:`Section`,href:`#section`}))},u.parameters={...u.parameters,docs:{...u.parameters?.docs,source:{originalSource:`{
  args: {
    links: [{
      label: "Photography",
      href: "#photography"
    }, {
      label: "Video Production",
      href: "#video-production"
    }, {
      label: "Design",
      href: "#design"
    }]
  }
}`,...u.parameters?.docs?.source}}},d.parameters={...d.parameters,docs:{...d.parameters?.docs,source:{originalSource:`{
  args: {
    links: [{
      label: "Overview",
      href: "#overview"
    }, {
      label: "Pricing",
      href: "#pricing"
    }]
  }
}`,...d.parameters?.docs?.source}}},f.parameters={...f.parameters,docs:{...f.parameters?.docs,source:{originalSource:`{
  args: {
    orientation: "vertical",
    links: [{
      label: "Photography",
      href: "#photography"
    }, {
      label: "Video Production",
      href: "#video-production"
    }, {
      label: "Design",
      href: "#design"
    }]
  }
}`,...f.parameters?.docs?.source}}},p.parameters={...p.parameters,docs:{...p.parameters?.docs,source:{originalSource:`{
  render: () => media(createJumpLink({
    label: "Section",
    href: "#section"
  }))
}`,...p.parameters?.docs?.source},description:{story:`The atom on its own, outside of a JumpLinkNav row.`,...p.parameters?.docs?.description}}},m=[`Default`,`TwoLinks`,`Vertical`,`SingleLink`]})))()}h();export{u as Default,p as SingleLink,d as TwoLinks,f as Vertical,m as __namedExportsOrder,l as default};