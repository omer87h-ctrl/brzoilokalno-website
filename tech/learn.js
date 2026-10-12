"use strict";
(()=>{
const tracks=window.BL_TECH_LEARNING||[],root=document.getElementById("learning-academy");if(!root||!tracks.length)return;
const el=(tag,cls,value)=>{const e=document.createElement(tag);if(cls)e.className=cls;if(value!==undefined)e.textContent=value;return e;};
const key="bl-tech-learning-v1",notesKey="bl-tech-learning-notes-v1";
const all=tracks.flatMap(t=>t.lessons.map(l=>t.id+":"+l.id));
let completed=[],notes={};
try{const x=JSON.parse(localStorage.getItem(key)||"[]");if(Array.isArray(x))completed=x.filter(id=>all.includes(id));}catch{}
try{const x=JSON.parse(localStorage.getItem(notesKey)||"{}");if(x&&typeof x==="object"&&!Array.isArray(x))notes=x;}catch{}
const incoming=new URLSearchParams(location.search);let currentTrack=tracks.find(t=>t.id===incoming.get("tema"))||tracks[0],currentLesson=Math.max(0,currentTrack.lessons.findIndex(l=>l.id===incoming.get("lekcija"))),answered=false;
const save=()=>{try{localStorage.setItem(key,JSON.stringify(completed));return true;}catch{return false;}};
const saveNotes=()=>{try{localStorage.setItem(notesKey,JSON.stringify(notes));return true;}catch{return false;}};
const buttons=document.getElementById("academy-tracks"),lessonList=document.getElementById("academy-lessons"),content=document.getElementById("academy-content"),progress=document.getElementById("academy-progress"),total=document.getElementById("academy-total"),message=document.getElementById("academy-status");
function refreshProgress(){
 const done=completed.filter(id=>all.includes(id)).length;
 progress.style.width=(done/all.length*100)+"%";
 progress.parentElement.setAttribute("aria-valuenow",String(Math.round(done/all.length*100)));
 total.textContent=done+" od "+all.length+" završenih lekcija";
 for(const b of buttons.children)b.setAttribute("aria-pressed",String(b.dataset.track===currentTrack.id));
 for(const [i,b] of [...lessonList.children].entries()){
  const id=currentTrack.id+":"+currentTrack.lessons[i].id;
  b.setAttribute("aria-current",String(i===currentLesson));
  b.querySelector(".academy-lesson-state").textContent=completed.includes(id)?"ZAVRŠENO ✓":i===currentLesson?"OTVORENO":"OTVORI";
 }
}
function drawLessons(){
 lessonList.replaceChildren();
 currentTrack.lessons.forEach((l,i)=>{
  const b=el("button","academy-lesson");
  b.type="button";
  b.append(el("span","academy-lesson-number",String(i+1).padStart(2,"0")),el("strong","",l.title),el("span","academy-lesson-state","OTVORI"));
  b.addEventListener("click",()=>{currentLesson=i;drawContent();});
  lessonList.append(b);
 });
}
function drawContent(){
 answered=false;const lesson=currentTrack.lessons[currentLesson],id=currentTrack.id+":"+lesson.id;
 content.replaceChildren();
 const head=el("div","academy-content-heading");
 head.append(el("span","p-label",currentTrack.label+" / LEKCIJA "+(currentLesson+1)+"/"+currentTrack.lessons.length),el("h3","",lesson.title),el("p","",lesson.goal));
 content.append(head);
 for(const [title,body] of lesson.sections){
  const sec=el("section","academy-teaching");
  sec.append(el("h4","",title),el("p","",body));content.append(sec);
 }
 const example=el("section","academy-example");
 example.append(el("span","p-label","PRIMJER IZ PRAKSE"),el("p","",lesson.example));content.append(example);
 const task=el("section","academy-task");
 task.append(el("span","p-label","PROBAJ SAM"),el("h4","",lesson.task));
 const textarea=el("textarea","academy-notes");
 textarea.rows=3;textarea.maxLength=1600;textarea.id="academy-note-"+currentTrack.id+"-"+lesson.id;const noteLabel=el("label","academy-notes-label","TVOJA BILJEŠKA · ČUVA SE NA UREĐAJU");noteLabel.htmlFor=textarea.id;textarea.placeholder="Ovdje možeš zapisati svoje razmišljanje. Ostaje na ovom uređaju.";
 textarea.value=typeof notes[id]==="string"?notes[id]:"";
 const noteBar=el("div","academy-note-actions");
 const saveBtn=el("button","","SAČUVAJ BILJEŠKU");
 saveBtn.type="button";
 const noteStatus=el("span","academy-note-status","Bilješka nije automatski sačuvana.");
 saveBtn.addEventListener("click",()=>{
  notes[id]=textarea.value;noteStatus.textContent=saveNotes()?"Bilješka je sačuvana samo na ovom uređaju.":"Lokalna pohrana nije dostupna. Kopiraj tekst.";
 });
 noteStatus.setAttribute("role","status");noteBar.append(saveBtn,noteStatus);task.append(noteLabel,textarea,noteBar);content.append(task);
 const quiz=el("section","academy-check");
 quiz.append(el("span","p-label","PROVJERI RAZUMIJEVANJE"),el("h4","",lesson.question));
 const opts=el("div","academy-choices"),feedback=el("div","academy-feedback");
 feedback.setAttribute("role","status");feedback.setAttribute("aria-live","polite");
 lesson.choices.forEach((choice,i)=>{
  const btn=el("button","academy-choice",choice);btn.type="button";
  btn.addEventListener("click",()=>{
   if(answered)return;
   for(const b of opts.children)b.setAttribute("aria-pressed",String(b===btn));
   feedback.replaceChildren();
   if(i!==lesson.correct){
    feedback.append(el("strong","","Nije tačno. Pokušaj ponovo."),el("p","",lesson.explanation));
    return;
   }
   answered=true;
   for(const b of opts.children)b.disabled=true;
   if(!completed.includes(id))completed.push(id);
   const persisted=save();
   feedback.append(el("strong","","Tačno — lekcija je završena."),el("p","",lesson.explanation));
   if(!persisted)feedback.append(el("p","","Napredak trenutno nije moguće sačuvati u pregledniku."));
   refreshProgress();
   const next=el("button","academy-next",currentLesson<currentTrack.lessons.length-1?"SLJEDEĆA LEKCIJA ↗":"ZAVRŠI TEMU ↗");
   next.type="button";next.addEventListener("click",()=>{
    if(currentLesson<currentTrack.lessons.length-1){currentLesson++;drawContent();}
    else{const index=tracks.findIndex(t=>t.id===currentTrack.id);currentTrack=tracks[(index+1)%tracks.length];currentLesson=0;drawLessons();drawContent();}
    root.scrollIntoView({behavior:matchMedia("(prefers-reduced-motion: reduce)").matches?"instant":"smooth",block:"start"});
   });
   feedback.append(next);
  });
  opts.append(btn);
 });
 quiz.append(opts,feedback);content.append(quiz);
 const source=el("a","academy-source",lesson.linkText+" ↗");source.href=lesson.link;
 if(lesson.link.startsWith("https://")){source.target="_blank";source.rel="noopener noreferrer";}
 content.append(source);refreshProgress();
}
for(const track of tracks){
 const b=el("button","academy-track",track.label);
 b.dataset.track=track.id;b.type="button";
 b.append(el("span","academy-track-heading",track.title),el("span","academy-track-sub",track.description));
 b.addEventListener("click",()=>{currentTrack=track;currentLesson=0;drawLessons();drawContent();});
 buttons.append(b);
}
drawLessons();drawContent();
document.getElementById("academy-clear")?.addEventListener("click",()=>{
 if(!confirm("Obrisati lokalno sačuvan napredak i bilješke za svih 15 lekcija?"))return;
 completed=[];notes={};
 try{localStorage.removeItem(key);localStorage.removeItem(notesKey);message.textContent="Lokalni napredak i bilješke su obrisani.";}
 catch{message.textContent="Pohranu nije moguće obrisati u ovom pregledniku.";}
 drawContent();
});
})();
