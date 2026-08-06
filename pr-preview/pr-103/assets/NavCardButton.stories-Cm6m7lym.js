import{x as o}from"./iframe-BV8OQpRw.js";import{N as n}from"./nav-card-button-BjP81LO7.js";import"./preload-helper-BFoh1Q1y.js";const p={title:"Organisms/NavCard/CTA Button",tags:["autodocs"],render:s=>o`<div style="padding: 32px; background: #f5f5f5; width: 340px;">${n(s)}</div>`,parameters:{docs:{description:{component:"GNAV pill CTA used under every nav card/menu item."},source:{language:"html",code:`<!-- Link variant (most common) -->
<a class="c-nav-card-button" href="/destination">Explore</a>

<!-- Button variant (no href) -->
<button class="c-nav-card-button" type="button">Explore</button>`}}},argTypes:{label:{control:"text",description:"CTA text"},href:{control:"text",description:"Optional link destination"},state:{control:"select",options:["default","hover","active","focus","disabled"],description:"Debug helper — forces a visual state"}},args:{label:"Explore",href:"#",state:"default"}},e={},t={args:{state:"hover"}},r={args:{state:"active"}},a={args:{state:"disabled",href:""}};e.parameters={...e.parameters,docs:{...e.parameters?.docs,source:{originalSource:"{}",...e.parameters?.docs?.source}}};t.parameters={...t.parameters,docs:{...t.parameters?.docs,source:{originalSource:`{
  args: {
    state: "hover"
  }
}`,...t.parameters?.docs?.source}}};r.parameters={...r.parameters,docs:{...r.parameters?.docs,source:{originalSource:`{
  args: {
    state: "active"
  }
}`,...r.parameters?.docs?.source}}};a.parameters={...a.parameters,docs:{...a.parameters?.docs,source:{originalSource:`{
  args: {
    state: "disabled",
    href: ""
  }
}`,...a.parameters?.docs?.source}}};const l=["Default","Hover","Active","Disabled"];export{r as Active,e as Default,a as Disabled,t as Hover,l as __namedExportsOrder,p as default};
