/* Bruno Electric — Catalog labor estimator.
 * Preserves the legacy Excel Material Sheet labor formula exactly:
 *   Day  => qty / productivity * crew * 8
 *   Hour => qty / productivity * crew
 * The legacy dataset is a baseline, not a claim of current NECA/RSMeans labor data.
 */
(function(root){
'use strict';
var JOB_KEY='bruno-electric-v1';
var RATE_KEY='bruno-electric-labor-cost-rate-v1';
var busy=false;
function num(v){var n=Number(v);return Number.isFinite(n)?n:0}
function esc(s){return String(s==null?'':s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')}
function legacyHours(row,qty){
  row=row||{};qty=Math.max(0,num(qty));
  var crew=Math.max(0,num(row.crew)),prod=Math.max(0,num(row.prod));
  if(!crew||!prod||!qty)return 0;
  var unit=String(row.prodUnit||'').trim().toLowerCase();
  return unit==='day'?(qty/prod)*crew*8:(qty/prod)*crew;
}
function legacyHoursPerUnit(row){return legacyHours(row,1)}
function laborCost(row,qty,rate){return legacyHours(row,qty)*Math.max(0,num(rate))}
function fmtHours(v){v=num(v);if(!v)return '—';return v<0.01?v.toFixed(4):v<1?v.toFixed(3):v.toFixed(2)}
function money(v){return '$'+num(v).toLocaleString(undefined,{minimumFractionDigits:2,maximumFractionDigits:2})}
function readJob(){try{return JSON.parse(root.localStorage.getItem(JOB_KEY)||'null')||{}}catch(e){return{}}}
function readRate(){try{return Math.max(0,num(root.localStorage.getItem(RATE_KEY)||0))}catch(e){return 0}}
function writeRate(v){try{root.localStorage.setItem(RATE_KEY,String(Math.max(0,num(v))))}catch(e){}}
function ensureStyle(){
  if(!root.document||root.document.getElementById('be-catalog-labor-style'))return;
  var st=root.document.createElement('style');st.id='be-catalog-labor-style';
  st.textContent='.be-labor-toolbar{display:flex;gap:.55rem;align-items:end;flex-wrap:wrap;margin:.55rem 0 .8rem;padding:.65rem .75rem;border:1px solid var(--border,#334155);border-radius:10px;background:var(--bg-card,#17212b)}.be-labor-toolbar .be-labor-copy{flex:1 1 260px;font-size:.78rem;color:var(--text-muted,#94a3b8)}.be-labor-toolbar .field{margin:0;min-width:140px}.be-labor-toolbar input{max-width:145px}.be-labor-row{margin-top:.22rem;font-size:.7rem;color:var(--text-muted,#94a3b8);line-height:1.35}.be-labor-row strong{color:var(--text,#e8eef6)}.be-labor-source{display:inline-flex;padding:.05rem .3rem;border:1px solid var(--border,#334155);border-radius:999px;margin-right:.3rem;font-size:.6rem;font-weight:800;letter-spacing:.02em}.be-labor-stale{color:#d8a94a}@media(max-width:767.98px){.be-labor-toolbar{align-items:stretch}.be-labor-toolbar .field,.be-labor-toolbar input{width:100%;max-width:none}.be-labor-row{font-size:.68rem}}';
  root.document.head.appendChild(st);
}
function ensureToolbar(){
  var panel=root.document&&root.document.getElementById('panel-catalog');if(!panel)return;
  var bar=root.document.getElementById('be-catalog-labor-toolbar');
  if(!bar){
    bar=root.document.createElement('div');bar.id='be-catalog-labor-toolbar';bar.className='be-labor-toolbar';
    bar.innerHTML='<div class="be-labor-copy"><strong>Installation labor · Legacy Excel baseline</strong><br>Uses the original workbook crew/productivity formula. Treat these hours as historical baseline until a modern benchmark or Company Experience value is assigned.</div><div class="field"><label for="be-labor-rate">Labor cost $/hr</label><input id="be-labor-rate" type="number" min="0" step="0.01" inputmode="decimal"></div>';
    var anchor=root.document.getElementById('be-catalog-legend');if(anchor&&anchor.parentNode===panel)anchor.insertAdjacentElement('afterend',bar);else panel.insertBefore(bar,panel.firstChild);
  }
  var input=root.document.getElementById('be-labor-rate');if(input&&!input.dataset.bound){input.value=String(readRate()||'');input.placeholder='Set rate';input.dataset.bound='1';input.addEventListener('change',function(){writeRate(input.value);render()});input.addEventListener('input',function(){writeRate(input.value);renderRows()})}
}
function catalogById(job){var out={};(job&&job.catalog||[]).forEach(function(r){if(r&&r.id!=null)out[String(r.id)]=r});return out}
function renderRows(){
  var panel=root.document&&root.document.getElementById('panel-catalog');if(!panel)return;
  var job=readJob(),byId=catalogById(job),rate=readRate();
  var buttons=panel.querySelectorAll('.cat-add[data-id]');
  for(var i=0;i<buttons.length;i++){
    var btn=buttons[i],id=String(btn.getAttribute('data-id')||''),row=byId[id],tr=btn.closest&&btn.closest('tr');if(!row||!tr)continue;
    var cell=tr.cells&&tr.cells[0];if(!cell)continue;
    var old=cell.querySelector('.be-labor-row');if(old)old.remove();
    var h=legacyHoursPerUnit(row),box=root.document.createElement('div');box.className='be-labor-row';
    box.setAttribute('data-labor-source','legacy-excel');box.setAttribute('data-labor-hours-unit',String(h));
    if(rate>0)box.setAttribute('data-labor-cost-unit',String(laborCost(row,1,rate)));
    var prod=num(row.prod),crew=num(row.crew),u=String(row.prodUnit||'').trim();
    if(!h){box.innerHTML='<span class="be-labor-source">LEGACY EXCEL</span><span class="be-labor-stale">Labor baseline unavailable</span>'}
    else box.innerHTML='<span class="be-labor-source">LEGACY EXCEL</span><strong>'+esc(fmtHours(h))+' h/'+esc(row.unit||'unit')+'</strong>'+(rate>0?' · '+esc(money(laborCost(row,1,rate)))+' labor/'+esc(row.unit||'unit'):' · set $/hr for cost')+'<br><span>crew '+esc(crew)+' · productivity '+esc(prod)+'/'+esc(u||'unit')+'</span>';
    cell.appendChild(box);
  }
}
function render(){if(busy||!root.document)return;busy=true;try{ensureStyle();ensureToolbar();renderRows()}finally{busy=false}}
function install(){render();var panel=root.document.getElementById('panel-catalog');if(root.MutationObserver&&panel)new root.MutationObserver(function(){root.setTimeout(render,0)}).observe(panel,{childList:true,subtree:true});root.addEventListener('storage',function(e){if(!e||e.key===JOB_KEY||e.key===RATE_KEY)root.setTimeout(render,0)});root.addEventListener('focus',render)}
root.BrunoCatalogLaborEstimator=Object.freeze({legacyHours:legacyHours,legacyHoursPerUnit:legacyHoursPerUnit,laborCost:laborCost,readRate:readRate,writeRate:writeRate,render:render,version:'labor-v1',source:'Legacy Excel Material Sheet formula'});
if(root.document&&root.document.querySelector){if(root.document.readyState==='loading')root.document.addEventListener('DOMContentLoaded',function(){root.setTimeout(install,160)},{once:true});else root.setTimeout(install,160)}
})(typeof window!=='undefined'?window:globalThis);
