/* Bruno Electric — full-app backup bridge for current Dispatch Journal persistence. */
(function(root,factory){
  'use strict';
  var api=factory();
  if(typeof module==='object'&&module.exports)module.exports=api;
  if(root){root.BrunoAppBackupDispatch=api;api.install(root);}
})(typeof window!=='undefined'?window:(typeof global!=='undefined'?global:null),function(){
  'use strict';
  var DATA_KEY='bruno-electric-dispatch-journal-v2';
  var SETTINGS_KEY='bruno-electric-dispatch-settings-v2';
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
  return{DATA_KEY:DATA_KEY,SETTINGS_KEY:SETTINGS_KEY,augmentPayload:augmentPayload,restorePayload:restorePayload,install:install};
});
