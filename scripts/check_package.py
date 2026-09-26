"""Check this distribution's entry point, bundled files, and local Markdown links."""

from pathlib import Path
import json
import re
import sys
from urllib.parse import unquote, urlsplit


ROOT = Path(__file__).resolve().parents[1]
SKILL = ROOT / "skills" / "better-design"


def main():
    errors = []
    required = [
        "SKILL.md", "LICENSE", "agents/openai.yaml", "assets/DESIGN.template.md",
        "assets/design-contract.example.json", "assets/design-contract.create.example.json",
        "assets/tokens.example.json", "scripts/validate_design.py",
        "scripts/test_validate_design.py",
    ]
    for name in required:
        if not (SKILL / name).is_file():
            errors.append(f"Missing installable file: {name}")

    if (SKILL / "SKILL.md").is_file():
        entry = (SKILL / "SKILL.md").read_text(encoding="utf-8")
        frontmatter = re.match(r"\A---\n(.*?)\n---\n", entry, re.S)
        if not frontmatter:
            errors.append("SKILL.md must begin with YAML frontmatter")
        else:
            if not re.search(r"^name: better-design$", frontmatter[1], re.M):
                errors.append("Skill name must match its directory: better-design")
            description = re.search(r'^description: "(.+)"$', frontmatter[1], re.M)
            if not description or not 1 <= len(description[1]) <= 1024:
                errors.append("Expected a non-empty description of at most 1024 characters")

    for path in (SKILL / "assets").glob("*.json"):
        try:
            json.loads(path.read_text(encoding="utf-8"))
        except (ValueError, OSError) as error:
            errors.append(f"{path.relative_to(ROOT)}: {error}")

    # The installable instructions, examples, and metadata are maintained in English.
    # Unicode literals in the Python regression tests intentionally exercise language/path support.
    # This detects leftover Cyrillic prose; it does not assess translation fidelity or other languages.
    english_files = [p for p in SKILL.rglob("*") if p.suffix in {".md", ".json", ".yaml", ".yml"}]
    for path in english_files:
        for number, line in enumerate(path.read_text(encoding="utf-8").splitlines(), 1):
            if re.search(r"[\u0400-\u04ff]", line):
                errors.append(f"{path.relative_to(ROOT)}:{number}: Cyrillic text in the English skill package")

    files = [p for p in ROOT.rglob("*.md") if ".git" not in p.relative_to(ROOT).parts]
    for path in files:
        content = path.read_text(encoding="utf-8")
        # Repository-local links only; external URLs and section anchors are not checked.
        for target in re.findall(r"\]\(([^\s)]+)\)", content):
            parsed = urlsplit(target.strip("<>"))
            if parsed.scheme or parsed.netloc or not parsed.path:
                continue
            destination = (path.parent / unquote(parsed.path)).resolve()
            if not destination.is_relative_to(ROOT) or not destination.exists():
                errors.append(f"{path.relative_to(ROOT)}: broken/outside local link {target}")

    if errors:
        print("\n".join(errors), file=sys.stderr)
        return 1
    print(f"PASS: distribution files, entry-point metadata, JSON syntax, English-package Cyrillic scan, and local file links in {len(files)} Markdown files.")
    print("Scope excludes translation fidelity, external links, anchors, YAML beyond the two checked fields, and agent/runtime quality.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
