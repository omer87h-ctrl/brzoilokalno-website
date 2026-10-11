"use strict";
(()=> {
 const $=id=>document.getElementById(id);
 const sources=Array.isArray(window.BL_TECH_RADAR_SOURCES)?window.BL_TECH_RADAR_SOURCES:[];
 const approved=Array.isArray(window.BL_TECH_RADAR_APPROVED)?window.BL_TECH_RADAR_APPROVED.filter(x=>x&&x.editorialApproved===true&&typeof x.title==="string"&&typeof x.kind==="string"&&typeof x.city==="string"&&typeof x.description==="string"&&/^https:\/\//.test(x.url||"")&&/^\d{4}-\d{2}-\d{2}$/.test(x.approvedDate||"")&&typeof x.organizer==="string"):[];
 const make=(tag,cls,txt)=>{const e=document.createElement(tag);if(cls)e.className=cls;if(txt!==undefined)e.textContent=txt;return e};
 const fold=s=>String(s||"").normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLocaleLowerCase("bs");
 const cleanCity=s=>fold(s).trim();
 const kind=$("radar-kind"),city=$("radar-city"),query=$("radar-query"),list=$("radar-sources"),posts=$("radar-approved");
 const current=new Date().toISOString().slice(0,10);
 function matches(item){
  const currentKind=kind.value,currentCity=city.value,term=fold(query.value.trim());
  const ci=cleanCity(item.city);
  const cityMatch=currentCity==="SVE"||ci===cleanCity(currentCity)||currentCity==="Cijela BiH"&&ci==="cijela bih"||currentCity==="Online"&&ci==="online"||ci==="cijela bih"&&currentCity!=="Online"&&currentCity!=="Drugi grad"||currentCity==="Drugi grad"&&!["online","cijela bih","sarajevo","tuzla","mostar","zenica","banja luka","bihać","brčko","bijeljina","doboj","prijedor","trebinje","travnik","goražde","kladanj"].some(x=>ci===fold(x));
  return (currentKind==="SVE"||item.kind===currentKind)&&cityMatch&&(!term||fold([item.title,item.description,item.city,item.kind,item.source||item.organizer].join(" ")).includes(term));
 }
 function refCard(item,isPost){
  const node=make("article","radar-card");
  const meta=make("span","radar-card-meta",item.kind+" / "+item.city);
  const title=make("h3","",item.title),text=make("p","",item.description);
  const origin=make("span","radar-card-source",isPost?"ODOBRENO "+item.approvedDate+" / "+item.organizer:"IZVOR / "+item.source);
  const a=make("a","radar-card-link",isPost?"ORIGINALNA OBJAVA ↗":"PROVJERI NA IZVORU ↗");
  a.href=item.url;a.target="_blank";a.rel="noopener noreferrer nofollow";
  node.append(meta,title,text,origin,a);return node;
 }
 function draw(){
  list.replaceChildren();
  const relevantSources=sources.filter(matches);
  for(const item of relevantSources)list.append(refCard(item,false));
  if(!relevantSources.length)list.append(make("p","radar-empty","Za ovaj grad i oblast još nemamo odabranu instituciju ili izvor. To ne znači da prilike ne postoje. Predloži provjerljiv izvor uredništvu."));
  $("radar-results-count").textContent=relevantSources.length+" IZVORA / "+sources.length+" U KATALOGU";
  posts.replaceChildren();
  const active=approved.filter(x=>(!x.expires||x.expires>=current)&&(!x.date||x.date>=current||x.kind==="PODCAST")).filter(matches);
  for(const item of active)posts.append(refCard(item,true));
  if(!active.length)posts.append(make("p","radar-empty","Za odabrane kriterije trenutno nema urednički odobrenih javnih objava. Ispod su provjerljivi izvori, a novi organizatori mogu poslati prijedlog."));
  $("radar-approved-status").textContent=active.length+" ODOBRENIH AKTUELNIH OBJAVA";
 }
 for(const input of [kind,city,query])input.addEventListener(input===query?"input":"change",draw);
 draw();
 const form=$("radar-submit"),status=$("radar-submit-status"),sKind=$("radar-submit-kind"),date=$("radar-submit-date");
 date.min=current;
 const urlValid=value=>{
  try{const parsed=new URL(value);return parsed.protocol==="https:"&&!!parsed.hostname&&!parsed.username&&!parsed.password}
  catch{return false}
 };
 form.addEventListener("submit",event=>{
  event.preventDefault();if(!form.reportValidity())return;
  const type=sKind.value;
  const link=$("radar-submit-link").value.trim();
  if(type!=="PODCAST"&&!urlValid(link)){status.textContent="Za događaj, posao ili edukaciju potreban je službeni HTTPS link. Unesi provjerljivu adresu.";return}
  if(link&&!urlValid(link)){status.textContent="Koristi ispravan HTTPS link, bez korisničkih podataka u adresi.";return}
  const when=date.value;
  if(when&&when<current){status.textContent="Odabrani datum je u prošlosti. Provjeri datum i pokušaj ponovo.";return}
  const rows=[
   "BRZO I LOKALNO TECH RADAR / PRIJEDLOG NA UREDNIČKI PREGLED","",
   "Vrsta: "+type,"Naziv: "+$("radar-submit-title").value.trim(),
   "Grad/format: "+$("radar-submit-city").value.trim(),
   "Organizator/autor: "+$("radar-submit-name").value.trim(),
   "Kontakt za uredništvo: "+$("radar-submit-email").value.trim(),
   "Datum (ako postoji): "+(when||"Nije naveden"),
   "Provjerljivi javni link: "+(link||"Nije naveden (podcast prijedlog)"),
   "","Opis:",$("radar-submit-description").value.trim(),"",
   "Izjava podnosioca: Imam pravo poslati sadržaj i nisam uključio tuđe privatne podatke bez ovlaštenja.",
   "Ovo je prijedlog za uredničku provjeru, ne odobrenje za automatsku objavu."
  ];
  const subject="TECH RADAR BiH / "+type+" / "+$("radar-submit-title").value.trim();
  const href="mailto:omer.creating.apps87@gmail.com?subject="+encodeURIComponent(subject)+"&body="+encodeURIComponent(rows.join("\n"));
  if(href.length>6500){status.textContent="Prijedlog je predugačak za otvaranje e-mailom. Kopiraj opis i pošalji ga direktno uredništvu.";return}
  status.textContent="Otvara se tvoj e-mail program. Poruka nije poslana dok sam ne klikneš Pošalji.";
  location.href=href;
 });
 function changeIntent(){
  sKind.value="PODCAST";
  $("radar-submit-title").placeholder="Predložena tema ili gost";
  $("predlozi").scrollIntoView({behavior:matchMedia("(prefers-reduced-motion: reduce)").matches?"auto":"smooth"});
  $("radar-submit-title").focus({preventScroll:true});
 }
 $("radar-podcast-intent")?.addEventListener("click",changeIntent);
 const params=new URLSearchParams(location.search);
 if(params.get("vrsta")==="podcast")sKind.value="PODCAST";
})();
