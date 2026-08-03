# Token Blast Radius — Library Analytics

Check how many external files and teams are consuming a specific S2A token before making any changes to it. Use this before mutating a token's resolved value, deprecating a token, or renaming it.

## Usage
```
/token-blast-radius <token-name-or-keyword>
```

Examples:
```
/token-blast-radius background/subtle
/token-blast-radius body-strong
/token-blast-radius surface
```

## Prerequisites

Figma PAT lives in `.env` at the repo root:
```
FIGMA_ACCESS_TOKEN=figd_...
FIGMA_FILE_ID=eGSyBcD5XdFXR8rJXJmVNY   ← published S2A library file key
```

## Steps

### 1. Find the variable key(s) for the token(s)

The analytics API uses a hash `variable_key`, not the `VariableID:x:y` format from the plugin.

```bash
TOKEN=$(grep FIGMA_ACCESS_TOKEN .env | cut -d= -f2)
FILE=$(grep FIGMA_FILE_ID .env | cut -d= -f2)

curl -s -H "X-Figma-Token: $TOKEN" \
  "https://api.figma.com/v1/analytics/libraries/${FILE}/variable/usages?group_by=variable" \
  | python3 -c "
import json, sys
keyword = '<YOUR_KEYWORD>'   # e.g. 'background/subtle' or 'surface'
data = json.load(sys.stdin)
for r in sorted(data.get('rows',[]), key=lambda x: -x.get('usages',0)):
    if keyword.lower() in r.get('variable_name','').lower():
        print(f'  files:{r[\"files_using\"]:>4}  teams:{r[\"teams_using\"]:>3}  usages:{r[\"usages\"]:>8}  key:{r[\"variable_key\"]}  →  {r[\"variable_name\"]}')
"
```

### 2. Report the aggregate numbers

Output for each matching token:
- `files_using` — number of distinct files consuming this token
- `teams_using` — number of teams
- `usages` — total node bindings

**Decision thresholds:**
| Usages | Files | Risk |
|---|---|---|
| 0 | 0 | ✅ Free to change — no external consumers |
| < 500 | < 10 | 🟡 Low — check which files, confirm safe |
| 500–5k | 10–50 | 🟠 Medium — additive changes only, communicate before ship |
| > 5k | 50+ | 🔴 High — do NOT change resolved value; deprecate via description only |

### 3. Get per-file breakdown (optional)

**Note:** The `variable_key` filter on `group_by=file` does NOT work as of 2026-07-21 — the API returns all-variable totals per file, not filtered to the specific variable. Use aggregate numbers from step 1 for the accurate per-token count. The per-file view (`group_by=file` without a variable filter) is useful for seeing which files consume the library overall.

```bash
# Shows all-variable usage per file (NOT filtered to one token)
curl -s -H "X-Figma-Token: $TOKEN" \
  "https://api.figma.com/v1/analytics/libraries/${FILE}/variable/usages?group_by=file" \
  | python3 -c "
import json, sys
data = json.load(sys.stdin)
rows = sorted(data.get('rows',[]), key=lambda x: -x.get('usages',0))
for r in rows[:20]:
    team = r.get('team_name','?')
    ws   = r.get('workspace_name','')
    file = r.get('file_name','?')
    cnt  = r.get('usages',0)
    ws_str = f' / {ws}' if ws else ''
    print(f'  {cnt:>8}  [{team}{ws_str}]  {file}')
"
```

### 4. Dark mode usage caveat

The analytics API tracks variable **bindings** (node count), not which **mode** is rendered. A file with 1,000 uses of `background/subtle` could have all 1,000 in light-mode frames or split across modes — the API reports the same number either way.

To check dark-mode-specific usage within a file, open that file and search for nodes that (a) have the target variable bound AND (b) are inside a frame with an explicit dark mode applied. This must be done file-by-file via the figma-console plugin.

## Worked examples

### background/subtle (2026-07-21)
- 138 files, 38 teams, 15,417 usages → **additive only**

### body-strong (2026-07-21)
- 231 files, 42 teams, 14,060 usages → **do not mutate**

### surface/* tokens (2026-07-21)
- 0 files, 0 teams, 0 usages → **free to change values and establish pattern**

## When to run this

- Before changing what a semantic token resolves to in either mode
- Before deprecating or renaming a token
- Before moving a token to a different collection or path
- When a designer asks "is it safe to update X token?"
