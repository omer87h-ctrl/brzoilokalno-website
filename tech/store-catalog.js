"use strict";
(()=>{
const $=id=>document.getElementById(id),all=window.BL_TECH_SOFTWARE_CATALOG||[],wrap=$("software-catalog"),filters=$("software-filter"),search=$("software-search"),counter=$("software-count");
if(!wrap)return;const make=(t,c,v)=>{const x=document.createElement(t);if(c)x.className=c;if(v!==undefined)x.textContent=v;return x};
const platform=$("software-platform");let category="Sve";for(const value of ["Sve",...new Set(all.map(x=>x.category))]){const b=make("button","store-chip",value);b.type="button";b.setAttribute("aria-pressed",String(value===category));b.addEventListener("click",()=>{category=value;for(const el of filters.children)el.setAttribute("aria-pressed",String(el===b));draw()});filters.append(b)}
function draw(){
 const q=(search.value||"").normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLowerCase().trim();
 const selectedPlatform=platform?.value||"Sve";const result=all.filter(x=>(category==="Sve"||x.category===category)&&(selectedPlatform==="Sve"||String(x.platform).toLowerCase().includes(selectedPlatform.toLowerCase()))&&[x.name,x.description,x.platform,x.category].join(" ").normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLowerCase().includes(q));wrap.replaceChildren();
 for(const x of result){const article=make("article","official-product"),header=make("div","official-product-head"),mark=make("div","official-product-mark",x.mark),meta=make("div","official-product-meta");
 mark.setAttribute("aria-hidden","true");meta.append(make("span","eyebrow",x.category+" / BESPLATNO"),make("h3","",x.name));header.append(mark,meta);
 const desc=make("p","",x.description),details=make("p","official-product-license",x.platform+" · "+x.license);
 const link=make("a","official-product-link","SLUŽBENO PREUZIMANJE ↗");link.href=x.url;link.target="_blank";link.rel="noopener noreferrer nofollow";link.setAttribute("aria-label","Otvori službenu stranicu za "+x.name+" (vanjska stranica)");
 article.append(header,desc,details,link);wrap.append(article);}
 if(!result.length)wrap.append(make("p","store-catalog-empty","Nema programa za odabrani pojam. Pokušaj drugu oblast."));
 counter.textContent=result.length+" OD "+all.length+" PROGRAMA · LINKOVI VODE NA STRANICE IZDAVAČA";
}
search.addEventListener("input",draw);platform?.addEventListener("change",draw);draw();
})();