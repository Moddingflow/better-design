<p align="center"><strong>BETTER DESIGN</strong></p>

# Better Design — UI/UX Design Skill for AI Coding Agents

Give your AI coding agent a repeatable process for designing interfaces: product-specific art direction, a shared `DESIGN.md`, purposeful motion, accessible interactions, and checks against the real UI.

[![Validate](https://github.com/Moddingflow/better-design/actions/workflows/validate.yml/badge.svg)](https://github.com/Moddingflow/better-design/actions/workflows/validate.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)
[![Agent Skills](https://img.shields.io/badge/format-Agent%20Skills-24292f.svg)](https://agentskills.io)

**[Install](#installation)** · **[Example prompts](docs/examples.md)** · **[How it works](#how-it-works)** · **[Validation](docs/validation.md)** · **[Русский](README.ru.md)**

Better Design is an open-source **frontend design and UI/UX skill** for workflows in **Codex, Claude Code, Cursor, and other agents that support Agent Skills**. It covers websites, web apps, native interfaces, desktop applications, and game UI. It guides the agent within your existing stack and design system.

## Quick start

From your project directory:

```sh
npx skills add Moddingflow/better-design --skill better-design
```

Choose your agent in the installer. Then ask:

```text
Use better-design to improve the checkout flow. Read DESIGN.md first,
preserve the existing brand, handle validation and network errors,
and check the result on mobile and desktop. Report what you actually tested.
```

The skill itself needs no API key, MCP server, or runtime package. The installer needs Node.js and Git; the optional offline validator needs Python 3.10+. Your AI coding agent and its normal access requirements are separate.

## What it helps your agent do

| Area | What the skill asks for |
| --- | --- |
| Art direction | Derive a visual concept from the product, study real references, compare directions, and explain the choice. |
| Design systems | Read the project's `DESIGN.md`, reuse semantic tokens, and keep documented values and code aligned. |
| Frontend design | Compose readable hierarchy, responsive layouts, purposeful typography, and meaningful imagery. |
| Interaction and motion | Design press feedback, transitions, loading states, error recovery, and reduced-motion alternatives together. |
| Accessibility | Check keyboard access, names, focus, contrast, text scaling, and alternatives to drag gestures. |
| File uploads | Include a visible drop zone, a file picker, rejection feedback, progress, preview, and retry. |
| AI design patterns | Review recurring generic compositions using a catalog of signals, replacements, and legitimate exceptions. |
| Evidence | Inspect current renders and real interactions; distinguish completed checks from plans and unavailable checks. |

## Installation

The [Skills CLI](https://github.com/vercel-labs/skills) installs the full skill folder and its supporting files. Pick one of these commands:

```sh
# Codex — current project
npx skills add Moddingflow/better-design --skill better-design --agent codex

# Claude Code — current project
npx skills add Moddingflow/better-design --skill better-design --agent claude-code

# Cursor — current project
npx skills add Moddingflow/better-design --skill better-design --agent cursor

# Make it available across projects for your selected agent
npx skills add Moddingflow/better-design --skill better-design --agent codex --global
```

For Windows copy-based installs, add `--copy` if symlinks are unavailable. Run project installation commands from your application's root directory.

**[Full installation guide](docs/installation.md)** covers manual installation, version pinning, updates, removal, and troubleshooting. Support here refers to the skill format and installer targets; model quality and host-specific behavior need verification in your environment.

## How it works

1. **Inspect.** Read project instructions, `DESIGN.md`, the existing interface, components, and tokens.
2. **Define.** Identify the user's task, affected states, supported surfaces, and observable acceptance criteria.
3. **Choose.** For a new visual identity, derive art direction from the domain and compare concrete options.
4. **Build.** Implement layout, content, interaction, and motion using shared decisions.
5. **Verify.** Check the code, rendered surface, keyboard flow, recovery paths, responsive behavior, and motion.
6. **Report.** State what changed, what was tested, and what remains unverified.

A focused fix stays focused. An audit stays read-only. A plan stays a plan. Existing project conventions and your explicit scope govern the work.

### Four ways to use it

| Mode | Example request |
| --- | --- |
| Create | “Use better-design to build a booking page for a climbing gym. Include mobile layouts and real form states.” |
| Improve | “Use better-design to fix the upload interaction. Preserve the layout and add drag feedback, rejection messages, and retry.” |
| Audit | “Use better-design to audit this settings screen. Do not edit code. Rank findings by impact and show evidence.” |
| Plan | “Use better-design to plan an inventory UI redesign with mouse, keyboard, and gamepad navigation. Do not implement yet.” |

**[More prompts and expected outputs](docs/examples.md)**

## What is included

```text
skills/better-design/
├── SKILL.md                     Agent entry point and workflow
├── LICENSE                      MIT license included with the installed skill
├── agents/openai.yaml           Codex display metadata
├── assets/
│   ├── DESIGN.template.md       Project design-system template
│   ├── design-contract.example.json
│   ├── design-contract.create.example.json
│   └── tokens.example.json
├── references/                  Art direction, motion, UX, platforms, and checks
└── scripts/
    ├── validate_design.py       Offline contract and token checks
    └── test_validate_design.py  Validator regression tests
```

### Reference map

| Guide | Use it for |
| --- | --- |
| [Art direction](skills/better-design/references/art-direction.md) | Concept, references, typography, and distinctiveness |
| [DESIGN.md](skills/better-design/references/design-md.md) | Shared tokens and consistency across screens |
| [Motion](skills/better-design/references/motion.md) | Feedback, transitions, choreography, and reduced motion |
| [AI design pattern catalog](skills/better-design/references/ai-slop.md) | Detecting generic decisions and choosing contextual replacements |
| [Behavior and content](skills/better-design/references/behavior-and-content.md) | Actions, states, loading, forms, and drag and drop |
| [Web quality](skills/better-design/references/web-quality.md) | Responsive UI, accessibility, and browser checks |
| [Platform adapters](skills/better-design/references/platform-adapters.md) | Apple, Android, desktop, and games / Unity |
| [Design contract](skills/better-design/references/design-contract.md) | Scope, state coverage, and acceptance criteria |
| [Evaluation](skills/better-design/references/evaluations.md) | Evaluating agent output against tasks and evidence |
| [Sources](skills/better-design/references/sources.md) | Attribution, standards, and limits of claims |

**Language:** the core `SKILL.md` and this getting-started documentation are in English. Detailed reference guides and some template annotations are currently in Russian. A multilingual agent can use them; ask it to respond in your preferred language. A complete English reference translation is not included in v1.0.0.

## Optional offline validation

Clone the repository, then run these commands from its root:

```sh
python -B -X utf8 skills/better-design/scripts/validate_design.py contract skills/better-design/assets/design-contract.example.json --json
python -B -X utf8 skills/better-design/scripts/validate_design.py tokens skills/better-design/assets/tokens.example.json --require-contrast --json
python -B -X utf8 skills/better-design/scripts/test_validate_design.py
```

The helper reads explicit JSON files using only the Python standard library. It checks its own contract schema, a limited token format, aliases, and declared opaque sRGB contrast pairs. It does not access the network or modify your project.

**A passing result does not certify UX quality, rendered contrast, full WCAG compliance, or production readiness.** Browser, device, assistive-technology, and user-task checks still require appropriate tools and evidence. See the [validation guide](docs/validation.md).

## FAQ

### Is this a component library or a Figma plugin?

It is an instruction package for an AI agent. The agent works with your project's components, framework, and tools. The package does not ship a UI component library or a Figma integration.

### Does it require React, Tailwind CSS, or a particular animation library?

No. It asks the agent to preserve the current stack. The web guidance works at the level of semantics, tokens, layouts, states, and verification; platform-specific guidance covers native and game interfaces.

### Will it replace my existing design system?

It instructs the agent to read and reuse that system. A missing `DESIGN.md` should be derived from real code tokens when the task warrants it. A small one-element fix should not turn into a design-system migration.

### Does it guarantee better designs?

Results depend on the model, brief, project, references, and available runtime tools. The skill supplies a process and review criteria. There is no published cross-agent quality benchmark or guaranteed percentage improvement.

### Can I use it commercially?

Yes, under the [MIT license](LICENSE). Preserve the license notice when redistributing. Third-party sources linked in the references retain their own terms.

## Contributing and credits

See [CONTRIBUTING.md](CONTRIBUTING.md) for focused changes, reproducible reports, and validation commands, and [CHANGELOG.md](CHANGELOG.md) for releases.

The references record the original skill's sources and conceptual influences, including [Impeccable](https://github.com/pbakaus/impeccable) and [Taste Skill](https://github.com/Leonxlnx/taste-skill). Agent Skills, the Skills CLI, and supported agent products are maintained by their respective authors. This is an independent project.

Maintained by [Moddingflow](https://github.com/Moddingflow). [MIT](LICENSE).
