/* Bruno Electric — Electrical Tasks Stage 7 advanced-template UX adapter. */
(function(root){
'use strict';
var API=root.BrunoElectricalTasks,A=root.BrunoElectricalTaskAdvanced,S2=root.BrunoElectricalTasksStage2UI,S4=root.BrunoElectricalTasksStage4UI;
if(!API||!A||!S2||!S4)return;
function el(id){return document.getElementById(id)}
function esc(s){return String(s==null?'':s).replace(/[&<>"']/g,function(c){return({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot',"'":'&#39;'})[c]})}
function currentType(){var n=el('et-type');return n?n.value:'FEEDER_PANEL_RUN'}
function enabled(id){return API.types.some(function(x){return x.id===id&&x.enabled})}
function setStatus(msg,bad){var n=el('et-status');if(n){n.textContent=msg;n.style.borderColor=bad?'#f07178':'var(--border)'}}
function decorate(){var t=currentType(),b=el('et-calculate'),note=el('et-stage7-note');if(b)b.textContent=t==='BRANCH_CIRCUIT_RUN'?'Calculate Branch Circuit':'Calculate Feeder';if(note){note.style.display=t==='BRANCH_CIRCUIT_RUN'?'block':'none';note.innerHTML='<b>Branch Circuit Run:</b> uses the same audited ampacity, voltage-drop, raceway and EGC engines from explicit inputs. It does not infer branch-load rules, OCPD rules, equipment rules, or special-occupancy requirements.'}}
function install(){var sel=el('et-type'),calc=el('et-calculate'),shell=document.querySelector('#tool-tasks .et-shell');if(!sel||!calc||!shell){setTimeout(install,80);return}if(el('et-stage7-note'))return;var note=document.createElement('div');note.id='et-stage7-note';note.className='et-note';note.style.marginTop='10px';note.style.display='none';var adv=document.querySelector('#tool-tasks .et-advanced');if(adv&&adv.parentNode)adv.parentNode.insertBefore(note,adv.nextSibling);else shell.appendChild(note);
 sel.onchange=function(){var t=currentType();if(!enabled(t)){sel.value='FEEDER_PANEL_RUN';setStatus('That task template is not enabled in the current audited stage.',true)}else{setStatus(t==='BRANCH_CIRCUIT_RUN'?'Branch Circuit Run selected. Enter explicit design facts; unsupported compliance facts remain unresolved.':'Feeder / Panel Run selected.',false)}decorate()};
 calc.addEventListener('click',function(ev){if(currentType()!=='BRANCH_CIRCUIT_RUN')return;ev.preventDefault();ev.stopImmediatePropagation();try{var input=S2.formInputs(),g=S4.groundingInputs(),r=A.calculate('BRANCH_CIRCUIT_RUN',input,g);S4.render(r);setStatus('Branch Circuit calculation completed using the shared deterministic engine. Save remains separate from Apply.',r.status!=='PASS')}catch(e){setStatus(e.message,true)}},true);
 decorate()}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install,{once:true});else install();
root.BrunoElectricalTasksStage7UI=Object.freeze({install:install,decorate:decorate,currentType:currentType,version:'electrical-tasks-stage7-ui-v1'});
})(typeof window!=='undefined'?window:globalThis);
