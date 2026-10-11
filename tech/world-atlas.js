"use strict";
(()=>{
  const topics=window.BL_UNIVERSE_TOPICS||[];
  const atlas=document.getElementById("atlas-planets");
  if(!atlas||!topics.length)return;
  const categories=[...new Set(topics.map(item=>item.category))];
  const descriptions={
    "AI":"Kako modeli uče, gdje griješe i šta znači odgovorno koristiti inteligentne sisteme.",
    "UREĐAJI":"Ispod ekrana, kablova i specifikacija: šta tehnologija zaista omogućava.",
    "SOFTVER":"Od otvorenog koda do aplikacija: razumij šta koristiš i šta smiješ mijenjati.",
    "SIGURNOST":"Podaci, uređaji i mreže. Istraži stvarne digitalne rizike i dobre navike.",
    "NAUKA":"Otkrića i eksperimenti koji pomjeraju granice našeg razumijevanja svijeta.",
    "WEB":"Kako funkcioniše internet i šta se događa kada otvoriš web stranicu.",
    "KREATIVNOST":"Tehnologija kao sredstvo za nove ideje, rad i stvaralaštvo.",
    "HISTORIJA":"Važne prekretnice i ljudi koji su oblikovali današnju tehnologiju."
  };
  let current=categories[0];
  const title=document.getElementById("atlas-title");
  const copy=document.getElementById("atlas-copy");
  const count=document.getElementById("atlas-index");
  const paths=document.getElementById("atlas-paths");
  const buttons=new Map();
  const el=(tag,cls,text)=>{const node=document.createElement(tag);node.className=cls;if(text!==undefined)node.textContent=text;return node};
  function select(cat){
    current=cat;
    buttons.forEach((node,key)=>node.setAttribute("aria-pressed",String(key===cat)));
    const related=topics.filter(topic=>topic.category===cat);
    title.textContent=cat;
    copy.textContent=descriptions[cat]||"Izaberi jednu od tema i istraži pouzdane izvore.";
    count.textContent=(categories.indexOf(cat)+1)+" / "+categories.length+" OBLASTI";
    paths.replaceChildren();
    related.forEach((topic,i)=>{
      const b=el("button","","");
      b.type="button";
      b.append(el("span","",String(i+1).padStart(2,"0")),el("strong","",topic.title));
      b.setAttribute("aria-label","Otvori objašnjenje: "+topic.title);
      b.addEventListener("click",()=>{
        const cards=document.querySelectorAll("#universe-results .universe-card");
        const query=document.getElementById("universe-query");
        const reset=document.getElementById("universe-reset");
        reset.click();
        const categoryButton=[...document.querySelectorAll("#universe-categories button")].find(x=>x.textContent===cat);
        categoryButton?.click();
        const index=related.findIndex(t=>t.id===topic.id);
        const card=cards[index]; 
        /* Čitanje ide kroz postojeći, pristupačan modal i isti provjereni tekst. */
        const matching=[...document.querySelectorAll("#universe-results .universe-card")].find(node=>node.querySelector("h3")?.textContent===topic.title);
        matching?.querySelector(".read-topic")?.click();
      });
      paths.append(b);
    });
    document.getElementById("atlas-all-link").setAttribute("href","#otkrij");
  }
  categories.forEach(cat=>{
    const button=el("button","atlas-planet",cat);
    button.type="button";button.setAttribute("aria-pressed","false");
    button.addEventListener("click",()=>select(cat));
    atlas.append(button);buttons.set(cat,button);
  });
  document.getElementById("atlas-next")?.addEventListener("click",()=>select(categories[(categories.indexOf(current)+1)%categories.length]));
  select(current);
})();
