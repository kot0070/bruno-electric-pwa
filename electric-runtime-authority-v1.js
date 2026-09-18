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
function pct(v){return n(v).toFixed(2).replace(/\.00$/,'')+'%'}
function read(k,f){try{var x=JSON.parse(localStorage.getItem(k)||'null');return x&&typeof x==='object'?x:f}catch(e){return f}}
function write(k,v){localStorage.setItem(k,JSON.stringify(v))}
function data(){var d=read(DATA_KEY,{calls:[],helpers:[]});d.calls=Array.isArray(d.calls)?d.calls:[];d.helpers=Array.isArray(d.helpers)?d.helpers:[];return d}
function settings(){return Object.assign({serviceHourlyRate:175,commercialTaxPct:0,businessReservePct:0,taxEnabled:false,ownerTaxPct:0,stateTaxPct:0,localTaxPct:0,estimatedSetAsideV1:true,invoiceCompanyName:'Bruno Electric Services LLC',invoiceAddress:'',invoicePhone:'',invoiceEmail:'',invoiceLicense:'TECL 28137',invoiceTerms:'Due upon receipt'},read(SETTINGS_KEY,{}))}
function reservePct(s){return Math.max(0,n(s&&s.businessReservePct,0))}
function salesPct(s){return Math.max(0,n(s&&s.commercialTaxPct,0))}
function tool(c){return c&&c.toolFeeEnabled?Math.max(0,n(c.price))*Math.max(0,n(c.toolFeePct))/100:0}
function subtotal(c){return Math.max(0,n(c&&c.price))+tool(c)}
function materialTotal(c){if(!c)return 0;if(c.includedMaterialsMode==='itemized'&&Array.isArray(c.includedMaterialItems)&&c.includedMaterialItems.length)return c.includedMaterialItems.reduce(function(a,x){return a+Math.max(0,n(x.qty))*Math.max(0,n(x.unitPrice))},0);return Math.max(0,n(c.includedMaterialsTotal))}
function customerTaxPct(c,s){return c&&c.callType==='commercial_repair'?salesPct(s):0}
function customerTotal(c,s){var base=subtotal(c),rate=customerTaxPct(c,s);return{base:base,rate:rate,tax:base*rate/100,total:base+(base*rate/100)}}
function findCall(id){return data().calls.find(function(c){return c.id===id})||null}
function syncCallTaxSnapshots(s){var d=data(),changed=false,rate=salesPct(s);d.calls.forEach(function(c){var next=c.callType==='commercial_repair'?rate:0;if(n(c.taxPct,-1)!==next){c.taxPct=next;changed=true}var applied=c.status==='completed'?next:null;if(c.taxPctApplied!==applied){c.taxPctApplied=applied;changed=true}if(c.customerSalesTaxPctApplied!==applied){c.customerSalesTaxPctApplied=applied;changed=true}if(c.invoiceChargeSalesTax!==(c.callType==='commercial_repair')){c.invoiceChargeSalesTax=(c.callType==='commercial_repair');changed=true}});if(changed)write(DATA_KEY,d);return changed}
function callFromPreview(){if(activeInvoiceId){var c=findCall(activeInvoiceId);if(c)return c}var t=q('#be-doc-preview-paper .be-doc-title span');if(!t)return null;var txt=String(t.textContent||'');return data().calls.find(function(c){return 'SC-'+String(c.date||'').replace(/-/g,'')+'-'+String(c.id||'CALL').slice(-6).toUpperCase()===txt})||null}
function rowByLabel(label,root){return qa('.be-doc-row',root||document).find(function(r){var a=r.querySelector('span');return a&&String(a.textContent||'').trim().indexOf(label)===0})}
function hide(row,on){if(!row)return;row.style.display=on?'none':'';row.setAttribute('aria-hidden',on?'true':'false')}
function patchPreview(){var host=q('#be-doc-preview');if(!host||host.hidden||String((q('#be-doc-preview-heading',host)||{}).textContent||'')!=='Service invoice preview')return;var c=callFromPreview(),paper=q('#be-doc-preview-paper',host);if(!c||!paper)return;var s=settings(),mats=materialTotal(c),toolAmt=tool(c),ct=customerTotal(c,s),mat=rowByLabel('Included materials reference',paper),toolRow=rowByLabel('Tool / consumables',paper),tax=rowByLabel('Sales tax',paper),amount=rowByLabel('Amount due',paper),sub=rowByLabel('Subtotal',paper);hide(mat,!(mats>0&&c.invoiceShowMaterials===true));qa('.be-doc-materials',paper).forEach(function(x){hide(x,!(mats>0&&c.invoiceShowMaterials===true))});hide(toolRow,toolAmt<=0);if(tax){hide(tax,ct.rate<=0);if(ct.rate>0){var bits=tax.querySelectorAll('span,b');if(bits[0])bits[0].textContent='Sales tax · '+ct.rate.toFixed(2)+'%';if(bits[1])bits[1].textContent=money(ct.tax)}}if(sub){var sb=sub.querySelector('b');if(sb)sb.textContent=money(ct.base)}if(amount){var ab=amount.querySelector('b');if(ab)ab.textContent=money(ct.total)}}
function ensureSettingsAuthority(){var body=q('#dj-settings-body'),save=q('#djs-customer-save');if(!body||!save)return;var s=settings(),form=q('#djs-service-rate')&&q('#djs-service-rate').closest('.dj-form');if(!form)return;var reserve=q('#djs-business-reserve');if(!reserve){var field=document.createElement('div');field.className='field';field.innerHTML='<label>Estimated tax set-aside %</label><input id="djs-business-reserve" type="number" min="0" max="100" step="0.01" value="'+reservePct(s)+'"><small style="display:block;color:var(--text-muted);margin-top:.25rem">Optional internal estimate for future income/self-employment taxes. Not sales tax and not added to invoices.</small>';var commercial=q('#djs-commercial-tax');form.insertBefore(field,commercial&&commercial.closest('.field')||form.children[1]||null);reserve=q('#djs-business-reserve')}else{var fieldExisting=reserve.closest('.field'),label=fieldExisting&&q('label',fieldExisting),note=fieldExisting&&q('small',fieldExisting);if(label)label.textContent='Estimated tax set-aside %';if(note)note.textContent='Optional internal estimate for future income/self-employment taxes. Not sales tax and not added to invoices.'}
if(!save.dataset.atomicAuthority){save.dataset.atomicAuthority='1';save.addEventListener('click',function(ev){ev.preventDefault();ev.stopImmediatePropagation();var x=settings();x.serviceHourlyRate=Math.max(0,n((q('#djs-service-rate')||{}).value,175));x.businessReservePct=Math.max(0,n((q('#djs-business-reserve')||{}).value,0));x.estimatedSetAsideV1=true;x.taxEnabled=x.businessReservePct>0;x.ownerTaxPct=x.businessReservePct;x.stateTaxPct=0;x.localTaxPct=0;x.commercialTaxPct=Math.max(0,n((q('#djs-commercial-tax')||{}).value,0));x.invoiceCompanyName=String((q('#djs-company')||{}).value||'').trim()||'Bruno Electric Services LLC';x.invoiceAddress=String((q('#djs-address')||{}).value||'').trim();x.invoicePhone=String((q('#djs-phone')||{}).value||'').trim();x.invoiceLicense=String((q('#djs-license')||{}).value||'').trim()||'TECL 28137';x.invoiceEmail=String((q('#djs-email')||{}).value||'').trim();x.invoiceTerms=String((q('#djs-terms')||{}).value||'').trim()||'Due upon receipt';write(SETTINGS_KEY,x);syncCallTaxSnapshots(x);window.dispatchEvent(new CustomEvent('bruno:dispatch-changed'));schedule();alert('Tax & journal settings saved.')},true)}}
function patchLegacyEditor(){var e=q('#dj-call-editor.open');if(!e)return;var tax=q('#djc-tax',e);if(tax&&tax.closest('.field'))tax.closest('.field').style.display='none';qa('.field',e).forEach(function(f){if(/tax\s*%\s*override/i.test(String((q('label',f)||{}).textContent||'')))f.style.display='none'})}
function currentPeriodIds(d){var ids={};if(window.BrunoDispatchJournalV2&&q('#dj-date')&&q('#dj-mode')){var p=window.BrunoDispatchJournalV2.summary(d,settings(),q('#dj-date').value,q('#dj-mode').value);(p.calls||[]).forEach(function(c){ids[c.id]=true});return{ids:ids,period:p}}var date=(q('#dj-date')||{}).value;d.calls.forEach(function(c){if(!date||c.date===date)ids[c.id]=true});return{ids:ids,period:null}}
function patchMetrics(){
  var panel=q('#panel-dispatch'),host=panel&&q('.dj-metrics',panel);if(!host)return;
  var d=data(),s=settings(),p=currentPeriodIds(d),base=0,income=0;
  (d.calls||[]).forEach(function(c){
    if(!p.ids[c.id]||c.status!=='completed')return;
    var ct=customerTotal(c,s);base+=ct.base;income+=ct.total;
  });
  var helper=p.period?Math.max(0,n(p.period.helperGross)):0,
      sales=salesPct(s),estimatedRate=reservePct(s),
      tax=base*sales/100,
      estimated=base*estimatedRate/100,
      taxPlusEstimated=tax+estimated,
      netProfit=income-tax,
      businessNet=netProfit-helper,
      rows=[
        ['Income',money(income),''],
        ['Tax + Estimated','-'+money(taxPlusEstimated),'neg'],
        ['Net Profit',money(netProfit),'net'],
        ['Business Net',money(businessNet),businessNet<0?'neg':'net'],
        ['Helper','-'+money(helper),'neg'],
        ['Tax','-'+money(tax),'neg']
      ];
  host.style.gridTemplateColumns='repeat(2,minmax(0,1fr))';
  host.style.gap='.32rem';
  host.innerHTML=rows.map(function(r){return '<div class="dj-metric '+r[2]+'" style="padding:.42rem .55rem;min-height:68px"><span class="k" style="font-size:.64rem">'+r[0]+'</span><span class="v" style="font-size:.96rem">'+r[1]+'</span></div>'}).join('');
}
function patchCallCards(){var d=data(),s=settings(),map={};d.calls.forEach(function(c){map[c.id]=c});qa('[data-invoice]').forEach(function(btn){var c=map[btn.dataset.invoice],row=btn.closest('.dj-call');if(!c||!row)return;var ct=customerTotal(c,s),amount=q('.dj-call-money',row),amountWrap=amount&&amount.parentElement,sub=amountWrap&&q('.dj-call-sub',amountWrap),residentialNet=ct.base-(ct.base*salesPct(s)/100);if(amount)amount.textContent=money(ct.total);if(sub){if(c.status!=='completed')sub.textContent='customer total '+money(ct.total);else if(c.callType==='commercial_repair')sub.textContent='net '+money(ct.base);else sub.textContent='net '+money(residentialNet)}})}
function patchMiniInvoices(){var d=data(),s=settings();qa('.dj-invoice').forEach(function(inv){var id=String(inv.id||'').replace(/^dj-invoice-/,'');var c=d.calls.find(function(x){return x.id===id});if(!c)return;qa('.dj-invoice-row',inv).forEach(function(r){var label=String((r.firstElementChild||{}).textContent||'').trim(),val=r.lastElementChild;if(/^Materials$/i.test(label))hide(r,materialTotal(c)<=0);if(/^Tool \/ consumables$/i.test(label))hide(r,tool(c)<=0);if(/^(Tax reserve|Estimated tax set-aside)/i.test(label)){r.style.display='';if(r.firstElementChild)r.firstElementChild.textContent='Estimated tax set-aside · '+reservePct(s).toFixed(2)+'%';if(val)val.textContent='-'+money(subtotal(c)*reservePct(s)/100)}})})}
function previewVisible(){var h=q('#be-doc-preview');return !!(h&&!h.hidden)}
function closePreviewDom(){var h=q('#be-doc-preview');if(h&&!h.hidden){h.hidden=true;document.body.classList.remove('be-doc-preview-open','be-doc-print')}}
function syncPreviewHistory(){if(previewVisible()&&!modalHistoryActive){try{history.pushState(Object.assign({},history.state||{},{beDocPreview:true}),'',location.href);modalHistoryActive=true}catch(e){}}else if(!previewVisible())modalHistoryActive=false}
window.addEventListener('popstate',function(){if(previewVisible()){closePreviewDom();modalHistoryActive=false;schedule()}});
document.addEventListener('click',function(e){var inv=e.target.closest&&e.target.closest('[data-invoice]');if(inv){activeInvoiceId=inv.dataset.invoice||null;syncCallTaxSnapshots(settings())}var close=e.target.closest&&e.target.closest('#be-doc-preview-close,#be-preview-close-bottom');if(close&&previewVisible()&&modalHistoryActive)setTimeout(function(){if(history.state&&history.state.beDocPreview)history.back();else modalHistoryActive=false},0)},true);
function migrateEstimatedSetAside(){var raw=read(SETTINGS_KEY,{});if(raw.estimatedSetAsideV1===true)return raw;raw.businessReservePct=0;raw.ownerTaxPct=0;raw.stateTaxPct=0;raw.localTaxPct=0;raw.taxEnabled=false;raw.estimatedSetAsideV1=true;write(SETTINGS_KEY,raw);return raw}
function patch(){ensureSettingsAuthority();patchLegacyEditor();patchMetrics();patchCallCards();patchMiniInvoices();patchPreview();syncPreviewHistory();document.documentElement.setAttribute('data-be-runtime-authority','v1.11')}
function schedule(){if(pending)return;pending=true;setTimeout(function(){pending=false;if(observer)observer.disconnect();patch();if(observer)observer.observe(document.documentElement,{childList:true,subtree:true,attributes:true,attributeFilter:['hidden','class','open']})},25)}
function install(){migrateEstimatedSetAside();var s=settings();syncCallTaxSnapshots(s);patch();observer=new MutationObserver(schedule);observer.observe(document.documentElement,{childList:true,subtree:true,attributes:true,attributeFilter:['hidden','class','open']});window.addEventListener('bruno:dispatch-changed',schedule)}
window.BrunoRuntimeAuthorityV1={version:'1.11.0',schedule:schedule,customerTaxPct:customerTaxPct,customerTotal:customerTotal,reservePct:reservePct,salesPct:salesPct,syncCallTaxSnapshots:syncCallTaxSnapshots};
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install,{once:true});else install();
})();