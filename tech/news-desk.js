"use strict";
(()=>{
 const target=document.getElementById("desk-stories");
 if(!target)return;
 const entries=Array.isArray(window.BL_TECH_PULSE)?window.BL_TECH_PULSE:[];
 const status=document.getElementById("desk-updated");
 const updated=window.BL_TECH_PULSE_UPDATED;
 if(status&&/^\d{4}-\d{2}-\d{2}$/.test(updated||"")){status.textContent="UREDNIČKI PROVJERENO: "+updated.split("-").reverse().join(".")+" · Ručni izbor vijesti";}
 const categories=[["SVE","all"],["VIJESTI","vanjski"],["NAŠI TEKSTOVI","autorski"]];
 let active="all";
 const valid=item=>item&&typeof item.title==="string"&&typeof item.source==="string"&&typeof item.description==="string"&&typeof item.url==="string"&&(/^https:\/\//.test(item.url)||item.url.startsWith("./"));
 const approved=entries.filter(valid);
 const tabs=document.getElementById("desk-filter");
 const make=(tag,cls,txt)=>{const el=document.createElement(tag);if(cls)el.className=cls;if(txt!=null)el.textContent=txt;return el;};
 const draw=()=>{
  target.replaceChildren();
  const entries=approved.filter(x=>active==="all"||x.kind===active).sort((a,b)=>String(b.date||"").localeCompare(String(a.date||"")));
  for(const item of entries){
   const a=make("a","desk-story"),tag=make("span","p-label",item.category+" / "+(item.kind==="vanjski"?"VANJSKI IZVOR":"AUTORSKI TEKST"));
   const title=make("h3","",item.title),desc=make("p","",item.description);
   const meta=make("small","",item.source+(item.date?" · "+item.date.split("-").reverse().join("."):"")+" · OTVORI IZVOR ↗");
   a.href=item.url;if(item.kind==="vanjski"){a.target="_blank";a.rel="noopener noreferrer";}
   a.append(tag,title,desc,meta);target.append(a);
  }
  if(!entries.length)target.append(make("p","dim","Trenutno nema odabranih naslova."));
 };
 for(const [label,value]of categories){
  const button=make("button","",label);button.type="button";button.setAttribute("aria-pressed",String(value===active));
  button.addEventListener("click",()=>{active=value;for(const x of tabs.children)x.setAttribute("aria-pressed",String(x===button));draw();});
  tabs.append(button);
 }
 draw();
})();