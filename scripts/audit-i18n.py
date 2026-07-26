#!/usr/bin/env python3
"""Cross-checks every t('key') / tHtml('key') call in components/app against
the flat I18N dictionary. Run after adding or editing any component."""
import re, pathlib, sys

root = pathlib.Path(__file__).parent.parent
tsx_files = list(root.glob('components/**/*.tsx')) + list(root.glob('app/**/*.tsx'))

used_keys = set()
for f in tsx_files:
    text = f.read_text(encoding='utf-8')
    used_keys |= set(re.findall(r"\bt(?:Html)?\(\s*'([\w.]+)'\s*\)", text))

i18n_src = (root / 'content/i18n.ts').read_text(encoding='utf-8')
dict_keys = set(re.findall(r"'([\w.]+)':\s*\{\s*en:", i18n_src))

missing = sorted(used_keys - dict_keys)
unused = sorted(dict_keys - used_keys)

print(f"t()/tHtml() calls found: {len(used_keys)}")
print(f"dictionary entries:      {len(dict_keys)}")
print()
if missing:
    print("MISSING from dictionary (would render as the raw key):")
    for k in missing:
        print("  -", k)
else:
    print("No missing keys — every t() call has a dictionary entry.")
print()
if unused:
    print("In dictionary but never called (harmless, just unused):")
    for k in unused:
        print("  -", k)

sys.exit(1 if missing else 0)
