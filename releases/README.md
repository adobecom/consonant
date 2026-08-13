# S2A Tokens — release contract

Consume S2A design tokens **without an npm registry**. Every release is a semver'd
tarball in this folder, and a single stable pointer always resolves to the newest one.

## The one URL to fetch

```
https://raw.githubusercontent.com/adobecom/consonant/main/releases/latest.json
```

`latest.json` is overwritten on every release and always describes the **current**
release. Per‑version manifests (`releases/<version>/manifest.json`) are **immutable**
— pin to one if you need reproducibility.

## What you get

| Field | What it's for |
|---|---|
| `name`, `version`, `released` | Identity + semver. |
| `spec` | `w3c-design-tokens` — the source JSON is DTCG format. |
| `cssVarPrefix` | `--s2a-` — the prefix to code against. |
| `artifact.tarball` | `url`, Subresource‑Integrity `integrity` (`sha256-…`), and `bytes`. The primary artifact. |
| `artifact.css` | Paths **inside** the unpacked tarball to the built CSS custom properties (primitives, semantic, semantic light/dark, responsive xl/lg/md/sm). |
| `source.dir` | Pointer to the DTCG **source** JSON on `main` (always the current spec) if you want the raw tokens rather than compiled CSS. |
| `collections` | The token catalog: each collection + its modes (e.g. `s2a-semantic-color-theme` → `light`, `dark`). |
| `tokenCount` | Count of shipped `--s2a-*` custom properties. |
| `changelog` | Link to the CHANGELOG. |

## How to consume

1. `GET latest.json` → read `version` + `artifact.tarball.url`.
2. Download the tarball, verify against `artifact.tarball.integrity`, unpack.
3. Load the CSS files under `artifact.css.*`, or read the DTCG source under `source.dir`.
4. Re‑poll `latest.json` to detect a newer `version`; it stays current automatically.

## Guarantees

- **Semver.** Breaking changes bump the major; check `version` before adopting.
- **Non‑destructive naming.** Token/CSS‑var names follow the Figma source of truth and
  are **deprecated, not silently removed** — so `--s2a-*` names you build against are stable.
- **Currency.** `latest.json` reflects the newest *release* (stable), not the tip of `main`.

## Producing a release manifest

After packaging the tarball into `releases/`:

```bash
node packages/tokens/scripts/build-release-manifest.js
# → releases/<version>/manifest.json  +  releases/latest.json
# override target repo/branch: RELEASE_REPO=adobecom/consonant RELEASE_BRANCH=main node …
```

Wire it as the final step of the release flow (e.g. after `nx package tokens`).
