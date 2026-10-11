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
  const valid=payload.stories.filter(x=>x&&x.kind==="vanjski"&&x.origin==="automatski-rss"&&typeof x.title==="string"&&x.title.length>8&&x.title.length<181&&typeof x.source==="string"&&typeof x.description==="string"&&/^\d{4}-\d{2}-\d{2}$/.test(x.date||"")&&typeof x.url==="string"&&/^https:\/\/(github\.blog|hacks\.mozilla\.org|www\.nasa\.gov|www\.theverge\.com|www\.bleepingcomputer\.com|www\.sciencedaily\.com)\//i.test(x.url)).slice(0,30);
  if(valid.length<1)return;
  const editor=(window.BL_TECH_PULSE||[]).filter(x=>x.kind==="autorski");
  window.BL_TECH_PULSE=[...valid,...editor];
  window.BL_TECH_PULSE_UPDATED=payload.updated;
  window.BL_TECH_PULSE_METHOD="automatski-rss";
  window.dispatchEvent(new Event("bl-news-updated"));
  // Apply ONLY manually written and archived Bosnian editorial headlines.
  // Newly fetched headlines without a review remain visibly attributed to their publisher.
  try{
   const archiveResponse=await fetch("./news-archive.json",{cache:"no-store"});
   if(archiveResponse.ok){
    const archive=await archiveResponse.json();
    const translations=new Map((Array.isArray(archive.stories)?archive.stories:[])
     .filter(x=>x&&typeof x.url==="string"&&typeof x.titleBs==="string"&&x.titleBs.trim())
     .map(x=>[x.url,{titleBs:x.titleBs,summaryBs:typeof x.summaryBs==="string"?x.summaryBs:""}]));
    window.BL_TECH_PULSE=window.BL_TECH_PULSE.map(x=>Object.assign({},x,translations.get(x.url)||{}));
    window.dispatchEvent(new Event("bl-news-updated"));
   }
  }catch{ /* Original attributed headlines remain readable if archive fails. */ }
 }catch(error){console.info("Retaining previously verified TECH headlines");}
})();