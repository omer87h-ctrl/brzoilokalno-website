"use strict";
(async()=>{
 const topics=window.BL_UNIVERSE_TOPICS||[];
 const $=id=>document.getElementById(id),create=(tag,cls,txt)=>{const e=document.createElement(tag);if(cls)e.className=cls;if(txt!==undefined)e.textContent=txt;return e};
 const fold=s=>String(s||"").normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLowerCase();
 const key="bl-tech-universe-saved-v1";
 let saved=[];try{let ids=JSON.parse(localStorage.getItem(key)||"[]");if(Array.isArray(ids))saved=ids.filter(id=>topics.some(t=>t.id===id));}catch{}
 const keep=()=>{try{localStorage.setItem(key,JSON.stringify(saved));return true}catch{return false}};
 let category="SVE",query=$("universe-query").value;
 const cats=["SVE",...new Set(topics.map(t=>t.category))];
 const filter=$("universe-categories");
 cats.forEach(cat=>{
  const b=create("button","",cat);b.type="button";b.setAttribute("aria-pressed",String(cat===category));
  b.addEventListener("click",()=>{category=cat;for(const el of filter.children)el.setAttribute("aria-pressed",String(el===b));render();});
  filter.append(b);
 });
 function card(t){
  const article=create("article","universe-card");
  article.append(create("span","cat",t.category),create("h3","",t.title),create("p","",t.description),create("span","source","IZVOR: "+t.source));
  const actions=create("div","actions");
  const a=create("a","","ISTRAŽI ↗");a.href=t.url;
  if(t.url.startsWith("https://")){a.target="_blank";a.rel="noopener noreferrer";}
  const b=create("button","",saved.includes(t.id)?"SAČUVANO ✓":"SAČUVAJ +");b.type="button";b.setAttribute("aria-pressed",String(saved.includes(t.id)));
  b.addEventListener("click",()=>{
   saved=saved.includes(t.id)?saved.filter(id=>id!==t.id):[...saved,t.id];
   if(!keep()){saved=saved.includes(t.id)?saved.filter(id=>id!==t.id):[...saved,t.id];alert("Lokalna pohrana nije dostupna.");return;}
   render();
  });
  actions.append(a,b);article.append(actions);return article;
 }
 function render(){
  const words=fold(query).trim().split(/\s+/).filter(Boolean);
  const matches=topics.filter(t=>(category==="SVE"||t.category===category)&&words.every(w=>fold([t.title,t.description,t.category,t.source].join(" ")).includes(w)));
  $("universe-results").replaceChildren(...matches.map(card));
  if(!matches.length)$("universe-results").append(create("p","universe-meta","Nema rezultata. Pokušaj drugi pojam ili oblast."));
  $("universe-results-count").textContent=matches.length+" TEMA / "+topics.length+" UKUPNO";
  const items=topics.filter(t=>saved.includes(t.id));
  $("universe-saved").replaceChildren(...items.map(card));
  if(!items.length)$("universe-saved").append(create("p","universe-meta","Još nisi sačuvao nijednu temu. Izaberi SAČUVAJ + pored teme koja te zanima."));
 }
 $("universe-query").addEventListener("input",e=>{query=e.target.value;render()});
 $("universe-reset").addEventListener("click",()=>{$("universe-query").value="";query="";category="SVE";for(const b of filter.children)b.setAttribute("aria-pressed",String(b.textContent===category));render();$("universe-query").focus()});
 $("universe-clear-saved").addEventListener("click",()=>{if(!saved.length)return;if(!confirm("Obrisati listu sačuvanih tema na ovom uređaju?"))return;const old=[...saved];saved=[];if(!keep()){saved=old;alert("Lokalna pohrana nije dostupna.")}render()});
 window.addEventListener("storage",e=>{if(e.key!==key)return;try{const v=JSON.parse(e.newValue||"[]");saved=Array.isArray(v)?v.filter(id=>topics.some(t=>t.id===id)):[];}catch{saved=[]}render()});
 render();
 const allowed={"github.blog":"SOFTVER","hacks.mozilla.org":"WEB","www.nasa.gov":"NAUKA","science.nasa.gov":"NAUKA","blog.google":"AI","blog.mozilla.org":"WEB","www.microsoft.com":"SOFTVER","www.cisa.gov":"SIGURNOST","www.android.com":"UREĐAJI","developer.android.com":"UREĐAJI","www.reuters.com":"AI","developer.android.com":"UREĐAJI"};
 const parseNews=payload=>{if(!payload||!Array.isArray(payload.stories))return [];return payload.stories.filter(item=>{
  if(typeof item.title!=="string"||item.title.length<9||item.title.length>180||typeof item.source!=="string"||typeof item.date!=="string"||!/^20\d\d-\d\d-\d\d$/.test(item.date))return false;
  try{const u=new URL(item.url);return u.protocol==="https:"&&Object.hasOwn(allowed,u.hostname)&&item.kind==="vanjski"}catch{return false}
 }).slice(0,90)};
 const output=$("universe-news-grid"),status=$("universe-news-status"),selector=$("universe-news-filter");
 let allNews=[];
 function paint(){
  const category=selector.value;
  const items=allNews.filter(x=>category==="Sve"||x.category===category).slice(0,36);
  output.replaceChildren();
  if(!items.length){output.append(create("p","universe-meta","Trenutno nema objavljenih naslova u ovoj oblasti. Istraži tematske vodiče iznad ili posjeti izvore."));return;}
  for(const item of items){
   const a=create("a","news-card");a.href=item.url;a.target="_blank";a.rel="noopener noreferrer";
   a.append(create("small","",item.source+" · "+item.date),create("strong","",item.title),create("p","","OTVORI IZVORNU OBJAVU ↗"));
   output.append(a);
  }
 }
 selector.addEventListener("change",paint);
 try{
  const response=await fetch("./news-archive.json",{cache:"no-store"});if(!response.ok)throw Error("Arhiva nije dostupna");
  const archive=await response.json();
  allNews=parseNews(archive);
  const updated=archive.updated||"";
  status.textContent=allNews.length?allNews.length+" ARHIVIRANIH NASLOVA · POSLJEDNJE AŽURIRANJE "+updated:"AUTOMATSKA ARHIVA JOŠ NIJE POPUNJENA";
 }catch{status.textContent="ARHIVA TRENUTNO NIJE DOSTUPNA · OTVORI IZVORE";}
 paint();
})();