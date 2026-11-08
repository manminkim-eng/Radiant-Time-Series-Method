// RTS-MANMIN 매뉴얼 화면 캡처 — usage: node capture_rts.js <repoDir> <outDir>
// 규격 1440×900 · DSF 1.25 · serviceWorkers block · _marks.json(번호 배지 % 좌표, 요소 왼쪽 위) — EPI capture_epi.js 와 같은 방식
// 예제 = manual/sample/manual_example_6rooms.rts (6실 · AHU 2대) 를 restoreProjectData 로 넣고 calcAll() 뒤 캡처
// clip 종류: 'viewport' · 'panel'(머리 고정 영역 아래 본문 1220×658, scroll 요소를 위에 맞춤) · CSS/찾기 선택자(요소 자체, maxH 로 자름)
// 찾기 선택자: 'txt:<범위>|<글자>'(범위 안에서 글자로 시작하는 가장 작은 요소) · 'up:<선택자>|<조상>'(가장 가까운 조상) · 'lbl:<입력 id>'(입력 칸이 든 줄) · 'nth:<선택자>|<i>' · 일반 CSS
const {chromium}=require(process.env.MM_PW||'playwright');const fs=require('fs');const path=require('path');const {setup,server}=require('./serve');
const repo=path.resolve(process.argv[2]),out=path.resolve(process.argv[3]);fs.mkdirSync(out,{recursive:true});
const VW=1440,VH=900,DSF=1.25,PORT=8894;
const EX=JSON.parse(fs.readFileSync(path.join(repo,'manual/sample/manual_example_6rooms.rts'),'utf8'));
const HIDE="#rts-toast{display:none!important} *{animation:none!important;transition:none!important;caret-color:transparent!important}";
const NOFAB=".formula-fab{display:none!important}";
const NOBAR=".status-bar,.top-fixed-wrapper,.sum-bar-wrap{visibility:hidden!important}";   /* 요소 캡처(전체 쪽 기준)에 고정 머리 · 상태 막대가 겹치지 않게 */
const tab=t=>`showTab('${t}');${t==='tab-zoning'?'renderZoningAll();':''}${t==='tab-report'?'buildRtsReport();':''}`;
const SHOTS=[
 {id:'s01_overview',tab:'tab-project',clip:'viewport',fab:true,m:[['.hdr-btns','헤더 버튼'],['.nav-tabs .tab-bar-inner','작업 탭'],['.sum-bar','요약 스트립'],['.sidebar .sidebar-title','계산 단계 메뉴']]},
 {id:'s02_hdrbtns',tab:'tab-project',clip:'.hdr-btns',pad:6,bar:true,m:[['txt:.hdr-btns|💾','저장'],['txt:.hdr-btns|📂','불러오기'],['txt:.hdr-btns|🔄','전체 계산'],['txt:.hdr-btns|🖨️','A4 출력'],['txt:.hdr-btns|📄','PDF 저장'],['.hdr-btns .btn-uval','열관류율'],['.hdr-btns .btn-manual','매뉴얼']]},
 {id:'s03_project',tab:'tab-project',clip:'panel',m:[['lbl:p-name','프로젝트명'],['lbl:p-city','지역'],['lbl:p-lat','위도'],['lbl:p-cool-month','냉방 계산월'],['lbl:p-sf','안전율']]},
 {id:'s04_weather',tab:'tab-weather',clip:'panel',m:[['lbl:w-summer-db','냉방 DB'],['lbl:w-summer-wb','냉방 WB'],['lbl:w-dr','일교차'],['lbl:w-winter-db','난방 외기'],['lbl:w-indoor-cool','실내 냉방'],['lbl:p-ho','ho']]},
 {id:'s05_hourlytemp',tab:'tab-weather',clip:'up:#tbl-hourly-temp|div',pad:0,m:[]},
 {id:'s06_rooms',tab:'tab-room',clip:'#tab-room',m:[['txt:#tab-room|+ 실 추가','실 추가'],['txt:#tab-room|📥','가져오기'],['#tbl-rooms','실 목록']]},
 {id:'s07_modal_internal',tab:'tab-room',clip:'viewport',pre:"openRoomModal(0)",post:"closeRoomModal()",m:[['txt:#modal-room-body|안전율','실별 안전율'],['txt:#modal-room-body|RTS Zone','RTS Zone'],['txt:#modal-room-body|국소배기 용도','국소배기'],['txt:#modal-room-body|양압','양압'],['txt:#modal-room-body|환기(RA)','RA 없음'],['txt:#modal-room-body|조명→천장','조명→천장속']]},
 {id:'s08_modal_glass',tab:'tab-room',clip:'viewport',pre:"openRoomModal(3);_switchTab('glass');_mgAngToggle(0)",post:"closeRoomModal()",m:[['txt:#modal-room-body|+ 유리창','유리창 추가'],['txt:#modal-room-body|입사각별','θ']]},
 {id:'s09_modal_wall',tab:'tab-room',clip:'viewport',pre:"openRoomModal(3);_switchTab('wall')",post:"closeRoomModal()",m:[['txt:#modal-room-body|+ 외벽','외벽 추가'],['txt:#modal-room-body|+ 지붕','지붕 추가'],['txt:#modal-room-body|+ 바닥','바닥/지중']]},
 {id:'s10_import',tab:'tab-room',clip:'viewport',pre:"openRoomImport()",post:"document.getElementById('_ri-modal')?.remove()",m:[]},
 {id:'s17_validation',tab:'tab-result',clip:'viewport',pre:"void showValidationReport(null,{force:true})",post:"document.getElementById('_rts-val-modal')?.remove()",m:[]},
 {id:'s11_zoning',tab:'tab-zoning',clip:'panel',m:[['txt:#tab-zoning|+ 장비 추가','장비 추가']]},
 {id:'s12_equip',tab:'tab-zoning',pre:"calcEquipLoads()",clip:'#equip-result-wrap',m:[]},
 {id:'s13_external',tab:'tab-external',clip:'panel',m:[['#ext-rooms-note','합산 안내']]},
 {id:'s14_internal',tab:'tab-internal',clip:'#tab-internal',maxH:1000,m:[]},
 {id:'s15_rts',tab:'tab-rts',clip:'#tab-rts',m:[]},
 {id:'s16_result',tab:'tab-result',clip:'#tab-result',maxH:900,m:[['txt:#tab-result|📊 시각별','차트'],['txt:#tab-result|🔍','항목별 분석'],['#tbl-hourly-load','시각별 표']]},
 {id:'s18_ahu',tab:'tab-ahu',clip:'#tab-ahu',maxH:805,m:[['txt:#tab-ahu|🔄 AHU','AHU 계산'],['txt:#tab-ahu|대상 장비','대상 장비'],['txt:#tab-ahu|🧊 코일','코일·가습'],['nth:#tab-ahu table.ahu-kv|0','정압'],['txt:#tab-ahu button|전체','부분 보기']]},
 {id:'s18_1_load',tab:'tab-ahu',clip:'up:#ahu-load-body|.excel-wrap',m:[['nth:#ahu-load-body tr|2','머리행'],['nth:#ahu-load-body tr|3','Zone 블록']]},
 {id:'s18_2_air',tab:'tab-ahu',clip:'up:#ahu-air-body|.excel-wrap',m:[['txt:#ahu-air-body td|(Δt','급기량'],['txt:#ahu-air-body th|EA Volume','국소배기·양압'],['txt:#ahu-air-body th|RA','RA 없음']]},
 {id:'s18_3_sys',tab:'tab-ahu',clip:'#ahu-sys-body .ahu-sysblk',m:[['nth:#ahu-sys-body .ahu-sysblk *|0','계통 구성'],['nth:#ahu-sys-body svg|0','계통도'],['nth:#ahu-sys-body table|0','괄호']]},
 {id:'s18_4_sel',tab:'tab-ahu',clip:'#ahu-sel-body .ahu-card',maxH:1400,m:[['nth:#ahu-sel-body .ahu-card table.ahu-kv|1','AIR VOLUME'],['nth:#ahu-sel-body .ahu-card table.ahu-kv|2','코일·가습'],['nth:#ahu-sel-body .ahu-card table.ahu-sp|0','FAN'],['nth:#ahu-sel-body .ahu-card table.ahu-st|1','상태점'],['nth:#ahu-sel-body .ahu-card svg|0','선도']]},
 {id:'s19_building',tab:'tab-building',clip:'#tab-building',m:[]},
 {id:'s20_report',tab:'tab-report',clip:'viewport',m:[['#rp-status','조립 상태'],['#rts-report','A4 미리보기']]},
 {id:'s20_1_report_ahu',tab:'tab-report',clip:'up:txt:#rts-report .rp-sec-h|Ⅴ-4|.rp-sec',m:[]},
 {id:'s21_formula',tab:'tab-project',clip:'viewport',pre:"openFormulaModal()",post:"closeFormulaModal()",m:[]},
 {id:'s25_proj_menu',tab:'tab-project',fab:true,clip:'viewport',pre:"localStorage.setItem('MANMIN_PROJECT_V1',JSON.stringify({\"사업명\": \"만민 건축사 신사옥 신축공사\", \"작성자\": \"김만민 건축사\", \"연면적\": \"12800\", \"지상층\": \"15\", \"updated\": \"2026-11-08 10:00\", \"from\": \"열관류율\"}));document.querySelector('.mm-proj-btn').click()",post:"document.querySelectorAll('.mm-proj-menu').forEach(e=>e.remove())",m:[[".mm-proj-btn", "「🏢 건물개요」 단추(오른쪽 아래)"], [".mm-proj-menu button[data-a=\"save\"]", "저장 — 지금 값 담기"], [".mm-proj-menu button[data-a=\"load\"]", "불러오기"], [".mm-proj-menu button[data-a=\"exp\"]", "파일로 내보내기(.json)"], [".mm-proj-menu button[data-a=\"imp\"]", "파일 가져오기"]]},
 {id:'s26_proj_load',tab:'tab-project',clip:'.mm-proj-dlg',pre:"(()=>{const e=MMProject.fields('사업명')[0];if(e){const d=Object.getOwnPropertyDescriptor(HTMLInputElement.prototype,'value');d.set.call(e,'');e.dispatchEvent(new Event('input',{bubbles:true}));e.dispatchEvent(new Event('change',{bubbles:true}));}localStorage.setItem('MANMIN_PROJECT_V1',JSON.stringify({\"사업명\": \"만민 건축사 신사옥 신축공사\", \"작성자\": \"김만민 건축사\", \"연면적\": \"12800\", \"지상층\": \"15\", \"updated\": \"2026-11-08 10:00\", \"from\": \"열관류율\"}));MMProject.load();})()",post:"document.querySelectorAll('.mm-proj-back').forEach(e=>e.remove())",m:[[".mm-proj-dlg input[type=checkbox]", "체크한 항목만 채움(빈 칸은 체크된 채로)"], [".mm-proj-dlg .mm-proj-warn", "이미 입력된 칸 — 직접 체크해야 덮어씀"], [".mm-proj-dlg .mm-proj-ok", "채우기"]]},
];
(async()=>{
 const s=await server(repo,PORT);const b=await chromium.launch();const meta={};const errs=[];
 const ctx=await b.newContext({viewport:{width:VW,height:VH},deviceScaleFactor:DSF,serviceWorkers:'block',locale:'ko-KR'});await setup(ctx,repo);
 const pg=await ctx.newPage();pg.on('pageerror',e=>errs.push(e.message.slice(0,120)));pg.on('dialog',d=>d.dismiss());
 const load=async p=>{await p.goto(`http://127.0.0.1:${PORT}/index.html`);await p.waitForTimeout(2500);
   await p.evaluate(d=>{window.alert=()=>{};window.confirm=()=>true;restoreProjectData(d);},EX);await p.waitForTimeout(2500);
   await p.evaluate(()=>calcAll());await p.waitForTimeout(2500);await p.addStyleTag({content:HIDE});};
 await load(pg);await pg.addStyleTag({content:NOFAB});
 for(const S of SHOTS){
  await pg.evaluate(([c,css])=>{document.querySelectorAll('style').forEach(e=>{if(e.textContent===css)e.disabled=c;});},[!!S.fab,NOFAB]);
  try{await pg.evaluate(tab(S.tab));}catch(e){errs.push(S.id+' tab '+e.message.slice(0,80));}
  await pg.evaluate(()=>window.scrollTo(0,0));await pg.waitForTimeout(700);
  if(S.pre){try{await pg.evaluate(S.pre);}catch(e){errs.push(S.id+' pre '+e.message.slice(0,80));}await pg.waitForTimeout(1200);}
  const EL=!['viewport','panel'].includes(S.clip);let st=null;   /* 요소 캡처: 창을 1800 높이로 키워 같은 배치에서 재고 찍음(fullPage 는 높이를 바꿔 배치가 달라짐) */
  if(EL){await pg.setViewportSize({width:VW,height:1800});if(!S.bar)st=await pg.addStyleTag({content:NOBAR});await pg.waitForTimeout(600);}
  const info=await pg.evaluate(({S,VW,VH})=>{
   const vis=e=>e&&e.getClientRects().length>0&&getComputedStyle(e).visibility!=='hidden';
   const find=sel=>{
     if(sel.startsWith('up:')){const k=sel.lastIndexOf('|');const e=find(sel.slice(3,k));return e?e.closest(sel.slice(k+1)):null;}
     if(sel.startsWith('txt:')){const [sc,t]=sel.slice(4).split('|');const parts=sc.split(' ');const scope=document.querySelector(parts[0]);if(!scope)return null;const q=parts.slice(1).join(' ')||'*';
       const els=[...scope.querySelectorAll(q)].filter(e=>vis(e)&&e.textContent.trim().startsWith(t));return els.sort((a,b)=>a.textContent.length-b.textContent.length)[0]||null;}
     if(sel.startsWith('lbl:')){const i=document.getElementById(sel.slice(4));if(!i)return null;let e=i.parentElement;while(e&&!e.querySelector('label'))e=e.parentElement;return e?(e.querySelector('label')||e):null;}
     if(sel.startsWith('nth:')){const [q,i]=sel.slice(4).split('|');return [...document.querySelectorAll(q)].filter(vis)[+i]||null;}
     for(const s of sel.split(',')){const e=[...document.querySelectorAll(s)].find(vis);if(e)return e;}return null;};
   const abs=e=>{const r=e.getBoundingClientRect();return {x:r.left+scrollX,y:r.top+scrollY,w:r.width,h:r.height};};
   let clip;
   if(S.clip==='viewport'){clip={x:0,y:scrollY,width:VW,height:VH};}
   else if(S.clip==='panel'){const T=document.getElementById(S.tab);const top=document.querySelector('.top-fixed-wrapper').getBoundingClientRect().bottom+(document.querySelector('.sum-bar-wrap')?.getBoundingClientRect().height||0);
     const st=document.querySelector('.status-bar');const bot=st?st.getBoundingClientRect().top:VH;const tr=T.getBoundingClientRect();
     clip={x:tr.left+scrollX,y:scrollY+top,width:VW-tr.left,height:bot-top};}
   else{const el=find(S.clip);if(!el)return {err:'clip '+S.clip};el.scrollIntoView({block:'start'});const a=abs(el);if(a.h<1)return {err:'clip 크기 0 '+S.clip};const p=S.pad||0;clip={x:a.x-p,y:a.y-p,width:a.w+2*p,height:a.h+2*p};
     if(S.maxH&&clip.height>S.maxH)clip.height=S.maxH;}
   const marks=[];(S.m||[]).forEach(([sel,label],i)=>{const e=find(sel);if(!e){marks.push({n:i+1,label,miss:sel});return;}const a=abs(e);
     marks.push({n:i+1,label,x:+((a.x-clip.x)/clip.width*100).toFixed(2),y:+((a.y-clip.y)/clip.height*100).toFixed(2),w:+(a.w/clip.width*100).toFixed(2),h:+(a.h/clip.height*100).toFixed(2)});});
   return {clip,marks,sy:scrollY};},{S,VW,VH});
  if(info.err){errs.push(S.id+' '+info.err);if(EL){if(st)await st.evaluate(e=>e.remove());await pg.setViewportSize({width:VW,height:VH});}if(S.post){try{await pg.evaluate(S.post);}catch(e){}}continue;}
  const c=info.clip;const cl={x:Math.max(0,c.x),y:Math.max(0,c.y),width:Math.min(c.width,VW-Math.max(0,c.x)),height:c.height};
  if(S.clip==='viewport'||S.clip==='panel'){await pg.screenshot({path:path.join(out,S.id+'.png'),clip:{x:cl.x,y:cl.y-info.sy,width:cl.width,height:Math.min(cl.height,VH)}});}
  else{await pg.screenshot({path:path.join(out,S.id+'.png'),clip:{x:cl.x,y:cl.y-info.sy,width:cl.width,height:Math.min(cl.height,1800-(cl.y-info.sy))}});if(st)await st.evaluate(e=>e.remove());await pg.setViewportSize({width:VW,height:VH});await pg.waitForTimeout(300);}
  meta[S.id]={w:Math.round(cl.width),h:Math.round(cl.height),marks:info.marks};
  info.marks.filter(m=>m.miss).forEach(m=>errs.push(S.id+' 배지 없음 '+m.miss));
  if(S.post){try{await pg.evaluate(S.post);}catch(e){}}
 }
 // 휴대전화 2장(390×844 · DSF 2)
 const mctx=await b.newContext({viewport:{width:390,height:844},deviceScaleFactor:2,serviceWorkers:'block',isMobile:true,hasTouch:true,locale:'ko-KR'});await setup(mctx,repo);
 const mp=await mctx.newPage();mp.on('dialog',d=>d.dismiss());await load(mp);await mp.addStyleTag({content:NOFAB});
 for(const [id,t] of [['s23_mobile_result','tab-result'],['s24_mobile_room','tab-room']]){
  await mp.evaluate(tab(t));await mp.waitForTimeout(600);
  await mp.evaluate(t=>{const el=document.getElementById(t);window.scrollTo(0,el.getBoundingClientRect().top+scrollY-8);},t);await mp.waitForTimeout(500);
  await mp.screenshot({path:path.join(out,id+'.png')});meta[id]={w:390,h:844,marks:[]};
 }
 fs.writeFileSync(path.join(out,'_marks.json'),JSON.stringify(meta,null,1));
 console.log(JSON.stringify({shots:Object.keys(meta).length,errs:errs.slice(0,30)},null,1));
 await b.close();s.close();
})();
