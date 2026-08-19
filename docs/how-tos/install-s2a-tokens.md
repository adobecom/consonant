# Installing `@adobecom/s2a-tokens`

The S2A design tokens ship as CSS custom properties (prefix `--s2a-`). There are
**two ways to consume them** — pick based on whether your project can authenticate
to GitHub Packages.

## Do I need a token?

| Path | Token required? | Why |
|---|---|---|
| **A — `npm install` from GitHub Packages** | **Yes** — a `read:packages` token | GitHub's npm registry requires auth **even for public packages** (a documented GitHub limitation, not something we can turn off). |
| **B — Registry-free (fetch CSS/tarball by URL)** | **No** | `adobecom/consonant` is a public repo, so the release manifest and tarball are fetchable anonymously. |

Current published version: **0.0.21** (486 tokens).

---

## Option A — npm (GitHub Packages) · needs a token

**1. Create a token.** A classic PAT with the `read:packages` scope is the
reliable choice. (Fine-grained tokens can work too, but classic `read:packages`
is the best-supported path for the npm registry.)

> **Shortcut:** this link opens the classic-token page with the right scope
> already checked and the token pre-named:
> <https://github.com/settings/tokens/new?scopes=read:packages&description=s2a-tokens>

Click-by-click, if you'd rather do it by hand:

1. GitHub → your avatar (top-right) → **Settings**
2. Bottom of the left sidebar → **Developer settings**
3. **Personal access tokens → Tokens (classic)**
4. **Generate new token → Generate new token (classic)** (you may be asked to
   re-enter your password)
5. **Note:** name it something like `s2a-tokens read`
6. **Expiration:** 90 days is fine. The `adobecom` org caps token lifetime at
   **366 days** — anything longer is rejected.
7. **Scopes:** check **`read:packages`** only. That is the entire requirement to
   install; leave everything else unchecked.
8. **Generate token**, then **copy it immediately** — it starts with `ghp_` and
   is shown exactly once.
9. **⚠️ Authorize SSO — this is the step people miss.** Back on the tokens list,
   find your new token, click **Configure SSO**, and **Authorize** it for
   **`adobecom`**. Without this the token returns **401** on an org package even
   though the scope is correct.

> **Note:** a PAT is a browser-only, log-in-required, shown-once secret — no
> agent or script can mint one for you; you have to create it yourself. If that's
> a blocker, **[Option B](#option-b--registry-free--no-token) needs no token at
> all.**

**2. Point the `@adobecom` scope at GitHub Packages.** In the consuming project's
`.npmrc`:

```ini
@adobecom:registry=https://npm.pkg.github.com
//npm.pkg.github.com/:_authToken=${GITHUB_TOKEN}
```

Set `GITHUB_TOKEN` in your environment (don't commit a raw token). In CI on
GitHub Actions, the built-in `GITHUB_TOKEN` already has package read — no PAT
needed there.

**3. Install:**

```bash
npm install @adobecom/s2a-tokens
```

**4. Use the tokens.** The package ships CSS. Import the consolidated bundle, or
just the layers you need:

```js
import '@adobecom/s2a-tokens';                              // minified bundle (all layers)

// …or import layers individually:
import '@adobecom/s2a-tokens/css/tokens.primitives.css';
import '@adobecom/s2a-tokens/css/tokens.semantic.css';
import '@adobecom/s2a-tokens/css/tokens.semantic.light.css';
import '@adobecom/s2a-tokens/css/tokens.semantic.dark.css';
import '@adobecom/s2a-tokens/css/tokens.responsive.xl.css'; // + .lg / .md / .sm
```

Then reference the custom properties in your CSS:

```css
.card {
  background: var(--s2a-color-background-default);
  color: var(--s2a-color-content-default);
  padding: var(--s2a-spacing-md);
  border-radius: var(--s2a-border-radius-sm);
}
```

Light/dark is driven by a variable mode: set `data-theme="light"` or
`data-theme="dark"` on a root element and the semantic tokens re-resolve.

---

## Option B — Registry-free · no token

For consumers that can't (or don't want to) authenticate — or that load assets at
runtime with no build step (e.g. Milo-style) — consume the release **manifest**
and **tarball** directly. No `.npmrc`, no registry config, no token.

**The manifest always points at the latest release:**

```
https://raw.githubusercontent.com/adobecom/consonant/main/releases/latest.json
```

It contains the version, the tarball URL, a `sha256` integrity hash, the CSS file
list, and the `--s2a-` var prefix. Fetch it, then pull what you need:

```bash
# 1. read the manifest
curl -s https://raw.githubusercontent.com/adobecom/consonant/main/releases/latest.json

# 2. download the tarball it points to (verify against manifest.artifact.tarball.integrity)
curl -sLO https://raw.githubusercontent.com/adobecom/consonant/main/releases/adobecom-s2a-tokens-0.0.21.tgz

# 3. extract the CSS you want
tar -xzf adobecom-s2a-tokens-0.0.21.tgz package/css/min/tokens.min.css
```

To **pin a specific version** instead of "latest," use the per-version manifest:
`https://raw.githubusercontent.com/adobecom/consonant/main/releases/<version>/manifest.json`.

---

## Which should I use?

- **App with a normal npm/build toolchain and a place to store a token** (env var,
  CI secret) → **Option A**.
- **No build step, runtime-loaded, or you want zero tokens** → **Option B** (manifest).

Both serve the exact same tokens from the same release — Option B just skips the
registry.
