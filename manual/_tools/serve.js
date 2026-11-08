// 공용: 저장소를 로컬 서버(127.0.0.1)로 띄움 — 외부 CDN(cdnjs · jsdelivr · 구글폰트)은 실제 주소 그대로 통과
//   (EPI serve.js 의 server 그대로, vendor 대체 없음 — Windows 작업 PC 에서 2026-11-08 처음 작성)
const http=require('http'),fs=require('fs'),path=require('path');
async function setup(ctx,repo){}
function server(repo,port){return new Promise(res=>{const s=http.createServer((q,w)=>{let p=decodeURIComponent(q.url.split('?')[0]);if(p.endsWith('/'))p+='index.html';
 fs.readFile(path.join(repo,p),(e,d)=>{if(e){w.writeHead(404);w.end();return;}const ext=path.extname(p);const ct={'.html':'text/html; charset=utf-8','.js':'application/javascript','.css':'text/css','.json':'application/json','.webp':'image/webp','.png':'image/png','.woff2':'font/woff2','.pdf':'application/pdf'}[ext]||'application/octet-stream';w.writeHead(200,{'Content-Type':ct});w.end(d);});});s.listen(port,()=>res(s));});}
module.exports={setup,server};
