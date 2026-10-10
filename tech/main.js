"use strict";
(()=>{
const data=window.BL_PORTAL_CONTENT||{articles:[],materials:[]};
const $=id=>document.getElementById(id);
const create=(tag,className,text)=>{const n=document.createElement(tag);if(className)n.className=className;if(text!==undefined)n.textContent=text;return n};
let selected="Sve";
function articleCard(a){
 const link=create("a","card");link.href=a.href;
 link.append(create("div","card-art "+a.artClass,a.art));
 const box=create("div","card-inner");
 box.append(create("div","tag",a.kind),create("h3","",a.title),create("p","",a.summary));
 const foot=create("div","foot");foot.append(create("span","","ORIGINALNI VODIČ"),create("span","","PROČITAJ ↗"));box.append(foot);link.append(box);return link;
}
function renderArticles(){
 const value=($("search")?.value||"").toLocaleLowerCase("bs");
 const matches=data.articles.filter(a=>(selected==="Sve"||selected===a.category)&&(a.title+" "+a.summary+" "+a.category).toLocaleLowerCase("bs").includes(value));
 $("cards")?.replaceChildren(...matches.map(articleCard));if($("empty"))$("empty").hidden=matches.length!==0;
}
$("filters")?.addEventListener("click",e=>{const button=e.target.closest("button[data-category]");if(!button)return;selected=button.dataset.category;for(const b of $("filters").querySelectorAll("button"))b.setAttribute("aria-pressed",String(b===button));renderArticles();});
$("search")?.addEventListener("input",renderArticles);renderArticles();

function readerHref(m){return "./citaj.html?resurs="+encodeURIComponent(m.file);}
function makeActions(m){
 const links=create("div","book-actions");
 const preview=create("a","primary","ČITAJ / PREGLEDAJ ↗");preview.href=readerHref(m);preview.setAttribute("aria-label","Pregledaj "+m.name);
 const download=create("a","","PREUZMI "+m.format+" ↓");download.href=m.href;download.download=m.file;download.setAttribute("aria-label","Preuzmi "+m.name);
 links.append(preview,download);return links;
}
for(const m of data.materials){
 const book=m.cat==="Knjige",resource=create("article",book?"book-item":"resource");
 if(book){
  const cover=create("div","book-cover");cover.setAttribute("aria-hidden","true");
  cover.append(create("span","","BRZO I LOKALNO"),create("strong","","OD IDEJE DO PROIZVODA"),create("span","","MINI E-KNJIGA / ORIGINALNO"));
  const inside=create("div","book-info");inside.append(create("span","tag",m.kind+" / "+m.format),create("h3","",m.name),create("p","",m.desc),makeActions(m));resource.append(cover,inside);
 }else{
  const icon=create("div","resource-icon",m.symbol),inside=create("div");
  icon.setAttribute("aria-hidden","true");inside.append(create("span","tag",m.kind+" / "+m.format),create("h3","",m.name),create("p","",m.desc),makeActions(m));resource.append(icon,inside);
 }
 $("library-items")?.append(resource);
 const tile=create("article","tile");tile.append(create("div","tag",m.cat.toUpperCase()+" / 0 KM"),create("div","tile-art",m.symbol));
 const base=create("div");base.append(create("h3","",m.name),create("p","",m.desc));
 const actions=create("div","store-actions");const preview=create("a","","PREGLEDAJ ↗");preview.href=readerHref(m);
 const download=create("a","","PREUZMI ↓");download.href=m.href;download.download=m.file;
 actions.append(preview,download);base.append(actions);tile.append(base);$("store-items")?.append(tile);
}
const menu=$("menu"),mobile=$("mobile-nav");
menu?.addEventListener("click",()=>{const isOpen=mobile.hidden;mobile.hidden=!isOpen;menu.setAttribute("aria-expanded",String(isOpen));});
mobile?.addEventListener("click",e=>{if(e.target.closest("a")){mobile.hidden=true;menu.setAttribute("aria-expanded","false");}});
const fold=value=>String(value||"").normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLocaleLowerCase("bs");
const modal=$("site-search"),query=$("universal-input"),results=$("universal-results");
const sections=[
 {category:"RUBRIKA",title:"Biblioteka",summary:"Originalne knjige, vodiči i predlošci.",href:"#biblioteka"},
 {category:"RUBRIKA",title:"BL Free Store",summary:"Besplatni originalni digitalni resursi.",href:"#store"},
 {category:"RUBRIKA",title:"BL Lab",summary:"Projekti i ideje; pošalji prijedlog.",href:"#lab"},
 {category:"RUBRIKA",title:"Podcast",summary:"Program u pripremi. Predloži temu.",href:"#podcast"},
 {category:"RUBRIKA",title:"Ljudi i Radar",summary:"Otkrij kreativce i predloži priču.",href:"#ljudi"}
];
const index=[
 ...data.articles.map(a=>({category:"ČLANAK / "+a.category,title:a.title,summary:a.summary,href:a.href})),
 ...data.materials.map(m=>({category:"BIBLIOTEKA / FREE STORE",title:m.name,summary:m.desc,href:readerHref(m)})),
 ...sections
];
function drawSearch(){
 const words=fold(query.value).trim().split(/\s+/).filter(Boolean);
 const filtered=index.filter(item=>words.every(w=>fold(item.title+" "+item.summary+" "+item.category).includes(w)));
 results.replaceChildren(create("div","search-count",filtered.length+" REZULTATA / SVE RUBRIKE"));
 if(!filtered.length){results.append(create("p","no-results","Nema rezultata. Pokušaj s drugim pojmom."));return;}
 for(const item of filtered){
  const a=create("a","search-result");a.href=item.href;
  a.append(create("span","result-label",item.category),create("strong","",item.title),create("small","",item.summary));
  results.append(a);
 }
}
function openSearch(){if(!modal)return;drawSearch();modal.showModal();query.focus();}
$("open-search")?.addEventListener("click",openSearch);
$("close-search")?.addEventListener("click",()=>modal.close());
query?.addEventListener("input",drawSearch);
results?.addEventListener("click",e=>{if(e.target.closest("a"))modal.close();});
modal?.addEventListener("click",e=>{if(e.target===modal)modal.close();});
document.addEventListener("keydown",e=>{
 const editing=e.target instanceof HTMLElement&&(e.target.isContentEditable||["INPUT","TEXTAREA","SELECT"].includes(e.target.tagName));
 if((e.key.toLowerCase()==="k"&&(e.ctrlKey||e.metaKey))||(e.key==="/"&&!editing&&!modal?.open)){e.preventDefault();openSearch();}
});
})();
