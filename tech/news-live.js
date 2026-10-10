"use strict";
(async()=>{
 const raw="https://raw.githubusercontent.com/omer87h-ctrl/brzoilokalno-website/main/tech/news-live.json";
 try{
  const controller=new AbortController();
  const timer=setTimeout(()=>controller.abort(),5500);
  let response;try{response=await fetch(raw,{signal:controller.signal,cache:"no-cache"});}finally{clearTimeout(timer);}
  if(!response.ok)throw Error("Feed is unavailable");
  const payload=await response.json();
  const current=Date.now();
  const updated=Date.parse(String(payload.updated||"")+"T00:00:00Z");
  if(!Array.isArray(payload.stories)||!Number.isFinite(updated)||updated>current+86400000||current-updated>8*86400000)return;
  const valid=payload.stories.filter(x=>x&&x.kind==="vanjski"&&x.origin==="automatski-rss"&&typeof x.title==="string"&&x.title.length>8&&x.title.length<181&&typeof x.source==="string"&&typeof x.description==="string"&&/^\d{4}-\d{2}-\d{2}$/.test(x.date||"")&&typeof x.url==="string"&&/^https:\/\/(github\.blog|hacks\.mozilla\.org)\//i.test(x.url)).slice(0,10);
  if(valid.length<3)return;
  const editor=(window.BL_TECH_PULSE||[]).filter(x=>x.kind==="autorski");
  window.BL_TECH_PULSE=[...valid,...editor];
  window.BL_TECH_PULSE_UPDATED=payload.updated;
  window.BL_TECH_PULSE_METHOD="automatski-rss";
  window.dispatchEvent(new Event("bl-news-updated"));
 }catch(error){console.info("Retaining previously verified TECH headlines");}
})();