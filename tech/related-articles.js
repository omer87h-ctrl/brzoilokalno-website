"use strict";
(()=>{
 const script=document.currentScript;
 const slug=location.pathname.split("/").pop()?.replace(/\.html$/,"");
 const entries={
 "kako-birati-telefon":[["Uporedi modele","Provjeri specifikacije i upiši vlastiti budžet.","/tech/telefoni.html"],["Digitalna privatnost","Sigurnost je važan dio izbora uređaja.","/tech/clanci/digitalna-privatnost.html"],["TECH zona","Pročitaj druge vodiče o uređajima.","/tech/tech-zona.html"]],
 "kako-birati-slusalice":[["Poređenje telefona","Uređaj i slušalice biraj prema stvarnoj upotrebi.","/tech/telefoni.html"],["Digitalna privatnost","Korisne navike za povezane uređaje.","/tech/clanci/digitalna-privatnost.html"]],
 "ai-alat-ili-proizvod":[["Od ideje do proizvoda","Kako graditi proizvod koji rješava problem.","/tech/clanci/od-ideje-do-proizvoda.html"],["Biblioteka","Pročitaj mini-knjigu o izgradnji proizvoda.","/tech/citaj.html?resurs=od-ideje-do-proizvoda.txt"],["Autorski studio","Napiši svoju tehnološku analizu.","/tech/studio.html"]],
 "pwa-ili-android":[["Od ideje do proizvoda","Počni od potreba korisnika.","/tech/clanci/od-ideje-do-proizvoda.html"],["QA kontrolna lista","Provjeri mobilni prikaz i osnovne tokove.","/tech/citaj.html?resurs=qa-kontrolna-lista.txt"],["Alati za rad","Istraži besplatne programe za praktičan rad.","/tech/alati.html"]],
 "digitalna-privatnost":[["Kontrolna lista privatnosti","Praktična lista za sigurnost naloga.","/tech/citaj.html?resurs=kontrolna-lista-privatnosti.txt"],["Izbor telefona","Sigurnosna podrška i izbor uređaja.","/tech/clanci/kako-birati-telefon.html"]],
 "od-ideje-do-proizvoda":[["Mini-knjiga o proizvodu","Nastavi čitanje u Biblioteci.","/tech/citaj.html?resurs=od-ideje-do-proizvoda.txt"],["Plan projekta","Preuzmi i popuni predložak za svoj projekat.","/tech/citaj.html?resurs=plan-projekta.csv"],["Autorski studio","Napiši vlastitu priču o projektu.","/tech/studio.html"]]
 };
 const list=entries[slug]||[],article=document.querySelector(".article-layout");
 // Save an article directly from its reader view; shares Discovery's local collection.
 // Reading progress is calculated locally; no history or analytics sent anywhere.
 if(article){
  const progress=document.createElement("div");
  progress.className="bl-reading-progress";
  progress.setAttribute("role","progressbar");
  progress.setAttribute("aria-label","Napredak čitanja članka");
  progress.setAttribute("aria-valuemin","0");progress.setAttribute("aria-valuemax","100");
  const bar=document.createElement("span");progress.append(bar);document.body.prepend(progress);
  let queued=false,last=-1;
  const update=()=>{
   queued=false;
   const top=article.getBoundingClientRect().top+window.scrollY;
   const bottom=top+article.offsetHeight;
   const space=Math.max(1,bottom-top-window.innerHeight*.55);
   const percent=Math.round(Math.min(100,Math.max(0,((window.scrollY-top)/space)*100)));
   if(percent===last)return;last=percent;
   bar.style.width=percent+"%";
   progress.setAttribute("aria-valuenow",String(percent));
  };
  const schedule=()=>{if(queued)return;queued=true;requestAnimationFrame(update);};
  window.addEventListener("scroll",schedule,{passive:true});
  window.addEventListener("resize",schedule,{passive:true});
  update();
 }
 // Share only the canonical URL of a publicly available article. No automatic post.
 if(article&&location.pathname.startsWith("/tech/clanci/")){
  const controls=article.querySelector(".reader-actions");
  if(controls){
   const title=article.querySelector("h1")?.textContent?.trim()||document.title;
   const canonical=document.querySelector('link[rel="canonical"]')?.href||location.href.split("#")[0];
   const share= document.createElement("a");
   share.className="article-share-link";
   share.href="https://www.linkedin.com/sharing/share-offsite/?url="+encodeURIComponent(canonical);
   share.target="_blank";share.rel="noopener noreferrer nofollow";
   share.textContent="PODIJELI NA LINKEDINU ↗";
   share.setAttribute("aria-label","Otvori LinkedIn i podijeli link na članak");
   const copy=document.createElement("button");
   copy.type="button";copy.textContent="KOPIRAJ LINK";
   const result=document.createElement("span");result.className="article-share-status";
   result.setAttribute("role","status");result.setAttribute("aria-live","polite");
   copy.addEventListener("click",async()=>{
    try{
     await navigator.clipboard.writeText(canonical);
     result.textContent="Link je kopiran. Možeš ga podijeliti gdje želiš.";
    }catch{
     result.textContent="Kopiranje nije dostupno. Označi adresu stranice u pregledniku.";
    }
   });
   controls.append(share,copy,result);
  }
 }
 const actions=article?.querySelector(".reader-actions");
 if(actions&&slug){
  const storageKey="bl-tech-saved-v1";
  const getSaved=()=>{
   try{
    const stored=JSON.parse(localStorage.getItem(storageKey)||"[]");
    return Array.isArray(stored)?stored.filter(id=>typeof id==="string"):[];
   }catch{return [];}
  };
  const button=document.createElement("button");
  button.type="button";button.className="reader-save-button";
  const collection=document.createElement("a");
  collection.href="/tech/tech-zona.html#sacuvano";
  collection.className="button ghost";
  collection.textContent="MOJI SAČUVANI ↗";
  const feedback=document.createElement("span");
  feedback.className="reader-save-feedback";
  feedback.setAttribute("role","status");feedback.setAttribute("aria-live","polite");
  function sync(){
   const has=getSaved().includes(slug);
   button.textContent=has?"SAČUVANO ✓":"SAČUVAJ ČLANAK +";
   button.setAttribute("aria-pressed",String(has));
  }
  button.addEventListener("click",()=>{
   const current=getSaved(),has=current.includes(slug);
   const next=has?current.filter(id=>id!==slug):[...current,slug];
   try{
    localStorage.setItem(storageKey,JSON.stringify(next));
    sync();
    feedback.textContent=has?"Članak je uklonjen iz tvoje kolekcije.":"Članak je sačuvan na ovom uređaju.";
   }catch{
    feedback.textContent="Čuvanje nije dostupno u ovom pregledniku.";
   }
  });
  sync();actions.prepend(button,collection,feedback);
 }
 if(!article||!list.length)return;
 const section=document.createElement("section");section.className="related-editorial";section.setAttribute("aria-labelledby","related-heading");
 const over=document.createElement("span");over.className="eyebrow";over.textContent="NASTAVI ISTRAŽIVATI";
 const title=document.createElement("h2");title.id="related-heading";title.textContent="Od informacije do sljedećeg koraka.";
 const grid=document.createElement("div");grid.className="related-editorial-grid";
 for(const [label,description,url] of list){
  const a=document.createElement("a");a.href=url;a.className="related-editorial-card";
  const strong=document.createElement("strong");strong.textContent=label+" ↗";
  const p=document.createElement("p");p.textContent=description;a.append(strong,p);grid.append(a);
 }
 section.append(over,title,grid);article.append(section);
})();
