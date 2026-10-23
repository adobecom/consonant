import{n as e}from"./rolldown-runtime-C0FnF6B9.js";import{l as t,o as n}from"./lit-DRzJKe3d.js";import{i as r,n as i,r as a,t as o}from"./directive-B8vxgYJR.js";var s,c,l;function u(){return(u=e((()=>{t(),a(),s=`important`,c=` !`+s,l=o(class extends i{constructor(e){if(super(e),e.type!==r.ATTRIBUTE||e.name!==`style`||e.strings?.length>2)throw Error("The `styleMap` directive must be used in the `style` attribute and must be the only part in the attribute.")}render(e){return Object.keys(e).reduce((t,n)=>{let r=e[n];return r==null?t:t+`${n=n.includes(`-`)?n:n.replace(/(?:^(webkit|moz|ms|o)|)(?=[A-Z])/g,`-$&`).toLowerCase()}:${r};`},``)}update(e,[t]){let{style:r}=e.element;if(this.ft===void 0)return this.ft=new Set(Object.keys(t)),this.render(t);for(let e of this.ft)t[e]??(this.ft.delete(e),e.includes(`-`)?r.removeProperty(e):r[e]=null);for(let e in t){let n=t[e];if(n!=null){this.ft.add(e);let t=typeof n==`string`&&n.endsWith(c);e.includes(`-`)||t?r.setProperty(e,t?n.slice(0,-11):n,t?s:``):r[e]=n}}return n}})})))()}function d(){return(d=e((()=>{u()})))()}var f;function p(){return(p=e((()=>{f=`/**
 * Do not edit directly, this file was auto-generated.
 */

:root {
  /* Color / Neutrals */
  --s2a-color-gray-25: #fff;
  --s2a-color-gray-50: #f8f8f8;
  --s2a-color-gray-75: #f3f3f3;
  --s2a-color-gray-100: #e9e9e9;
  --s2a-color-gray-200: #e1e1e1;
  --s2a-color-gray-300: #dadada;
  --s2a-color-gray-400: #c6c6c6;
  --s2a-color-gray-500: #8f8f8f;
  --s2a-color-gray-600: #717171;
  --s2a-color-gray-700: #505050;
  --s2a-color-gray-800: #292929;
  --s2a-color-gray-900: #131313;
  --s2a-color-gray-1000: #000;

  /* Color / Green */
  --s2a-color-green-100: #edfcf1;
  --s2a-color-green-200: #d7f7e1;
  --s2a-color-green-300: #adeec5;
  --s2a-color-green-400: #6be3a2;
  --s2a-color-green-500: #2bd17d;
  --s2a-color-green-600: #12b867;
  --s2a-color-green-700: #0ba45d;
  --s2a-color-green-800: #079355;
  --s2a-color-green-900: #05834e;
  --s2a-color-green-1000: #036e45;
  --s2a-color-green-1100: #025d3c;
  --s2a-color-green-1200: #014c34;
  --s2a-color-green-1300: #003d2c;
  --s2a-color-green-1400: #002e22;
  --s2a-color-green-1500: #002119;
  --s2a-color-green-1600: #000f0c;

  /* Color / Blue */
  --s2a-color-blue-100: #f5f9ff;
  --s2a-color-blue-200: #e5f0fe;
  --s2a-color-blue-300: #cbe2fe;
  --s2a-color-blue-400: #accffd;
  --s2a-color-blue-500: #8eb9fc;
  --s2a-color-blue-600: #729efd;
  --s2a-color-blue-700: #5d89ff;
  --s2a-color-blue-800: #4b75ff;
  --s2a-color-blue-900: #3b63fb;
  --s2a-color-blue-1000: #274dea;
  --s2a-color-blue-1100: #1d3ecf;
  --s2a-color-blue-1200: #1532ad;
  --s2a-color-blue-1300: #10288c;
  --s2a-color-blue-1400: #0c1f69;
  --s2a-color-blue-1500: #0e1843;
  --s2a-color-blue-1600: #070b1e;

  /* Color / Red */
  --s2a-color-red-100: #fff6f5;
  --s2a-color-red-200: #ffebe8;
  --s2a-color-red-300: #ffd6d1;
  --s2a-color-red-400: #ffbcb4;
  --s2a-color-red-500: #ff9d91;
  --s2a-color-red-600: #ff7665;
  --s2a-color-red-700: #ff513d;
  --s2a-color-red-800: #f03823;
  --s2a-color-red-900: #d73220;
  --s2a-color-red-1000: #b72818;
  --s2a-color-red-1100: #9c2113;
  --s2a-color-red-1200: #811b0e;
  --s2a-color-red-1300: #68150a;
  --s2a-color-red-1400: #501006;
  --s2a-color-red-1500: #3b0b04;
  --s2a-color-red-1600: #1d0502;

  /* Color / Orange */
  --s2a-color-orange-100: #fff6e7;
  --s2a-color-orange-200: #ffeccf;
  --s2a-color-orange-300: #ffda9e;
  --s2a-color-orange-400: #ffc15e;
  --s2a-color-orange-500: #ffa213;
  --s2a-color-orange-600: #fc7d00;
  --s2a-color-orange-700: #e86a00;
  --s2a-color-orange-800: #d45b00;
  --s2a-color-orange-900: #c24e00;
  --s2a-color-orange-1000: #a73e00;
  --s2a-color-orange-1100: #903300;
  --s2a-color-orange-1200: #762900;
  --s2a-color-orange-1300: #5f2000;
  --s2a-color-orange-1400: #491800;
  --s2a-color-orange-1500: #341200;
  --s2a-color-orange-1600: #190800;

  /* Color / Yellow */
  --s2a-color-yellow-100: #fff8cc;
  --s2a-color-yellow-200: #fff197;
  --s2a-color-yellow-300: #ffde2c;
  --s2a-color-yellow-400: #f5c700;
  --s2a-color-yellow-500: #e6af00;
  --s2a-color-yellow-600: #d29500;
  --s2a-color-yellow-700: #c18300;
  --s2a-color-yellow-800: #af7400;
  --s2a-color-yellow-900: #9e6600;
  --s2a-color-yellow-1000: #865500;
  --s2a-color-yellow-1100: #724800;
  --s2a-color-yellow-1200: #5d3b00;
  --s2a-color-yellow-1300: #4b2f00;
  --s2a-color-yellow-1400: #382300;
  --s2a-color-yellow-1500: #281900;
  --s2a-color-yellow-1600: #120b00;

  /* Color / Transparent */
  --s2a-color-transparent-black-00: rgb(0 0 0 / 0);
  --s2a-color-transparent-white-00: rgb(255 255 255 / 0);
  --s2a-color-transparent-black-04: rgb(0 0 0 / 4%);
  --s2a-color-transparent-white-04: rgb(255 255 255 / 4%);
  --s2a-color-transparent-black-08: rgb(0 0 0 / 8%);
  --s2a-color-transparent-white-08: rgb(255 255 255 / 8%);
  --s2a-color-transparent-black-12: rgb(0 0 0 / 12%);
  --s2a-color-transparent-white-12: rgb(255 255 255 / 12%);
  --s2a-color-transparent-black-16: rgb(0 0 0 / 16%);
  --s2a-color-transparent-white-16: rgb(255 255 255 / 16%);
  --s2a-color-transparent-black-24: rgb(0 0 0 / 24%);
  --s2a-color-transparent-white-24: rgb(255 255 255 / 24%);
  --s2a-color-transparent-black-32: rgb(0 0 0 / 32%);
  --s2a-color-transparent-white-32: rgb(255 255 255 / 32%);
  --s2a-color-transparent-black-48: rgb(0 0 0 / 48%);
  --s2a-color-transparent-white-48: rgb(255 255 255 / 48%);
  --s2a-color-transparent-black-64: rgb(0 0 0 / 64%);
  --s2a-color-transparent-white-64: rgb(255 255 255 / 64%);
  --s2a-color-transparent-black-72: rgb(0 0 0 / 72%);
  --s2a-color-transparent-white-72: rgb(255 255 255 / 72%);
  --s2a-color-transparent-black-80: rgb(0 0 0 / 80%);
  --s2a-color-transparent-white-80: rgb(255 255 255 / 80%);
  --s2a-color-transparent-black-88: rgb(0 0 0 / 88%);
  --s2a-color-transparent-white-88: rgb(255 255 255 / 88%);
  --s2a-color-transparent-black-96: rgb(0 0 0 / 96%);
  --s2a-color-transparent-white-96: rgb(255 255 255 / 96%);

  /* Color / Brand */
  --s2a-color-brand-adobe-red: #eb1000;
  --s2a-color-brand-cc-3dar: #99e83f;
  --s2a-color-brand-cc-il: #ff9a00;
  --s2a-color-brand-cc-ppafx: #99f;
  --s2a-color-brand-cc-ps: #3a18ff;

  /* Border Radius */
  --s2a-border-radius-0: 0;
  --s2a-border-radius-2: 2px;
  --s2a-border-radius-4: 4px;
  --s2a-border-radius-6: 6px;
  --s2a-border-radius-8: 8px;
  --s2a-border-radius-12: 12px;
  --s2a-border-radius-16: 16px;
  --s2a-border-radius-22: 22px;
  --s2a-border-radius-24: 24px;
  --s2a-border-radius-32: 32px;
  --s2a-border-radius-999: 999px;

  /* Border Width */
  --s2a-border-width-0: 0;
  --s2a-border-width-1: 1px;
  --s2a-border-width-2: 2px;
  --s2a-border-width-4: 4px;

  /* Opacity */
  --s2a-opacity-00: 0;
  --s2a-opacity-08: 8%;
  --s2a-opacity-16: 16%;
  --s2a-opacity-24: 24%;
  --s2a-opacity-32: 32%;
  --s2a-opacity-48: 48%;
  --s2a-opacity-64: 64%;
  --s2a-opacity-100: 100%;

  /* Shadow */
  --s2a-shadow-level-1-x: 0;
  --s2a-shadow-level-1-y: 1px;
  --s2a-shadow-level-1-blur: 6px;
  --s2a-shadow-level-1-spread: 0;
  --s2a-shadow-level-1-color: var(--s2a-color-transparent-black-12);
  --s2a-shadow-level-2-x: 0;
  --s2a-shadow-level-2-y: 2px;
  --s2a-shadow-level-2-blur: 8px;
  --s2a-shadow-level-2-spread: 0;
  --s2a-shadow-level-2-color: var(--s2a-color-transparent-black-16);
  --s2a-shadow-level-3-x: 0;
  --s2a-shadow-level-3-y: 4px;
  --s2a-shadow-level-3-blur: 12px;
  --s2a-shadow-level-3-spread: 0;
  --s2a-shadow-level-3-color: var(--s2a-color-transparent-black-16);
  --s2a-shadow-level-4-x: 0;
  --s2a-shadow-level-4-y: 6px;
  --s2a-shadow-level-4-blur: 16px;
  --s2a-shadow-level-4-spread: 0;
  --s2a-shadow-level-4-color: var(--s2a-color-transparent-black-16);

  /* Spacing */
  --s2a-spacing-0: 0;
  --s2a-spacing-2: 2px;
  --s2a-spacing-4: 4px;
  --s2a-spacing-8: 8px;
  --s2a-spacing-12: 12px;
  --s2a-spacing-16: 16px;
  --s2a-spacing-20: 20px;
  --s2a-spacing-24: 24px;
  --s2a-spacing-32: 32px;
  --s2a-spacing-40: 40px;
  --s2a-spacing-48: 48px;
  --s2a-spacing-64: 64px;
  --s2a-spacing-80: 80px;
  --s2a-spacing-96: 96px;
  --s2a-spacing-124: 124px; /** DEPRECATED — use spacing/128 instead. Retained temporarily because Milo still references 124px; do not use in new work. Remove once Milo migrates off it. (MWPW-202891) */
  --s2a-spacing-128: 128px;
  --s2a-spacing-160: 160px;
  --s2a-spacing-240: 240px;

  /* Font Family */
  --s2a-font-family-adobe-clean: "Adobe Clean";
  --s2a-font-family-adobe-clean-display: "Adobe Clean Display";

  /* Font Letter Spacing */
  --s2a-font-letter-spacing-neg-3_84: -3.84px;
  --s2a-font-letter-spacing-neg-3_2: -3.2px;
  --s2a-font-letter-spacing-neg-2_88: -2.88px;
  --s2a-font-letter-spacing-neg-1_68: -1.68px;
  --s2a-font-letter-spacing-neg-1_44: -1.44px;
  --s2a-font-letter-spacing-neg-1: -1px;
  --s2a-font-letter-spacing-neg-0_96: -0.96px;
  --s2a-font-letter-spacing-neg-0_48: -0.48px;
  --s2a-font-letter-spacing-neg-0_2: -0.2px;
  --s2a-font-letter-spacing-neg-0_16: -0.16px; /** Letter spacing primitive: -0.16px */
  --s2a-font-letter-spacing-0: 0;

  /* Font Line Height */
  --s2a-font-line-height-16: 16px;
  --s2a-font-line-height-18: 18px;
  --s2a-font-line-height-20: 20px;
  --s2a-font-line-height-21: 21px;
  --s2a-font-line-height-24: 24px;
  --s2a-font-line-height-32: 32px;
  --s2a-font-line-height-40: 40px;
  --s2a-font-line-height-48: 48px;
  --s2a-font-line-height-56: 56px;
  --s2a-font-line-height-69: 69px;
  --s2a-font-line-height-76: 76px;
  --s2a-font-line-height-92: 92px;

  /* Font Size */
  --s2a-font-size-12: 0.75rem;
  --s2a-font-size-14: 0.875rem;
  --s2a-font-size-16: 1rem;
  --s2a-font-size-18: 1.125rem;
  --s2a-font-size-20: 1.25rem;
  --s2a-font-size-24: 1.5rem;
  --s2a-font-size-32: 2rem;
  --s2a-font-size-36: 2.25rem;
  --s2a-font-size-40: 2.5rem;
  --s2a-font-size-48: 3rem;
  --s2a-font-size-56: 3.5rem;
  --s2a-font-size-64: 4rem;
  --s2a-font-size-72: 4.5rem;
  --s2a-font-size-80: 5rem;
  --s2a-font-size-96: 6rem;

  /* Font Weight */
  --s2a-font-weight-adobe-clean-regular: 400;
  --s2a-font-weight-adobe-clean-medium: 500;
  --s2a-font-weight-adobe-clean-extrabold: 800;
  --s2a-font-weight-adobe-clean-bold: 700;
  --s2a-font-weight-adobe-clean-black: 900;
  --s2a-font-weight-adobe-clean-display-black: 900;

  /* Blur */
  --s2a-blur-8: 8px;
  --s2a-blur-16: 16px;
  --s2a-blur-24: 24px;
  --s2a-blur-32: 32px;
  --s2a-blur-64: 64px;
  --s2a-blur-128: 128px;
}
`})))()}var m;function h(){return(h=e((()=>{m=`/**
 * Do not edit directly, this file was auto-generated.
 */

:root {
  /* Border Radius */
  --s2a-border-radius-2xs: var(--s2a-border-radius-4);
  --s2a-border-radius-xs: var(--s2a-border-radius-8);
  --s2a-border-radius-sm: var(--s2a-border-radius-12);
  --s2a-border-radius-md: var(--s2a-border-radius-16);
  --s2a-border-radius-lg: var(--s2a-border-radius-22);
  --s2a-border-radius-xl: var(--s2a-border-radius-32);
  --s2a-border-radius-3xs: var(--s2a-border-radius-2);
  --s2a-border-radius-none: var(--s2a-border-radius-0);
  --s2a-border-radius-round: var(--s2a-border-radius-999);

  /* Border Width */
  --s2a-border-width-sm: var(--s2a-border-width-1);
  --s2a-border-width-md: var(--s2a-border-width-2);
  --s2a-border-width-lg: var(--s2a-border-width-4);

  /* Opacity */
  --s2a-opacity-disabled: var(--s2a-opacity-48);
  --s2a-opacity-scrim-strong: var(--s2a-opacity-64);
  --s2a-opacity-scrim-subtle: var(--s2a-opacity-32);

  /* Spacing */
  --s2a-spacing-2xs: var(--s2a-spacing-4);
  --s2a-spacing-xs: var(--s2a-spacing-8);
  --s2a-spacing-sm: var(--s2a-spacing-12);
  --s2a-spacing-md: var(--s2a-spacing-16);
  --s2a-spacing-lg: var(--s2a-spacing-24);
  --s2a-spacing-xl: var(--s2a-spacing-32);
  --s2a-spacing-2xl: var(--s2a-spacing-40);
  --s2a-spacing-3xl: var(--s2a-spacing-48);
  --s2a-spacing-4xl: var(--s2a-spacing-64);
  --s2a-spacing-3xs: var(--s2a-spacing-2);
  --s2a-spacing-none: var(--s2a-spacing-0);

  /* Font Family */
  --s2a-font-family-body: var(--s2a-font-family-adobe-clean);
  --s2a-font-family-caption: var(--s2a-font-family-adobe-clean);
  --s2a-font-family-default: var(--s2a-font-family-adobe-clean);
  --s2a-font-family-eyebrow: var(--s2a-font-family-adobe-clean);
  --s2a-font-family-heading: var(--s2a-font-family-adobe-clean-display);
  --s2a-font-family-label: var(--s2a-font-family-adobe-clean);
  --s2a-font-family-subheading: var(--s2a-font-family-adobe-clean-display);

  /* Font Letter Spacing */
  --s2a-font-letter-spacing-xs: var(--s2a-font-letter-spacing-neg-3_84);
  --s2a-font-letter-spacing-sm: var(--s2a-font-letter-spacing-neg-3_2);
  --s2a-font-letter-spacing-md: var(--s2a-font-letter-spacing-neg-2_88);
  --s2a-font-letter-spacing-lg: var(--s2a-font-letter-spacing-neg-1_68);
  --s2a-font-letter-spacing-xl: var(--s2a-font-letter-spacing-neg-1_44);
  --s2a-font-letter-spacing-2xl: var(--s2a-font-letter-spacing-neg-1);
  --s2a-font-letter-spacing-3xl: var(--s2a-font-letter-spacing-neg-0_96);
  --s2a-font-letter-spacing-4xl: var(--s2a-font-letter-spacing-neg-0_48);
  --s2a-font-letter-spacing-5xl: var(--s2a-font-letter-spacing-neg-0_2);
  --s2a-font-letter-spacing-6xl: var(--s2a-font-letter-spacing-0);

  /* Font Line Height */
  --s2a-font-line-height-2xs: var(--s2a-font-line-height-16);
  --s2a-font-line-height-xs: var(--s2a-font-line-height-18);
  --s2a-font-line-height-sm: var(--s2a-font-line-height-20);
  --s2a-font-line-height-md: var(--s2a-font-line-height-24);
  --s2a-font-line-height-lg: var(--s2a-font-line-height-32);
  --s2a-font-line-height-xl: var(--s2a-font-line-height-40);
  --s2a-font-line-height-2xl: var(--s2a-font-line-height-48);
  --s2a-font-line-height-3xl: var(--s2a-font-line-height-56);
  --s2a-font-line-height-4xl: var(--s2a-font-line-height-69);
  --s2a-font-line-height-5xl: var(--s2a-font-line-height-76);
  --s2a-font-line-height-6xl: var(--s2a-font-line-height-92);

  /* Font Size */
  --s2a-font-size-xs: var(--s2a-font-size-12);
  --s2a-font-size-sm: var(--s2a-font-size-14);
  --s2a-font-size-md: var(--s2a-font-size-16);
  --s2a-font-size-lg: var(--s2a-font-size-18);
  --s2a-font-size-xl: var(--s2a-font-size-20);
  --s2a-font-size-2xl: var(--s2a-font-size-24);
  --s2a-font-size-3xl: var(--s2a-font-size-32);
  --s2a-font-size-4xl: var(--s2a-font-size-36);
  --s2a-font-size-5xl: var(--s2a-font-size-40);
  --s2a-font-size-6xl: var(--s2a-font-size-48);
  --s2a-font-size-7xl: var(--s2a-font-size-56);
  --s2a-font-size-8xl: var(--s2a-font-size-64);
  --s2a-font-size-9xl: var(--s2a-font-size-72);
  --s2a-font-size-10xl: var(--s2a-font-size-80);
  --s2a-font-size-11xl: var(--s2a-font-size-96);

  /* Font Weight */
  --s2a-font-weight-heading: var(--s2a-font-weight-adobe-clean-display-black);
  --s2a-font-weight-body: var(--s2a-font-weight-adobe-clean-regular);
  --s2a-font-weight-eyebrow: var(--s2a-font-weight-adobe-clean-bold);
  --s2a-font-weight-label: var(--s2a-font-weight-adobe-clean-bold);
  --s2a-font-weight-caption: var(--s2a-font-weight-adobe-clean-bold);

  /* Blur */
  --s2a-blur-xs: var(--s2a-blur-8);
  --s2a-blur-sm: var(--s2a-blur-16);
  --s2a-blur-md: var(--s2a-blur-32);
  --s2a-blur-lg: var(--s2a-blur-64);

  /* Layout */
  --s2a-layout-sm: var(--s2a-spacing-80);
  --s2a-layout-md: var(--s2a-spacing-96);
  --s2a-layout-lg: var(--s2a-spacing-128);
  --s2a-layout-xl: var(--s2a-spacing-160);
  --s2a-layout-2xl: var(--s2a-spacing-240);
  --s2a-layout-none: var(--s2a-spacing-0);
}
`})))()}var g;function _(){return(_=e((()=>{g=`/**
 * Do not edit directly, this file was auto-generated.
 */

:root, :root[data-theme="light"] {
  /* Color / Background */
  --s2a-color-background-brand: var(--s2a-color-brand-adobe-red);
  --s2a-color-background-default: var(--s2a-color-gray-25);
  --s2a-color-background-disabled: var(--s2a-color-gray-50);
  --s2a-color-background-inverse: var(--s2a-color-gray-1000);
  --s2a-color-background-knockout: var(--s2a-color-gray-1000);
  --s2a-color-background-subtle: var(--s2a-color-gray-50);
  --s2a-color-background-utility-error: var(--s2a-color-red-900);

  /* Color / Border */
  --s2a-color-border-accent: #3b63fb; /** Accent border/indicator color (Adobe accent blue). Used for selected-state borders like the tab underline. Fills the gap where S2A had no semantic accent — the blue previously only lived in button/icon-button component tokens. */
  --s2a-color-border-brand: var(--s2a-color-brand-adobe-red);
  --s2a-color-border-default: var(--s2a-color-gray-800);
  --s2a-color-border-disabled: var(--s2a-color-gray-400);
  --s2a-color-border-inverse: var(--s2a-color-gray-25);
  --s2a-color-border-knockout: var(--s2a-color-gray-1000);
  --s2a-color-border-strong: var(--s2a-color-gray-900);
  --s2a-color-border-subtle: var(--s2a-color-gray-300);
  --s2a-color-border-utility-error: var(--s2a-color-red-900);

  /* Color / Content */
  --s2a-color-content-body-strong: var(--s2a-color-content-strong); /** This is for text */
  --s2a-color-content-body-subtle: var(--s2a-color-content-subtle); /** text subtle */
  --s2a-color-content-brand: var(--s2a-color-brand-adobe-red);
  --s2a-color-content-caption: var(--s2a-color-content-subtle);
  --s2a-color-content-default: var(--s2a-color-gray-1000);
  --s2a-color-content-disabled: var(--s2a-color-gray-400);
  --s2a-color-content-eyebrow: var(--s2a-color-transparent-black-64);
  --s2a-color-content-heading: var(--s2a-color-content-default);
  --s2a-color-content-inverse: var(--s2a-color-gray-1000); /** Text and icon color for content on always-light surfaces — surfaces that stay light regardless of page or section mode (e.g. active state pills, surface-default cards used in a dark context). Resolves to the same dark value in both Light and Dark modes. Counterpart to content/knockout, which is always white for always-dark surfaces. */
  --s2a-color-content-knockout: var(--s2a-color-gray-25);
  --s2a-color-content-label: var(--s2a-color-content-default);
  --s2a-color-content-on-inverse: var(--s2a-color-gray-25); /** Text and icon color for content on always-light surfaces — surfaces that stay light regardless of page or section mode (e.g. active state pills, surface-default cards used in a dark context). Resolves to the same dark value in both Light and Dark modes. Counterpart to content/knockout, which is always white for always-dark surfaces. */
  --s2a-color-content-on-inverse-subtle: var(--s2a-color-transparent-white-64); /** Text and icon color for content on always-light surfaces — surfaces that stay light regardless of page or section mode (e.g. active state pills, surface-default cards used in a dark context). Resolves to the same dark value in both Light and Dark modes. Counterpart to content/knockout, which is always white for always-dark surfaces. */
  --s2a-color-content-strong: var(--s2a-color-gray-900);
  --s2a-color-content-subheading: var(--s2a-color-gray-1000);
  --s2a-color-content-subtle: var(--s2a-color-transparent-black-64);
  --s2a-color-content-utility-error: var(--s2a-color-red-900);

  /* Color / Focus Ring */
  --s2a-color-focus-ring-default: var(--s2a-color-blue-900);
  --s2a-color-focus-ring-knockout: var(--s2a-color-gray-25);

  /* Other */
  --s2a-color-button-background-accent-active: var(--s2a-color-blue-1100); /** Phase 1 — simplified mode-responsive token. Replaces on-light/on-dark Context variants. */
  --s2a-color-button-background-accent-default: var(--s2a-color-blue-900); /** Phase 1 — simplified mode-responsive token. Replaces on-light/on-dark Context variants. */
  --s2a-color-button-background-accent-hover: var(--s2a-color-blue-1000); /** Phase 1 — simplified mode-responsive token. Replaces on-light/on-dark Context variants. */
  --s2a-color-button-background-accent-solid-on-light-active: var(--s2a-color-blue-1100); /** DEPRECATED — replaced by simplified mode-responsive token (no on-light/on-dark segment). Will be renamed to _deprecated/ path once all component bindings are migrated. Removal target: v1 token release. */
  --s2a-color-button-background-accent-solid-on-light-default: var(--s2a-color-blue-900); /** DEPRECATED — replaced by simplified mode-responsive token (no on-light/on-dark segment). Will be renamed to _deprecated/ path once all component bindings are migrated. Removal target: v1 token release. */
  --s2a-color-button-background-accent-solid-on-light-hover: var(--s2a-color-blue-1000); /** DEPRECATED — replaced by simplified mode-responsive token (no on-light/on-dark segment). Will be renamed to _deprecated/ path once all component bindings are migrated. Removal target: v1 token release. */
  --s2a-color-button-background-knockout-active: var(--s2a-color-gray-100); /** Knockout style — always-white/light bg for use on dark/colored surfaces. */
  --s2a-color-button-background-knockout-default: var(--s2a-color-gray-25); /** Knockout style — always-white/light bg for use on dark/colored surfaces. */
  --s2a-color-button-background-knockout-hover: var(--s2a-color-gray-50); /** Knockout style — always-white/light bg for use on dark/colored surfaces. */
  --s2a-color-button-background-outline-inverse-active: var(--s2a-color-transparent-white-16); /** outline-inverse style — static white values for use on dark/colored surfaces. */
  --s2a-color-button-background-outline-inverse-default: var(--s2a-color-transparent-white-00); /** outline-inverse style — static white values for use on dark/colored surfaces. */
  --s2a-color-button-background-outline-inverse-hover: var(--s2a-color-transparent-white-08); /** outline-inverse style — static white values for use on dark/colored surfaces. */
  --s2a-color-button-background-outlined-active: var(--s2a-color-gray-1000); /** Phase 1 — simplified mode-responsive token. Replaces on-light/on-dark Context variants. */
  --s2a-color-button-background-outlined-default: var(--s2a-color-transparent-white-00); /** Phase 1 — simplified mode-responsive token. Replaces on-light/on-dark Context variants. */
  --s2a-color-button-background-outlined-hover: var(--s2a-color-transparent-black-08); /** Phase 1 — simplified mode-responsive token. Replaces on-light/on-dark Context variants. */
  --s2a-color-button-background-primary-outlined-on-dark-active: var(--s2a-color-gray-25); /** DEPRECATED — replaced by simplified mode-responsive token (no on-light/on-dark segment). Will be renamed to _deprecated/ path once all component bindings are migrated. Removal target: v1 token release. */
  --s2a-color-button-background-primary-outlined-on-dark-hover: var(--s2a-color-transparent-white-64); /** DEPRECATED — replaced by simplified mode-responsive token (no on-light/on-dark segment). Will be renamed to _deprecated/ path once all component bindings are migrated. Removal target: v1 token release. */
  --s2a-color-button-background-primary-outlined-on-light-active: var(--s2a-color-gray-1000); /** DEPRECATED — replaced by simplified mode-responsive token (no on-light/on-dark segment). Will be renamed to _deprecated/ path once all component bindings are migrated. Removal target: v1 token release. */
  --s2a-color-button-background-primary-outlined-on-light-default: var(--s2a-color-transparent-black-00); /** DEPRECATED — replaced by simplified mode-responsive token (no on-light/on-dark segment). Will be renamed to _deprecated/ path once all component bindings are migrated. Removal target: v1 token release. */
  --s2a-color-button-background-primary-outlined-on-light-hover: var(--s2a-color-transparent-black-08); /** DEPRECATED — replaced by simplified mode-responsive token (no on-light/on-dark segment). Will be renamed to _deprecated/ path once all component bindings are migrated. Removal target: v1 token release. */
  --s2a-color-button-background-primary-solid-on-dark-active: var(--s2a-color-gray-25); /** DEPRECATED — replaced by simplified mode-responsive token (no on-light/on-dark segment). Will be renamed to _deprecated/ path once all component bindings are migrated. Removal target: v1 token release. */
  --s2a-color-button-background-primary-solid-on-dark-default: var(--s2a-color-gray-25); /** DEPRECATED — replaced by simplified mode-responsive token (no on-light/on-dark segment). Will be renamed to _deprecated/ path once all component bindings are migrated. Removal target: v1 token release. */
  --s2a-color-button-background-primary-solid-on-dark-hover: var(--s2a-color-transparent-white-64); /** DEPRECATED — replaced by simplified mode-responsive token (no on-light/on-dark segment). Will be renamed to _deprecated/ path once all component bindings are migrated. Removal target: v1 token release. */
  --s2a-color-button-background-primary-solid-on-light-active: var(--s2a-color-gray-1000); /** DEPRECATED — replaced by simplified mode-responsive token (no on-light/on-dark segment). Will be renamed to _deprecated/ path once all component bindings are migrated. Removal target: v1 token release. */
  --s2a-color-button-background-primary-solid-on-light-default: var(--s2a-color-gray-1000); /** DEPRECATED — replaced by simplified mode-responsive token (no on-light/on-dark segment). Will be renamed to _deprecated/ path once all component bindings are migrated. Removal target: v1 token release. */
  --s2a-color-button-background-primary-solid-on-light-hover: var(--s2a-color-transparent-black-64); /** DEPRECATED — replaced by simplified mode-responsive token (no on-light/on-dark segment). Will be renamed to _deprecated/ path once all component bindings are migrated. Removal target: v1 token release. */
  --s2a-color-button-background-primary-transparent-on-dark-active: var(--s2a-color-transparent-white-16); /** DEPRECATED — replaced by simplified mode-responsive token (no on-light/on-dark segment). Will be renamed to _deprecated/ path once all component bindings are migrated. Removal target: v1 token release. */
  --s2a-color-button-background-primary-transparent-on-dark-default: var(--s2a-color-transparent-white-00); /** DEPRECATED — replaced by simplified mode-responsive token (no on-light/on-dark segment). Will be renamed to _deprecated/ path once all component bindings are migrated. Removal target: v1 token release. */
  --s2a-color-button-background-primary-transparent-on-dark-hover: var(--s2a-color-transparent-white-12); /** DEPRECATED — replaced by simplified mode-responsive token (no on-light/on-dark segment). Will be renamed to _deprecated/ path once all component bindings are migrated. Removal target: v1 token release. */
  --s2a-color-button-background-primary-transparent-on-light-active: var(--s2a-color-transparent-black-12); /** DEPRECATED — replaced by simplified mode-responsive token (no on-light/on-dark segment). Will be renamed to _deprecated/ path once all component bindings are migrated. Removal target: v1 token release. */
  --s2a-color-button-background-primary-transparent-on-light-default: var(--s2a-color-transparent-black-00); /** DEPRECATED — replaced by simplified mode-responsive token (no on-light/on-dark segment). Will be renamed to _deprecated/ path once all component bindings are migrated. Removal target: v1 token release. */
  --s2a-color-button-background-primary-transparent-on-light-hover: var(--s2a-color-transparent-black-08); /** DEPRECATED — replaced by simplified mode-responsive token (no on-light/on-dark segment). Will be renamed to _deprecated/ path once all component bindings are migrated. Removal target: v1 token release. */
  --s2a-color-button-background-solid-active: var(--s2a-color-gray-1000); /** Phase 1 — simplified mode-responsive token. Replaces on-light/on-dark Context variants. */
  --s2a-color-button-background-solid-default: var(--s2a-color-gray-1000); /** Phase 1 — simplified mode-responsive token. Replaces on-light/on-dark Context variants. */
  --s2a-color-button-background-solid-hover: var(--s2a-color-transparent-black-64); /** Phase 1 — simplified mode-responsive token. Replaces on-light/on-dark Context variants. */
  --s2a-color-button-background-transparent-active: var(--s2a-color-transparent-black-12); /** Phase 1 — simplified mode-responsive token. Replaces on-light/on-dark Context variants. */
  --s2a-color-button-background-transparent-default: var(--s2a-color-transparent-black-00); /** Phase 1 — simplified mode-responsive token. Replaces on-light/on-dark Context variants. */
  --s2a-color-button-background-transparent-hover: var(--s2a-color-transparent-black-08); /** Phase 1 — simplified mode-responsive token. Replaces on-light/on-dark Context variants. */
  --s2a-color-button-border-knockout-default: var(--s2a-color-gray-25); /** Knockout button border — always white. White border on white bg for knockout style. */
  --s2a-color-button-border-outline-inverse-default: var(--s2a-color-gray-25); /** outline-inverse style — static white values for use on dark/colored surfaces. */
  --s2a-color-button-border-outlined-default: var(--s2a-color-gray-1000); /** DEPRECATED — replaced by s2a/color/border/knockout (same primitives, gray/1000 Light / gray/25 Dark). Will be renamed to _deprecated/ path once all bindings are migrated. Removal target: v1 token release. */
  --s2a-color-button-border-primary-outlined-on-dark-default: var(--s2a-color-gray-25); /** DEPRECATED — replaced by simplified mode-responsive token (no on-light/on-dark segment). Will be renamed to _deprecated/ path once all component bindings are migrated. Removal target: v1 token release. */
  --s2a-color-button-border-primary-outlined-on-light-default: var(--s2a-color-gray-1000); /** DEPRECATED — replaced by simplified mode-responsive token (no on-light/on-dark segment). Will be renamed to _deprecated/ path once all component bindings are migrated. Removal target: v1 token release. */
  --s2a-color-button-border-primary-solid-on-dark-default: var(--s2a-color-gray-25); /** DEPRECATED — replaced by simplified mode-responsive token (no on-light/on-dark segment). Will be renamed to _deprecated/ path once all component bindings are migrated. Removal target: v1 token release. */
  --s2a-color-button-border-primary-solid-on-dark-hover: var(--s2a-color-gray-25); /** DEPRECATED — replaced by simplified mode-responsive token (no on-light/on-dark segment). Will be renamed to _deprecated/ path once all component bindings are migrated. Removal target: v1 token release. */
  --s2a-color-button-border-primary-solid-on-light-default: var(--s2a-color-gray-1000); /** DEPRECATED — replaced by simplified mode-responsive token (no on-light/on-dark segment). Will be renamed to _deprecated/ path once all component bindings are migrated. Removal target: v1 token release. */
  --s2a-color-button-border-solid-default: var(--s2a-color-gray-1000); /** DEPRECATED — replaced by s2a/color/border/knockout (same primitives, gray/1000 Light / gray/25 Dark). Will be renamed to _deprecated/ path once all bindings are migrated. Removal target: v1 token release. */
  --s2a-color-button-content-accent-default: var(--s2a-color-gray-25); /** DEPRECATED — replaced by s2a/color/content/inverse (solid), content/default (outlined, transparent), content/knockout (accent). Will be renamed to _deprecated/ path once all bindings are migrated. Removal target: v1 token release. */
  --s2a-color-button-content-knockout: var(--s2a-color-gray-1000); /** Knockout button text — always near-black. Pairs with white button bg on dark surfaces. */
  --s2a-color-button-content-outline-inverse: var(--s2a-color-gray-25); /** outline-inverse button text — always white. For use on dark/colored surfaces. */
  --s2a-color-button-content-outlined-active: var(--s2a-color-gray-25); /** DEPRECATED — replaced by s2a/color/content/inverse (solid), content/default (outlined, transparent), content/knockout (accent). Will be renamed to _deprecated/ path once all bindings are migrated. Removal target: v1 token release. */
  --s2a-color-button-content-outlined-default: var(--s2a-color-gray-1000); /** DEPRECATED — replaced by s2a/color/content/inverse (solid), content/default (outlined, transparent), content/knockout (accent). Will be renamed to _deprecated/ path once all bindings are migrated. Removal target: v1 token release. */
  --s2a-color-button-content-primary-outlined-default: var(--s2a-color-gray-1000); /** DEPRECATED — replaced by simplified mode-responsive token (no primary/ segment). Will be renamed to _deprecated/ path once all component bindings are migrated. Removal target: v1 token release. */
  --s2a-color-button-content-primary-outlined-knockout: var(--s2a-color-gray-25); /** DEPRECATED — replaced by simplified mode-responsive token (no primary/ segment). Will be renamed to _deprecated/ path once all component bindings are migrated. Removal target: v1 token release. */
  --s2a-color-button-content-primary-solid-default: var(--s2a-color-gray-25); /** DEPRECATED — replaced by simplified mode-responsive token (no primary/ segment). Will be renamed to _deprecated/ path once all component bindings are migrated. Removal target: v1 token release. */
  --s2a-color-button-content-primary-solid-inverse: var(--s2a-color-gray-1000); /** DEPRECATED — replaced by simplified mode-responsive token (no primary/ segment). Will be renamed to _deprecated/ path once all component bindings are migrated. Removal target: v1 token release. */
  --s2a-color-button-content-primary-transparent-default: var(--s2a-color-gray-1000); /** DEPRECATED — replaced by simplified mode-responsive token (no primary/ segment). Will be renamed to _deprecated/ path once all component bindings are migrated. Removal target: v1 token release. */
  --s2a-color-button-content-primary-transparent-knockout: var(--s2a-color-gray-25); /** DEPRECATED — replaced by simplified mode-responsive token (no primary/ segment). Will be renamed to _deprecated/ path once all component bindings are migrated. Removal target: v1 token release. */
  --s2a-color-button-content-solid-default: var(--s2a-color-gray-25); /** DEPRECATED — replaced by s2a/color/content/inverse (solid), content/default (outlined, transparent), content/knockout (accent). Will be renamed to _deprecated/ path once all bindings are migrated. Removal target: v1 token release. */
  --s2a-color-button-content-transparent-default: var(--s2a-color-gray-1000); /** DEPRECATED — replaced by s2a/color/content/inverse (solid), content/default (outlined, transparent), content/knockout (accent). Will be renamed to _deprecated/ path once all bindings are migrated. Removal target: v1 token release. */
  --s2a-color-control-button-background-media-active: var(--s2a-color-transparent-black-96);
  --s2a-color-control-button-background-media-default: var(--s2a-color-transparent-black-64);
  --s2a-color-control-button-background-media-disabled: var(--s2a-color-transparent-black-32);
  --s2a-color-control-button-background-media-focus: var(--s2a-color-transparent-black-64);
  --s2a-color-control-button-background-media-hover: var(--s2a-color-transparent-black-80);
  --s2a-color-control-button-background-solid-active: var(--s2a-color-gray-1000);
  --s2a-color-control-button-background-solid-default: var(--s2a-color-gray-75);
  --s2a-color-control-button-background-solid-disabled: var(--s2a-color-transparent-black-04);
  --s2a-color-control-button-background-solid-focus: var(--s2a-color-transparent-black-04);
  --s2a-color-control-button-background-solid-hover: var(--s2a-color-gray-300);
  --s2a-color-control-button-background-transparent-active: var(--s2a-color-transparent-white-08);
  --s2a-color-control-button-background-transparent-default: var(--s2a-color-transparent-white-32);
  --s2a-color-control-button-background-transparent-disabled: var(--s2a-color-transparent-white-16);
  --s2a-color-control-button-background-transparent-focus: var(--s2a-color-transparent-white-32);
  --s2a-color-control-button-background-transparent-hover: var(--s2a-color-transparent-white-16);
  --s2a-color-control-button-border-media: var(--s2a-color-transparent-white-24);
  --s2a-color-control-button-border-solid-active: var(--s2a-color-gray-700);
  --s2a-color-control-button-border-solid-default: var(--s2a-color-transparent-white-24);
  --s2a-color-control-button-border-solid-disabled: var(--s2a-color-transparent-black-08);
  --s2a-color-control-button-border-solid-focus: var(--s2a-color-transparent-black-08);
  --s2a-color-control-button-border-solid-hover: var(--s2a-color-gray-400);
  --s2a-color-control-button-border-transparent-disabled: var(--s2a-color-transparent-white-16);
  --s2a-color-divider-default: var(--s2a-color-gray-800);
  --s2a-color-divider-inverse: var(--s2a-color-gray-25);
  --s2a-color-divider-knockout: var(--s2a-color-gray-1000);
  --s2a-color-divider-strong: var(--s2a-color-gray-900);
  --s2a-color-divider-subtle: var(--s2a-color-transparent-black-12);
  --s2a-color-divider-subtle-inverse: var(--s2a-color-transparent-white-16);
  --s2a-color-icon-button-background-accent-solid-on-light-active: var(--s2a-color-blue-1100); /** DEPRECATED — replaced by iconbutton/* simplified tokens. Will be removed in a future token release. */
  --s2a-color-icon-button-background-accent-solid-on-light-default: var(--s2a-color-blue-900); /** DEPRECATED — replaced by iconbutton/* simplified tokens. Will be removed in a future token release. */
  --s2a-color-icon-button-background-accent-solid-on-light-hover: var(--s2a-color-blue-1000); /** DEPRECATED — replaced by iconbutton/* simplified tokens. Will be removed in a future token release. */
  --s2a-color-icon-button-background-knockout-active: var(--s2a-color-gray-100); /** Simplified mode-responsive token. Replaces icon-button/background/primary/* and icon-button/content/primary/* deprecated tokens. */
  --s2a-color-icon-button-background-knockout-default: var(--s2a-color-gray-25); /** Simplified mode-responsive token. Replaces icon-button/background/primary/* and icon-button/content/primary/* deprecated tokens. */
  --s2a-color-icon-button-background-knockout-hover: var(--s2a-color-gray-50); /** Simplified mode-responsive token. Replaces icon-button/background/primary/* and icon-button/content/primary/* deprecated tokens. */
  --s2a-color-icon-button-background-primary-outlined-on-dark-active: var(--s2a-color-gray-25); /** DEPRECATED — replaced by iconbutton/* simplified tokens. Will be removed in a future token release. */
  --s2a-color-icon-button-background-primary-outlined-on-dark-default: var(--s2a-color-transparent-white-00); /** DEPRECATED — replaced by iconbutton/* simplified tokens. Will be removed in a future token release. */
  --s2a-color-icon-button-background-primary-outlined-on-dark-hover: var(--s2a-color-transparent-white-64); /** DEPRECATED — replaced by iconbutton/* simplified tokens. Will be removed in a future token release. */
  --s2a-color-icon-button-background-primary-outlined-on-light-active: var(--s2a-color-gray-1000); /** DEPRECATED — replaced by iconbutton/* simplified tokens. Will be removed in a future token release. */
  --s2a-color-icon-button-background-primary-outlined-on-light-default: var(--s2a-color-transparent-black-00); /** DEPRECATED — replaced by iconbutton/* simplified tokens. Will be removed in a future token release. */
  --s2a-color-icon-button-background-primary-outlined-on-light-hover: var(--s2a-color-transparent-black-08); /** DEPRECATED — replaced by iconbutton/* simplified tokens. Will be removed in a future token release. */
  --s2a-color-icon-button-background-primary-solid-on-dark-active: var(--s2a-color-gray-25); /** DEPRECATED — replaced by iconbutton/* simplified tokens. Will be removed in a future token release. */
  --s2a-color-icon-button-background-primary-solid-on-dark-default: var(--s2a-color-gray-25); /** DEPRECATED — replaced by iconbutton/* simplified tokens. Will be removed in a future token release. */
  --s2a-color-icon-button-background-primary-solid-on-dark-hover: var(--s2a-color-transparent-white-64); /** DEPRECATED — replaced by iconbutton/* simplified tokens. Will be removed in a future token release. */
  --s2a-color-icon-button-background-primary-solid-on-light-active: var(--s2a-color-gray-1000); /** DEPRECATED — replaced by iconbutton/* simplified tokens. Will be removed in a future token release. */
  --s2a-color-icon-button-background-primary-solid-on-light-default: var(--s2a-color-gray-1000); /** DEPRECATED — replaced by iconbutton/* simplified tokens. Will be removed in a future token release. */
  --s2a-color-icon-button-background-primary-solid-on-light-hover: var(--s2a-color-transparent-black-64); /** DEPRECATED — replaced by iconbutton/* simplified tokens. Will be removed in a future token release. */
  --s2a-color-icon-button-background-primary-transparent-on-dark-active: var(--s2a-color-transparent-white-16); /** DEPRECATED — replaced by iconbutton/* simplified tokens. Will be removed in a future token release. */
  --s2a-color-icon-button-background-primary-transparent-on-dark-default: var(--s2a-color-transparent-white-00); /** DEPRECATED — replaced by iconbutton/* simplified tokens. Will be removed in a future token release. */
  --s2a-color-icon-button-background-primary-transparent-on-dark-hover: var(--s2a-color-transparent-white-12); /** DEPRECATED — replaced by iconbutton/* simplified tokens. Will be removed in a future token release. */
  --s2a-color-icon-button-background-primary-transparent-on-light-active: var(--s2a-color-transparent-black-12); /** DEPRECATED — replaced by iconbutton/* simplified tokens. Will be removed in a future token release. */
  --s2a-color-icon-button-background-primary-transparent-on-light-default: var(--s2a-color-transparent-black-00); /** DEPRECATED — replaced by iconbutton/* simplified tokens. Will be removed in a future token release. */
  --s2a-color-icon-button-background-primary-transparent-on-light-hover: var(--s2a-color-transparent-black-08); /** DEPRECATED — replaced by iconbutton/* simplified tokens. Will be removed in a future token release. */
  --s2a-color-icon-button-background-solid-active: var(--s2a-color-gray-1000); /** Simplified mode-responsive token. Replaces icon-button/background/primary/* and icon-button/content/primary/* deprecated tokens. */
  --s2a-color-icon-button-background-solid-default: var(--s2a-color-gray-1000); /** Simplified mode-responsive token. Replaces icon-button/background/primary/* and icon-button/content/primary/* deprecated tokens. */
  --s2a-color-icon-button-background-solid-hover: var(--s2a-color-transparent-black-64); /** Simplified mode-responsive token. Replaces icon-button/background/primary/* and icon-button/content/primary/* deprecated tokens. */
  --s2a-color-icon-button-background-transparent-active: var(--s2a-color-transparent-black-12); /** Simplified mode-responsive token. Replaces icon-button/background/primary/* and icon-button/content/primary/* deprecated tokens. */
  --s2a-color-icon-button-background-transparent-default: var(--s2a-color-transparent-black-00); /** Simplified mode-responsive token. Replaces icon-button/background/primary/* and icon-button/content/primary/* deprecated tokens. */
  --s2a-color-icon-button-background-transparent-hover: var(--s2a-color-transparent-black-08); /** Simplified mode-responsive token. Replaces icon-button/background/primary/* and icon-button/content/primary/* deprecated tokens. */
  --s2a-color-icon-button-border-primary-outlined-default: var(--s2a-color-gray-1000); /** DEPRECATED — replaced by iconbutton/* simplified tokens. Will be removed in a future token release. */
  --s2a-color-icon-button-border-primary-outlined-on-dark-default: var(--s2a-color-gray-25); /** DEPRECATED — replaced by iconbutton/* simplified tokens. Will be removed in a future token release. */
  --s2a-color-icon-button-border-primary-solid-on-dark-default: var(--s2a-color-gray-25); /** DEPRECATED — replaced by iconbutton/* simplified tokens. Will be removed in a future token release. */
  --s2a-color-icon-button-border-primary-solid-on-light-default: var(--s2a-color-gray-1000); /** DEPRECATED — replaced by iconbutton/* simplified tokens. Will be removed in a future token release. */
  --s2a-color-icon-button-content-knockout: var(--s2a-color-gray-1000); /** Simplified mode-responsive token. Replaces icon-button/background/primary/* and icon-button/content/primary/* deprecated tokens. */
  --s2a-color-icon-button-content-primary-outlined-default: var(--s2a-color-gray-1000); /** DEPRECATED — replaced by iconbutton/* simplified tokens. Will be removed in a future token release. */
  --s2a-color-icon-button-content-primary-outlined-knockout: var(--s2a-color-gray-25); /** DEPRECATED — replaced by iconbutton/* simplified tokens. Will be removed in a future token release. */
  --s2a-color-icon-button-content-primary-solid-default: var(--s2a-color-gray-25); /** DEPRECATED — replaced by iconbutton/* simplified tokens. Will be removed in a future token release. */
  --s2a-color-icon-button-content-primary-solid-inverse: var(--s2a-color-gray-1000); /** DEPRECATED — replaced by iconbutton/* simplified tokens. Will be removed in a future token release. */
  --s2a-color-icon-button-content-primary-transparent-default: var(--s2a-color-gray-1000); /** DEPRECATED — replaced by iconbutton/* simplified tokens. Will be removed in a future token release. */
  --s2a-color-icon-button-content-primary-transparent-knockout: var(--s2a-color-gray-25); /** DEPRECATED — replaced by iconbutton/* simplified tokens. Will be removed in a future token release. */
  --s2a-color-icon-button-content-solid: var(--s2a-color-gray-25); /** Simplified mode-responsive token. Replaces icon-button/background/primary/* and icon-button/content/primary/* deprecated tokens. */
  --s2a-color-icon-button-content-transparent: var(--s2a-color-gray-1000); /** Simplified mode-responsive token. Replaces icon-button/background/primary/* and icon-button/content/primary/* deprecated tokens. */
  --s2a-color-merch-card-highlight-features-background: var(--s2a-color-surface-inverse-subtle); /** Dark features panel on the MerchCard highlight style. Aliases surface/inverse-subtle: dark (gray/900) in Light theme, subtle light (gray/50) in Dark theme. */
  --s2a-color-merch-card-highlight-features-content: var(--s2a-color-content-on-inverse); /** Readable text/icon on the MerchCard highlight features panel. Aliases content/on-inverse: white in Light theme, near-black in Dark theme. Pairs with merch-card/highlight/features/background. */
  --s2a-color-merch-card-highlight-features-content-subtle: var(--s2a-color-content-on-inverse-subtle); /** Secondary text on the MerchCard highlight features panel. Aliases content/on-inverse-subtle. */
  --s2a-color-merch-card-pro-surface: var(--s2a-color-background-knockout);
  --s2a-color-page-default: var(--s2a-color-gray-25);
  --s2a-color-page-inverse: var(--s2a-color-gray-1000);
  --s2a-color-page-subtle: var(--s2a-color-gray-75);
  --s2a-color-promo-cta-background: var(--s2a-color-gray-1000);
  --s2a-color-promo-cta-button-background-active: var(--s2a-color-gray-1000);
  --s2a-color-promo-cta-button-background-default: var(--s2a-color-gray-800);
  --s2a-color-promo-cta-button-background-hover: var(--s2a-color-gray-700);
  --s2a-color-promo-cta-button-background-neutral-on-image-on-dark-active: var(--s2a-color-background-default); /** Deprecated — superseded by promo-cta/button/* tokens (light/dark mode-responsive). Do not use. */
  --s2a-color-promo-cta-button-border-active: var(--s2a-color-transparent-white-24);
  --s2a-color-promo-cta-button-border-default: var(--s2a-color-gray-700);
  --s2a-color-promo-cta-button-border-hover: var(--s2a-color-gray-500);
  --s2a-color-promo-cta-button-icon-active: var(--s2a-color-gray-25);
  --s2a-color-promo-cta-label: var(--s2a-color-gray-25);
  --s2a-color-router-nav-item-background-active: var(--s2a-color-gray-25);
  --s2a-color-router-nav-item-content-active: var(--s2a-color-gray-1000);
  --s2a-color-section-default: var(--s2a-color-gray-25);
  --s2a-color-surface-default: var(--s2a-color-gray-25);
  --s2a-color-surface-inverse: var(--s2a-color-gray-1000); /** Background for surfaces that invert relative to the current page mode — dark in light mode, light in dark mode. Use for expanded or active states where the component flips to contrast against the page (e.g. ElasticCard expanded state). Zero blast radius — safe to evolve. Counterpart: surface/subtle for the resting state. */
  --s2a-color-surface-inverse-subtle: var(--s2a-color-gray-900); /** Background for surfaces that invert relative to the current page mode — dark in light mode, light in dark mode. Use for expanded or active states where the component flips to contrast against the page (e.g. ElasticCard expanded state). Zero blast radius — safe to evolve. Counterpart: surface/subtle for the resting state. */
  --s2a-color-surface-knockout: var(--s2a-color-gray-25);
  --s2a-color-surface-strong: #eee;
  --s2a-color-surface-subtle: var(--s2a-color-gray-50);
}
`})))()}var v;function y(){return(y=e((()=>{v=`/**
 * Do not edit directly, this file was auto-generated.
 */

:root[data-theme="dark"] {
  /* Color / Background */
  --s2a-color-background-brand: var(--s2a-color-brand-adobe-red);
  --s2a-color-background-default: var(--s2a-color-gray-900);
  --s2a-color-background-disabled: var(--s2a-color-gray-50);
  --s2a-color-background-inverse: var(--s2a-color-gray-25);
  --s2a-color-background-knockout: var(--s2a-color-gray-1000);
  --s2a-color-background-subtle: var(--s2a-color-gray-700);
  --s2a-color-background-utility-error: var(--s2a-color-red-900);

  /* Color / Border */
  --s2a-color-border-accent: #3b63fb; /** Accent border/indicator color (Adobe accent blue). Used for selected-state borders like the tab underline. Fills the gap where S2A had no semantic accent — the blue previously only lived in button/icon-button component tokens. */
  --s2a-color-border-brand: var(--s2a-color-brand-adobe-red);
  --s2a-color-border-default: var(--s2a-color-gray-300);
  --s2a-color-border-disabled: var(--s2a-color-gray-400);
  --s2a-color-border-inverse: var(--s2a-color-gray-1000);
  --s2a-color-border-knockout: var(--s2a-color-gray-25);
  --s2a-color-border-strong: var(--s2a-color-gray-25);
  --s2a-color-border-subtle: var(--s2a-color-gray-300);
  --s2a-color-border-utility-error: var(--s2a-color-red-900);

  /* Color / Content */
  --s2a-color-content-body-strong: var(--s2a-color-content-strong); /** This is for text */
  --s2a-color-content-body-subtle: var(--s2a-color-content-subtle); /** text subtle */
  --s2a-color-content-brand: var(--s2a-color-brand-adobe-red);
  --s2a-color-content-caption: var(--s2a-color-content-subtle);
  --s2a-color-content-default: var(--s2a-color-gray-25);
  --s2a-color-content-disabled: var(--s2a-color-gray-400);
  --s2a-color-content-eyebrow: var(--s2a-color-transparent-white-48);
  --s2a-color-content-heading: var(--s2a-color-content-knockout);
  --s2a-color-content-inverse: var(--s2a-color-gray-25); /** Text and icon color for content on always-light surfaces — surfaces that stay light regardless of page or section mode (e.g. active state pills, surface-default cards used in a dark context). Resolves to the same dark value in both Light and Dark modes. Counterpart to content/knockout, which is always white for always-dark surfaces. */
  --s2a-color-content-knockout: var(--s2a-color-gray-25);
  --s2a-color-content-label: var(--s2a-color-content-knockout);
  --s2a-color-content-on-inverse: var(--s2a-color-gray-1000); /** Text and icon color for content on always-light surfaces — surfaces that stay light regardless of page or section mode (e.g. active state pills, surface-default cards used in a dark context). Resolves to the same dark value in both Light and Dark modes. Counterpart to content/knockout, which is always white for always-dark surfaces. */
  --s2a-color-content-on-inverse-subtle: var(--s2a-color-transparent-black-64); /** Text and icon color for content on always-light surfaces — surfaces that stay light regardless of page or section mode (e.g. active state pills, surface-default cards used in a dark context). Resolves to the same dark value in both Light and Dark modes. Counterpart to content/knockout, which is always white for always-dark surfaces. */
  --s2a-color-content-strong: var(--s2a-color-gray-600);
  --s2a-color-content-subheading: var(--s2a-color-content-knockout);
  --s2a-color-content-subtle: var(--s2a-color-transparent-white-64);
  --s2a-color-content-utility-error: var(--s2a-color-red-900);

  /* Color / Focus Ring */
  --s2a-color-focus-ring-default: var(--s2a-color-blue-500);
  --s2a-color-focus-ring-knockout: var(--s2a-color-gray-25);

  /* Other */
  --s2a-color-button-background-accent-active: var(--s2a-color-blue-1100); /** Phase 1 — simplified mode-responsive token. Replaces on-light/on-dark Context variants. */
  --s2a-color-button-background-accent-default: var(--s2a-color-blue-900); /** Phase 1 — simplified mode-responsive token. Replaces on-light/on-dark Context variants. */
  --s2a-color-button-background-accent-hover: var(--s2a-color-blue-1000); /** Phase 1 — simplified mode-responsive token. Replaces on-light/on-dark Context variants. */
  --s2a-color-button-background-accent-solid-on-light-active: var(--s2a-color-blue-1100); /** DEPRECATED — replaced by simplified mode-responsive token (no on-light/on-dark segment). Will be renamed to _deprecated/ path once all component bindings are migrated. Removal target: v1 token release. */
  --s2a-color-button-background-accent-solid-on-light-default: var(--s2a-color-blue-900); /** DEPRECATED — replaced by simplified mode-responsive token (no on-light/on-dark segment). Will be renamed to _deprecated/ path once all component bindings are migrated. Removal target: v1 token release. */
  --s2a-color-button-background-accent-solid-on-light-hover: var(--s2a-color-blue-1000); /** DEPRECATED — replaced by simplified mode-responsive token (no on-light/on-dark segment). Will be renamed to _deprecated/ path once all component bindings are migrated. Removal target: v1 token release. */
  --s2a-color-button-background-knockout-active: var(--s2a-color-gray-100); /** Knockout style — always-white/light bg for use on dark/colored surfaces. */
  --s2a-color-button-background-knockout-default: var(--s2a-color-gray-25); /** Knockout style — always-white/light bg for use on dark/colored surfaces. */
  --s2a-color-button-background-knockout-hover: var(--s2a-color-gray-50); /** Knockout style — always-white/light bg for use on dark/colored surfaces. */
  --s2a-color-button-background-outline-inverse-active: var(--s2a-color-transparent-black-24); /** outline-inverse style — static white values for use on dark/colored surfaces. */
  --s2a-color-button-background-outline-inverse-default: var(--s2a-color-transparent-black-00); /** outline-inverse style — static white values for use on dark/colored surfaces. */
  --s2a-color-button-background-outline-inverse-hover: var(--s2a-color-transparent-black-08); /** outline-inverse style — static white values for use on dark/colored surfaces. */
  --s2a-color-button-background-outlined-active: var(--s2a-color-gray-25); /** Phase 1 — simplified mode-responsive token. Replaces on-light/on-dark Context variants. */
  --s2a-color-button-background-outlined-default: var(--s2a-color-transparent-white-00); /** Phase 1 — simplified mode-responsive token. Replaces on-light/on-dark Context variants. */
  --s2a-color-button-background-outlined-hover: var(--s2a-color-transparent-white-12); /** Phase 1 — simplified mode-responsive token. Replaces on-light/on-dark Context variants. */
  --s2a-color-button-background-primary-outlined-on-dark-active: var(--s2a-color-gray-25); /** DEPRECATED — replaced by simplified mode-responsive token (no on-light/on-dark segment). Will be renamed to _deprecated/ path once all component bindings are migrated. Removal target: v1 token release. */
  --s2a-color-button-background-primary-outlined-on-dark-hover: var(--s2a-color-transparent-white-64); /** DEPRECATED — replaced by simplified mode-responsive token (no on-light/on-dark segment). Will be renamed to _deprecated/ path once all component bindings are migrated. Removal target: v1 token release. */
  --s2a-color-button-background-primary-outlined-on-light-active: var(--s2a-color-gray-25); /** DEPRECATED — replaced by simplified mode-responsive token (no on-light/on-dark segment). Will be renamed to _deprecated/ path once all component bindings are migrated. Removal target: v1 token release. */
  --s2a-color-button-background-primary-outlined-on-light-default: var(--s2a-color-transparent-black-00); /** DEPRECATED — replaced by simplified mode-responsive token (no on-light/on-dark segment). Will be renamed to _deprecated/ path once all component bindings are migrated. Removal target: v1 token release. */
  --s2a-color-button-background-primary-outlined-on-light-hover: var(--s2a-color-transparent-black-08); /** DEPRECATED — replaced by simplified mode-responsive token (no on-light/on-dark segment). Will be renamed to _deprecated/ path once all component bindings are migrated. Removal target: v1 token release. */
  --s2a-color-button-background-primary-solid-on-dark-active: var(--s2a-color-gray-25); /** DEPRECATED — replaced by simplified mode-responsive token (no on-light/on-dark segment). Will be renamed to _deprecated/ path once all component bindings are migrated. Removal target: v1 token release. */
  --s2a-color-button-background-primary-solid-on-dark-default: var(--s2a-color-gray-25); /** DEPRECATED — replaced by simplified mode-responsive token (no on-light/on-dark segment). Will be renamed to _deprecated/ path once all component bindings are migrated. Removal target: v1 token release. */
  --s2a-color-button-background-primary-solid-on-dark-hover: var(--s2a-color-transparent-white-64); /** DEPRECATED — replaced by simplified mode-responsive token (no on-light/on-dark segment). Will be renamed to _deprecated/ path once all component bindings are migrated. Removal target: v1 token release. */
  --s2a-color-button-background-primary-solid-on-light-active: var(--s2a-color-gray-25); /** DEPRECATED — replaced by simplified mode-responsive token (no on-light/on-dark segment). Will be renamed to _deprecated/ path once all component bindings are migrated. Removal target: v1 token release. */
  --s2a-color-button-background-primary-solid-on-light-default: var(--s2a-color-gray-25); /** DEPRECATED — replaced by simplified mode-responsive token (no on-light/on-dark segment). Will be renamed to _deprecated/ path once all component bindings are migrated. Removal target: v1 token release. */
  --s2a-color-button-background-primary-solid-on-light-hover: var(--s2a-color-transparent-white-64); /** DEPRECATED — replaced by simplified mode-responsive token (no on-light/on-dark segment). Will be renamed to _deprecated/ path once all component bindings are migrated. Removal target: v1 token release. */
  --s2a-color-button-background-primary-transparent-on-dark-active: var(--s2a-color-transparent-white-00); /** DEPRECATED — replaced by simplified mode-responsive token (no on-light/on-dark segment). Will be renamed to _deprecated/ path once all component bindings are migrated. Removal target: v1 token release. */
  --s2a-color-button-background-primary-transparent-on-dark-default: var(--s2a-color-transparent-white-00); /** DEPRECATED — replaced by simplified mode-responsive token (no on-light/on-dark segment). Will be renamed to _deprecated/ path once all component bindings are migrated. Removal target: v1 token release. */
  --s2a-color-button-background-primary-transparent-on-dark-hover: var(--s2a-color-transparent-white-00); /** DEPRECATED — replaced by simplified mode-responsive token (no on-light/on-dark segment). Will be renamed to _deprecated/ path once all component bindings are migrated. Removal target: v1 token release. */
  --s2a-color-button-background-primary-transparent-on-light-active: var(--s2a-color-transparent-white-24); /** DEPRECATED — replaced by simplified mode-responsive token (no on-light/on-dark segment). Will be renamed to _deprecated/ path once all component bindings are migrated. Removal target: v1 token release. */
  --s2a-color-button-background-primary-transparent-on-light-default: var(--s2a-color-transparent-white-00); /** DEPRECATED — replaced by simplified mode-responsive token (no on-light/on-dark segment). Will be renamed to _deprecated/ path once all component bindings are migrated. Removal target: v1 token release. */
  --s2a-color-button-background-primary-transparent-on-light-hover: var(--s2a-color-transparent-white-12); /** DEPRECATED — replaced by simplified mode-responsive token (no on-light/on-dark segment). Will be renamed to _deprecated/ path once all component bindings are migrated. Removal target: v1 token release. */
  --s2a-color-button-background-solid-active: var(--s2a-color-gray-25); /** Phase 1 — simplified mode-responsive token. Replaces on-light/on-dark Context variants. */
  --s2a-color-button-background-solid-default: var(--s2a-color-gray-25); /** Phase 1 — simplified mode-responsive token. Replaces on-light/on-dark Context variants. */
  --s2a-color-button-background-solid-hover: var(--s2a-color-transparent-white-64); /** Phase 1 — simplified mode-responsive token. Replaces on-light/on-dark Context variants. */
  --s2a-color-button-background-transparent-active: var(--s2a-color-transparent-white-24); /** Phase 1 — simplified mode-responsive token. Replaces on-light/on-dark Context variants. */
  --s2a-color-button-background-transparent-default: var(--s2a-color-transparent-white-00); /** Phase 1 — simplified mode-responsive token. Replaces on-light/on-dark Context variants. */
  --s2a-color-button-background-transparent-hover: var(--s2a-color-transparent-white-12); /** Phase 1 — simplified mode-responsive token. Replaces on-light/on-dark Context variants. */
  --s2a-color-button-border-knockout-default: var(--s2a-color-gray-25); /** Knockout button border — always white. White border on white bg for knockout style. */
  --s2a-color-button-border-outline-inverse-default: var(--s2a-color-gray-25); /** outline-inverse style — static white values for use on dark/colored surfaces. */
  --s2a-color-button-border-outlined-default: var(--s2a-color-gray-25); /** DEPRECATED — replaced by s2a/color/border/knockout (same primitives, gray/1000 Light / gray/25 Dark). Will be renamed to _deprecated/ path once all bindings are migrated. Removal target: v1 token release. */
  --s2a-color-button-border-primary-outlined-on-dark-default: var(--s2a-color-gray-25); /** DEPRECATED — replaced by simplified mode-responsive token (no on-light/on-dark segment). Will be renamed to _deprecated/ path once all component bindings are migrated. Removal target: v1 token release. */
  --s2a-color-button-border-primary-outlined-on-light-default: var(--s2a-color-gray-300); /** DEPRECATED — replaced by simplified mode-responsive token (no on-light/on-dark segment). Will be renamed to _deprecated/ path once all component bindings are migrated. Removal target: v1 token release. */
  --s2a-color-button-border-primary-solid-on-dark-default: var(--s2a-color-gray-25); /** DEPRECATED — replaced by simplified mode-responsive token (no on-light/on-dark segment). Will be renamed to _deprecated/ path once all component bindings are migrated. Removal target: v1 token release. */
  --s2a-color-button-border-primary-solid-on-dark-hover: var(--s2a-color-gray-25); /** DEPRECATED — replaced by simplified mode-responsive token (no on-light/on-dark segment). Will be renamed to _deprecated/ path once all component bindings are migrated. Removal target: v1 token release. */
  --s2a-color-button-border-primary-solid-on-light-default: var(--s2a-color-gray-300); /** DEPRECATED — replaced by simplified mode-responsive token (no on-light/on-dark segment). Will be renamed to _deprecated/ path once all component bindings are migrated. Removal target: v1 token release. */
  --s2a-color-button-border-solid-default: var(--s2a-color-gray-25); /** DEPRECATED — replaced by s2a/color/border/knockout (same primitives, gray/1000 Light / gray/25 Dark). Will be renamed to _deprecated/ path once all bindings are migrated. Removal target: v1 token release. */
  --s2a-color-button-content-accent-default: var(--s2a-color-gray-25); /** DEPRECATED — replaced by s2a/color/content/inverse (solid), content/default (outlined, transparent), content/knockout (accent). Will be renamed to _deprecated/ path once all bindings are migrated. Removal target: v1 token release. */
  --s2a-color-button-content-knockout: var(--s2a-color-gray-1000); /** Knockout button text — always near-black. Pairs with white button bg on dark surfaces. */
  --s2a-color-button-content-outline-inverse: var(--s2a-color-gray-25); /** outline-inverse button text — always white. For use on dark/colored surfaces. */
  --s2a-color-button-content-outlined-active: var(--s2a-color-gray-1000); /** DEPRECATED — replaced by s2a/color/content/inverse (solid), content/default (outlined, transparent), content/knockout (accent). Will be renamed to _deprecated/ path once all bindings are migrated. Removal target: v1 token release. */
  --s2a-color-button-content-outlined-default: var(--s2a-color-gray-25); /** DEPRECATED — replaced by s2a/color/content/inverse (solid), content/default (outlined, transparent), content/knockout (accent). Will be renamed to _deprecated/ path once all bindings are migrated. Removal target: v1 token release. */
  --s2a-color-button-content-primary-outlined-default: var(--s2a-color-gray-1000); /** DEPRECATED — replaced by simplified mode-responsive token (no primary/ segment). Will be renamed to _deprecated/ path once all component bindings are migrated. Removal target: v1 token release. */
  --s2a-color-button-content-primary-outlined-knockout: var(--s2a-color-gray-25); /** DEPRECATED — replaced by simplified mode-responsive token (no primary/ segment). Will be renamed to _deprecated/ path once all component bindings are migrated. Removal target: v1 token release. */
  --s2a-color-button-content-primary-solid-default: var(--s2a-color-gray-1000); /** DEPRECATED — replaced by simplified mode-responsive token (no primary/ segment). Will be renamed to _deprecated/ path once all component bindings are migrated. Removal target: v1 token release. */
  --s2a-color-button-content-primary-solid-inverse: var(--s2a-color-gray-1000); /** DEPRECATED — replaced by simplified mode-responsive token (no primary/ segment). Will be renamed to _deprecated/ path once all component bindings are migrated. Removal target: v1 token release. */
  --s2a-color-button-content-primary-transparent-default: var(--s2a-color-gray-25); /** DEPRECATED — replaced by simplified mode-responsive token (no primary/ segment). Will be renamed to _deprecated/ path once all component bindings are migrated. Removal target: v1 token release. */
  --s2a-color-button-content-primary-transparent-knockout: var(--s2a-color-gray-25); /** DEPRECATED — replaced by simplified mode-responsive token (no primary/ segment). Will be renamed to _deprecated/ path once all component bindings are migrated. Removal target: v1 token release. */
  --s2a-color-button-content-solid-default: var(--s2a-color-gray-1000); /** DEPRECATED — replaced by s2a/color/content/inverse (solid), content/default (outlined, transparent), content/knockout (accent). Will be renamed to _deprecated/ path once all bindings are migrated. Removal target: v1 token release. */
  --s2a-color-button-content-transparent-default: var(--s2a-color-gray-25); /** DEPRECATED — replaced by s2a/color/content/inverse (solid), content/default (outlined, transparent), content/knockout (accent). Will be renamed to _deprecated/ path once all bindings are migrated. Removal target: v1 token release. */
  --s2a-color-control-button-background-media-active: var(--s2a-color-transparent-black-96);
  --s2a-color-control-button-background-media-default: var(--s2a-color-transparent-black-64);
  --s2a-color-control-button-background-media-disabled: var(--s2a-color-transparent-black-32);
  --s2a-color-control-button-background-media-focus: var(--s2a-color-transparent-black-64);
  --s2a-color-control-button-background-media-hover: var(--s2a-color-transparent-black-80);
  --s2a-color-control-button-background-solid-active: var(--s2a-color-gray-1000);
  --s2a-color-control-button-background-solid-default: var(--s2a-color-gray-800);
  --s2a-color-control-button-background-solid-disabled: var(--s2a-color-transparent-white-04);
  --s2a-color-control-button-background-solid-focus: var(--s2a-color-transparent-white-04);
  --s2a-color-control-button-background-solid-hover: var(--s2a-color-gray-700);
  --s2a-color-control-button-background-transparent-active: var(--s2a-color-transparent-white-08);
  --s2a-color-control-button-background-transparent-default: var(--s2a-color-transparent-white-32);
  --s2a-color-control-button-background-transparent-disabled: var(--s2a-color-transparent-white-16);
  --s2a-color-control-button-background-transparent-focus: var(--s2a-color-transparent-white-32);
  --s2a-color-control-button-background-transparent-hover: var(--s2a-color-transparent-white-16);
  --s2a-color-control-button-border-media: var(--s2a-color-transparent-white-24);
  --s2a-color-control-button-border-solid-active: var(--s2a-color-transparent-white-24);
  --s2a-color-control-button-border-solid-default: var(--s2a-color-gray-700);
  --s2a-color-control-button-border-solid-disabled: var(--s2a-color-transparent-white-08);
  --s2a-color-control-button-border-solid-focus: var(--s2a-color-transparent-white-08);
  --s2a-color-control-button-border-solid-hover: var(--s2a-color-gray-500);
  --s2a-color-control-button-border-transparent-disabled: var(--s2a-color-transparent-white-16);
  --s2a-color-divider-default: var(--s2a-color-gray-300);
  --s2a-color-divider-inverse: var(--s2a-color-gray-1000);
  --s2a-color-divider-knockout: var(--s2a-color-gray-25);
  --s2a-color-divider-strong: var(--s2a-color-gray-25);
  --s2a-color-divider-subtle: var(--s2a-color-transparent-white-24);
  --s2a-color-divider-subtle-inverse: var(--s2a-color-transparent-black-16);
  --s2a-color-icon-button-background-accent-solid-on-light-active: var(--s2a-color-blue-1100); /** DEPRECATED — replaced by iconbutton/* simplified tokens. Will be removed in a future token release. */
  --s2a-color-icon-button-background-accent-solid-on-light-default: var(--s2a-color-blue-900); /** DEPRECATED — replaced by iconbutton/* simplified tokens. Will be removed in a future token release. */
  --s2a-color-icon-button-background-accent-solid-on-light-hover: var(--s2a-color-blue-1000); /** DEPRECATED — replaced by iconbutton/* simplified tokens. Will be removed in a future token release. */
  --s2a-color-icon-button-background-knockout-active: var(--s2a-color-gray-100); /** Simplified mode-responsive token. Replaces icon-button/background/primary/* and icon-button/content/primary/* deprecated tokens. */
  --s2a-color-icon-button-background-knockout-default: var(--s2a-color-gray-25); /** Simplified mode-responsive token. Replaces icon-button/background/primary/* and icon-button/content/primary/* deprecated tokens. */
  --s2a-color-icon-button-background-knockout-hover: var(--s2a-color-gray-50); /** Simplified mode-responsive token. Replaces icon-button/background/primary/* and icon-button/content/primary/* deprecated tokens. */
  --s2a-color-icon-button-background-primary-outlined-on-dark-active: var(--s2a-color-gray-25); /** DEPRECATED — replaced by iconbutton/* simplified tokens. Will be removed in a future token release. */
  --s2a-color-icon-button-background-primary-outlined-on-dark-default: var(--s2a-color-transparent-white-24); /** DEPRECATED — replaced by iconbutton/* simplified tokens. Will be removed in a future token release. */
  --s2a-color-icon-button-background-primary-outlined-on-dark-hover: var(--s2a-color-transparent-white-64); /** DEPRECATED — replaced by iconbutton/* simplified tokens. Will be removed in a future token release. */
  --s2a-color-icon-button-background-primary-outlined-on-light-active: var(--s2a-color-gray-25); /** DEPRECATED — replaced by iconbutton/* simplified tokens. Will be removed in a future token release. */
  --s2a-color-icon-button-background-primary-outlined-on-light-default: var(--s2a-color-transparent-white-00); /** DEPRECATED — replaced by iconbutton/* simplified tokens. Will be removed in a future token release. */
  --s2a-color-icon-button-background-primary-outlined-on-light-hover: var(--s2a-color-transparent-white-12); /** DEPRECATED — replaced by iconbutton/* simplified tokens. Will be removed in a future token release. */
  --s2a-color-icon-button-background-primary-solid-on-dark-active: var(--s2a-color-gray-25); /** DEPRECATED — replaced by iconbutton/* simplified tokens. Will be removed in a future token release. */
  --s2a-color-icon-button-background-primary-solid-on-dark-default: var(--s2a-color-transparent-white-64); /** DEPRECATED — replaced by iconbutton/* simplified tokens. Will be removed in a future token release. */
  --s2a-color-icon-button-background-primary-solid-on-dark-hover: var(--s2a-color-transparent-white-64); /** DEPRECATED — replaced by iconbutton/* simplified tokens. Will be removed in a future token release. */
  --s2a-color-icon-button-background-primary-solid-on-light-active: var(--s2a-color-gray-25); /** DEPRECATED — replaced by iconbutton/* simplified tokens. Will be removed in a future token release. */
  --s2a-color-icon-button-background-primary-solid-on-light-default: var(--s2a-color-gray-25); /** DEPRECATED — replaced by iconbutton/* simplified tokens. Will be removed in a future token release. */
  --s2a-color-icon-button-background-primary-solid-on-light-hover: var(--s2a-color-transparent-white-64); /** DEPRECATED — replaced by iconbutton/* simplified tokens. Will be removed in a future token release. */
  --s2a-color-icon-button-background-primary-transparent-on-dark-active: var(--s2a-color-transparent-white-00); /** DEPRECATED — replaced by iconbutton/* simplified tokens. Will be removed in a future token release. */
  --s2a-color-icon-button-background-primary-transparent-on-dark-default: var(--s2a-color-transparent-white-00); /** DEPRECATED — replaced by iconbutton/* simplified tokens. Will be removed in a future token release. */
  --s2a-color-icon-button-background-primary-transparent-on-dark-hover: var(--s2a-color-transparent-white-00); /** DEPRECATED — replaced by iconbutton/* simplified tokens. Will be removed in a future token release. */
  --s2a-color-icon-button-background-primary-transparent-on-light-active: var(--s2a-color-transparent-white-24); /** DEPRECATED — replaced by iconbutton/* simplified tokens. Will be removed in a future token release. */
  --s2a-color-icon-button-background-primary-transparent-on-light-default: var(--s2a-color-transparent-white-00); /** DEPRECATED — replaced by iconbutton/* simplified tokens. Will be removed in a future token release. */
  --s2a-color-icon-button-background-primary-transparent-on-light-hover: var(--s2a-color-transparent-white-12); /** DEPRECATED — replaced by iconbutton/* simplified tokens. Will be removed in a future token release. */
  --s2a-color-icon-button-background-solid-active: var(--s2a-color-gray-25); /** Simplified mode-responsive token. Replaces icon-button/background/primary/* and icon-button/content/primary/* deprecated tokens. */
  --s2a-color-icon-button-background-solid-default: var(--s2a-color-gray-25); /** Simplified mode-responsive token. Replaces icon-button/background/primary/* and icon-button/content/primary/* deprecated tokens. */
  --s2a-color-icon-button-background-solid-hover: var(--s2a-color-transparent-white-64); /** Simplified mode-responsive token. Replaces icon-button/background/primary/* and icon-button/content/primary/* deprecated tokens. */
  --s2a-color-icon-button-background-transparent-active: var(--s2a-color-transparent-white-24); /** Simplified mode-responsive token. Replaces icon-button/background/primary/* and icon-button/content/primary/* deprecated tokens. */
  --s2a-color-icon-button-background-transparent-default: var(--s2a-color-transparent-white-00); /** Simplified mode-responsive token. Replaces icon-button/background/primary/* and icon-button/content/primary/* deprecated tokens. */
  --s2a-color-icon-button-background-transparent-hover: var(--s2a-color-transparent-white-12); /** Simplified mode-responsive token. Replaces icon-button/background/primary/* and icon-button/content/primary/* deprecated tokens. */
  --s2a-color-icon-button-border-primary-outlined-default: var(--s2a-color-gray-25); /** DEPRECATED — replaced by iconbutton/* simplified tokens. Will be removed in a future token release. */
  --s2a-color-icon-button-border-primary-outlined-on-dark-default: var(--s2a-color-gray-700); /** DEPRECATED — replaced by iconbutton/* simplified tokens. Will be removed in a future token release. */
  --s2a-color-icon-button-border-primary-solid-on-dark-default: var(--s2a-color-gray-25); /** DEPRECATED — replaced by iconbutton/* simplified tokens. Will be removed in a future token release. */
  --s2a-color-icon-button-border-primary-solid-on-light-default: var(--s2a-color-gray-25); /** DEPRECATED — replaced by iconbutton/* simplified tokens. Will be removed in a future token release. */
  --s2a-color-icon-button-content-knockout: var(--s2a-color-gray-1000); /** Simplified mode-responsive token. Replaces icon-button/background/primary/* and icon-button/content/primary/* deprecated tokens. */
  --s2a-color-icon-button-content-primary-outlined-default: var(--s2a-color-gray-25); /** DEPRECATED — replaced by iconbutton/* simplified tokens. Will be removed in a future token release. */
  --s2a-color-icon-button-content-primary-outlined-knockout: var(--s2a-color-gray-25); /** DEPRECATED — replaced by iconbutton/* simplified tokens. Will be removed in a future token release. */
  --s2a-color-icon-button-content-primary-solid-default: var(--s2a-color-gray-1000); /** DEPRECATED — replaced by iconbutton/* simplified tokens. Will be removed in a future token release. */
  --s2a-color-icon-button-content-primary-solid-inverse: var(--s2a-color-gray-1000); /** DEPRECATED — replaced by iconbutton/* simplified tokens. Will be removed in a future token release. */
  --s2a-color-icon-button-content-primary-transparent-default: var(--s2a-color-gray-25); /** DEPRECATED — replaced by iconbutton/* simplified tokens. Will be removed in a future token release. */
  --s2a-color-icon-button-content-primary-transparent-knockout: var(--s2a-color-gray-25); /** DEPRECATED — replaced by iconbutton/* simplified tokens. Will be removed in a future token release. */
  --s2a-color-icon-button-content-solid: var(--s2a-color-gray-1000); /** Simplified mode-responsive token. Replaces icon-button/background/primary/* and icon-button/content/primary/* deprecated tokens. */
  --s2a-color-icon-button-content-transparent: var(--s2a-color-gray-25); /** Simplified mode-responsive token. Replaces icon-button/background/primary/* and icon-button/content/primary/* deprecated tokens. */
  --s2a-color-merch-card-highlight-features-background: var(--s2a-color-surface-inverse-subtle); /** Dark features panel on the MerchCard highlight style. Aliases surface/inverse-subtle: dark (gray/900) in Light theme, subtle light (gray/50) in Dark theme. */
  --s2a-color-merch-card-highlight-features-content: var(--s2a-color-content-on-inverse); /** Readable text/icon on the MerchCard highlight features panel. Aliases content/on-inverse: white in Light theme, near-black in Dark theme. Pairs with merch-card/highlight/features/background. */
  --s2a-color-merch-card-highlight-features-content-subtle: var(--s2a-color-content-on-inverse-subtle); /** Secondary text on the MerchCard highlight features panel. Aliases content/on-inverse-subtle. */
  --s2a-color-merch-card-pro-surface: var(--s2a-color-surface-inverse-subtle);
  --s2a-color-page-default: var(--s2a-color-gray-1000);
  --s2a-color-page-inverse: var(--s2a-color-gray-25);
  --s2a-color-page-subtle: var(--s2a-color-gray-900);
  --s2a-color-promo-cta-background: var(--s2a-color-gray-25);
  --s2a-color-promo-cta-button-background-active: var(--s2a-color-gray-1000);
  --s2a-color-promo-cta-button-background-default: var(--s2a-color-gray-75);
  --s2a-color-promo-cta-button-background-hover: var(--s2a-color-gray-300);
  --s2a-color-promo-cta-button-background-neutral-on-image-on-dark-active: var(--s2a-color-background-inverse); /** Deprecated — superseded by promo-cta/button/* tokens (light/dark mode-responsive). Do not use. */
  --s2a-color-promo-cta-button-border-active: var(--s2a-color-transparent-white-24);
  --s2a-color-promo-cta-button-border-default: var(--s2a-color-gray-200);
  --s2a-color-promo-cta-button-border-hover: var(--s2a-color-gray-400);
  --s2a-color-promo-cta-button-icon-active: var(--s2a-color-gray-25);
  --s2a-color-promo-cta-label: var(--s2a-color-gray-1000);
  --s2a-color-router-nav-item-background-active: var(--s2a-color-gray-25);
  --s2a-color-router-nav-item-content-active: var(--s2a-color-gray-1000);
  --s2a-color-section-default: var(--s2a-color-gray-1000);
  --s2a-color-surface-default: var(--s2a-color-gray-1000);
  --s2a-color-surface-inverse: var(--s2a-color-gray-25); /** Background for surfaces that invert relative to the current page mode — dark in light mode, light in dark mode. Use for expanded or active states where the component flips to contrast against the page (e.g. ElasticCard expanded state). Zero blast radius — safe to evolve. Counterpart: surface/subtle for the resting state. */
  --s2a-color-surface-inverse-subtle: var(--s2a-color-gray-50); /** Background for surfaces that invert relative to the current page mode — dark in light mode, light in dark mode. Use for expanded or active states where the component flips to contrast against the page (e.g. ElasticCard expanded state). Zero blast radius — safe to evolve. Counterpart: surface/subtle for the resting state. */
  --s2a-color-surface-knockout: var(--s2a-color-gray-25);
  --s2a-color-surface-strong: #444;
  --s2a-color-surface-subtle: var(--s2a-color-gray-900);
}
`})))()}var b;function x(){return(x=e((()=>{b=`/**
 * Do not edit directly, this file was auto-generated.
 */

:root {
  /* Viewport & Section Padding */
  --s2a-section-spacing-none: var(--s2a-spacing-none); /** Milo-specific declarations */
  --s2a-section-spacing-5xs: var(--s2a-spacing-xs);
  --s2a-section-spacing-4xs: var(--s2a-spacing-sm);
  --s2a-section-spacing-3xs: var(--s2a-spacing-md);
  --s2a-section-spacing-2xs: var(--s2a-spacing-xs);
  --s2a-section-spacing-xs: var(--s2a-spacing-lg);
  --s2a-section-spacing-sm: var(--s2a-spacing-lg);
  --s2a-section-spacing-md: var(--s2a-spacing-lg);
  --s2a-section-spacing-lg: var(--s2a-spacing-xl); /** Milo-specific declarations */
  --s2a-section-spacing-xl: var(--s2a-spacing-2xl); /** Milo-specific declarations */
  --s2a-section-spacing-2xl: var(--s2a-spacing-lg); /** Milo-specific declarations */
  --s2a-section-spacing-3xl: var(--s2a-spacing-2xl); /** Milo-specific declarations */
  --s2a-section-spacing-4xl: var(--s2a-spacing-4xl); /** Milo-specific declarations */
  --s2a-section-spacing-5xl: var(--s2a-layout-sm); /** Milo-specific declarations */
  --s2a-viewport-vertical-padding-xl: var(--s2a-layout-sm); /** Deprecated — scheduled for removal in favor of --s2a-section-spacing-*. Keeping bound until we&#39;re ready to fully remove it; do not delete without checking for remaining usage first. */
  --s2a-viewport-vertical-padding-lg: var(--s2a-spacing-4xl); /** Deprecated — scheduled for removal in favor of --s2a-section-spacing-*. Keeping bound until we&#39;re ready to fully remove it; do not delete without checking for remaining usage first. */
  --s2a-viewport-vertical-padding-md: var(--s2a-spacing-2xl); /** Deprecated — scheduled for removal in favor of --s2a-section-spacing-*. Keeping bound until we&#39;re ready to fully remove it; do not delete without checking for remaining usage first. */
  --s2a-viewport-vertical-padding-sm: var(--s2a-spacing-xl); /** Deprecated — scheduled for removal in favor of --s2a-section-spacing-*. Keeping bound until we&#39;re ready to fully remove it; do not delete without checking for remaining usage first. */
  --s2a-viewport-vertical-padding-xs: var(--s2a-spacing-lg); /** Deprecated — scheduled for removal in favor of --s2a-section-spacing-*. Keeping bound until we&#39;re ready to fully remove it; do not delete without checking for remaining usage first. */
  --s2a-viewport-vertical-padding-2xs: var(--s2a-spacing-md); /** Deprecated — scheduled for removal in favor of --s2a-section-spacing-*. Keeping bound until we&#39;re ready to fully remove it; do not delete without checking for remaining usage first. */
  --s2a-viewport-vertical-padding-none: var(--s2a-spacing-none); /** Deprecated — scheduled for removal in favor of --s2a-section-spacing-*. Keeping bound until we&#39;re ready to fully remove it; do not delete without checking for remaining usage first. */

  /* Layout */
  --s2a-layout-guide-gap: var(--s2a-spacing-xs);

  /* Typography / Font Size */
  --s2a-typography-font-size-super: var(--s2a-font-size-7xl);
  --s2a-typography-font-size-body-lg: var(--s2a-font-size-md);
  --s2a-typography-font-size-body-md: var(--s2a-font-size-md);
  --s2a-typography-font-size-body-sm: var(--s2a-font-size-sm);
  --s2a-typography-font-size-body-xs: var(--s2a-font-size-xs);
  --s2a-typography-font-size-eyebrow: var(--s2a-font-size-md);
  --s2a-typography-font-size-label: var(--s2a-font-size-sm);
  --s2a-typography-font-size-caption: var(--s2a-font-size-xs);
  --s2a-typography-font-size-heading-1: var(--s2a-font-size-5xl);
  --s2a-typography-font-size-heading-2: var(--s2a-font-size-3xl);
  --s2a-typography-font-size-heading-3: var(--s2a-font-size-2xl);
  --s2a-typography-font-size-heading-4: var(--s2a-font-size-xl);
  --s2a-typography-font-size-heading-5: var(--s2a-font-size-lg);
  --s2a-typography-font-size-heading-6: var(--s2a-font-size-md);
  --s2a-typography-font-size-legal: var(--s2a-font-size-sm);

  /* Typography / Letter Spacing */
  --s2a-typography-letter-spacing-super: var(--s2a-font-letter-spacing-lg);
  --s2a-typography-letter-spacing-body-lg: var(--s2a-font-letter-spacing-6xl);
  --s2a-typography-letter-spacing-body-md: var(--s2a-font-letter-spacing-6xl);
  --s2a-typography-letter-spacing-body-sm: var(--s2a-font-letter-spacing-6xl);
  --s2a-typography-letter-spacing-body-xs: var(--s2a-font-letter-spacing-6xl);
  --s2a-typography-letter-spacing-eyebrow: var(--s2a-font-letter-spacing-6xl);
  --s2a-typography-letter-spacing-label: var(--s2a-font-letter-spacing-6xl);
  --s2a-typography-letter-spacing-caption: var(--s2a-font-letter-spacing-6xl);
  --s2a-typography-letter-spacing-heading-1: var(--s2a-font-letter-spacing-lg);
  --s2a-typography-letter-spacing-heading-2: var(--s2a-font-letter-spacing-3xl);
  --s2a-typography-letter-spacing-heading-3: var(--s2a-font-letter-spacing-4xl);
  --s2a-typography-letter-spacing-heading-4: var(--s2a-font-letter-spacing-4xl);
  --s2a-typography-letter-spacing-heading-5: var(--s2a-font-letter-spacing-5xl);
  --s2a-typography-letter-spacing-heading-6: var(--s2a-font-letter-spacing-5xl);
  --s2a-typography-letter-spacing-legal: var(--s2a-font-letter-spacing-6xl);

  /* Typography / Line Height */
  --s2a-typography-line-height-super: var(--s2a-font-line-height-3xl);
  --s2a-typography-line-height-body-lg: var(--s2a-font-line-height-sm);
  --s2a-typography-line-height-body-md: var(--s2a-font-line-height-sm);
  --s2a-typography-line-height-body-sm: var(--s2a-font-line-height-xs);
  --s2a-typography-line-height-body-xs: var(--s2a-font-line-height-xs);
  --s2a-typography-line-height-eyebrow: var(--s2a-font-line-height-sm);
  --s2a-typography-line-height-label: var(--s2a-font-line-height-xs);
  --s2a-typography-line-height-caption: var(--s2a-font-line-height-2xs);
  --s2a-typography-line-height-heading-1: var(--s2a-font-line-height-xl);
  --s2a-typography-line-height-heading-2: var(--s2a-font-line-height-lg);
  --s2a-typography-line-height-heading-3: var(--s2a-font-line-height-md);
  --s2a-typography-line-height-heading-4: var(--s2a-font-line-height-sm);
  --s2a-typography-line-height-heading-5: var(--s2a-font-line-height-sm);
  --s2a-typography-line-height-heading-6: var(--s2a-font-line-height-xs);
  --s2a-typography-line-height-legal: var(--s2a-font-line-height-xs);

  /* Other */
  --s2a-cards-immersive-padding: var(--s2a-spacing-md);
  --s2a-hover-list-number-container-width: 24px;
  --s2a-hover-list-padding-vertical: var(--s2a-spacing-xl);
  --s2a-segmented-control-segment-padding-x: var(--s2a-spacing-24);
  --s2a-segmented-control-track-radius: var(--s2a-border-radius-24);
  --s2a-side-by-side-max-width-overlay: 320px;
  --s2a-side-by-side-padding-overlay: var(--s2a-spacing-lg);
  --s2a-side-by-side-padding-underlay: var(--s2a-spacing-sm);
  --s2a-tab-side-padding: 20px;
}
`})))()}var S;function C(){return(C=e((()=>{S=`@media (width >= 768px) {
/**
 * Do not edit directly, this file was auto-generated.
 */

:root {
  /* Viewport & Section Padding */
  --s2a-section-spacing-none: var(--s2a-spacing-none); /** Milo-specific declarations */
  --s2a-section-spacing-5xs: var(--s2a-spacing-xs);
  --s2a-section-spacing-4xs: var(--s2a-spacing-sm);
  --s2a-section-spacing-3xs: var(--s2a-spacing-md);
  --s2a-section-spacing-2xs: var(--s2a-spacing-lg);
  --s2a-section-spacing-xs: var(--s2a-spacing-lg);
  --s2a-section-spacing-sm: var(--s2a-spacing-xl);
  --s2a-section-spacing-md: var(--s2a-spacing-lg);
  --s2a-section-spacing-lg: var(--s2a-spacing-xl); /** Milo-specific declarations */
  --s2a-section-spacing-xl: var(--s2a-layout-sm); /** Milo-specific declarations */
  --s2a-section-spacing-2xl: var(--s2a-layout-sm); /** Milo-specific declarations */
  --s2a-section-spacing-3xl: var(--s2a-spacing-4xl); /** Milo-specific declarations */
  --s2a-section-spacing-4xl: var(--s2a-layout-sm); /** Milo-specific declarations */
  --s2a-section-spacing-5xl: var(--s2a-layout-xl); /** Milo-specific declarations */
  --s2a-viewport-vertical-padding-xl: var(--s2a-layout-xl); /** Deprecated — scheduled for removal in favor of --s2a-section-spacing-*. Keeping bound until we&#39;re ready to fully remove it; do not delete without checking for remaining usage first. */
  --s2a-viewport-vertical-padding-lg: var(--s2a-layout-lg); /** Deprecated — scheduled for removal in favor of --s2a-section-spacing-*. Keeping bound until we&#39;re ready to fully remove it; do not delete without checking for remaining usage first. */
  --s2a-viewport-vertical-padding-md: var(--s2a-layout-sm); /** Deprecated — scheduled for removal in favor of --s2a-section-spacing-*. Keeping bound until we&#39;re ready to fully remove it; do not delete without checking for remaining usage first. */
  --s2a-viewport-vertical-padding-sm: var(--s2a-spacing-4xl); /** Deprecated — scheduled for removal in favor of --s2a-section-spacing-*. Keeping bound until we&#39;re ready to fully remove it; do not delete without checking for remaining usage first. */
  --s2a-viewport-vertical-padding-xs: var(--s2a-spacing-2xl); /** Deprecated — scheduled for removal in favor of --s2a-section-spacing-*. Keeping bound until we&#39;re ready to fully remove it; do not delete without checking for remaining usage first. */
  --s2a-viewport-vertical-padding-2xs: var(--s2a-spacing-xl); /** Deprecated — scheduled for removal in favor of --s2a-section-spacing-*. Keeping bound until we&#39;re ready to fully remove it; do not delete without checking for remaining usage first. */
  --s2a-viewport-vertical-padding-none: var(--s2a-spacing-none); /** Deprecated — scheduled for removal in favor of --s2a-section-spacing-*. Keeping bound until we&#39;re ready to fully remove it; do not delete without checking for remaining usage first. */

  /* Layout */
  --s2a-layout-guide-gap: var(--s2a-spacing-xs);

  /* Typography / Font Size */
  --s2a-typography-font-size-super: var(--s2a-font-size-9xl);
  --s2a-typography-font-size-body-lg: var(--s2a-font-size-lg);
  --s2a-typography-font-size-body-md: var(--s2a-font-size-md);
  --s2a-typography-font-size-body-sm: var(--s2a-font-size-sm);
  --s2a-typography-font-size-body-xs: var(--s2a-font-size-sm);
  --s2a-typography-font-size-eyebrow: var(--s2a-font-size-md);
  --s2a-typography-font-size-label: var(--s2a-font-size-sm);
  --s2a-typography-font-size-caption: var(--s2a-font-size-xs);
  --s2a-typography-font-size-heading-1: var(--s2a-font-size-7xl);
  --s2a-typography-font-size-heading-2: var(--s2a-font-size-6xl);
  --s2a-typography-font-size-heading-3: var(--s2a-font-size-3xl);
  --s2a-typography-font-size-heading-4: var(--s2a-font-size-2xl);
  --s2a-typography-font-size-heading-5: var(--s2a-font-size-xl);
  --s2a-typography-font-size-heading-6: var(--s2a-font-size-md);
  --s2a-typography-font-size-legal: var(--s2a-font-size-md);

  /* Typography / Letter Spacing */
  --s2a-typography-letter-spacing-super: var(--s2a-font-letter-spacing-md);
  --s2a-typography-letter-spacing-body-lg: var(--s2a-font-letter-spacing-6xl);
  --s2a-typography-letter-spacing-body-md: var(--s2a-font-letter-spacing-6xl);
  --s2a-typography-letter-spacing-body-sm: var(--s2a-font-letter-spacing-6xl);
  --s2a-typography-letter-spacing-body-xs: var(--s2a-font-letter-spacing-6xl);
  --s2a-typography-letter-spacing-eyebrow: var(--s2a-font-letter-spacing-6xl);
  --s2a-typography-letter-spacing-label: var(--s2a-font-letter-spacing-6xl);
  --s2a-typography-letter-spacing-caption: var(--s2a-font-letter-spacing-6xl);
  --s2a-typography-letter-spacing-heading-1: var(--s2a-font-letter-spacing-lg);
  --s2a-typography-letter-spacing-heading-2: var(--s2a-font-letter-spacing-xl);
  --s2a-typography-letter-spacing-heading-3: var(--s2a-font-letter-spacing-4xl);
  --s2a-typography-letter-spacing-heading-4: var(--s2a-font-letter-spacing-4xl);
  --s2a-typography-letter-spacing-heading-5: var(--s2a-font-letter-spacing-4xl);
  --s2a-typography-letter-spacing-heading-6: var(--s2a-font-letter-spacing-5xl);
  --s2a-typography-letter-spacing-legal: var(--s2a-font-letter-spacing-6xl);

  /* Typography / Line Height */
  --s2a-typography-line-height-super: var(--s2a-font-line-height-4xl);
  --s2a-typography-line-height-body-lg: var(--s2a-font-line-height-md);
  --s2a-typography-line-height-body-md: var(--s2a-font-line-height-sm);
  --s2a-typography-line-height-body-sm: var(--s2a-font-line-height-xs);
  --s2a-typography-line-height-body-xs: var(--s2a-font-line-height-xs);
  --s2a-typography-line-height-eyebrow: var(--s2a-font-line-height-sm);
  --s2a-typography-line-height-label: var(--s2a-font-line-height-xs);
  --s2a-typography-line-height-caption: var(--s2a-font-line-height-2xs);
  --s2a-typography-line-height-heading-1: var(--s2a-font-line-height-3xl);
  --s2a-typography-line-height-heading-2: var(--s2a-font-line-height-2xl);
  --s2a-typography-line-height-heading-3: var(--s2a-font-line-height-lg);
  --s2a-typography-line-height-heading-4: var(--s2a-font-line-height-md);
  --s2a-typography-line-height-heading-5: var(--s2a-font-line-height-sm);
  --s2a-typography-line-height-heading-6: var(--s2a-font-line-height-xs);
  --s2a-typography-line-height-legal: var(--s2a-font-line-height-sm);

  /* Other */
  --s2a-cards-immersive-padding: var(--s2a-spacing-lg);
  --s2a-hover-list-number-container-width: 32px;
  --s2a-hover-list-padding-vertical: var(--s2a-spacing-lg);
  --s2a-segmented-control-segment-padding-x: var(--s2a-spacing-20);
  --s2a-segmented-control-track-radius: var(--s2a-border-radius-16);
  --s2a-side-by-side-max-width-overlay: 250px;
  --s2a-side-by-side-padding-overlay: var(--s2a-spacing-lg);
  --s2a-side-by-side-padding-underlay: var(--s2a-spacing-md);
  --s2a-tab-side-padding: var(--s2a-spacing-lg);
}

}`})))()}var w;function T(){return(T=e((()=>{w=`@media (width >= 1280px) {
/**
 * Do not edit directly, this file was auto-generated.
 */

:root {
  /* Viewport & Section Padding */
  --s2a-section-spacing-none: var(--s2a-spacing-none); /** Milo-specific declarations */
  --s2a-section-spacing-5xs: var(--s2a-spacing-xs);
  --s2a-section-spacing-4xs: var(--s2a-spacing-sm);
  --s2a-section-spacing-3xs: var(--s2a-spacing-md);
  --s2a-section-spacing-2xs: var(--s2a-spacing-lg);
  --s2a-section-spacing-xs: var(--s2a-spacing-xl);
  --s2a-section-spacing-sm: var(--s2a-spacing-2xl);
  --s2a-section-spacing-md: var(--s2a-spacing-3xl);
  --s2a-section-spacing-lg: var(--s2a-spacing-4xl); /** Milo-specific declarations */
  --s2a-section-spacing-xl: var(--s2a-layout-lg); /** Milo-specific declarations */
  --s2a-section-spacing-2xl: var(--s2a-layout-lg); /** Milo-specific declarations */
  --s2a-section-spacing-3xl: var(--s2a-layout-lg); /** Milo-specific declarations */
  --s2a-section-spacing-4xl: var(--s2a-layout-lg); /** Milo-specific declarations */
  --s2a-section-spacing-5xl: var(--s2a-layout-2xl); /** Milo-specific declarations */
  --s2a-viewport-vertical-padding-xl: var(--s2a-layout-2xl); /** Deprecated — scheduled for removal in favor of --s2a-section-spacing-*. Keeping bound until we&#39;re ready to fully remove it; do not delete without checking for remaining usage first. */
  --s2a-viewport-vertical-padding-lg: var(--s2a-layout-xl); /** Deprecated — scheduled for removal in favor of --s2a-section-spacing-*. Keeping bound until we&#39;re ready to fully remove it; do not delete without checking for remaining usage first. */
  --s2a-viewport-vertical-padding-md: var(--s2a-layout-lg); /** Deprecated — scheduled for removal in favor of --s2a-section-spacing-*. Keeping bound until we&#39;re ready to fully remove it; do not delete without checking for remaining usage first. */
  --s2a-viewport-vertical-padding-sm: var(--s2a-layout-sm); /** Deprecated — scheduled for removal in favor of --s2a-section-spacing-*. Keeping bound until we&#39;re ready to fully remove it; do not delete without checking for remaining usage first. */
  --s2a-viewport-vertical-padding-xs: var(--s2a-spacing-4xl); /** Deprecated — scheduled for removal in favor of --s2a-section-spacing-*. Keeping bound until we&#39;re ready to fully remove it; do not delete without checking for remaining usage first. */
  --s2a-viewport-vertical-padding-2xs: var(--s2a-spacing-xl); /** Deprecated — scheduled for removal in favor of --s2a-section-spacing-*. Keeping bound until we&#39;re ready to fully remove it; do not delete without checking for remaining usage first. */
  --s2a-viewport-vertical-padding-none: var(--s2a-spacing-none); /** Deprecated — scheduled for removal in favor of --s2a-section-spacing-*. Keeping bound until we&#39;re ready to fully remove it; do not delete without checking for remaining usage first. */

  /* Layout */
  --s2a-layout-guide-gap: var(--s2a-spacing-xs);

  /* Typography / Font Size */
  --s2a-typography-font-size-super: var(--s2a-font-size-11xl);
  --s2a-typography-font-size-body-lg: var(--s2a-font-size-xl);
  --s2a-typography-font-size-body-md: var(--s2a-font-size-md);
  --s2a-typography-font-size-body-sm: var(--s2a-font-size-sm);
  --s2a-typography-font-size-body-xs: var(--s2a-font-size-sm);
  --s2a-typography-font-size-eyebrow: var(--s2a-font-size-md);
  --s2a-typography-font-size-label: var(--s2a-font-size-sm);
  --s2a-typography-font-size-caption: var(--s2a-font-size-xs);
  --s2a-typography-font-size-heading-1: var(--s2a-font-size-10xl);
  --s2a-typography-font-size-heading-2: var(--s2a-font-size-7xl);
  --s2a-typography-font-size-heading-3: var(--s2a-font-size-6xl);
  --s2a-typography-font-size-heading-4: var(--s2a-font-size-4xl);
  --s2a-typography-font-size-heading-5: var(--s2a-font-size-2xl);
  --s2a-typography-font-size-heading-6: var(--s2a-font-size-lg);
  --s2a-typography-font-size-legal: var(--s2a-font-size-md);

  /* Typography / Letter Spacing */
  --s2a-typography-letter-spacing-super: var(--s2a-font-letter-spacing-xs);
  --s2a-typography-letter-spacing-body-lg: var(--s2a-font-letter-spacing-6xl);
  --s2a-typography-letter-spacing-body-md: var(--s2a-font-letter-spacing-6xl);
  --s2a-typography-letter-spacing-body-sm: var(--s2a-font-letter-spacing-6xl);
  --s2a-typography-letter-spacing-body-xs: var(--s2a-font-letter-spacing-6xl);
  --s2a-typography-letter-spacing-eyebrow: var(--s2a-font-letter-spacing-6xl);
  --s2a-typography-letter-spacing-label: var(--s2a-font-letter-spacing-6xl);
  --s2a-typography-letter-spacing-caption: var(--s2a-font-letter-spacing-6xl);
  --s2a-typography-letter-spacing-heading-1: var(--s2a-font-letter-spacing-sm);
  --s2a-typography-letter-spacing-heading-2: var(--s2a-font-letter-spacing-lg);
  --s2a-typography-letter-spacing-heading-3: var(--s2a-font-letter-spacing-xl);
  --s2a-typography-letter-spacing-heading-4: var(--s2a-font-letter-spacing-2xl);
  --s2a-typography-letter-spacing-heading-5: var(--s2a-font-letter-spacing-3xl);
  --s2a-typography-letter-spacing-heading-6: var(--s2a-font-letter-spacing-5xl);
  --s2a-typography-letter-spacing-legal: var(--s2a-font-letter-spacing-6xl);

  /* Typography / Line Height */
  --s2a-typography-line-height-super: var(--s2a-font-line-height-6xl);
  --s2a-typography-line-height-body-lg: var(--s2a-font-line-height-md);
  --s2a-typography-line-height-body-md: var(--s2a-font-line-height-sm);
  --s2a-typography-line-height-body-sm: var(--s2a-font-line-height-xs);
  --s2a-typography-line-height-body-xs: var(--s2a-font-line-height-xs);
  --s2a-typography-line-height-eyebrow: var(--s2a-font-line-height-sm);
  --s2a-typography-line-height-label: var(--s2a-font-line-height-xs);
  --s2a-typography-line-height-caption: var(--s2a-font-line-height-2xs);
  --s2a-typography-line-height-heading-1: var(--s2a-font-line-height-5xl);
  --s2a-typography-line-height-heading-2: var(--s2a-font-line-height-3xl);
  --s2a-typography-line-height-heading-3: var(--s2a-font-line-height-2xl);
  --s2a-typography-line-height-heading-4: var(--s2a-font-line-height-lg);
  --s2a-typography-line-height-heading-5: var(--s2a-font-line-height-md);
  --s2a-typography-line-height-heading-6: var(--s2a-font-line-height-xs);
  --s2a-typography-line-height-legal: var(--s2a-font-line-height-sm);

  /* Other */
  --s2a-cards-immersive-padding: var(--s2a-spacing-xl);
  --s2a-hover-list-number-container-width: 64px;
  --s2a-hover-list-padding-vertical: var(--s2a-spacing-lg);
  --s2a-segmented-control-segment-padding-x: var(--s2a-spacing-20);
  --s2a-segmented-control-track-radius: var(--s2a-border-radius-16);
  --s2a-side-by-side-max-width-overlay: 400px;
  --s2a-side-by-side-padding-overlay: var(--s2a-spacing-xl);
  --s2a-side-by-side-padding-underlay: var(--s2a-spacing-lg);
  --s2a-tab-side-padding: var(--s2a-spacing-lg);
}

}`})))()}var E;function D(){return(D=e((()=>{E=`@media (width >= 1441px) {
/**
 * Do not edit directly, this file was auto-generated.
 */

:root {
  /* Viewport & Section Padding */
  --s2a-section-spacing-none: var(--s2a-spacing-none); /** Milo-specific declarations */
  --s2a-section-spacing-5xs: var(--s2a-spacing-xs);
  --s2a-section-spacing-4xs: var(--s2a-spacing-sm);
  --s2a-section-spacing-3xs: var(--s2a-spacing-md);
  --s2a-section-spacing-2xs: var(--s2a-spacing-lg);
  --s2a-section-spacing-xs: var(--s2a-spacing-xl);
  --s2a-section-spacing-sm: var(--s2a-spacing-2xl);
  --s2a-section-spacing-md: var(--s2a-spacing-3xl);
  --s2a-section-spacing-lg: var(--s2a-spacing-4xl); /** Milo-specific declarations */
  --s2a-section-spacing-xl: var(--s2a-layout-lg); /** Milo-specific declarations */
  --s2a-section-spacing-2xl: var(--s2a-layout-lg); /** Milo-specific declarations */
  --s2a-section-spacing-3xl: var(--s2a-layout-lg); /** Milo-specific declarations */
  --s2a-section-spacing-4xl: var(--s2a-layout-lg); /** Milo-specific declarations */
  --s2a-section-spacing-5xl: var(--s2a-layout-2xl); /** Milo-specific declarations */
  --s2a-viewport-vertical-padding-xl: var(--s2a-layout-2xl); /** Deprecated — scheduled for removal in favor of --s2a-section-spacing-*. Keeping bound until we&#39;re ready to fully remove it; do not delete without checking for remaining usage first. */
  --s2a-viewport-vertical-padding-lg: var(--s2a-layout-xl); /** Deprecated — scheduled for removal in favor of --s2a-section-spacing-*. Keeping bound until we&#39;re ready to fully remove it; do not delete without checking for remaining usage first. */
  --s2a-viewport-vertical-padding-md: var(--s2a-layout-lg); /** Deprecated — scheduled for removal in favor of --s2a-section-spacing-*. Keeping bound until we&#39;re ready to fully remove it; do not delete without checking for remaining usage first. */
  --s2a-viewport-vertical-padding-sm: var(--s2a-layout-sm); /** Deprecated — scheduled for removal in favor of --s2a-section-spacing-*. Keeping bound until we&#39;re ready to fully remove it; do not delete without checking for remaining usage first. */
  --s2a-viewport-vertical-padding-xs: var(--s2a-spacing-4xl); /** Deprecated — scheduled for removal in favor of --s2a-section-spacing-*. Keeping bound until we&#39;re ready to fully remove it; do not delete without checking for remaining usage first. */
  --s2a-viewport-vertical-padding-2xs: var(--s2a-spacing-xl); /** Deprecated — scheduled for removal in favor of --s2a-section-spacing-*. Keeping bound until we&#39;re ready to fully remove it; do not delete without checking for remaining usage first. */
  --s2a-viewport-vertical-padding-none: var(--s2a-spacing-none); /** Deprecated — scheduled for removal in favor of --s2a-section-spacing-*. Keeping bound until we&#39;re ready to fully remove it; do not delete without checking for remaining usage first. */

  /* Layout */
  --s2a-layout-guide-gap: var(--s2a-spacing-xs);

  /* Typography / Font Size */
  --s2a-typography-font-size-super: var(--s2a-font-size-11xl);
  --s2a-typography-font-size-body-lg: var(--s2a-font-size-xl);
  --s2a-typography-font-size-body-md: var(--s2a-font-size-md);
  --s2a-typography-font-size-body-sm: var(--s2a-font-size-sm);
  --s2a-typography-font-size-body-xs: var(--s2a-font-size-sm);
  --s2a-typography-font-size-eyebrow: var(--s2a-font-size-md);
  --s2a-typography-font-size-label: var(--s2a-font-size-sm);
  --s2a-typography-font-size-caption: var(--s2a-font-size-xs);
  --s2a-typography-font-size-heading-1: var(--s2a-font-size-10xl);
  --s2a-typography-font-size-heading-2: var(--s2a-font-size-7xl);
  --s2a-typography-font-size-heading-3: var(--s2a-font-size-6xl);
  --s2a-typography-font-size-heading-4: var(--s2a-font-size-4xl);
  --s2a-typography-font-size-heading-5: var(--s2a-font-size-2xl);
  --s2a-typography-font-size-heading-6: var(--s2a-font-size-lg);
  --s2a-typography-font-size-legal: var(--s2a-font-size-md);

  /* Typography / Letter Spacing */
  --s2a-typography-letter-spacing-super: var(--s2a-font-letter-spacing-xs);
  --s2a-typography-letter-spacing-body-lg: var(--s2a-font-letter-spacing-6xl);
  --s2a-typography-letter-spacing-body-md: var(--s2a-font-letter-spacing-6xl);
  --s2a-typography-letter-spacing-body-sm: var(--s2a-font-letter-spacing-6xl);
  --s2a-typography-letter-spacing-body-xs: var(--s2a-font-letter-spacing-6xl);
  --s2a-typography-letter-spacing-eyebrow: var(--s2a-font-letter-spacing-6xl);
  --s2a-typography-letter-spacing-label: var(--s2a-font-letter-spacing-6xl);
  --s2a-typography-letter-spacing-caption: var(--s2a-font-letter-spacing-6xl);
  --s2a-typography-letter-spacing-heading-1: var(--s2a-font-letter-spacing-sm);
  --s2a-typography-letter-spacing-heading-2: var(--s2a-font-letter-spacing-lg);
  --s2a-typography-letter-spacing-heading-3: var(--s2a-font-letter-spacing-xl);
  --s2a-typography-letter-spacing-heading-4: var(--s2a-font-letter-spacing-2xl);
  --s2a-typography-letter-spacing-heading-5: var(--s2a-font-letter-spacing-4xl);
  --s2a-typography-letter-spacing-heading-6: var(--s2a-font-letter-spacing-5xl);
  --s2a-typography-letter-spacing-legal: var(--s2a-font-letter-spacing-6xl);

  /* Typography / Line Height */
  --s2a-typography-line-height-super: var(--s2a-font-line-height-6xl);
  --s2a-typography-line-height-body-lg: var(--s2a-font-line-height-md);
  --s2a-typography-line-height-body-md: var(--s2a-font-line-height-sm);
  --s2a-typography-line-height-body-sm: var(--s2a-font-line-height-xs);
  --s2a-typography-line-height-body-xs: var(--s2a-font-line-height-xs);
  --s2a-typography-line-height-eyebrow: var(--s2a-font-line-height-sm);
  --s2a-typography-line-height-label: var(--s2a-font-line-height-xs);
  --s2a-typography-line-height-caption: var(--s2a-font-line-height-2xs);
  --s2a-typography-line-height-heading-1: var(--s2a-font-line-height-5xl);
  --s2a-typography-line-height-heading-2: var(--s2a-font-line-height-3xl);
  --s2a-typography-line-height-heading-3: var(--s2a-font-line-height-2xl);
  --s2a-typography-line-height-heading-4: var(--s2a-font-line-height-lg);
  --s2a-typography-line-height-heading-5: var(--s2a-font-line-height-md);
  --s2a-typography-line-height-heading-6: var(--s2a-font-line-height-xs);
  --s2a-typography-line-height-legal: var(--s2a-font-line-height-sm);

  /* Other */
  --s2a-cards-immersive-padding: var(--s2a-spacing-2xl);
  --s2a-hover-list-number-container-width: 64px;
  --s2a-hover-list-padding-vertical: var(--s2a-spacing-lg);
  --s2a-segmented-control-segment-padding-x: var(--s2a-spacing-20);
  --s2a-segmented-control-track-radius: var(--s2a-border-radius-16);
  --s2a-side-by-side-max-width-overlay: 400px;
  --s2a-side-by-side-padding-overlay: var(--s2a-spacing-2xl);
  --s2a-side-by-side-padding-underlay: var(--s2a-spacing-2xl);
  --s2a-tab-side-padding: var(--s2a-spacing-lg);
}

}`})))()}function O(e,t,n){return Object.fromEntries([...e.matchAll(/(--s2a-[\w-]+)\s*:\s*([^;{}]+);(?:[ \t]*\/\*\*?\s*([^]*?)\*\/)?/g)].map(([,e,r,i])=>[e,{name:e,value:r.trim(),description:(i||``).trim(),layer:t,source:n}]))}function k(e,t,n=new Set){if(n.has(e)||!t[e])return null;let r=new Set(n).add(e),i=!1,a=t[e].value.replace(/var\((--s2a-[\w-]+)\)/g,(e,n)=>{let a=k(n,t,r);return a===null&&(i=!0),a??n});return i||a.includes(`var(`)?null:a}function A(e,t,n=new Set){if(n.has(e))return[{name:e,missing:!0,label:`Circular reference`}];let r=t[e];return r?[...[...r.value.matchAll(/var\((--s2a-[\w-]+)\)/g)].map(e=>e[1]).flatMap(r=>A(r,t,new Set(n).add(e))),r].filter((e,t,n)=>n.findIndex(t=>t.name===e.name)===t):[{name:e,missing:!0,label:`Not in this build`}]}function j(e){return!e||!/^-?[\d.]+(?:rem|px)?$/.test(e)?null:Number.parseFloat(e)*(e.endsWith(`rem`)?16:1)}function M(e,t){return t.reduce((t,n)=>e>=n.min?n.id:t,t[0].id)}function N(){return(N=e((()=>{})))()}function P(e=`light`,t=`lg`){let n={...z,...B,...V[e]};for(let e of W.slice(0,W.indexOf(t)+1))Object.assign(n,H[e]);return n}function F(e){let t={};for(let n of W.slice(0,W.indexOf(e)+1))for(let e of Object.values(H[n]))t[e.name]=e.value;return t}function I(e){let t=[[`color-background-`,`Background color`],[`color-content-`,`Text and icon color`],[`color-border-`,`Boundary color`],[`color-focus-ring-`,`Keyboard focus indicator`],[`color-surface-`,`Surface color`],[`color-button-`,`Button treatment`],[`typography-font-size-`,`Responsive text size`],[`typography-line-height-`,`Responsive line height`],[`typography-letter-spacing-`,`Responsive letter spacing`],[`section-spacing-`,`Space between page sections`],[`spacing-`,`Space inside or between elements`],[`border-radius-`,`Corner radius`],[`border-width-`,`Boundary width`],[`font-family-`,`Typeface role`],[`font-weight-`,`Text weight`],[`blur-`,`Background blur`],[`opacity-`,`Layer opacity`],[`layout-guide-`,`Layout guide spacing`],[`layout-`,`Large-scale layout spacing`]],n=K(e),r=t.find(([e])=>n.startsWith(e));return r?r[1]:`Component styling role`}function L(e,t){let n={color:/^--s2a-color-(background|content|border|focus-ring|surface)-/,theming:/^--s2a-color-(background|content|border|focus-ring|surface)-/,typography:/^--s2a-(typography-|font-family-|font-weight-(body|heading|caption|label|eyebrow)$)/,spacing:/^--s2a-(spacing-|section-spacing-)/,border:/^--s2a-border-/,effects:/^--s2a-(blur-|opacity-)/,responsive:/^--s2a-(typography-|section-spacing-|layout-guide-)/,icons:/^--s2a-color-(content|focus-ring)-/,layout:/^--s2a-(layout-|section-spacing-)/};return!n[t]||n[t].test(e)}var R,z,B,V,H,U,W,G,K,q,J,Y,X;function Z(){return(Z=e((()=>{p(),h(),_(),y(),x(),C(),T(),D(),R=[f,m,g,v,b,S,w,E].join(`
`),z=O(f,`Primitive`,`tokens.primitives.css`),B=O(m,`Semantic`,`tokens.semantic.css`),V=Object.fromEntries(Object.entries({light:g,dark:v}).map(([e,t])=>{let n=O(t,`Semantic`,`tokens.semantic.${e}.css`);for(let e of Object.values(n))/^--s2a-color-(background|border|content|focus-ring|surface)-/.test(e.name)||(e.layer=`Component`);return[e,n]})),H=Object.fromEntries(Object.entries({sm:b,md:S,lg:w,xl:E}).map(([e,t])=>[e,O(t,`Responsive`,`tokens.responsive.${e}.css`)])),U=Object.entries({sm:b,md:S,lg:w,xl:E}).map(([e,t])=>({id:e,min:Number(t.match(/width\s*>=\s*(\d+)px/)?.[1]??0)})),W=U.map(e=>e.id),G=(e,t=`light`,n=`lg`)=>k(e,P(t,n)),K=e=>e.replace(`--s2a-`,``),q=e=>`https://www.figma.com/design/qAF4nlt6O4ThbeXeO7jzdb/CPro?node-id=${e.replace(`:`,`-`)}`,J=e=>`./?path=/story/foundations-${e===`start`?`start-here`:e}--guide`,Y=[{id:`start`,title:`Start Here`,node:`5392:44706`,label:`A shared language for every interface.`,intro:`Foundations connect design decisions to the interfaces we build. Explore the roles, try the examples, and find the tokens that bring them together.`,summary:`Understand how the system fits together.`,demoTitle:`Follow a token into the interface`,demoIntro:`Choose a property to see the aliases behind it. The path follows the shipped tokens, including direct references to a primitive.`,token:`--s2a-color-content-heading`,related:[`color`,`spacing`,`theming`],tips:[[`Choose a role first`,`Start with the purpose: heading, surface, spacing, or action. Use a semantic or component token that describes that purpose.`],[`Keep references connected`,`Use the token name in code. Copying its resolved value disconnects the interface from future theme and scale changes.`],[`Check the context`,`Try both themes and the relevant viewport sizes. A token is one part of a usable composition.`]]},{id:`color`,title:`Color`,node:`5392:65979`,label:`Give color a clear purpose.`,intro:`Use color roles to distinguish surfaces, content, boundaries, and actions. A role communicates intent and can adapt when the theme changes.`,summary:`Choose colors by what they do.`,demoTitle:`Explore color in context`,demoIntro:`Select a role to highlight it in the example and inspect its token. Use the theme control to compare its resolved value.`,token:`--s2a-color-background-default`,related:[`theming`,`border`],tips:[[`Pair content with its surface`,`Evaluate text and icons against the background they actually sit on. A color alone does not establish readable contrast.`],[`Make meaning explicit`,`Pair status colors with clear text or an icon. Color should support the message, not carry it alone.`],[`Use emphasis deliberately`,`Reserve accent and brand colors for the roles defined by the system. Give the main action a clear visual priority.`]]},{id:`typography`,title:`Typography`,node:`5392:63252`,label:`Make the hierarchy easy to read.`,intro:`Typography helps people scan, understand, and act. Choose a text role, then let its size, weight, and spacing create a consistent rhythm.`,summary:`Build hierarchy with text roles.`,demoTitle:`Try a text role`,demoIntro:`Edit the specimen and compare responsive modes. The example uses the role’s font size, line height, and letter spacing from the current token build.`,token:`--s2a-typography-font-size-heading-2`,related:[`responsive`,`spacing`],tips:[[`Lead with the useful words`,`Use short, descriptive headings and sentence case. Put the words that distinguish a section near the beginning.`],[`Separate meaning from size`,`Choose heading levels by document structure. Use the appropriate visual role without skipping semantic heading levels.`],[`Test real content`,`Check long titles, translated text, and zoom. Allow text to wrap and grow instead of fixing the height of its container.`]]},{id:`spacing`,title:`Spacing`,node:`5392:64241`,label:`Give relationships room to show.`,intro:`Use space to group related content and separate distinct sections. Choose the spacing role that matches the relationship you want people to see.`,summary:`Create grouping and rhythm.`,demoTitle:`See the space between things`,demoIntro:`Adjust padding and gap independently. The highlighted regions show space inside the card and between its content.`,token:`--s2a-spacing-lg`,related:[`layout`,`responsive`],tips:[[`Group related content`,`Use tighter spacing within a group and more space between different groups. Keep that relationship consistent across the page.`],[`Distinguish padding from gap`,`Padding separates content from its container. Gap separates sibling elements. Choose each based on the relationship it expresses.`],[`Use section spacing for page rhythm`,`Section spacing can change with the responsive mode. Check the resolved values; size labels alone do not guarantee increasing values.`]]},{id:`border`,title:`Border`,node:`5392:64965`,label:`Define edges with intention.`,intro:`Borders separate content, reveal interactive boundaries, and shape surfaces. Use width, color, and radius together to create a clear treatment.`,summary:`Shape surfaces and boundaries.`,demoTitle:`Compare border treatments`,demoIntro:`Change the radius and width on the same surface. Keep the content constant so the effect of each decision is easy to compare.`,token:`--s2a-border-radius-sm`,related:[`color`,`effects`],tips:[[`Start with the boundary`,`Use a border when people need to distinguish an edge. Spacing may be enough to separate non-interactive content.`],[`Match the component`,`Use the component’s prescribed radius and width. A foundation specimen is a reference, not an invitation to restyle every instance.`],[`Preserve focus visibility`,`A subtle surface border and a focus indicator serve different purposes. Keep keyboard focus visible in both themes.`]]},{id:`effects`,title:`Effects`,node:`5392:66780`,label:`Add emphasis with restraint.`,intro:`Effects can soften background detail or change visual prominence. Use them to support a clear relationship while preserving readable content.`,summary:`Understand blur and opacity.`,demoTitle:`Explore blur and opacity`,demoIntro:`Compare the shipped semantic blur and opacity tokens. The effect applies to decorative artwork; the text stays sharp and readable.`,token:`--s2a-blur-xs`,related:[`color`,`border`],tips:[[`Keep content readable`,`Apply blur to decorative or background layers. Do not blur the text or controls people need to understand.`],[`Use opacity in context`,`Opacity changes the final color through blending. Check the result on the actual underlying surface.`],[`Keep state and behavior aligned`,`Reduced opacity can signal a disabled state, but it does not disable an element. Use the component’s disabled behavior as well.`]]},{id:`responsive`,title:`Responsive`,node:`5392:73854`,label:`Adapt without losing the hierarchy.`,intro:`Responsive tokens change selected design values at defined viewport widths. Compare the modes to understand what changes and what stays consistent.`,summary:`Follow values across viewports.`,demoTitle:`Watch a token change with width`,demoIntro:`Move the viewport control to see the active token mode. The chart uses the exact media-query boundaries and resolved values in the shipped CSS.`,token:`--s2a-typography-font-size-heading-2`,related:[`typography`,`layout`,`spacing`],tips:[[`Design for the content`,`Use breakpoint modes as a starting point. Check the widths between them and allow content to wrap naturally.`],[`Treat mode changes as steps`,`These token files change values at media-query boundaries. The chart shows those steps without implying fluid interpolation.`],[`Check layout behavior separately`,`Tokens and layout rules have related responsibilities. Use the existing Grid conformance page to inspect differences between their boundaries.`]]},{id:`icons`,title:`Icons`,node:`2142:53775`,label:`Make small signals unmistakable.`,intro:`Icons reinforce actions and help people recognize familiar patterns. Pair them with clear labels and preserve the shape of the source artwork.`,summary:`Choose a recognizable signal.`,demoTitle:`Find an icon and see it in context`,demoIntro:`Search the SVG assets shipped with the components. Select an icon to compare its source artwork with a labeled action.`,token:`--s2a-color-content-default`,related:[`color`,`typography`],tips:[[`Name the action`,`Use a visible label when the meaning might be unfamiliar. Give icon-only controls an accessible name that describes the action.`],[`Inherit the intended color`,`Keep icon color connected to the surrounding content or component state. In code, currentColor supports that relationship.`],[`Preserve the artwork`,`Use the source SVG and its viewBox. Do not redraw icons from text characters or stretch them out of proportion.`]]},{id:`layout`,title:`Layout`,node:`104:26144`,label:`Give every element a place.`,intro:`Containers, columns, and gutters establish shared alignment. Use the layout system to organize content while keeping its reading order clear.`,summary:`Align content across the page.`,demoTitle:`Reveal the structure`,demoIntro:`Compare the grid modes and toggle the column overlay. This proportional diagram uses the column counts and gutters recorded in the grid contract.`,token:`--s2a-layout-guide-gap`,related:[`responsive`,`spacing`],tips:[[`Establish a shared edge`,`Align related sections to the same container. Consistent edges make a page easier to scan.`],[`Let content determine composition`,`Choose a grid that supports the content. Avoid forcing text or controls into fixed heights to match a diagram.`],[`Preserve reading order`,`Keep the DOM order meaningful when the layout changes. Visual positioning should support keyboard and screen-reader navigation.`]]},{id:`theming`,title:`Theming`,node:`11851:211568`,label:`Keep the role. Change the expression.`,intro:`Themes assign different values to shared color roles. Keep components connected to those roles so the interface adapts as a whole.`,summary:`Compare light and dark roles.`,demoTitle:`One interface, two themes`,demoIntro:`Compare the same content in both modes. Select a color role to inspect its light and dark values and the aliases behind them.`,token:`--s2a-color-content-heading`,related:[`color`,`effects`],tips:[[`Use theme-aware roles`,`Use semantic and component tokens for surfaces, content, and controls. Their values can change together when the theme changes.`],[`Recognize fixed treatments`,`Some knockout and inverse treatments intentionally stay fixed. Inspect both mode values instead of assuming every color flips.`],[`Check the whole composition`,`Review icons, borders, focus indicators, and imagery alongside text. Switching a background alone does not create a complete theme.`]]}],X=Object.fromEntries(Y.map(e=>[e.id,e]))})))()}export{l as S,j as _,Z as a,d as b,U as c,P as d,X as f,M as g,N as h,J as i,K as l,G as m,R as n,F as o,Y as p,q as r,W as s,L as t,I as u,k as v,u as x,A as y};