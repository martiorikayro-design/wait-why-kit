"""estimate_take.py script.txt out_take.json - PLACEHOLDER word times (no voice yet), in the same format as the aligned take
({w, s, e} tokens, punctuation as separate tokens). Replace it with examples/hot/align.py output once the voice exists."""
import json, re, sys
txt = open(sys.argv[1]).read().strip()
def syl(w):
    w = re.sub(r'[^a-z]', '', w.lower()); n = len(re.findall(r'[aeiouy]+', w))
    if w.endswith('e') and not w.endswith(('le', 'ee')) and n > 1: n -= 1
    return max(1, n)
out, t = [], 0.0
for raw in txt.split():
    w = raw.strip(',.:')
    d = 0.2 * syl(w) + 0.06
    out.append({'w': w, 's': round(t, 3), 'e': round(t + d, 3)}); t += d
    m = re.search(r'[,.:]+$', raw)
    if m:
        out.append({'w': m.group(0), 's': round(t, 3), 'e': round(t, 3)}); t += 0.45 if '.' in m.group(0) or ':' in m.group(0) else 0.3
json.dump(out, open(sys.argv[2], 'w'), indent=1); print(len(out), 'tokens, ends at', round(t, 2))
