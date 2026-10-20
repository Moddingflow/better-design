## Better Design layout dump for Godot 4 Control UIs -> better-design-layout-v1 JSON.
##
## Usage (debug build only), e.g. in any script:
##   const LayoutDump = preload("res://tools/layout_dump.gd")
##   func _unhandled_input(event):
##       if event is InputEventKey and event.pressed and event.keycode == KEY_F9:
##           LayoutDump.dump(get_tree().root)
## Writes user://better-design-layout.json and prints its absolute path. Check it with:
##   python -B -X utf8 <skill>/scripts/check_layout.py <that path>
##
## Hints via node metadata (Inspector > Metadata):
##   ui_role = "window|container|control|text|icon|image|decor"   ui_align = "start|center|end"
##   ui_optical = Vector2(dx, dy)   ui_group = "name"   ui_overlap / ui_edge / ui_ignore = true
##
## Coordinates are canvas units of the root viewport (the base resolution under
## stretch mode "canvas_items"), consistent across all nodes. Text ink is the glyph extent
## times the cap band for single-line Labels and text-only Buttons; other text gets no ink.
## Not verified against a running Godot build by the skill author: run once and sanity-check
## the JSON (rects of a known button) before trusting results.
extends RefCounted


static func dump(root: Node, path: String = "user://better-design-layout.json") -> String:
	var state := {"nodes": [], "ids": {}}
	var viewport := root.get_viewport()
	var size := viewport.get_visible_rect().size
	_walk_children(root, null, state)
	var data := {
		"format": "better-design-layout-v1",
		"note": "Godot dump %dx%d" % [size.x, size.y],
		"viewport": {"width": size.x, "height": size.y},
		"nodes": state.nodes,
	}
	var file := FileAccess.open(path, FileAccess.WRITE)
	file.store_string(JSON.stringify(data, " "))
	file.close()
	var absolute := ProjectSettings.globalize_path(path)
	print("[Better Design] %d nodes -> %s" % [state.nodes.size(), absolute])
	return absolute


static func _walk_children(node: Node, parent_id, state: Dictionary) -> void:
	for child in node.get_children():
		if child is Control:
			_walk(child, parent_id, "", state)
		elif child is CanvasLayer or child is Node2D or child is Window:
			_walk_children(child, parent_id, state)


static func _walk(c: Control, parent_id, parent_role: String, state: Dictionary) -> void:
	if not c.is_visible_in_tree() or c.get_meta("ui_ignore", false) or c.modulate.a <= 0.01:
		return
	var rect := c.get_global_rect()
	if rect.size.x <= 0 or rect.size.y <= 0:
		return
	var role: String = c.get_meta("ui_role", _guess_role(c, parent_id))
	var id := _new_id(str(c.name), state)
	var node := {"id": id, "parent": parent_id, "role": role, "rect": _box(rect)}

	if role == "window" or role == "container":
		var pad := _padding(c)
		if pad != [0.0, 0.0, 0.0, 0.0]:
			node["padding"] = pad
	if c is ScrollContainer:
		var sc := c as ScrollContainer
		var sx := sc.horizontal_scroll_mode != ScrollContainer.SCROLL_MODE_DISABLED
		var sy := sc.vertical_scroll_mode != ScrollContainer.SCROLL_MODE_DISABLED
		if sx or sy:
			node["scroll"] = "both" if sx and sy else ("x" if sx else "y")
	if role == "control":
		node["align"] = c.get_meta("ui_align", "start" if (c is CheckBox or c is CheckButton or c is OptionButton or c is LineEdit) else "center")
	elif role == "text" and c is Label:
		var label := c as Label
		node["align"] = {HORIZONTAL_ALIGNMENT_CENTER: "center", HORIZONTAL_ALIGNMENT_RIGHT: "end"}.get(label.horizontal_alignment, "start")
		var ink = _label_ink(label)
		if ink != null:
			node["ink"] = ink
	if c.has_meta("ui_optical"):
		var o: Vector2 = c.get_meta("ui_optical")
		node["optical"] = [o.x, o.y]
	if c.has_meta("ui_group"):
		node["group"] = str(c.get_meta("ui_group"))
	if c.get_meta("ui_overlap", false) or c.top_level:
		node["overlap"] = true
	if c.get_meta("ui_edge", false) or parent_id == null and rect.size == c.get_viewport().get_visible_rect().size:
		node["edge"] = true
	state.nodes.append(node)

	if role == "control":
		# A Button draws its own text: expose it as a content child so it can be centered.
		var button := c as Button
		if button != null and button.text != "" and button.icon == null:
			var ink = _button_ink(button)
			if ink != null:
				state.nodes.append({"id": id + "/label", "parent": id, "role": "text",
					"rect": node.rect, "ink": ink, "align": "center"})
		if c is Range:
			return
	if role in ["text", "icon", "image", "decor"]:
		return
	for child in c.get_children():
		if child is Control:
			_walk(child, id, role, state)


static func _guess_role(c: Control, parent_id) -> String:
	if c is BaseButton or c is Range or c is LineEdit or c is TextEdit:
		return "control"
	if c is Label or c is RichTextLabel:
		return "text"
	var decor_name := str(c.name).to_lower().begins_with("background") or str(c.name).to_lower().begins_with("bg") \
		or str(c.name).to_lower().begins_with("shadow") or str(c.name).to_lower().begins_with("divider")
	if c is TextureRect:
		if decor_name:
			return "decor"
		return "icon" if c.size.x <= 96 and c.size.y <= 96 else "image"
	if (c is ColorRect or c is NinePatchRect or c is Panel) and c.get_child_count() == 0:
		return "decor"
	if c is PanelContainer or c is Panel or parent_id == null:
		return "window"
	return "container"


static func _padding(c: Control) -> Array:
	var s := c.get_global_transform_with_canvas().get_scale()
	if c is MarginContainer:
		return [c.get_theme_constant("margin_top") * s.y, c.get_theme_constant("margin_right") * s.x,
			c.get_theme_constant("margin_bottom") * s.y, c.get_theme_constant("margin_left") * s.x]
	if c is PanelContainer:
		var box: StyleBox = c.get_theme_stylebox("panel")
		if box != null:
			return [box.get_margin(SIDE_TOP) * s.y, box.get_margin(SIDE_RIGHT) * s.x,
				box.get_margin(SIDE_BOTTOM) * s.y, box.get_margin(SIDE_LEFT) * s.x]
	return [0.0, 0.0, 0.0, 0.0]


static func _cap_height(font: Font, size: int) -> float:
	var rids := font.get_rids()
	if rids.is_empty():
		return font.get_ascent(size) * 0.7
	var ts := TextServerManager.get_primary_interface()
	var glyph := ts.font_get_glyph_index(rids[0], size, "H".unicode_at(0), 0)
	var offset := ts.font_get_glyph_offset(rids[0], Vector2i(size, 0), glyph)
	return -offset.y if offset.y < 0 else font.get_ascent(size) * 0.7


# Ink for a single line of text laid out inside content_rect with the given alignments.
static func _line_ink(c: Control, text: String, font: Font, size: int, content: Rect2, h_align: int, v_align: int):
	if text.strip_edges() == "" or "\n" in text:
		return null
	var width := font.get_string_size(text, HORIZONTAL_ALIGNMENT_LEFT, -1, size).x
	var ascent := font.get_ascent(size)
	var line_height := ascent + font.get_descent(size)
	var x := content.position.x
	if h_align == HORIZONTAL_ALIGNMENT_CENTER:
		x += (content.size.x - width) / 2.0
	elif h_align == HORIZONTAL_ALIGNMENT_RIGHT:
		x += content.size.x - width
	var top := content.position.y
	if v_align == VERTICAL_ALIGNMENT_CENTER:
		top += (content.size.y - line_height) / 2.0
	elif v_align == VERTICAL_ALIGNMENT_BOTTOM:
		top += content.size.y - line_height
	var cap := _cap_height(font, size)
	var local := Rect2(x, top + ascent - cap, width, cap)
	var xf := c.get_global_transform()
	var a := xf * local.position
	var b := xf * local.end
	return _box(Rect2(a, b - a))


static func _label_ink(label: Label):
	if label.autowrap_mode != TextServer.AUTOWRAP_OFF and label.get_line_count() > 1:
		return null
	var style: StyleBox = label.get_theme_stylebox("normal")
	var content := Rect2(Vector2.ZERO, label.size)
	if style != null:
		content = Rect2(style.get_margin(SIDE_LEFT), style.get_margin(SIDE_TOP),
			label.size.x - style.get_margin(SIDE_LEFT) - style.get_margin(SIDE_RIGHT),
			label.size.y - style.get_margin(SIDE_TOP) - style.get_margin(SIDE_BOTTOM))
	var text := label.text.to_upper() if label.uppercase else label.text
	return _line_ink(label, text, label.get_theme_font("font"), label.get_theme_font_size("font_size"),
		content, label.horizontal_alignment, label.vertical_alignment)


static func _button_ink(button: Button):
	var style: StyleBox = button.get_theme_stylebox("normal")
	var content := Rect2(Vector2.ZERO, button.size)
	if style != null:
		content = Rect2(style.get_margin(SIDE_LEFT), style.get_margin(SIDE_TOP),
			button.size.x - style.get_margin(SIDE_LEFT) - style.get_margin(SIDE_RIGHT),
			button.size.y - style.get_margin(SIDE_TOP) - style.get_margin(SIDE_BOTTOM))
	return _line_ink(button, button.text, button.get_theme_font("font"), button.get_theme_font_size("font_size"),
		content, button.alignment, VERTICAL_ALIGNMENT_CENTER)


static func _new_id(name: String, state: Dictionary) -> String:
	var id := name
	var i := 2
	while state.ids.has(id):
		id = "%s#%d" % [name, i]
		i += 1
	state.ids[id] = true
	return id


static func _box(r: Rect2) -> Array:
	return [snappedf(r.position.x, 0.01), snappedf(r.position.y, 0.01),
		snappedf(max(r.size.x, 0.0), 0.01), snappedf(max(r.size.y, 0.0), 0.01)]
