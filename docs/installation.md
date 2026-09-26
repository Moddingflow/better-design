# Install Better Design

[Back to README](../README.md) · [Русский](../README.ru.md)

## Requirements

- An AI coding agent that can load Agent Skills and read supporting files.
- For the recommended installer: Git and a Node.js version supported by the [Skills CLI](https://github.com/vercel-labs/skills). The published CLI version 1.7.0 requires Node.js 22.20.0 or newer.
- For the optional validator only: Python 3.10 or newer. No pip packages are required.
- Your project's existing build, preview, browser, or device tools for actual UI verification.

Better Design has no separate API key, paid service, background daemon, MCP requirement, or installation hook. The third-party installer has its own behavior and requirements; review its documentation when needed.

## Install with the Skills CLI

Run from the project you want to work on:

```sh
npx skills add Moddingflow/better-design --skill better-design
```

Select the target agent and installation method. To target one explicitly:

```sh
npx skills add Moddingflow/better-design --skill better-design --agent codex
npx skills add Moddingflow/better-design --skill better-design --agent claude-code
npx skills add Moddingflow/better-design --skill better-design --agent cursor
```

Choose one command for your environment. Add `--global` for installation across projects, `--copy` to avoid symlinks, and `--yes` for an intentional non-interactive install. The CLI determines each agent's installation path.

Inspect available skills before installation:

```sh
npx skills add Moddingflow/better-design --list
```

The expected skill name is `better-design`. The complete folder includes `references/`, `assets/`, and `scripts/`; copying `SKILL.md` alone loses its dependencies.

## Manual installation

1. Clone this repository or download a release archive.
2. Copy the entire `skills/better-design` directory to the skills directory documented by your agent.
3. Preserve the directory name `better-design` and all of its contents.
4. Reload skills or start a new chat if your agent requires it.
5. Explicitly ask the agent to use `better-design` for a small task first.

For example, Claude Code supports a project-local `.claude/skills/better-design/` directory. For other hosts, use their current skill-directory documentation or let the installer choose the path. Do not overwrite an existing customized copy without reviewing your changes.

## Use a fixed release

For a stable copy you can inspect before installing:

```sh
git clone --branch v1.0.0 --depth 1 https://github.com/Moddingflow/better-design.git
npx skills add ./better-design --skill better-design --agent codex
```

This installs from a local checkout of the tag. Keep that checkout if using a symlink-based installation, or add `--copy`. To retain that release, manage upgrades deliberately rather than relying on a floating remote installation.

## Invoke the skill

The portable instruction is:

```text
Use better-design to audit the account settings flow. Do not edit code.
Read the current design system and report findings with evidence.
```

You can also select the skill through your agent's skill picker, if available. Some hosts expose special mention or command syntax; use the syntax shown by your installed host. Automatic activation depends on its skill-discovery behavior and the request.

Give the agent the screen or route, goal, platform, constraints, and any references. Include what must be preserved and whether the work is creation, improvement, audit, or planning. See [example prompts](examples.md).

## Updates and removal

For CLI-managed installations, use the [Skills CLI management commands](https://github.com/vercel-labs/skills#other-commands):

```sh
npx skills list
npx skills update better-design
npx skills remove better-design
```

Use `--global` when managing a global installation. Review changes before upgrading a customized copy. Manual installations are updated by replacing their skill folder after preserving modifications; remove only that exact folder to uninstall.

## Troubleshooting

| Symptom | What to check |
| --- | --- |
| Skill not found | Run discovery with `--list`, confirm the agent and scope, and restart its session if needed. |
| Skill seems ignored | Explicitly name `better-design` and provide a UI task. Backend-only work is outside its scope. |
| References are missing | Reinstall or copy the complete folder, including its subdirectories. |
| Symlink permission error on Windows | Retry with `--copy` and check write access to the target directory. |
| Installer reports unsupported Node.js | Check `node --version` against the CLI's current package requirements. |
| Unexpected duplicate skills | Check both project and global installations and remove the obsolete copy deliberately. |
| Validator rejects existing design tokens | It accepts a limited custom format. Use your native validator or an explicit projection; do not migrate your design system just for this tool. |
| Agent cannot preview the app | Provide access to the project's preview tools or current captures. Runtime checks must remain unverified until actually performed. |
| Agent answers in the wrong language | Specify your preferred output language. Some bundled reference text is Russian. |

Installability does not demonstrate output quality on every model. File discovery and installation checks are separate from evaluating the agent on real UI tasks.
