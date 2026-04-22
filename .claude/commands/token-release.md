# Token Release

Run the full S2A token pipeline: sync from Figma, build CSS, verify output, bump the version, update CHANGELOG.md, package the tarball, and commit.

## Usage

```
/token-release <version>
```

Example: `/token-release 0.0.13`

## Steps

Follow the skill at `.codex/skills/token-release.skill.md` exactly.

The version to release is provided in `$ARGUMENTS`. If no version is given, read the current version from `packages/tokens/package.json` and bump the patch number.
