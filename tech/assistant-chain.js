"use strict";
/* Asistent Core: local editorial retrieval -> intent -> grounded next action.
   No network, no tracking, no persistence, no automatic publication. */
(function(root){
  const stop=new Set(["sam","da","li","mi","me","meni","sta","što","što","sto","za","na","od","u","i","ili","je","su","se","do","sa","koji","koja","kako","treba","trebam","zelim","želim","hoću","imam","molim","the"]);
  const fold=s=>String(s??"").normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLowerCase();
  const words=s=>fold(s).match(/[\p{L}\p{N}]+/gu)||[];
  const tokens=s=>words(s).filter(x=>x.length>1&&!stop.has(x));
  const internal=s=>typeof s==="string" && (s.startsWith("./")||s.startsWith("/tech/"))&&!s.includes("..")&&!s.includes("//");
  const external=s=>typeof s==="string" && /^https:\/\/[a-z0-9.-]+(?:\/|$)/i.test(s);
  const catalog=()=>{
    const P=root.BL_PORTAL_CONTENT||{articles:[],materials:[]};
    const D=root.BL_GUARDIAN_DATA||root.BL_ASISTENT_DATA||{models:[],tools:[]};
    const all=[];
    for(const a of P.articles||[])if(a.title&&internal(a.href))all.push({type:"ČLANAK",title:a.title,description:a.summary||"",category:a.category||"TECH",url:a.href});
    for(const a of P.materials||[])if(a.file&&a.name)all.push({type:a.cat==="Knjige"?"KNJIGA":"RESURS",title:a.name,description:a.desc||"",category:a.cat||"Biblioteka",url:"./citaj.html?resurs="+encodeURIComponent(a.file)});
    for(const a of D.models||[])if(a.name&&external(a.source))all.push({type:"TELEFON",title:a.name,description:a.note||"",category:"Uređaji",url:"./telefoni.html",source:a.source});
    for(const a of D.tools||[])if(a.name&&a.href&&(internal(a.href)||external(a.href)))all.push({type:"SOFTVER",title:a.name,description:a.description||"",category:a.kind||"Alati",url:a.href});
    for(const [title,description,url] of [
      ["Kalkulator pločica","površina keramičkih pločica komadi i rezerva","./alati.html?alat=tiles"],
      ["Kalkulator boje","krečenje zidovi litri pokrivnost boje slojevi","./alati.html?alat=paint"],
      ["Kalkulator ponude","sati rada materijal troškovi cijena usluge KM","./alati.html?alat=offer"],
      ["Kompas telefona","poređenje modela cijene budžet baterija ekran","./telefoni.html"],
      ["Biblioteka","digitalne police knjige vodiči čitanje predlošci","./biblioteka.html"],
      ["Tech zona","aktuelne teme članci analize i vijesti","./tech-zona.html"],
      ["Studio","pisanje vlastitog članka i lokalni nacrt","./studio.html"],
      ["Predloži objavu","urednički pregled oglasa članaka knjiga projekata","./objavi.html"],
      ["Majstori i kreatori","zanat usluge projekti lokalni radovi","./majstori-kreatori.html"]
    ])all.push({type:"FUNKCIJA",title,description,category:"Portal",url});
    return all;
  };
  const routes=[
    {id:"tiles",re:/plocic|keramik|podov|fug|kupatil/,title:"Kalkulator pločica",url:"./alati.html?alat=tiles",text:"Unesi dimenzije prostora i pločica. Izračunat ćemo površinu, rezervu i okvirni broj komada."},
    {id:"paint",re:/kre[cč]|farb|boj[aeiu]|zidov|molersk|litara/,title:"Kalkulator boje",url:"./alati.html?alat=paint",text:"Za procjenu boje potrebni su površina, broj slojeva i pokrivnost proizvođača."},
    {id:"offer",re:/ponud|predracun|sati rada|satnic|troškov|troskov|cijena rada/,title:"Kalkulator ponude",url:"./alati.html?alat=offer",text:"Sastavi orijentacioni izračun cijene rada i materijala u KM."},
    {id:"phone",re:/telefon|mobitel|smartfon|iphone|samsung|redmi|xiaomi|kamer|baterij|pametni uredaj/,title:"Kompas telefona",url:"./telefoni.html",text:"Uporedi stvarne deklarisane specifikacije, vlastiti budžet i cijene koje pronađeš."},
    {id:"write",re:/pisanj|napis|objav|clanak|članak|oglas|autor|urednik|intervju|tekst/,title:"Studio za autore",url:"./studio.html",text:"Pripremi autorski tekst u Studiju. Za javnu objavu pošalji rad na urednički pregled."},
    {id:"library",re:/knjig|bibliotek|cit(a|aj)|čita|vodič|vodic|predloz|prirucnik|priručnik|pdf|preuzim/,title:"Biblioteka",url:"./biblioteka.html",text:"Pronađi knjigu, vodič ili predložak. Otvori ga u čitaču ili ga preuzmi."},
    {id:"software",re:/program|softver|besplatan|dizajn|cad\b|crtan|video|audio|grafik|blender|krita|inkscape|freecad|librecad/,title:"Alati i softver",url:"./alati.html#kreatori",text:"Istraži besplatne programe za tehničko crtanje, dizajn, zvuk i kreativni rad."},
    {id:"news",re:/novost|vijest|aktueln|analiz|tehnolog|artificial|android|web|ai\b/,title:"TECH zona",url:"./tech-zona.html",text:"Pronađi objavljene članke i najnovije linkove prema vanjskim izvorima. Vanjske naslove označavamo izvorom."},
    {id:"maker",re:/majstor|kreator|zanat|obrt|uslug|radovi|lokaln/,title:"Majstori i kreatori",url:"./majstori-kreatori.html",text:"Pogledaj tehnologiju i alate za stvarne poslove, zanate i kreativne projekte."}
  ];
  const greetings=/^(?:(?:alo|hej|ej|hello|hi|cao|ćao|ćao|pozdrav|zdravo|dobar dan|dobro jutro|dobro vece|dobro veče|tu si|ima li koga)[!?., ]*)+$/i;
  function route(query,previous){
    const q=fold(query).trim();
    if(greetings.test(q))return {id:"greeting",title:"Asistent",url:null,text:"Tu sam. Šta te zanima — tehnologija, telefoni, knjige, alati ili nešto što želiš napraviti?"};
    const found=routes.find(r=>r.re.test(q));
    if(found)return found;
    if(tokens(q).length<4 && previous)return routes.find(r=>r.id===previous)||routes[7];
    return {id:"general",title:"Istraži Brzo i Lokalno TECH",url:"./tech-zona.html",text:"Mogu povezati članak, knjigu, softver ili kalkulator s tvojim pitanjem. Reci mi šta želiš saznati ili napraviti."};
  }
  function search(query,limit=4){
    const q=tokens(query),exact=fold(query).trim();
    if(!q.length)return [];
    return catalog().map(item=>{
      const name=fold(item.title),other=fold(item.description+" "+item.category);
      const score=q.reduce((s,t)=>s+(name.includes(t)?5:0)+(other.includes(t)?2:0),0)+(exact.length>4&&name.includes(exact)?6:0);
      return {item,score};
    }).filter(x=>x.score>0).sort((a,b)=>b.score-a.score).slice(0,limit).map(x=>x.item);
  }
  function respond(question,state={}){
    const text=String(question??"").slice(0,600).trim();
    const intent=route(text,state.lastIntent);
    if(intent.id==="greeting")return {intent:"greeting",title:"Asistent",answer:intent.text,sources:[],grounding:[],next:"",updatedState:{lastIntent:state.lastIntent||null}};
    const matches=search(text,5).filter(x=>x.url!==intent.url);
    const sources=[{type:"FUNKCIJA",title:intent.title,url:intent.url,description:intent.text},...matches.slice(0,intent.id==="general"?1:3)];
    const budget=/\b(\d{2,6})\s*km\b/i.exec(text);
    const addition=budget&&intent.id==="phone"?" Budžet koji si spomenuo: "+budget[1]+" KM. Cijene unosiš prema ponudama koje si sam provjerio.":"";
    const next={
      phone:"Je li ti važnija baterija, kamera ili cijena?",
      tiles:"Kolika je površina i koje dimenzije pločica koristiš?",
      paint:"Znaš li koliko kvadrata treba okrečiti?",
      write:"Želiš li napisati članak ili poslati oglas?",
      library:"Zanima li te knjiga, praktični vodič ili predložak?",
      news:"Više te zanimaju uređaji, AI ili softver?",
      software:"Tražiš li alat za crtanje, grafiku ili zvuk?",
      maker:"Treba li ti alat ili želiš predstaviti svoj rad?"
    }[intent.id]||"Koju temu želiš prvo istražiti?";
    const grounding=matches.map(x=>({title:x.title,type:x.type,description:x.description,url:x.url,source:x.source||null}));
    return {intent:intent.id,title:intent.title,answer:intent.text+addition,sources,grounding,next,updatedState:{lastIntent:intent.id}};
  }
  root.BLAssistantChain={catalog,search,respond,version:"1.0"};
})(window);
