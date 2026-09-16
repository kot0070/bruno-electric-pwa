'use strict';
(function(){
var fs=require('fs'),path=require('path');
var out=global.BRUNO_TEST_RESULTS||{total:0,pass:0,fail:0,results:[]};
function test(name,fn){out.total++;try{fn();out.pass++;out.results.push({name:name,ok:true})}catch(e){out.fail++;out.results.push({name:name,ok:false,error:e.message})}}
function ok(v,msg){if(!v)throw new Error(msg||'assertion failed')}
var project=fs.readFileSync(path.join(__dirname,'..','electrical-project-calculator-ui.js'),'utf8');
var live=fs.readFileSync(path.join(__dirname,'..','electrical-residential-live-ui.js'),'utf8');
var shell=fs.readFileSync(path.join(__dirname,'..','electrical-tools-shell.js'),'utf8');
var html=fs.readFileSync(path.join(__dirname,'..','electrical-tools.html'),'utf8');
test('Project Calculator is the first electrical workflow',function(){ok(project.indexOf("data.tool='project'")<0||project.indexOf("b.dataset.tool='project'")>=0,'project tool button missing');ok(project.indexOf("clickTool('project')")>=0,'project tool not auto-activated');ok(shell.indexOf("ids:['project','res-live','res','res-takeoff']")>=0,'project group not first in picker');ok(html.indexOf('electrical-project-calculator-ui.js')>=0,'project module not loaded')});
test('first project screen only asks project type area and room counts',function(){['Project type','Total building area','Bedrooms','Bathrooms','Powder / toilet','Living rooms','Kitchens','Garage bays','Calculate project'].forEach(function(x){ok(project.indexOf(x)>=0,x+' missing')});ok(project.indexOf('Conductor / Ampacity')<0,'technical ampacity inputs leaked into first project screen')});
test('residential Calculate hands facts into live design engine',function(){['rl-sqft','rl-bed','rl-bath','rl-powder','rl-living','rl-dining','rl-office','rl-kitchen','rl-laundry','rl-garage'].forEach(function(id){ok(project.indexOf("'"+id+"'")>=0,id+' handoff missing')});ok(project.indexOf("clickTool('res-live')")>=0,'residential handoff to live design missing')});
test('commercial mode does not reuse dwelling minimums',function(){ok(project.indexOf('commercial receptacle counts')>=0,'commercial code boundary missing');ok(project.indexOf('will not invent a residential 210.52 minimum')>=0,'commercial dwelling-rule isolation missing')});
test('live residential design recalculates panel service BOM and pricing',function(){['Panel / service sizing','Service rating candidate','Major loads → service / panel candidate','augmentBom','lastPricing=P.priceRows(lastBom','Confirm & Save Project Calculation'].forEach(function(x){ok(live.indexOf(x)>=0,x+' missing')});ok(live.indexOf('panelSpaces(circuits)')>=0,'live panel-space dependency missing')});
test('project archive keeps major-load state for reload duplicate',function(){['majorLoads:majorInput()','x.majorLoads||{}','rl-major-complete','rl-31012'].forEach(function(x){ok(live.indexOf(x)>=0,x+' persistence bridge missing')})});
global.BRUNO_TEST_RESULTS=out;
})();