import{x as s}from"./iframe-DCFCIy-N.js";const o=n=>{const r=Number.parseInt(n,10);return Number.isNaN(r)?0:Math.min(100,Math.max(0,r))},e=({progress:n=0,tone:r="knockout"}={})=>{const a=o(n);return s`
    <span class="c-progress-bar" data-tone=${r}>
      <span class="c-progress-bar__fill" style="width: ${a}%;"></span>
    </span>
  `},c=`.c-progress-bar {
  position: relative;
  display: block;
  width: 100%;
  height: var(--s2a-border-radius-sm, 4px);
  border-radius: var(--s2a-border-radius-sm, 4px);
  background-color: var(--s2a-color-transparent-white-16, rgba(255, 255, 255, 0.16));
  overflow: hidden;
}

.c-progress-bar[data-tone="default"] {
  background-color: var(--s2a-color-transparent-black-12, rgba(0, 0, 0, 0.12));
}

.c-progress-bar__fill {
  position: absolute;
  inset: 0;
  width: 0;
  border-radius: inherit;
  background-color: var(--s2a-color-content-knockout, #ffffff);
  transition: width 200ms ease;
}

.c-progress-bar[data-tone="default"] .c-progress-bar__fill {
  background-color: var(--s2a-color-content-default, #000000);
}
`;export{e as P,c as p};
