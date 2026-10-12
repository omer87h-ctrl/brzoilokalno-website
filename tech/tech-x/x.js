"use strict";
(()=>{
const $=id=>document.getElementById(id);
const steps=[
 ["Preglednik priprema zahtjev","Upišeš adresu ili dodirneš link. Preglednik odlučuje koje resurse treba zatražiti.","PREGLEDNIK"],
 ["DNS pronalazi adresu","Ako adresa nije već poznata iz predmemorije, DNS pomaže pronaći IP adresu servera. Bez nje se traženi naziv obično ne može povezati.","DNS"],
 ["Sigurna veza","Kod HTTPS-a preglednik provjerava certifikat i dogovara šifriranje. Neispravan certifikat može izazvati sigurnosno upozorenje.","TLS / HTTPS"],
 ["Server šalje odgovor","Preglednik šalje HTTP zahtjev; server može vratiti dokument, grešku ili preusmjeravanje. Odgovor preglednik obrađuje i prikazuje.","SERVER"]
];
const failures={dns:{step:1,title:"DNS nije pronašao adresu",text:"Bez odgovarajuće adrese preglednik ne zna gdje treba poslati mrežni zahtjev.",label:"PREKID U DNS KORAKU"},tls:{step:2,title:"Problem s certifikatom",text:"Preglednik upozorava jer sigurnost veze nije potvrđena. To nije dokaz da je domen pouzdan ili nepouzdan u drugim aspektima.",label:"SIGURNOSNO UPOZORENJE"},server:{step:3,title:"Server nije dostupan",text:"Veza može biti uspostavljena, ali server ne uspijeva odgovoriti. Razlozi uključuju kvar ili privremenu nedostupnost.",label:"NEMA ODGOVORA SERVERA"}};
let webIndex=-1;const nodes=[...document.querySelectorAll("[data-net]")],webMode=$("web-mode");
function showStep(){nodes.forEach((node,i)=>{node.classList.toggle("active",i<=webIndex);node.classList.toggle("failed",i===webIndex&&failures[webMode.value]?.step===i)});
if(webIndex<0){$("web-title").textContent="Spremno za eksperiment.";$("web-explain").textContent="Izaberi scenarij i prati šta se događa.";$("web-counter").textContent="KORAK 00 / 04";$("web-status").textContent="SIMULACIJA NIJE POKRENUTA";$("web-start").textContent="POKRENI TOK →";return}
const fail=failures[webMode.value];const broken=fail?.step===webIndex;
$("web-counter").textContent="KORAK "+String(webIndex+1).padStart(2,"0")+" / 04";
$("web-title").textContent=broken?fail.title:steps[webIndex][0];
$("web-explain").textContent=broken?fail.text:steps[webIndex][1];
$("web-status").textContent=broken?fail.label:webIndex===3?"ODGOVOR USPJEŠNO PRIKAZAN":"KORAK U TOKU · "+steps[webIndex][2];
$("web-start").textContent=broken||webIndex===3?"POČNI PONOVO ↻":"SLJEDEĆI KORAK →";
}
$("web-start")?.addEventListener("click",()=>{const fail=failures[webMode.value];webIndex=webIndex>=3||(fail&&webIndex===fail.step)?0:webIndex+1;showStep()});
webMode?.addEventListener("change",()=>{webIndex=-1;showStep()});showStep();
const permissions=$("permission-form");
function permissionResult(){const data=new FormData(permissions),active=["location","camera","microphone"].filter(x=>data.has(x));$("permission-count").textContent=String(active.length);
const map={location:"Lokacija: aplikacija može zatražiti informacije o položaju u granicama datog pristupa.",camera:"Kamera: aplikacija može koristiti snimanje slike ili videa kada je pristup dozvoljen.",microphone:"Mikrofon: aplikacija može pristupiti zvuku kada je pristup dozvoljen."};
$("permission-explain").textContent=active.length? "Uključio/la si "+active.length+" zamišljene dozvole. To ne znači da se one uvijek koriste.":"Nijedna simulirana dozvola nije uključena.";
const details=$("permission-details");details.replaceChildren();(active.length?active.map(x=>map[x]):["Kamera, mikrofon i lokacija nisu dostupni u ovom scenariju."]).forEach(x=>{const li=document.createElement("li");li.textContent=x;details.append(li)});
}
permissions?.addEventListener("change",permissionResult);permissions?.addEventListener("reset",()=>queueMicrotask(permissionResult));permissionResult();
const escapeHTML=t=>String(t).replace(/[&<>"']/g,ch=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[ch]));
const themes={night:{bg:"#101c2b",text:"#f3f9ff",accent:"#74d9e8"},light:{bg:"#ffffff",text:"#142638",accent:"#2c6480"},ocean:{bg:"#052f38",text:"#f1fcfc",accent:"#92d7c2"}};
function generate(){const title=$("site-title").value.trim()||"Moja web stranica",message=$("site-message").value.trim(),palette=themes[$("site-theme").value]||themes.night;
return '<!doctype html>\n<html lang="bs"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>'+escapeHTML(title)+'</title><style>*{box-sizing:border-box}body{min-height:100vh;margin:0;display:grid;place-items:center;padding:30px;background:'+palette.bg+';color:'+palette.text+';font-family:system-ui,sans-serif}main{max-width:650px}h1{color:'+palette.accent+';font-size:clamp(30px,6vw,60px);line-height:1.1}p{font-size:18px;line-height:1.7;white-space:pre-wrap}</style></head><body><main><h1>'+escapeHTML(title)+'</h1><p>'+escapeHTML(message)+'</p></main></body></html>';
}
let rendered="";function paint(){rendered=generate();$("site-preview").srcdoc=rendered;$("builder-status").textContent="Pregled ažuriran. Spreman za preuzimanje.";$("mission-finish").textContent="TVOJ ORIGINALNI HTML PRIPREMLJEN";}
$("builder-form")?.addEventListener("submit",e=>{e.preventDefault();paint()});
$("builder-form")?.addEventListener("input",()=>{paint()});
$("download-html")?.addEventListener("click",()=>{paint();const blob=new Blob([rendered],{type:"text/html;charset=utf-8"});const url=URL.createObjectURL(blob),a=document.createElement("a");a.href=url;a.download="moja-tech-x-stranica.html";document.body.append(a);a.click();a.remove();$("mission-finish").textContent="HTML DATOTEKA PRIPREMLJENA ZA PREUZIMANJE";setTimeout(()=>URL.revokeObjectURL(url),1000)});paint();
const promiseKey="bl-tech-x-promises-v1";
function validateRecord(x){if(!x||typeof x.name!=="string"||!x.name.trim()||x.name.length>180||typeof x.note!=="string"||x.note.length>2000)throw Error("Neispravan zapis.");const u=new URL(x.source);if(u.protocol!=="https:"||u.username||u.password||x.source.length>1000)throw Error("Izvor mora biti javni HTTPS link.");if(!/^\d{4}-\d{2}-\d{2}$/.test(x.date)||new Date(x.date).toISOString().slice(0,10)!==x.date)throw Error("Neispravan datum.");return {name:x.name,source:u.href,date:x.date,note:x.note};}
let journalManager,editIndex=null,records=[];try{const raw=JSON.parse(localStorage.getItem(promiseKey)||"[]");records=Array.isArray(raw)?raw.flatMap(x=>{try{return[validateRecord({...x,note:x.note||""})]}catch{return[]}}).slice(0,300):[]}catch{}
function persist(){try{localStorage.setItem(promiseKey,JSON.stringify(records));journalManager?.record();return true}catch{return false}}
function renderPromises(){const root=$("promise-list");root.replaceChildren();if(!records.length){const p=document.createElement("p");p.className="muted";p.textContent="Nema unosa. Dodaj javnu tvrdnju koju želiš pratiti.";root.append(p);return}
records.forEach((rec,i)=>{const box=document.createElement("article");box.className="promise-card";const h=document.createElement("h3");h.textContent=rec.name;const date=document.createElement("p");date.textContent="Datum: "+rec.date;const note=document.createElement("p");note.textContent=rec.note||"Nema zabilježenog ishoda.";const a=document.createElement("a");a.textContent="OTVORI ORIGINALNI IZVOR ↗";a.href=rec.source;a.rel="noopener noreferrer";a.target="_blank";const remove=document.createElement("button");remove.type="button";remove.textContent="UKLONI UNOS";remove.addEventListener("click",()=>{const previous=[...records];records.splice(i,1);if(!persist())records=previous;renderPromises()});const edit=TEZ.button("UREDI ZAPIS",()=>{$("promise-name").value=rec.name;$("promise-source").value=rec.source;$("promise-date").value=rec.date;$("promise-note").value=rec.note;editIndex=i;$("promise-name").focus();});box.append(h,date,note,a,document.createElement("br"),edit,remove);root.append(box)})}
$("promise-date").valueAsDate=new Date();
$("promise-form")?.addEventListener("submit",e=>{e.preventDefault();const name=$("promise-name").value.trim(),source=$("promise-source").value.trim(),date=$("promise-date").value,note=$("promise-note").value.trim();let uri;try{uri=new URL(source)}catch{return}if(uri.protocol!=="https:"||!name||!date){alert("Unesi javni HTTPS izvor, datum i tvrdnju.");return}const before=[...records];let entry;try{entry=validateRecord({name,source,date,note});}catch(error){alert(error.message);return}if(editIndex!==null){records[editIndex]=entry;editIndex=null;}else{if(records.length>=300){alert("Dnevnik ima 300 zapisa. Izvezi rezervnu kopiju i ukloni nepotrebne zapise.");return;}records.unshift(entry);}if(!persist()){records=before;alert("Pohrana nije dostupna u ovom pregledniku.");return}e.target.reset();$("promise-date").valueAsDate=new Date();renderPromises()});
$("promise-clear")?.addEventListener("click",()=>{if(!records.length||!confirm("Obrisati cijeli privatni dnevnik na ovom uređaju?"))return;const original=[...records];records=[];if(!persist())records=original;renderPromises()});renderPromises();
journalManager=TEZ.projectPanel({app:"journal",key:promiseKey,read:()=>({records}),apply:d=>{records=d.records;editIndex=null;renderPromises();},validate:d=>{if(!d||!Array.isArray(d.records)||d.records.length>300)throw Error("Neispravan dnevnik.");return {records:d.records.map(validateRecord)};},root:$("promise-list").parentElement});
})();

