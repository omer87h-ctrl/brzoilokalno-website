"use strict";
/* Bosnia-language reader: sourced metadata, NOT full third-party articles. */
(async()=>{
 const $=id=>document.getElementById(id);
 const make=(tag,cls,text)=>{const e=document.createElement(tag);if(cls)e.className=cls;if(text!==undefined)e.textContent=text;return e};
 const fold=x=>String(x||"").normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLocaleLowerCase("bs");
 const kind=$("archive-category"),source=$("archive-source"),period=$("archive-period"),query=$("archive-search"),sort=$("archive-sort"),grid=$("archive-results"),status=$("archive-status"),total=$("archive-total");
 const key="bl-tech-news-saved-v1";let saved=[];
 try{const value=JSON.parse(localStorage.getItem(key)||"[]");if(Array.isArray(value))saved=value.filter(v=>typeof v==="string"&&v.length<500).slice(0,100)}catch{}
 let entries=[],updated=null;
 const persist=()=>{try{localStorage.setItem(key,JSON.stringify(saved));return true}catch{return false}};
 const permitted=new Set(["github.blog","hacks.mozilla.org","www.nasa.gov","www.theverge.com","www.bleepingcomputer.com","www.sciencedaily.com","developer.android.com","www.reuters.com"]);
 const valid=e=>{if(!e||typeof e.title!=="string"||typeof e.source!=="string"||typeof e.date!=="string"||!/^20\d\d-\d\d-\d\d$/.test(e.date)||e.kind!=="vanjski")return false;
  try{const u=new URL(e.url);return u.protocol==="https:"&&permitted.has(u.hostname)&&!u.username&&!u.password}catch{return false}};
 function addOptions(sel,values,all){sel.replaceChildren(make("option","",all));sel.firstChild.value="Sve";for(const v of values){const o=make("option","",v);o.value=v;sel.append(o)}}
 function card(item){
  const el=make("article","archive-card");
  el.append(make("span","archive-kicker",item.category+" · "+item.source),make("h3","",item.titleBs||item.title));
  const english=item.titleBs&&item.titleBs!==item.title;
  if(english)el.append(make("p","archive-original","Originalni naslov: "+item.title));
  else el.append(make("p","archive-original","Naslov izvora je na engleskom; provjeri original."));
  const desc=item.summaryBs||("Kratka urednička oznaka: "+String(item.category||"TEHNOLOGIJA").toLowerCase()+". Cijeli članak dostupno je čitati kod izdavača.");
  el.append(make("p","archive-summary",desc));
  const meta=make("div","archive-meta",item.date+" · "+(item.titleBs?"BOSANSKI PREGLED":"ORIGINALNI NASLOV"));
  const actions=make("div","archive-actions"),link=make("a","archive-read","OTVORI IZVOR ↗"),save=make("button","archive-save",saved.includes(item.url)?"SAČUVANO ✓":"SAČUVAJ");
  link.href=item.url;link.target="_blank";link.rel="noopener noreferrer nofollow";save.type="button";save.setAttribute("aria-pressed",String(saved.includes(item.url)));
  save.addEventListener("click",()=>{const old=[...saved];saved=saved.includes(item.url)?saved.filter(x=>x!==item.url):[...saved,item.url].slice(-100);if(!persist()){saved=old;status.textContent="Lokalna pohrana nije dostupna.";return}draw()});
  actions.append(link,save);el.append(meta,actions);return el;
 }
 function draw(){
  let found=entries.filter(item=>{
   if(kind.value!=="Sve"&&item.category!==kind.value)return false;
   if(source.value!=="Sve"&&item.source!==source.value)return false;
   if(period.value!=="Sve"&&item.date.slice(0,7)!==period.value)return false;
   if(query.value.trim()&&!query.value.trim().split(/\s+/).every(word=>fold([item.title,item.titleBs,item.summaryBs,item.source,item.category].join(" ")).includes(fold(word))))return false;
   if($("archive-only-saved").checked&&!saved.includes(item.url))return false;return true;
  }).sort((a,b)=>sort.value==="oldest"?a.date.localeCompare(b.date):b.date.localeCompare(a.date));
  grid.replaceChildren(...found.map(card));
  if(!found.length)grid.append(make("p","archive-empty","Nema rezultata za ove filtere. Odaberi drugu oblast, izvor ili mjesec."));
  total.textContent=found.length+" REZULTATA · "+entries.length+" U ARHIVI";
 }
 const controls=[kind,source,period,query,sort,$("archive-only-saved")];
 for(const el of controls)el.addEventListener(el===query?"input":"change",draw);
 $("archive-reset").addEventListener("click",()=>{kind.value=source.value=period.value="Sve";query.value="";sort.value="newest";$("archive-only-saved").checked=false;draw()});
 try{
  const response=await fetch("./news-archive.json",{cache:"no-store"});if(!response.ok)throw Error("Arhiva trenutno nije dostupna");
  const payload=await response.json();entries=Array.isArray(payload.stories)?payload.stories.filter(valid).slice(0,250):[];
  updated=payload.updated||null;
  // Display approved Bosnian editorial fields only if attached to this exact news item.
  addOptions(kind,[...new Set(entries.map(x=>x.category))].sort(),"Sve oblasti");
  addOptions(source,[...new Set(entries.map(x=>x.source))].sort(),"Svi izvori");
  addOptions(period,[...new Set(entries.map(x=>x.date.slice(0,7)))].sort().reverse(),"Svi mjeseci");
  status.textContent=(updated?"POSLJEDNJE USPJEŠNO AŽURIRANJE: "+updated+" · ":"")+"Vanjski naslovi vode na original. Bosanski prikazi su kratki urednički opisi, ne preuzeti članci.";
 }catch(err){status.textContent="Arhiva trenutno nije dostupna. Originalne članke možeš pratiti u TECH Svijetu i na stranici Izvori."}
 draw();
})();
