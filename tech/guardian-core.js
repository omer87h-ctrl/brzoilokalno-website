"use strict";
(function(){
const D=window.BL_GUARDIAN_DATA||window.BL_ASISTENT_DATA||{models:[],tools:[]};
const $=id=>document.getElementById(id);
const el=(tag,text,cls)=>{const x=document.createElement(tag);if(text!==undefined)x.textContent=String(text);if(cls)x.className=cls;return x;};
const txt=s=>String(s??"").normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLocaleLowerCase("bs");
const fmt=(n,d=2)=>new Intl.NumberFormat("bs-BA",{maximumFractionDigits:d}).format(n);
const go=(href,text)=>{const a=el("a",text);a.href=href;return a;};
const para=s=>el("p",s);
const heading=(text,level=3)=>el("h"+level,text);
const limits=(id,min,max)=>{const value=$(id)?.value??"";if(value.trim()==="")return null;const n=Number(value);return Number.isFinite(n)&&n>=min&&n<=max?n:null};
const required=(id,min,max)=>{const n=limits(id,min,max);if(n===null)throw Error("Provjeri unos za: "+document.querySelector('label[for="'+id+'"]')?.textContent+".");return n};
function clear(node){node.replaceChildren();}
function resultStart(node,kind,title){clear(node);node.append(el("span",kind,"eyebrow"),heading(title,2));}
function appendLink(node,label,href,external=false){const a=go(href,label);a.className="source";if(external){a.target="_blank";a.rel="noopener noreferrer";}node.append(a);}
function row(table,name,a,b){const tr=el("tr");tr.append(el("th",name),el("td",a),el("td",b));table.append(tr);}
function validPrice(id){const v=$(id)?.value??"";return v.trim()?required(id,0,50000):null;}
function calcTool(kind){
 const body=$("tool-result");if(!body)return;
 try{
  let title,note,summary,steps=[];
  if(kind==="tiles"){
   const length=required("floor-length",.01,1000),width=required("floor-width",.01,1000),tl=required("tile-length",1,300),tw=required("tile-width",1,300),waste=required("tile-waste",0,50);
   const area=length*width,unit=(tl/100)*(tw/100),withWaste=area*(1+waste/100);
   const quantity=Math.ceil(withWaste/unit);
   if(!Number.isSafeInteger(quantity)||quantity>1e8)throw Error("Unos je izvan podržanog raspona.");
   title=fmt(quantity,0)+" pločica";
   summary="Za "+fmt(area)+" m², uz rezervu "+fmt(waste,0)+"%, orijentaciono treba "+fmt(quantity,0)+" komada dimenzija "+fmt(tl)+" × "+fmt(tw)+" cm.";
   steps=["Površina: "+fmt(area)+" m²","Sa rezervom: "+fmt(withWaste)+" m²","Površina jedne pločice: "+fmt(unit,4)+" m²"];
   note="Procjena po površini. Ne uračunava geometriju polaganja, fuge, otvore, lom i pakovanja. Provjeri raspored i kutije prije kupovine.";
  }else if(kind==="paint"){
   const area=required("paint-area",.01,100000),cover=required("paint-cover",.1,100),coats=required("paint-coats",1,10),waste=required("paint-waste",0,50);
   const base=area*coats/cover,requiredLitres=base*(1+waste/100);
   title=fmt(requiredLitres)+" litara";
   summary="Za "+fmt(area)+" m² i "+fmt(coats,0)+" sloja, pri pokrivnosti "+fmt(cover)+" m²/L po sloju.";
   steps=["Osnovni izračun: "+fmt(base)+" L","Sa rezervom "+fmt(waste,0)+"%: "+fmt(requiredLitres)+" L"];
   note="Pokrivnost je okvirna; proizvođač, upojnost podloge i način nanošenja mijenjaju potrošnju. Zaokruži prema stvarnim pakovanjima.";
  }else if(kind==="offer"){
   const hours=required("offer-hours",0,100000),rate=required("offer-rate",0,100000),materials=required("offer-material",0,10000000),other=required("offer-other",0,10000000);
   const labour=hours*rate,total=labour+materials+other;
   title=fmt(total)+" KM";
   summary="Okvirni zbir rada, materijala i drugih troškova na osnovu unesenih vrijednosti.";
   steps=["Rad: "+fmt(hours)+" × "+fmt(rate)+" KM = "+fmt(labour)+" KM","Materijal: "+fmt(materials)+" KM","Ostalo: "+fmt(other)+" KM"];
   note="Ovo nije formalna faktura, ponuda sa zakonski obaveznim elementima ni poreski obračun. Porez, PDV i propisane obaveze nisu uključeni.";
  }else throw Error("Nepoznati alat.");
  resultStart(body,"KALKULATOR / REZULTAT",title);
  body.append(para(summary));
  const list=el("ul");steps.forEach(s=>list.append(el("li",s)));body.append(list,para(note));
 }catch(e){resultStart(body,"KALKULATOR / PROVJERA","Nije moguće izračunati.");body.append(para(e.message));}
}
const tabs=document.querySelectorAll("[data-tool]");
let activeTool="tiles";
function setTool(kind){
 if(!["tiles","paint","offer"].includes(kind))kind="tiles";
 activeTool=kind;
 for(const b of tabs)b.setAttribute("aria-pressed",String(b.dataset.tool===kind));
 for(const x of ["tiles","paint","offer"]){const n=$("fields-"+x);if(n)n.hidden=x!==kind;}
 const out=$("tool-result");if(out){resultStart(out,"ASISTENT / KALKULATOR","Izračun za "+({tiles:"pločice",paint:"boju",offer:"jednostavnu ponudu"}[kind]));out.append(para("Provjeri mjere i pokreni izračun. Sve se računa na ovom uređaju."));}
}
for(const b of tabs)b.addEventListener("click",()=>setTool(b.dataset.tool));
if($("tool-form")){
 const q=new URLSearchParams(location.search).get("alat");
 setTool(["tiles","paint","offer"].includes(q)?q:"tiles");
 $("tool-form").addEventListener("submit",e=>{e.preventDefault();calcTool(activeTool);});
}
const sw=$("software-list");if(sw){
 for(const t of D.tools.filter(x=>x.href).sort((a,b)=>(a.kind==="Majstori"?0:1)-(b.kind==="Majstori"?0:1))){
  const card=el("article",undefined,"g-software-card");
  card.append(el("span",t.kind.toUpperCase()+" / SLUŽBENI LINK","eyebrow"),heading(t.name),para(t.description));
  const a=go(t.href,"OTVORI SLUŽBENU STRANICU ↗");a.target="_blank";a.rel="noopener noreferrer";card.append(a);sw.append(card);
 }
}
const models=D.models||[];
const aSelect=$("phone-a"),bSelect=$("phone-b");
function selector(select){if(!select)return;clear(select);for(const m of models){const option=el("option",m.name);option.value=m.id;select.append(option);}}
selector(aSelect);selector(bSelect);
if(aSelect&&bSelect){aSelect.value=models[0]?.id||"";bSelect.value=models[1]?.id||"";}
function specValue(m,key){const v=m[key];if(v===null||v===undefined)return "Nije u katalogu";if(key==="battery")return fmt(v,0)+" mAh";if(key==="display")return fmt(v)+" inča";if(key==="weight")return fmt(v,0)+" g";if(key==="refresh")return fmt(v,0)+" Hz";if(key==="ip")return "IP"+String(v);if(key==="video")return "Do "+fmt(v)+" sati (proizvođač)";return String(v);}
function deltaDescription(first,second,key,priority){
 const A=first[key],B=second[key];if(A===null||B===null||A===undefined||B===undefined)return "Za tu osobinu nema uporedivih podataka za oba uređaja.";
 if(A===B)return "Prema prikazanoj vrijednosti oba modela su jednaka.";
 const sel=(A>B?first:second),lower=(A>B?second:first);
 if(key==="battery")return sel.name+" ima veći deklarisani kapacitet baterije (+ "+fmt(Math.abs(A-B),0)+" mAh). To ne dokazuje duže trajanje u praksi.";
 if(key==="display")return sel.name+" ima veću dijagonalu ekrana za "+fmt(Math.abs(A-B),2)+" inča; veće ne znači automatski bolje.";
 if(key==="weight")return lower.name+" je lakši za "+fmt(Math.abs(A-B),0)+" g prema navedenim podacima.";
 if(key==="ip")return sel.name+" ima viši deklarisani razred zaštite (IP"+Math.max(A,B)+" naspram IP"+Math.min(A,B)+"). Zaštita u praksi ima ograničenja.";
 if(key==="refresh")return sel.name+" ima višu deklarisanu brzinu osvježavanja. Stvarna fluidnost zavisi i od softvera i aplikacija.";
 return "Podaci su informativni.";
}
function comparePhones(){
 const out=$("phone-result");if(!out)return;
 const first=models.find(m=>m.id===aSelect.value),second=models.find(m=>m.id===bSelect.value);
 if(!first||!second){resultStart(out,"POREĐENJE / NEMA MODELA","Izaberi dva poznata modela.");return;}
 if(first.id===second.id){resultStart(out,"ASISTENT / UPIT","Izaberi dva različita modela.");return;}
 try{
  const p1=validPrice("phone-price-a"),p2=validPrice("phone-price-b"),budget=validPrice("phone-budget");
  const priority=$("phone-priority").value;
  resultStart(out,"POREĐENJE / PODACI I OGRANIČENJA",first.name+" / "+second.name);
  out.append(para("Prikazani podaci potiču sa stranica proizvođača. Cijene su tvoji unosi, ne naše ponude."));
  const tbl=el("table");const thead=el("tr");thead.append(el("th","Osobina"),el("th",first.name),el("th",second.name));tbl.append(thead);
  for(const [key,label] of [["display","Ekran"],["refresh","Osvježavanje"],["battery","Nominalni kapacitet"],["weight","Težina"],["ip","Zaštita"]])row(tbl,label,specValue(first,key),specValue(second,key));
  row(tbl,"Cijena koju si unio",p1===null?"Nije unesena":fmt(p1)+" KM",p2===null?"Nije unesena":fmt(p2)+" KM");
  out.append(tbl);
  if(budget!==null){
   out.append(heading("U odnosu na budžet",3));
   for(const [m,price] of [[first,p1],[second,p2]]){
    out.append(para(m.name+": "+(price===null?"nema unesene cijene":price<=budget?"unutar unesenog budžeta":"iznad unesenog budžeta")));
   }
  }
  const selKey={light:"weight",screen:"display",battery:"battery",resistance:"ip",price:"price",balanced:""}[priority]||"";
  if(selKey==="price"){
   out.append(heading("Cijena je prioritet",3));
   out.append(para(p1!==null&&p2!==null?(p1===p2?"Unesene cijene su jednake.":(p1<p2?first.name:second.name)+" ima nižu unesenu cijenu za "+fmt(Math.abs(p1-p2))+" KM."):"Upiši obje cijene za smisleno poređenje cijene."));
  }else if(priority==="camera"){
   out.append(heading("Kamere — važna ograničenja",3));
   out.append(para("Ne rangiramo kameru prema broju megapiksela. Bez nezavisnih testnih fotografija i jednakih uslova snimanja ne možemo pošteno zaključiti koji telefon ima bolju kameru. Pogledaj specifikacije kod proizvođača."));
  }else if(selKey){
   out.append(heading("Šta pokazuje tvoj prioritet?",3));out.append(para(deltaDescription(first,second,selKey,priority)));
  }else{
   out.append(heading("Šta se može zaključiti?",3));
   out.append(para("Poređenje prikazuje različite deklarisane specifikacije, ali ne daje automatskog pobjednika. Za preporuku bi trebali stvarni testovi kamere, trajanja baterije, performansi, podrške i pouzdana cijena."));
  }
  out.append(heading("Izvori proizvođača",3));
  appendLink(out,first.name+" — zvanične specifikacije ↗",first.source,true);
  appendLink(out,second.name+" — zvanične specifikacije ↗",second.source,true);
  out.append(para("Provjeri tržišnu varijantu i datum. IP zaštita vremenom može oslabiti. mAh i reklamirani sati videa nisu međusobno uporedivi pokazatelji trajanja baterije. Ovo nije praktična recenzija niti test.").cloneNode(true));
 }catch(e){resultStart(out,"POREĐENJE / PROVJERA UNOSA","Neki podaci nisu ispravni.");out.append(para(e.message));}
}
if($("phone-form"))$("phone-form").addEventListener("submit",e=>{e.preventDefault();comparePhones();});
})();
