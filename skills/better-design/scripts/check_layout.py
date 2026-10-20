#!/usr/bin/env python3
"""Read-only geometry checks for a rendered UI layout dump (better-design-layout-v1).

Finds uneven gaps, broken alignment lines, off-center content inside controls, overflow,
overlap, and elements crammed against their container edge. Python 3.10+, stdlib only.
"""

import argparse
import json
import math
from pathlib import Path


FORMAT = "better-design-layout-v1"
ROLES = {"window", "container", "control", "text", "icon", "image", "decor"}
CONTENT_ROLES = {"text", "icon", "image"}
ALIGNS = {"center", "start", "end"}
SCROLL = {"x", "y", "both"}
ROOT_FIELDS = {"format", "viewport", "tolerance", "minEdgeMargin", "minControlInset",
               "nearMiss", "spacing", "nodes", "note"}
NODE_FIELDS = {"id", "parent", "role", "rect", "ink", "padding", "align", "optical", "group",
               "overlap", "edge", "scroll", "name"}
DEFAULTS = {"tolerance": 1.0, "minEdgeMargin": 16.0, "minControlInset": 4.0, "nearMiss": 8.0}
LIMITATIONS = [
    "Checks only the dumped nodes and their boxes; no color, type, motion, or task review.",
    "Ambiguous groupings are skipped, so PASS is not proof that the screen looks right.",
    "Text and icon centering is exact only when 'ink' (visible bounds) is provided.",
]


class InputError(Exception):
    pass


def finite(value):
    if type(value) not in (int, float):
        return False
    try:
        return math.isfinite(value)
    except OverflowError:
        return False


class Box:
    __slots__ = ("x", "y", "w", "h")

    def __init__(self, x, y, w, h):
        self.x, self.y, self.w, self.h = float(x), float(y), float(w), float(h)

    @property
    def r(self):
        return self.x + self.w

    @property
    def b(self):
        return self.y + self.h

    @property
    def cx(self):
        return self.x + self.w / 2

    @property
    def cy(self):
        return self.y + self.h / 2

    def shifted(self, dx, dy):
        return Box(self.x - dx, self.y - dy, self.w, self.h)

    @staticmethod
    def union(boxes):
        x, y = min(b.x for b in boxes), min(b.y for b in boxes)
        return Box(x, y, max(b.r for b in boxes) - x, max(b.b for b in boxes) - y)


def fmt(value):
    return ("%.1f" % value).rstrip("0").rstrip(".")


def spread(values):
    return max(values) - min(values) if values else 0.0


# ---------------------------------------------------------------- input validation

def as_box(value, path):
    if (not isinstance(value, list) or len(value) != 4 or not all(finite(v) for v in value)
            or value[2] < 0 or value[3] < 0):
        raise InputError(path + ": expected [x, y, width, height] with finite numbers, size >= 0.")
    return Box(*value)


def as_padding(value, path):
    if finite(value) and value >= 0:
        return (float(value),) * 4
    if isinstance(value, list) and len(value) == 4 and all(finite(v) and v >= 0 for v in value):
        return tuple(float(v) for v in value)
    raise InputError(path + ": padding is a number or [top, right, bottom, left], all >= 0.")


def load(data):
    if not isinstance(data, dict):
        raise InputError("Root must be an object.")
    unknown = sorted(data.keys() - ROOT_FIELDS)
    if unknown:
        raise InputError("Unknown root fields: " + ", ".join(unknown))
    if data.get("format") != FORMAT:
        raise InputError("format must be '%s'." % FORMAT)
    viewport = data.get("viewport")
    if (not isinstance(viewport, dict) or set(viewport) != {"width", "height"}
            or not all(finite(v) and v > 0 for v in viewport.values())):
        raise InputError("viewport must be {width, height} with positive numbers.")
    settings = {}
    for key, default in DEFAULTS.items():
        value = data.get(key, default)
        if not finite(value) or value < 0:
            raise InputError(key + " must be a number >= 0.")
        settings[key] = float(value)
    spacing = data.get("spacing")
    if spacing is not None:
        if not isinstance(spacing, list) or not spacing or not all(finite(v) and v >= 0 for v in spacing):
            raise InputError("spacing must be a non-empty list of numbers >= 0.")
        settings["spacing"] = sorted(float(v) for v in spacing)
    nodes = data.get("nodes")
    if not isinstance(nodes, list) or not nodes:
        raise InputError("nodes must be a non-empty list.")

    parsed = {}
    for index, raw in enumerate(nodes):
        path = "nodes[%d]" % index
        if not isinstance(raw, dict):
            raise InputError(path + ": expected an object.")
        unknown = sorted(raw.keys() - NODE_FIELDS)
        if unknown:
            raise InputError(path + ": unknown fields: " + ", ".join(unknown))
        node_id = raw.get("id")
        if not isinstance(node_id, str) or not node_id:
            raise InputError(path + ": id must be a non-empty string.")
        if node_id in parsed:
            raise InputError(path + ": duplicate id '%s'." % node_id)
        path = "node '%s'" % node_id
        role = raw.get("role")
        if role not in ROLES:
            raise InputError(path + ": role must be one of " + ", ".join(sorted(ROLES)) + ".")
        parent = raw.get("parent")
        if parent is not None and (not isinstance(parent, str) or not parent):
            raise InputError(path + ": parent must be a node id or null.")
        node = {"id": node_id, "parent": parent, "role": role, "rect": as_box(raw.get("rect"), path + ".rect"),
                "name": raw.get("name") if isinstance(raw.get("name"), str) else node_id,
                "group": raw.get("group"), "overlap": raw.get("overlap", False), "edge": raw.get("edge", False),
                "align": raw.get("align", "start" if role == "text" else "center"), "scroll": raw.get("scroll"), "children": []}
        if "ink" in raw:
            node["ink"] = as_box(raw["ink"], path + ".ink")
        if "padding" in raw:
            node["padding"] = as_padding(raw["padding"], path + ".padding")
        optical = raw.get("optical", [0, 0])
        if not isinstance(optical, list) or len(optical) != 2 or not all(finite(v) for v in optical):
            raise InputError(path + ": optical must be [dx, dy].")
        node["optical"] = (float(optical[0]), float(optical[1]))
        for key in ("overlap", "edge"):
            if type(node[key]) is not bool:
                raise InputError(path + ": %s must be true or false." % key)
        if node["align"] not in ALIGNS:
            raise InputError(path + ": align must be center, start or end.")
        if node["scroll"] is not None and node["scroll"] not in SCROLL:
            raise InputError(path + ": scroll must be x, y or both.")
        if node["group"] is not None and not isinstance(node["group"], str):
            raise InputError(path + ": group must be a string.")
        parsed[node_id] = node

    for node in parsed.values():
        if node["parent"] is not None:
            if node["parent"] not in parsed:
                raise InputError("node '%s': parent '%s' does not exist." % (node["id"], node["parent"]))
            parsed[node["parent"]]["children"].append(node)
    for node in parsed.values():
        seen, current = set(), node
        while current["parent"] is not None:
            if current["id"] in seen:
                raise InputError("Parent cycle through node '%s'." % node["id"])
            seen.add(current["id"])
            current = parsed[current["parent"]]
    viewport_box = Box(0, 0, viewport["width"], viewport["height"])
    return parsed, viewport_box, settings


# ---------------------------------------------------------------- checks

class Checker:
    def __init__(self, nodes, viewport, settings):
        self.nodes, self.viewport, self.s = nodes, viewport, settings
        self.tol = settings["tolerance"]
        self.issues = []
        self.counts = {"nodes": len(nodes), "rows": 0, "columns": 0, "keylineSets": 0, "controls": 0}

    def add(self, severity, code, ids, message, **values):
        issue = {"severity": severity, "code": code, "nodes": list(ids), "message": message}
        if values:
            issue["values"] = values
        self.issues.append(issue)

    def label(self, nodes):
        return ", ".join(n["name"] for n in nodes)

    @staticmethod
    def visible_box(node):
        return node.get("ink") or node["rect"]

    def layout_children(self, node):
        return [c for c in node["children"] if c["role"] != "decor"]

    def required_inset(self, parent):
        if parent is None:
            return None
        if "padding" in parent:
            return parent["padding"]
        if parent["role"] == "window":
            return (self.s["minEdgeMargin"],) * 4
        if parent["role"] == "control":
            return (self.s["minControlInset"],) * 4
        return None

    # -- containment and edge margin
    def check_containment(self):
        for node in self.nodes.values():
            if node["role"] == "decor":
                continue
            parent = self.nodes.get(node["parent"]) if node["parent"] else None
            frame = parent["rect"] if parent else self.viewport
            scroll = parent["scroll"] if parent else None
            box = node["rect"]
            # Content inside controls is judged by its visible ink; a stretched text rect is normal.
            if parent and parent["role"] == "control" and node["role"] in CONTENT_ROLES:
                box = self.visible_box(node)
            insets = (box.y - frame.y, frame.r - box.r, frame.b - box.b, box.x - frame.x)
            sides = ("top", "right", "bottom", "left")
            axis = ("y", "x", "y", "x")
            where = parent["name"] if parent else "viewport"
            over = [(sides[i], -insets[i]) for i in range(4)
                    if insets[i] < -self.tol and not (scroll in (axis[i], "both"))]
            if over:
                text = ", ".join("%s by %spx" % (side, fmt(px)) for side, px in over)
                self.add("error", "overflow", [node["id"]],
                         "%s sticks out of %s: %s." % (node["name"], where, text), sides=dict(over))
                continue
            if node["edge"]:
                continue
            if parent is None:
                if self.covers(box, self.viewport):
                    continue
                need = (self.s["minEdgeMargin"],) * 4
            else:
                need = self.required_inset(parent)
                if need is None:
                    continue
                if (parent["role"] == "control" and node["role"] in CONTENT_ROLES and "ink" not in node
                        and self.covers(box, frame, 0.9)):
                    continue  # stretched content without ink: reported by the centering check
            tight = [(sides[i], insets[i], need[i]) for i in range(4)
                     if insets[i] < need[i] - self.tol and not (scroll in (axis[i], "both"))]
            if tight:
                text = ", ".join("%s %spx (needs %s)" % (s, fmt(v), fmt(n)) for s, v, n in tight)
                self.add("error", "tight-edge", [node["id"]],
                         "%s is crammed against the edge of %s: %s." % (node["name"], where, text),
                         insets={s: v for s, v, _ in tight})

    @staticmethod
    def covers(box, frame, fraction=None):
        if fraction is None:
            return (abs(box.x - frame.x) <= 1 and abs(box.y - frame.y) <= 1
                    and abs(box.r - frame.r) <= 1 and abs(box.b - frame.b) <= 1)
        return box.w >= frame.w * fraction and box.h >= frame.h * fraction

    # -- overlap
    def check_overlap(self):
        for parent in self.parents():
            kids = [c for c in self.layout_children(parent) if not c["overlap"]]
            for i, a in enumerate(kids):
                for b in kids[i + 1:]:
                    ra, rb = self.boxes_for_overlap(parent, a), self.boxes_for_overlap(parent, b)
                    ox = min(ra.r, rb.r) - max(ra.x, rb.x)
                    oy = min(ra.b, rb.b) - max(ra.y, rb.y)
                    if ox > self.tol and oy > self.tol:
                        self.add("error", "overlap", [a["id"], b["id"]],
                                 "%s and %s overlap by %sx%spx." % (a["name"], b["name"], fmt(ox), fmt(oy)))

    def boxes_for_overlap(self, parent, node):
        if parent and parent["role"] == "control" and node["role"] in CONTENT_ROLES:
            return self.visible_box(node)
        return node["rect"]

    def parents(self):
        return [n for n in self.nodes.values() if n["role"] != "decor" and n["children"]]

    # -- rows, columns, gaps
    def clusters(self, nodes, axis):
        """Group nodes that share a band on the cross axis (axis='row' -> same vertical band)."""
        def span(n):
            b = n["rect"]
            return (b.y, b.b) if axis == "row" else (b.x, b.r)

        parent = list(range(len(nodes)))

        def find(i):
            while parent[i] != i:
                parent[i] = parent[parent[i]]
                i = parent[i]
            return i

        for i in range(len(nodes)):
            for j in range(i + 1, len(nodes)):
                (a0, a1), (b0, b1) = span(nodes[i]), span(nodes[j])
                small, large = sorted((a1 - a0, b1 - b0))
                if small <= 0 or large > small * 4:
                    continue
                if min(a1, b1) - max(a0, b0) >= small * 0.5:
                    parent[find(i)] = find(j)
        groups = {}
        for i, n in enumerate(nodes):
            groups.setdefault(find(i), []).append(n)
        result = []
        for members in groups.values():
            if len(members) < 2:
                continue
            key = (lambda n: self.align_box(n).x) if axis == "row" else (lambda n: self.align_box(n).y)
            members.sort(key=key)
            # Members must follow each other along the main axis; otherwise the group is ambiguous.
            ordered = all(self.main_gap(a, b, axis) >= -self.tol for a, b in zip(members, members[1:]))
            if ordered:
                result.append(members)
        return result

    def align_box(self, node):
        if node["role"] in CONTENT_ROLES and "ink" in node:
            return node["ink"]
        return node["rect"]

    def main_gap(self, a, b, axis):
        ba, bb = a["rect"], b["rect"]
        return bb.x - ba.r if axis == "row" else bb.y - ba.b

    def check_rhythm(self):
        self.gaps_by_parent = {}
        for parent in self.parents():
            kids = [c for c in self.layout_children(parent) if not c["overlap"]]
            if parent["role"] == "control":
                continue  # content inside a control is checked by the centering pass
            for row in self.clusters(kids, "row"):
                self.counts["rows"] += 1
                self.check_line(row, "row")
                self.check_gaps(parent, row, "row")
            by_kind = {}
            for kid in kids:
                by_kind.setdefault((kid["role"], kid["group"]), []).append(kid)
            for members in by_kind.values():
                for column in self.clusters(members, "column"):
                    self.counts["columns"] += 1
                    self.check_line(column, "column")
                    self.check_gaps(parent, column, "column")

    def check_line(self, members, axis):
        boxes = [self.align_box(n) for n in members]
        if axis == "row":
            lines = {"top": [b.y for b in boxes], "center": [b.cy for b in boxes], "bottom": [b.b for b in boxes]}
            same_size = spread([b.h for b in boxes]) <= self.tol
        else:
            lines = {"start": [b.x for b in boxes], "center": [b.cx for b in boxes], "end": [b.r for b in boxes]}
            same_size = spread([b.w for b in boxes]) <= self.tol
        spreads = {name: spread(values) for name, values in lines.items()}
        broken = all(v > self.tol for v in spreads.values()) if not same_size else spreads[next(iter(spreads))] > self.tol
        if broken:
            best = min(spreads, key=spreads.get)
            code = "misaligned-row" if axis == "row" else "misaligned-column"
            self.add("error", code, [n["id"] for n in members],
                     "Items in a %s [%s] do not share a line: closest is the %s line, off by %spx." % (
                         axis, self.label(members), best, fmt(spreads[best])),
                     spreads={k: round(v, 2) for k, v in spreads.items()})
        if axis == "row":
            controls = [n for n in members if n["role"] == "control"]
            for key in {(n["group"]) for n in controls}:
                same = [n for n in controls if n["group"] == key]
                heights = [n["rect"].h for n in same]
                if len(same) > 1 and spread(heights) > self.tol:
                    self.add("warning", "size-mismatch", [n["id"] for n in same],
                             "Controls in one row have different heights: %s." % ", ".join(
                                 "%s=%s" % (n["name"], fmt(n["rect"].h)) for n in same))

    def check_gaps(self, parent, members, axis):
        gaps, pairs = [], []
        for a, b in zip(members, members[1:]):
            if a["role"] == b["role"] and a["group"] == b["group"]:
                gaps.append(self.main_gap(a, b, axis))
                pairs.append((a, b))
        # Breathing compares padding with the rhythm between leaf items, not with flexible space
        # between large blocks (a list pushed away from an action row).
        leaf = [g for (a, _), g in zip(pairs, gaps) if a["role"] not in ("container", "window")]
        self.gaps_by_parent.setdefault(parent["id"], []).extend(leaf)
        if len(gaps) >= 2 and spread(gaps) > self.tol:
            detail = ", ".join("%s→%s %s" % (a["name"], b["name"], fmt(g)) for (a, b), g in zip(pairs, gaps))
            self.add("error", "uneven-gap", [n["id"] for n in members],
                     "Unequal gaps between items of the same kind in %s: %s px." % (parent["name"], detail),
                     gaps=[round(g, 2) for g in gaps])
        self.check_scale(gaps, [n["id"] for n in members], "gap in " + parent["name"])

    def check_scale(self, values, ids, what):
        scale = self.s.get("spacing")
        if not scale:
            return
        # Distances beyond the largest step are flexible layout space, not a token choice.
        off = sorted({round(v, 1) for v in values
                      if 0 <= v < scale[-1] and min(abs(v - s) for s in scale) > self.tol})
        if off:
            self.add("warning", "off-scale", ids, "%s uses %s px, not on the spacing scale %s." % (
                what.capitalize(), ", ".join(fmt(v) for v in off), "/".join(fmt(s) for s in scale)))

    # -- keylines for repeated row structures (settings lists)
    def check_keylines(self):
        for parent in self.parents():
            rows = [c for c in self.layout_children(parent)
                    if c["role"] == "container" and len(self.layout_children(c)) >= 1]
            for column in self.clusters(rows, "column") if len(rows) >= 2 else []:
                signatures = {}
                for row in column:
                    kids = sorted(self.layout_children(row), key=lambda n: self.align_box(n).x)
                    signatures.setdefault(tuple(k["role"] for k in kids), []).append(kids)
                for signature, sets in signatures.items():
                    if len(sets) < 2:
                        continue
                    self.counts["keylineSets"] += 1
                    for index in range(len(signature)):
                        items = [kids[index] for kids in sets]
                        boxes = [self.align_box(n) for n in items]
                        starts = spread([b.x for b in boxes])
                        ends = spread([b.r for b in boxes])
                        centers = spread([b.cx for b in boxes])
                        best = min((starts, "start"), (centers, "center"), (ends, "end"))
                        aligns = {n["align"] for n in items}
                        if all(n["role"] == "text" for n in items) and len(aligns) == 1:
                            # Text is judged by its own alignment edge: ragged ends of start-aligned
                            # labels must not hide a misplaced start.
                            kind = aligns.pop()
                            best = ({"start": starts, "center": centers, "end": ends}[kind], kind)
                        if best[0] > self.tol:
                            self.add("error", "misaligned-keyline", [n["id"] for n in items],
                                     "Column %d of repeated rows in %s does not line up: closest is the %s edge, off by %spx (%s)." % (
                                         index + 1, parent["name"], best[1], fmt(best[0]), self.label(items)),
                                     starts=[round(b.x, 2) for b in boxes])

    # -- content inside controls
    def check_controls(self):
        siblings = {}
        for control in self.nodes.values():
            if control["role"] != "control":
                continue
            content = [c for c in self.layout_children(control) if c["role"] in CONTENT_ROLES]
            if not content:
                continue
            self.counts["controls"] += 1
            frame = control["rect"]
            if any("ink" not in c and self.covers(c["rect"], frame, 0.9) for c in content):
                self.add("warning", "cannot-measure", [control["id"]],
                         "%s: content box is stretched to the control and has no 'ink'; centering not measured." %
                         control["name"])
                continue
            union = Box.union([self.visible_box(c).shifted(*c["optical"]) for c in content])
            dx, dy = union.cx - frame.cx, union.cy - frame.cy
            if abs(dy) > self.tol:
                self.add("error", "off-center", [control["id"]] + [c["id"] for c in content],
                         "Content of %s sits %spx %s center." % (control["name"], fmt(abs(dy)),
                                                                 "below" if dy > 0 else "above"), dy=round(dy, 2))
            if control["align"] == "center" and abs(dx) > self.tol:
                self.add("error", "off-center", [control["id"]] + [c["id"] for c in content],
                         "Content of %s sits %spx %s of center." % (control["name"], fmt(abs(dx)),
                                                                    "right" if dx > 0 else "left"), dx=round(dx, 2))
            key = (control["parent"], control["group"], control["align"])
            inset = union.x - frame.x if control["align"] == "start" else frame.r - union.r
            icons = [c for c in content if c["role"] == "icon"]
            siblings.setdefault(key, []).append((control, inset, icons))
        for (parent, _group, align), items in siblings.items():
            if len(items) < 2:
                continue
            if align != "center":
                insets = [inset for _, inset, _ in items]
                if spread(insets) > self.tol:
                    self.add("error", "inconsistent-inset", [c["id"] for c, _, _ in items],
                             "Sibling controls start their content at different insets: %s px." % ", ".join(
                                 "%s=%s" % (c["name"], fmt(i)) for c, i, _ in items))
            sizes = [(c, self.visible_box(icon)) for c, _, icons in items for icon in icons[:1]]
            if len(sizes) > 1 and (spread([b.w for _, b in sizes]) > self.tol or spread([b.h for _, b in sizes]) > self.tol):
                self.add("warning", "icon-size-mismatch", [c["id"] for c, _ in sizes],
                         "Icons in sibling controls have different visible sizes: %s." % ", ".join(
                             "%s=%sx%s" % (c["name"], fmt(b.w), fmt(b.h)) for c, b in sizes))

    # -- breathing: padding at least as large as the gaps inside
    def check_breathing(self):
        for parent in self.parents():
            if parent["role"] == "control":
                continue
            need = self.required_inset(parent)
            kids = [c for c in self.layout_children(parent) if not c["edge"]]
            gaps = [g for g in self.gaps_by_parent.get(parent["id"], []) if g > 0]
            if need is None or not kids or not gaps:
                continue
            frame = parent["rect"]
            union = Box.union([k["rect"] for k in kids])
            inset = min(union.x - frame.x, frame.r - union.r, union.y - frame.y, frame.b - union.b)
            if parent["scroll"] or inset < 0:
                continue  # overflow is already reported
            if inset < max(gaps) - self.tol:
                self.add("warning", "inset-below-gap", [parent["id"]],
                         "%s: content is %spx from the frame but %spx from its siblings; padding should be at least the inner gap." % (
                             parent["name"], fmt(inset), fmt(max(gaps))))
            if "padding" in parent:
                self.check_scale(list(parent["padding"]), [parent["id"]], "padding of " + parent["name"])

    # -- near-miss edges: stacked elements whose edges almost, but not exactly, line up
    def scope_of(self, node):
        current = node
        while current["parent"] is not None:
            current = self.nodes[current["parent"]]
            if current["role"] == "window":
                return current["id"]
        return current["id"]

    def anchors(self, node):
        box = self.align_box(node)
        if node["role"] == "text":
            return {"start": [("start", box.x)], "end": [("end", box.r)],
                    "center": [("center", box.cx)]}[node["align"]]
        return [("start", box.x), ("center", box.cx), ("end", box.r)]

    def check_near_miss(self):
        limit = self.s["nearMiss"]
        scopes = {}
        for node in self.nodes.values():
            parent = self.nodes.get(node["parent"]) if node["parent"] else None
            if node["role"] in ("decor", "window") or node["edge"] or node["overlap"]:
                continue
            if parent and parent["role"] == "control":
                continue  # governed by the centering check
            for kind, value in self.anchors(node):
                scopes.setdefault((self.scope_of(node), kind), []).append((value, node))
        # A node exactly aligned on one line with a stacked neighbour is judged by that line only:
        # a right-aligned toggle under a wider slider legitimately misses their start edges.
        exact = {}
        for (scope, kind), items in scopes.items():
            for i, (va, a) in enumerate(items):
                for vb, b in items[i + 1:]:
                    ra, rb = a["rect"], b["rect"]
                    if abs(va - vb) <= self.tol and min(ra.b, rb.b) - max(ra.y, rb.y) <= self.tol:
                        exact.setdefault(a["id"], set()).add(kind)
                        exact.setdefault(b["id"], set()).add(kind)
        for key, items in scopes.items():
            scopes[key] = [(v, n) for v, n in items if not exact.get(n["id"]) or key[1] in exact[n["id"]]]
        found = {}
        for (_scope, kind), items in scopes.items():
            items.sort(key=lambda item: item[0])
            link = list(range(len(items)))

            def find(i):
                while link[i] != i:
                    link[i] = link[link[i]]
                    i = link[i]
                return i

            for i in range(len(items)):
                for j in range(i + 1, len(items)):
                    if items[j][0] - items[i][0] > limit:
                        break
                    a, b = items[i][1]["rect"], items[j][1]["rect"]
                    stacked = min(a.b, b.b) - max(a.y, b.y) <= self.tol
                    if stacked and abs(items[j][0] - items[i][0]) > self.tol:
                        link[find(i)] = find(j)
            groups = {}
            for i, item in enumerate(items):
                groups.setdefault(find(i), []).append(item)
            for members in groups.values():
                values = [v for v, _ in members]
                if len(members) >= 2 and spread(values) > self.tol:
                    key = frozenset(n["id"] for _, n in members)
                    found.setdefault(key, []).append((kind, members))
        reported = [set(i["nodes"]) for i in self.issues
                    if i["code"] in ("misaligned-column", "misaligned-keyline")]
        for key, entries in found.items():
            if any(key <= ids for ids in reported):
                continue
            kind, members = entries[0]
            kinds = "/".join(k for k, _ in entries)
            values = [v for v, _ in members]
            self.add("error", "misaligned-edge", sorted(key),
                     "Stacked elements almost line up on their %s edge but miss by up to %spx: %s." % (
                         kinds, fmt(spread(values)), ", ".join("%s=%s" % (n["name"], fmt(v)) for v, n in members)),
                     edges=[round(v, 2) for v in values])

    def run(self):
        self.check_containment()
        self.check_overlap()
        self.check_rhythm()
        self.check_keylines()
        self.check_near_miss()
        self.check_controls()
        self.check_breathing()
        errors = sum(1 for i in self.issues if i["severity"] == "error")
        warnings = len(self.issues) - errors
        order = {"error": 0, "warning": 1}
        self.issues.sort(key=lambda i: (order[i["severity"]], i["code"]))
        return {"ok": errors == 0, "format": FORMAT, "counts": dict(self.counts, errors=errors, warnings=warnings),
                "issues": self.issues, "limitations": LIMITATIONS}


def check(data):
    nodes, viewport, settings = load(data)
    return Checker(nodes, viewport, settings).run()


def reject_duplicates(pairs):
    keys = [k for k, _ in pairs]
    if len(keys) != len(set(keys)):
        raise InputError("Duplicate JSON keys.")
    return dict(pairs)


def main(argv=None):
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument("layout", help="UTF-8 JSON file in %s format" % FORMAT)
    parser.add_argument("--json", action="store_true", help="machine-readable output")
    args = parser.parse_args(argv)
    try:
        data = json.loads(Path(args.layout).read_text(encoding="utf-8"), object_pairs_hook=reject_duplicates,
                          parse_constant=lambda raw: (_ for _ in ()).throw(InputError("Non-finite number " + raw)))
        report = check(data)
    except (OSError, UnicodeDecodeError, json.JSONDecodeError, InputError) as error:
        if args.json:
            print(json.dumps({"ok": False, "error": str(error)}, ensure_ascii=False, indent=2))
        else:
            print("INPUT ERROR: %s" % error)
        return 2
    if args.json:
        print(json.dumps(report, ensure_ascii=False, indent=2))
    else:
        c = report["counts"]
        print("%s  %d nodes, %d rows, %d columns, %d keyline sets, %d controls; %d errors, %d warnings" % (
            "PASS" if report["ok"] else "FAIL", c["nodes"], c["rows"], c["columns"], c["keylineSets"],
            c["controls"], c["errors"], c["warnings"]))
        for issue in report["issues"]:
            print("%-7s %-20s %s" % (issue["severity"].upper(), issue["code"], issue["message"]))
        print("Scope: " + " ".join(LIMITATIONS))
    return 0 if report["ok"] else 1


if __name__ == "__main__":
    raise SystemExit(main())
