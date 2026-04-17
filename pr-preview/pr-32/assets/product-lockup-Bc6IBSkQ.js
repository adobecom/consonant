const n=`.c-product-lockup {
  --c-product-lockup-gap: var(--s2a-spacing-md, 16px);
  --c-product-lockup-caret-size: calc(var(--s2a-spacing-sm, 12px) / 2);
  display: inline-flex;
  align-items: center;
  gap: var(--s2a-product-lockup-gap-inline);
  color: var(--s2a-color-content-default, #000000);
  font-family: var(
    --s2a-font-family-default,
    "adobe-clean-display",
    "Adobe Clean",
    sans-serif
  );
  text-decoration: none;
}

.c-product-lockup[data-orientation="vertical"] {
  flex-direction: column;
  align-items: flex-start;
  --c-product-lockup-gap: var(--s2a-spacing-sm, 12px);
}

.c-product-lockup[data-context="on-dark"] {
  color: var(--s2a-color-content-knockout, #ffffff);
}

.c-product-lockup[data-width="fill"] {
  display: flex;
  width: 100%;
}

.c-product-lockup__icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.c-product-lockup__label {
  display: inline-flex;
  align-items: center;
  min-width: 0;
  color: inherit;
  font-weight: var(--s2a-font-weight-adobe-clean-bold, 700);
}

.c-product-lockup[data-style="label"] .c-product-lockup__label {
  font-size: var(--s2a-font-size-sm, 14px);
  line-height: var(--s2a-font-line-height-2xs, 1.285714);
  letter-spacing: 0;
}

.c-product-lockup[data-style="eyebrow"] .c-product-lockup__label {
  font-size: var(--s2a-font-size-md, 16px);
  line-height: var(--s2a-font-line-height-sm, 1.25);
  letter-spacing: -0.2px;
  /* Primitive: eyebrow tracking requires -0.2px until semantic token exists */
}

.c-product-lockup[data-orientation="horizontal"] .c-product-lockup__label {
  white-space: nowrap;
}

.c-product-lockup[data-orientation="vertical"] .c-product-lockup__label {
  display: block;
  white-space: normal;
}

.c-product-lockup[data-width="fill"] .c-product-lockup__label {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
}

.c-product-lockup__caret {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  color: inherit;
}

.c-product-lockup__caret svg {
  width: var(--c-product-lockup-caret-size);
  height: var(--c-product-lockup-caret-size);
  display: block;
}

.c-product-lockup[data-width="fill"][data-orientation="horizontal"][data-has-caret="true"]
  .c-product-lockup__caret {
  margin-left: auto;
}
`;export{n as p};
