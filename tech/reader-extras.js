"use strict";
(()=>{
 const $=id=>document.getElementById(id);
 const content=$("read-content"),status=$("reading-feedback"),toc=$("reading-toc"),tocList=$("reading-toc-list");
 if(!content||!$("read-larger"))return;
 let size=17,mode="dark",key=null;
 const say=s=>{status.textContent=s;};
 const sizeChange=delta=>{size=Math.min(27,Math.max(14,size+delta));content.style.fontSize=size+"px";say("Veličina teksta: "+size+" px");};
 $("read-smaller").addEventListener("click",()=>sizeChange(-1));
 $("read-larger").addEventListener("click",()=>sizeChange(1));
 function theme(next){
  mode=next;content.dataset.readingTheme=next;
  for(const name of ["dark","sepia","day"])$("read-theme-"+name).setAttribute("aria-pressed",String(name===next));
  say(({dark:"Noćni prikaz",sepia:"Sepija",day:"Dnevni prikaz"})[next]+" uključen.");
 }
 for(const name of ["dark","sepia","day"])$("read-theme-"+name).addEventListener("click",()=>theme(name));
 function progress(){
  if(content.hidden)return;
  const rect=content.getBoundingClientRect(),span=Math.max(1,rect.height-window.innerHeight*.65);
  const value=Math.max(0,Math.min(100,Math.round(-rect.top/span*100)));
  $("reading-progress-bar").style.width=value+"%";$("reading-progress-label").textContent=value+"%";
  return value;
 }
 window.addEventListener("scroll",progress,{passive:true});
 window.addEventListener("resize",progress,{passive:true});
 $("reading-bookmark").addEventListener("click",()=>{
  if(!key){say("Prvo otvori materijal.");return;}
  try{localStorage.setItem(key,JSON.stringify({progress:progress()||0,date:new Date().toISOString().slice(0,10)}));say("Mjesto čitanja je sačuvano na ovom uređaju.");}
  catch{say("Lokalno čuvanje nije dostupno. Možeš preuzeti tekst.");}
 });
 $("reading-resume").addEventListener("click",()=>{
  if(!key){say("Prvo otvori materijal.");return;}
  try{
   const saved=JSON.parse(localStorage.getItem(key)||"null");
   if(!saved||!Number.isFinite(saved.progress)){say("Za ovu knjigu nema sačuvanog mjesta.");return;}
   const y=window.scrollY+content.getBoundingClientRect().top+Math.max(0,content.getBoundingClientRect().height-window.innerHeight*.65)*Math.min(1,Math.max(0,saved.progress/100));
   window.scrollTo({top:Math.max(0,y),behavior:matchMedia("(prefers-reduced-motion: reduce)").matches?"instant":"smooth"});
   say("Nastavljeno s "+saved.progress+"%.");
  }catch{say("Sačuvano mjesto nije dostupno.");}
 });
 window.addEventListener("bl-reader-ready",e=>{
  key="bl-tech-bookmark:"+e.detail.file;
  const headings=[...content.querySelectorAll("h2")];tocList.replaceChildren();
  headings.forEach((heading,i)=>{
   heading.id="poglavlje-"+(i+1);
   const a=document.createElement("a");a.href="#"+heading.id;a.textContent=heading.textContent;tocList.append(a);
  });
  toc.hidden=headings.length===0;progress();
  say("Čitač je spreman. Postavke se mijenjaju samo na ovom uređaju.");
 });
})();