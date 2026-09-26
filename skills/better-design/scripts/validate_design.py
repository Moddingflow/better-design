#!/usr/bin/env python3
"""Read-only offline checks for Better-Design's own formats; Python 3.10+, stdlib only."""

import argparse
import json
import math
import re
from pathlib import Path


CONTRACT_FORMAT = "better-design-contract-v1"
TOKEN_FORMAT = "better-design-core-v1"
PLATFORM_UNITS = {
    "web": {"css-px"}, "ios": {"pt"}, "android": {"dp"},
    "desktop": {"dip", "px"}, "game": {"px", "engine"},
}
COMPONENT_KINDS = {
    "button", "link", "input", "select", "toggle", "checkbox", "radio", "tabs",
    "menu", "dialog", "table", "list", "navigation", "search", "region", "text",
    "image", "chart", "custom",
}
ACTION_COMPONENTS = {
    "button", "link", "input", "select", "toggle", "checkbox", "radio", "tabs",
    "menu", "navigation", "search",
}
CHECK_KINDS = {
    "structure", "tokens", "contrast", "render", "interaction", "keyboard",
    "a11y", "assistive", "performance", "localization", "distinctiveness", "motion",
}
DIRECTION_BASE = {"origin", "concept", "qualities", "avoid", "palette", "typography"}
DIRECTION_NEW = {"references", "alternatives", "chosen", "signature", "motion"}
TOKEN_TYPES = {"color", "dimension", "duration", "cubicBezier", "number", "fontFamily", "fontWeight"}
TOKEN_NAME = re.compile(r"[A-Za-z_][A-Za-z0-9_-]*\Z")
ALIAS = re.compile(r"\{([A-Za-z_][A-Za-z0-9_-]*(?:\.[A-Za-z_][A-Za-z0-9_-]*)*)\}\Z")


def finite_number(value):
    if type(value) not in (int, float):  # bool is not a number in this format.
        return False
    try:
        return math.isfinite(value)
    except OverflowError:
        return False


class Report:
    def __init__(self, scope):
        self.scope = scope
        self.issues = []
        self.counts = {}
        self.contrast = []
        self.limitations = [
            "No rendered UI, implementation, keyboard, assistive technology or task test.",
            "No WCAG conformance, visual quality or field performance certification.",
        ]

    def error(self, code, path, message):
        self.issues.append({"severity": "error", "code": code, "path": path, "message": message})

    def obj(self, value, path, required, optional=()):
        if not isinstance(value, dict):
            self.error("type", path, "Expected an object.")
            return False
        for key in sorted(set(required) - value.keys()):
            self.error("missing", path + "/" + key, "Required field is missing.")
        for key in sorted(value.keys() - set(required) - set(optional)):
            self.error("unsupported-field", path + "/" + key, "Unknown or unsupported field.")
        return True

    def text(self, value, path):
        if not isinstance(value, str) or not value.strip():
            self.error("text", path, "Expected a non-empty meaningful string.")
            return False
        return True

    def choice(self, value, path, allowed):
        if not isinstance(value, str) or value not in allowed:
            self.error("enum", path, "Expected one of: " + ", ".join(sorted(allowed)))
            return False
        return True

    def array(self, value, path, minimum=0):
        if not isinstance(value, list):
            self.error("type", path, "Expected an array.")
            return []
        if len(value) < minimum:
            self.error("empty", path, f"Expected at least {minimum} item(s).")
        return value

    def strings(self, value, path, minimum=0, allowed=None):
        result = []
        for i, item in enumerate(self.array(value, path, minimum)):
            item_path = f"{path}/{i}"
            if self.text(item, item_path):
                if allowed is not None:
                    self.choice(item, item_path, allowed)
                if item in result:
                    self.error("duplicate", item_path, "Repeated value.")
                result.append(item)
        return result

    def number(self, value, path, lower=None, upper=None, positive=False):
        if not finite_number(value):
            self.error("number", path, "Expected a finite numeric value; booleans are not numbers.")
            return False
        if (lower is not None and value < lower) or (upper is not None and value > upper):
            self.error("range", path, f"Value must be between {lower} and {upper} inclusive.")
            return False
        if positive and value <= 0:
            self.error("range", path, "Value must be greater than zero.")
            return False
        return True

    def index(self, records, path):
        result = {}
        for i, record in enumerate(records):
            if not isinstance(record, dict):
                self.error("type", f"{path}/{i}", "Expected an object.")
                continue
            identity = record.get("id")
            if self.text(identity, f"{path}/{i}/id"):
                if identity in result:
                    self.error("duplicate-id", f"{path}/{i}/id", f"Duplicate ID: {identity}")
                result[identity] = record
        return result

    def refs(self, value, path, targets, minimum=0):
        refs = self.strings(value, path, minimum)
        for ref in refs:
            if ref not in targets:
                self.error("unknown-id", path, f"Unknown ID: {ref}")
        return set(refs)

    def result(self):
        return {
            "ok": not self.issues, "scope": self.scope, "counts": self.counts,
            "issues": self.issues, "contrast": self.contrast, "limitations": self.limitations,
        }


def validate_direction(direction, report):
    """Return the declared origin when the direction block is structurally valid enough to use."""
    if not isinstance(direction, dict):
        report.error("type", "/direction", "Expected an object.")
        return None
    origin = direction.get("origin")
    valid_origin = report.choice(origin, "/direction/origin", {"new", "inherited"})
    required = DIRECTION_BASE | (DIRECTION_NEW if origin == "new" else set())
    report.obj(direction, "/direction", required, DIRECTION_NEW)
    for key in ("concept", "palette", "typography"):
        report.text(direction.get(key), "/direction/" + key)
    for key in ("qualities", "avoid"):
        report.strings(direction.get(key), "/direction/" + key, 1)
    if "references" in direction:
        refs = report.array(direction["references"], "/direction/references", int(origin == "new"))
        for i, ref in enumerate(refs):
            path = f"/direction/references/{i}"
            if report.obj(ref, path, {"source", "takeaway"}):
                report.text(ref.get("source"), path + "/source")
                report.text(ref.get("takeaway"), path + "/takeaway")
    if "signature" in direction:
        report.strings(direction["signature"], "/direction/signature", int(origin == "new"))
    if "motion" in direction:
        report.text(direction["motion"], "/direction/motion")
    if "alternatives" in direction or "chosen" in direction:
        records = report.array(direction.get("alternatives"), "/direction/alternatives", 2)
        alternatives = report.index(records, "/direction/alternatives")
        for i, alternative in enumerate(records):
            path = f"/direction/alternatives/{i}"
            if report.obj(alternative, path, {"id", "premise"}):
                report.text(alternative.get("premise"), path + "/premise")
        chosen = direction.get("chosen")
        if report.text(chosen, "/direction/chosen") and alternatives and chosen not in alternatives:
            report.error("unknown-id", "/direction/chosen", f"Unknown alternative ID: {chosen}")
    return origin if valid_origin else None


def validate_contract(data):
    report = Report("Contract structure, declared relations and evidence metadata only")
    report.limitations.append("Planned/pass/fail/unverified are declarations; structural PASS is not UI acceptance.")
    report.limitations.append("A declared direction, distinctiveness or motion check does not assess visual or motion quality.")
    root_fields = {"format", "mode", "scope", "assumptions", "platform", "system",
                   "tasks", "components", "verification", "exceptions"}
    if not report.obj(data, "", root_fields, {"direction"}):
        return report.result()
    origin = None
    if "direction" in data:
        origin = validate_direction(data["direction"], report)
    elif data.get("mode") == "create":
        report.error("missing", "/direction", "Create mode requires a direction (new or inherited).")
    report.choice(data.get("format"), "/format", {CONTRACT_FORMAT})
    report.choice(data.get("mode"), "/mode", {"create", "refine", "audit", "plan"})
    report.text(data.get("scope"), "/scope")
    report.strings(data.get("assumptions"), "/assumptions")
    platform = data.get("platform")
    if report.obj(platform, "/platform", {"kind", "units", "inputs", "locales", "directions", "themes"}):
        kind = platform.get("kind")
        valid_kind = report.choice(kind, "/platform/kind", PLATFORM_UNITS)
        report.choice(platform.get("units"), "/platform/units", PLATFORM_UNITS[kind] if valid_kind else set().union(*PLATFORM_UNITS.values()))
        report.strings(platform.get("inputs"), "/platform/inputs", 1, {"pointer", "keyboard", "touch", "gamepad", "assistive"})
        report.strings(platform.get("locales"), "/platform/locales", 1)
        report.strings(platform.get("directions"), "/platform/directions", 1, {"ltr", "rtl"})
        report.strings(platform.get("themes"), "/platform/themes", 1)
    else:
        platform = {}
    system = data.get("system")
    system_fields = {"authority", "tokenSource", "density", "expression", "rationale"}
    if report.obj(system, "/system", system_fields):
        for key in sorted(system_fields):
            report.text(system.get(key), "/system/" + key)

    task_records = report.array(data.get("tasks"), "/tasks", 1)
    tasks = report.index(task_records, "/tasks")
    primary = 0
    for i, task in enumerate(task_records):
        path = f"/tasks/{i}"
        if not report.obj(task, path, {"id", "scenario", "outcome", "priority", "recovery"}):
            continue
        for key in ("scenario", "outcome", "recovery"):
            report.text(task.get(key), path + "/" + key)
        report.choice(task.get("priority"), path + "/priority", {"primary", "secondary"})
        primary += task.get("priority") == "primary"
    if not primary:
        report.error("primary-task", "/tasks", "Declare at least one primary task.")

    component_records = report.array(data.get("components"), "/components", 1)
    components = report.index(component_records, "/components")
    tasks_in_components, action_ids, component_tasks = set(), set(), {}
    for i, component in enumerate(component_records):
        path = f"/components/{i}"
        if not report.obj(component, path, {"id", "kind", "taskIds", "states", "responsive", "actions"}):
            continue
        valid_kind = report.choice(component.get("kind"), path + "/kind", COMPONENT_KINDS)
        task_refs = report.refs(component.get("taskIds"), path + "/taskIds", tasks, 1)
        tasks_in_components.update(task_refs)
        if isinstance(component.get("id"), str):
            component_tasks[component["id"]] = task_refs
        report.strings(component.get("states"), path + "/states", 1)
        report.text(component.get("responsive"), path + "/responsive")
        needs_action = valid_kind and component["kind"] in ACTION_COMPONENTS
        for j, action in enumerate(report.array(component.get("actions"), path + "/actions", int(needs_action))):
            ap = f"{path}/actions/{j}"
            if not report.obj(action, ap, {"id", "kind", "label", "taskId", "outcome", "risk", "protection", "recovery"}):
                continue
            identity = action.get("id")
            if report.text(identity, ap + "/id"):
                if identity in action_ids:
                    report.error("duplicate-id", ap + "/id", f"Duplicate action ID: {identity}")
                action_ids.add(identity)
            for key in ("label", "outcome", "recovery"):
                report.text(action.get(key), ap + "/" + key)
            report.choice(action.get("kind"), ap + "/kind", {"command", "navigation", "submit", "toggle", "select", "edit", "drag"})
            if report.text(action.get("taskId"), ap + "/taskId") and action["taskId"] not in task_refs:
                report.error("action-task", ap + "/taskId", "Action task must belong to this component's taskIds.")
            report.choice(action.get("risk"), ap + "/risk", {"normal", "high"})
            report.choice(action.get("protection"), ap + "/protection", {"none", "reversible", "check", "review"})
            if action.get("risk") == "high" and action.get("protection") == "none":
                report.error("risk-protection", ap + "/protection", "High-consequence actions require reversible, check or review protection.")

    verification = data.get("verification")
    tasks_in_checks, components_in_checks = set(), set()
    checks = {}
    statuses = {}
    if report.obj(verification, "/verification", {"viewports", "checks"}):
        vp_path = "/verification/viewports"
        viewports = report.array(verification.get("viewports"), vp_path, int(platform.get("kind") == "web"))
        seen_viewports = set()
        for i, vp in enumerate(viewports):
            path = f"{vp_path}/{i}"
            if not report.obj(vp, path, {"width", "height", "unit"}):
                continue
            valid_width = report.number(vp.get("width"), path + "/width", positive=True)
            valid_height = report.number(vp.get("height"), path + "/height", positive=True)
            valid_unit = report.text(vp.get("unit"), path + "/unit")
            if valid_unit and vp["unit"] != platform.get("units"):
                report.error("viewport-unit", path + "/unit", "Viewport unit must equal platform.units.")
            if valid_width and valid_height and valid_unit:
                key = (vp["width"], vp["height"], vp["unit"])
                if key in seen_viewports:
                    report.error("duplicate", path, "Repeated viewport.")
                seen_viewports.add(key)
        check_records = report.array(verification.get("checks"), "/verification/checks", 1)
        checks = report.index(check_records, "/verification/checks")
        for i, check in enumerate(check_records):
            path = f"/verification/checks/{i}"
            if not report.obj(check, path, {"id", "taskIds", "componentIds", "kind", "scenario", "status", "evidence"}, {"note"}):
                continue
            checked_tasks = report.refs(check.get("taskIds"), path + "/taskIds", tasks, 1)
            checked_components = report.refs(check.get("componentIds"), path + "/componentIds", components)
            tasks_in_checks.update(checked_tasks)
            components_in_checks.update(checked_components)
            for component_id in sorted(checked_components):
                if component_id in component_tasks and not checked_tasks.intersection(component_tasks[component_id]):
                    report.error("check-task", path + "/componentIds", f"Component {component_id} is unrelated to this check's taskIds.")
            report.choice(check.get("kind"), path + "/kind", CHECK_KINDS)
            report.text(check.get("scenario"), path + "/scenario")
            status = check.get("status")
            valid_status = report.choice(status, path + "/status", {"planned", "pass", "fail", "unverified"})
            evidence = report.strings(check.get("evidence"), path + "/evidence", int(status in ("pass", "fail")))
            if status == "planned" and evidence:
                report.error("planned-evidence", path + "/evidence", "Planned checks cannot claim completed evidence.")
            if "note" in check or status == "unverified":
                report.text(check.get("note"), path + "/note")
            if valid_status:
                statuses[status] = statuses.get(status, 0) + 1
    if origin == "new":
        for kind in ("distinctiveness", "motion"):
            if not any(isinstance(c, dict) and c.get("kind") == kind for c in checks.values()):
                report.error("coverage", "/verification/checks", f"A new direction requires a {kind} check.")
    for missing in sorted(tasks.keys() - tasks_in_components):
        report.error("coverage", "/components", f"No component declares task {missing}.")
    for missing in sorted(tasks.keys() - tasks_in_checks):
        report.error("coverage", "/verification/checks", f"No check declares task {missing}.")
    for missing in sorted(components.keys() - components_in_checks):
        report.error("coverage", "/verification/checks", f"No check declares component {missing}.")
    exception_fields = {"rule", "scope", "reason", "source", "impact"}
    for i, exception in enumerate(report.array(data.get("exceptions"), "/exceptions")):
        path = f"/exceptions/{i}"
        if report.obj(exception, path, exception_fields):
            for key in sorted(exception_fields):
                report.text(exception.get(key), path + "/" + key)
    report.counts = {"tasks": len(tasks), "components": len(components), "actions": len(action_ids),
                     "checks": len(checks), "declaredCheckStatuses": statuses}
    return report.result()


def validate_literal(kind, value, path, report):
    before = len(report.issues)
    if kind == "color":
        if report.obj(value, path, {"colorSpace", "components"}, {"alpha"}):
            report.choice(value.get("colorSpace"), path + "/colorSpace", {"srgb"})
            components = report.array(value.get("components"), path + "/components")
            if len(components) != 3:
                report.error("color-components", path + "/components", "sRGB requires exactly three numeric components.")
            for i, component in enumerate(components):
                report.number(component, f"{path}/components/{i}", 0, 1)
            alpha = value.get("alpha", 1)
            if report.number(alpha, path + "/alpha", 0, 1) and alpha != 1:
                report.error("unsupported-alpha", path + "/alpha", "Only opaque colors are supported; composition is not implemented.")
    elif kind in ("dimension", "duration"):
        if report.obj(value, path, {"value", "unit"}):
            report.number(value.get("value"), path + "/value", lower=0 if kind == "duration" else None)
            units = {"ms", "s"} if kind == "duration" else {"px", "rem", "em", "pt", "dp", "dip"}
            report.choice(value.get("unit"), path + "/unit", units)
    elif kind == "cubicBezier":
        points = report.array(value, path)
        if len(points) != 4:
            report.error("cubic-bezier", path, "cubicBezier requires exactly four numbers [x1, y1, x2, y2].")
        for i, point in enumerate(points):
            # Control-point x values are time and must stay within 0..1; y may overshoot.
            report.number(point, f"{path}/{i}", *((0, 1) if i in (0, 2) else (None, None)))
    elif kind == "fontFamily":
        if isinstance(value, list):
            report.strings(value, path, 1)
            families = [(family, f"{path}/{i}") for i, family in enumerate(value)]
        else:
            report.text(value, path)
            families = [(value, path)]
        for family, family_path in families:
            if not isinstance(family, str):
                continue
            if "{" in family or "}" in family:
                report.error("alias-format", family_path, "Aliases must occupy the entire $value; embedded and array-item aliases are unsupported.")
            elif any(character in family for character in "()\\"):
                report.error("font-family-syntax", family_path, "Font family literals reserve parentheses and backslashes; CSS functions and escapes are unsupported.")
    elif kind == "fontWeight":
        report.number(value, path, 1, 1000)
    elif kind == "number":
        report.number(value, path)
    return before == len(report.issues)


def collect_tokens(group, path, prefix, report, result, depth=0):
    if depth > 64:
        report.error("unsupported-depth", path, "Token groups support at most 64 levels.")
        return
    if not isinstance(group, dict) or not group:
        report.error("token-group", path, "Expected a non-empty token group.")
        return
    for name, item in group.items():
        item_path = path + "/" + name
        if not TOKEN_NAME.fullmatch(name):
            report.error("token-name", item_path, "Use ASCII letters/digits/underscore/hyphen; start with a letter or underscore. Group metadata is unsupported.")
            continue
        token_name = ".".join(prefix + [name])
        if isinstance(item, dict) and ("$value" in item or "$type" in item):
            before = len(report.issues)
            report.obj(item, item_path, {"$type", "$value"}, {"$description"})
            valid_kind = report.choice(item.get("$type"), item_path + "/$type", TOKEN_TYPES)
            if "$description" in item:
                report.text(item["$description"], item_path + "/$description")
            value = item.get("$value")
            alias_match = ALIAS.fullmatch(value) if isinstance(value, str) else None
            if alias_match:
                result[token_name] = {"type": item.get("$type"), "alias": alias_match[1], "path": item_path,
                                      "valid": before == len(report.issues)}
            else:
                if isinstance(value, str) and (value.startswith("{") or value.endswith("}")):
                    report.error("alias-format", item_path + "/$value", "Only whole-token {group.token} aliases are supported.")
                elif valid_kind:
                    validate_literal(item["$type"], value, item_path + "/$value", report)
                result[token_name] = {"type": item.get("$type"), "value": value, "path": item_path,
                                      "valid": before == len(report.issues)}
        else:
            collect_tokens(item, item_path, prefix + [name], report, result, depth + 1)


def resolve_tokens(tokens, report):
    resolved = {name: (item["type"], item["value"]) if item["valid"] else None
                for name, item in tokens.items() if "alias" not in item}
    for name in tokens:
        current, trail = name, []
        visiting = set()
        while current not in resolved:
            if current in visiting:
                report.error("alias-cycle", tokens[current]["path"], "Circular alias: " + " -> ".join(trail + [current]))
                break
            visiting.add(current)
            trail.append(current)
            item = tokens[current]
            if not item["valid"]:
                break
            target = item["alias"]
            if target not in tokens:
                report.error("unknown-alias", item["path"] + "/$value", f"Unknown token: {target}")
                break
            if item["type"] != tokens[target]["type"]:
                report.error("alias-type", item["path"] + "/$type", f"Alias type {item['type']} differs from target type {tokens[target]['type']}.")
                break
            current = target
        else:
            for member in trail:
                resolved[member] = resolved[current]
            continue
        for member in trail:
            resolved[member] = None
    return resolved


def relative_luminance(components):
    linear = [channel / 12.92 if channel <= 0.04045 else ((channel + 0.055) / 1.055) ** 2.4
              for channel in components]
    return sum(weight * channel for weight, channel in zip((0.2126, 0.7152, 0.0722), linear))


def contrast_ratio(foreground, background):
    light, dark = sorted((relative_luminance(foreground), relative_luminance(background)), reverse=True)
    return (light + 0.05) / (dark + 0.05)


def validate_tokens(data, require_contrast=False):
    report = Report("better-design-core-v1 token subset and explicitly declared opaque sRGB pairs only")
    report.limitations.append("Not a DTCG validator; no compositing, gradients, CSS expressions or inferred color pair coverage.")
    if not report.obj(data, "", {"format", "tokens", "contrastPairs"}):
        return report.result()
    report.choice(data.get("format"), "/format", {TOKEN_FORMAT})
    tokens = {}
    collect_tokens(data.get("tokens"), "/tokens", [], report, tokens)
    if not tokens:
        report.error("no-tokens", "/tokens", "No token leaves to validate.")
    resolved = resolve_tokens(tokens, report)
    pairs = report.array(data.get("contrastPairs"), "/contrastPairs", int(require_contrast))
    report.index(pairs, "/contrastPairs")
    for i, pair in enumerate(pairs):
        path = f"/contrastPairs/{i}"
        before = len(report.issues)
        if not report.obj(pair, path, {"id", "foreground", "background", "purpose", "state", "minimum"}):
            continue
        report.text(pair.get("state"), path + "/state")
        valid_purpose = report.choice(pair.get("purpose"), path + "/purpose", {"text", "large-text", "non-text", "custom"})
        valid_minimum = report.number(pair.get("minimum"), path + "/minimum", 1, 21)
        if valid_purpose and valid_minimum:
            floor = {"text": 4.5, "large-text": 3, "non-text": 3, "custom": 1}[pair["purpose"]]
            if pair["minimum"] < floor:
                report.error("contrast-floor", path + "/minimum", f"Declared purpose requires minimum >= {floor}; custom is not an accessibility claim.")
        colors = []
        for side in ("foreground", "background"):
            token = pair.get(side)
            if not report.text(token, path + "/" + side):
                continue
            if token not in resolved or resolved[token] is None:
                report.error("contrast-token", path + "/" + side, "Token is missing or could not be resolved.")
            elif resolved[token][0] != "color":
                report.error("contrast-type", path + "/" + side, "Contrast endpoints must be color tokens.")
            else:
                colors.append(resolved[token][1]["components"])
        if before != len(report.issues) or len(colors) != 2:
            continue
        ratio = contrast_ratio(*colors)
        passed = ratio >= pair["minimum"]  # Compare full precision, not display rounding.
        report.contrast.append({"id": pair.get("id"), "purpose": pair["purpose"], "state": pair["state"],
                                "ratio": ratio, "minimum": pair["minimum"], "pass": passed})
        if not passed:
            report.error("contrast", path, f"Contrast {ratio:.12g}:1 is below {pair['minimum']}:1 (unrounded comparison).")
    report.counts = {"tokens": len(tokens), "resolvedTokens": sum(value is not None for value in resolved.values()),
                     "declaredPairs": len(pairs), "evaluatedPairs": len(report.contrast)}
    if not pairs:
        report.limitations.append("No contrast pairs declared: no contrast assertion was checked.")
    return report.result()


def reject_duplicates(pairs):
    result = {}
    for key, value in pairs:
        if key in result:
            raise ValueError(f"Duplicate JSON key: {key}")
        result[key] = value
    return result


def parse_float(raw):
    value = float(raw)
    if not math.isfinite(value):
        raise ValueError("JSON contains a non-finite number.")
    return value


def reject_constant(raw):
    raise ValueError(f"Non-JSON numeric constant: {raw}")


def load_document(path):
    with Path(path).open(encoding="utf-8-sig") as source:
        return json.load(source, object_pairs_hook=reject_duplicates,
                         parse_float=parse_float, parse_constant=reject_constant)


def main(argv=None):
    parser = argparse.ArgumentParser(description=__doc__)
    subparsers = parser.add_subparsers(dest="command", required=True)
    for command in ("contract", "tokens"):
        sub = subparsers.add_parser(command)
        sub.add_argument("file", type=Path, help="Explicit UTF-8 JSON input; never modified")
        sub.add_argument("--json", action="store_true", help="Emit a structured report")
        if command == "tokens":
            sub.add_argument("--require-contrast", action="store_true", help="Reject an empty contrastPairs list")
    args = parser.parse_args(argv)
    try:
        data = load_document(args.file)
        result = validate_contract(data) if args.command == "contract" else validate_tokens(data, args.require_contrast)
        exit_code = 0 if result["ok"] else 1
    except (OSError, UnicodeError, ValueError, RecursionError) as error:
        report = Report(args.command + ": input could not be evaluated")
        report.error("input", str(args.file), str(error))
        result, exit_code = report.result(), 2
    if args.json:
        print(json.dumps(result, ensure_ascii=False, allow_nan=False, indent=2))
    else:
        print(("PASS" if result["ok"] else "FAIL") + " — " + result["scope"])
        print("Counts: " + json.dumps(result["counts"], ensure_ascii=False))
        for issue in result["issues"]:
            print(f"ERROR {issue['code']} {issue['path']}: {issue['message']}")
        for pair in result["contrast"]:
            print(f"PAIR {pair['id']} [{pair['state']}]: {pair['ratio']:.12g}:1; required {pair['minimum']}:1; {'PASS' if pair['pass'] else 'FAIL'}")
        for limitation in result["limitations"]:
            print("LIMIT: " + limitation)
    return exit_code


if __name__ == "__main__":
    raise SystemExit(main())
