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
for(const m of data.materials){
 const resource=create("article","resource"),icon=create("div","resource-icon",m.symbol),inside=create("div");
 inside.append(create("span","tag",m.kind+" / "+m.format),create("h3","",m.name),create("p","",m.desc));
 const a=create("a","","PREUZMI "+m.format+" ↗");a.href=m.href;a.download=m.file;a.setAttribute("aria-label","Preuzmi "+m.name);
 inside.append(a);resource.append(icon,inside);$("library-items")?.append(resource);
 const tile=create("article","tile");tile.append(create("div","tag",m.cat.toUpperCase()+" / 0 KM"),create("div","tile-art",m.symbol));
 const base=create("div");base.append(create("h3","",m.name),create("p","",m.desc));const download=create("a","foot","PREUZMI BESPLATNO ↗");download.href=m.href;download.download=m.file;base.append(download);tile.append(base);$("store-items")?.append(tile);
}
const menu=$("menu"),mobile=$("mobile-nav");
menu?.addEventListener("click",()=>{const isOpen=mobile.hidden;mobile.hidden=!isOpen;menu.setAttribute("aria-expanded",String(isOpen));});
mobile?.addEventListener("click",e=>{if(e.target.closest("a")){mobile.hidden=true;menu.setAttribute("aria-expanded","false");}});
})();
