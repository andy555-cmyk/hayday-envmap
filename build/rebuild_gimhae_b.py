"""Rebuild B from PDF page 5's unobscured image centreline, not printed area.

Usage: python3 build/rebuild_gimhae_b.py SOURCE.pdf AUDIT_DIRECTORY
Requires PyMuPDF, OpenCV, numpy, shapely. No source PDF is published.
The old b171 filename/query remains a compatibility ID, NOT the area's size.
"""
import sys, re, json, math, hashlib
from pathlib import Path
from collections import Counter
import fitz
import cv2
import numpy as np
from shapely.geometry import Polygon, Point, shape, mapping
from shapely.ops import transform, nearest_points

ROOT=Path(__file__).resolve().parents[1]
pdfpath=Path(sys.argv[1]); audit=Path(sys.argv[2]); audit.mkdir(parents=True,exist_ok=True)
pdf=fitz.open(pdfpath)
def raster(page):
    pix=page.get_pixmap(alpha=False)
    return cv2.cvtColor(np.frombuffer(pix.samples,np.uint8).reshape(pix.height,pix.width,3),cv2.COLOR_RGB2BGR)
p4,p5=raster(pdf[3]),raster(pdf[4])
imgref=pdf[4].get_images(full=True)[0][0]
base=cv2.imdecode(np.frombuffer(pdf.extract_image(imgref)['image'],np.uint8),cv2.IMREAD_COLOR)
rect,matrix=pdf[4].get_image_rects(imgref,transform=True)[0]
assert rect==fitz.Rect(6,0,3513,2480) and base.shape[:2]==(2480,3507)
# Match the two source pages, preserving the established geographic anchors.
sift=cv2.SIFT_create(nfeatures=15000)
k5,d5=sift.detectAndCompute(cv2.cvtColor(p5,cv2.COLOR_BGR2GRAY),None)
k4,d4=sift.detectAndCompute(cv2.cvtColor(p4,cv2.COLOR_BGR2GRAY),None)
matches=[m for m,n in cv2.BFMatcher().knnMatch(d5,d4,k=2) if m.distance<.65*n.distance]
q5=np.float32([k5[m.queryIdx].pt for m in matches]);q4=np.float32([k4[m.trainIdx].pt for m in matches])
cv2.setRNGSeed(260930)
M,inliers=cv2.estimateAffine2D(q5,q4,method=cv2.RANSAC,ransacReprojThreshold=1)
assert int(inliers.sum())>3000
registration=np.linalg.norm(np.c_[q5,np.ones(len(q5))]@M.T-q4,axis=1)[inliers.ravel().astype(bool)]
assert np.percentile(registration,95)<1
anchors=np.array([[1513,747],[1915,704],[1600,1971],[2258,1894],[2220,1568],[1970,1598]],float)
gps=np.array([[128.880298,35.23632],[128.884305,35.236674],[128.881184,35.226364],[128.887603,35.226976],[128.887337,35.229664],[128.884846,35.229511]])
A4=np.linalg.lstsq(np.c_[anchors,np.ones(6)],gps,rcond=None)[0]
A5=np.vstack([M,[0,0,1]]).T@A4
b,g,r=cv2.split(base);mask=((r>225)&(g<75)&(b<75)).astype('uint8')*255
contours,hierarchy=cv2.findContours(mask,cv2.RETR_TREE,cv2.CHAIN_APPROX_NONE)
outer_id=max(range(len(contours)),key=lambda i:cv2.contourArea(contours[i]))
inner_id=max((i for i in range(len(contours)) if hierarchy[0,i,3]==outer_id),key=lambda i:cv2.contourArea(contours[i]))
outer=Polygon(contours[outer_id].reshape(-1,2));inner=Polygon(contours[inner_id].reshape(-1,2))
assert outer.is_valid and inner.is_valid and outer.contains(inner)
# Average the two sides of the red stroke. Rounded bends and the east inset survive.
mid=[]
for x,y in outer.exterior.coords[:-1]:
    nearest=nearest_points(Point(x,y),inner.exterior)[1]
    mid.append([(x+nearest.x)/2,(y+nearest.y)/2])
center=Polygon(mid).simplify(.75,preserve_topology=True)
assert center.is_valid
rawpx=np.array(center.exterior.coords)
linepoints=np.array([center.exterior.interpolate(t).coords[0] for t in np.linspace(0,center.length,5000)])
ij=np.rint(linepoints).astype(int)
stroke_coverage=float(np.mean(mask[ij[:,1],ij[:,0]]>0))
assert stroke_coverage>.999
pixels=rawpx+np.array([6,0])
ll=np.c_[pixels,np.ones(len(pixels))]@A5
poly=Polygon(ll); assert poly.is_valid
scale=np.array([111320*math.cos(math.radians(35.232)),111320]);origin=np.array([128.88,35.23])
def metric(g):
    return transform(lambda x,y,z=None:((np.array(x)-origin[0])*scale[0],(np.array(y)-origin[1])*scale[1]),g)
pm=metric(poly);review=pm.boundary.buffer(20)
assert 145000<pm.area<165000 and 128.87<poly.centroid.x<128.89 and 35.22<poly.centroid.y<35.24
html=(ROOT/'gimhae-wondosim.html').read_text()
raw=re.search(r'<script id="dat" type="application/json">(.*?)</script>',html,re.S).group(1);D=json.loads(raw)
inside=[];edges=[];touch=[];skipped=[];bands=Counter();uses=Counter();dongs=Counter();known=old=0
for i,f in enumerate(D['bld']['features']):
    geom=shape(f['geometry'])
    if geom.is_empty or not geom.is_valid:skipped.append(i);continue
    gm=metric(geom);included=pm.covers(gm.representative_point())
    if review.intersects(gm):edges.append(i)
    if gm.intersects(pm) and not included:touch.append(i)
    if not included:continue
    inside.append(i);p=f['properties'];yr=p.get('yr') or 0
    known+=int(yr>0);old+=int(0<yr<=2006)
    bands['미확인' if not yr else '40년 이상' if yr<=1986 else '30~39년' if yr<=1996 else '20~29년' if yr<=2006 else '10~19년' if yr<=2016 else '10년 미만']+=1
    uses[p.get('pu') or '확인 불가']+=1;dongs[p.get('d') or '확인 불가']+=1
stores=[i for i,p in enumerate(D['store']) if poly.covers(Point(p['lon'],p['lat']))]
def const(n):return json.loads(re.search(r'^const '+n+r'=(.*?);\s*$',html,re.M).group(1))
roads=[];lengths=Counter()
for f in const('HIER')['features']:
    clipped=shape(f['geometry']).intersection(poly)
    if clipped.is_empty or clipped.geom_type not in ['LineString','MultiLineString']:continue
    roads.append({'type':'Feature','properties':f['properties'],'geometry':mapping(clipped)})
    lengths[f['properties'].get('tier','미분류')]+=metric(clipped).length
wifi=[f for f in const('WIFIPT')['features'] if poly.covers(shape(f['geometry']))]
residual=np.linalg.norm((np.c_[anchors,np.ones(6)]@A4-gps)*scale,axis=1)
data={'version':'2026-09-30-page5','source':'구역계검토자료.pdf 5쪽','sourcePage':5,'printedArea':156000,'computedArea':round(pm.area),'edgeReviewM':20,'maxControlResidualM':round(float(max(residual)),2),
 'boundary':{'type':'Feature','properties':{'k':'b156','n':'B권역 15.6ha','c':'#ff3636','w':4},'geometry':mapping(poly)},
 'buildingIndices':inside,'edgeBuildingIndices':edges,'intersectOutsideIndices':touch,'storeIndices':stores,'skippedGeometryIndices':skipped,
 'stats':{'buildings':len(inside),'stores':len(stores),'knownYear':known,'unknownYear':len(inside)-known,'old20':old,'oldPct':round(100*old/known,1),'bands':dict(bands),'uses':dict(uses.most_common()),'dongs':dict(dongs),'industries':dict(Counter(D['store'][i]['L'] for i in stores).most_common()),'roadLengths':{k:round(v) for k,v in lengths.items()},'wifiInside':len(wifi),'edgeInside':len(set(edges)&set(inside))},
 'roads':{'type':'FeatureCollection','features':roads},'wifiInside':wifi,'pixelBoundary':pixels.tolist(),'affine':A5.tolist(),'embeddedDataSHA256':hashlib.sha256(raw.encode()).hexdigest(),
 'provenance':{'sourcePDFSHA256':hashlib.sha256(pdfpath.read_bytes()).hexdigest(),'method':'Page 5 embedded raster red stroke inner/outer midpoint; preserve east inset; existing blue review anchors, not survey','page5ToPage4':M.tolist(),'registrationInliers':int(inliers.sum()),'registrationP95Pixels':round(float(np.percentile(registration,95)),4),'centerlineSamples':5000,'centerlineWithinRedStroke':stroke_coverage,'simplifyPixels':.75,'selection':'Latest user-supplied image matches page 5; earlier call and separate folder PNG specify page 4, retained as prior alternative'}}
(ROOT/'data/gimhae-b171.json').write_text(json.dumps(data,ensure_ascii=False,separators=(',',':')))
# Diagnostic overlays only; the source PDF remains untouched.
cv2.polylines(base,[np.rint(rawpx).astype('int32')],True,(255,255,0),2)
cv2.imwrite(str(audit/'page5-new-boundary-proof.png'),base[1040:1610,1290:1970])
(audit/'page5-rebuild-report.json').write_text(json.dumps(data,ensure_ascii=False,indent=2))
print(json.dumps({'vertices':len(rawpx)-1,'area':data['computedArea'],'stats':data['stats'],'edges':len(edges),'provenance':data['provenance']},ensure_ascii=False,indent=2))
