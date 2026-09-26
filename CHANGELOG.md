# Changelog

## 1.1.0 — 2026-09-26

### Changed

- Translated all 11 reference guides, the DESIGN.md template, and both contract examples into English. Agent metadata is also English; the Russian README remains an optional reader guide.
- Added explicit skill version metadata for checking installed copies.
- Added copy rules for page narration, label paraphrases, and helper text inserted by default. Expanded redundant-copy detection to semantic repetition across a task region.
- Required an information test for every explanation, optional description slots, and removal of empty description wrappers.
- Preserved necessary consequences, limits, recovery, unfamiliar concepts, and accessible instructions; prohibited invented product facts as filler replacements.
- Applied copy acceptance rules to dense working tools as well as expressive surfaces, with new evaluation cases and an example prompt.
- Added an English-package Cyrillic check to distribution validation. Deliberate multilingual literals in Python regression tests remain unchanged.

The validator's formats, calculations, and executable behavior are unchanged.

## 1.0.0 — 2026-09-26

Initial public release of Better Design.

- Complete UI/UX skill: art direction, `DESIGN.md`, typography, layout, motion, interaction states, accessibility, and evidence-based review.
- Reference guides for web, Apple, Android, desktop, and games / Unity.
- A catalog of generic AI design patterns with contextual replacements and exceptions.
- Design-system template, focused-change and creation contracts, and example tokens.
- Python standard-library validator with its existing regression suite.
- English and Russian README files, installation guide, example prompts, and English validator guide.
- GitHub Actions checks for package integrity, unit tests, and example validation.
- MIT license included in both the repository and the installable skill.

### Publication adjustments

- Preserved the original `SKILL.md`, helper code, tests, and examples.
- Replaced a machine-local sibling-skill link with the public upstream link.
- Generalized a private project example in the game-platform guidance.
- Localized Codex display metadata into English for public distribution.

The detailed reference guides remain in Russian. No cross-agent design-quality benchmark is claimed.
