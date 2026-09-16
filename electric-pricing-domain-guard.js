/* Bruno Electric — fail-closed numeric-domain guard for estimating / T&M pricing.
 * Negative Change Orders are intentionally allowed as signed credits; other cost,
 * quantity, rate and hour inputs in this supported workflow are nonnegative domains.
 * An already-approved fixed-price invoice remains printable from its immutable snapshot;
 * invalid current live state blocks new approval, live Quote output and T&M output.
 */
(function(root){
'use strict';
var JOB_KEY='bruno-electric-v1',VERSION='pricing-domain-guard-v1',timer=null;
function read(){try{return JSON.parse(root.localStorage&&root.localStorage.getItem(JOB_KEY)||'null')}catch(e){return null}}
function finite(v){if(v===''||v==null)return false;var n=Number(v);return Number.isFinite(n)}
function nonneg(v){return finite(v)&&Number(v)>=0}
function push(errors,path,value,rule){errors.push({path:path,value:value,rule:rule,message:path+' '+rule})}
function checkNonneg(errors,path,value){if(!nonneg(value))push(errors,path,value,'must be a finite number >= 0')}
function validateJob(j){var e=[];if(!j||typeof j!=='object'||Array.isArray(j)){push(e,'job',j,'must be a valid Job object');return{valid:false,errors:e,version:VERSION}}
 var i,row,a=Array.isArray(j.materialsUsed)?j.materialsUsed:[];
 for(i=0;i<a.length;i++){row=a[i]||{};checkNonneg(e,'materialsUsed['+i+'].qty',row.qty);checkNonneg(e,'materialsUsed['+i+'].unitCost',row.unitCost)}
 var le=j.laborEquip||{},eq=Array.isArray(le.equipment)?le.equipment:[];
 for(i=0;i<eq.length;i++){row=eq[i]||{};checkNonneg(e,'laborEquip.equipment['+i+'].cost',row.cost)}
 var st=Array.isArray(le.smallTools)?le.smallTools:[];
 for(i=0;i<st.length;i++){row=st[i]||{};checkNonneg(e,'laborEquip.smallTools['+i+'].qty',row.qty);checkNonneg(e,'laborEquip.smallTools['+i+'].unitCost',row.unitCost)}
 var subs=Array.isArray(le.subcontractors)?le.subcontractors:[];
 for(i=0;i<subs.length;i++){row=subs[i]||{};checkNonneg(e,'laborEquip.subcontractors['+i+'].price',row.price)}
 var blocks=Array.isArray(le.blocks)?le.blocks:[],fields=['persons','days','hoursPerDay','satPersons','satDays','satHours','sunPersons','sunDays','sunHours'];
 for(i=0;i<blocks.length;i++){row=blocks[i]||{};fields.forEach(function(k){checkNonneg(e,'laborEquip.blocks['+i+'].'+k,row[k])})}
 var tm=j.tm||{},tme=Array.isArray(tm.equipmentLines)?tm.equipmentLines:[];
 for(i=0;i<tme.length;i++){row=tme[i]||{};checkNonneg(e,'tm.equipmentLines['+i+'].qty',row.qty);checkNonneg(e,'tm.equipmentLines['+i+'].rate',row.rate)}
 var tml=Array.isArray(tm.laborLines)?tm.laborLines:[];
 for(i=0;i<tml.length;i++){row=tml[i]||{};checkNonneg(e,'tm.laborLines['+i+'].hours',row.hours);checkNonneg(e,'tm.laborLines['+i+'].rate',row.rate)}
 checkNonneg(e,'tm.materialAmount',tm.materialAmount==null?0:tm.materialAmount);checkNonneg(e,'tm.subAmount',tm.subAmount==null?0:tm.subAmount);
 var s=j.summary||{},oh=s.ohRate==null?0:s.ohRate,p=s.profitMargin==null?0:s.profitMargin;
 if(!nonneg(oh))push(e,'summary.ohRate',oh,'must be a finite number >= 0');
 if(!finite(p)||Number(p)<0||Number(p)>=1)push(e,'summary.profitMargin',p,'must be finite and satisfy 0 <= profit < 1');
 return{valid:e.length===0,errors:e,version:VERSION};
}
function assertValid(job){var r=validateJob(job||read());if(!r.valid){var x=r.errors[0];throw new Error('INVALID PRICING INPUT: '+x.message+(r.errors.length>1?' (+'+(r.errors.length-1)+' more)':''))}return r}
function ensureStyle(){var d=root.document;if(!d||typeof d.createElement!=='function'||d.getElementById('be-pricing-domain-style'))return;var s=d.createElement('style');s.id='be-pricing-domain-style';s.textContent='#be-pricing-domain-alert{position:sticky;top:0;z-index:10000;margin:0;padding:10px 14px;background:#4a1717;color:#ffd7d7;border-bottom:2px solid #ff6b6b;font:700 13px/1.35 system-ui,sans-serif}#be-pricing-domain-alert small{font-weight:500;display:block;margin-top:3px}.be-pricing-domain-blocked{opacity:.55!important;cursor:not-allowed!important}';d.head&&d.head.appendChild(s)}
function alertHost(){var d=root.document;if(!d||!d.body||typeof d.createElement!=='function')return null;var x=d.getElementById('be-pricing-domain-alert');if(x)return x;x=d.createElement('div');x.id='be-pricing-domain-alert';x.hidden=true;d.body.insertBefore(x,d.body.firstChild);return x}
function controls(){if(!root.document)return[];var ids=['qa-approve','btn-print-tm','btn-print-tm-2','btn-print-quote','btn-print-quote-2'];return ids.map(function(id){return root.document.getElementById(id)}).filter(Boolean)}
function render(){if(!root.document||typeof root.document.createElement!=='function')return validateJob(read()||{});ensureStyle();var r=validateJob(read()||{}),h=alertHost();if(h){h.hidden=r.valid;if(r.valid)h.textContent='';else{var first=r.errors[0];h.innerHTML='PRICING / T&amp;M BLOCKED — invalid numeric domain<small>'+String(first.path).replace(/</g,'&lt;')+': '+String(first.rule).replace(/</g,'&lt;')+(r.errors.length>1?' · '+(r.errors.length-1)+' additional error(s)':'')+'</small>'}}
 controls().forEach(function(b){b.disabled=!r.valid;b.classList&&b.classList.toggle('be-pricing-domain-blocked',!r.valid);if(!r.valid)b.title='Blocked: fix invalid pricing/T&M numeric input first'});return r}
function schedule(){if(timer!=null&&root.clearTimeout)root.clearTimeout(timer);if(root.setTimeout)timer=root.setTimeout(function(){timer=null;render()},0);else render()}
function install(){if(!root.document||typeof root.document.createElement!=='function')return;render();if(root.addEventListener){root.addEventListener('storage',function(e){if(!e||e.key===JOB_KEY)schedule()});root.addEventListener('focus',schedule);root.addEventListener('bruno:quote-approved',schedule)}if(root.document.addEventListener){root.document.addEventListener('input',schedule,true);root.document.addEventListener('change',schedule,true);root.document.addEventListener('click',function(e){var t=e&&e.target;if(!t||!t.id)return;if(['qa-approve','btn-print-tm','btn-print-tm-2','btn-print-quote','btn-print-quote-2'].indexOf(t.id)>=0){try{assertValid()}catch(err){e.preventDefault();e.stopImmediatePropagation();render()}}},true)}}
root.BrunoPricingDomainGuard=Object.freeze({validateJob:validateJob,assertValid:assertValid,read:read,render:render,version:VERSION});
if(root.document&&typeof root.document.createElement==='function'){if(root.document.readyState==='loading'&&root.document.addEventListener)root.document.addEventListener('DOMContentLoaded',install,{once:true});else install()}
})(typeof window!=='undefined'?window:globalThis);
