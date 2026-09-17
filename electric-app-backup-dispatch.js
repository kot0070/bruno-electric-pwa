/* Bruno Electric — full-app backup bridge for current Dispatch Journal persistence. */
(function(root,factory){
  'use strict';
  var api=factory();
  if(typeof module==='object'&&module.exports)module.exports=api;
  if(root){root.BrunoAppBackupDispatch=api;api.install(root);api.installUiBridge(root);}
})(typeof window!=='undefined'?window:(typeof global!=='undefined'?global:null),function(){
  'use strict';
  var DATA_KEY='bruno-electric-dispatch-journal-v2';
  var SETTINGS_KEY='bruno-electric-dispatch-settings-v2';
  var JOB_KEY='bruno-electric-v1';
  var PROFILES_KEY='bruno-electric-profiles-v1';
  var UI_PREFS_KEY='bruno-electric-ui-prefs-v1';
  var CAT_OPEN_KEY='bruno-electric-cat-open-v1';
  function readJson(storage,key){
    try{var raw=storage&&storage.getItem?storage.getItem(key):null;return raw==null?null:JSON.parse(raw);}catch(e){return null;}
  }
  function cloneObject(value){
    if(!value||typeof value!=='object'||Array.isArray(value))return {};
    var out={};Object.keys(value).forEach(function(k){out[k]=value[k];});return out;
  }
  function augmentPayload(payload,storage){
    var out=cloneObject(payload);
    var data=readJson(storage,DATA_KEY);
    var settings=readJson(storage,SETTINGS_KEY);
    out.dispatchJournalV3={data:data,settings:settings};
    return out;
  }
  function restorePayload(payload,storage){
    if(!payload||typeof payload!=='object'||!payload.dispatchJournalV3||typeof payload.dispatchJournalV3!=='object')return false;
    if(!storage||typeof storage.setItem!=='function')return false;
    var block=payload.dispatchJournalV3;
    if(Object.prototype.hasOwnProperty.call(block,'data')&&block.data!==null)storage.setItem(DATA_KEY,JSON.stringify(block.data));
    if(Object.prototype.hasOwnProperty.call(block,'settings')&&block.settings!==null)storage.setItem(SETTINGS_KEY,JSON.stringify(block.settings));
    return true;
  }
  function install(win){
    if(!win||win.__brunoAppBackupDispatchInstalled)return false;
    if(typeof win.wrapExport!=='function'||typeof win.applyAppPayload!=='function')return false;
    var originalWrap=win.wrapExport;
    var originalApply=win.applyAppPayload;
    win.wrapExport=function(type,payload){
      if(type==='app')payload=augmentPayload(payload,win.localStorage);
      return originalWrap(type,payload);
    };
    win.applyAppPayload=function(payload){
      var result=originalApply(payload);
      var restored=restorePayload(payload,win.localStorage);
      if(restored&&typeof win.dispatchEvent==='function'&&typeof win.CustomEvent==='function'){
        try{win.dispatchEvent(new win.CustomEvent('bruno:dispatch-changed'));}catch(e){}
      }
      return result;
    };
    win.__brunoAppBackupDispatchInstalled=true;
    return true;
  }
  function exportStamp(){
    var d=new Date(),m=String(d.getMonth()+1).padStart(2,'0'),day=String(d.getDate()).padStart(2,'0');
    return d.getFullYear()+'-'+m+'-'+day;
  }
  function buildFullAppPayload(storage){
    var job=readJson(storage,JOB_KEY);
    if(!job||typeof job!=='object'||Array.isArray(job))throw new Error('No saved Bruno Electric Job found');
    return augmentPayload({
      job:job,
      companies:readJson(storage,PROFILES_KEY),
      uiPrefs:readJson(storage,UI_PREFS_KEY),
      catalogOpen:readJson(storage,CAT_OPEN_KEY)
    },storage);
  }
  function buildFullAppEnvelope(storage){
    return{brunoExportType:'app',brunoExportVersion:1,appVersion:'v1.9',exportedAt:new Date().toISOString(),payload:buildFullAppPayload(storage)};
  }
  function restoreFullAppPayload(payload,storage){
    if(!payload||typeof payload!=='object'||Array.isArray(payload))throw new Error('Expected app backup payload');
    if(!storage||typeof storage.setItem!=='function')throw new Error('Local storage is unavailable');
    var job=payload.job||payload.state;
    if(job&&typeof job==='object'&&!Array.isArray(job))storage.setItem(JOB_KEY,JSON.stringify(job));
    if(payload.companies&&typeof payload.companies==='object'&&!Array.isArray(payload.companies))storage.setItem(PROFILES_KEY,JSON.stringify(payload.companies));
    if(payload.uiPrefs&&typeof payload.uiPrefs==='object'&&!Array.isArray(payload.uiPrefs))storage.setItem(UI_PREFS_KEY,JSON.stringify(payload.uiPrefs));
    if(payload.catalogOpen&&typeof payload.catalogOpen==='object'&&!Array.isArray(payload.catalogOpen))storage.setItem(CAT_OPEN_KEY,JSON.stringify(payload.catalogOpen));
    var dispatchRestored=restorePayload(payload,storage);
    return{jobRestored:!!job,companiesRestored:!!payload.companies,uiPrefsRestored:!!payload.uiPrefs,catalogOpenRestored:!!payload.catalogOpen,dispatchRestored:dispatchRestored};
  }
  function downloadFullApp(win){
    var env=buildFullAppEnvelope(win.localStorage);
    var blob=new win.Blob([JSON.stringify(env,null,2)],{type:'application/json'});
    var a=win.document.createElement('a');
    a.href=win.URL.createObjectURL(blob);
    a.download='bruno-app-backup-'+exportStamp()+'.json';
    a.click();
    win.setTimeout(function(){try{win.URL.revokeObjectURL(a.href);}catch(e){}},1500);
    return env;
  }
  function emitChanged(win){
    if(typeof win.dispatchEvent==='function'&&typeof win.CustomEvent==='function'){
      try{win.dispatchEvent(new win.CustomEvent('bruno:dispatch-changed'));}catch(e){}
    }
  }
  function installUiBridge(win){
    if(!win||win.__brunoAppBackupDispatchUiInstalled||!win.document||typeof win.document.addEventListener!=='function')return false;
    var doc=win.document;
    doc.addEventListener('click',function(e){
      var t=e&&e.target;
      if(t&&typeof t.closest==='function')t=t.closest('#btn-export-app');
      else if(!t||t.id!=='btn-export-app')t=null;
      if(!t)return;
      e.preventDefault();e.stopImmediatePropagation();
      try{downloadFullApp(win);}catch(err){if(typeof win.alert==='function')win.alert('Export app failed: '+err.message);}
    },true);
    doc.addEventListener('change',function(e){
      var t=e&&e.target;
      if(!t||t.id!=='btn-import-app')return;
      e.stopImmediatePropagation();
      var file=t.files&&t.files[0];t.value='';if(!file)return;
      if(file.size>8*1024*1024){if(typeof win.alert==='function')win.alert('JSON file is too large (max 8 MB).');return;}
      var reader=new win.FileReader();
      reader.onload=function(){
        try{
          var parsed=JSON.parse(String(reader.result||''));
          if(!parsed||parsed.brunoExportType!=='app'||!parsed.payload||typeof parsed.payload!=='object')throw new Error('Expected an app backup (brunoExportType: "app"). For a single job use Import job.');
          if(typeof win.confirm==='function'&&!win.confirm('Restore FULL app backup? This replaces the current job, Company letterheads, and (if present) theme/zoom.'))return;
          restoreFullAppPayload(parsed.payload,win.localStorage);emitChanged(win);
          if(win.location&&typeof win.location.reload==='function')win.location.reload();
        }catch(err){if(typeof win.alert==='function')win.alert('Import app failed: '+err.message);}
      };
      reader.onerror=function(){if(typeof win.alert==='function')win.alert('Import app failed: Could not read file');};
      reader.readAsText(file);
    },true);
    win.__brunoAppBackupDispatchUiInstalled=true;
    return true;
  }
  return{DATA_KEY:DATA_KEY,SETTINGS_KEY:SETTINGS_KEY,augmentPayload:augmentPayload,restorePayload:restorePayload,install:install,buildFullAppPayload:buildFullAppPayload,buildFullAppEnvelope:buildFullAppEnvelope,restoreFullAppPayload:restoreFullAppPayload,installUiBridge:installUiBridge};
});
