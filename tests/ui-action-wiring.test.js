'use strict';
(function(){
var fs=require('fs'),path=require('path');
var out=global.BRUNO_TEST_RESULTS||{total:0,pass:0,fail:0,results:[]};
function test(name,fn){out.total++;try{fn();out.pass++;out.results.push({name:name,ok:true})}catch(e){out.fail++;out.results.push({name:name,ok:false,error:e.message})}}
function ok(v,msg){if(!v)throw new Error(msg||'assertion failed')}
var root=path.join(__dirname,'..');
var htmlFiles=['index.html','electrical-tools.html'];
var html=htmlFiles.map(function(f){return fs.readFileSync(path.join(root,f),'utf8')}).join('\n');
var js=fs.readdirSync(root).filter(function(f){return /\.js$/.test(f)}).map(function(f){return fs.readFileSync(path.join(root,f),'utf8')}).join('\n');
var all=html+'\n'+js;
function idsFor(tagRe){var ids=[],m;while((m=tagRe.exec(html))){var im=m[0].match(/\bid=["']([^"']+)["']/i);if(im)ids.push(im[1]);}return ids;}
var actionIds=idsFor(/<(?:button|input)\b[^>]*(?:type=["'](?:button|submit|file)["'])?[^>]*>/gi).filter(function(id){return id;});
function count(s,needle){var n=0,p=0;while((p=s.indexOf(needle,p))>=0){n++;p+=needle.length;}return n;}
test('Stage 6 base actionable IDs are unique in declared HTML',function(){var seen={};actionIds.forEach(function(id){ok(!seen[id],'duplicate actionable id '+id);seen[id]=true;});ok(actionIds.length>25,'unexpectedly small actionable inventory: '+actionIds.length)});
test('Stage 6 base actionable IDs have a runtime reference beyond declaration',function(){var orphan=[];actionIds.forEach(function(id){if(count(all,id)<2)orphan.push(id);});ok(!orphan.length,'actionable IDs without runtime reference: '+orphan.join(', '))});
test('Stage 6 critical destructive/output actions remain referenced by browser evidence',function(){var e2e=fs.readdirSync(path.join(__dirname,'e2e')).filter(function(f){return /\.spec\.js$/.test(f)}).map(function(f){return fs.readFileSync(path.join(__dirname,'e2e',f),'utf8')}).join('\n');['btn-export','btn-import','btn-export-app','btn-import-app','qa-approve','qa-print-fixed','et-save','et-calculate','et-apply-materials','rl-save-ux-btn','rl-apply-job-btn','be-download-calc'].forEach(function(id){ok(e2e.indexOf('#'+id)>=0||e2e.indexOf(id)>=0,'missing browser evidence reference for '+id)})});
test('Stage 6 navigation/action shells retain explicit current runtime bridges',function(){['electric-app-navigation.js','electric-workspace.js','electric-compact-header.js','electric-customer-documents.js','electrical-tools-shell.js'].forEach(function(f){ok(fs.existsSync(path.join(root,f)),f+' missing')});ok(js.indexOf('addEventListener')>=0,'no event wiring found');ok(all.indexOf('data-group')>=0,'canonical navigation group wiring missing')});
global.BRUNO_TEST_RESULTS=out;
})();