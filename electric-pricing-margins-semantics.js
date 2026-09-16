/* Bruno Electric — strict Pricing & Margins runtime.
 * The legacy inline renderer is disabled by sw-register.js before app init.
 * Contract: blank/missing Your Cost is UNRESOLVED; explicit 0 is known zero.
 */
(function (root) {
  'use strict';

  var JOB_KEY='bruno-electric-v1';
  var PRIMARY_PRICE_MAP='bruno-electric-catalog-prices-v1';
  var PRIMARY_COST_MAP='bruno-electric-catalog-costs-v1';
  var installed=false;

  function parseKnownCost(raw){
    if(raw==null||String(raw).trim()==='')return{known:false,value:null};
    var n=Number(raw);
    if(!Number.isFinite(n)||n<0)return{known:false,value:null};
    return{known:true,value:Math.round(n*100)/100};
  }
  function nonNegative(raw){var n=Number(raw);return Number.isFinite(n)&&n>=0?Math.round(n*100)/100:0}
  function deriveRow(c){
    c=c||{};var cust=nonNegative(c.unitCost),k=parseKnownCost(c.yourCost);
    if(!k.known)return{customerPrice:cust,yourCostKnown:false,yourCost:null,grossDifference:null,marginPct:null,status:'UNRESOLVED'};
    var diff=cust-k.value,pct=cust>0?(diff/cust)*100:0;
    return{customerPrice:cust,yourCostKnown:true,yourCost:k.value,grossDifference:diff,marginPct:pct,status:'RESOLVED'};
  }
  function aggregate(rows){
    rows=Array.isArray(rows)?rows:[];
    var a={customerTotal:0,resolvedCustomerTotal:0,resolvedCostTotal:0,resolvedGrossDifference:0,resolvedMarginPct:null,resolvedCount:0,unresolvedCount:0};
    rows.forEach(function(c){var d=deriveRow(c);a.customerTotal+=d.customerPrice;if(!d.yourCostKnown){a.unresolvedCount++;return}a.resolvedCount++;a.resolvedCustomerTotal+=d.customerPrice;a.resolvedCostTotal+=d.yourCost;a.resolvedGrossDifference+=d.grossDifference});
    if(a.resolvedCustomerTotal>0)a.resolvedMarginPct=(a.resolvedGrossDifference/a.resolvedCustomerTotal)*100;
    else if(a.resolvedCount>0)a.resolvedMarginPct=0;
    return a;
  }
  function money(n){n=Number(n);if(!Number.isFinite(n))n=0;return'$'+n.toLocaleString('en-US',{minimumFractionDigits:2,maximumFractionDigits:2})}
  function esc(s){return String(s==null?'':s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;')}
  function readJob(){try{var x=JSON.parse(root.localStorage.getItem(JOB_KEY)||'null');return x&&typeof x==='object'&&!Array.isArray(x)?x:null}catch(e){return null}}
  function writeJob(job){try{root.localStorage.setItem(JOB_KEY,JSON.stringify(job));return true}catch(e){return false}}
  function rowById(job,id){var cat=job&&Array.isArray(job.catalog)?job.catalog:[];for(var i=0;i<cat.length;i++)if(cat[i]&&String(cat[i].id)===String(id))return cat[i];return null}
  function readMap(key){try{var x=JSON.parse(root.localStorage.getItem(key)||'{}');return x&&typeof x==='object'&&!Array.isArray(x)?x:{}}catch(e){return{}}}
  function matchingMapKeys(suffix,primary){var keys={};keys[primary]=true;try{for(var i=0;i<root.localStorage.length;i++){var k=root.localStorage.key(i);if(k&&k.slice(-suffix.length)===suffix)keys[k]=true}}catch(e){}return Object.keys(keys)}
  function writeKnownMap(id,parsed,suffix,primary){matchingMapKeys(suffix,primary).forEach(function(key){var m=readMap(key);delete m[String(id)];if(parsed.known&&key===primary)m[String(id)]=parsed.value;try{root.localStorage.setItem(key,JSON.stringify(m))}catch(e){}})}

  function persistYourCost(id,raw){
    var p=parseKnownCost(raw),job=readJob(),row=rowById(job,id);if(!job||!row)return p;
    row.yourCost=p.known?p.value:'';writeJob(job);writeKnownMap(id,p,'-catalog-costs-v1',PRIMARY_COST_MAP);return p;
  }
  function persistCustomerPrice(id,raw){
    var value=nonNegative(raw),job=readJob(),row=rowById(job,id);if(!job||!row)return value;
    row.unitCost=value;
    var mats=Array.isArray(job.materialsUsed)?job.materialsUsed:[];
    mats.forEach(function(m){if(m&&(String(m.id)===String(id)||String(m.catalogId||'')===String(id)))m.unitCost=value});
    writeJob(job);writeKnownMap(id,{known:true,value:value},'-catalog-prices-v1',PRIMARY_PRICE_MAP);return value;
  }
  function persistDiscount(id,rawPct){
    if(rawPct==null||String(rawPct).trim()==='')return persistYourCost(id,'');
    var pct=Number(rawPct);if(!Number.isFinite(pct))return persistYourCost(id,'');
    pct=Math.max(0,Math.min(100,pct));var job=readJob(),row=rowById(job,id);if(!job||!row)return{known:false,value:null};
    var cost=Math.round(nonNegative(row.unitCost)*(1-pct/100)*100)/100;
    row.yourCost=cost;writeJob(job);var p={known:true,value:cost};writeKnownMap(id,p,'-catalog-costs-v1',PRIMARY_COST_MAP);return p;
  }
  function visibleRows(job,q){
    var cat=job&&Array.isArray(job.catalog)?job.catalog:[],out=[];q=String(q||'').toLowerCase().trim();
    for(var i=0;i<cat.length;i++){var c=cat[i];if(!c)continue;var hay=((c.item||'')+' '+(c.part||'')+' '+(c.vendor||'')).toLowerCase();if(q&&hay.indexOf(q)<0)continue;out.push(c)}
    return out;
  }
  function render(filter){
    if(!root.document)return;var body=root.document.getElementById('margins-body-strict');if(!body)return;
    var job=readJob();if(!job||!Array.isArray(job.catalog)){body.innerHTML='<tr><td colspan="7">Catalog unavailable</td></tr>';return}
    var search=root.document.getElementById('mrg-search');var q=filter!=null?filter:(search?search.value:'');var rows=visibleRows(job,q),html='';
    rows.forEach(function(c){var d=deriveRow(c),id=esc(c.id),pctText=d.yourCostKnown?String(Math.round(d.marginPct*10)/10):'',costText=d.yourCostKnown?String(d.yourCost):'';
      html+='<tr data-id="'+id+'" data-cost-state="'+(d.yourCostKnown?'resolved':'unresolved')+'">'+
        '<td>'+esc(c.item)+'</td><td>'+esc(c.part)+'</td>'+
        '<td class="col-cost"><input type="number" class="num mrg-cust" step="0.01" min="0" value="'+d.customerPrice+'" aria-label="Customer price" /></td>'+
        '<td class="col-cost"><input type="number" class="num mrg-pct" step="0.1" min="0" max="100" value="'+pctText+'" placeholder="'+(d.yourCostKnown?'':'Unresolved')+'" aria-label="'+(d.yourCostKnown?'Discount / margin percent':'Discount / margin — unresolved until Your Cost is known')+'" /></td>'+
        '<td class="col-cost"><input type="number" class="num mrg-your" step="0.01" min="0" value="'+costText+'" placeholder="'+(d.yourCostKnown?'':'Unresolved')+'" data-cost-state="'+(d.yourCostKnown?'resolved':'unresolved')+'" aria-label="'+(d.yourCostKnown?'Your cost':'Your cost — unresolved')+'" /></td>'+
        '<td class="num-cell" data-cost-state="'+(d.yourCostKnown?'resolved':'unresolved')+'">'+(d.yourCostKnown?money(d.grossDifference):'Unresolved')+'</td>'+
        '<td class="num-cell" data-cost-state="'+(d.yourCostKnown?'resolved':'unresolved')+'">'+(d.yourCostKnown?(Math.round(d.marginPct*10)/10)+'%':'Unresolved')+'</td></tr>';
    });
    body.innerHTML=html||'<tr><td colspan="7" style="color:var(--text-muted)">No catalog rows</td></tr>';
    var a=aggregate(rows),un=a.unresolvedCount>0;
    function set(id,text){var el=root.document.getElementById(id);if(!el)return;el.textContent=text;if(un)el.setAttribute('data-cost-state','partial-unresolved');else el.removeAttribute('data-cost-state')}
    set('mrg-cust-sum',money(a.customerTotal));
    set('mrg-cost-sum',un?money(a.resolvedCostTotal)+' resolved · '+a.unresolvedCount+' unresolved':money(a.resolvedCostTotal));
    set('mrg-diff-sum',un?money(a.resolvedGrossDifference)+' resolved · '+a.unresolvedCount+' unresolved':money(a.resolvedGrossDifference));
    var mp=a.resolvedMarginPct==null?'—':(Math.round(a.resolvedMarginPct*10)/10)+'%';set('mrg-pct-sum',un?mp+' resolved · '+a.unresolvedCount+' unresolved':mp);
    var panel=root.document.getElementById('panel-margins');if(panel){panel.setAttribute('data-pricing-margins-runtime','strict-v2');panel.setAttribute('data-unresolved-count',String(a.unresolvedCount))}
  }
  function idFromTarget(t){var tr=t&&t.closest?t.closest('tr[data-id]'):null;return tr?String(tr.getAttribute('data-id')||''):''}
  function reload(){if(root.location&&typeof root.location.reload==='function')root.setTimeout(function(){root.location.reload()},0)}
  function onChange(e){
    var t=e.target;if(!t||!t.classList)return;var id=idFromTarget(t);if(!id)return;
    if(t.classList.contains('mrg-cust')){persistCustomerPrice(id,t.value);reload();return}
    if(t.classList.contains('mrg-your')){persistYourCost(id,t.value);reload();return}
    if(t.classList.contains('mrg-pct')){persistDiscount(id,t.value);reload()}
  }
  function install(){
    if(installed||!root.document)return;var body=root.document.getElementById('margins-body-strict');if(!body)return;installed=true;
    body.addEventListener('change',onChange);
    var search=root.document.getElementById('mrg-search');if(search)search.addEventListener('input',function(){render(this.value)});
    var bulk=root.document.getElementById('mrg-apply-bulk');if(bulk)bulk.addEventListener('click',function(){var el=root.document.getElementById('mrg-bulk-pct'),pct=el?Number(el.value):NaN;if(!Number.isFinite(pct))return;pct=Math.max(0,Math.min(100,pct));var job=readJob(),q=search?search.value:'',rows=visibleRows(job,q);rows.forEach(function(c){var cost=Math.round(nonNegative(c.unitCost)*(1-pct/100)*100)/100;c.yourCost=cost;writeKnownMap(c.id,{known:true,value:cost},'-catalog-costs-v1',PRIMARY_COST_MAP)});writeJob(job);reload()});
    var eq=root.document.getElementById('mrg-cost-eq-cust');if(eq)eq.addEventListener('click',function(){var job=readJob();if(!job)return;(job.catalog||[]).forEach(function(c){if(!c)return;var v=nonNegative(c.unitCost);c.yourCost=v;writeKnownMap(c.id,{known:true,value:v},'-catalog-costs-v1',PRIMARY_COST_MAP)});writeJob(job);reload()});
    render();
  }

  root.BrunoPricingMarginsSemantics=Object.freeze({parseKnownCost:parseKnownCost,deriveRow:deriveRow,aggregate:aggregate,persistYourCost:persistYourCost,persistCustomerPrice:persistCustomerPrice,persistDiscount:persistDiscount,render:render,version:'strict-v2'});
  if(root.document){if(root.document.readyState==='loading')root.document.addEventListener('DOMContentLoaded',install,{once:true});else install()}
})(typeof window!=='undefined'?window:globalThis);
