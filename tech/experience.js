"use strict";
(()=>{
const content=window.BL_PORTAL_CONTENT||{articles:[],materials:[]},$=id=>document.getElementById(id);
const create=(tag,cls,text)=>{const e=document.createElement(tag);if(cls)e.className=cls;if(text!==undefined)e.textContent=String(text);return e;};
const fold=v=>String(v||"").normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLocaleLowerCase("bs");
const terms=v=>fold(v).trim().split(/\s+/).filter(Boolean);
const matches=(item,q)=>q.every(t=>fold(item).includes(t));
const legacyRoutes={"#biblioteka":"./biblioteka.html","#store":"./free-store.html","#lab":"./lab.html","#ljudi":"./majstori-kreatori.html","#radar":"./lab.html","#podcast":"./podcast.html"};
if((location.pathname.endsWith("/tech/")||location.pathname.endsWith("/tech/index.html"))&&Object.prototype.hasOwnProperty.call(legacyRoutes,location.hash))location.replace(legacyRoutes[location.hash]);
const menu=$("nav-toggle"),mob=$("mobile-nav");
menu?.addEventListener("click",()=>{const open=mob.hidden;mob.hidden=!open;menu.setAttribute("aria-expanded",String(open));});
mob?.addEventListener("click",e=>{if(e.target.closest("a")){mob.hidden=true;menu.setAttribute("aria-expanded","false");}});
const readerLink=m=>"./citaj.html?resurs="+encodeURIComponent(m.file);
const resourceCategories={Knjige:{cover:"orange",label:"MINI E-KNJIGA",symbol:"0 → 1"},Sigurnost:{cover:"green",label:"KONTROLNA LISTA",symbol:"◈"},Predlošci:{cover:"navy",label:"PREDLOŽAK",symbol:"▦"},Softver:{cover:"violet",label:"QA VODIČ",symbol:"✓"}};
function libraryCard(m){
 const {cover,label,symbol}=resourceCategories[m.cat]||{cover:"navy",label:m.kind,symbol:m.symbol};
 const card=create("article","shelf-card"),cov=create("div","book-cover "+cover);cov.setAttribute("aria-label","Originalna dizajnirana naslovnica: "+m.name);cov.setAttribute("role","img");
 cov.append(create("span","book-owner","BRZO I LOKALNO"),create("strong","book-name",m.name.replace("Mini-knjiga: ","")),create("span","book-symbol",symbol));
 const info=create("div","shelf-meta");
 info.append(create("span","eyebrow",label+" / "+m.format),create("h3","",m.name),create("p","",m.desc));
 const acts=create("div","shelf-actions"),read=create("a","","ČITAJ ↗"),download=create("a","","PREUZMI ↓");
 read.href=readerLink(m);read.setAttribute("aria-label","Čitaj ili pregledaj "+m.name);
 download.href=m.href;download.download=m.file;download.setAttribute("aria-label","Preuzmi "+m.name);
 acts.append(read,download);info.append(acts);card.append(cov,info);return card;
}
function storeCard(m){
 const card=create("article","store-product");card.append(create("span","eyebrow",m.cat.toUpperCase()+" / 0 KM"));
 const art=create("div","product-icon",m.symbol);art.setAttribute("aria-hidden","true");card.append(art,create("h3","",m.name),create("p","",m.desc));
 const actions=create("div","store-actions"),preview=create("a","","PREGLEDAJ ↗"),down=create("a","","PREUZMI ↓");
 preview.href=readerLink(m);down.href=m.href;down.download=m.file;down.setAttribute("aria-label","Preuzmi "+m.name);
 actions.append(preview,down);card.append(actions);return card;
}
let selected="Sve";
function drawLibrary(){
 if(!$("library-list"))return;
 const q=terms($("library-filter-search")?.value);
 const found=content.materials.filter(m=>(selected==="Sve"||m.cat===selected)&&matches([m.name,m.desc,m.cat,m.format].join(" "),q));
 $("library-list").replaceChildren(...found.map(libraryCard));$("library-empty").hidden=found.length>0;
}
$("library-filters")?.addEventListener("click",e=>{
 const btn=e.target.closest("[data-filter]");if(!btn)return;
 selected=btn.dataset.filter;
 for(const b of $("library-filters").querySelectorAll("button"))b.setAttribute("aria-pressed",String(b===btn));
 drawLibrary();
});
$("library-filter-search")?.addEventListener("input",drawLibrary);drawLibrary();
function drawStore(){
 if(!$("store-list"))return;
 const q=terms($("store-filter-search")?.value);
 const filtered=content.materials.filter(m=>matches([m.name,m.desc,m.cat,m.kind].join(" "),q));
 $("store-list").replaceChildren(...filtered.map(storeCard));$("store-empty").hidden=filtered.length>0;
}
$("store-filter-search")?.addEventListener("input",drawStore);drawStore();
const modal=$("site-search"),search=$("universal-input"),results=$("universal-results");
const pages=[
 {cat:"RUBRIKA",title:"Tech portal",description:"AI, uređaji, softver i originalne analize",url:"./"},
 {cat:"RUBRIKA",title:"Biblioteka",description:"Knjige, vodiči, besplatno čitanje",url:"./biblioteka.html"},
 {cat:"RUBRIKA",title:"BL Free Store",description:"Besplatni digitalni resursi",url:"./free-store.html"},
 {cat:"RUBRIKA",title:"BL Lab",description:"Projekti i ideje za razmjenu",url:"./lab.html"},
 {cat:"RUBRIKA",title:"Podcast",description:"Razgovori i predlaganje tema; epizode su u pripremi.",url:"./podcast.html"},
 {cat:"RUBRIKA",title:"Majstori & Kreatori",description:"Tehnologija, zanati, kreativci i Brzo i Lokalno",url:"./majstori-kreatori.html"}
];
const all=[
 ...content.articles.map(a=>({cat:"ČLANAK / "+a.category,title:a.title,description:a.summary,url:a.href})),
 ...content.materials.map(m=>({cat:"BIBLIOTEKA / BL FREE STORE",title:m.name,description:m.desc,url:readerLink(m)})),...pages
];
function drawSearch(){
 if(!results||!search)return;
 const q=terms(search.value);
 const found=all.filter(x=>matches([x.title,x.description,x.cat].join(" "),q));
 results.replaceChildren(create("div","search-count",found.length+" REZULTATA · POSTOJEĆI SADRŽAJ"));
 if(!found.length){results.append(create("p","empty","Nema rezultata. Pokušaj drugačiji pojam."));return;}
 for(const item of found){
  const a=create("a","search-hit");a.href=item.url;a.append(create("span","category",item.cat),create("strong","",item.title),create("small","",item.description));results.append(a);
 }
}
function openSearch(){if(!modal)return;drawSearch();modal.showModal();search?.focus();}
$("open-search")?.addEventListener("click",openSearch);
$("close-search")?.addEventListener("click",()=>modal?.close());
search?.addEventListener("input",drawSearch);
results?.addEventListener("click",e=>{if(e.target.closest("a"))modal?.close();});
modal?.addEventListener("click",e=>{if(e.target===modal)modal.close();});
document.addEventListener("keydown",e=>{
 const editing=e.target instanceof HTMLElement&&(e.target.isContentEditable||["INPUT","TEXTAREA","SELECT"].includes(e.target.tagName));
 if((e.key.toLowerCase()==="k"&&(e.metaKey||e.ctrlKey))||(e.key==="/"&&!editing&&!modal?.open)){e.preventDefault();openSearch();}
});
if("IntersectionObserver" in window&&!matchMedia("(prefers-reduced-motion: reduce)").matches){
 const nodes=Array.from(document.querySelectorAll(".feature-card,.large-link,.editorial-card,.shelf-card,.store-product"));
 const obs=new IntersectionObserver(entries=>{
   entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add("visible");entry.target.classList.remove("pending");obs.unobserve(entry.target);}});
 },{rootMargin:"0px 0px 50px 0px",threshold:.08});
 nodes.forEach(node=>{node.classList.add("reveal");obs.observe(node);});
}
})();
