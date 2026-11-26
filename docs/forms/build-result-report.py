# 서일 기본 양식 「결과보고서」(web/forms/서일_결과보고서.hwpx) 만드는 스크립트.
# 원본: 2026-11 QuestAI 시제품 검수보고서(hwpx, 저장소에는 넣지 않음)에서 표지·제1장 상자·절 제목 띠·❑/- 문단·표·캡션의 모양만 남기고
#  - 내용·그림 17장·업체 정보 삭제, 다른 기관 CI 삭제(꼬리말 서일대학교 CI 만, 사업단 이름 줄 지움)
#  - 글꼴은 원본의 KoPubWorld돋움체 유지
#  - 단계 스타일 추가: "❑ 큰 항목" · "❍ 내용" · "- 세부" (web/seoil-write.js 가 스타일 이름의 기호로 단계를 알아봄)
# 사용: python3 docs/forms/build-result-report.py <원본.hwpx> web/forms/서일_결과보고서.hwpx  (lxml, Pillow 필요)
import re, zipfile, copy, io, sys
from lxml import etree
from PIL import Image
SRC=sys.argv[1]; OUT=sys.argv[2]
zin=zipfile.ZipFile(SRC)
NS={'hp':'http://www.hancom.co.kr/hwpml/2011/paragraph','hh':'http://www.hancom.co.kr/hwpml/2011/head','hc':'http://www.hancom.co.kr/hwpml/2011/core'}
HP='{%s}'%NS['hp']
# ---------- header.xml: 글꼴·스타일 ----------
h=zin.read('Contents/header.xml').decode('utf8')
# 글꼴은 원본 그대로 KoPubWorld돋움체(Medium·Bold). 무료 배포 글꼴이고, 서일 오피스(rhwp-studio)가
# 웹폰트로 받아 쓰므로(외부 웹폰트를 켠 빌드) PC 에 깔려 있지 않아도 앱에서는 같은 모양으로 보인다.
assert 'face="KoPubWorld돋움체 Medium"' in h and 'face="KoPubWorld돋움체 Bold"' in h
# ○ 단계 문단 모양(17): '-'(4)와 ❑(14) 사이 들여쓰기
p4=re.search(r'<hh:paraPr id="4".*?</hh:paraPr>',h,re.S).group(0)
p17=p4.replace('id="4"','id="17"',1).replace('<hc:left value="1500"','<hc:left value="1150"').replace('<hc:left value="3000"','<hc:left value="2300"')
assert p17!=p4
h=h.replace('<hh:paraProperties itemCnt="17">','<hh:paraProperties itemCnt="18">').replace('</hh:paraProperties>',p17+'</hh:paraProperties>')
st=re.search(r'<hh:styles.*?</hh:styles>',h,re.S).group(0)
def style(i,name,eng,pp): return f'<hh:style id="{i}" type="PARA" name="{name}" engName="{eng}" paraPrIDRef="{pp}" charPrIDRef="0" nextStyleIDRef="{i}" langID="1042" lockForm="0"/>'
new=st.replace('itemCnt="1"','itemCnt="4"').replace('</hh:styles>',style(1,'❑ 큰 항목','Item 1',14)+style(2,'❍ 내용','Item 2',17)+style(3,'- 세부','Item 3',4)+'</hh:styles>')
h=h.replace(st,new)
# ---------- section0.xml ----------
r=etree.fromstring(zin.read('Contents/section0.xml'))
ps=r.findall('hp:p',NS)
def settext(el,text):
    """문단(또는 칸) 안 첫 hp:t 에 글을 넣고 나머지 hp:t 는 비운다"""
    ts=[t for t in el.iter(HP+'t')]
    assert ts, etree.tostring(el)[:200]
    for t in ts:
        for ch in list(t): t.remove(ch)
        t.text=''
    ts[0].text=text
def para_t(p,text):
    runs=p.findall('hp:run',NS); assert runs
    for ru in runs:
        for t in ru.findall('hp:t',NS): ru.remove(t)
    for ru in runs[1:]: p.remove(ru)
    t=etree.SubElement(runs[0],HP+'t'); t.text=text
cover={3:'0000학년도 OOO 사업',4:'OO학과(부서)',10:'보고서 제목',11:'결과보고서',24:'2026. 00.',28:'작성 부서(기관)명'}
for i,t in cover.items(): para_t(ps[i],t)
# 머리말: 제목 자리 + 다른 기관 CI 삭제 / 꼬리말: 사업단 구호 삭제, 쪽 번호·학교 CI 만
head=ps[0]
hdr=head.find('.//hp:header',NS); ftr=head.find('.//hp:footer',NS)
cells=hdr.findall('.//hp:tc',NS)
settext(cells[0],'보고서 제목')
run=cells[1].find('.//hp:run',NS)
for ch in list(run): run.remove(ch)
etree.SubElement(run,HP+'t')
for t in ftr.iter(HP+'t'):
    if t.text and '거버넌스' in t.text: t.text=''
assert len(head.findall('.//hp:pic',NS))==1
for sc in head.iter(HP+'shapeComment'): sc.text='서일대학교 CI'
# 본문 뼈대
keep=[]
def clone(i): return copy.deepcopy(ps[i])
def bar(i,text):
    p=clone(i); settext(p.find('.//hp:tc',NS),text); return p
def body(i,text,style):
    p=clone(i); para_t(p,text); p.set('styleIDRef',str(style)); return p
def circ(text):
    p=clone(32); para_t(p,text); p.set('paraPrIDRef','17'); p.set('styleIDRef','2'); return p
def cap(i,text):
    p=clone(i); para_t(p,text); return p
def figure_slot():
    p=clone(34)
    for ru in p.findall('hp:run',NS):
        for ch in list(ru): ru.remove(ch)
    for ru in p.findall('hp:run',NS)[1:]: p.remove(ru)
    etree.SubElement(p.find('hp:run',NS),HP+'t').text='(그림 넣는 자리)'
    return p
def table(i,rows):
    p=clone(i); t=p.find('.//hp:tbl',NS); trs=t.findall('hp:tr',NS)
    rh=int(trs[0].find('.//hp:cellSz',NS).get('height'))
    for tr in trs[len(rows):]: t.remove(tr)
    t.set('rowCnt',str(len(rows)))
    sz=t.find('hp:sz',NS); sz.set('height',str(rh*len(rows)))
    for tr,row in zip(t.findall('hp:tr',NS),rows):
        for tc,text in zip(tr.findall('hp:tc',NS),row): settext(tc,text)
    return p
body_ps=[
 bar(29,'제1장  개요'),
 bar(30,'1. 추진 배경 및 목적'),
 body(31,'❑ 큰 항목의 핵심 내용을 한 줄로 적음',1),
 circ('❍ 근거나 내용을 적음'),
 body(32,'- 세부 사항을 적음',3),
 figure_slot(),
 cap(35,'[그림 1-1] 그림 제목'),
 bar(38,'2. 추진 내용'),
 body(31,'❑ 큰 항목의 핵심 내용을 한 줄로 적음',1),
 body(32,'- 세부 사항을 적음',3),
 cap(39,'<표 1-1> 표 제목'),
 table(40,[['구분','내용'],['',''],['','']]),
 bar(29,'제2장  추진 결과'),
 bar(30,'1. 주요 결과'),
 body(31,'❑ 큰 항목의 핵심 내용을 한 줄로 적음',1),
 body(32,'- 세부 사항을 적음',3),
]
for p in ps[29:]: r.remove(p)
for p in body_ps: r.append(p)
for la in list(r.iter(HP+'linesegarray')): la.getparent().remove(la)
# 문단 id 를 겹치지 않게
for n,p in enumerate(r.iter(HP+'p')): p.set('id',str(2000+n))
assert len(r.findall('.//hp:pic',NS))==1, len(r.findall('.//hp:pic',NS))
sec=etree.tostring(r,xml_declaration=True,encoding='UTF-8',standalone=True)
# ---------- 꼬리말 CI: 사업단 이름 줄을 지우고 학교 이름만 ----------
im=Image.open(io.BytesIO(zin.read('BinData/image3.png'))).convert('RGBA')
px=im.load(); W,H=im.size
for y in range(int(H*0.62),H):
    for x in range(int(W*0.40),W): px[x,y]=(255,255,255,0)
buf=io.BytesIO(); im.save(buf,'PNG'); ci=buf.getvalue()
# ---------- content.hpf / 미리보기 ----------
hpf=zin.read('Contents/content.hpf').decode('utf8')
hpf=re.sub(r'<opf:item id="image(?!3")\d+"[^>]*/>','',hpf)
hpf=re.sub(r'<opf:title>.*?</opf:title>','<opf:title>결과보고서 양식</opf:title>',hpf)
prv='\r\n'.join(['0000학년도 OOO 사업','OO학과(부서)','보고서 제목','결과보고서','2026. 00.','작성 부서(기관)명','<제1장  개요>','<1. 추진 배경 및 목적>'])
zout=zipfile.ZipFile(OUT,'w')
for it in zin.infolist():
    n=it.filename
    if n.startswith('BinData/') and n!='BinData/image3.png': continue
    if n=='Preview/PrvImage.png': continue
    data={'Contents/header.xml':h.encode('utf8'),'Contents/section0.xml':sec,'Contents/content.hpf':hpf.encode('utf8'),'BinData/image3.png':ci,'Preview/PrvText.txt':prv.encode('utf8')}.get(n, zin.read(n))
    zi=zipfile.ZipInfo(n,date_time=(2026,11,26,0,0,0)); zi.compress_type=zipfile.ZIP_STORED if n=='mimetype' else zipfile.ZIP_DEFLATED
    zout.writestr(zi,data)
zout.close()
z=zipfile.ZipFile(OUT); print(z.testzip(), [ (i.filename,i.file_size) for i in z.infolist()])
for n in ('Contents/header.xml','Contents/section0.xml','Contents/content.hpf'): etree.fromstring(z.read(n))
