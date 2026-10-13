"""Regression cases for identity and scope, including row-order invariance."""
import unittest
from zone261011_evidence import resolve_building,group_floors,floor_number
class EvidenceJoinTests(unittest.TestCase):
    def test_shared_address_includes_noncommercial_and_annex(self):
        inventory=[{'pk':str(i),'address':'길1','lots':{'봉황동 1'},'dong':''} for i in (1,2)]
        candidates,status=resolve_building({'rd':'김해시 길 1'},inventory,{'법정동명':'봉황동','지번본번지':'1','지번부번지':'','동정보':''})
        self.assertEqual(status,'shared_address');self.assertEqual(len(candidates),2)
    def test_parcel_disambiguates_without_guessing(self):
        inv=[{'pk':'1','address':'길1','lots':{'봉황동 1'},'dong':''},{'pk':'2','address':'길1','lots':{'봉황동 2'},'dong':''}]
        raw={'법정동명':'봉황동','지번본번지':'2','지번부번지':'','동정보':''}
        self.assertEqual(resolve_building({'rd':'길1'},inv,raw)[0][0]['pk'],'2')
        raw['지번본번지']='3';self.assertEqual(resolve_building({'rd':'길1'},inv,raw)[0],[])
    def test_supplemental_lot_can_create_ambiguity(self):
        inv=[{'pk':'1','address':'길1','lots':{'봉황동 1'},'matchLots':{'봉황동 1','부원동 2'},'dong':''},{'pk':'2','address':'길1','lots':{'부원동 2'},'dong':''}]
        raw={'법정동명':'부원동','지번본번지':'2','지번부번지':'','동정보':''}
        self.assertEqual(resolve_building({'rd':'길1'},inv,raw)[1],'shared_address')
    def test_missing_addresses_never_join(self):
        self.assertEqual(resolve_building({'rd':''},[{'address':''}]),([], 'address_missing'))
    def test_floor_number_is_not_an_allocation(self):
        for x,y in [('1',1),('지상2층',2),('B1',-1),('-2',-2),('지하1층',-1),('',None),('1~2',None),('옥탑',None),('0',None)]:self.assertEqual(floor_number(x),y)
    def test_floor_parts_do_not_duplicate_floor_or_occupancy(self):
        pk='1000000000000001706465';pop=[{'pk':pk,'lots':{'봉황동 1'}}]
        def row(area,kind='주건축물',use='사무소',side='지상'):return {'mgmBldrgstPk':pk,'flrGbCdNm':side,'flrNo':1,'area':area,'mainAtchGbCdNm':kind,'mainPurpsCdNm':use}
        rows=[row(90),row(10),row(2),row(2),row(7,'부속건축물'),row(30,use='단독주택'),row(9,side='지하')]
        a,_,qa=group_floors(pop,{'봉황동 1':rows});b,_,qb=group_floors(pop,{'봉황동 1':list(reversed(rows))})
        self.assertEqual(a,b);self.assertEqual(qa,qb);self.assertEqual(len(a),2)
        self.assertEqual(a[(pk,1)]['areaM2'],104);self.assertEqual(a[(pk,1)]['storeIds'],[])
        self.assertEqual(qa['excludedAnnexRows'],1);self.assertEqual(qa['identicalRowsUnresolved'],1)
        self.assertNotIn('vacancyRate',a[(pk,1)])
if __name__=='__main__':unittest.main()
