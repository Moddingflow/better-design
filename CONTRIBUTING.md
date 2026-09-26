# Contributing

Useful contributions include reproducible validator bugs, clearer task-specific guidance, missing interaction states, and faithful translations.

## Propose a change

1. Open an issue describing the user task and the observed problem, or send a focused pull request.
2. Explain when the proposed rule applies, why it helps, and when an exception is legitimate.
3. Keep `skills/better-design/SKILL.md` as the entry point. Put detailed guidance in `references/`.
4. Preserve existing project conventions, scoped work, and honest evidence reporting.
5. Keep the English and Russian README instructions consistent when changing installation or capabilities.

Do not add machine-specific paths, credentials, customer data, or unlicensed screenshots. Label fixtures and illustrative examples. Include attribution for external material and confirm redistribution rights.

## Check your change

From the repository root:

```sh
python -B -X utf8 scripts/check_package.py
python -B -X utf8 skills/better-design/scripts/test_validate_design.py
python -B -X utf8 skills/better-design/scripts/validate_design.py contract skills/better-design/assets/design-contract.example.json --json
python -B -X utf8 skills/better-design/scripts/validate_design.py contract skills/better-design/assets/design-contract.create.example.json --json
python -B -X utf8 skills/better-design/scripts/validate_design.py tokens skills/better-design/assets/tokens.example.json --require-contrast --json
```

For validator changes, add regression coverage for observable behavior and invalid inputs. Do not silently broaden the accepted token format or present a structural pass as a UI audit.

For guidance changes, explain the task and expected behavior. If you evaluate it with an agent, record the model, relevant tools, task constraints, actual checks, and limitations. Avoid claiming general quality gains from one screenshot.

## License

Contributions to this repository are made under the [MIT license](LICENSE). External linked sources keep their original licenses.
