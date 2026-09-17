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
  function plainObject(value){return !!value&&typeof value==='object'&&!Array.isArray(value);}
  function cloneObject(value){
    if(!plainObject(value))return {};
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
    if(!plainObject(payload)||!plainObject(payload.dispatchJournalV3))return false;
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
    if(!plainObject(job))throw new Error('No saved Bruno Electric Job found');
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
  function validateOptionalObject(payload,key,label){
    if(Object.prototype.hasOwnProperty.call(payload,key)&&payload[key]!==null&&!plainObject(payload[key]))throw new Error(label+' must be an object');
  }
  function atomicStorageWrite(storage,writes){
    var before={};
    writes.forEach(function(row){before[row.key]=storage.getItem&&storage.getItem(row.key);});
    try{
      writes.forEach(function(row){storage.setItem(row.key,row.value);});
    }catch(err){
      writes.forEach(function(row){
        try{
          if(before[row.key]==null&&typeof storage.removeItem==='function')storage.removeItem(row.key);
          else if(before[row.key]!=null)storage.setItem(row.key,before[row.key]);
        }catch(ignore){}
      });
      throw new Error('App backup restore failed; previous local state was preserved: '+(err&&err.message||String(err)));
    }
  }
  function restoreFullAppPayload(payload,storage){
    if(!plainObject(payload))throw new Error('Expected app backup payload');
    if(!storage||typeof storage.setItem!=='function')throw new Error('Local storage is unavailable');
    var job=payload.job||payload.state;
    if(!plainObject(job))throw new Error('App backup is incomplete: saved Job is required');
    validateOptionalObject(payload,'companies','Company profiles');
    validateOptionalObject(payload,'uiPrefs','UI preferences');
    validateOptionalObject(payload,'catalogOpen','Catalog open state');
    validateOptionalObject(payload,'dispatchJournalV3','Dispatch Journal block');
    var block=payload.dispatchJournalV3;
    if(block){
      validateOptionalObject(block,'data','Dispatch Journal data');
      validateOptionalObject(block,'settings','Dispatch settings');
    }
    var writes=[{key:JOB_KEY,value:JSON.stringify(job)}];
    if(payload.companies)writes.push({key:PROFILES_KEY,value:JSON.stringify(payload.companies)});
    if(payload.uiPrefs)writes.push({key:UI_PREFS_KEY,value:JSON.stringify(payload.uiPrefs)});
    if(payload.catalogOpen)writes.push({key:CAT_OPEN_KEY,value:JSON.stringify(payload.catalogOpen)});
    if(block&&Object.prototype.hasOwnProperty.call(block,'data')&&block.data!==null)writes.push({key:DATA_KEY,value:JSON.stringify(block.data)});
    if(block&&Object.prototype.hasOwnProperty.call(block,'settings')&&block.settings!==null)writes.push({key:SETTINGS_KEY,value:JSON.stringify(block.settings)});
    atomicStorageWrite(storage,writes);
    return{jobRestored:true,companiesRestored:!!payload.companies,uiPrefsRestored:!!payload.uiPrefs,catalogOpenRestored:!!payload.catalogOpen,dispatchRestored:!!block};
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
