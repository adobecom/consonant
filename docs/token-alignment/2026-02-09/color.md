## Token Alignment · Color (2026‑02‑09)

> Alignment between **S2A color / semantic tokens** and **Figma color variables / usage** in the latest home design.

| ID   | Domain         | Our Token (CSS var)                              | Figma Variable / Usage                        | Relation (same / close / new / unused) | Recommendation                                               | Notes |
| ---- | -------------- | ------------------------------------------------ | --------------------------------------------- | -------------------------------------- | ------------------------------------------------------------ | ----- |
| C-01 | surface        | --s2a-color-background-default                   | Page background (light)                       | same                                   | Keep as base page surface; set as root canvas color          |       |
| C-02 | surface        | --s2a-color-background-subtle                    | Subtle section / band backgrounds             | same                                   | Map section bands + cards to this where possible             |       |
| C-03 | surface        | --s2a-color-background-knockout                  | Dark / media overlays, hero image scrims      | close                                  | Use for dark-on-light overlays; tune opacity per component   |       |
| C-04 | text           | --s2a-color-content-default                      | Primary body + heading text on light surfaces | same                                   | Keep as default text color across redesign                   |       |
| C-05 | text           | --s2a-color-content-subtle                       | Secondary / meta text                         | same                                   | Use for captions, meta, muted labels                         |       |
| C-06 | text-on-dark   | --s2a-color-content-knockout                     | Text on dark / media surfaces                 | same                                   | Use for hero text over imagery                               |       |
| C-07 | brand          | --s2a-color-brand-adobe-red                      | Primary brand accent / CTA background         | same                                   | Use sparingly for key CTAs and highlights                    |       |
| C-08 | button-bg      | --s2a-button-color-background-primary-solid-\*   | Primary solid button backgrounds              | same                                   | Keep; ensure Figma primary buttons use this semantic mapping |       |
| C-09 | button-bg      | --s2a-button-color-background-secondary-solid-\* | Secondary solid button backgrounds            | same                                   | Keep; align secondary buttons in redesign                    |       |
| C-10 | button-border  | --s2a-button-color-border-primary-outlined-\*    | Primary outlined button borders               | same                                   | Keep; map all outlined CTAs to this                          |       |
| C-11 | button-content | --s2a-button-color-content-primary-solid-\*      | Primary button label color                    | same                                   | Keep; ensure contrast on all hero / on-media CTAs            |       |
| C-12 | state          | --s2a-color-background-utility-error             | Error surfaces                                | same                                   | Keep; use for form errors / system alerts in redesign        |       |
