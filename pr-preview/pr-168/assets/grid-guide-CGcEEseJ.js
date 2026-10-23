import{n as e}from"./rolldown-runtime-C0FnF6B9.js";import{c as t,i as n,n as r,t as i}from"./lit-DRzJKe3d.js";import{S as a,a as o,b as s,n as c,r as l}from"./foundation-data-BfSS-lTB.js";import"./foundations-XmJ01Z94.js";var u,d,f,p,m,h,g,_;function v(){return(v=e((()=>{u=`qAF4nlt6O4ThbeXeO7jzdb`,d=`104:26144`,f=`2026-10-12`,p=[{id:`S:f83974e7e1b532e4674f6846d684d8a6cc13a44b,`,name:`Grid - mode`,description:`12 col - 8 gap / 6 col tablet`,grids:[{pattern:`COLUMNS`,visible:!0,color:{r:0,g:.4000000059604645,b:1,a:.10000000149011612},gutterSize:8,alignment:`STRETCH`,count:12,offset:0,boundVariables:{count:{type:`VARIABLE_ALIAS`,id:`VariableID:2485:17`},gutterSize:{type:`VARIABLE_ALIAS`,id:`VariableID:2357:700`}}}]},{id:`S:ccd777e4dfd074650aa8a23944fca8060739ce30,`,name:`Grid - 12 col`,description:`12 col - 8 gap`,grids:[{pattern:`COLUMNS`,visible:!0,color:{r:0,g:.4000000059604645,b:1,a:.10000000149011612},gutterSize:8,alignment:`STRETCH`,count:12,offset:159.99000549316406,boundVariables:{offset:{type:`VARIABLE_ALIAS`,id:`VariableID:2357:689`},count:{type:`VARIABLE_ALIAS`,id:`VariableID:2485:17`},gutterSize:{type:`VARIABLE_ALIAS`,id:`VariableID:2357:700`}}}]},{id:`S:941aa25e540238d84404f69558f1d0dfea1b8ca2,`,name:`Grid - 6 col`,description:`6 col mobile - 8 gap`,grids:[{pattern:`COLUMNS`,visible:!0,color:{r:0,g:.4000000059604645,b:1,a:.10000000149011612},gutterSize:8,alignment:`STRETCH`,count:6,offset:0,boundVariables:{}}]}],m=[{id:`12861:29688`,text:[`CONTAINERS:\u2028\u2028COL container logic ranges: 12 cols (1440+ - 768), 6 cols (up to 768px)\u2028
Container 12 cols (1440+ - 768), 6 cols (up to 768px) \u2028• Standard: Max 1920px content container. \u2028• Offset: Calls the FIXED value \u2028Max 1920px content container, but margin tokens at breakpoints. \u2028• Fluid: edge to edge margins but with a 2560 max \u2028
 Margins \u2028• Offset: margin tokens used at breakpoints are: --spacing-lg. \u2028• Margin rules are based on % inheritance (auto). Desktop/tablet (1440+-768) is Using 83.4% rules for now.  8.33% set\u2028• Margins on mobile (767-360) we will use a spacing token.--grid-margin = --spacing-lg\u2028
 Breakpoints \u2028• XL 12 cols (1440+ HD) - stress test ie 2560 HD (used only as needed) \u2028• L 12 cols (1440 - 1280) - most standard desktop range \u2028• M 12 cols (1279 - 768) - Tablet landscape (font shift, ability to customize as needed, mostly “tablet-desktop” feel) \u2028• S 6 cols (up to 767px) - true mobile, but covers tablet portrait as well. Think mobile simplified layouts or mobile experiences\u2028`]},{id:`12861:29690`,text:[`MODES: fully responsive: viewport, container and gutters per range.\u2028\u2028Xl:
Lg:
Md: starts at max resize to mockup 768
Sm:\u2028\u2028Each container has their own set of tokens and rule to support the mode.\u2028
WIP Versions for use to verify with building designers on usefulness
no modes more raw
modes - open col systems (make sense for builders)
modes + col/grid system math in place make sense for c2\u2028
IE col choice are tokens with modes for reflow choices.\u2028anything more don’t think about it as a feature may live at this level instead\u2028\u2028DISCUSS: c2 systems vs s2a for col.\u2028test calling to col from s2a into c2\u2028\u2028MOCKUP SIZES: for designers to use to show these break points\u20282560 VP - content container =1920 max\u20281920 is ideal  - CC =1440 max
768 VP - CC @ vp= 628 content container\u2028375 VP - CC @ vp= 300\u2028\u2028(Discussion)\u2028Yes: XL and Lg have cross over for now on.\u2028Unless XL is going to be VP 1921 - 2560  range only. \u2028`]},{id:`4907:6970`,text:[`CONTAINERS:\u2028Grid Behavior\u2028• Desktop (≥1280px): 2–6 cards per row via\xA0.two-up\xA0through\xA0.six-up.\u2028• Tablet (768–1279px): Always 2-up. Add\xA0.orphan-full\xA0to stretch a lone last card full width.\u2028• Mobile (<768px): Single column, fully stacked.\u2028
Usage\u2028<div class=”ups-grid three-up”>\u2028<div class=”ups-grid four-up orphan-full”>\u2028\u2028\u2028COL container logic ranges: 12 cols (1440+ - 768), 6 cols (up to 768px)\u2028
Container 12 cols (1440+ - 768), 6 cols (up to 768px) \u2028• Standard: Max 1440px content container. \u2028• HD: Max 1920px content container. \u2028• Hero offset: Max 1920px content container, but margin tokens at breakpoints. \u2028• Fluid: No max content container. (wip) maybe carousel or sliders etc. 2560 max \u2028• No container: Full width/w overflow (wip) flex grid + object-fit etc.\u2028
 Margins \u2028• Hero offset: margin tokens used at breakpoints are: --spacing-4xl, --spacing-2xl, --spacing-lg. \u2028• Margin rules are based on % inheritance (auto). Desktop/tablet (1440+-768) is Using 83.4% rules for now. \u2028• Margins on mobile (767-360) we will use a spacing token.--grid-margin = --spacing-lg\u2028
 Breakpoints \u2028• XL 12 cols (1440+ HD) - stress test ie 2560 HD (used only as needed) \u2028• L 12 cols (1440 - 1280) - most standard desktop range \u2028• M 12 cols (1279 - 768) - Tablet landscape (font shift, ability to customize as needed, mostly “tablet-desktop” feel) \u2028• S 6 cols (up to 767px) - true mobile, but covers tablet portrait as well. Think mobile simplified layouts or mobile experiences\u2028`]}],h=[{id:`VariableID:2485:17`,name:`s2a/layout guide/_columns`,values:{"102:0":12,"102:1":12,"2297:1":6,"3933:0":12},collection:`S2A / Responsive / Container / Grid`,modes:[{name:`xl`,modeId:`3933:0`},{name:`lg`,modeId:`102:0`},{name:`md`,modeId:`102:1`},{name:`sm`,modeId:`2297:1`}]},{id:`VariableID:2357:700`,name:`s2a/layout guide/gap`,values:{"102:0":{type:`VARIABLE_ALIAS`,id:`VariableID:3:60`},"102:1":{type:`VARIABLE_ALIAS`,id:`VariableID:3:60`},"2297:1":{type:`VARIABLE_ALIAS`,id:`VariableID:3:60`},"3933:0":{type:`VARIABLE_ALIAS`,id:`VariableID:3:60`}},collection:`S2A / Responsive / Container / Grid`,modes:[{name:`xl`,modeId:`3933:0`},{name:`lg`,modeId:`102:0`},{name:`md`,modeId:`102:1`},{name:`sm`,modeId:`2297:1`}]},{id:`VariableID:2357:689`,name:`s2a/layout guide/container/_padding-inline`,values:{"102:0":119.98999786376953,"102:1":85.33000183105469,"2297:1":{type:`VARIABLE_ALIAS`,id:`VariableID:3:56`},"3933:0":159.99000549316406},collection:`S2A / Responsive / Container / Grid`,modes:[{name:`xl`,modeId:`3933:0`},{name:`lg`,modeId:`102:0`},{name:`md`,modeId:`102:1`},{name:`sm`,modeId:`2297:1`}]},{id:`VariableID:3:60`,name:`s2a/spacing/xs`,values:{"1:7":{type:`VARIABLE_ALIAS`,id:`VariableID:23b71ce10083ad36573b40200d015a3a1bdfd837/82:292`}},collection:`S2A / Semantic / Dimension / Static`,modes:[{name:`Value`,modeId:`1:7`}]},{id:`VariableID:3:56`,name:`s2a/spacing/lg`,values:{"1:7":{type:`VARIABLE_ALIAS`,id:`VariableID:fb902c32cb8ef1e272e02afd1e9836065e3d0f28/82:287`}},collection:`S2A / Semantic / Dimension / Static`,modes:[{name:`Value`,modeId:`1:7`}]},{id:`VariableID:23b71ce10083ad36573b40200d015a3a1bdfd837/82:292`,name:`spacing/8`,values:{"1:0":8},collection:`Primitives (Core)`,modes:[{name:`Mode 1`,modeId:`1:0`}]},{id:`VariableID:fb902c32cb8ef1e272e02afd1e9836065e3d0f28/82:287`,name:`spacing/24`,values:{"1:0":24},collection:`Primitives (Core)`,modes:[{name:`Mode 1`,modeId:`1:0`}]}],g={collection:{id:`VariableCollectionId:12861:30707`,name:`S2A / Container`,modes:[{name:`Default`,modeId:`12861:0`},{name:`Fixed`,modeId:`12861:1`},{name:`Fluid`,modeId:`12861:2`}]},variables:[{name:`Container-Margins/_side-margins-mode`,values:{"12861:0":{type:`VARIABLE_ALIAS`,id:`VariableID:3337:1129`},"12861:1":{type:`VARIABLE_ALIAS`,id:`VariableID:3337:1132`},"12861:2":0}},{name:`Container-Margins/_container-max-mode`,values:{"12861:0":{type:`VARIABLE_ALIAS`,id:`VariableID:3332:1118`},"12861:1":{type:`VARIABLE_ALIAS`,id:`VariableID:3337:1130`},"12861:2":2560}}],samples:[{id:`12975:40280`,width:2560,modes:{"VariableCollectionId:6:178":`3933:0`,"VariableCollectionId:12861:30707":`12861:0`},container:{id:`12975:40282`,width:1920,x:320,boundVariables:{minWidth:{type:`VARIABLE_ALIAS`,id:`VariableID:3332:1119`},maxWidth:{type:`VARIABLE_ALIAS`,id:`VariableID:12913:39052`},layoutGrids:[{type:`VARIABLE_ALIAS`,id:`VariableID:2357:700`},{type:`VARIABLE_ALIAS`,id:`VariableID:2485:17`}]}}},{id:`12975:40543`,width:1440,modes:{"VariableCollectionId:6:178":`102:0`,"VariableCollectionId:12861:30707":`12861:0`},container:{id:`12975:40545`,width:1200,x:120,boundVariables:{minWidth:{type:`VARIABLE_ALIAS`,id:`VariableID:3332:1119`},maxWidth:{type:`VARIABLE_ALIAS`,id:`VariableID:12913:39052`},layoutGrids:[{type:`VARIABLE_ALIAS`,id:`VariableID:2357:700`},{type:`VARIABLE_ALIAS`,id:`VariableID:2485:17`}]}}},{id:`12975:40631`,width:1280,modes:{"VariableCollectionId:6:178":`102:0`,"VariableCollectionId:12861:30707":`12861:0`},container:{id:`12975:40633`,width:1068,x:106,boundVariables:{minWidth:{type:`VARIABLE_ALIAS`,id:`VariableID:3332:1119`},maxWidth:{type:`VARIABLE_ALIAS`,id:`VariableID:12913:39052`},layoutGrids:[{type:`VARIABLE_ALIAS`,id:`VariableID:2357:700`},{type:`VARIABLE_ALIAS`,id:`VariableID:2485:17`}]}}},{id:`12975:40719`,width:1279,modes:{"VariableCollectionId:6:178":`102:1`,"VariableCollectionId:12861:30707":`12861:0`},container:{id:`12975:40721`,width:1151,x:64,boundVariables:{minWidth:{type:`VARIABLE_ALIAS`,id:`VariableID:3332:1119`},maxWidth:{type:`VARIABLE_ALIAS`,id:`VariableID:12913:39052`},layoutGrids:[{type:`VARIABLE_ALIAS`,id:`VariableID:2357:700`},{type:`VARIABLE_ALIAS`,id:`VariableID:2485:17`}]}}},{id:`12975:40874`,width:768,modes:{"VariableCollectionId:6:178":`102:1`,"VariableCollectionId:12861:30707":`12861:0`},container:{id:`12975:40876`,width:640,x:64,boundVariables:{minWidth:{type:`VARIABLE_ALIAS`,id:`VariableID:3332:1119`},maxWidth:{type:`VARIABLE_ALIAS`,id:`VariableID:12913:39052`},layoutGrids:[{type:`VARIABLE_ALIAS`,id:`VariableID:2357:700`},{type:`VARIABLE_ALIAS`,id:`VariableID:2485:17`}]}}},{id:`12975:41250`,width:767,modes:{"VariableCollectionId:6:178":`2297:1`,"VariableCollectionId:12861:30707":`12861:0`},container:{id:`12975:41252`,width:719,x:24,boundVariables:{minWidth:{type:`VARIABLE_ALIAS`,id:`VariableID:3332:1119`},maxWidth:{type:`VARIABLE_ALIAS`,id:`VariableID:12913:39052`},layoutGrids:[{type:`VARIABLE_ALIAS`,id:`VariableID:2357:700`},{type:`VARIABLE_ALIAS`,id:`VariableID:2485:17`}]}}},{id:`12975:41357`,width:320,modes:{"VariableCollectionId:6:178":`2297:1`,"VariableCollectionId:12861:30707":`12861:0`},container:{id:`12975:41359`,width:272,x:24,boundVariables:{minWidth:{type:`VARIABLE_ALIAS`,id:`VariableID:3332:1119`},maxWidth:{type:`VARIABLE_ALIAS`,id:`VariableID:12913:39052`},layoutGrids:[{type:`VARIABLE_ALIAS`,id:`VariableID:2357:700`},{type:`VARIABLE_ALIAS`,id:`VariableID:2485:17`}]}}},{id:`12975:43229`,width:2560,modes:{"VariableCollectionId:6:178":`3933:0`,"VariableCollectionId:12861:30707":`12861:1`},container:{id:`12975:43231`,width:1920,x:320,boundVariables:{minWidth:{type:`VARIABLE_ALIAS`,id:`VariableID:3332:1119`},maxWidth:{type:`VARIABLE_ALIAS`,id:`VariableID:12913:39052`},layoutGrids:[{type:`VARIABLE_ALIAS`,id:`VariableID:2357:700`},{type:`VARIABLE_ALIAS`,id:`VariableID:2485:17`}]}}},{id:`12975:43164`,width:1440,modes:{"VariableCollectionId:6:178":`3933:0`,"VariableCollectionId:12861:30707":`12861:1`},container:{id:`12975:43166`,width:1392,x:24,boundVariables:{minWidth:{type:`VARIABLE_ALIAS`,id:`VariableID:3332:1119`},maxWidth:{type:`VARIABLE_ALIAS`,id:`VariableID:12913:39052`},layoutGrids:[{type:`VARIABLE_ALIAS`,id:`VariableID:2357:700`},{type:`VARIABLE_ALIAS`,id:`VariableID:2485:17`}]}}},{id:`12975:43489`,width:768,modes:{"VariableCollectionId:6:178":`102:1`,"VariableCollectionId:12861:30707":`12861:1`},container:{id:`12975:43491`,width:720,x:24,boundVariables:{minWidth:{type:`VARIABLE_ALIAS`,id:`VariableID:3332:1119`},maxWidth:{type:`VARIABLE_ALIAS`,id:`VariableID:12913:39052`},layoutGrids:[{type:`VARIABLE_ALIAS`,id:`VariableID:2357:700`},{type:`VARIABLE_ALIAS`,id:`VariableID:2485:17`}]}}},{id:`12975:43554`,width:767,modes:{"VariableCollectionId:6:178":`2297:1`,"VariableCollectionId:12861:30707":`12861:1`},container:{id:`12975:43556`,width:719,x:24,boundVariables:{minWidth:{type:`VARIABLE_ALIAS`,id:`VariableID:3332:1119`},maxWidth:{type:`VARIABLE_ALIAS`,id:`VariableID:12913:39052`},layoutGrids:[{type:`VARIABLE_ALIAS`,id:`VariableID:2357:700`},{type:`VARIABLE_ALIAS`,id:`VariableID:2485:17`}]}}},{id:`12975:44078`,width:2560,modes:{"VariableCollectionId:6:178":`3933:0`,"VariableCollectionId:12861:30707":`12861:2`},container:{id:`12975:44080`,width:2560,x:0,boundVariables:{minWidth:{type:`VARIABLE_ALIAS`,id:`VariableID:3332:1119`},maxWidth:{type:`VARIABLE_ALIAS`,id:`VariableID:12913:39052`},layoutGrids:[{type:`VARIABLE_ALIAS`,id:`VariableID:2357:700`},{type:`VARIABLE_ALIAS`,id:`VariableID:2485:17`}]}}},{id:`12975:44013`,width:1440,modes:{"VariableCollectionId:6:178":`3933:0`,"VariableCollectionId:12861:30707":`12861:2`},container:{id:`12975:44015`,width:1440,x:0,boundVariables:{minWidth:{type:`VARIABLE_ALIAS`,id:`VariableID:3332:1119`},maxWidth:{type:`VARIABLE_ALIAS`,id:`VariableID:12913:39052`},layoutGrids:[{type:`VARIABLE_ALIAS`,id:`VariableID:2357:700`},{type:`VARIABLE_ALIAS`,id:`VariableID:2485:17`}]}}},{id:`12975:44338`,width:768,modes:{"VariableCollectionId:6:178":`102:1`,"VariableCollectionId:12861:30707":`12861:2`},container:{id:`12975:44340`,width:768,x:0,boundVariables:{minWidth:{type:`VARIABLE_ALIAS`,id:`VariableID:3332:1119`},maxWidth:{type:`VARIABLE_ALIAS`,id:`VariableID:12913:39052`},layoutGrids:[{type:`VARIABLE_ALIAS`,id:`VariableID:2357:700`},{type:`VARIABLE_ALIAS`,id:`VariableID:2485:17`}]}}},{id:`12975:44403`,width:767,modes:{"VariableCollectionId:6:178":`2297:1`,"VariableCollectionId:12861:30707":`12861:2`},container:{id:`12975:44405`,width:767,x:0,boundVariables:{minWidth:{type:`VARIABLE_ALIAS`,id:`VariableID:3332:1119`},maxWidth:{type:`VARIABLE_ALIAS`,id:`VariableID:12913:39052`},layoutGrids:[{type:`VARIABLE_ALIAS`,id:`VariableID:2357:700`},{type:`VARIABLE_ALIAS`,id:`VariableID:2485:17`}]}}}]},_={fileKey:u,pageId:d,inspectedAt:f,gridStyles:p,notes:m,variables:h,v4:g}})))()}var y;function b(){return(b=e((()=>{y=`/* =========================================
   S2A Grid System
   Pure grid mechanics — no visual styling.
   Requires @adobecom/s2a-tokens for spacing variables.
   ========================================= */

/* --- Grid System Configuration --- */
:root {
  /* Mobile (Default, <768px) */
  --s2a-grid-columns: 6;
  --s2a-grid-gutter: var(--s2a-spacing-xs);
  --s2a-grid-container-width: 83.4%;
  --s2a-grid-max-width: 100%;
  --s2a-grid-hd-max-width: 1920px;

  /* Bento row height */
  --s2a-grid-row-height: 120px;
}

/* Tablet & Desktop (>= 768px) */
@media (min-width: 768px) {
  :root {
    --s2a-grid-columns: 12;
    --s2a-grid-gutter: var(--s2a-spacing-xs);
    --s2a-grid-container-width: 83.4%;
    --s2a-grid-max-width: 1440px;
  }
}

/* =========================================
   Containers
   ========================================= */

/* Standard Container — mobile-first: padding-based, then width-based at 768+ */
.container {
  width: 100%;
  max-width: var(--s2a-grid-max-width);
  margin-left: auto;
  margin-right: auto;
  padding-left: var(--s2a-spacing-lg);
  padding-right: var(--s2a-spacing-lg);
  position: relative;
}

@media (min-width: 768px) {
  .container {
    width: var(--s2a-grid-container-width);
    padding-left: 0;
    padding-right: 0;
  }
}

/* desktop 1441+ — standard container rises to the HD cap. The range begins
   at 1441 so that 1440, the width every desktop mockup is drawn at, is
   unambiguously inside the desktop range; the token CSS (tokens.responsive.xl)
   and the grid-foundation contract start their top range at the same width. */
@media screen and (min-width: 1441px) {
  .container {
    /* HD cap: 1920, as decided in container-standard STD_MAX_1440_OR_1920 —
       1440 through LG, 1920 from XL, matching Figma's default container family. */
    max-width: var(--s2a-grid-hd-max-width);
  }

  .container-hd {
    max-width: var(--s2a-grid-hd-max-width);
  }
}

/* Fluid Container */
.container-fluid {
  width: 100%;
  max-width: 100%;
  --s2a-grid-container-width: 100%;
}

/* HD Container — mobile-first: padding-based, then width-based at 768+ */
.container-hd {
  width: 100%;
  max-width: var(--s2a-grid-hd-max-width);
  margin-left: auto;
  margin-right: auto;
  padding-left: var(--s2a-spacing-lg);
  padding-right: var(--s2a-spacing-lg);
}

@media (min-width: 768px) {
  .container-hd {
    width: var(--s2a-grid-container-width);
    padding-left: 0;
    padding-right: 0;
  }
}

/* Hero offset container */
.container-hero-offset {
  width: 100%;
  margin-left: auto;
  margin-right: auto;
  padding-left: var(--s2a-spacing-lg);
  padding-right: var(--s2a-spacing-lg);
}

@media (min-width: 768px) {
  .container-hero-offset {
    padding-left: var(--s2a-spacing-2xl);
    padding-right: var(--s2a-spacing-2xl);
  }
}

@media (min-width: 1280px) {
  .container-hero-offset {
    padding-left: var(--s2a-spacing-4xl);
    padding-right: var(--s2a-spacing-4xl);
  }
}

@media (min-width: 1441px) {
  .container-hero-offset {
    width: var(--s2a-grid-container-width);
    max-width: var(--s2a-grid-hd-max-width);
    padding-left: 0;
    padding-right: 0;
    margin-left: auto;
    margin-right: auto;
  }
}

/* Desktop Container Modifiers */
.container-12 {
  max-width: 1440px;
}

.container-10 {
  max-width: calc(((1440px - (11 * var(--s2a-grid-gutter))) / 12) * 10 + (9 * var(--s2a-grid-gutter)));
}

.container-8 {
  max-width: calc(((1440px - (11 * var(--s2a-grid-gutter))) / 12) * 8 + (7 * var(--s2a-grid-gutter)));
}

.container-6 {
  max-width: calc(((1440px - (11 * var(--s2a-grid-gutter))) / 12) * 6 + (5 * var(--s2a-grid-gutter)));
}

/* =========================================
   Row (Grid Wrapper)
   ========================================= */
.row {
  display: grid;
  grid-template-columns: repeat(var(--s2a-grid-columns), 1fr);
  gap: var(--s2a-grid-gutter);
}

/* Default Mobile (xs) Columns */
[class*="col-"] {
  grid-column: span var(--s2a-grid-columns);
}

/* =========================================
   Grid Utilities
   ========================================= */
.items-center {
  align-items: center;
}

.justify-center {
  justify-content: center;
}

.justify-between {
  justify-content: space-between;
}

.gap-0 {
  gap: 0;
}

.gap-y {
  row-gap: var(--s2a-grid-gutter);
}

/* =========================================
   Column Spans — Mobile / Default (6 cols)
   ========================================= */
.col-sm-1 { grid-column: auto / span 1; }
.col-sm-2 { grid-column: auto / span 2; }
.col-sm-3 { grid-column: auto / span 3; }
.col-sm-4 { grid-column: auto / span 4; }
.col-sm-5 { grid-column: auto / span 5; }
.col-sm-6 { grid-column: auto / span 6; }
.col-sm-full { grid-column: 1 / -1; }

.start-sm-1 { grid-column-start: 1; }
.start-sm-2 { grid-column-start: 2; }
.start-sm-3 { grid-column-start: 3; }
.start-sm-4 { grid-column-start: 4; }
.start-sm-5 { grid-column-start: 5; }
.start-sm-6 { grid-column-start: 6; }

/* =========================================
   Column Spans — Tablet (768px+) & Desktop (1280px+)
   ========================================= */
@media (min-width: 768px) {
  /* Tablet & Desktop Base: .col-lg-* sets the layout */
  .col-lg-1  { grid-column: auto / span 1; }
  .col-lg-2  { grid-column: auto / span 2; }
  .col-lg-3  { grid-column: auto / span 3; }
  .col-lg-4  { grid-column: auto / span 4; }
  .col-lg-5  { grid-column: auto / span 5; }
  .col-lg-6  { grid-column: auto / span 6; }
  .col-lg-7  { grid-column: auto / span 7; }
  .col-lg-8  { grid-column: auto / span 8; }
  .col-lg-9  { grid-column: auto / span 9; }
  .col-lg-10 { grid-column: auto / span 10; }
  .col-lg-11 { grid-column: auto / span 11; }
  .col-lg-12 { grid-column: auto / span 12; }
  .col-lg-full { grid-column: 1 / -1; }

  .start-lg-1  { grid-column-start: 1; }
  .start-lg-2  { grid-column-start: 2; }
  .start-lg-3  { grid-column-start: 3; }
  .start-lg-4  { grid-column-start: 4; }
  .start-lg-5  { grid-column-start: 5; }
  .start-lg-6  { grid-column-start: 6; }
  .start-lg-7  { grid-column-start: 7; }
  .start-lg-8  { grid-column-start: 8; }
  .start-lg-9  { grid-column-start: 9; }
  .start-lg-10 { grid-column-start: 10; }
  .start-lg-11 { grid-column-start: 11; }
  .start-lg-12 { grid-column-start: 12; }

  /* Tablet specific overrides: .col-md-* overrides .col-lg-* on tablet */
  .col-md-1  { grid-column: auto / span 1; }
  .col-md-2  { grid-column: auto / span 2; }
  .col-md-3  { grid-column: auto / span 3; }
  .col-md-4  { grid-column: auto / span 4; }
  .col-md-5  { grid-column: auto / span 5; }
  .col-md-6  { grid-column: auto / span 6; }
  .col-md-7  { grid-column: auto / span 7; }
  .col-md-8  { grid-column: auto / span 8; }
  .col-md-9  { grid-column: auto / span 9; }
  .col-md-10 { grid-column: auto / span 10; }
  .col-md-11 { grid-column: auto / span 11; }
  .col-md-12 { grid-column: auto / span 12; }
  .col-md-full { grid-column: 1 / -1; }

  .start-md-1  { grid-column-start: 1; }
  .start-md-2  { grid-column-start: 2; }
  .start-md-3  { grid-column-start: 3; }
  .start-md-4  { grid-column-start: 4; }
  .start-md-5  { grid-column-start: 5; }
  .start-md-6  { grid-column-start: 6; }
  .start-md-7  { grid-column-start: 7; }
  .start-md-8  { grid-column-start: 8; }
  .start-md-9  { grid-column-start: 9; }
  .start-md-10 { grid-column-start: 10; }
  .start-md-11 { grid-column-start: 11; }
  .start-md-12 { grid-column-start: 12; }
}

/* Desktop (1280px+) — .col-lg-* overrides .col-md-* */
@media (min-width: 1280px) {
  .col-lg-1  { grid-column: auto / span 1; }
  .col-lg-2  { grid-column: auto / span 2; }
  .col-lg-3  { grid-column: auto / span 3; }
  .col-lg-4  { grid-column: auto / span 4; }
  .col-lg-5  { grid-column: auto / span 5; }
  .col-lg-6  { grid-column: auto / span 6; }
  .col-lg-7  { grid-column: auto / span 7; }
  .col-lg-8  { grid-column: auto / span 8; }
  .col-lg-9  { grid-column: auto / span 9; }
  .col-lg-10 { grid-column: auto / span 10; }
  .col-lg-11 { grid-column: auto / span 11; }
  .col-lg-12 { grid-column: auto / span 12; }
  .col-lg-full { grid-column: 1 / -1; }

  .start-lg-1  { grid-column-start: 1; }
  .start-lg-2  { grid-column-start: 2; }
  .start-lg-3  { grid-column-start: 3; }
  .start-lg-4  { grid-column-start: 4; }
  .start-lg-5  { grid-column-start: 5; }
  .start-lg-6  { grid-column-start: 6; }
  .start-lg-7  { grid-column-start: 7; }
  .start-lg-8  { grid-column-start: 8; }
  .start-lg-9  { grid-column-start: 9; }
  .start-lg-10 { grid-column-start: 10; }
  .start-lg-11 { grid-column-start: 11; }
  .start-lg-12 { grid-column-start: 12; }
}

/* =========================================
   Gutter Overrides
   ========================================= */
.gutter-32 { --s2a-grid-gutter: var(--s2a-spacing-xl); }  /* 32px */
.gutter-16 { --s2a-grid-gutter: var(--s2a-spacing-md); }  /* 16px */
.gutter-8  { --s2a-grid-gutter: var(--s2a-spacing-xs); }  /* 8px */
.gutter-0  { --s2a-grid-gutter: 0; }

/* =========================================
   Bento / Modular Grid
   ========================================= */

/* Bento Grid Container — dense packing */
.bento-grid {
  display: grid;
  grid-template-columns: repeat(var(--s2a-grid-columns), 1fr);
  grid-auto-rows: var(--s2a-grid-row-height);
  grid-auto-flow: dense;
  gap: var(--s2a-grid-gutter);
}

/* =========================================
   Row Spanning Utilities
   ========================================= */

/* Mobile Row Spans */
.row-span-sm-1    { grid-row: span 1; }
.row-span-sm-2    { grid-row: span 2; }
.row-span-sm-3    { grid-row: span 3; }
.row-span-sm-4    { grid-row: span 4; }
.row-span-sm-5    { grid-row: span 5; }
.row-span-sm-6    { grid-row: span 6; }
.row-span-sm-7    { grid-row: span 7; }
.row-span-sm-8    { grid-row: span 8; }
.row-span-sm-9    { grid-row: span 9; }
.row-span-sm-10   { grid-row: span 10; }
.row-span-sm-11   { grid-row: span 11; }
.row-span-sm-12   { grid-row: span 12; }
.row-span-sm-full { grid-row: 1 / -1; }

/* Tablet & Desktop Row Spans */
@media (min-width: 768px) {
  .row-span-lg-1    { grid-row: span 1; }
  .row-span-lg-2    { grid-row: span 2; }
  .row-span-lg-3    { grid-row: span 3; }
  .row-span-lg-4    { grid-row: span 4; }
  .row-span-lg-5    { grid-row: span 5; }
  .row-span-lg-6    { grid-row: span 6; }
  .row-span-lg-7    { grid-row: span 7; }
  .row-span-lg-8    { grid-row: span 8; }
  .row-span-lg-9    { grid-row: span 9; }
  .row-span-lg-10   { grid-row: span 10; }
  .row-span-lg-11   { grid-row: span 11; }
  .row-span-lg-12   { grid-row: span 12; }
  .row-span-lg-full { grid-row: 1 / -1; }

  .row-span-md-1    { grid-row: span 1; }
  .row-span-md-2    { grid-row: span 2; }
  .row-span-md-3    { grid-row: span 3; }
  .row-span-md-4    { grid-row: span 4; }
  .row-span-md-5    { grid-row: span 5; }
  .row-span-md-6    { grid-row: span 6; }
  .row-span-md-7    { grid-row: span 7; }
  .row-span-md-8    { grid-row: span 8; }
  .row-span-md-9    { grid-row: span 9; }
  .row-span-md-10   { grid-row: span 10; }
  .row-span-md-11   { grid-row: span 11; }
  .row-span-md-12   { grid-row: span 12; }
  .row-span-md-full { grid-row: 1 / -1; }
}

@media (min-width: 1280px) {
  .row-span-lg-1    { grid-row: span 1; }
  .row-span-lg-2    { grid-row: span 2; }
  .row-span-lg-3    { grid-row: span 3; }
  .row-span-lg-4    { grid-row: span 4; }
  .row-span-lg-5    { grid-row: span 5; }
  .row-span-lg-6    { grid-row: span 6; }
  .row-span-lg-7    { grid-row: span 7; }
  .row-span-lg-8    { grid-row: span 8; }
  .row-span-lg-9    { grid-row: span 9; }
  .row-span-lg-10   { grid-row: span 10; }
  .row-span-lg-11   { grid-row: span 11; }
  .row-span-lg-12   { grid-row: span 12; }
  .row-span-lg-full { grid-row: 1 / -1; }
}
`})))()}function x({family:e,kind:t,theme:n,overlay:r,tablet:i,orphan:a}){let o=S.find(t=>t.id===e)?.id||`container`,s=n===`dark`,l;return l=t===`columns`?`<div class="layout row"><article class="tile copy col-sm-full col-lg-7 ${i?`col-md-6`:``}"><span class="eyebrow">One shared structure</span><h1>Make room for your next idea.</h1><p>Copy and media share an alignment system while keeping their own proportions.</p></article><div class="tile media col-sm-full col-lg-5 ${i?`col-md-6`:``}" role="img" aria-label="Media placeholder">${T}</div></div>`:t===`bento`?`<div class="layout bento-grid">${[6,3,3,3,3].map((e,t)=>`<article class="tile col-sm-full col-lg-${e} row-span-sm-1 row-span-lg-${t===0?2:1}"><strong>${t===0?`A focal point`:`Supporting story ${t}`}</strong><span class="eyebrow">${e} columns · ${t===0?2:1} rows at desktop</span></article>`).join(``)}</div>`:`<div class="layout ${t===`objects`?`objects`:`ups ${a?`orphan`:``}`}">${Array.from({length:t===`objects`?5:7},(e,n)=>`<article class="tile"><span class="eyebrow">${String(n+1).padStart(2,`0`)}</span><h2>${[`Discover`,`Explore`,`Create`,`Collaborate`,`Refine`,`Share`,`Keep learning`][n]}</h2><small>${t===`objects`?`Sized by the object`:`Arranged by the row`}</small></article>`).join(``)}</div>`,`<!doctype html><html lang="en" data-theme="${s?`dark`:`light`}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Grid layout preview</title><style>${c}\n${y}\n${w}</style></head><body data-overlay="${!!r}"><main><div class="${o}"><div class="canvas">${l}<div class="overlay" aria-hidden="true">${`<i></i>`.repeat(12)}</div></div></div></main></body></html>`}var S,C,w,T;function E(){return(E=e((()=>{b(),o(),S=[{id:`container`,name:`Standard`,description:`An aligned content area for everyday sections. Above mobile, it uses 83.4% of the viewport and stops at 1440px.`},{id:`container-hd`,name:`HD`,description:`More room for wide media and large compositions. The percentage rule continues to a 1920px ceiling.`},{id:`container-hero-offset`,name:`Hero offset`,description:`Token-based padding through tablet and desktop. At 1440px, the current CSS switches to the percentage rule with a 1920px ceiling.`},{id:`container-fluid`,name:`Fluid`,description:`Use all available width when content needs to reach the edges. The current CSS has no fixed pixel ceiling.`},{id:`container container-8`,name:`Constrained · 8 columns`,description:`A narrower content measure, centered by the standard container. The cap uses eight columns of the 1440px grid.`}],C=[{id:`columns`,name:`Column grid`,tag:`Shipped CSS`,description:`Choose how many columns each item spans. Shared edges connect headings, copy, media, and cards.`,rule:`7 + 5 columns on desktop; optional 6 + 6 on tablet; stacked on mobile.`},{id:`bento`,name:`Bento grid`,tag:`Shipped CSS`,description:`Choose both column and row spans to build a modular composition. Keep reading order meaningful when dense placement fills gaps.`,rule:`Column spans share the grid. Row spans use the shipped 120px row unit.`},{id:`objects`,name:`Object grid`,tag:`Illustrative proposal`,description:`Let each object’s minimum and maximum size decide how many fit. Items wrap as available space changes.`,rule:`This example uses a 230px minimum and a 320px maximum. These are example constraints, not approved system tokens.`},{id:`ups`,name:`N-up grid`,tag:`Documented behavior`,description:`Choose a fixed number of cards per row. This block-level pattern controls reflow explicitly at each breakpoint.`,rule:`Three-up on desktop, two-up on tablet, stacked on mobile. Optionally expand a lone last item.`}],w=`
*{box-sizing:border-box}html,body{margin:0;padding:0}body{background:var(--s2a-color-surface-subtle);color:var(--s2a-color-content-default);font:var(--s2a-font-size-md)/var(--s2a-font-line-height-md) var(--s2a-font-family-body)}
main{padding-block:var(--s2a-spacing-xl)}h1,h2,p{margin:0}h1{font:var(--s2a-font-weight-heading) var(--s2a-font-size-3xl)/var(--s2a-font-line-height-xl) var(--s2a-font-family-heading);letter-spacing:var(--s2a-font-letter-spacing-6xl);max-width:17ch}h2{font-size:var(--s2a-font-size-xl);line-height:var(--s2a-font-line-height-md)}p{max-width:45ch}.eyebrow{font-size:var(--s2a-font-size-xs);letter-spacing:var(--s2a-font-letter-spacing-6xl);text-transform:uppercase;font-weight:var(--s2a-font-weight-label)}
.canvas{position:relative;outline:var(--s2a-border-width-sm) solid var(--s2a-color-border-accent);outline-offset:-1px}.layout{position:relative}.tile{min-width:0;padding:var(--s2a-spacing-lg);border:var(--s2a-border-width-sm) solid var(--s2a-color-border-subtle);border-radius:var(--s2a-border-radius-sm);background:var(--s2a-color-surface-default)}
.copy{display:flex;flex-direction:column;justify-content:center;gap:var(--s2a-spacing-md);min-height:260px}.media{display:grid;place-items:center;min-height:260px;background:color-mix(in srgb,var(--s2a-color-border-accent) 9%,var(--s2a-color-surface-default))}.media svg{width:60%;max-width:220px;fill:none;stroke:var(--s2a-color-border-accent);stroke-width:var(--s2a-border-width-sm)}.caption{margin-top:var(--s2a-spacing-xs);font-size:var(--s2a-font-size-xs);color:var(--s2a-color-content-body-subtle)}
.bento-grid .tile{display:flex;flex-direction:column;justify-content:space-between;min-height:0}.bento-grid .tile:first-child{background:color-mix(in srgb,var(--s2a-color-border-accent) 9%,var(--s2a-color-surface-default))}
.objects{display:flex;flex-wrap:wrap;gap:var(--s2a-grid-gutter)}.objects .tile{flex:1 1 230px;min-width:min(100%,230px);max-width:320px;min-height:124px}
.ups{display:grid;grid-template-columns:1fr;gap:var(--s2a-grid-gutter)}.ups .tile{min-height:124px}.tile small{display:block;color:var(--s2a-color-content-body-subtle);margin-top:var(--s2a-spacing-xs)}
@media(min-width:768px){.ups{grid-template-columns:repeat(2,minmax(0,1fr))}.ups.orphan .tile:last-child:nth-child(2n+1){grid-column:1/-1}}
@media(min-width:1280px){.ups{grid-template-columns:repeat(3,minmax(0,1fr))}.ups.orphan .tile:last-child:nth-child(2n+1){grid-column:auto}.ups.orphan .tile:last-child:nth-child(3n+1){grid-column:1/-1}}
.overlay{position:absolute;inset:0;pointer-events:none;display:grid;grid-template-columns:repeat(var(--s2a-grid-columns),minmax(0,1fr));gap:var(--s2a-grid-gutter)}.overlay i{background:color-mix(in srgb,var(--s2a-color-border-accent) 8%,transparent);border-inline:var(--s2a-border-width-sm) solid color-mix(in srgb,var(--s2a-color-border-accent) 28%,transparent)}
.overlay i:nth-child(n+7){display:none}@media(min-width:768px){.overlay i:nth-child(n+7){display:block}}body[data-overlay=false] .overlay{display:none}
`,T=`<svg viewBox="0 0 240 180" aria-hidden="true"><rect x="20" y="20" width="200" height="140" rx="12"/><circle cx="170" cy="62" r="16"/><path d="m20 140 60-58 44 42 30-25 66 61"/></svg>`})))()}function D(e,t){let n=_.variables.find(t=>t.id===e),r=n.values[j[t]]??Object.values(n.values)[0];return r?.type===`VARIABLE_ALIAS`?D(r.id,t):r}var O,k,A,j,M,N;function P(){return(P=e((()=>{i(),s(),v(),o(),E(),O=e=>`${Number(e.toFixed(2))}px`,k=e=>`./?path=/story/foundations-grid-${e}`,A=(e,n,r)=>t`<div class="gg-section-head">
    <span class="fg-eyebrow">${e}</span>
    <h2>${n}</h2>
    <p>${r}</p>
  </div>`,j={sm:`2297:1`,md:`102:1`,lg:`102:0`,xl:`3933:0`},M=class extends r{static properties={theme:{},view:{},width:{state:!0},family:{state:!0},kind:{state:!0},overlay:{state:!0},tablet:{state:!0},orphan:{state:!0},measured:{state:!0},stageWidth:{state:!0},styleMode:{state:!0},styleIndex:{state:!0},sampleWidth:{state:!0}};constructor(){super(),this.theme=`light`,this.view=`overview`,this.width=1440,this.family=`container`,this.kind=`columns`,this.overlay=!0,this.tablet=!0,this.orphan=!0,this.measured=null,this.stageWidth=1e3,this.styleMode=`lg`,this.styleIndex=0,this.sampleWidth=1440}createRenderRoot(){return this}observeStage(){let e=this.querySelector(`.gg-preview-viewport`);e!==this.observedStage&&(this.observer?.disconnect(),this.observedStage=e,e&&(this.observer=new ResizeObserver(([e])=>{this.stageWidth=e.contentRect.width}),this.observer.observe(e)))}disconnectedCallback(){super.disconnectedCallback(),this.observer?.disconnect(),this.observedStage=null,cancelAnimationFrame(this.measureFrame)}updated(e){this.observeStage(),e.has(`width`)&&this.scheduleMeasure()}scheduleMeasure(){cancelAnimationFrame(this.measureFrame),this.measureFrame=requestAnimationFrame(()=>{let e=this.querySelector(`iframe`),t=e?.contentDocument,n=t?.querySelector(`.canvas`);if(!n)return;let r=n.getBoundingClientRect(),i=e.contentWindow.getComputedStyle(t.documentElement);this.measured={content:r.width,margin:r.left,columns:Number(i.getPropertyValue(`--s2a-grid-columns`)),gutter:parseFloat(i.getPropertyValue(`--s2a-grid-gutter`)),height:t.body.scrollHeight}})}jump(e,t){e.preventDefault();let n=this.querySelector(`#${t}`);n?.scrollIntoView({block:`start`}),n?.focus({preventScroll:!0})}anatomy(){return t`<section class="gg-section" id="gg-intent" tabindex="-1">
      ${A(`01 / System intent`,`One alignment system. Different ways to compose.`,`Start outside and work inward. Each layer answers a different layout question.`)}
      <div class="gg-anatomy">
        <div
          class="gg-box-model"
          role="img"
          aria-label="The viewport contains outer margins, a centered container, a column grid, and content spanning the columns."
        >
          <span class="gg-box-label">Viewport</span>
          <div class="gg-box-container">
            <span class="gg-box-label">Container</span>
            <div class="gg-box-grid">
              ${Array.from({length:12},()=>t`<i></i>`)}
              <div class="gg-box-copy">
                Content<br /><small>7 columns</small>
              </div>
              <div class="gg-box-media">
                Media<br /><small>5 columns</small>
              </div>
            </div>
            <div class="gg-box-measure">← Shared content edges →</div>
          </div>
          <div class="gg-box-footer">
            <span>Outer margin</span><span>8px between columns</span
            ><span>Outer margin</span>
          </div>
        </div>
        <ol class="gg-steps">
          <li>
            <strong>Set the viewport</strong>
            <p>The available width selects a responsive range.</p>
          </li>
          <li>
            <strong>Choose a container</strong>
            <p>Set the content boundary, side margins, and maximum width.</p>
          </li>
          <li>
            <strong>Choose the arrangement</strong>
            <p>
              Use column spans, object sizes, or an explicit number of items per
              row.
            </p>
          </li>
          <li>
            <strong>Decide how content reflows</strong>
            <p>
              Keep desktop proportions on tablet, or deliberately adjust them.
              Stack when space gets tight.
            </p>
          </li>
        </ol>
      </div>
      <div class="gg-principles">
        <article>
          <span class="fg-eyebrow">Global</span>
          <h3>Shared boundaries</h3>
          <p>
            Containers, responsive ranges, and the 6 / 12-column foundation
            align the page.
          </p>
        </article>
        <article>
          <span class="fg-eyebrow">Sectional</span>
          <h3>Flexible composition</h3>
          <p>
            Column and bento layouts position content. Object layouts respond to
            item constraints.
          </p>
        </article>
        <article>
          <span class="fg-eyebrow">Block</span>
          <h3>Purposeful reflow</h3>
          <p>
            N-up and orphan behavior belong to the block’s content rules. They
            need an explicit choice.
          </p>
        </article>
      </div>
    </section>`}playground(){let e=S.find(e=>e.id===this.family),r=C.find(e=>e.id===this.kind),i=Math.min(1,this.stageWidth/this.width),o=this.measured;return t`<section class="gg-section" id="gg-playground" tabindex="-1">
      ${A(`02 / Explore the behavior`,`Give the layout some room.`,`Change the viewport, container, and arrangement. The preview has its own viewport, so its media queries respond to the width you choose.`)}
      <div class="gg-lab">
        <div class="gg-controls">
          <label class="fg-field"
            >Container<select
              aria-label="Container"
              .value=${this.family}
              @change=${e=>this.family=e.target.value}
            >
              ${S.map(e=>t`<option value=${e.id} ?selected=${this.family===e.id}>${e.name}</option>`)}
            </select></label
          >
          <label class="fg-field"
            >Arrangement<select
              aria-label="Arrangement"
              .value=${this.kind}
              @change=${e=>this.kind=e.target.value}
            >
              ${C.map(e=>t`<option value=${e.id} ?selected=${this.kind===e.id}>${e.name}</option>`)}
            </select></label
          >
          <label class="gg-checkbox"
            ><input
              type="checkbox"
              .checked=${this.overlay}
              @change=${e=>this.overlay=e.target.checked}
            />Column overlay</label
          >
        </div>
        <div class="gg-width-control">
          <label for="gg-width"
            >Viewport <output for="gg-width">${this.width}px</output></label
          ><input
            id="gg-width"
            aria-label="Viewport width"
            type="range"
            min="320"
            max="2560"
            step="1"
            .value=${String(this.width)}
            @input=${e=>this.width=Number(e.target.value)}
          />
          <div class="gg-presets" role="group" aria-label="Viewport presets">
            ${[[375,`Mobile`],[768,`Tablet`],[1440,`Desktop`],[2560,`Wide`]].map(([e,n])=>t`<button
                  aria-pressed=${String(this.width===e)}
                  @click=${()=>this.width=e}
                >
                  ${n}<span>${e}</span>
                </button>`)}
          </div>
        </div>
        <div class="gg-preview-meta">
          <span>${r.tag}</span
          ><span
            >${Math.round(i*100)}% scale ·
            ${this.width<768?`S · mobile`:this.width<1280?`M · tablet`:this.width<=1440?`L · desktop`:`XL · wide`}</span
          >
        </div>
        <div
          class="gg-preview-viewport"
          style=${a({height:`${(o?.height??390)*i}px`})}
        >
          <iframe
            title="Live responsive grid preview"
            sandbox="allow-same-origin"
            scrolling="no"
            style=${a({width:`${this.width}px`,height:`${o?.height??390}px`,transform:`scale(${i})`})}
            .srcdoc=${x(this)}
            @load=${()=>this.scheduleMeasure()}
          ></iframe>
        </div>
        <dl class="gg-readouts" aria-live="polite">
          <div>
            <dt>Content width</dt>
            <dd>${o?O(o.content):`…`}</dd>
          </div>
          <div>
            <dt>Each outer margin</dt>
            <dd>${o?O(o.margin):`…`}</dd>
          </div>
          <div>
            <dt>Columns</dt>
            <dd>${o?.columns??`…`}</dd>
          </div>
          <div>
            <dt>Gutter</dt>
            <dd>${o?O(o.gutter):`…`}</dd>
          </div>
        </dl>
        <div class="gg-preview-options">
          ${this.kind===`columns`?t`<label class="gg-checkbox"><input type="checkbox" .checked=${this.tablet} @change=${e=>this.tablet=e.target.checked} />Use equal columns on tablet</label>`:this.kind===`ups`?t`<label class="gg-checkbox"><input type="checkbox" .checked=${this.orphan} @change=${e=>this.orphan=e.target.checked} />Expand a lone last item</label>`:n}
          <p>${r.rule}</p>
        </div>
      </div>
      <div class="gg-explanation">
        <div>
          <h3>${e.name} container</h3>
          <p>${e.description}</p>
        </div>
        <div>
          <h3>${r.name}</h3>
          <p>${r.description}</p>
        </div>
      </div>
      <p class="gg-source-note">
        Standard, HD, Hero offset, Fluid, column, and bento previews use the
        repository’s grid stylesheet. Object and N-up arrangements demonstrate
        the documented concepts; they are not exported S2A grid classes.
      </p>
      <details class="gg-details">
        <summary>Implementation details and known differences</summary>
        <p>
          The current Hero offset switches at 1440px; responsive XL tokens start
          at 1441px. Standard remains capped at 1440px. Will’s V4 Default and
          Fixed families use a 1920px ceiling. The comparison below preserves
          that distinction.
        </p>
        <p><code>packages/grid/src/s2a-layout-grids.css</code></p>
        <a
          class="gg-link"
          href=${k(`conformance--conformance`)}
          target="_top"
          >View the contract checks →</a
        >
      </details>
    </section>`}containers(){let e=_.v4.samples.filter(e=>e.width===this.sampleWidth);return t`<section class="gg-section" id="gg-containers" tabindex="-1">
      ${A(`03 / Will’s V4 containers`,`Same grid. Three content boundaries.`,`These diagrams use measured frames from the newer resource kit. Select a viewport to compare the actual Default, Fixed, and Fluid examples.`)}
      <div class="gg-presets" role="group" aria-label="Figma example viewport">
        ${[767,768,1440,2560].map(e=>t`<button aria-pressed=${String(this.sampleWidth===e)} @click=${()=>this.sampleWidth=e}>${e}px</button>`)}
      </div>
      <div class="gg-families">
        ${e.map(e=>{let n=_.v4.collection.modes.find(t=>t.modeId===e.modes[_.v4.collection.id]),r=e.modes[`VariableCollectionId:6:178`]===j.sm?6:12;return t`<article>
            <div class="gg-family-head">
              <h3>${n.name}</h3>
              <span>${O(e.container.width)} content</span>
            </div>
            <div class="gg-family-track" aria-hidden="true">
              <div
                style=${a({width:`${e.container.width/e.width*100}%`,"--gg-columns":r,"--gg-gap":`${8/e.width*100}cqw`})}
              >
                ${Array.from({length:r},()=>t`<i></i>`)}
              </div>
            </div>
            <div class="gg-family-measure">
              <span>${O(e.container.x)} each side</span
              ><a
                class="gg-link"
                href=${l(e.id)}
                target="_blank"
                rel="noreferrer"
                >Figma frame ↗</a
              >
            </div>
            <p>
              ${n.name===`Default`?`Percentage intent with a 1920px ceiling; mobile uses spacing-lg margins.`:n.name===`Fixed`?`24px side margins until the 1920px content ceiling adds more outer space.`:`Edge-to-edge content, with a 2560px maximum in the V4 collection.`}
            </p>
          </article>`})}
      </div>
      <div class="gg-note">
        <strong>Read the frame and the rule together.</strong>
        <p>
          The desktop notes describe 83.4% content width. The 1440px frame
          rounds that to 1200px; the 768px frame is 640px. At 1279px, the
          current Default frame keeps 64px margins, so it does not follow the
          percentage rule throughout tablet. These are source measurements, not
          a new CSS specification.
        </p>
      </div>
    </section>`}styles(){let e=_.gridStyles[this.styleIndex],r=e.grids[0],i=r.boundVariables,o=i.count?D(i.count.id,this.styleMode):r.count,s=i.gutterSize?D(i.gutterSize.id,this.styleMode):r.gutterSize,c=i.offset?D(i.offset.id,this.styleMode):r.offset,u={sm:375,md:1024,lg:1440,xl:1920}[this.styleMode];return t`<section class="gg-section" id="gg-styles" tabindex="-1">
      ${A(`04 / Figma grid styles`,`Make the guides match the frame.`,`Three local column styles are available in the file. A style can bind its column count, gap, and offset to variables; its name alone does not tell you how it behaves.`)}
      <div class="gg-style-cards" role="group" aria-label="Figma grid style">
        ${_.gridStyles.map((e,n)=>t`<button class="gg-style-card" aria-pressed=${String(this.styleIndex===n)} @click=${()=>this.styleIndex=n}><span class="gg-style-mini" aria-hidden="true" style=${a({"--gg-columns":n===2?6:12})}>${Array.from({length:n===2?6:12},()=>t`<i></i>`)}</span><strong>${e.name}</strong><span>${n===0?`Mode-driven · no offset`:n===1?`Mode-driven · inset guide`:`Fixed · six columns`}</span></button>`)}
      </div>
      <div class="gg-style-stage">
        <div class="gg-controls">
          <h3>${e.name}</h3>
          <label class="fg-field"
            >Figma mode<select
              aria-label="Figma mode"
              .value=${this.styleMode}
              @change=${e=>this.styleMode=e.target.value}
            >
              ${Object.keys(j).map(e=>t`<option value=${e} ?selected=${this.styleMode===e}>${e.toUpperCase()}</option>`)}
            </select></label
          >
        </div>
        <div class="gg-style-ruler">
          <span>${O(c)} offset</span><span>${u}px example frame</span
          ><span>${O(c)} offset</span>
        </div>
        <div
          class="gg-style-plate"
          role="img"
          aria-label=${`${e.name} in ${this.styleMode}: ${o} columns, ${s}px gutter, ${O(c)} offset on each side of a ${u}px example frame.`}
        >
          <div
            style=${a({"--gg-columns":o,"--gg-gap":`${s/u*100}cqw`,marginInline:`${c/u*100}%`})}
          >
            ${Array.from({length:o},(e,n)=>t`<i><span>${n+1}</span></i>`)}
          </div>
        </div>
        <dl class="gg-readouts">
          <div>
            <dt>Columns</dt>
            <dd>${o}</dd>
          </div>
          <div>
            <dt>Gutter</dt>
            <dd>${s}px</dd>
          </div>
          <div>
            <dt>Each offset</dt>
            <dd>${O(c)}</dd>
          </div>
          <div>
            <dt>Guide alignment</dt>
            <dd>Stretch</dd>
          </div>
        </dl>
      </div>
      <div class="gg-explanation">
        <div>
          <h3>
            ${this.styleIndex===0?`Apply to the content frame`:this.styleIndex===1?`Account for the guide’s inset`:`Use for a fixed mobile guide`}
          </h3>
          <p>
            ${this.styleIndex===0?`Will’s current container examples use Grid - mode with zero offset. The container supplies the outside margins; the grid guides fill the content area.`:this.styleIndex===1?`Grid - 12 col binds its offset and count to the mode collection. It becomes six columns in SM despite its name. Avoid adding this inset to a container that already accounts for the same margins.`:`Grid - 6 col has no variable bindings. It stays at six columns with an 8px gutter and zero offset, regardless of the selected mode.`}
          </p>
        </div>
        <div>
          <h3>Mode changes are explicit in Figma</h3>
          <p>
            Changing a frame’s width does not select a variable mode
            automatically. Set the responsive mode on the frame or its parent,
            then check the guide and the content’s reflow.
          </p>
        </div>
      </div>
      ${this.styleIndex<2?t`<div
              class="gg-token-flow"
              aria-label="Grid style token connections"
            >
              <div>
                <span class="fg-eyebrow">Responsive collection</span
                ><code>s2a/layout guide/_columns</code
                ><strong
                  >${o} columns in ${this.styleMode.toUpperCase()}</strong
                >
              </div>
              <span aria-hidden="true">+</span>
              <div>
                <span class="fg-eyebrow">Shared spacing</span
                ><code>gap → s2a/spacing/xs</code
                ><strong>${s}px gutter in every mode</strong>
              </div>
              <span aria-hidden="true">→</span>
              <div>
                <span class="fg-eyebrow">Style</span><code>${e.name}</code
                ><strong>Stretch to the frame</strong>
              </div>
            </div>`:n}
      <details class="gg-details">
        <summary>Source names, bindings, and limitations</summary>
        <p>
          Inspected ${_.inspectedAt}. The stored description for Grid -
          mode says “6 col tablet”; its actual binding resolves to six in SM and
          twelve in MD, LG, and XL. The visualizer follows the binding.
        </p>
        <p>
          Grid - 12 col offsets: SM 24px · MD 85.33px · LG 119.99px · XL
          159.99px. These are Figma guide values, not live percentage margins.
          Variables with an underscore are design-only frame mechanics and are
          excluded from the CSS token build.
        </p>
        <a
          class="gg-link"
          href=${l(_.pageId)}
          target="_blank"
          rel="noreferrer"
          >Inspect the Layout page in Figma ↗</a
        >
      </details>
    </section>`}next(){return t`<section class="gg-section gg-next" id="gg-use" tabindex="-1">
      ${A(`05 / Put it to work`,`Choose the rule that fits the content.`,`Use shared structure for alignment, then make deliberate choices about how the content adapts.`)}
      <div class="gg-principles">
        ${C.filter(e=>e.id!==`bento`).map(e=>t`<article>
                <span class="fg-eyebrow">${e.tag}</span>
                <h3>${e.name}</h3>
                <p>${e.description}</p>
                <button
                  class="gg-link"
                  @click=${t=>{this.kind=e.id,this.jump(t,`gg-playground`)}}
                >
                  Try ${e.name.toLowerCase()} ↑
                </button>
              </article>`)}
      </div>
      <div class="gg-reference-links">
        <a href=${k(`containers--all-families`)} target="_top"
          >Container reference →</a
        ><a href=${k(`column-grid--column-grid`)} target="_top"
          >Column utilities →</a
        ><a href=${k(`section-spacing--section-spacing`)} target="_top"
          >Section spacing →</a
        ><a href=${l(`4907:6970`)} target="_blank" rel="noreferrer"
          >Will’s N-up notes ↗</a
        >
      </div>
    </section>`}render(){let e=this.view===`overview`,r=e?[[`intent`,`System intent`],[`playground`,`Playground`],[`containers`,`V4 containers`],[`styles`,`Figma styles`],[`use`,`Choose a layout`]]:[];return t`<main class="fg gg" data-theme=${this.theme}>
      <header class="fg-topbar">
        <a
          class="fg-brand"
          href="./?path=/story/foundations-start-here--guide"
          target="_top"
          ><span class="fg-brand-mark">S</span>S2A
          <span class="fg-muted">/ Foundations / Grid</span></a
        >
        <div class="fg-theme-switch" role="group" aria-label="Guide theme">
          ${[`light`,`dark`].map(e=>t`<button aria-pressed=${String(this.theme===e)} @click=${()=>this.theme=e}>${e===`light`?`Light`:`Dark`}</button>`)}
        </div>
      </header>
      <div class="fg-page">
        <header class="gg-hero">
          <span class="fg-eyebrow"
            >Layout foundation · William Blanton’s system</span
          >
          <h1>
            ${e?`Structure that makes room.`:this.view===`styles`?`Guides with a purpose.`:`See the layout respond.`}
          </h1>
          <p>
            ${e?`Consistent edges. Flexible content. Explore how containers, columns, and reflow work together—from a compact screen to a wide canvas.`:this.view===`styles`?`Understand the three grid styles in Figma, the variables behind them, and where each belongs.`:`Choose a container and arrangement, then resize an independent viewport to see the rules at work.`}
          </p>
          <div class="gg-hero-facts">
            <span><strong>6 → 12</strong> responsive columns</span
            ><span><strong>8px</strong> shared gutter</span
            ><span><strong>3</strong> Figma grid styles</span>
          </div>
          <a
            class="gg-link"
            href=${l(`104:26144`)}
            target="_blank"
            rel="noreferrer"
            >Open Will’s Layout page ↗</a
          >
        </header>
        ${e?t`<nav class="gg-nav" aria-label="On this page">${r.map(([e,n])=>t`<a href=${`#gg-${e}`} @click=${t=>this.jump(t,`gg-${e}`)}>${n}</a>`)}</nav>`:t`<a class="gg-link" href=${k(`overview--overview`)} target="_top">← Grid overview</a>`}${e?this.anatomy():n}${this.view===`styles`?n:this.playground()}${e?this.containers():n}${this.view===`playground`?n:this.styles()}${e?this.next():n}
        <footer class="gg-footer">
          Figma source inspected ${_.inspectedAt} · Visual references
          preserve the difference between design intent and shipped behavior.
        </footer>
      </div>
    </main>`}},customElements.get(`s2a-grid-guide`)||customElements.define(`s2a-grid-guide`,M),N=(e,n)=>t`<s2a-grid-guide
    .view=${e}
    .theme=${n.globals.theme===`dark`?`dark`:`light`}
  ></s2a-grid-guide>`})))()}export{N as n,P as t};