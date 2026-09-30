"""Read-only B171 regression checks. Run with Python + numpy + shapely."""
import hashlib
import json
import math
import re
from collections import Counter
from pathlib import Path

import numpy as np
from shapely.geometry import Point, Polygon, shape
from shapely.ops import transform

ROOT = Path(__file__).resolve().parents[1]
html = (ROOT / 'gimhae-wondosim.html').read_text()
raw = re.search(r'<script id="dat" type="application/json">(.*?)</script>', html, re.S).group(1)
D = json.loads(raw)
B = json.loads((ROOT / 'data/gimhae-b171.json').read_text())
assert hashlib.sha256(raw.encode()).hexdigest() == B['embeddedDataSHA256'], 'source changed; recalculate scope'
scale = np.array([111320 * math.cos(math.radians(35.232)), 111320])
origin = np.array([128.88, 35.23])


def metric(g):
    return transform(lambda x, y, z=None: ((np.array(x)-origin[0])*scale[0], (np.array(y)-origin[1])*scale[1]), g)


poly = shape(B['boundary']['geometry'])
assert poly.is_valid and poly.exterior.is_ring
pm = metric(poly)
review = pm.boundary.buffer(B['edgeReviewM'])
inside, edges, skipped = [], [], []
for i, f in enumerate(D['bld']['features']):
    geom = shape(f['geometry'])
    if geom.is_empty or not geom.is_valid:
        skipped.append(i)
        continue
    gm = metric(geom)
    if pm.covers(gm.representative_point()):
        inside.append(i)
    if review.intersects(gm):
        edges.append(i)
assert inside == B['buildingIndices']
assert edges == B['edgeBuildingIndices']
assert skipped == B['skippedGeometryIndices'] == []
store_indices = [i for i, p in enumerate(D['store']) if poly.covers(Point(p['lon'], p['lat']))]
assert store_indices == B['storeIndices']
assert len(set(inside)) == len(inside) == B['stats']['buildings'] == 721
assert len(store_indices) == B['stats']['stores'] == 405
assert len(edges) == 277 and len(set(edges) & set(inside)) == B['stats']['edgeInside'] == 167
assert round(pm.area) == B['computedArea'] == 170450
known = [D['bld']['features'][i]['properties'] for i in inside if D['bld']['features'][i]['properties'].get('yr', 0) > 0]
old = [p for p in known if p['yr'] <= 2006]
assert len(known) == B['stats']['knownYear'] == 614
assert len(inside)-len(known) == B['stats']['unknownYear'] == 107
assert len(old) == B['stats']['old20'] == 567
assert round(len(old)/len(known)*100, 1) == B['stats']['oldPct'] == 92.3
assert sum(B['stats']['bands'].values()) == sum(B['stats']['uses'].values()) == len(inside)
assert Counter(D['bld']['features'][i]['properties'].get('pu') or '확인 불가' for i in inside) == B['stats']['uses']
assert Counter(D['store'][i]['L'] for i in store_indices) == B['stats']['industries']
lengths = Counter()
for f in B['roads']['features']:
    geom = shape(f['geometry'])
    assert geom.difference(poly.buffer(1e-10)).is_empty, 'road escaped B boundary'
    lengths[f['properties']['tier']] += metric(geom).length
assert {k: round(v) for k, v in lengths.items()} == B['stats']['roadLengths']
wifi = json.loads(re.search(r'^const WIFIPT=(.*?);\s*$', html, re.M).group(1))
assert sum(poly.covers(shape(f['geometry'])) for f in wifi['features']) == B['stats']['wifiInside'] == 0
for field in ['buildings', 'stores', 'knownYear', 'unknownYear', 'old20', 'oldPct', 'edgeInside']:
    print(f'{field}: {B["stats"][field]} PASS')
print('source hash, full membership, edge band, area, uses, industries, roads, wifi: PASS')
