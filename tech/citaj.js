"use strict";
(async()=>{
const $=id=>document.getElementById(id),list=window.BL_PORTAL_CONTENT?.materials||[];
const file=new URLSearchParams(location.search).get("resurs");
const material=list.find(m=>m.file===file),status=$("read-status"),content=$("read-content"),download=$("read-download");
if(!material){$("read-title").textContent="Sadržaj nije pronađen";status.textContent="Odabrana datoteka nije dostupna u Biblioteci.";download.hidden=true;return;}
$("read-kind").textContent=material.kind+" / "+material.format;$("read-title").textContent=material.name;$("read-summary").textContent=material.desc;
download.href=material.href;download.download=material.file;
document.title=material.name+" — Brzo i Lokalno";$("print-reader").addEventListener("click",()=>window.print());
const el=(tag,value)=>{const e=document.createElement(tag);e.textContent=value;return e};
function renderTxt(text){
 const blocks=text.replace(/\r\n/g,"\n").trim().split(/\n\s*\n/);
 for(const block of blocks){
  const b=block.trim();if(!b)continue;
  if(!b.includes("\n")&&(/^\d+\.\s+[A-ZČĆĐŠŽ]/u.test(b)||/^(UVOD|ZAVRŠNA MISAO)$/.test(b))){content.append(el("h2",b));continue;}
  const p=el("p",b);if(b.includes("[ ]"))p.className="check-text";content.append(p);
 }
}
function renderCsv(text){
 const rows=text.replace(/\r\n/g,"\n").trim().split("\n").map(line=>line.split(","));
 const scroller=document.createElement("div");scroller.className="table-scroll";
 const table=document.createElement("table");const head=document.createElement("thead");const top=document.createElement("tr");
 for(const name of rows.shift()||[])top.append(el("th",name));head.append(top);table.append(head);
 const body=document.createElement("tbody");for(const row of rows){const tr=document.createElement("tr");for(const cell of row)tr.append(el("td",cell));body.append(tr);}table.append(body);scroller.append(table);content.append(scroller);
}
try{
 const response=await fetch(material.href);
 if(!response.ok)throw new Error("Unavailable");
 const text=await response.text();
 if(material.format==="CSV")renderCsv(text);else renderTxt(text);
 status.hidden=true;content.hidden=false;
}catch(_){status.textContent="Pregled trenutno nije dostupan. Možeš pokušati direktno preuzimanje datoteke.";}
})();
