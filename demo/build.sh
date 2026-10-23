#!/bin/sh
# Assemble the GitHub Pages demo: the hub page, the before/after builds in demo/compare,
# and the skill's live pages and README images.
# Usage: sh demo/build.sh [output-dir]   (default: _site)
set -eu
cd "$(dirname "$0")/.."
out="${1:-_site}"
[ -n "$out" ] && [ "$out" != "/" ] && [ "$out" != "." ] || { echo "bad output dir: $out" >&2; exit 1; }

rm -rf "$out"
mkdir -p "$out/assets" "$out/images"
cp demo/index.html "$out/index.html"
cp skills/better-design/assets/house-style.html "$out/assets/"
cp -R skills/better-design/assets/motion skills/better-design/assets/effects "$out/assets/"
cp docs/images/house-style.png demo/previews/* "$out/images/"
cp -R demo/compare "$out/compare"
echo "Demo site written to $out"
