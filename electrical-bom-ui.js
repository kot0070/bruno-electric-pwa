/* Phase 1 BOM UI bridge. Keeps calculator engine/UI decoupled from persistence. */
(function(){
'use strict';
var B=window.BrunoElectricBOM,R=window.BrunoElectricalRules;
if(!B)return;
function byId(x){return document.getElementById(x)}
function ensureButton(hostId,id,label,handler){var h=byId(hostId);if(!h||byId(id))return;var wrap=document.createElement('div');wrap.className='actions';wrap.style.marginTop='10px';var b=document.createElement('button');b.id=id;b.type='button';b.textContent=label;b.onclick=handler;wrap.appendChild(b);h.appendChild(wrap)}
function notify(r){alert('Job Materials updated: '+r.added+' generated row(s). Manual rows preserved. '+r.unresolved+' row(s) need price/catalog review. Reload Job workspace to see changes.')}
function ampBom(){var size=byId('a-size').value,mat=byId('a-mat').value,load=Number(byId('a-load').value)||0;var item=size+' AWG '+(mat==='Al'?'Al':'Cu')+' THHN/THWN-2';var feet=prompt('Estimated conductor length (ft). Enter total conductor footage, not one-way distance.','100');if(feet===null)return;var qty=Number(feet);if(!(qty>0)){alert('Enter a positive footage.');return}notify(B.replaceGenerated('ampacity-phase1',[{qty:qty,unit:'FT',item:item,status:'Required',version:'1',codeSource:R.REFERENCES.ampacity.section},{qty:1,unit:'EA',item:'Circuit OCPD / breaker — size must be field/code verified',status:'Field Verify',version:'1',codeSource:R.REFERENCES.ampacity.section}]))}
function conduitBom(){var ts=byId('c-ts').value,type=byId('c-r').value,feet=prompt('Estimated raceway length (ft).','100');if(feet===null)return;var qty=Number(feet);if(!(qty>0)){alert('Enter a positive footage.');return}var name=ts+' in '+(type==='PVC40'?'PVC Schedule 40':'EMT');notify(B.replaceGenerated('conduit-fill-phase1',[{qty:qty,unit:'FT',item:name,status:'Required',version:'1',codeSource:R.REFERENCES.conduitFill.section},{qty:Math.ceil(qty/10),unit:'EA',item:ts+' in '+(type==='PVC40'?'PVC':'EMT')+' coupling',status:'Estimating Assumption',version:'1'},{qty:2,unit:'EA',item:ts+' in '+(type==='PVC40'?'PVC':'EMT')+' connector',status:'Estimating Assumption',version:'1'}]))}
function install(){ensureButton('out-amp','bom-amp','Add conductor BOM to Job Materials',ampBom);ensureButton('out-cf','bom-cf','Add raceway BOM to Job Materials',conduitBom)}
window.addEventListener('load',function(){setTimeout(install,0)});document.addEventListener('click',function(e){if(e.target&&(/^run-(amp|cf)$/).test(e.target.id))setTimeout(install,0)});
})();
