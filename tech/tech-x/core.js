"use strict";
/* Original Environment Zero to One utilities. No network or third-party code. */
(()=>{
 const $=id=>document.getElementById(id), clone=v=>JSON.parse(JSON.stringify(v));
 const apps=[
  {app:'website',key:'bl-tech-x-visual-v1',name:'Web bez koda',url:'vizuelni-studio.html'},
  {app:'document',key:'bl-tech-x-doc-v1',name:'CV, dokument i ponuda',url:'dokumenti.html'},
  {app:'poster',key:'bl-tech-x-poster-v1',name:'Plakati',url:'plakati.html'},
  {app:'slides',key:'bl-tech-x-slides-v1',name:'Prezentacije',url:'prezentacije.html'},
  {app:'diagram',key:'bl-tech-x-diagram-v1',name:'Dijagrami',url:'dijagrami.html'},
  {app:'code',key:'bl-tech-x-webstudio-v1',name:'Web Studio',url:'studio.html'},
  {app:'journal',key:'bl-tech-x-promises-v1',name:'Dnevnik izvora',url:'index.html#vrijeme'}
 ];
 // A metadata envelope check. Each editor still validates its own content before applying it.
 function projectDatabase(key){
  if(typeof key!=='string'||!/^[a-z0-9-]{1,100}$/i.test(key))throw Error('Nepoznata aplikacija.');
  const raw=localStorage.getItem(key+'-projects-v2');if(!raw)return [];
  if(raw.length>2000000)throw Error('Zbirka projekata je prevelika.');
  const all=JSON.parse(raw),ids=new Set();
  if(!Array.isArray(all)||all.length>20)throw Error('Oštećena zbirka projekata.');
  for(const p of all){
   if(!p||typeof p.id!=='string'||!/^[a-z0-9_-]{1,80}$/i.test(p.id)||ids.has(p.id)||typeof p.name!=='string'||!p.name.trim()||p.name.length>80||!p.data||typeof p.data!=='object'||Array.isArray(p.data))throw Error('Oštećen zapis projekta; sačuvani podaci nisu izmijenjeni.');
   ids.add(p.id);
  }
  return all;
 }
 const esc=v=>String(v??"").replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const text=(v,max=10000)=>{if(typeof v!=="string"||v.length>max)throw Error("Tekst nije ispravan ili je predugačak.");return v;};
 const choice=(v,values)=>{if(!values.includes(v))throw Error("Nepoznat izbor u projektu.");return v;};
 function link(v){v=String(v||"").trim();if(!v)return "";if(/^#[a-z][\w-]*$/i.test(v))return v;try{const u=new URL(v);if(u.username||u.password)throw Error();if(u.protocol==="https:")return u.href;if(u.protocol==="mailto:"&&/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(u.pathname))return v;if(u.protocol==="tel:"&&/^\+?[\d ()-]{5,25}$/.test(u.pathname))return v;}catch{}throw Error("Koristi HTTPS adresu, valjan email ili telefonski broj.");}
 function download(name,content,type="text/plain;charset=utf-8") {const b=content instanceof Blob?content:new Blob([content],{type});const url=URL.createObjectURL(b),a=document.createElement("a");a.href=url;a.download=name;document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),10000);}
 function button(label,fn){const b=document.createElement("button");b.type="button";b.className="secondary";b.textContent=label;b.addEventListener("click",fn);return b;}
 function projectPanel({app,key,read,apply,validate,root,status}){
  const box=document.createElement("section");box.className="project-panel";box.setAttribute("aria-label","Projekti, historija i rezervna kopija");
  const heading=document.createElement("h2");heading.textContent="Tvoj rad · tvoj uređaj";
  const message=document.createElement("p");message.className="muted";message.setAttribute("role","status");
  const say=s=>{message.textContent=s;if(status)$(status).textContent=s;};
  const bar=document.createElement("div");bar.className="project-actions";
  let history=[clone(read())],cursor=0,restoring=false,timer,autoTimer;
  const undo=button("↶ PONIŠTI",()=>travel(-1)),redo=button("↷ PONOVI",()=>travel(1));
  function sync(){undo.disabled=cursor===0;redo.disabled=cursor===history.length-1;}
  function record(){if(restoring)return;const state=validate(clone(read()));if(JSON.stringify(state)===JSON.stringify(history[cursor]))return;history=history.slice(0,cursor+1);history.push(state);if(history.length>60)history.shift();cursor=history.length-1;sync();if(auto.checked){clearTimeout(autoTimer);autoTimer=setTimeout(()=>{try{localStorage.setItem(key+"-recovery",JSON.stringify({app,version:2,data:validate(clone(read()))}));say("Lokalni oporavak ažuriran. Nije poslano na server.");}catch{say("Oporavak nije sačuvan. Izvezi rezervni JSON.");}},650);}}
  function travel(delta){clearTimeout(timer);try{record();}catch(e){say("Prvo ispravi neispravne vrijednosti: "+e.message);return;}const next=cursor+delta;if(next<0||next>=history.length)return;cursor=next;restoring=true;apply(clone(history[cursor]));restoring=false;sync();say("Promjena "+(delta<0?"poništena.":"ponovljena."));}
  function restore(value){const safe=validate(clone(value));restoring=true;try{apply(safe);}finally{restoring=false;}record();say("Projekat vraćen. Promjenu možeš poništiti.");}
  const projectName=document.createElement("input");projectName.type="text";projectName.maxLength=80;projectName.value="Moj projekat";projectName.setAttribute("aria-label","Ime sačuvanog projekta");
  const select=document.createElement("select");select.setAttribute("aria-label","Sačuvani projekti na ovom uređaju");
  const databaseKey=key+"-projects-v2";
  function database(){return projectDatabase(key);}
  function writeDatabase(all){const raw=JSON.stringify(all);if(raw.length>2000000)throw Error("Zbirka projekata je veća od 2 MB. Izvezi JSON i ukloni nepotrebne kopije.");localStorage.setItem(databaseKey,raw);}
  function list(){select.replaceChildren();try{const all=database();for(const p of all){if(typeof p.name!=="string")continue;const o=document.createElement("option");o.value=p.id;o.textContent=p.name;select.append(o);}}catch{say("Pohranu nije moguće pročitati. Rezervni JSON i dalje radi.");}}
  const save=button("SAČUVAJ PROJEKAT",()=>{try{record();const d=validate(clone(read())),name=projectName.value.trim();if(!name)throw Error("Upiši naziv projekta.");const all=database(),found=all.find(p=>p.name===name);if(found){found.previous=found.data;found.data=d;found.updated=new Date().toISOString();}else{if(all.length>=20)throw Error("Najviše 20 projekata. Izvezi ili ukloni jedan.");all.push({id:Date.now().toString(36)+Math.random().toString(36).slice(2,6),name,data:d,updated:new Date().toISOString()});}writeDatabase(all);list();select.value=all.find(p=>p.name===name).id;say("Projekat sačuvan samo na ovom uređaju.");}catch(e){say("Čuvanje nije uspjelo: "+e.message+" Izvezi JSON.");}});
  const load=button("OTVORI PROJEKAT",()=>{try{const p=database().find(p=>p.id===select.value);if(!p)throw Error("Izaberi sačuvan projekat.");restore(p.data);projectName.value=p.name;}catch(e){say("Učitavanje nije uspjelo: "+e.message);}});
  const previous=button("VRATI PRETHODNU VERZIJU",()=>{try{const p=database().find(p=>p.id===select.value);if(!p?.previous)throw Error("Nema prethodne verzije ovog projekta.");restore(p.previous);}catch(e){say(e.message);}});
  const remove=button("OBRIŠI SAČUVANI PROJEKAT",()=>{try{const all=database(),p=all.find(p=>p.id===select.value);if(!p)return;if(!confirm("Obrisati lokalni projekat „"+p.name+"”? Izvezi JSON ako želiš kopiju."))return;writeDatabase(all.filter(x=>x.id!==p.id));list();say("Sačuvani projekat obrisan; otvoreni rad ostaje.");}catch(e){say("Brisanje nije uspjelo: "+e.message);}});
  const exportBtn=button("REZERVNA KOPIJA · JSON",()=>{try{record();download("zero-to-one-"+app+".json",JSON.stringify({app,version:2,name:projectName.value,data:validate(clone(read()))},null,2),"application/json;charset=utf-8");say("Rezervni projekat pripremljen za preuzimanje.");}catch(e){say(e.message);}});
  const file=document.createElement("input");file.type="file";file.accept=".json,application/json";file.hidden=true;
  const importBtn=button("OTVORI JSON PROJEKAT",()=>file.click());
  file.addEventListener("change",async()=>{try{const f=file.files?.[0];if(!f)return;if(f.size>2000000)throw Error("Projekat smije imati najviše 2 MB.");const p=JSON.parse(await f.text());if(p.app!==app||p.version!==2)throw Error("Ovo nije projekat ove aplikacije.");const safe=validate(p.data);if(confirm("Zamijeniti otvoreni rad? Trenutni rad ostaje u undo historiji.")){restore(safe);projectName.value=typeof p.name==="string"?p.name.slice(0,80):"Moj projekat";}}catch(e){say("Uvoz nije uspio: "+e.message);}finally{file.value="";}});
  const auto=document.createElement("input");auto.type="checkbox";const autoLabel=document.createElement("label");autoLabel.className="project-auto";autoLabel.append(auto," Lokalni automatski oporavak (opcionalno)");auto.addEventListener("change",()=>{if(auto.checked){try{localStorage.setItem(key+"-recovery",JSON.stringify({app,version:2,data:validate(clone(read()))}));say("Lokalni oporavak uključen za ovu posjetu.");}catch{auto.checked=false;say("Pohrana nije dostupna. Koristi JSON rezervnu kopiju.");}}else{clearTimeout(autoTimer);say("Automatsko čuvanje isključeno; raniju kopiju možeš obrisati.");}});
  const recover=button("VRATI OPORAVAK",()=>{try{const p=JSON.parse(localStorage.getItem(key+"-recovery")||"null");if(p?.app!==app||p.version!==2)throw Error("Nema dostupne kopije za oporavak.");restore(p.data);}catch(e){say(e.message);}});
  const clearRecovery=button("OBRIŠI OPORAVAK",()=>{try{clearTimeout(autoTimer);localStorage.removeItem(key+"-recovery");say("Kopija za oporavak obrisana.");}catch{say("Pohranu nije moguće obrisati.");}});
  const clearAll=button("OBRIŠI SVE LOKALNE KOPIJE OVE APLIKACIJE",()=>{if(!confirm("Obrisati nacrt, projekte i oporavak ove aplikacije? Otvoreni rad ostaje."))return;clearTimeout(autoTimer);auto.checked=false;try{for(const k of [key,databaseKey,key+"-recovery"])localStorage.removeItem(k);list();say("Lokalne kopije ove aplikacije obrisane.");}catch{say("Brisanje nije uspjelo. Provjeri postavke preglednika.");}});
  const hub=document.createElement('a');hub.href='./moji-radovi.html';hub.className='secondary';hub.textContent='MOJI RADOVI · SVE APLIKACIJE ↗';
  bar.append(undo,redo,exportBtn,importBtn);box.append(heading,bar,projectName,select,save,load,previous,remove,autoLabel,recover,clearRecovery,clearAll,hub,file,message);root.append(box);list();sync();
  const requested=new URLSearchParams(location.search).get('projekat');
  if(requested&&/^[a-z0-9_-]{1,80}$/i.test(requested))setTimeout(()=>{try{const p=database().find(p=>p.id===requested);if(!p)throw Error('Traženi projekat nije na ovom uređaju.');const safe=validate(clone(p.data));if(confirm('Otvoriti lokalni projekat „'+p.name+'”? Trenutni rad ostaje u undo historiji.')){restore(safe);select.value=p.id;projectName.value=p.name;}}catch(e){say('Projekat nije otvoren: '+e.message);}},0);
  root.addEventListener("input",e=>{if(box.contains(e.target))return;clearTimeout(timer);timer=setTimeout(()=>{try{record();}catch(e){say(e.message);}},300);});
  window.addEventListener("beforeunload",e=>{const state=JSON.stringify(read());const isSaved=(()=>{try{return database().some(p=>JSON.stringify(p.data)===state)||JSON.stringify(JSON.parse(localStorage.getItem(key+"-recovery")||"null")?.data)===state;}catch{return false;}})();if(state!==JSON.stringify(history[0])&&!isSaved){e.preventDefault();e.returnValue="";}});
  return {record,restore,say};
 }
 function png(svg,name,status){const source=URL.createObjectURL(new Blob([svg],{type:"image/svg+xml"})),im=new Image();im.onload=()=>{try{const canvas=document.createElement("canvas");canvas.width=im.naturalWidth;canvas.height=im.naturalHeight;if(canvas.width*canvas.height>18000000)throw Error("Grafika je prevelika za PNG.");const ctx=canvas.getContext("2d");if(!ctx)throw Error("Canvas nije dostupan.");ctx.drawImage(im,0,0);canvas.toBlob(blob=>{if(blob){download(name,blob);status("PNG pripremljen za preuzimanje.");}else status("PNG nije moguće napraviti. SVG ostaje dostupan.");},"image/png");}catch(e){status(e.message);}finally{URL.revokeObjectURL(source);}};im.onerror=()=>{URL.revokeObjectURL(source);status("Grafiku nije moguće pretvoriti u PNG.");};im.src=source;}
 window.TEZ={$,clone,esc,text,choice,link,download,button,projectPanel,png,apps,projectDatabase};
})();
