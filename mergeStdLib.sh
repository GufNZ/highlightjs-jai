#!/usr/bin/env bash
set -euo pipefail

AUTO_YES=0
if [[ "${1:-}" == "-y" ]]; then
  AUTO_YES=1
  shift
fi

SOURCE_JAI="${1:-src/languages/jai.js}"
STDLIB_FILE="${2:-stdLib.js}"
OUTPUT_JAI="${3:-src/languages/jai.js}"

if [[ ! -f "$SOURCE_JAI" ]]; then
  echo "error: source jai file not found: $SOURCE_JAI" >&2
  exit 1
fi

if [[ ! -f "$STDLIB_FILE" ]]; then
  echo "error: stdlib file not found: $STDLIB_FILE" >&2
  exit 1
fi

BEGIN_LINE="$(grep -n -m1 'Begin generated content' "$SOURCE_JAI" | cut -d: -f1 || true)"
END_LINE="$(grep -n -m1 'End generated content' "$SOURCE_JAI" | cut -d: -f1 || true)"

if [[ -z "$BEGIN_LINE" || -z "$END_LINE" ]]; then
  echo "error: could not find generated-content boundary markers in $SOURCE_JAI" >&2
  exit 1
fi

if (( END_LINE <= BEGIN_LINE )); then
  echo "error: invalid marker order in $SOURCE_JAI (begin=$BEGIN_LINE, end=$END_LINE)" >&2
  exit 1
fi

echo "Begin generated content line: $BEGIN_LINE"
echo "  End generated content line: $END_LINE"

TMP_DIR="$(dirname "$OUTPUT_JAI")"
mkdir -p "$TMP_DIR"
TMP_OUT="$(mktemp "$TMP_DIR/.mergeStdLib.tmp.XXXXXX")"
trap 'rm -f "$TMP_OUT"' EXIT

# Keep everything before the generated block marker, then inject stdlib, then keep everything after end marker.
head -n "$((BEGIN_LINE - 1))" "$SOURCE_JAI" > "$TMP_OUT"
cat "$STDLIB_FILE" >> "$TMP_OUT"
tail -n "+$((END_LINE + 1))" "$SOURCE_JAI" >> "$TMP_OUT"

if [[ -f "$OUTPUT_JAI" ]]; then
  echo "Color diff (old $OUTPUT_JAI -> new):"
  git --no-pager diff --no-index --color=always -- "$OUTPUT_JAI" "$TMP_OUT" || true
else
  echo "No existing $OUTPUT_JAI found; skipping diff."
fi

if (( AUTO_YES )); then
  echo "Auto-confirming overwrite (-y)."
else
  read -r -p "Overwrite $OUTPUT_JAI with generated content? [y/N] " CONFIRM
  if [[ ! "$CONFIRM" =~ ^[Yy]$ ]]; then
    echo "Aborted. No changes written."
    exit 0
  fi
fi

mv "$TMP_OUT" "$OUTPUT_JAI"
trap - EXIT

echo "Wrote: $OUTPUT_JAI"
