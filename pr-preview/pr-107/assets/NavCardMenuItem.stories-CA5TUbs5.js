import{x as s}from"./iframe-muZFcRZV.js";import{N as o}from"./nav-card-menu-item-DWR0Ss8n.js";import"./preload-helper-B2APnxIB.js";import"./nav-card-shell-BsdMUSx_.js";import"./nav-card-button-DhgWmSLl.js";const r=[{label:"Creative Cloud",href:"#"},{label:"Illustrator",href:"#"},{label:"Photoshop",href:"#"},{label:"Premiere Pro",href:"#"},{label:"After Effects",href:"#"},{label:"Substance 3D",href:"#"}],d={title:"Organisms/NavCard/Menu",tags:["autodocs"],render:t=>s`<div style="padding: 32px; background: #f5f5f5; display: inline-flex;">${o(t)}</div>`,parameters:{docs:{description:{component:"Navigation menu card — title heading, link list, and a bottom CTA."},source:{language:"html",code:`<div class="c-nav-card-menu-item">
  <h3 class="c-nav-card-menu-item__title">Browse</h3>
  <ul class="c-nav-card-menu-item__list" role="list">
    <li><a class="c-nav-card-menu-item__link" href="#">Creative Cloud</a></li>
    <li><a class="c-nav-card-menu-item__link" href="#">Illustrator</a></li>
    <li><a class="c-nav-card-menu-item__link" href="#">Photoshop</a></li>
    <li><a class="c-nav-card-menu-item__link" href="#">Premiere Pro</a></li>
    <!-- …more items -->
  </ul>
  <a class="c-nav-card-button" href="#">Explore</a>
</div>`}}},argTypes:{title:{control:"text",description:"Menu heading"},ctaLabel:{control:"text",description:"Bottom CTA label"},ctaHref:{control:"text",description:"Bottom CTA link"},items:{control:"object",description:"Nav link data"}},args:{title:"Browse",items:r,ctaLabel:"Explore",ctaHref:"#"}},e={},a={args:{items:r.map(t=>({...t,showIconEnd:!0}))}};e.parameters={...e.parameters,docs:{...e.parameters?.docs,source:{originalSource:"{}",...e.parameters?.docs?.source}}};a.parameters={...a.parameters,docs:{...a.parameters?.docs,source:{originalSource:`{
  args: {
    items: sampleItems.map(item => ({
      ...item,
      showIconEnd: true
    }))
  }
}`,...a.parameters?.docs?.source}}};const u=["Default","WithIcons"];export{e as Default,a as WithIcons,u as __namedExportsOrder,d as default};
