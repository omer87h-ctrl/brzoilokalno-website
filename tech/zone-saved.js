"use strict";(()=>{
  const articles=(window.BL_PORTAL_CONTENT?.articles)||[];
  const key="bl-tech-saved-v1";
  const root=document.getElementById("saved-list"),clear=document.getElementById("saved-clear");
  if(!root)return;
  let ids=[];
  const read=()=>{try{const x=JSON.parse(localStorage.getItem(key)||"[]");return Array.isArray(x)?x.filter(id=>articles.some(a=>a.id===id)):[]}catch{return[]}};
  ids=read();
  function render(){
    root.replaceChildren();
    const selected=articles.filter(a=>ids.includes(a.id));
    if(!selected.length){const p=document.createElement("p");p.className="empty";p.textContent="Još nema sačuvanih članaka. U TECH Zoni odaberi tekst i pritisni SAČUVAJ +.";root.append(p);return}
    for(const a of selected){
      const card=document.createElement("article");card.className="zone-story";
      const title=document.createElement("h3");title.textContent=a.title;
      const desc=document.createElement("p");desc.textContent=a.summary;
      const link=document.createElement("a");link.href=a.href;link.textContent="PROČITAJ ↗";
      const remove=document.createElement("button");remove.type="button";remove.className="zone-remove-saved";remove.textContent="UKLONI IZ SAČUVANOG";
      remove.addEventListener("click",()=>{ids=ids.filter(id=>id!==a.id);write()});
      card.append(title,desc,link,remove);root.append(card);
    }
  }
  function write(){try{localStorage.setItem(key,JSON.stringify(ids))}catch{}render();window.dispatchEvent(new Event("bl-tech-bookmarks-changed"))}
  clear?.addEventListener("click",()=>{ids=[];write()});
  window.addEventListener("storage",event=>{if(event.key===key){ids=read();render()}});
  window.addEventListener("bl-tech-bookmarks-changed",()=>{const next=read();if(JSON.stringify(next)!==JSON.stringify(ids)){ids=next;render()}});
  render();
})();