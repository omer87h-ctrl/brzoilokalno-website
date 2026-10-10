"use strict";
(()=>{
const $=id=>document.getElementById(id),data=window.BL_PORTAL_CONTENT||{articles:[]};
const articles=data.articles||[],out=$("radar-results"),filters=$("radar-filters");
const categories=[["SVE","all"],["ANDROID / UREĐAJI","devices"],["AI / SOFTVER","software"],["SIGURNOST","security"],["STVARALAŠTVO","create"],["VIJESTI","news"]];
const keys={devices:["Uređaji","Audio"],software:["AI","Softver"],security:["Sigurnost"],create:["Projekti"],news:[]};
const make=(tag,cls,text)=>{const e=document.createElement(tag);if(cls)e.className=cls;if(text!==undefined)e.textContent=text;return e;};
const storeKey="bl-tech-saved-v1";let saved=[];
try{const input=JSON.parse(localStorage.getItem(storeKey)||"[]");if(Array.isArray(input))saved=input.filter(id=>articles.some(a=>a.id===id));}catch{}
function save(){try{localStorage.setItem(storeKey,JSON.stringify(saved));}catch{}}
function btnArticle(a){const button=make("button","radar-save",saved.includes(a.id)?"SAČUVANO ✓":"SAČUVAJ +");button.type="button";button.setAttribute("aria-pressed",String(saved.includes(a.id)));button.addEventListener("click",()=>{saved=saved.includes(a.id)?saved.filter(id=>id!==a.id):[...saved,a.id];save();renderRadar();renderSaved();});return button;}
function story(a){const card=make("article","radar-card");const label=make("span","p-label",a.category+" / AUTORSKI VODIČ");const h=make("h3","",a.title),p=make("p","",a.summary),link=make("a","radar-card-link","PROČITAJ ↗");link.href=a.href;card.append(label,h,p,link,btnArticle(a));return card;}
let active="all";
const news=()=>Array.isArray(window.BL_TECH_PULSE)?window.BL_TECH_PULSE.filter(x=>x.kind==="vanjski"&&typeof x.title==="string"&&typeof x.url==="string"&&/^https:\/\//.test(x.url)).slice(0,6):[];
function renderRadar(){out.replaceChildren();let current=active==="all"?articles:articles.filter(a=>(keys[active]||[]).includes(a.category));if(active==="news"){const items=news();for(const item of items){const a=make("a","radar-card radar-news");a.href=item.url;a.target="_blank";a.rel="noopener noreferrer";a.append(make("span","p-label",item.source+" / VANJSKI IZVOR"),make("h3","",item.title),make("p","",item.date||"Datum nije naveden"),make("span","radar-card-link","IZVOR ↗"));out.append(a);}if(!items.length)out.append(make("p","dim","Nema dostupnih vijesti. Pogledaj listu izvora u TECH zoni."));return;}for(const a of current)out.append(story(a));if(!current.length)out.append(make("p","dim","Za ovu temu trenutno nema objavljenih autorskih tekstova."));}
categories.forEach(([label,id])=>{const b=make("button","radar-filter",label);b.type="button";b.setAttribute("aria-pressed",String(id===active));b.addEventListener("click",()=>{active=id;for(const c of filters.children)c.setAttribute("aria-pressed",String(c===b));renderRadar();});filters.append(b);});renderRadar();
function renderSaved(){const target=$("saved-list");target.replaceChildren();const found=articles.filter(a=>saved.includes(a.id));if(!found.length)target.append(make("p","dim","Još nisi sačuvao članak. Izaberi temu na Radaru i pritisni SAČUVAJ +."));for(const a of found)target.append(story(a));}
$("saved-clear").addEventListener("click",()=>{saved=[];save();renderRadar();renderSaved();});renderSaved();
window.addEventListener("bl-news-updated",()=>{if(active==="news")renderRadar();});
const facts=[
{title:"Web je nastao u CERN-u",description:"Tim Berners-Lee predložio je World Wide Web 1989. godine tokom rada u CERN-u.",source:"CERN",url:"https://home.cern/science/computing/birth-web"},
{title:"QR kod je razvijen 1994.",description:"DENSO WAVE je 1994. razvio QR kod kako bi se informacije brže očitavale.",source:"DENSO WAVE",url:"https://www.qrcode.com/en/history/"},
{title:"HTTPS štiti prenos podataka",description:"HTTPS koristi TLS za zaštitu komunikacije između preglednika i web servera. Ne garantuje da je svaka stranica pouzdana.",source:"MDN Web Docs",url:"https://developer.mozilla.org/en-US/docs/Glossary/HTTPS"}
];let factIndex=Math.floor(Date.now()/86400000)%facts.length;
function fact(){const x=facts[factIndex];$("fact-index").textContent="PROVJERENA ČINJENICA / "+String(factIndex+1).padStart(2,"0");$("fact-title").textContent=x.title;$("fact-description").textContent=x.description;$("fact-source").href=x.url;$("fact-source").textContent=x.source+" ↗";}
$("fact-next").addEventListener("click",()=>{factIndex=(factIndex+1)%facts.length;fact();});fact();
const journeys=[
{id:"start",label:"RAZVOJ PROIZVODA",title:"Od ideje do prvog proizvoda",description:"Počni s konkretnim problemom, istraži kako nastaje prototip i preuzmi predložak za planiranje.",items:[
["Pročitaj: Od ideje do prvog digitalnog proizvoda","Osnovni koraci od problema do prototipa.","./clanci/od-ideje-do-proizvoda.html"],
["Otvori mini-knjigu","Besplatan materijal za detaljnije čitanje.","./citaj.html?resurs=od-ideje-do-proizvoda.txt"],
["Preuzmi plan projekta","Predložak koji možeš dopuniti vlastitim zadacima.","./resursi/plan-projekta.csv"]]},
{id:"privacy",label:"DIGITALNA SIGURNOST",title:"Sigurniji računi i uređaji",description:"Provjeri dozvole aplikacija, postavke naloga i osnovne sigurnosne navike.",items:[
["Pročitaj: Digitalna privatnost","Kratak vodič o dozvolama, lozinkama i sigurnosti.","./clanci/digitalna-privatnost.html"],
["Otvori kontrolnu listu","Pregled navika koje vrijedi provjeriti.","./citaj.html?resurs=kontrolna-lista-privatnosti.txt"],
["Provjeri smjernice CISA-e","Zvanične informacije o digitalnoj zaštiti.","https://www.cisa.gov/secure-our-world"]]},
{id:"devices",label:"TELEFONI I AUDIO",title:"Bolje razumij uređaje",description:"Razlikuj reklamne tvrdnje od provjerljivih specifikacija. Biraj prema vlastitim potrebama.",items:[
["Kako odabrati telefon","Vodič za razumijevanje specifikacija.","./clanci/kako-birati-telefon.html"],
["Uporedi specifikacije telefona","Provjeri podatke proizvođača za modele u katalogu.","./telefoni.html"],
["Šta je važno pri izboru slušalica","Udobnost, povezivanje, baterija i zvuk.","./clanci/kako-birati-slusalice.html"]]},
{id:"publish",label:"PISANJE I OBJAVA",title:"Napiši i predloži svoj tekst",description:"Istraži teme, napravi nacrt i pošalji prijedlog redakciji kada budeš spreman.",items:[
["Istraži postojeće članke","Pročitaj objavljene autorske tekstove.","./tech-zona.html"],
["Piši u Studiju","Nacrt ostaje na tvom uređaju dok ga sam ne pošalješ.","./studio.html"],
["Pročitaj pravila objavljivanja","Provjeri uslove autorstva i uredničkog pregleda.","./pravila.html"]]}
];
const tabs=$("learning-tabs"),list=$("learning-results");
if(tabs&&list){
 let chosen=journeys[0];
 function drawJourney(){
  $("learning-title").textContent=chosen.title;$("learning-description").textContent=chosen.description;
  list.replaceChildren();
  chosen.items.forEach(([title,description,url],index)=>{
   const a=make("a","learning-link"),number=make("span","learning-step",String(index+1).padStart(2,"0")),words=make("span","learning-link-copy");
   a.href=url;if(url.startsWith("https://")){a.target="_blank";a.rel="noopener noreferrer";}
   words.append(make("strong","",title),make("small","",description));a.append(number,words,make("span","learning-arrow","↗"));list.append(a);
  });
 }
 journeys.forEach((journey,i)=>{const button=make("button","learning-tab",journey.label);button.type="button";button.setAttribute("aria-pressed",String(i===0));button.addEventListener("click",()=>{chosen=journey;for(const b of tabs.children)b.setAttribute("aria-pressed",String(b===button));drawJourney();});tabs.append(button);});
 drawJourney();
}
})();
