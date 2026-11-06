// Keeps the trip app available offline. Shows the saved copy first, then updates it in the background when online.
const CACHE="trip2026-v2";
const FILES=["./","./index.html","./manifest.webmanifest","./icon-192.png","./icon-512.png","./icon-maskable.png"];
self.addEventListener("install",e=>{e.waitUntil(caches.open(CACHE).then(c=>c.addAll(FILES)).then(()=>self.skipWaiting()))});
self.addEventListener("activate",e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()))});
self.addEventListener("fetch",e=>{
  const req=e.request; if(req.method!=="GET")return;
  const url=new URL(req.url); if(url.origin!==location.origin)return;
  const key=req.mode==="navigate"?"./index.html":req;
  e.respondWith(caches.open(CACHE).then(async c=>{
    const hit=await c.match(key,{ignoreSearch:true});
    const net=fetch(req).then(r=>{if(r&&r.ok)c.put(key,r.clone());return r}).catch(()=>null);
    if(hit){e.waitUntil(net);return hit}
    return (await net)||new Response("Offline and not saved yet. Open the app once while online.",{status:503,headers:{"Content-Type":"text/plain"}});
  }));
});
