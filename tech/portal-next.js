"use strict";
/* Brzo i Lokalno TECH: editorial navigator and source-based discovery.
   No accounts, analytics, external APIs, AI, calculators or user profiling. */
(()=>{
 const $=id=>document.getElementById(id);
 const data=window.BL_PORTAL_CONTENT||{articles:[],materials:[]};
 const create=(tag,cls,text)=>{
  const node=document.createElement(tag);
  if(cls)node.className=cls;
  if(text!==undefined)node.textContent=String(text);
  return node;
 };
 const focus=[
  {id:"learn",label:"ŽELIM NAUČITI",number:"01",title:"Od pitanja do znanja.",description:"Originalni vodiči, objašnjenja i praktični materijali. Bez suvišnih riječi.",links:[
   ["Otvori autorske analize","https://tech.brzoilokalno.com/tech-zona.html?r=20261011-navfix"],
   ["Počni učiti u TECH Akademiji","./discovery.html#learning-academy"],
   ["Pregledaj biblioteku","./biblioteka.html"]]},
  {id:"tech",label:"ZANIMAJU ME UREĐAJI",number:"02",title:"Izaberi na osnovu činjenica.",description:"Provjeri podatke o telefonima, pročitaj vodiče i saznaj šta specifikacije zaista znače.",links:[
   ["Poređenja telefona","./telefoni.html"],
   ["Kako birati telefon","./clanci/kako-birati-telefon.html"],
   ["Kako birati slušalice","./clanci/kako-birati-slusalice.html"]]},
  {id:"security",label:"ŽELIM SIGURNIJE KORISTITI WEB",number:"03",title:"Privatnost nije sporedna tema.",description:"Nauči prepoznati rizike i provjeri postavke koje su važne za tvoje naloge.",links:[
   ["Vodič kroz digitalnu privatnost","./clanci/digitalna-privatnost.html"],
   ["Kontrolna lista privatnosti","./citaj.html?resurs=kontrolna-lista-privatnosti.txt"],
   ["Provjeri svoje znanje","./#tech-provjera"]]},
  {id:"create",label:"ŽELIM RAZVIJATI IDEJU",number:"04",title:"Ideja je početak. Rad je sljedeći korak.",description:"Od prototipa i besplatnih programa do vlastitog autorskog teksta.",links:[
   ["Od ideje do proizvoda","./clanci/od-ideje-do-proizvoda.html"],
   ["Istraži besplatan softver","./alati.html"],
   ["Kreiraj autorski tekst","./studio.html"]]},
  {id:"follow",label:"PRATIM TEHNOLOGIJU",number:"05",title:"Naslov je početak. Izvor je obavezan.",description:"Urednički odabrane vijesti i povezane teme, s direktnim linkovima na originalne objave.",links:[
   ["Najnoviji dostupni izvori","./izvori.html"],
   ["Istraži 32 TECH teme","https://tech.brzoilokalno.com/svijet.html?r=20261011-navfix#otkrij"],
   ["Sve objavljene analize","https://tech.brzoilokalno.com/tech-zona.html?r=20261011-navfix"]]}
 ];
 const focusTabs=$("blnext-focus-tabs"),focusContent=$("blnext-focus-content");
 function renderFocus(item){
  if(!focusContent)return;
  focusContent.replaceChildren();
  focusContent.append(
   create("span","blnext-overline","TECH / PUTANJA "+item.number),
   create("h3","",item.title),
   create("p","blnext-focus-description",item.description)
  );
  const routes=create("div","blnext-routes");
  for(const [name,url] of item.links){
   const a=create("a","blnext-route");
   a.href=url;
   a.append(create("span","",name),create("strong","","↗"));
   routes.append(a);
  }
  focusContent.append(routes);
 }
 if(focusTabs&&focusContent){
  for(const [i,item] of focus.entries()){
   const btn=create("button","blnext-choice",item.label);
   btn.type="button";btn.setAttribute("aria-pressed",String(i===0));
   btn.addEventListener("click",()=>{
    for(const other of focusTabs.children)other.setAttribute("aria-pressed",String(other===btn));
    renderFocus(item);
   });
   focusTabs.append(btn);
  }
  renderFocus(focus[0]);
 }
 const count=$("blnext-content-count"),saved=$("blnext-saved-count"),resume=$("blnext-resume");
 if(count)count.textContent=(data.articles?.length||0)+" autorskih tekstova · "+(data.materials?.length||0)+" besplatna resursa";
 if(saved){
  let stored=[];
  try{
   const values=JSON.parse(localStorage.getItem("bl-tech-saved-v1")||"[]");
   if(Array.isArray(values))stored=values.filter(id=>data.articles.some(a=>a.id===id));
  }catch{}
  saved.textContent=stored.length===1?"1 sačuvan članak":stored.length+" sačuvanih članaka";
  const first=data.articles.find(a=>stored.includes(a.id));
  if(resume&&first){resume.href=first.href;resume.textContent="NASTAVI: "+first.title+" ↗";}
 }
 const pulse=$("blnext-pulse");
 function renderPulse(){
  if(!pulse)return;
  pulse.replaceChildren();
  const items=(Array.isArray(window.BL_TECH_PULSE)?window.BL_TECH_PULSE:[])
   .filter(x=>x&&x.kind==="vanjski"&&typeof x.title==="string"&&typeof x.source==="string"&&typeof x.url==="string"&&/^https:\/\//i.test(x.url))
   .slice(0,3);
  if(!items.length){pulse.append(create("p","blnext-pulse-empty","Trenutno nema vanjskih naslova. Posjeti stranicu Izvori i vijesti."));return;}
  const heading=$("blnext-pulse-status");
  if(heading){
   const updated=window.BL_TECH_PULSE_UPDATED;
   heading.textContent=window.BL_TECH_PULSE_METHOD==="automatski-rss"&&updated
    ?"RSS / NASLOVI S IZVOROM / AŽURIRANO "+updated
    :"UREDNIČKI ODABRANI NASLOVI / OTVORI ORIGINAL";
  }
  for(const item of items){
   const link=create("a","blnext-pulse-item");
   link.href=item.url;link.target="_blank";link.rel="noopener noreferrer";
   const meta=create("span","blnext-pulse-meta",item.source+" · "+(item.date||"datum nije naveden"));
   const title=create("strong","",item.titleBs||item.title);
   link.append(meta,title,create("span","blnext-pulse-arrow","↗"));
   pulse.append(link);
  }
 }
 renderPulse();
 window.addEventListener("bl-news-updated",renderPulse);

 // Short, source-linked knowledge checks. These never pretend to fact-check an arbitrary website.
 const quiz=[
  {question:"Ako stranica koristi HTTPS, znači li to da je i prodavač pouzdan?",
   answer:false,explain:"Ne. HTTPS štiti komunikaciju. Ne garantuje da su ponuda, prodavač ili sadržaj istiniti.",
   source:"MDN / HTTPS",url:"https://developer.mozilla.org/en-US/docs/Glossary/HTTPS"},
  {question:"Radi li svaka PWA aplikacija automatski bez interneta?",
   answer:false,explain:"Ne. Offline rad zahtijeva odgovarajuću implementaciju i pohranu potrebnih resursa.",
   source:"MDN / PWA i offline rad",url:"https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps/Guides/Offline_and_background_operation"},
  {question:"Treba li web stranica tvoju dozvolu prije pristupa lokaciji putem Geolocation API-ja?",
   answer:true,explain:"Da. Preglednik mora imati korisnikovu dozvolu za pristup lokaciji.",
   source:"MDN / Geolocation API",url:"https://developer.mozilla.org/en-US/docs/Web/API/Geolocation_API"}
 ];
 const question=$("blnext-quiz-question"),buttons=$("blnext-quiz-answers"),feedback=$("blnext-quiz-feedback"),next=$("blnext-quiz-next"),counter=$("blnext-quiz-counter");
 if(question&&buttons&&feedback&&next&&counter){
  let index=0;
  function draw(){
   const item=quiz[index];
   counter.textContent="PITANJE "+(index+1)+" / "+quiz.length;
   question.textContent=item.question;
   feedback.replaceChildren();feedback.hidden=true;
   next.hidden=true;buttons.replaceChildren();
   for(const [label,value] of [["DA",true],["NE",false]]){
    const b=create("button","blnext-answer",label);
    b.type="button";
    b.addEventListener("click",()=>{
     for(const btn of buttons.children){btn.disabled=true;btn.setAttribute("aria-pressed",String(btn===b));}
     feedback.hidden=false;
     feedback.append(create("strong","",value===item.answer?"TAČNO.":"OVO NIJE TAČNO."),create("p","",item.explain));
     const a=create("a","","PROVJERI IZVOR: "+item.source+" ↗");
     a.href=item.url;a.target="_blank";a.rel="noopener noreferrer";feedback.append(a);
     next.hidden=false;
    });
    buttons.append(b);
   }
  }
  next.addEventListener("click",()=>{index=(index+1)%quiz.length;draw();});
  draw();
 }
})();