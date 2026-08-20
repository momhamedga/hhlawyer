# Hussein Al Harithi — Brand Visual System

## Asset audit

The production mark is `apps/web/public/logo.webp` (`2505 × 720`, 3.48:1): a warm-gold judicial scale/monogram on a white field. Its strongest usable element sits in the left portion of a wide canvas, so the UI uses an intentionally cropped, `object-position: left` presentation rather than stretching the asset.

`Hussein-Alharathi-1.webp` (`1707 × 2560`, 0.67:1) is the light-thobe full-length founder portrait; it has strong light-on-dark contrast and is used in the homepage hero. `Hussein-Alharathi-2.webp` (`1707 × 2560`, 0.67:1) is the formal black legal-robe portrait, suited to future profile/detail composition. Both are project-owned production assets.

`images/editorial-office.png` (`1122 × 1402`, 0.80:1) is an existing locally stored, original editorial legal-office image. Its warm limestone, dark-wood, and muted skyline tones support the extracted gold/charcoal palette and it supplies architectural texture for the homepage trust/founder composition. No external image is hotlinked.

## Palette rationale

The mark supplies the brand signal: warm gold against white, balanced by its fine grey edge. The visual system translates this into quiet legal-charcoal surfaces and limestone papers rather than the previous cyan/navy/green mix.

| Token | Light | Dark | Purpose |
| --- | --- | --- | --- |
| Brand primary | `#241F1A` | `#F3ECE1` | headline, primary surface, high-authority text |
| Brand secondary | `#6C6054` | `#C9BFB2` | supporting text and restrained details |
| Brand accent | `#B88745` | `#D9AF6C` | logo-adjacent linework, CTA emphasis, active state |
| Brand surface | `#FFFFFF` | `#211C17` | panels and controls |
| Brand background | `#F4F0E9` | `#15120F` | page field |
| Brand text | `#241F1A` | `#F3ECE1` | readable copy |
| Brand muted | `#6C6054` | `#B7AB9D` | secondary copy |
| Brand border | `#D9D0C3` | `#41382F` | separators and calm structure |

The accessible dark and light variants are calibrated for readable body text. Status colors remain semantic (`success`, `warning`, `danger`, `info`) and are not brand colors.

## Usage rules

- Use the gold accent as a rule, focused CTA detail, active navigation, or small index — never as a large text field.
- Use dark charcoal for premium large surfaces; use limestone to provide a calm counterweight.
- Keep the real logo undistorted, with its own light field when required for legibility.
- Do not combine the old cyan, navy, green, gold, and orange surfaces in the same brand composition.
- Do not use a fake text monogram in place of `logo.webp`.

## Image inventory

| Asset | Route / section | Alt text | Loading | Desktop crop | Mobile crop |
| --- | --- | --- | --- | --- | --- |
| `logo.webp` | Header, Footer | Hussein Al Harithi logo | Header priority; Footer lazy | left-cropped mark, contained | contained at intentional width |
| `Hussein-Alharathi-1.webp` | Homepage hero | Hussein Al Harithi, attorney and private notary | priority | full-length, lower-right anchored | upper body, bottom anchored |
| `Hussein-Alharathi-2.webp` | Future About profile | Hussein Al Harithi in formal legal attire | lazy | mid-length portrait | upper-body portrait |
| `images/editorial-office.png` | Homepage founder/architecture field | Contemporary legal office in Abu Dhabi | lazy | tall architectural crop | portrait crop |
| `images/editorial-office.png` | Future Services signature field | Contemporary legal office in Abu Dhabi | lazy | tall right-side crop | top-focused crop |
| `Hussein-Alharathi-2.webp` | Future service-detail brand field | Hussein Al Harithi in formal legal attire | lazy | mid-length portrait | upper-body portrait |
