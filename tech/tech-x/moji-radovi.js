'use strict';
(() => {
 const {$,apps,projectDatabase,download,clone,button}=TEZ;
 const create=(tag,text,cls)=>{const e=document.createElement(tag);if(text!==undefined)e.textContent=text;if(cls)e.className=cls;return e;};
 let selected=null,lastFocus=null;
 const say=text=>$('works-status').textContent=text;
 for(const app of apps){const option=create('option',app.name);option.value=app.app;$('works-app').append(option);}
 function collect(){const records=[],errors=[];for(const a of apps){try{for(const p of projectDatabase(a.key))records.push({a,p});}catch{errors.push(a.name+': zbirku nije moguće sigurno pročitati. Podaci nisu izmijenjeni.');}}return {records,errors};}
 function write(a,all){const serialized=JSON.stringify(all);if(serialized.length>2000000)throw Error('Zbirka je prevelika. Preuzmi rezervnu kopiju i ukloni nepotrebne projekte.');localStorage.setItem(a.key+'-projects-v2',serialized);}
 function current(a,id){const all=projectDatabase(a.key),p=all.find(p=>p.id===id);if(!p)throw Error('Projekat više nije dostupan. Osvježi pregled.');return {all,p};}
 function envelope(a,p,data=p.data,name=p.name){return {app:a.app,version:2,name,data};}
 function protect(fn){try{fn();}catch(e){say('Promjena nije izvršena: '+e.message+' Koristi rezervnu kopiju ako je dostupna.');}}
 function render(){
  const {records,errors}=collect(),q=$('works-search').value.trim().toLocaleLowerCase('bs'),filter=$('works-app').value;
  const shown=records.filter(({a,p})=>(filter==='all'||a.app===filter)&&p.name.toLocaleLowerCase('bs').includes(q));
  const stamp=p=>Number.isFinite(Date.parse(p.updated))?Date.parse(p.updated):0;
  shown.sort((x,y)=>$('works-sort').value==='name'?x.p.name.localeCompare(y.p.name,'bs'):$('works-sort').value==='app'?x.a.name.localeCompare(y.a.name,'bs'):stamp(y.p)-stamp(x.p));
  $('works-summary').textContent=`${shown.length} prikazanih / ${records.length} čitljivih sačuvanih projekata`;
  $('works-errors').hidden=!errors.length;$('works-errors').textContent=errors.join(' ');
  $('works-empty').hidden=shown.length>0;
  $('works-empty').querySelector('h2').textContent=records.length?'Nema radova za ovaj filter.':'Prvi rad počinje u editoru.';
  $('works-empty').querySelector('p').textContent=records.length?'Promijeni naziv u pretrazi ili izaberi Sve aplikacije. Sačuvani projekti nisu uklonjeni.':'Otvori alat i koristi SAČUVAJ PROJEKAT. Ako već imaš nacrt, vrati ga u aplikaciji i sačuvaj pod svojim nazivom.';
  $('works-backup').disabled=!records.length||errors.length>0;
  const root=$('works-list');root.replaceChildren();
  for(const {a,p} of shown){
   const card=create('article',undefined,'work-card');card.append(create('span',a.name,'eyebrow'),create('h2',p.name));
   const date=stamp(p)?new Intl.DateTimeFormat('bs',{dateStyle:'medium',timeStyle:'short'}).format(new Date(p.updated)):'Datum nije zabilježen';
   card.append(create('small','Posljednja izmjena: '+date));
   const actions=create('div',undefined,'actions'),open=create('a','NASTAVI RAD ↗','primary');const address=new URL(a.url,location.href);address.searchParams.set('projekat',p.id);open.href=address.href;
   actions.append(open,button('REZERVNI JSON ↓',()=>protect(()=>{const c=current(a,p.id).p;download('zero-to-one-'+a.app+'-'+p.id+'.json',JSON.stringify(envelope(a,c),null,2),'application/json;charset=utf-8');say('Rezervni projekat pripremljen. Nije poslano na server.');})),button('PREIMENUJ',event=>{
    protect(()=>{selected={a,id:p.id};lastFocus=document.activeElement;$('rename-input').value=current(a,p.id).p.name;$('rename-status').textContent='';$('work-rename').showModal();$('rename-input').focus();});
   }),button('NAPRAVI KOPIJU',()=>protect(()=>{const {all,p:latest}=current(a,p.id);if(all.length>=20)throw Error('Najviše 20 projekata po aplikaciji.');let name=(latest.name.slice(0,65)+' · kopija').slice(0,80),index=2;while(all.some(p=>p.name===name)){name=latest.name.slice(0,60)+' · kopija '+index++;}all.push({...clone(latest),id:Date.now().toString(36)+Math.random().toString(36).slice(2,8),name,updated:new Date().toISOString()});write(a,all);render();say('Kopija je napravljena lokalno.');})),button('OBRIŠI',()=>protect(()=>{const {all,p:latest}=current(a,p.id);if(!confirm('Obrisati lokalni projekat „'+latest.name+'”? Prethodno preuzmi rezervni JSON.'))return;write(a,all.filter(p=>p.id!==latest.id));render();say('Projekat obrisan samo s ovog uređaja.');})));
   card.append(actions);root.append(card);
  }
 }
 $('rename-form').addEventListener('submit',event=>{event.preventDefault();try{if(!selected)return;const name=$('rename-input').value.trim();if(!name)throw Error('Upiši naziv projekta.');const {all,p}=current(selected.a,selected.id);if(all.some(other=>other.id!==p.id&&other.name===name))throw Error('Drugi projekat već ima taj naziv.');p.name=name;p.updated=new Date().toISOString();write(selected.a,all);$('work-rename').close();render();say('Naziv projekta promijenjen.');}catch(e){$('rename-status').textContent=e.message;}});
 $('rename-cancel').addEventListener('click',()=>$('work-rename').close());
 $('work-rename').addEventListener('close',()=>{lastFocus?.focus();selected=null;});
 for(const id of ['works-search','works-app','works-sort'])$(id).addEventListener('input',render);
 window.addEventListener('storage',event=>{if(event.key===null||apps.some(a=>event.key===a.key+'-projects-v2'))render();});
 // Original, uncompressed ZIP writer: UTF-8 filenames, CRC32, no dependency or upload.
 function zip(files){
  const encoder=new TextEncoder(),parts=[],central=[];let offset=0,size=0;
  const crc=bytes=>{let value=0xffffffff;for(const byte of bytes){value^=byte;for(let i=0;i<8;i++)value=(value>>>1)^((value&1)?0xedb88320:0);}return (value^0xffffffff)>>>0;};
  for(const file of files){const name=encoder.encode(file.name),bytes=encoder.encode(file.content);size+=bytes.length;if(size>15000000)throw Error('Arhiva je veća od 15 MB. Preuzmi projekte pojedinačno.');const sum=crc(bytes),local=new Uint8Array(30+name.length),v=new DataView(local.buffer);v.setUint32(0,0x04034b50,true);v.setUint16(4,20,true);v.setUint16(6,0x800,true);v.setUint16(12,0x21,true);v.setUint32(14,sum,true);v.setUint32(18,bytes.length,true);v.setUint32(22,bytes.length,true);v.setUint16(26,name.length,true);local.set(name,30);parts.push(local,bytes);
   const entry=new Uint8Array(46+name.length),c=new DataView(entry.buffer);c.setUint32(0,0x02014b50,true);c.setUint16(4,20,true);c.setUint16(6,20,true);c.setUint16(8,0x800,true);c.setUint16(14,0x21,true);c.setUint32(16,sum,true);c.setUint32(20,bytes.length,true);c.setUint32(24,bytes.length,true);c.setUint16(28,name.length,true);c.setUint32(42,offset,true);entry.set(name,46);central.push(entry);offset+=local.length+bytes.length;
  }
  const length=central.reduce((sum,part)=>sum+part.length,0),end=new Uint8Array(22),v=new DataView(end.buffer);v.setUint32(0,0x06054b50,true);v.setUint16(8,files.length,true);v.setUint16(10,files.length,true);v.setUint32(12,length,true);v.setUint32(16,offset,true);return new Blob([...parts,...central,end],{type:'application/zip'});
 }
 $('works-backup').addEventListener('click',()=>protect(()=>{
  const {records,errors}=collect();if(errors.length)throw Error('Neke zbirke nisu čitljive. Zajednička kopija je zaustavljena da ne bude nepotpuna.');if(!records.length)throw Error('Nema sačuvanih projekata.');
  const files=[{name:'PROCITAJ-ME.txt',content:'Brzo i Lokalno TECH — privatna rezervna kopija\n\nRaspakuj ZIP na svom uređaju. JSON datoteku otvori u odgovarajućoj aplikaciji opcijom OTVORI JSON PROJEKAT. Nakon uvoza izaberi SAČUVAJ PROJEKAT. Datoteke nisu javni HTML rezultati. Arhiva uključuje imenovane projekte i prethodne verzije; nacrti i automatski oporavak nisu uključeni. Kopija može sadržavati privatne podatke i bilješke. Ne objavljuj je.\n'}];
  for(const {a,p} of records){files.push({name:a.app+'/'+p.id+'.json',content:JSON.stringify(envelope(a,p),null,2)});if(p.previous&&typeof p.previous==='object')files.push({name:a.app+'/'+p.id+'-prethodna.json',content:JSON.stringify(envelope(a,p,p.previous,p.name+' · prethodna'),null,2)});}
  download('moji-tech-radovi.zip',zip(files));say('ZIP svih imenovanih radova i prethodnih verzija pripremljen. Čuvaj privatnu kopiju na svom uređaju.');
 }));
 render();window.TEZWorks={collect,zip};
})();
