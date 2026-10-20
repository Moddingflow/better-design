#!/usr/bin/env python3
"""Broken -> detected and fixed -> clean proofs for check_layout.py, plus the real CLI."""

import copy
import json
from pathlib import Path
import subprocess
import sys
import tempfile
import unittest

import check_layout as layout


SKILL = Path(__file__).resolve().parents[1]
CLI = SKILL / "scripts" / "check_layout.py"
EXAMPLE = json.loads((SKILL / "assets" / "layout.example.json").read_text(encoding="utf-8"))


def node(data, node_id):
    return next(n for n in data["nodes"] if n["id"] == node_id)


def move(data, node_id, dx=0, dy=0, with_children=True):
    ids = {node_id}
    if with_children:
        ids |= {n["id"] for n in data["nodes"] if n.get("parent") == node_id}
    for n in data["nodes"]:
        if n["id"] in ids:
            for key in ("rect", "ink"):
                if key in n:
                    n[key][0] += dx
                    n[key][1] += dy


def menu(count=4, gap=16, label_width=80):
    """A vertical main menu: equal buttons, equal gaps, centered labels."""
    nodes = [{"id": "menu", "parent": None, "role": "window", "rect": [760, 300, 400, 0], "padding": 32}]
    y = 332
    for i in range(count):
        bid = "b%d" % i
        nodes.append({"id": bid, "parent": "menu", "role": "control", "rect": [792, y, 336, 56]})
        nodes.append({"id": bid + "-label", "parent": bid, "role": "text", "rect": [792, y, 336, 56],
                      "ink": [960 - label_width / 2, y + 21, label_width, 14]})
        y += 56 + gap
    nodes[0]["rect"][3] = y - gap + 32 - 300
    return {"format": layout.FORMAT, "viewport": {"width": 1920, "height": 1080}, "nodes": nodes}


def codes(report, severity="error"):
    return {i["code"] for i in report["issues"] if i["severity"] == severity}


class ExampleTests(unittest.TestCase):
    def test_example_is_clean(self):
        report = layout.check(EXAMPLE)
        self.assertTrue(report["ok"], report["issues"])
        self.assertEqual(report["issues"], [])

    def test_menu_is_clean(self):
        report = layout.check(menu())
        self.assertTrue(report["ok"], report["issues"])
        self.assertEqual(report["issues"], [])


class SpacingTests(unittest.TestCase):
    def test_one_button_with_a_larger_gap_is_uneven(self):
        data = menu()
        for n in ("b2", "b3"):
            move(data, n, dy=6)
        self.assertIn("uneven-gap", codes(layout.check(data)))

    def test_off_scale_gap_is_a_warning(self):
        data = menu(gap=10)
        data["spacing"] = [0, 4, 8, 12, 16, 24, 32]
        report = layout.check(data)
        self.assertTrue(report["ok"], report["issues"])
        self.assertIn("off-scale", codes(report, "warning"))

    def test_padding_smaller_than_inner_gap_is_a_warning(self):
        data = menu(gap=40)
        data["nodes"][0]["padding"] = 16
        move(data, "menu", with_children=False)
        for n in data["nodes"][1:]:
            if n["parent"] == "menu":
                move(data, n["id"], dy=-16)
        data["nodes"][0]["rect"][3] -= 32
        report = layout.check(data)
        self.assertIn("inset-below-gap", codes(report, "warning"), report["issues"])


class AlignmentTests(unittest.TestCase):
    def test_button_shifted_sideways_breaks_the_column(self):
        data = menu()
        move(data, "b1", dx=4)
        found = codes(layout.check(data))
        self.assertTrue({"misaligned-column", "misaligned-edge"} & found, found)

    def test_row_with_one_button_lower_is_misaligned(self):
        data = copy.deepcopy(EXAMPLE)
        move(data, "btn-apply", dy=3)
        data["nodes"][0]["rect"][3] += 3  # keep it inside the window so only alignment fails
        node(data, "actions")["rect"][3] += 3
        self.assertIn("misaligned-row", codes(layout.check(data)))

    def test_settings_label_starting_further_right_breaks_the_keyline(self):
        data = copy.deepcopy(EXAMPLE)
        move(data, "label-volume", dx=5)
        found = codes(layout.check(data))
        self.assertTrue({"misaligned-keyline", "misaligned-edge"} & found, found)
        self.assertIn("misaligned-keyline", found)

    def test_right_aligned_controls_of_different_width_are_fine(self):
        data = copy.deepcopy(EXAMPLE)
        node(data, "slider-volume")["rect"][0] += 4
        node(data, "slider-volume")["rect"][2] -= 4
        self.assertTrue(layout.check(data)["ok"])

    def test_title_a_few_pixels_off_the_content_keyline(self):
        data = copy.deepcopy(EXAMPLE)
        node(data, "title")["ink"][0] += 4
        self.assertIn("misaligned-edge", codes(layout.check(data)))

    def test_centered_title_over_a_left_aligned_list_is_fine(self):
        data = copy.deepcopy(EXAMPLE)
        node(data, "title").update(align="center", ink=[870, 282, 180, 22])
        self.assertTrue(layout.check(data)["ok"], layout.check(data)["issues"])

    def test_label_not_vertically_centered_in_its_row(self):
        data = copy.deepcopy(EXAMPLE)
        move(data, "label-subtitles", dy=3)
        self.assertIn("misaligned-row", codes(layout.check(data)))


class ControlContentTests(unittest.TestCase):
    def test_label_two_pixels_low_is_off_center(self):
        data = menu()
        node(data, "b2-label")["ink"][1] += 2
        report = layout.check(data)
        self.assertIn("off-center", codes(report))
        self.assertIn("below", str(report["issues"]))

    def test_icon_with_declared_optical_offset_passes_and_undeclared_fails(self):
        data = menu(count=1)
        btn = node(data, "b0")
        data["nodes"] = [n for n in data["nodes"] if n["id"] != "b0-label"]
        btn["rect"] = [792, 332, 56, 56]
        icon = {"id": "play", "parent": "b0", "role": "icon", "rect": [804, 344, 32, 32],
                "ink": [813, 348, 20, 24]}  # pushed 3px right of center on purpose
        data["nodes"].append(icon)
        self.assertIn("off-center", codes(layout.check(data)))
        icon["optical"] = [3, 0]
        self.assertTrue(layout.check(data)["ok"], layout.check(data)["issues"])

    def test_start_aligned_rows_need_the_same_inset(self):
        data = menu(count=3)
        for i in range(3):
            node(data, "b%d" % i)["align"] = "start"
            node(data, "b%d-label" % i)["ink"][0] = 808
        node(data, "b1-label")["ink"][0] = 812
        self.assertIn("inconsistent-inset", codes(layout.check(data)))

    def test_stretched_text_without_ink_cannot_be_measured(self):
        data = menu(count=1)
        del node(data, "b0-label")["ink"]
        report = layout.check(data)
        self.assertTrue(report["ok"])
        self.assertIn("cannot-measure", codes(report, "warning"))

    def test_icons_of_different_size_in_sibling_buttons_warn(self):
        data = menu(count=2)
        for i, size in enumerate((20, 24)):
            b = node(data, "b%d" % i)["rect"]
            node(data, "b%d-label" % i)["ink"][0] += 14
            data["nodes"].append({"id": "i%d" % i, "parent": "b%d" % i, "role": "icon",
                                  "rect": [916 - size / 2, b[1] + 28 - size / 2, size, size]})
            node(data, "b%d-label" % i)["ink"][0] = 916 + size / 2 + 8
            node(data, "b%d-label" % i)["ink"][2] = 2 * (960 - (916 + size / 2 + 8)) + size + 8 - size - 8
        report = layout.check(data)
        self.assertIn("icon-size-mismatch", codes(report, "warning"), report["issues"])


class BreathingTests(unittest.TestCase):
    def test_button_wider_than_its_window_overflows(self):
        data = menu()
        node(data, "b1")["rect"][2] += 60
        self.assertIn("overflow", codes(layout.check(data)))

    def test_control_almost_touching_the_window_edge(self):
        data = copy.deepcopy(EXAMPLE)
        move(data, "toggle-vsync", dx=2)
        report = layout.check(data)
        self.assertIn("tight-edge", codes(report))

    def test_root_panel_touching_the_screen_edge(self):
        data = menu()
        move(data, "menu", dx=-760 + 6)
        for n in data["nodes"][1:]:
            move(data, n["id"], dx=-760 + 6, with_children=False)
        self.assertIn("tight-edge", codes(layout.check(data)))

    def test_edge_docked_bar_is_allowed(self):
        data = menu()
        data["nodes"].append({"id": "topbar", "parent": None, "role": "container",
                              "rect": [0, 0, 1920, 48], "edge": True})
        self.assertTrue(layout.check(data)["ok"])

    def test_scroll_container_allows_overflow_along_its_axis(self):
        data = menu()
        data["nodes"][0]["rect"][3] = 200
        self.assertIn("overflow", codes(layout.check(data)))
        data["nodes"][0]["scroll"] = "y"
        self.assertNotIn("overflow", codes(layout.check(data)))

    def test_overlapping_siblings(self):
        data = menu()
        move(data, "b1", dy=-30)
        self.assertIn("overlap", codes(layout.check(data)))


class InputTests(unittest.TestCase):
    def rejects(self, data):
        with self.assertRaises(layout.InputError):
            layout.check(data)

    def test_invalid_inputs(self):
        base = menu()
        cases = []
        for mutate in (
            lambda d: d.update(format="other"),
            lambda d: d["nodes"].append(copy.deepcopy(d["nodes"][1])),
            lambda d: d["nodes"][1].update(parent="missing"),
            lambda d: d["nodes"][1].update(rect=[0, 0, -1, 5]),
            lambda d: d["nodes"][1].update(role="widget"),
            lambda d: d["nodes"][1].update(extra=1),
            lambda d: d["nodes"][0].update(parent="b0"),
            lambda d: d.update(viewport={"width": 0, "height": 10}),
        ):
            data = copy.deepcopy(base)
            mutate(data)
            cases.append(data)
        for data in cases:
            with self.subTest(data=json.dumps(data)[:80]):
                self.rejects(data)


class CliTests(unittest.TestCase):
    def run_cli(self, data=None, raw=None, *args):
        with tempfile.TemporaryDirectory() as tmp:
            path = Path(tmp) / "layout.json"
            path.write_text(raw if raw is not None else json.dumps(data), encoding="utf-8")
            return subprocess.run([sys.executable, "-B", "-X", "utf8", str(CLI), str(path), *args],
                                  capture_output=True, text=True, encoding="utf-8")

    def test_exit_codes(self):
        self.assertEqual(self.run_cli(EXAMPLE).returncode, 0)
        broken = copy.deepcopy(EXAMPLE)
        move(broken, "label-volume", dx=5)
        result = self.run_cli(broken, None, "--json")
        self.assertEqual(result.returncode, 1, result.stdout)
        self.assertFalse(json.loads(result.stdout)["ok"])
        self.assertEqual(self.run_cli(raw='{"a": 1, "a": 2}').returncode, 2)
        self.assertEqual(self.run_cli(raw="not json").returncode, 2)


if __name__ == "__main__":
    unittest.main(verbosity=1)
