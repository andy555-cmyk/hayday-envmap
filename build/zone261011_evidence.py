"""Auditable evidence joins. No store, facade or meter implies a whole floor's occupancy.
Private source rows and addresses stay outside the public repository.
"""
import argparse, collections, csv, hashlib, json, pathlib, re
COMM = {'제1종근린생활시설','제2종근린생활시설','판매시설','운동시설','위락시설'}
RES = {'단독주택','다가구주택','다세대주택','공동주택','아파트','연립주택','다중주택'}

def address(value):
    return re.sub(r'\s+', '', re.sub(r'\([^)]*\)', '', str(value or '')).replace('경상남도','').replace('경남','').replace('김해시',''))

def floor_number(value):
    s = str(value or '').strip().upper().replace(' ', '')
    m = re.fullmatch(r'(?:지상)?([1-9]\d*)(?:층)?', s)
    if m: return int(m[1])
    m = re.fullmatch(r'(?:지하|B|-)([1-9]\d*)(?:층)?', s)
    return -int(m[1]) if m else None

def ledger_floor(row):
    kind = row.get('flrGbCdNm')
    try: no = int(row.get('flrNo') or 0)
    except (ValueError, TypeError): return None
    return no * (1 if kind == '지상' else -1) if kind in ('지상','지하') and no > 0 else None

def source_store_key(row, raw=False):
    if raw:
        return (row['상호명'].replace(';',','),address(row['도로명주소']),str(row['층정보']).strip(),round(float(row['경도']),6),round(float(row['위도']),6))
    return (row['nm'],address(row.get('rd')),str(row.get('fl') or '').strip(),round(row['lon'],6),round(row['lat'],6))

def resolve_building(store, inventory, raw=None):
    """Only an unambiguous conjunction of available identifiers may select a ledger."""
    addr = address(store.get('rd'))
    if not addr: return [], 'address_missing'
    candidates = [b for b in inventory if b['address'] == addr]
    if raw:
        lot = raw['법정동명'] + ' ' + str(int(raw['지번본번지'])) + ('-' + str(int(raw['지번부번지'])) if raw['지번부번지'] and int(raw['지번부번지']) else '')
        candidates = [b for b in candidates if lot in b.get('matchLots',b['lots'])]
        dong = raw.get('동정보','').strip()
        if dong:
            known = [b for b in candidates if b['dong'] == dong]
            # An explicit dong that cannot be corroborated is a conflict, not permission to guess.
            if not known: return [], 'dong_unverified'
            candidates = known
    return candidates, 'unique' if len(candidates)==1 else ('shared_address' if candidates else 'ledger_unmatched')

def group_floors(pop, source):
    groups, audit = {}, collections.Counter()
    all_floor_keys = set()
    for b in pop:
        rows = [r for lot in b['lots'] for r in (source.get(lot) or []) if isinstance(r,dict) and str(r.get('mgmBldrgstPk'))==b['pk']]
        # A ledger can occur in more than one query parcel; use its canonical parcel only.
        if len(b['lots'])>1:
            rows = next(([r for r in source.get(lot,[]) if isinstance(r,dict) and str(r.get('mgmBldrgstPk'))==b['pk']] for lot in sorted(b['lots']) if isinstance(source.get(lot),list) and any(str(r.get('mgmBldrgstPk'))==b['pk'] for r in source[lot])),[])
        if not rows: audit['buildingsWithoutFloors']+=1
        signatures=collections.Counter(json.dumps(r,ensure_ascii=False,sort_keys=True) for r in rows)
        audit['identicalRowsUnresolved']+=sum(n-1 for n in signatures.values() if n>1)
        for row in rows:
            audit['sourceRows']+=1
            if row.get('mainAtchGbCdNm') != '주건축물': audit['excludedAnnexRows']+=1; continue
            no=ledger_floor(row)
            if no is None: audit['unknownFloorRows']+=1; continue
            fk=(b['pk'],no); all_floor_keys.add(fk)
            if row.get('mainPurpsCdNm') in RES: audit['excludedResidentialRows']+=1; continue
            area=float(row.get('area') or 0)
            if area<=0: audit['nonpositiveAreaRows']+=1; continue
            audit['nonResidentialParts']+=1
            group=groups.setdefault(fk,{'buildingId':b['pk'],'floor':no,'areaM2':0,'sourceParts':0,'uses':set(),'storeIds':[]})
            group['areaM2']+=area;group['sourceParts']+=1;group['uses'].add(row.get('mainPurpsCdNm') or '')
    for group in groups.values():
        group['areaM2']=round(group['areaM2'],2);group['uses']=sorted(group['uses'])
    return groups, all_floor_keys, dict(audit)

def main():
    ap=argparse.ArgumentParser();ap.add_argument('output');ap.add_argument('--raw-stores',required=True);ap.add_argument('--attached-lots');args=ap.parse_args()
    out=pathlib.Path(args.output);out.mkdir(parents=True,exist_ok=True)
    home=pathlib.Path.home();repo=pathlib.Path(__file__).resolve().parent.parent
    paths={'ledger':home/'dev/gimhae-tasks-261013/stage_a.json','energy':home/'dev/gimhae-tasks-261013/energy_zone.json','floors':home/'dev/gimhae-zone-final/vacrate_261013/floors.json','rawStores':pathlib.Path(args.raw_stores),'zone':repo/'data/gimhae-zone-261011.json','html':repo/'gimhae-wondosim.html'}
    A=json.loads(paths['ledger'].read_text());E=json.loads(paths['energy'].read_text());F=json.loads(paths['floors'].read_text());Z=json.loads(paths['zone'].read_text());D=json.loads(re.search(r'<script id="dat" type="application/json">(.*?)</script>',paths['html'].read_text(),re.S)[1])
    buildings={}
    for lot in A['lots']:
        for r in lot['recs']:
            pk=str(r['mgmBldrgstPk']);b=buildings.setdefault(pk,{'pk':pk,'address':address(r['newPlatPlc']),'lots':set(),'dong':str(r.get('dongNm') or '').strip(),'main':r['mainAtchGbCdNm']=='주건축물','general':r['regstrGbCdNm']=='일반','use':r['mainPurpsCdNm'],'areaM2':float(r['totArea'] or 0),'floors':int(r['grndFlrCnt'] or 0),'inside':False,'ledgerTotalDongAreaM2':float(r.get('totDongTotArea') or r['totArea'] or 0)})
            b['lots'].add(f"{lot['dong']} {lot['jibun']}");b['inside'] |= lot['inside']
    attached_files=[]
    if args.attached_lots:
        attached_files=sorted(pathlib.Path(args.attached_lots).glob('*_getBrAtchJibunInfo_full.json'))
        for path in attached_files:
            data=json.loads(path.read_text())['response']['body'];items=(data.get('items') or {}).get('item',[])
            for r in items if isinstance(items,list) else [items]:
                pk=str(r['mgmBldrgstPk']);b=buildings.get(pk)
                if not b or r.get('regstrKindCd') not in ('2','3') or address(r.get('newPlatPlc'))!=b['address']:continue
                dong={'10400':'봉황동','10200':'서상동','10300':'부원동'}.get(str(r.get('atchBjdongCd')))
                if dong and str(r.get('atchPlatGbCd'))=='0':
                    lot=dong+' '+str(int(r['atchBun']))+('-'+str(int(r['atchJi'])) if int(r['atchJi']) else '')
                    b.setdefault('matchLots',set(b['lots'])).add(lot)
    inventory=list(buildings.values());pop=[b for b in inventory if b['inside'] and b['main'] and b['general'] and b['use'] in COMM];pks={b['pk'] for b in pop}
    groups,all_floors,floor_audit=group_floors(pop,F)
    area_conflicts=[]
    for b in pop:
        rows=[r for lot in b['lots'] for r in F.get(lot,[]) if isinstance(r,dict) and str(r.get('mgmBldrgstPk'))==b['pk']]
        if rows:
            floor_total=round(sum(float(r.get('area') or 0) for r in rows),2)
            separate_annex=sum(x['areaM2'] for x in inventory if not x['main'] and x['lots']==b['lots'])
            if abs(floor_total-b['areaM2'])>0.011 and abs(floor_total+separate_annex-b['areaM2'])>0.011:
                area_conflicts.append({'buildingId':b['pk'],'lots':sorted(b['lots']),'floorAreaM2':floor_total,'ledgerGrossAreaM2':b['areaM2'],'differenceM2':round(floor_total-b['areaM2'],2)})
    chosen=[(i,D['store'][i]) for i in Z['storeIndices']];wanted={source_store_key(s) for _,s in chosen};raw_by_key=collections.defaultdict(list)
    with paths['rawStores'].open(encoding='utf-8-sig') as f:
        for raw in csv.DictReader(f):
            if raw['시군구코드']!='48250':continue
            sk=source_store_key(raw,True)
            if sk in wanted:raw_by_key[sk].append(raw)
    store_records=[];counts=collections.Counter();seen_store=set();raw_subset=[]
    for idx,s in chosen:
        raw_hits=raw_by_key.get(source_store_key(s),[])
        # The public source row lacks its business ID; recover it only from an exact unique signature.
        raw=raw_hits[0] if len(raw_hits)==1 else None
        sid=raw['상가업소번호'] if raw else f'public-row:{idx}'
        if sid in seen_store:counts['duplicateSourceRows']+=1;continue
        seen_store.add(sid)
        if raw:raw_subset.append(raw)
        candidates,reason=resolve_building(s,inventory,raw)
        record={'sourceId':sid,'publicIndex':idx,'rawRecovered':bool(raw),'candidateBuildingIds':[b['pk'] for b in candidates],'buildingId':None,'floor':floor_number(raw['층정보'] if raw else s.get('fl')),'status':reason}
        if not raw:record['status']='source_row_unresolved'  # no lossy address-only fallback
        elif len(candidates)==1:
            b=candidates[0]
            if b['pk'] not in pks:record['status']='outside_population'
            else:
                record['buildingId']=b['pk'];fk=(b['pk'],record['floor'])
                if record['floor'] is None:record['status']='building_only'
                elif fk in groups:record['status']='floor_linked';groups[fk]['storeIds'].append(sid)
                elif fk in all_floors:record['status']='residential_floor_conflict'
                else:record['status']='floor_not_in_ledger'
        counts[record['status']]+=1;store_records.append(record)
    # Energy stays in one parcel/month record. It is NEVER expanded to buildings or floors.
    energy_records={};energy_dupes=0;energy_conflicts=[]
    for query_lot,v in E.items():
        for ym,items in (v.get('elec') or {}).items():
            for r in items if isinstance(items,list) else []:
                ek=tuple(str(r.get(k) or '') for k in ('sigunguCd','bjdongCd','platGbCd','bun','ji','useYm','naRoadCd','naUgrndCd','naMainBun','naSubBun'))
                if ek in energy_records:
                    if energy_records[ek]['useQty'] != r.get('useQty'):energy_conflicts.append({'key':ek,'values':[energy_records[ek]['useQty'],r.get('useQty')]})
                    else:energy_dupes+=1
                else:energy_records[ek]={'queryLot':query_lot,'address':address(r.get('newPlatPlc')),'month':str(r.get('useYm') or ym),'useQty':r.get('useQty'),'scope':'parcel_month','buildingId':None,'floor':None}
    pop_lots={j for b in pop for j in b['lots']}
    photo_records=[]
    for lot,data in Z['roadview']['byJibun'].items():
        if lot in pop_lots:
            for panel in data['panels']:
                photo_records.append({'sourceId':'stage1:'+lot+':'+panel['date'],'lot':lot,'date':panel['date'],'state':panel['state'],'scope':'parcel_facade','buildingId':None,'floor':None})
    v2=home/'dev/gimhae-vacancy-rv/v2/judge';targets={t['id']:t for t in json.loads((v2/'targets.json').read_text())};over=json.loads((v2/'review.json').read_text())['override']
    for r in json.loads((v2/'result.json').read_text()):
        t=targets[r['id']]
        if t['jibun'] in pop_lots:
            photo_records.append({'sourceId':'stage2:'+r['id'],'lot':t['jibun'],'date':t['date'],'state':over.get(r['id'],r['ground']['state']),'scope':'target_facade','buildingId':None,'floor':None})
    # Distinct captures/targets can cover the same parcel; aggregate coverage by union, never by addition.
    ground=[g for g in groups.values() if g['floor']==1]
    count=lambda seq:len(seq)
    store_total=len(store_records);linked=[r for r in store_records if r['buildingId']]
    sharing={b['address'] for b in pop if b['address'] and sum(x['address']==b['address'] for x in inventory)>1}
    summary={'schemaVersion':2,'population':{'buildings':len(pop),'small':sum(b['floors']<=2 and b['areaM2']<=330 for b in pop),'large':sum(not(b['floors']<=2 and b['areaM2']<=330) for b in pop),'areaM2':round(sum(b['areaM2'] for b in pop)),'commercialFloorM2':round(sum(g['areaM2'] for g in groups.values()),2),'floorParts':floor_audit.get('nonResidentialParts',0),'floorGroups':len(groups),'groundFloorGroups':len(ground),'groundFloorM2':round(sum(g['areaM2'] for g in ground),2)},
        'stores':{'total':store_total,'sourceRows':len(chosen),'rawRecovered':sum(r['rawRecovered'] for r in store_records),'byStatus':dict(sorted(counts.items())),'linkedBuildings':len({r['buildingId'] for r in linked}),'linkedFloors':sum(bool(g['storeIds']) for g in groups.values()),'groundLinkedFloors':sum(bool(g['storeIds']) for g in ground),'unknownFloor':sum(r['floor'] is None for r in store_records)},
        'quality':dict(floor_audit,sharedAddresses=len(sharing),buildingsOnSharedAddresses=sum(b['address'] in sharing for b in pop),ledgerFloorAreaConflicts=len(area_conflicts),energyDuplicateRowsRemoved=energy_dupes,energyConflicts=len(energy_conflicts),energyAssignedToFloors=0,photosAssignedToFloors=0,unknownStoresAssignedToFloors=0),
        'energy':{'queriedParcels':len(E),'parcelsWithData':len({r['queryLot'] for r in energy_records.values()}),'uniqueMonthRows':len(energy_records),'months':sorted({r['month'] for r in energy_records.values()}),'populationParcelsWithData':len({r['queryLot'] for r in energy_records.values()}&pop_lots)},
        'roadview':{'records':len(photo_records),'uniqueParcels':len({r['lot'] for r in photo_records}),'dates':sorted({r['date'] for r in photo_records})},
        'vacancyRate':None,'verifiedVacantAreaM2':None,'rentableAreaM2':None}
    for b in inventory:
        b['lots']=sorted(b['lots'])
        if 'matchLots' in b:b['matchLots']=sorted(b['matchLots'])
    private={'summary':summary,'buildings':pop,'floors':sorted(groups.values(),key=lambda g:(g['buildingId'],g['floor'])),'stores':store_records,'energy':list(energy_records.values()),'energyConflicts':energy_conflicts,'areaConflicts':area_conflicts,'photos':photo_records}
    paths.update({'attached:'+p.name:p for p in attached_files})
    for name,value in [('evidence.json',private),('summary.json',summary),('store_source_subset.json',raw_subset),('sources.json',{k:{'path':str(p),'sha256':hashlib.sha256(p.read_bytes()).hexdigest()} for k,p in paths.items()})]:
        (out/name).write_text(json.dumps(value,ensure_ascii=False,indent=2)+'\n')
    print(json.dumps(summary,ensure_ascii=False,indent=2))
if __name__=='__main__':main()
