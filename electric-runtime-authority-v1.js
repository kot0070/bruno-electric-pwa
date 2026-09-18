/* Bruno Electric — runtime authority v1.
 * Single user-facing authority for Journal settings/metrics, invoice rows,
 * legacy editor suppression, and browser/Android Back behavior.
 */
(function(){
'use strict';
if(/electrical-tools\.html$/i.test(location.pathname))return;
var DATA_KEY='bruno-electric-dispatch-journal-v2';
var SETTINGS_KEY='bruno-electric-dispatch-settings-v2';
var activeInvoiceId=null,modalHistoryActive=false,pending=false,observer=null;
function q(s,r){return (r||document).querySelector(s)}
function qa(s,r){return Array.prototype.slice.call((r||document).querySelectorAll(s))}
function n(v,d){var x=Number(v);return Number.isFinite(x)?x:(d||0)}
function money(v){return '$'+n(v).toLocaleString(undefined,{minimumFractionDigits:2,maximumFractionDigits:2})}
function read(k,f){try{var x=JSON.parse(localStorage.getItem(k)||'null');return x&&typeof x==='object'?x:f}catch(e){return f}}
function write(k,v){localStorage.setItem(k,JSON.stringify(v))}
function data(){var d=read(DATA_KEY,{calls:[],helpers:[]});d.calls=Array.isArray(d.calls)?d.calls:[];d.helpers=Array.isArray(d.helpers)?d.helpers:[];return d}
function settings(){return Object.assign({serviceHourlyRate:175,commercialTaxPct:8.25,businessReservePct:15,taxEnabled:true,ownerTaxPct:15,stateTaxPct:0,localTaxPct:0,invoiceCompanyName:'Bruno Electric Services LLC',invoiceAddress:'',invoicePhone:'',invoiceEmail:'',invoiceLicense:'TECL 28137',invoiceTerms:'Due upon receipt'},read(SETTINGS_KEY,{}))}
function reservePct(s){if(s.businessReservePct!=null)return Math.max(0,n(s.businessReservePct,15));var legacy=Math.max(0,n(s.ownerTaxPct,0)+n(s.stateTaxPct,0)+n(s.localTaxPct,0));return legacy>0?legacy:15}
function tool(c){return c&&c.toolFeeEnabled?Math.max(0,n(c.price))*Math.max(0,n(c.toolFeePct))/100:0}
function subtotal(c){return Math.max(0,n(c&&c.price))+tool(c)}
function materialTotal(c){if(!c)return 0;if(c.includedMaterialsMode==='itemized'&&Array.isArray(c.includedMaterialItems)&&c.includedMaterialItems.length)return c.includedMaterialItems.reduce(function(a,x){return a+Math.max(0,n(x.qty))*Math.max(0,n(x.unitPrice))},0);return Math.max(0,n(c.includedMaterialsTotal))}
function customerTaxPct(c,s){return c&&c.callType==='commercial_repair'?Math.max(0,n(s.commercialTaxPct,8.25)):0}
function findCall(id){return data().calls.find(function(c){return c.id===id})||null}
function syncCallTaxSnapshots(s){var d=data(),changed=false,rate=Math.max(0,n(s.commercialTaxPct,8.25));d.calls.forEach(function(c){var next=c.callType==='commercial_repair'?rate:0;if(n(c.taxPct,-1)!==next){c.taxPct=next;changed=true}var applied=c.status==='completed'?next:null;if(c.taxPctApplied!==applied){c.taxPctApplied=applied;changed=true}if(c.customerSalesTaxPctApplied!==applied){c.customerSalesTaxPctApplied=applied;changed=true}if(c.invoiceChargeSalesTax!==(c.callType==='commercial_repair')){c.invoiceChargeSalesTax=(c.callType==='commercial_repair');changed=true}});if(changed)write(DATA_KEY,d);return changed}
function callFromPreview(){if(activeInvoiceId){var c=findCall(activeInvoiceId);if(c)return c}var t=q('#be-doc-preview-paper .be-doc-title span');if(!t)return null;var txt=String(t.textContent||'');return data().calls.find(function(c){return 'SC-'+String(c.date||'').replace(/-/g,'')+'-'+String(c.id||'CALL').slice(-6).toUpperCase()===txt})||null}
function rowByLabel(label,root){return qa('.be-doc-row',root||document).find(function(r){var a=r.querySelector('span');return a&&String(a.textContent||'').trim().indexOf(label)===0})}
function hide(row,on){if(!row)return;row.style.display=on?'none':'';row.setAttribute('aria-hidden',on?'true':'false')}
function patchPreview(){var host=q('#be-doc-preview');if(!host||host.hidden||String((q('#be-doc-preview-heading',host)||{}).textContent||'')!=='Service invoice preview')return;var c=callFromPreview(),paper=q('#be-doc-preview-paper',host);if(!c||!paper)return;var s=settings(),mats=materialTotal(c),toolAmt=tool(c),base=subtotal(c),pct=customerTaxPct(c,s),tx=base*pct/100,total=base+tx;
 var mat=rowByLabel('Included materials reference',paper),toolRow=rowByLabel('Tool / consumables',paper),tax=rowByLabel('Sales tax',paper),amount=rowByLabel('Amount due',paper),sub=rowByLabel('Subtotal',paper);
 hide(mat,!(mats>0&&c.invoiceShowMaterials===true));qa('.be-doc-materials',paper).forEach(function(x){hide(x,!(mats>0&&c.invoiceShowMaterials===true))});hide(toolRow,toolAmt<=0);
 if(tax){hide(tax,pct<=0);if(pct>0){var bits=tax.querySelectorAll('span,b');if(bits[0])bits[0].textContent='Sales tax · '+pct.toFixed(2)+'%';if(bits[1])bits[1].textContent=money(tx)}}
 if(sub){var sb=sub.querySelector('b');if(sb)sb.textContent=money(base)}if(amount){var ab=amount.querySelector('b');if(ab)ab.textContent=money(total)}
}
function ensureSettingsAuthority(){var body=q('#dj-settings-body'),save=q('#djs-customer-save');if(!body||!save)return;var s=settings(),form=q('#djs-service-rate')&&q('#djs-service-rate').closest('.dj-form');if(!form)return;
 var reserve=q('#djs-business-reserve');if(!reserve){var field=document.createElement('div');field.className='field';field.innerHTML='<label>Business tax reserve %</label><input id="djs-business-reserve" type="number" min="0" max="100" step="0.01" value="'+reservePct(s)+'"><small style="display:block;color:var(--text-muted);margin-top:.25rem">Internal business reserve. Never added to the customer invoice.</small>';var commercial=q('#djs-commercial-tax');form.insertBefore(field,commercial&&commercial.closest('.field')||form.children[1]||null);reserve=q('#djs-business-reserve')}
 if(!save.dataset.atomicAuthority){save.dataset.atomicAuthority='1';save.addEventListener('click',function(ev){
   ev.preventDefault();ev.stopImmediatePropagation();
   var x=settings();
   x.serviceHourlyRate=Math.max(0,n((q('#djs-service-rate')||{}).value,175));
   x.businessReservePct=Math.max(0,n((q('#djs-business-reserve')||{}).value,15));
   x.taxEnabled=true;x.ownerTaxPct=x.businessReservePct;x.stateTaxPct=0;x.localTaxPct=0;
   x.commercialTaxPct=Math.max(0,n((q('#djs-commercial-tax')||{}).value,8.25));
   x.invoiceCompanyName=String((q('#djs-company')||{}).value||'').trim()||'Bruno Electric Services LLC';
   x.invoiceAddress=String((q('#djs-address')||{}).value||'').trim();x.invoicePhone=String((q('#djs-phone')||{}).value||'').trim();
   x.invoiceLicense=String((q('#djs-license')||{}).value||'').trim()||'TECL 28137';x.invoiceEmail=String((q('#djs-email')||{}).value||'').trim();x.invoiceTerms=String((q('#djs-terms')||{}).value||'').trim()||'Due upon receipt';
   write(SETTINGS_KEY,x);syncCallTaxSnapshots(x);window.dispatchEvent(new CustomEvent('bruno:dispatch-changed'));schedule();alert('Tax & journal settings saved.');
 },true)}
}
function patchLegacyEditor(){var e=q('#dj-call-editor.open');if(!e)return;var tax=q('#djc-tax',e);if(tax&&tax.closest('.field'))tax.closest('.field').style.display='none';qa('.field',e).forEach(function(f){if(/tax\s*%\s*override/i.test(String((q('label',f)||{}).textContent||'')))f.style.display='none'})}
function currentPeriodIds(d){var ids={};if(window.BrunoDispatchJournalV2&&q('#dj-date')&&q('#dj-mode')){var p=window.BrunoDispatchJournalV2.summary(d,settings(),q('#dj-date').value,q('#dj-mode').value);(p.calls||[]).forEach(function(c){ids[c.id]=true});return{ids:ids,period:p}}var date=(q('#dj-date')||{}).value;d.calls.forEach(function(c){if(!date||c.date===date)ids[c.id]=true});return{ids:ids,period:null}}
function patchMetrics(){var panel=q('#panel-dispatch'),metrics=panel&&qa('.dj-metric',panel);if(!metrics||metrics.length<4)return;var d=data(),s=settings(),p=currentPeriodIds(d),gross=0;(d.calls||[]).forEach(function(c){if(p.ids[c.id]&&c.status==='completed')gross+=subtotal(c)});var helper=p.period?Math.max(0,n(p.period.helperGross)):0,reserve=gross*reservePct(s)/100,net=gross-reserve-helper,rows=[['Gross earned',money(gross)],['Tax reserve','-'+money(reserve)],['Helpers gross','-'+money(helper)],['Business net',money(net)]];rows.forEach(function(r,i){var k=q('.k',metrics[i]),v=q('.v',metrics[i]);if(k)k.textContent=r[0];if(v)v.textContent=r[1]})}
function patchMiniInvoices(){var d=data(),s=settings();qa('.dj-invoice').forEach(function(inv){var id=String(inv.id||'').replace(/^dj-invoice-/,''),c=d.calls.find(function(x){return x.id===id});if(!c)return;qa('.dj-invoice-row',inv).forEach(function(r){var label=String((r.firstElementChild||{}).textContent||'').trim(),val=r.lastElementChild;if(/^Materials$/i.test(label))hide(r,materialTotal(c)<=0);if(/^Tool \/ consumables$/i.test(label))hide(r,tool(c)<=0);if(/^Tax reserve/i.test(label)){r.style.display='';if(r.firstElementChild)r.firstElementChild.textContent='Tax reserve · '+reservePct(s).toFixed(2)+'%';if(val)val.textContent='-'+money(subtotal(c)*reservePct(s)/100)}})})}
function previewVisible(){var h=q('#be-doc-preview');return !!(h&&!h.hidden)}
function closePreviewDom(){var h=q('#be-doc-preview');if(h&&!h.hidden){h.hidden=true;document.body.classList.remove('be-doc-preview-open','be-doc-print')}}
function syncPreviewHistory(){if(previewVisible()&&!modalHistoryActive){try{history.pushState(Object.assign({},history.state||{},{beDocPreview:true}),'',location.href);modalHistoryActive=true}catch(e){}}else if(!previewVisible())modalHistoryActive=false}
window.addEventListener('popstate',function(){if(previewVisible()){closePreviewDom();modalHistoryActive=false;schedule()}});
document.addEventListener('click',function(e){var inv=e.target.closest&&e.target.closest('[data-invoice]');if(inv){activeInvoiceId=inv.dataset.invoice||null;syncCallTaxSnapshots(settings())}var close=e.target.closest&&e.target.closest('#be-doc-preview-close,#be-preview-close-bottom');if(close&&previewVisible()&&modalHistoryActive)setTimeout(function(){if(history.state&&history.state.beDocPreview)history.back();else modalHistoryActive=false},0)},true);
function patch(){ensureSettingsAuthority();patchLegacyEditor();patchMetrics();patchMiniInvoices();patchPreview();syncPreviewHistory();document.documentElement.setAttribute('data-be-runtime-authority','v1.2')}
function schedule(){if(pending)return;pending=true;setTimeout(function(){pending=false;if(observer)observer.disconnect();patch();if(observer)observer.observe(document.documentElement,{childList:true,subtree:true,attributes:true,attributeFilter:['hidden','class','open']})},25)}
function install(){var s=settings();if(s.businessReservePct==null){s.businessReservePct=reservePct(s);s.ownerTaxPct=s.businessReservePct;s.stateTaxPct=0;s.localTaxPct=0;s.taxEnabled=true;write(SETTINGS_KEY,s)}syncCallTaxSnapshots(s);patch();observer=new MutationObserver(schedule);observer.observe(document.documentElement,{childList:true,subtree:true,attributes:true,attributeFilter:['hidden','class','open']});window.addEventListener('bruno:dispatch-changed',schedule)}
window.BrunoRuntimeAuthorityV1={version:'1.2.0',schedule:schedule,customerTaxPct:customerTaxPct,reservePct:reservePct,syncCallTaxSnapshots:syncCallTaxSnapshots};
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install,{once:true});else install();
})();