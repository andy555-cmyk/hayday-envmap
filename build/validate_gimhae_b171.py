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
assert B['sourcePage'] == 5 and B['printedArea'] == 156000
assert B['source'] == '구역계검토자료.pdf 5쪽'
assert B['provenance']['sourcePDFSHA256'] == 'd897d65698b7c576f34e21c1eff9cda50bdb014b7bf541f57347b76af0b0abf8'
assert B['provenance']['centerlineWithinRedStroke'] == 1 and len(B['pixelBoundary']) == 91
pixels=np.array(B['pixelBoundary']); expected=np.c_[pixels,np.ones(len(pixels))] @ np.array(B['affine'])
assert np.max(np.abs(expected-np.array(poly.exterior.coords))) < 1e-10
# Page 5 has an east inset hidden under a label in the rendered PDF.
assert any(1880 < x < 1920 and 1370 < y < 1400 for x,y in pixels)
assert max(pixels[:,0]) < 1920, 'Old page 4 east edge must not return'
assert len(set(inside)) == len(inside) == B['stats']['buildings'] == 651
assert len(store_indices) == B['stats']['stores'] == 403
assert len(edges) == 323 and len(set(edges) & set(inside)) == B['stats']['edgeInside'] == 176
assert round(pm.area) == B['computedArea'] == 157520
known = [D['bld']['features'][i]['properties'] for i in inside if D['bld']['features'][i]['properties'].get('yr', 0) > 0]
old = [p for p in known if p['yr'] <= 2006]
assert len(known) == B['stats']['knownYear'] == 551
assert len(inside)-len(known) == B['stats']['unknownYear'] == 100
assert len(old) == B['stats']['old20'] == 511
assert round(len(old)/len(known)*100, 1) == B['stats']['oldPct'] == 92.7
assert sum(B['stats']['bands'].values()) == sum(B['stats']['uses'].values()) == len(inside)
assert Counter(D['bld']['features'][i]['properties'].get('pu') or '확인 불가' for i in inside) == B['stats']['uses']
assert Counter(D['store'][i]['L'] for i in store_indices) == B['stats']['industries']
lengths = Counter()
for f in B['roads']['features']:
    geom = shape(f['geometry'])
    assert geom.difference(poly.buffer(1e-10)).is_empty, 'road escaped B boundary'
    lengths[f['properties']['tier']] += metric(geom).length
assert {k: round(v) for k, v in lengths.items()} == B['stats']['roadLengths']
source_roads=json.loads(re.search(r'^const HIER=(.*?);\s*$', html, re.M).group(1))
expected_roads=[]
for f in source_roads['features']:
    geom=shape(f['geometry']).intersection(poly)
    if not geom.is_empty and geom.geom_type in ['LineString','MultiLineString']:
        expected_roads.append((f['properties'],geom))
assert len(expected_roads)==len(B['roads']['features'])
for (props,geom),actual in zip(expected_roads,B['roads']['features']):
    assert props==actual['properties'] and geom.equals_exact(shape(actual['geometry']),1e-10)
wifi = json.loads(re.search(r'^const WIFIPT=(.*?);\s*$', html, re.M).group(1))
assert sum(poly.covers(shape(f['geometry'])) for f in wifi['features']) == B['stats']['wifiInside'] == 0
for field in ['buildings', 'stores', 'knownYear', 'unknownYear', 'old20', 'oldPct', 'edgeInside']:
    print(f'{field}: {B["stats"][field]} PASS')
print('source hash, full membership, edge band, area, uses, industries, roads, wifi: PASS')
