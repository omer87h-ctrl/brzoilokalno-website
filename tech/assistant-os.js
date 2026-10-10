"use strict";
/**
 * Asistent OS for TECH — the web counterpart of GuardianOS + Interpreter +
 * ScenarioEngine + SystemKnowledge + safe Tool Router.
 * All computation and context stay in this tab. No Firebase, network or storage.
 * Public knowledge comes exclusively from editorial BL data.
 */
(function(root){
  const basic=root.BLAssistantChain;
  if(!basic)throw new Error("Asistent needs assistant-chain.js");
  const clean=s=>String(s??"").normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLowerCase().trim();
  const n=s=>Number(String(s).replace(",","."));
  const number=s=>Number.isFinite(n(s))?n(s):null;
  const pnum=(v,d=2)=>new Intl.NumberFormat("bs-BA",{maximumFractionDigits:d}).format(v);
  const within=(v,min,max)=>Number.isFinite(v)&&v>=min&&v<=max;
  const topics=[
    {id:"phone",re:/telefon|mobitel|iphone|redmi|samsung|xiaomi|smartfon|pametni uredaj|model[a]? uredaj|kamera|baterija/},
    {id:"tiles",re:/plocic|keramik|keramic|poploc|kupatil/},
    {id:"paint",re:/farban|farbat|krecen|krecit|kre[cč]|boj[aeiu]|zidov|sob[aeiu]|molersk/},
    {id:"offer",re:/ponud|predracun|sati rada|satnic|cijena rada|troskov|zarad[ae]|obracun rada/},
    {id:"library",re:/bibliotek|knjig|prirucnik|citati|citanj|vodi[cč]|resurs|predlos|pdf/},
    {id:"software",re:/softver|besplatn|program|2d|3d|cad|dizajn|blender|inkscape|krita|freecad|audacity|librecad|qelectrotech/},
    {id:"write",re:/clanak|tekst|napis|pisanj|objav|urednik|recenzij|oglas|intervju/},
    {id:"news",re:/vijest|novost|aktueln|trend|tech zona|tehnolog|analiz|android|pwa|ai\b/},
    {id:"maker",re:/majstor|kreator|obrt|zanat|uslug|projekt|radov/}
  ];
  const greet=/^(alo|hej|ej|hello|hi|cao|ćao|zdravo|pozdrav|tu si|ima li koga|dobar dan|dobro jutro|dobro vece)[?!.,\s]*$/;
  const thanks=/^(hvala|fala|super|odlicno|ok|okej|dobro)[!.\s]*$/;
  const vague=/^(a |i |pa |onda |dobro |sta |što |koliko |koji |koja |kakav |kakva |jel |moze |može )/;
  const purePriority=/^(baterij[aeiu]|kamer[aeiu]|cijen[aeu]|budget|budzet|ekran|velicin[ae]|veličin[ae]|tezin[ae]|lagan|kompaktan|zastit[ae]|zaštit[ae])$/;
  const choices={battery:["baterij","kapacitet"],camera:["kamer","slik"],price:["cijen","jeftin","budzet"],screen:["ekran","veliki ekran","velicin"],light:["lagan","tezin","kompakt"],resistance:["zastit","ip68","vodo"]};
  function priorityOf(t){for(const [k,arr] of Object.entries(choices))if(arr.some(v=>t.includes(v)))return k;return null;}
  function phoneByName(q,items){
    return items.filter(m=>clean(m.name).split(/\s+/).some(w=>w.length>=4&&clean(q).includes(w))||
      clean(q).includes(clean(m.name))).map(x=>x.name);
  }
  function findBudget(t){const m=/\b(\d{2,6})\s*(?:km|maraka)\b/.exec(t);return m?Math.min(50000,Number(m[1])):null;}
  function measure(t){
    const r=/(?:\b)(\d{1,4}(?:[.,]\d{1,3})?)\s*[x×]\s*(\d{1,4}(?:[.,]\d{1,3})?)\s*(m2|m²|m|cm)?\b/.exec(t);
    if(!r)return null;const a=n(r[1]),b=n(r[2]),unit=r[3]||"";
    if(!within(a,.01,1000)||!within(b,.01,1000))return null;
    return {a,b,unit};
  }
  function identify(text,state){
    const q=clean(text).replace(/\s+/g," ");
    if(greet.test(q))return {id:"greeting",confidence:1};
    if(thanks.test(q))return {id:"thanks",confidence:1};
    const found=topics.filter(x=>x.re.test(q));
    // Follow-up from previous scenario, e.g. "baterija" after asking about a phone
    if(state.lastIntent==="phone"&&(purePriority.test(q)||q.length<23&&priorityOf(q)))return {id:"phone",confidence:.95};
    if(found.length){
      if(found[0].id==="phone" && /recenzij/.test(q))return {id:"phone",confidence:.9};
      return {id:found[0].id,confidence:.9};
    }
    if(state.lastIntent&&q.length<42&&(vague.test(q)||q.split(" ").length<=3))return {id:state.lastIntent,confidence:.65};
    return {id:"general",confidence:0};
  }
  function safeLinks(intent,query,limit=3){
    const entries=basic.search(query,6)||[];
    const sources=entries.filter(x=>x.url&&/^(?:\.\/|https:\/\/)/.test(x.url));
    const byType={
      phone:["TELEFON","ČLANAK"],library:["KNJIGA","RESURS","ČLANAK"],
      news:["ČLANAK"],software:["SOFTVER"],write:["ČLANAK","RESURS"],
      maker:["ČLANAK","SOFTVER"],general:["ČLANAK","KNJIGA","RESURS","SOFTVER"]
    }[intent];
    if(!byType)return [];
    const selected=sources.filter(x=>byType.includes(x.type));
    return selected.slice(0,limit);
  }
  const actions={
    phone:{title:"Kompas telefona",url:"./telefoni.html",next:"Želiš li porediti dva modela ili prvo odrediti šta ti je najvažnije?"},
    tiles:{title:"Kalkulator pločica",url:"./alati.html?alat=tiles",next:"Kolike su površina i dimenzije pločica?"},
    paint:{title:"Kalkulator boje",url:"./alati.html?alat=paint",next:"Koju površinu krečiš i znaš li pokrivnost boje?"},
    offer:{title:"Kalkulator ponude",url:"./alati.html?alat=offer",next:"Unesi sate rada, cijenu po satu i trošak materijala."},
    library:{title:"Biblioteka",url:"./biblioteka.html",next:"Tražiš knjigu, vodič ili predložak?"},
    software:{title:"Alati i softver",url:"./alati.html#kreatori",next:"Za koji zadatak ti treba program?"},
    write:{title:"Autorski studio",url:"./studio.html",next:"Želiš napisati tekst ili poslati prijavu uredništvu?"},
    news:{title:"TECH zona",url:"./tech-zona.html",next:"Zanimaju li te telefoni, AI ili razvoj softvera?"},
    maker:{title:"Majstori i kreatori",url:"./majstori-kreatori.html",next:"Trebaš alat, znanje ili želiš predstaviti rad?"},
    general:{title:"Istraži TECH portal",url:"./tech-zona.html",next:"Reci mi šta želiš pronaći ili napraviti."}
  };
  function toolPlan(intent,q,state){
    const action=actions[intent]||actions.general;
    const slots={...state.slots};
    const budget=findBudget(q);
    if(budget!==null&&intent==="phone")slots.budget=budget;
    if(intent==="phone"){
      const p=priorityOf(q);if(p)slots.phonePriority=p;
      const models=root.BL_GUARDIAN_DATA?.models||[];
      const named=phoneByName(q,models);
      if(named.length)slots.phoneModels=named;
      if(slots.budget&&slots.phonePriority)return {
        title:"Tvoj kriterij za telefon",text:"Budžet: "+pnum(slots.budget,0)+" KM. Prioritet: "+({battery:"baterija",camera:"kamera",price:"cijena",screen:"ekran",light:"kompaktnost",resistance:"otpornost"}[slots.phonePriority]||slots.phonePriority)+". U katalogu imamo tehničke podatke, ali ne i potvrđene dnevne cijene iz BiH. Za izbor uporedi cijene koje pronađeš s prikazanim specifikacijama.",
        action,slots,next:"Želiš li uporediti konkretne modele?"};
      if(slots.budget)return {title:"Telefon prema budžetu",text:"Zabilježio sam budžet do "+pnum(slots.budget,0)+" KM. Šta ti je najvažnije: baterija, kamera, ekran ili cijena?",action,slots,next:"Odgovori jednom riječi, npr. baterija."};
      if(slots.phonePriority)return {title:"Biramo prema prioritetu",text:"Razumijem — fokus je "+({battery:"na bateriji",camera:"na kameri",price:"na cijeni",screen:"na ekranu",light:"na manjem i lakšem telefonu",resistance:"na otpornosti"}[slots.phonePriority])+". Mogu uporediti deklarisane specifikacije poznatih modela. Za kameru neću davati ocjene bez stvarnih testova.",action,slots,next:"Koliki ti je budžet u KM?"};
      if(slots.phoneModels?.length)return {title:"Modeli u katalogu",text:"Prepoznao sam: "+slots.phoneModels.join(", ")+". Mogu prikazati deklarisane razlike, ali neću izmišljati iskustva testiranja ili trenutne cijene.",action,slots,next:"Šta ti je najvažnije pri izboru?"};
      return {title:"Biramo telefon",text:"Mogu povezati dostupne modele, specifikacije i tvoje potrebe. Za smislen prijedlog trebam budžet i glavni prioritet.",action,slots,next:"Koliko KM planiraš potrošiti?"};
    }
    if(intent==="tiles"){
      const dims=measure(q);
      if(dims&&dims.unit!=="cm")slots.floor={a:dims.a,b:dims.b};
      if(dims&&dims.unit==="cm")slots.tile={a:dims.a,b:dims.b};
      const m=/(\d{1,3}(?:[.,]\d+)?)\s*%/.exec(q);
      if(m&&within(n(m[1]),0,50))slots.reserve=n(m[1]);
      if(slots.floor&&slots.tile){
        const area=slots.floor.a*slots.floor.b,unit=slots.tile.a*slots.tile.b/10000;
        const reserve=slots.reserve??10;
        const count=Math.ceil(area*(1+reserve/100)/unit);
        if(within(area,.01,1e5)&&within(unit,.0001,10)&&Number.isSafeInteger(count)&&count<=1e7)
          return {title:"Procjena pločica",text:"Površina "+pnum(area)+" m²; pločica "+pnum(slots.tile.a)+" × "+pnum(slots.tile.b)+" cm; rezerva "+pnum(reserve,0)+"%. Procjena: "+pnum(count,0)+" komada. Ovo je račun po površini; raspored, fuge i pakovanja mogu promijeniti potrebnu količinu.",action,slots,next:"Trebaš li i pripremu ponude?"};
      }
      return {title:"Površina i pločice",text:"Mogu izračunati broj pločica prema mjerama i rezervi. Unesi dimenzije poda u metrima i veličinu pločice u centimetrima.",action,slots,next:slots.floor?"Koje su dimenzije pločica, npr. 60x60 cm?":"Kolike su dimenzije poda, npr. 4x3 m?"};
    }
    if(intent==="paint"){
      const m=/\b(\d+(?:[.,]\d+)?)\s*(?:m2|m²|kvadrat[anih]*)\b/.exec(q);
      if(m&&within(n(m[1]),.01,1e5))slots.area=n(m[1]);
      if(slots.area)return {title:"Procjena boje",text:"Površina: "+pnum(slots.area)+" m². Za izračun litara trebaju pokrivnost boje (m²/L) i broj slojeva. Otvori kalkulator — rezultate ćeš dobiti odmah.",action,slots,next:"Znaš li pokrivnost navedenu na kanti?"};
      return {title:"Izračun boje",text:"Izračunavam prema površini, broju slojeva i deklarisanoj pokrivnosti boje — ne prema nagađanju.",action,slots,next:"Koliko kvadrata treba okrečiti?"};
    }
    const fallback=basic.respond(q,{lastIntent:intent});
    return {title:action.title,text:fallback?.answer||"Mogu povezati tvoje pitanje s dostupnim rubrikama i alatima.",action,slots,next:action.next};
  }
  function respond(question,state={}){
    const text=String(question??"").slice(0,450).trim();
    const q=clean(text);
    if(!text)return {intent:"general",answer:"Šta želiš pronaći ili napraviti?",sources:[],next:"",updatedState:state};
    const routing=identify(text,state),intent=routing.id;
    if(intent==="greeting")return {intent,title:"Asistent",answer:"Tu sam. Šta te zanima?",sources:[],next:"",steps:["pozdrav"],updatedState:{...state}};
    if(intent==="thanks")return {intent,title:"Asistent",answer:"U redu. Kad ti nešto zatreba, pitaj.",sources:[],next:"",steps:["razgovor"],updatedState:{...state}};
    const output=toolPlan(intent,q,state);
    const baseSources=intent==="general"&&routing.confidence<.5?[]:safeLinks(intent,text);
    const links=[{type:"ALAT",title:output.action.title,url:output.action.url,description:"Otvori funkciju portala"},...baseSources.filter(x=>x.url!==output.action.url)].slice(0,4);
    const nextState={lastIntent:intent,slots:output.slots,turns:Math.min(20,(Number(state.turns)||0)+1)};
    return {intent,title:output.title,answer:output.text,sources:links,grounding:baseSources,next:output.next,steps:["kontekst","namjera","znanje","alat","provjera","odgovor"],updatedState:nextState,tool:{id:intent,requiresConfirmation:!["phone","library","software","news","maker","general"].includes(intent),url:output.action.url}};
  }
  root.BLAssistantChain={...basic,respond,identify,version:"2.0-os"};
})(window);
