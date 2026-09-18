/* Bruno Electric — retired shell service worker.
 * The previous offline shell cached multiple generations of runtime modules at
 * once. Until the runtime is fully consolidated, correctness wins over offline
 * caching: delete every Bruno cache, unregister this worker, and use network
 * files directly.
 */
const OWNED_CACHE_RE=/^bruno-electric-v\d+$/;
self.addEventListener('install',(event)=>{event.waitUntil(self.skipWaiting())});
self.addEventListener('activate',(event)=>{event.waitUntil((async()=>{
  const keys=await caches.keys();
  await Promise.all(keys.filter((k)=>OWNED_CACHE_RE.test(k)).map((k)=>caches.delete(k)));
  await self.clients.claim();
  await self.registration.unregister();
  const clients=await self.clients.matchAll({type:'window',includeUncontrolled:true});
  clients.forEach((client)=>client.postMessage({type:'BRUNO_SW_RETIRED'}));
})())});
self.addEventListener('fetch',(event)=>{
  if(event.request.method==='GET')event.respondWith(fetch(event.request));
});
