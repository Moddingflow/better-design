// Better Design layout dump for Unity (uGUI + UI Toolkit) -> better-design-layout-v1 JSON.
// Copy into any Editor folder. Enter Play mode, set the Game view to a target resolution,
// then run Tools > Better Design > Dump UI Layout. Output: Temp/better-design-layout.json
// (Unity's own temp folder; not imported, not versioned). Check it with:
//   python -B -X utf8 <skill>/scripts/check_layout.py Temp/better-design-layout.json
//
// Requires Unity 2022.3+ and TextMeshPro (built into com.unity.ugui 2.0+, Unity 2023.2 / Unity 6).
// Hints go into GameObject names, e.g. "PlayButton [optical=2,0]":
//   [window] [container] [control] [text] [icon] [image] [decor]  - force a role
//   [start] [end]  - content alignment of a control     [edge]  - intentionally docked to an edge
//   [overlap]      - may overlap siblings (badges)       [group=name] - separate rhythm group
//   [optical=dx,dy] - intended offset of an asymmetric icon, in screen px
//   [ignore]       - skip this object and its children
// World-space canvases (diegetic UI) are skipped.
#if UNITY_EDITOR
#pragma warning disable CS0618 // FindObjectsSortMode: the only overload available in Unity 2022.3
using System.Collections.Generic;
using System.Globalization;
using System.IO;
using System.Text;
using System.Text.RegularExpressions;
using TMPro;
using UnityEditor;
using UnityEngine;
using UnityEngine.UI;
using UIE = UnityEngine.UIElements;
using Image = UnityEngine.UI.Image;

namespace BetterDesign.EditorTools
{
    public static class LayoutDump
    {
        const string OutputPath = "Temp/better-design-layout.json";
        static readonly Regex Hint = new Regex(@"\[(\w+)(?:=([^\]]+))?\]");
        static readonly Regex WindowName = new Regex(@"(?i)(window|panel|dialog|popup|modal|menu|screen)");
        static readonly Regex DecorName = new Regex(@"(?i)^(background|bg|shadow|glow|border|outline|divider|separator|frame|highlight)");
        static readonly Dictionary<Sprite, Rect> AlphaCache = new Dictionary<Sprite, Rect>();

        static readonly List<string> Nodes = new List<string>();
        static readonly HashSet<string> Ids = new HashSet<string>();
        static float viewportHeight;

        [MenuItem("Tools/Better Design/Dump UI Layout")]
        public static void Dump()
        {
            Nodes.Clear();
            Ids.Clear();
            AlphaCache.Clear();
            Vector2 view = Handles.GetMainGameViewSize();
            viewportHeight = view.y;

            foreach (var canvas in Object.FindObjectsByType<Canvas>(FindObjectsSortMode.None))
            {
                if (!canvas.isRootCanvas || !canvas.isActiveAndEnabled || canvas.renderMode == RenderMode.WorldSpace)
                    continue;
                Walk((RectTransform)canvas.transform, null, null, canvas);
            }
            foreach (var doc in Object.FindObjectsByType<UIE.UIDocument>(FindObjectsSortMode.None))
            {
                float panelWidth = doc.rootVisualElement?.panel?.visualTree.worldBound.width ?? 0;
                if (doc.isActiveAndEnabled && panelWidth > 0)
                    WalkToolkit(doc.rootVisualElement, null, view.x / panelWidth);
            }

            var json = new StringBuilder();
            json.Append("{\"format\":\"better-design-layout-v1\",");
            json.Append("\"note\":\"Unity dump ").Append(Num(view.x)).Append('x').Append(Num(view.y)).Append("\",");
            json.Append("\"viewport\":{\"width\":").Append(Num(view.x)).Append(",\"height\":").Append(Num(view.y)).Append("},");
            json.Append("\"nodes\":[\n").Append(string.Join(",\n", Nodes)).Append("\n]}\n");
            Directory.CreateDirectory(Path.GetDirectoryName(OutputPath));
            File.WriteAllText(OutputPath, json.ToString(), new UTF8Encoding(false));
            Debug.Log($"[Better Design] {Nodes.Count} nodes at {view.x}x{view.y} -> {Path.GetFullPath(OutputPath)}");
        }

        // ------------------------------------------------------------------ uGUI

        static void Walk(RectTransform rt, string parentId, string parentRole, Canvas canvas)
        {
            var go = rt.gameObject;
            if (!go.activeInHierarchy || HasHint(go.name, "ignore")) return;
            var group = go.GetComponent<CanvasGroup>();
            if (group != null && group.alpha <= 0.01f) return;

            var selectable = go.GetComponent<Selectable>();
            string role = ForcedRole(go.name) ?? GuessRole(rt, selectable, parentRole, canvas);
            Rect rect = ScreenRect(rt, canvas);
            if (rect.width <= 0 || rect.height <= 0) return;

            string id = NewId(go.name);
            var fields = new List<string>();
            if (role == "window" && parentId == null) fields.Add("\"edge\":true"); // root canvas fills the screen
            var layout = go.GetComponent<LayoutGroup>();
            if (layout != null && (role == "container" || role == "window"))
            {
                float s = canvas.scaleFactor;
                fields.Add($"\"padding\":[{Num(layout.padding.top * s)},{Num(layout.padding.right * s)},{Num(layout.padding.bottom * s)},{Num(layout.padding.left * s)}]");
            }
            var scroll = go.GetComponentInParent<ScrollRect>();
            if (scroll != null && scroll.viewport == rt)
                fields.Add($"\"scroll\":\"{(scroll.horizontal && scroll.vertical ? "both" : scroll.horizontal ? "x" : "y")}\"");
            var element = go.GetComponent<LayoutElement>();
            if (element != null && element.ignoreLayout) fields.Add("\"overlap\":true");
            if (role == "control")
            {
                string align = HasHint(go.name, "end") ? "end" : HasHint(go.name, "start") ? "start"
                    : selectable is UnityEngine.UI.Toggle || selectable is TMP_Dropdown || selectable is Dropdown || selectable is TMP_InputField || selectable is InputField ? "start" : "center";
                fields.Add($"\"align\":\"{align}\"");
            }
            Rect? ink = null;
            if (role == "text" && go.GetComponent<TMP_Text>() is TMP_Text label)
            {
                ink = TextInk(label, canvas);
                var h = label.horizontalAlignment;
                fields.Add(h == HorizontalAlignmentOptions.Center || h == HorizontalAlignmentOptions.Geometry ? "\"align\":\"center\""
                    : h == HorizontalAlignmentOptions.Right ? "\"align\":\"end\"" : "\"align\":\"start\"");
            }
            AddCommonHints(go.name, fields);
            Emit(id, parentId, role, rect, ink, fields, go.name);

            if (role == "control")
            {
                // Sliders and scrollbars draw tracks, not content; other controls expose their
                // graphics and labels as direct content so the checker can center them.
                if (selectable is UnityEngine.UI.Slider || selectable is Scrollbar) return;
                foreach (var graphic in go.GetComponentsInChildren<Graphic>(false))
                {
                    if (graphic.gameObject == go || InsideAnotherGraphic(graphic.transform, rt)) continue;
                    EmitContent(graphic, id, canvas);
                }
                return;
            }
            if (role == "text" || role == "icon" || role == "image" || role == "decor") return;
            foreach (Transform child in rt)
                if (child is RectTransform childRt) Walk(childRt, id, role, canvas);
        }

        // A checkmark inside a checkbox frame belongs to the frame; only the outermost graphic is content.
        static bool InsideAnotherGraphic(Transform t, Transform control)
        {
            for (var p = t.parent; p != null && p != control; p = p.parent)
                if (p.GetComponent<Graphic>() != null) return true;
            return false;
        }

        static string GuessRole(RectTransform rt, Selectable selectable, string parentRole, Canvas canvas)
        {
            var go = rt.gameObject;
            if (go.GetComponent<Canvas>() == canvas) return "window";
            if (selectable != null) return "control";
            if (go.GetComponent<TMP_Text>() != null || go.GetComponent<Text>() != null) return "text";
            var graphic = go.GetComponent<Graphic>();
            if (graphic != null && rt.childCount == 0)
            {
                var parent = rt.parent as RectTransform;
                bool fills = parent != null && rt.rect.width >= parent.rect.width * 0.95f && rt.rect.height >= parent.rect.height * 0.95f;
                if (DecorName.IsMatch(go.name) || fills) return "decor";
                return rt.rect.width <= 96 && rt.rect.height <= 96 ? "icon" : "image";
            }
            if (graphic != null && WindowName.IsMatch(go.name)) return "window";
            if (DecorName.IsMatch(go.name) && rt.childCount == 0) return "decor";
            return "container";
        }

        static void EmitContent(Graphic graphic, string controlId, Canvas canvas)
        {
            var go = graphic.gameObject;
            if (!graphic.isActiveAndEnabled || HasHint(go.name, "ignore") || graphic.color.a <= 0.01f) return;
            var rt = graphic.rectTransform;
            string role = ForcedRole(go.name);
            Rect rect = ScreenRect(rt, canvas);
            Rect? ink = null;
            if (graphic is TMP_Text tmp)
            {
                role ??= "text";
                ink = TextInk(tmp, canvas);
                if (string.IsNullOrWhiteSpace(tmp.text)) return;
            }
            else if (graphic is Text)
            {
                role ??= "text"; // legacy Text: no ink; stretched labels are reported as cannot-measure
            }
            else
            {
                if (DecorName.IsMatch(go.name) && role == null) return;
                role ??= "icon";
                if (graphic is Image image) ink = SpriteInk(image, canvas);
            }
            var fields = new List<string>();
            AddCommonHints(go.name, fields);
            if (role == "text") fields.Add("\"align\":\"center\"");
            Emit(NewId(go.name), controlId, role, rect, ink, fields, go.name);
        }

        // Text ink = glyph extent x cap band (first baseline + cap height down to last baseline),
        // so descenders and accents do not move the measured center.
        static Rect? TextInk(TMP_Text tmp, Canvas canvas)
        {
            tmp.ForceMeshUpdate();
            var info = tmp.textInfo;
            if (info == null || info.characterCount == 0 || info.lineCount == 0) return null;
            int first = -1;
            for (int i = 0; i < info.characterCount; i++)
                if (info.characterInfo[i].isVisible) { first = i; break; }
            if (first < 0) return null;
            var ch = info.characterInfo[first];
            var face = ch.fontAsset.faceInfo;
            float cap = face.capLine * ch.pointSize / face.pointSize * face.scale;
            Bounds bounds = tmp.textBounds;
            float top = info.lineInfo[0].baseline + cap;
            float bottom = info.lineInfo[info.lineCount - 1].baseline;
            return LocalToScreen(tmp.rectTransform, new Rect(bounds.min.x, bottom, bounds.size.x, top - bottom), canvas);
        }

        // Icon ink = the sprite's non-transparent pixels mapped into the drawn rect.
        static Rect? SpriteInk(Image image, Canvas canvas)
        {
            var sprite = image.sprite;
            if (sprite == null || image.type != Image.Type.Simple) return null;
            Rect local = image.rectTransform.rect;
            if (image.preserveAspect)
            {
                float aspect = sprite.rect.width / sprite.rect.height;
                Vector2 pivot = image.rectTransform.pivot;
                if (local.width / local.height > aspect)
                {
                    float w = local.height * aspect;
                    local = new Rect(local.x + (local.width - w) * pivot.x, local.y, w, local.height);
                }
                else
                {
                    float h = local.width / aspect;
                    local = new Rect(local.x, local.y + (local.height - h) * pivot.y, local.width, h);
                }
            }
            Rect uv = VisibleArea(sprite);
            var visible = new Rect(local.x + local.width * uv.x, local.y + local.height * uv.y,
                                   local.width * uv.width, local.height * uv.height);
            return LocalToScreen(image.rectTransform, visible, canvas);
        }

        // Fraction of sprite.rect covered by pixels with alpha > ~5% (y up). Editor-only GPU readback,
        // so it works on non-readable textures; tightly packed rotated sprites fall back to the full rect.
        static Rect VisibleArea(Sprite sprite)
        {
            if (AlphaCache.TryGetValue(sprite, out var cached)) return cached;
            var full = new Rect(0, 0, 1, 1);
            if (sprite.packed && sprite.packingRotation != SpritePackingRotation.None) return AlphaCache[sprite] = full;
            var tex = sprite.texture;
            Rect tr = sprite.textureRect;
            var rt = RenderTexture.GetTemporary(tex.width, tex.height, 0, RenderTextureFormat.ARGB32, RenderTextureReadWrite.Linear);
            var previous = RenderTexture.active;
            Graphics.Blit(tex, rt);
            RenderTexture.active = rt;
            var read = new Texture2D(Mathf.CeilToInt(tr.width), Mathf.CeilToInt(tr.height), TextureFormat.RGBA32, false);
            read.ReadPixels(new Rect(tr.x, tr.y, read.width, read.height), 0, 0);
            read.Apply();
            RenderTexture.active = previous;
            RenderTexture.ReleaseTemporary(rt);
            var pixels = read.GetPixels32();
            int width = read.width, height = read.height, minX = width, minY = height, maxX = -1, maxY = -1;
            for (int y = 0; y < height; y++)
                for (int x = 0; x < width; x++)
                    if (pixels[y * width + x].a > 12)
                    {
                        if (x < minX) minX = x;
                        if (x > maxX) maxX = x;
                        if (y < minY) minY = y;
                        if (y > maxY) maxY = y;
                    }
            Object.DestroyImmediate(read);
            if (maxX < 0) return AlphaCache[sprite] = full;
            Vector2 offset = sprite.textureRectOffset, size = sprite.rect.size;
            return AlphaCache[sprite] = new Rect((offset.x + minX) / size.x, (offset.y + minY) / size.y,
                                                 (maxX - minX + 1) / size.x, (maxY - minY + 1) / size.y);
        }

        static Rect ScreenRect(RectTransform rt, Canvas canvas) => LocalToScreen(rt, rt.rect, canvas);

        static Rect LocalToScreen(RectTransform rt, Rect local, Canvas canvas)
        {
            Camera cam = canvas.renderMode == RenderMode.ScreenSpaceOverlay ? null : canvas.worldCamera;
            Vector2 a = RectTransformUtility.WorldToScreenPoint(cam, rt.TransformPoint(new Vector3(local.xMin, local.yMin)));
            Vector2 b = RectTransformUtility.WorldToScreenPoint(cam, rt.TransformPoint(new Vector3(local.xMax, local.yMax)));
            float xMin = Mathf.Min(a.x, b.x), xMax = Mathf.Max(a.x, b.x);
            float yMin = Mathf.Min(a.y, b.y), yMax = Mathf.Max(a.y, b.y);
            return new Rect(xMin, viewportHeight - yMax, xMax - xMin, yMax - yMin); // y down
        }

        // ------------------------------------------------------------------ UI Toolkit

        static void WalkToolkit(UIE.VisualElement ve, string parentId, float scale)
        {
            if (ve.resolvedStyle.display == UIE.DisplayStyle.None || ve.resolvedStyle.visibility == UIE.Visibility.Hidden
                || ve.resolvedStyle.opacity <= 0.01f || HasHint(ve.name ?? "", "ignore")) return;
            Rect wb = ve.worldBound;
            if (wb.width <= 0 || wb.height <= 0) return;
            string name = string.IsNullOrEmpty(ve.name) ? ve.GetType().Name : ve.name;
            string role = ForcedRole(name);
            bool field = ve is UIE.Toggle || ve is UIE.DropdownField || ve is UIE.TextField || ve is UIE.BaseSlider<float> || ve is UIE.BaseSlider<int>;
            if (role == null)
            {
                if (parentId == null) role = "window";
                else if (ve is UIE.Button || field) role = "control";
                else if (ve is UIE.TextElement) role = "text";
                else if (ve is UIE.Image) role = "icon";
                else role = "container";
            }
            var rect = new Rect(wb.x * scale, wb.y * scale, wb.width * scale, wb.height * scale);
            var fields = new List<string>();
            if (parentId == null) fields.Add("\"edge\":true");
            var st = ve.resolvedStyle;
            if (role == "container" || role == "window")
            {
                float t = (st.paddingTop + st.borderTopWidth) * scale, r = (st.paddingRight + st.borderRightWidth) * scale;
                float b = (st.paddingBottom + st.borderBottomWidth) * scale, l = (st.paddingLeft + st.borderLeftWidth) * scale;
                if (t + r + b + l > 0) fields.Add($"\"padding\":[{Num(t)},{Num(r)},{Num(b)},{Num(l)}]");
            }
            if (role == "control") fields.Add($"\"align\":\"{(field || HasHint(name, "start") ? "start" : "center")}\"");
            AddCommonHints(name, fields);
            string id = NewId(name);
            Emit(id, parentId, role, rect, null, fields, name);
            if (role == "text" || role == "icon" || ve is UIE.BaseSlider<float> || ve is UIE.BaseSlider<int>) return;
            foreach (var child in ve.Children()) WalkToolkit(child, id, scale);
        }

        // ------------------------------------------------------------------ helpers

        static string ForcedRole(string name)
        {
            foreach (Match m in Hint.Matches(name))
            {
                string key = m.Groups[1].Value.ToLowerInvariant();
                if (key is "window" or "container" or "control" or "text" or "icon" or "image" or "decor") return key;
            }
            return null;
        }

        static bool HasHint(string name, string key)
        {
            foreach (Match m in Hint.Matches(name))
                if (m.Groups[1].Value.ToLowerInvariant() == key) return true;
            return false;
        }

        static void AddCommonHints(string name, List<string> fields)
        {
            foreach (Match m in Hint.Matches(name))
            {
                string key = m.Groups[1].Value.ToLowerInvariant(), value = m.Groups[2].Value;
                if (key == "edge" && !fields.Contains("\"edge\":true")) fields.Add("\"edge\":true");
                if (key == "overlap" && !fields.Contains("\"overlap\":true")) fields.Add("\"overlap\":true");
                if (key == "group" && value.Length > 0) fields.Add($"\"group\":\"{Escape(value)}\"");
                if (key == "optical")
                {
                    var parts = value.Split(',');
                    if (parts.Length == 2 && float.TryParse(parts[0], NumberStyles.Float, CultureInfo.InvariantCulture, out var dx)
                        && float.TryParse(parts[1], NumberStyles.Float, CultureInfo.InvariantCulture, out var dy))
                        fields.Add($"\"optical\":[{Num(dx)},{Num(dy)}]");
                }
            }
        }

        static string NewId(string name)
        {
            string clean = Hint.Replace(name, "").Trim();
            if (clean.Length == 0) clean = "node";
            string id = clean;
            for (int i = 2; Ids.Contains(id); i++) id = clean + "#" + i;
            Ids.Add(id);
            return id;
        }

        static void Emit(string id, string parentId, string role, Rect rect, Rect? ink, List<string> fields, string name)
        {
            var sb = new StringBuilder();
            sb.Append("{\"id\":\"").Append(Escape(id)).Append("\",\"parent\":");
            sb.Append(parentId == null ? "null" : "\"" + Escape(parentId) + "\"");
            sb.Append(",\"role\":\"").Append(role).Append("\",\"rect\":").Append(Box(rect));
            if (ink.HasValue) sb.Append(",\"ink\":").Append(Box(ink.Value));
            foreach (var f in fields) sb.Append(',').Append(f);
            sb.Append('}');
            Nodes.Add(sb.ToString());
        }

        static string Box(Rect r) => $"[{Num(r.x)},{Num(r.y)},{Num(Mathf.Max(0, r.width))},{Num(Mathf.Max(0, r.height))}]";
        static string Num(float v) => (Mathf.Round(v * 100f) / 100f).ToString("0.##", CultureInfo.InvariantCulture);
        static string Escape(string s) => s.Replace("\\", "\\\\").Replace("\"", "\\\"");
    }
}
#endif
