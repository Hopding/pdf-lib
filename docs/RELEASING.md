# Release Process

This document describes how to release `@cantoo/pdf-lib`, `@cantoo/upng`, and
`@cantoo/standard-fonts`.

Publishing to npm is done by GitHub Actions via [Trusted Publishing
(OIDC)](https://docs.npmjs.com/trusted-publishers) — there is no long-lived
`NPM_TOKEN`. The workflow is [`.github/workflows/publish.yml`](../.github/workflows/publish.yml).
On each `v*` tag it publishes the root package and the two vendored packages
under `src/packages/`.

## One-time npm setup

For **each** of `@cantoo/pdf-lib`, `@cantoo/upng`, and `@cantoo/standard-fonts`:

1. Open the package page on npmjs.com → **Settings** → **Trusted Publisher**
   (for brand-new packages, publish once manually or create the package first)
2. Add a GitHub Actions publisher:
   - **Organization or user:** `cantoo-scribe`
   - **Repository:** `pdf-lib`
   - **Workflow filename:** `publish.yml` (filename only, with extension)
   - **Allowed actions:** enable **npm publish** (direct publish)
3. Optionally later: set publishing access to *Require 2FA and disallow tokens*
   once Trusted Publishing is verified.

## Checklist (each release)

1. `git checkout master && git pull`
2. Update `CHANGELOG.md` (move `[Unreleased]` notes under the new version)
3. Optional local checks / integration apps if the change is risky
4. Run `yarn release` — this runs `release:prep`, then `release-it` bumps
   `package.json`, commits `Release X.Y.Z`, creates tag `vX.Y.Z`, and opens a
   GitHub Release. It does **not** publish to npm (see `.release-it.json`).
5. Push the commit and tag:
   ```bash
   git push origin master --follow-tags
   ```
6. The **Publish** workflow runs on the tag, builds, and runs `npm publish`
   with OIDC. Watch it under Actions.
7. Edit the [GitHub release notes](https://github.com/cantoo-scribe/pdf-lib/releases)
   if needed.

## Republish / manual trigger

If a tag already exists (e.g. npm publish failed earlier), use
**Actions → Publish → Run workflow**, or delete and re-push the tag after
fixing Trusted Publisher settings.

## Troubleshooting

- **ENEEDAUTH / 403 on publish:** Trusted Publisher fields must match exactly
  (`cantoo-scribe` / `pdf-lib` / `publish.yml`). npm does not validate them
  when you save.
- Do not set `NODE_AUTH_TOKEN` in the publish job — it forces the legacy token
  path and skips OIDC.
- Self-hosted runners are not supported for Trusted Publishing.
