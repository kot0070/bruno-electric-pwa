/* Bruno Electric — Call Journal business metrics.
 * Customer sales tax is pass-through money and is intentionally separate from
 * the company's internal tax reserve. Included materials are already inside
 * the service price and are never added to earned revenue a second time.
 */
(function(){
'use strict';
var DATA_KEY='bruno-electric-dispatch-journal-v2',SETTINGS_KEY='bruno-electric-dispatch-settings-v2';
function q(s,r){return (r||document).querySelector(s)}
function qa(s,r){return Array.prototype.slice.call((r||document).querySelectorAll(s))}
function n(v,d){var x=Number(v);return Number.isFinite(x)?x:(d||0)}
function money(v){return '$'+n(v).toLocaleString(undefined,{minimumFractionDigits:2,maximumFractionDigits:2})}
function read(k,f){try{return Object.assign(f||{},JSON.parse(localStorage.getItem(k)||'{}'))}catch(e){return f||{}}}
function write(k,v){localStorage.setItem(k,JSON.stringify(v));window.dispatchEvent(new CustomEvent('bruno:dispatch-changed'))}
function subtotal(c){return Math.max(0,n(c&&c.price))+(c&&c.toolFeeEnabled?Math.max(0,n(c.price))*Math.max(0,n(c.toolFeePct))/100:0)}
function reservePct(s){if(s.taxEnabled===false)return 0;return Math.max(0,n(s.ownerTaxPct,15)+n(s.stateTaxPct,0)+n(s.localTaxPct,0))}
function ensureReserveSetting(){
  var body=q('#dj-settings-body'),save=q('#djs-customer-save');if(!body||!save)return;
  var legacySave=q('#djs-save');if(legacySave)legacySave.style.display='none';
  qa('#dj-settings-body > .dj-note').forEach(function(x){if(x.textContent.indexOf('Planning settings only')>=0)x.style.display='none'});
  var input=q('#djs-business-reserve');
  if(!input){
    var s=read(SETTINGS_KEY,{taxEnabled:true,ownerTaxPct:15,stateTaxPct:0,localTaxPct:0}),form=save.previousElementSibling;
    while(form&&!(form.classList&&form.classList.contains('dj-form')))form=form.previousElementSibling;
    if(!form)return;
    var field=document.createElement('div');field.className='field';field.innerHTML='<label>Business tax reserve %</label><input id="djs-business-reserve" type="number" min="0" max="100" step="0.01" value="'+reservePct(s)+'"><small style="display:block;color:var(--text-muted);margin-top:.25rem">Internal reserve only — never added to the customer invoice.</small>';
    form.insertBefore(field,form.children[2]||null);input=q('#djs-business-reserve');
  }
  if(!save.dataset.businessReserveHook){save.dataset.businessReserveHook='1';save.addEventListener('click',function(){var s=read(SETTINGS_KEY,{}),value=Math.max(0,n((q('#djs-business-reserve')||{}).value,15));s.taxEnabled=true;s.ownerTaxPct=value;s.stateTaxPct=0;s.localTaxPct=0;setTimeout(function(){var latest=read(SETTINGS_KEY,{});latest.taxEnabled=true;latest.ownerTaxPct=value;latest.stateTaxPct=0;latest.localTaxPct=0;write(SETTINGS_KEY,latest)},0)},true)}
}
function patch(){
  var panel=q('#panel-dispatch');if(!panel)return;ensureReserveSetting();
  var metrics=qa('.dj-metric',panel);
  if(metrics.length<4||!window.BrunoDispatchJournalV2||!q('#dj-date')||!q('#dj-mode'))return;
  var d=read(DATA_KEY,{calls:[],helpers:[]}),s=read(SETTINGS_KEY,{taxEnabled:true,ownerTaxPct:15,stateTaxPct:0,localTaxPct:0}),period=window.BrunoDispatchJournalV2.summary(d,s,q('#dj-date').value,q('#dj-mode').value),ids={};
  (period.calls||[]).forEach(function(c){ids[c.id]=true});
  var gross=0;
  (d.calls||[]).forEach(function(c){if(!ids[c.id]||c.status!=='completed')return;gross+=subtotal(c)});
  var reserve=gross*reservePct(s)/100;
  /* Never parse localized currency back out of the DOM. The dispatch summary is
   * the authoritative numeric source for helper economics. */
  var helper=Math.max(0,n(period.helperGross));
  var businessNet=gross-reserve-helper;
  var entries=[['Gross earned',money(gross)],['Tax reserve','-'+money(reserve)],['Helpers gross','-'+money(helper)],['Business net',money(businessNet)]];
  entries.forEach(function(row,i){var k=q('.k',metrics[i]),v=q('.v',metrics[i]);if(k&&k.textContent!==row[0])k.textContent=row[0];if(v&&v.textContent!==row[1])v.textContent=row[1]});
}
var pending=false;
function schedule(){if(pending)return;pending=true;setTimeout(function(){pending=false;patch()},40)}
function install(){patch();new MutationObserver(schedule).observe(document.documentElement,{childList:true,subtree:true})}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install,{once:true});else install();
window.addEventListener('bruno:dispatch-changed',schedule);
})();
