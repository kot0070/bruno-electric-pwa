'use strict';
const fs=require('fs');
const path=require('path');
const file=path.join(__dirname,'..','index.html');
let src=fs.readFileSync(file,'utf8');
const marker='/* Bruno Electric prepaint shell guard — keep legacy header and native disabled fields dark before deferred JS loads. */';
if(!src.includes(marker)){
  const needle='<style>\n/* Bruno Electric Estimating — © 2026 Bruno Electric Services LLC. All rights reserved. */';
  if(!src.includes(needle))throw new Error('index style insertion point not found');
  const css=`<style>\n${marker}\nhtml{color-scheme:dark}\n.header-actions:not([data-be-compact="1"]){visibility:hidden}\nselect:disabled,input:disabled,textarea:disabled,input[readonly],textarea[readonly]{background-color:var(--bg-input,#0d1218)!important;color:var(--text,#e8eef6)!important;border-color:var(--border,#2e3a4a)!important;opacity:1!important;-webkit-text-fill-color:var(--text,#e8eef6)!important}\n.letterhead-strip select,.letterhead-strip select:disabled,.letterhead-strip select[aria-disabled="true"]{background-color:var(--bg-input,#0d1218)!important;color:var(--text,#e8eef6)!important;border-color:var(--border,#2e3a4a)!important;opacity:1!important;-webkit-text-fill-color:var(--text,#e8eef6)!important;color-scheme:dark}\n/* Bruno Electric Estimating — © 2026 Bruno Electric Services LLC. All rights reserved. */`;
  src=src.replace(needle,css);
  fs.writeFileSync(file,src);
  console.log('Patched index.html prepaint shell guard.');
}else console.log('Prepaint shell guard already present.');

const swFile=path.join(__dirname,'..','sw.js');
let sw=fs.readFileSync(swFile,'utf8');
const old='Refresh marker 2026-09-17:';
const next='Refresh marker 2026-09-17-prepaint:';
if(sw.includes(old)&&!sw.includes(next)){
  sw=sw.replace(old,next);
  fs.writeFileSync(swFile,sw);
  console.log('Refreshed service-worker bytes without changing v70 cache identity.');
}
