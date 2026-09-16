'use strict';
const http = require('http');
const fs = require('fs');
const path = require('path');
const ROOT = path.resolve(__dirname, '..', '..');
const PORT = Number(process.env.PORT || 4173);
const TYPES = {'.html':'text/html; charset=utf-8','.js':'application/javascript; charset=utf-8','.json':'application/json; charset=utf-8','.webmanifest':'application/manifest+json; charset=utf-8','.css':'text/css; charset=utf-8','.png':'image/png','.svg':'image/svg+xml'};
function safePath(urlPath){
  const clean = decodeURIComponent(String(urlPath||'/').split('?')[0]).replace(/\\/g,'/');
  const rel = clean === '/' ? 'index.html' : clean.replace(/^\/+/, '');
  const resolved = path.resolve(ROOT, rel);
  return resolved === ROOT || resolved.startsWith(ROOT + path.sep) ? resolved : null;
}
const server = http.createServer((req,res)=>{
  const file = safePath(req.url);
  if(!file){res.writeHead(403);res.end('Forbidden');return;}
  fs.stat(file,(err,stat)=>{
    let target=file;
    if(!err&&stat.isDirectory())target=path.join(file,'index.html');
    fs.readFile(target,(readErr,data)=>{
      if(readErr){res.writeHead(readErr.code==='ENOENT'?404:500,{'Cache-Control':'no-store'});res.end('Not found');return;}
      res.writeHead(200,{'Content-Type':TYPES[path.extname(target).toLowerCase()]||'application/octet-stream','Cache-Control':'no-store','Service-Worker-Allowed':'/'});
      res.end(data);
    });
  });
});
server.listen(PORT,'127.0.0.1',()=>console.log(`Bruno E2E static server http://127.0.0.1:${PORT}`));
for(const sig of ['SIGTERM','SIGINT'])process.on(sig,()=>server.close(()=>process.exit(0)));
