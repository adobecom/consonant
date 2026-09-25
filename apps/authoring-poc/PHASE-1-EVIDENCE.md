# Phase-1 Evidence

Recorded September 14, 2026. Local engineering evidence, not production signoff.

## Checks

- TypeScript: passed.
- Unit tests: 35 passed across four files.
- Browser journeys: eight passed, including local recovery/conflicts, responsive
  layout, accessibility, actual/reduced motion and maximum-length text.
- Source census: 39 top-level components; 33 accepted specs; six missing specs
  explicitly inventoried. QuoteCard and SocialProofCarousel contracts are checked
  independently against their JavaScript input declarations.
- Pages staging: the existing Storybook index SHA-256 remained
  `cbf45da9910053b0634e506d21b1a400674ec151489a06b7ee3a2d716834310d`
  before and after adding the `authoring/` directory.
- Workflow YAML parsed locally. Remote Actions execution and deployment were not
  performed. The reusable quality job is a dependency of main/PR deployment.

## Performance

Build SHA-256: `347e6aa3dd3457276d6d2442291e3c430dd6d5703ec324d47bc70240b8036c53`.
Five cold samples per profile; 10-second observation windows; gzip static-server
responses; Chromium 151 through the locked Playwright package. The full report
contains the source commit, dirty flag, browser version, raw entries and budgets.

| Measured surface | Result |
| --- | --- |
| Mobile preview LCP, median | 1,480 ms |
| Desktop preview LCP, median | 352 ms |
| Preview CLS, both medians | 0 |
| 20-section edit-message round trip, p95 | 8 ms |
| Injected 700 ms blocking task | Detected by the same budget scorer |

Mobile uses a 390x844 viewport, DPR 2, CPU 4x slowdown, 1.6 Mbps download and 150 ms
latency. Desktop uses 1440x900, DPR 1, CPU 1x, 10 Mbps and 40 ms. These results
describe a small client-rendered fixture and a warm editor, not production initial
HTML, field INP, cold editor startup, improvement over Milo or global capacity.
Do not overwrite budgets to match a slower run; inspect the raw evidence first.

## Figma Structure

The initial Desktop Bridge connection failed, but the official Figma metadata
connection succeeded for all four planned roots in file `qAF4nlt6O4ThbeXeO7jzdb`.

| Page | Verified root | Page width | Metadata nodes | Opaque instances |
| --- | --- | --- | --- | --- |
| Homepage | `12102:175099` | 1920 | 408 | 70 |
| BizPro | `11333:235687` | 2560 | 1708 | 206 |
| CPro hub | `12164:44174` | 1920 | 377 | 95 |
| CPro offer | `13027:189173` | 2560 | 160 | 52 |

Counts include hidden layers. Self-closing instances in metadata are not proven
leaf completeness. Home has separate hidden/visible What's New branches; only
the visible branch contains the current MediaCard instances. Home's Agentic
Search is hidden while the inspected BizPro/CPro-hub search frames are visible.
BizPro Offer `11333:235874` has no child layers in metadata, but paint/background
content and the omission decision still need design approval. Invent no pricing.

Detailed leaf-to-component mapping, asset/content rights, fonts, motion parity,
manual accessibility review and real-author/Milo baselines remain open. See the
[run and hosting guide](README.md) and [inventory](inventory.json).
