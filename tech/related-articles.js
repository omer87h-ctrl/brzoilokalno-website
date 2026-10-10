"use strict";
(()=>{
 const script=document.currentScript;
 const slug=location.pathname.split("/").pop()?.replace(/\.html$/,"");
 const entries={
 "kako-birati-telefon":[["Uporedi modele","Provjeri specifikacije i upiši vlastiti budžet.","/tech/telefoni.html"],["Digitalna privatnost","Sigurnost je važan dio izbora uređaja.","/tech/clanci/digitalna-privatnost.html"],["TECH zona","Pročitaj druge vodiče o uređajima.","/tech/tech-zona.html"]],
 "kako-birati-slusalice":[["Poređenje telefona","Uređaj i slušalice biraj prema stvarnoj upotrebi.","/tech/telefoni.html"],["Digitalna privatnost","Korisne navike za povezane uređaje.","/tech/clanci/digitalna-privatnost.html"]],
 "ai-alat-ili-proizvod":[["Od ideje do proizvoda","Kako graditi proizvod koji rješava problem.","/tech/clanci/od-ideje-do-proizvoda.html"],["Biblioteka","Pročitaj mini-knjigu o izgradnji proizvoda.","/tech/citaj.html?resurs=od-ideje-do-proizvoda.txt"],["Autorski studio","Napiši svoju tehnološku analizu.","/tech/studio.html"]],
 "pwa-ili-android":[["Od ideje do proizvoda","Počni od potreba korisnika.","/tech/clanci/od-ideje-do-proizvoda.html"],["QA kontrolna lista","Provjeri mobilni prikaz i osnovne tokove.","/tech/citaj.html?resurs=qa-kontrolna-lista.txt"],["Alati za rad","Istraži softver i kalkulatore.","/tech/alati.html"]],
 "digitalna-privatnost":[["Kontrolna lista privatnosti","Praktična lista za sigurnost naloga.","/tech/citaj.html?resurs=kontrolna-lista-privatnosti.txt"],["Izbor telefona","Sigurnosna podrška i izbor uređaja.","/tech/clanci/kako-birati-telefon.html"]],
 "od-ideje-do-proizvoda":[["Mini-knjiga o proizvodu","Nastavi čitanje u Biblioteci.","/tech/citaj.html?resurs=od-ideje-do-proizvoda.txt"],["Plan projekta","Preuzmi i popuni predložak za svoj projekat.","/tech/citaj.html?resurs=plan-projekta.csv"],["Autorski studio","Napiši vlastitu priču o projektu.","/tech/studio.html"]]
 };
 const list=entries[slug]||[],article=document.querySelector(".article-layout");
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