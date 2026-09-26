#!/usr/bin/env python3
"""Observable contract/token invariants and actual CLI regressions; no browser required."""

import copy
import hashlib
import json
import math
from pathlib import Path
import subprocess
import sys
import tempfile
import unittest

import validate_design as validator


SKILL = Path(__file__).resolve().parents[1]
CLI = SKILL / "scripts" / "validate_design.py"


def example(name):
    return json.loads((SKILL / "assets" / name).read_text(encoding="utf-8"))


def token_document(foreground=(0, 0, 0), background=(1, 1, 1), minimum=4.5, purpose="text"):
    return {
        "format": validator.TOKEN_FORMAT,
        "tokens": {
            "fg": {"$type": "color", "$value": {"colorSpace": "srgb", "components": list(foreground)}},
            "bg": {"$type": "color", "$value": {"colorSpace": "srgb", "components": list(background)}},
        },
        "contrastPairs": [{"id": "sample", "foreground": "fg", "background": "bg",
                           "purpose": purpose, "state": "default", "minimum": minimum}],
    }


def font_document(value):
    return {
        "format": validator.TOKEN_FORMAT,
        "tokens": {
            "base": {"font": {"$type": "fontFamily", "$value": ["Inter", "sans-serif"]}},
            "body": {"$type": "fontFamily", "$value": value},
        },
        "contrastPairs": [],
    }


class ContractTests(unittest.TestCase):
    def setUp(self):
        self.data = example("design-contract.example.json")

    def fails(self, data, code=None):
        report = validator.validate_contract(data)
        self.assertFalse(report["ok"], report)
        if code:
            self.assertIn(code, {issue["code"] for issue in report["issues"]}, report)
        return report

    def test_web_example_is_valid_and_planned_remains_planned(self):
        report = validator.validate_contract(self.data)
        self.assertTrue(report["ok"], report)
        self.assertEqual(report["counts"]["declaredCheckStatuses"], {"planned": 3})

    def test_native_platform_units_and_no_web_viewport_requirement(self):
        for kind, units in (("ios", "pt"), ("android", "dp"), ("desktop", "dip"), ("game", "engine")):
            with self.subTest(kind=kind):
                data = copy.deepcopy(self.data)
                data["platform"].update(kind=kind, units=units)
                data["verification"]["viewports"] = []
                self.assertTrue(validator.validate_contract(data)["ok"])
                data["platform"]["units"] = "css-px"
                self.fails(data, "enum")

    def test_web_requires_viewport(self):
        self.data["verification"]["viewports"] = []
        self.fails(self.data, "empty")

    def test_viewports_reject_invalid_dimensions_and_units(self):
        for value in (True, "320", None, -1, 0, float("inf"), float("nan"), 10 ** 500):
            with self.subTest(value=str(value)[:20]):
                data = copy.deepcopy(self.data)
                data["verification"]["viewports"][0]["width"] = value
                self.fails(data)
        self.data["verification"]["viewports"][0]["unit"] = "dp"
        self.fails(self.data, "viewport-unit")

    def test_strict_root_shapes_and_required_content(self):
        for bad in (None, [], True, {}, {"format": validator.CONTRACT_FORMAT}):
            with self.subTest(bad=bad):
                self.fails(bad)
        for key in ("tasks", "components"):
            data = copy.deepcopy(self.data)
            data[key] = []
            self.fails(data, "empty")
        self.data["scope"] = "   "
        self.fails(self.data, "text")

    def test_unknown_fields_and_wrong_field_types_fail(self):
        for path in (("system", "density"), ("platform", "kind"), ("platform", "inputs")):
            data = copy.deepcopy(self.data)
            data[path[0]][path[1]] = {"unexpected": True}
            self.fails(data)
        self.data["system"]["mystery"] = True
        self.fails(self.data, "unsupported-field")

    def test_duplicate_task_component_check_and_action_ids(self):
        for location in ("tasks", "components"):
            data = copy.deepcopy(self.data)
            data[location].append(copy.deepcopy(data[location][0]))
            self.fails(data, "duplicate-id")
        data = copy.deepcopy(self.data)
        data["verification"]["checks"].append(copy.deepcopy(data["verification"]["checks"][0]))
        self.fails(data, "duplicate-id")
        self.data["components"][1]["actions"][0]["id"] = "edit-name"
        self.fails(self.data, "duplicate-id")

    def test_unknown_relations_and_uncovered_tasks(self):
        for location in ("taskIds", "componentIds"):
            data = copy.deepcopy(self.data)
            data["verification"]["checks"][0][location] = ["missing"]
            self.fails(data, "unknown-id")
        data = copy.deepcopy(self.data)
        data["components"][0]["actions"][0]["taskId"] = "missing"
        self.fails(data, "action-task")
        self.data["tasks"].append({**self.data["tasks"][0], "id": "uncovered"})
        self.fails(self.data, "coverage")

    def test_action_outcomes_states_and_risk_are_meaningful(self):
        data = copy.deepcopy(self.data)
        data["components"][0]["actions"][0]["outcome"] = ""
        self.fails(data, "text")
        data = copy.deepcopy(self.data)
        data["components"][0]["states"] = []
        self.fails(data, "empty")
        action = self.data["components"][1]["actions"][0]
        action["risk"] = "high"
        self.fails(self.data, "risk-protection")
        for protection in ("check", "review", "reversible"):
            action["protection"] = protection
            self.assertTrue(validator.validate_contract(self.data)["ok"])

    def test_check_cannot_claim_an_unrelated_component(self):
        self.data["tasks"].append({**self.data["tasks"][0], "id": "archive", "priority": "secondary"})
        self.data["components"].append({"id": "archive-region", "kind": "region", "taskIds": ["archive"],
                                         "states": ["default"], "responsive": "Wrap content", "actions": []})
        self.data["verification"]["checks"].append({**self.data["verification"]["checks"][0],
            "id": "archive-check", "taskIds": ["archive"], "componentIds": ["archive-region"]})
        self.assertTrue(validator.validate_contract(self.data)["ok"])
        self.data["verification"]["checks"][0]["componentIds"].append("archive-region")
        self.fails(self.data, "check-task")

    def test_static_region_does_not_require_invented_action_states(self):
        self.data["components"][0].update(kind="region", actions=[], states=["default"])
        self.assertTrue(validator.validate_contract(self.data)["ok"])
        self.data["components"][0]["kind"] = "button"
        self.fails(self.data, "empty")

    def test_evidence_metadata_is_distinct_from_acceptance(self):
        check = self.data["verification"]["checks"][0]
        check["status"] = "pass"
        self.fails(self.data, "empty")
        check["evidence"] = ["local fixture trace, run 1"]
        self.assertTrue(validator.validate_contract(self.data)["ok"])
        check["status"] = "fail"
        report = validator.validate_contract(self.data)
        self.assertTrue(report["ok"])
        self.assertEqual(report["counts"]["declaredCheckStatuses"]["fail"], 1)
        check.update(status="unverified", evidence=[])
        self.fails(self.data, "text")
        check["note"] = "Target runtime unavailable"
        self.assertTrue(validator.validate_contract(self.data)["ok"])


class DirectionTests(unittest.TestCase):
    def setUp(self):
        self.data = example("design-contract.create.example.json")

    def fails(self, data, code=None):
        report = validator.validate_contract(data)
        self.assertFalse(report["ok"], report)
        if code:
            self.assertIn(code, {issue["code"] for issue in report["issues"]}, report)
        return report

    def test_create_example_is_valid(self):
        report = validator.validate_contract(self.data)
        self.assertTrue(report["ok"], report)
        self.assertEqual(report["counts"]["declaredCheckStatuses"], {"planned": 4})

    def test_create_mode_requires_direction_refine_does_not(self):
        del self.data["direction"]
        self.fails(self.data, "missing")
        self.data["mode"] = "refine"
        self.assertTrue(validator.validate_contract(self.data)["ok"])

    def drop_checks(self, kind):
        checks = self.data["verification"]["checks"]
        checks[:] = [check for check in checks if check["kind"] != kind]

    def test_new_direction_requires_exploration_fields(self):
        for key in ("references", "alternatives", "chosen", "signature", "motion"):
            with self.subTest(key=key):
                data = copy.deepcopy(self.data)
                del data["direction"][key]
                self.fails(data, "missing")

    def test_inherited_direction_needs_only_base_fields(self):
        direction = self.data["direction"]
        for key in ("references", "alternatives", "chosen", "signature", "motion"):
            del direction[key]
        direction["origin"] = "inherited"
        self.drop_checks("distinctiveness")
        self.drop_checks("motion")
        self.assertTrue(validator.validate_contract(self.data)["ok"])
        direction["qualities"] = []
        self.fails(self.data, "empty")

    def test_inherited_direction_motion_must_be_meaningful_when_present(self):
        self.data["direction"]["origin"] = "inherited"
        self.assertTrue(validator.validate_contract(self.data)["ok"])
        self.data["direction"]["motion"] = "  "
        self.fails(self.data, "text")

    def test_new_direction_requires_distinctiveness_check(self):
        self.drop_checks("distinctiveness")
        report = self.fails(self.data, "coverage")
        self.assertIn("distinctiveness", str(report["issues"]))

    def test_new_direction_requires_motion_check(self):
        self.drop_checks("motion")
        report = self.fails(self.data, "coverage")
        self.assertIn("motion", str(report["issues"]))
        self.data["direction"]["origin"] = "inherited"
        self.assertTrue(validator.validate_contract(self.data)["ok"])

    def test_alternatives_need_two_and_chosen_must_exist(self):
        data = copy.deepcopy(self.data)
        data["direction"]["alternatives"] = data["direction"]["alternatives"][:1]
        self.fails(data, "empty")
        data = copy.deepcopy(self.data)
        data["direction"]["chosen"] = "missing"
        self.fails(data, "unknown-id")
        data = copy.deepcopy(self.data)
        data["direction"]["alternatives"][1]["id"] = "board"
        self.fails(data, "duplicate-id")

    def test_reference_needs_takeaway_and_unknown_fields_fail(self):
        data = copy.deepcopy(self.data)
        data["direction"]["references"][0]["takeaway"] = "  "
        self.fails(data, "text")
        data = copy.deepcopy(self.data)
        data["direction"]["vibe"] = "modern clean"
        self.fails(data, "unsupported-field")
        self.data["direction"]["origin"] = "remix"
        self.fails(self.data, "enum")


class TokenTests(unittest.TestCase):
    def fails(self, data, code=None):
        report = validator.validate_tokens(data)
        self.assertFalse(report["ok"], report)
        if code:
            self.assertIn(code, {issue["code"] for issue in report["issues"]}, report)
        return report

    def test_full_example_and_declared_pair_counts(self):
        report = validator.validate_tokens(example("tokens.example.json"), require_contrast=True)
        self.assertTrue(report["ok"], report)
        self.assertEqual(report["counts"]["declaredPairs"], 4)
        self.assertEqual(report["counts"]["evaluatedPairs"], 4)
        self.assertEqual(report["counts"]["resolvedTokens"], report["counts"]["tokens"])

    def test_black_white_is_21_same_color_is_1(self):
        report = validator.validate_tokens(token_document())
        self.assertTrue(report["ok"])
        self.assertEqual(report["contrast"][0]["ratio"], 21)
        report = self.fails(token_document(background=(0, 0, 0)), "contrast")
        self.assertEqual(report["contrast"][0]["ratio"], 1)

    def test_luminance_uses_004045_breakpoint(self):
        self.assertAlmostEqual(validator.relative_luminance((0.04, 0.04, 0.04)), 0.04 / 12.92, places=15)
        self.assertAlmostEqual(validator.relative_luminance((0.04045,) * 3), 0.04045 / 12.92, places=15)
        value = 0.04046
        self.assertAlmostEqual(validator.relative_luminance((value,) * 3), ((value + 0.055) / 1.055) ** 2.4, places=15)

    def test_threshold_boundary_does_not_round_up(self):
        ratio = validator.contrast_ratio((0.5,) * 3, (1,) * 3)
        data = token_document((0.5,) * 3, minimum=ratio, purpose="custom")
        self.assertTrue(validator.validate_tokens(data)["ok"])
        data["contrastPairs"][0]["minimum"] = math.nextafter(ratio, math.inf)
        self.fails(data, "contrast")
        data["contrastPairs"][0]["minimum"] = math.nextafter(ratio, -math.inf)
        self.assertTrue(validator.validate_tokens(data)["ok"])

    def test_only_declared_pairs_are_evaluated(self):
        data = token_document()
        data["tokens"]["unused"] = copy.deepcopy(data["tokens"]["bg"])
        report = validator.validate_tokens(data)
        self.assertTrue(report["ok"])
        self.assertEqual(report["counts"]["evaluatedPairs"], 1)

    def test_aliases_chain_and_preserve_type(self):
        data = token_document()
        data["tokens"]["chain"] = {"$type": "color", "$value": "{middle}"}
        data["tokens"]["middle"] = {"$type": "color", "$value": "{fg}"}
        data["contrastPairs"][0]["foreground"] = "chain"
        self.assertEqual(validator.validate_tokens(data)["contrast"][0]["ratio"], 21)
        data["tokens"]["middle"]["$type"] = "number"
        self.fails(data, "alias-type")

    def test_unknown_self_and_multinode_alias_cycles(self):
        for aliases, code in (({"a": "missing"}, "unknown-alias"), ({"a": "a"}, "alias-cycle"),
                              ({"a": "b", "b": "c", "c": "a"}, "alias-cycle")):
            data = token_document()
            for key, target in aliases.items():
                data["tokens"][key] = {"$type": "color", "$value": "{" + target + "}"}
            self.fails(data, code)

    def test_unsupported_features_fail_visibly(self):
        for bad in (
            {"$type": "typography", "$value": {}},
            {"$type": "color", "$value": "#000000"},
            {"$type": "dimension", "$value": {"value": "{base.size}", "unit": "px"}},
            {"$type": "number", "$value": "{#/tokens/size}"},
            {"$type": "number", "$value": 1, "$extensions": {}},
        ):
            with self.subTest(bad=bad):
                data = token_document()
                data["tokens"]["unsupported"] = bad
                self.fails(data)
        data = token_document()
        data["tokens"]["$extends"] = "base"
        self.fails(data, "token-name")

    def test_noop_empty_documents_and_required_pairs(self):
        self.fails({"format": validator.TOKEN_FORMAT, "tokens": {}, "contrastPairs": []}, "no-tokens")
        data = {"format": validator.TOKEN_FORMAT, "tokens": {"gap": {"$type": "dimension", "$value": {"value": 8, "unit": "px"}}}, "contrastPairs": []}
        self.assertTrue(validator.validate_tokens(data)["ok"])
        self.assertEqual(validator.validate_tokens(data)["counts"]["evaluatedPairs"], 0)
        self.assertFalse(validator.validate_tokens(data, require_contrast=True)["ok"])

    def test_opaque_srgb_only_and_valid_ranges(self):
        for key, bad_values in (("alpha", [0, 0.5, True, 1.1, float("nan")]),
                                ("colorSpace", ["display-p3", "SRGB", None]),
                                ("components", [[0, 0], [0, 0, 0, 1], [True, 0, 0], [-1, 0, 0], [0, "0", 0], [0, math.inf, 0]])):
            for value in bad_values:
                data = token_document()
                data["tokens"]["fg"]["$value"][key] = value
                self.fails(data)
        data = token_document()
        data["tokens"]["fg"]["$value"]["alpha"] = 1
        self.assertTrue(validator.validate_tokens(data)["ok"])

    def test_explicit_dimension_duration_family_weight_and_number_types(self):
        data = token_document()
        good = {
            "length": {"$type": "dimension", "$value": {"value": 1.25, "unit": "rem"}},
            "duration": {"$type": "duration", "$value": {"value": 0.1, "unit": "s"}},
            "family": {"$type": "fontFamily", "$value": ["system-ui", "sans-serif"]},
            "weight": {"$type": "fontWeight", "$value": 500},
            "number": {"$type": "number", "$value": 1.5},
        }
        data["tokens"].update(good)
        self.assertTrue(validator.validate_tokens(data)["ok"])
        for key, bad in (("length", 8), ("length", {"value": 8, "unit": "%"}),
                         ("duration", {"value": -1, "unit": "ms"}), ("family", []),
                         ("weight", "bold"), ("weight", 1001), ("number", True), ("number", math.nan)):
            candidate = copy.deepcopy(data)
            candidate["tokens"][key]["$value"] = bad
            self.fails(candidate)

    def test_cubic_bezier_easing_tokens(self):
        data = token_document()
        data["tokens"]["easing"] = {
            "standard": {"$type": "cubicBezier", "$value": [0.2, 0, 0, 1]},
            "overshoot": {"$type": "cubicBezier", "$value": [0.34, 1.56, 0.64, 1]},
            "alias": {"$type": "cubicBezier", "$value": "{easing.standard}"},
        }
        self.assertTrue(validator.validate_tokens(data)["ok"])
        for bad, code in (([0.2, 0, 0], "cubic-bezier"), ([0.2, 0, 0, 1, 1], "cubic-bezier"),
                          ([1.2, 0, 0, 1], "range"), ([0.2, 0, -0.1, 1], "range"),
                          ([0.2, True, 0, 1], "number"), ("cubic-bezier(0.2, 0, 0, 1)", "type"),
                          ({"x1": 0.2}, "type")):
            with self.subTest(bad=bad):
                candidate = copy.deepcopy(data)
                candidate["tokens"]["easing"]["standard"]["$value"] = bad
                self.fails(candidate, code)

    def test_font_family_literal_names_fallbacks_and_whole_aliases(self):
        for value in ("Inter", "SF Pro Text", "Noto Sans 2", "DIN-2014", "Founder's Grotesk",
                      "思源黑体", "ПТ Санс", "var", "calc", "system-ui",
                      ["Inter", "Helvetica Neue", "sans-serif"], "{base.font}"):
            with self.subTest(value=value):
                data = font_document(value)
                data["tokens"]["chain"] = {"$type": "fontFamily", "$value": "{body}"}
                before = copy.deepcopy(data)
                report = validator.validate_tokens(data)
                self.assertTrue(report["ok"], report)
                self.assertEqual(report["counts"]["resolvedTokens"], 3)
                self.assertEqual(data, before)

    def test_font_family_css_functions_and_escapes_fail_at_literal_path(self):
        for family in ("var(--font-body)", "VAR(--font-body)", "var(--font-body, sans-serif)",
                       "calc(1rem + 2px)", "clamp(1, 2, 3)", "env(font-name)", "attr(data-font)",
                       "prefix var(--font-body) suffix", r"v\61r\28--font-body\29",
                       "Display (Text)", "Display)"):
            for value, path in ((family, "/tokens/body/$value"),
                                (["Inter", family], "/tokens/body/$value/1")):
                with self.subTest(value=value):
                    data = font_document(value)
                    before = copy.deepcopy(data)
                    report = self.fails(data, "font-family-syntax")
                    self.assertIn(path, {issue["path"] for issue in report["issues"]})
                    self.assertEqual(report["counts"]["resolvedTokens"], 1)
                    self.assertEqual(data, before)

    def test_font_family_embedded_and_array_aliases_fail(self):
        for value, path in ((["{base.font}"], "/tokens/body/$value/0"),
                            ("prefix {base.font} suffix", "/tokens/body/$value"),
                            (["Inter", "prefix {base.font} suffix"], "/tokens/body/$value/1"),
                            ("prefix {base.font suffix", "/tokens/body/$value"),
                            ("prefix base.font} suffix", "/tokens/body/$value"),
                            (["{#/base/font}"], "/tokens/body/$value/0")):
            with self.subTest(value=value):
                data = font_document(value)
                before = copy.deepcopy(data)
                report = self.fails(data, "alias-format")
                self.assertIn(path, {issue["path"] for issue in report["issues"]})
                self.assertEqual(report["counts"]["resolvedTokens"], 1)
                self.assertEqual(data, before)

    def test_font_family_array_keeps_shape_checks_and_original_indices(self):
        report = self.fails(font_document(["", False, "Inter", "Inter", "var(--font-body)"]))
        issues = {(issue["code"], issue["path"]) for issue in report["issues"]}
        self.assertTrue({("text", "/tokens/body/$value/0"), ("text", "/tokens/body/$value/1"),
                         ("duplicate", "/tokens/body/$value/3"),
                         ("font-family-syntax", "/tokens/body/$value/4")}.issubset(issues), report)

    def test_pair_references_purpose_thresholds_and_duplicate_ids(self):
        for key, value in (("foreground", "missing"), ("minimum", True), ("minimum", math.inf),
                           ("minimum", 22), ("minimum", 4.49), ("purpose", []), ("state", "")):
            data = token_document()
            data["contrastPairs"][0][key] = value
            self.fails(data)
        data = token_document()
        data["tokens"]["fg"] = {"$type": "number", "$value": 0}
        self.fails(data, "contrast-type")
        data = token_document()
        data["contrastPairs"].append(copy.deepcopy(data["contrastPairs"][0]))
        self.fails(data, "duplicate-id")


class CLITests(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory(prefix=".test-Пример с пробелами-", dir=CLI.parent)
        self.addCleanup(self.temp.cleanup)
        self.input = Path(self.temp.name) / "Контракт и токены.json"

    def run_cli(self, command="tokens", extra=()):
        return subprocess.run([sys.executable, "-B", "-X", "utf8", str(CLI), command,
                               str(self.input), "--json", *extra], capture_output=True,
                              text=True, encoding="utf-8", timeout=10, check=False)

    def write(self, data):
        self.input.write_text(json.dumps(data, ensure_ascii=False), encoding="utf-8")

    def test_actual_cli_cyrillic_spaces_is_read_only(self):
        for command, filename in (("contract", "design-contract.example.json"), ("tokens", "tokens.example.json")):
            with self.subTest(command=command):
                self.write(example(filename))
                before = hashlib.sha256(self.input.read_bytes()).digest()
                result = self.run_cli(command)
                self.assertEqual(result.returncode, 0, result.stdout + result.stderr)
                self.assertTrue(json.loads(result.stdout)["ok"])
                self.assertEqual(hashlib.sha256(self.input.read_bytes()).digest(), before)
                self.assertEqual(list(self.input.parent.iterdir()), [self.input])

    def test_broken_then_fixed_cli_proof(self):
        data = token_document(foreground=(0.8,) * 3)
        self.write(data)
        before = self.input.read_bytes()
        broken = self.run_cli(extra=("--require-contrast",))
        self.assertEqual(broken.returncode, 1)
        self.assertFalse(json.loads(broken.stdout)["contrast"][0]["pass"])
        self.assertEqual(self.input.read_bytes(), before)
        data["tokens"]["fg"]["$value"]["components"] = [0, 0, 0]
        self.write(data)
        fixed = self.run_cli(extra=("--require-contrast",))
        self.assertEqual(fixed.returncode, 0)
        self.assertEqual(json.loads(fixed.stdout)["contrast"][0]["ratio"], 21)

    def test_font_family_css_syntax_actual_cli_fails_without_writes(self):
        for family in ("var(--font-body)", "VAR(--font-body, sans-serif)", "calc(1rem + 2px)",
                       "env(font-name)", "prefix attr(data-font) suffix", r"v\61r\28--font-body\29"):
            for value, path in ((family, "/tokens/body/$value"),
                                (["Inter", family], "/tokens/body/$value/1")):
                with self.subTest(value=value):
                    self.write(font_document(value))
                    before = self.input.read_bytes()
                    result = self.run_cli()
                    self.assertEqual(result.returncode, 1, result.stdout + result.stderr)
                    report = json.loads(result.stdout)
                    self.assertFalse(report["ok"], report)
                    self.assertIn(("font-family-syntax", path),
                                  {(issue["code"], issue["path"]) for issue in report["issues"]})
                    self.assertEqual(self.input.read_bytes(), before)
                    self.assertEqual(list(self.input.parent.iterdir()), [self.input])

    def test_font_family_embedded_aliases_actual_cli_fail_without_writes(self):
        for value, path in ((["{base.font}"], "/tokens/body/$value/0"),
                            ("prefix {base.font} suffix", "/tokens/body/$value"),
                            (["Inter", "prefix {base.font} suffix"], "/tokens/body/$value/1"),
                            ("prefix {base.font suffix", "/tokens/body/$value")):
            with self.subTest(value=value):
                self.write(font_document(value))
                before = self.input.read_bytes()
                result = self.run_cli()
                self.assertEqual(result.returncode, 1, result.stdout + result.stderr)
                report = json.loads(result.stdout)
                self.assertFalse(report["ok"], report)
                self.assertIn(("alias-format", path),
                              {(issue["code"], issue["path"]) for issue in report["issues"]})
                self.assertEqual(self.input.read_bytes(), before)
                self.assertEqual(list(self.input.parent.iterdir()), [self.input])

    def test_font_family_literals_and_whole_alias_actual_cli_pass_without_writes(self):
        for value in ("Noto Sans 2", ["ПТ Санс", "思源黑体", "Founder's Grotesk", "sans-serif"],
                      "{base.font}"):
            with self.subTest(value=value):
                data = font_document(value)
                data["tokens"]["chain"] = {"$type": "fontFamily", "$value": "{body}"}
                self.write(data)
                before = self.input.read_bytes()
                result = self.run_cli()
                self.assertEqual(result.returncode, 0, result.stdout + result.stderr)
                report = json.loads(result.stdout)
                self.assertTrue(report["ok"], report)
                self.assertEqual(report["counts"]["resolvedTokens"], 3)
                self.assertEqual(self.input.read_bytes(), before)
                self.assertEqual(list(self.input.parent.iterdir()), [self.input])

    def test_malformed_duplicate_nonfinite_and_missing_inputs_are_exit_2(self):
        for source in ('{"x":', '{"format": 1, "format": 2}', '{"x": NaN}', '{"x": 1e309}'):
            with self.subTest(source=source):
                self.input.write_text(source, encoding="utf-8")
                result = self.run_cli()
                self.assertEqual(result.returncode, 2, result.stdout)
                self.assertFalse(json.loads(result.stdout)["ok"])
        self.input.unlink()
        self.assertEqual(self.run_cli().returncode, 2)

    def test_unsupported_and_noop_actual_cli_are_nonpasses(self):
        for data in ([], {}, {"format": "dtcg", "tokens": {}, "contrastPairs": []},
                     {"format": validator.TOKEN_FORMAT, "tokens": {"x": {"$type": "number", "$value": 1}}, "contrastPairs": []}):
            self.write(data)
            result = self.run_cli(extra=("--require-contrast",))
            self.assertEqual(result.returncode, 1, result.stdout)
            self.assertFalse(json.loads(result.stdout)["ok"])

    def test_actual_cli_unrounded_threshold(self):
        ratio = validator.contrast_ratio((0.5,) * 3, (1,) * 3)
        for minimum, code in ((ratio, 0), (math.nextafter(ratio, math.inf), 1)):
            self.write(token_document((0.5,) * 3, minimum=minimum, purpose="custom"))
            self.assertEqual(self.run_cli().returncode, code)

    def test_usage_error_is_exit_2(self):
        result = subprocess.run([sys.executable, "-B", "-X", "utf8", str(CLI)], capture_output=True, timeout=10)
        self.assertEqual(result.returncode, 2)


if __name__ == "__main__":
    unittest.main(verbosity=2)
