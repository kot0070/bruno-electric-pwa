/* Bruno Electric — Texas customer-document compliance guard.
 * Uses current 16 TAC §73.51(f) notice text and requires a complete printable
 * contractor identity before customer-facing Quote/Proposal or Invoice print.
 */
(function(){
'use strict';
if(window.BrunoDocumentCompliance)return;

var TDLR_NOTICE='Regulated by The Texas Department of Licensing and Regulation, P.O. Box 12157, Austin, Texas 78711, 1-800-803-9202, 512-463-6599; website: www.tdlr.texas.gov';
var REQUIRED=[
  {key:'name',label:'contractor name'},
  {key:'address1',label:'street address'},
  {key:'city',label:'city'},
  {key:'state',label:'state'},
  {key:'zip',label:'ZIP code'},
  {key:'phone',label:'phone number'},
  {key:'license',label:'contractor license number'}
];

function activeCompany(){
  try{if(typeof window.getActiveProfile==='function'){var p=window.getActiveProfile();if(p)return p}}catch(e){}
  try{if(window.state&&window.state.company)return window.state.company}catch(e){}
  return {};
}
function value(c,key){
  if(key==='name')return String(c.legalName||c.name||'').trim();
  if(key==='address1')return String(c.address1||c.address||'').trim();
  if(key==='city')return String(c.city||'').trim();
  if(key==='state')return String(c.state||'').trim();
  if(key==='zip')return String(c.zip||'').trim();
  if(key==='phone')return String(c.phone||'').trim();
  if(key==='license')return String(c.license||c.tecl||'').trim();
  return '';
}
function missingFields(company){
  var c=company||activeCompany();
  return REQUIRED.filter(function(r){return !value(c,r.key)}).map(function(r){return r.label});
}
function complianceStatus(company){
  var missing=missingFields(company);
  return {ok:missing.length===0,missing:missing,notice:TDLR_NOTICE};
}
function ensureStyle(){
  if(document.getElementById('be-document-compliance-style'))return;
  var s=document.createElement('style');s.id='be-document-compliance-style';s.textContent=
    '.be-tdlr-notice{margin-top:14px;padding-top:9px;border-top:1px solid #999;font-size:9pt;line-height:1.35;color:#222}' +
    '.be-doc-compliance{margin-top:.75rem;padding:.65rem .8rem;border:1px solid var(--border);border-radius:8px;font-size:.82rem;line-height:1.45}' +
    '.be-doc-compliance.ok{border-color:rgba(61,214,140,.45);color:var(--success)}' +
    '.be-doc-compliance.warn{border-color:rgba(240,113,120,.55);color:#ffb4b8}';document.head.appendChild(s);
}
function preparePrintDocs(){
  ensureStyle();
  ['print-quote','print-tm'].forEach(function(id){
    var doc=document.getElementById(id);if(!doc)return;
    var old=doc.querySelector('.be-tdlr-notice');if(old)old.remove();
    var notice=document.createElement('div');notice.className='be-tdlr-notice';notice.setAttribute('data-tdlr-notice','1');notice.textContent=TDLR_NOTICE;doc.appendChild(notice);
  });
}
function statusHost(){
  var block=document.getElementById('co-block');
  if(!block)return null;
  var host=document.getElementById('be-document-compliance-status');
  if(!host){host=document.createElement('div');host.id='be-document-compliance-status';block.insertAdjacentElement('afterend',host)}
  return host;
}
function renderStatus(){
  ensureStyle();var host=statusHost();if(!host)return;
  var st=complianceStatus();host.className='be-doc-compliance '+(st.ok?'ok':'warn');
  host.textContent=st.ok?'Customer documents: required Texas contractor identity is complete. TDLR notice will be added to Quote/Proposal and Invoice PDF prints.':'Customer document compliance incomplete: add '+st.missing.join(', ')+' before printing.';
}
function blockNoncompliantPrint(e){
  var target=e.target&&e.target.closest?e.target.closest('#btn-print-quote,#btn-print-quote-2,#btn-print-tm,#btn-print-tm-2'):null;
  if(!target)return;
  var st=complianceStatus();
  if(!st.ok){
    e.preventDefault();e.stopPropagation();e.stopImmediatePropagation();renderStatus();
    var msg='Cannot print a customer document yet. Missing required contractor information: '+st.missing.join(', ')+'. Open Company and complete the active letterhead.';
    try{if(typeof window.toast==='function')window.toast(msg);else window.alert(msg)}catch(x){}
    return;
  }
  setTimeout(preparePrintDocs,0);
}

document.addEventListener('click',blockNoncompliantPrint,true);
window.addEventListener('beforeprint',preparePrintDocs);
document.addEventListener('input',function(e){if(e.target&&/^co-(legal|addr1|city|state|zip|phone|license)$/.test(e.target.id||''))setTimeout(renderStatus,0)});
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',function(){setTimeout(renderStatus,120)},{once:true});else setTimeout(renderStatus,120);

window.BrunoDocumentCompliance={TDLR_NOTICE:TDLR_NOTICE,missingFields:missingFields,complianceStatus:complianceStatus,preparePrintDocs:preparePrintDocs};
})();
