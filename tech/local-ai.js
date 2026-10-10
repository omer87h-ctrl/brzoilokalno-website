"use strict";
const $=id=>document.getElementById(id);
const chat=$("a-chat"),form=$("a-form"),input=$("a-input"),submit=$("a-submit"),state=$("a-status"),load=$("a-load"),model=$("a-model"),progress=$("a-progress"),status=$("a-progress-text");
let engine=null,loading=false,busy=false;
let shortHistory=[],routeState={};
const chain=window.BLAssistantChain;
function bubble(role,message,links){
 const item=document.createElement("div");item.className="a-bubble "+role;
 const name=document.createElement("small");name.textContent=role==="user"?"TI":role==="ai"?"ASISTENT AI":"ASISTENT";
 const para=document.createElement("p");para.textContent=String(message||"");
 item.append(name,para);
 if(Array.isArray(links)&&links.length){
  const nav=document.createElement("div");nav.className="a-source-list";
  for(const link of links.slice(0,4)){
   const a=document.createElement("a");a.textContent=link.title+" ↗";a.href=link.url;
   if(/^https:\/\//.test(link.url)){a.target="_blank";a.rel="noopener noreferrer";}
   nav.append(a);
  }item.append(nav);
 }
 chat.append(item);chat.scrollTop=chat.scrollHeight;
 return item;
}
const clean=s=>String(s||"").replace(/[<>]/g," ").trim().slice(0,600);
function summaryFromChain(query){
 const result=chain?.respond(query,routeState);
 if(!result)return {answer:"Otvori TECH zonu ili Biblioteku da istražiš sadržaj.",sources:[],next:"Šta te zanima?"};
 routeState=result.updatedState||{};
 return result;
}
async function answer(query){
 if(busy||loading||!query.trim())return;
 busy=true;submit.disabled=true;input.disabled=true;
 bubble("user",query);
 const result=summaryFromChain(query);
 if(!engine||result.intent==="greeting"){
  bubble("bot",result.answer+(result.next?"\n\n"+result.next:""),result.sources);
 }else{
  const thinking=bubble("bot","Razmišljam uz sadržaj portala…");
  try{
   const context=[...result.sources].slice(0,4).map(x=>"- "+x.title+" ("+x.type+"): "+x.description).join("\n");
   const system="Ti si Asistent Brzo i Lokalno TECH portala. Odgovaraj na bosanskom, jasno i prirodno, bez infantilnog tona. Pomažeš istraživati članke, knjige, software i kalkulatore. Koristi samo izlistane lokalne izvore kada navodiš činjenice o portalu. Nemoj izmišljati vijesti, testove, cijene, osobne podatke ili funkcionalnosti. Ako nemaš pouzdanu činjenicu, kaži da je ne znaš. Ne preuzimaj ulogu urednika niti objavljuj u njegovo ime. Budi koncizan.";
   const response=await engine.chat.completions.create({messages:[{role:"system",content:system+"\nKontekst iz uredničkog kataloga:\n"+context},...shortHistory.slice(-6),{role:"user",content:query}],temperature:0.35,max_tokens:260});
   const output=clean(response.choices?.[0]?.message?.content)||result.answer;
   thinking.remove();
   bubble("ai",output,result.sources);
   shortHistory.push({role:"user",content:query},{role:"assistant",content:output});
   shortHistory=shortHistory.slice(-8);
  }catch(err){
   thinking.remove();
   engine=null;
   state.textContent="LITE AKTIVAN";
   status.textContent="AI model je prekinuo odgovor. Prebačeno na Lite; možeš ponovo pokušati uključiti AI.";
   load.disabled=false;model.disabled=false;load.textContent="PONOVO UKLJUČI AI ↗";
   bubble("bot",result.intent==="general"?"Tu sam. Možeš me pitati za uređaje, knjige, softver ili alat koji ti treba.":result.answer+(result.next?"\n\n"+result.next:""),result.intent==="general"?[]:result.sources);
   console.warn("Local AI generation failed",err);
  }
 }
 busy=false;submit.disabled=false;input.disabled=false;
 // Do not force the Android keyboard open again after responding.
}
form.addEventListener("submit",event=>{event.preventDefault();const q=input.value.trim();if(!q)return;input.value="";void answer(q);});
document.querySelectorAll("[data-assistant-prompt]").forEach(b=>b.addEventListener("click",()=>{input.value=b.dataset.assistantPrompt;void answer(input.value);input.value="";}));
async function loadModel(){
 if(loading||engine)return;
 if(!("gpu" in navigator)){status.textContent="Ovaj preglednik nema WebGPU. Asistent Lite je aktivan i nastavlja raditi.";state.textContent="LITE AKTIVAN";return;}
 loading=true;load.disabled=true;model.disabled=true;state.textContent="UČITAVANJE";
 status.textContent="Preuzimam AI model…";progress.hidden=false;
 try{
  const webllm=await import("https://esm.run/@mlc-ai/web-llm@0.2.85");
  const id=model.value;
  const listed=webllm.prebuiltAppConfig.model_list.some(m=>m.model_id===id);
  if(!listed)throw new Error("Odabrani model nije u dostupnom katalogu biblioteke.");
  const created=await webllm.CreateMLCEngine(id,{initProgressCallback:p=>{const value=Number(p.progress)||0;progress.value=Math.round(Math.max(0,Math.min(1,value))*100);status.textContent="Učitavanje modela: "+(p.text||Math.round(value*100)+"%");}});
  engine=created;state.textContent="AI AKTIVAN";status.textContent="AI radi u ovom pregledniku. Poruke se ne šalju na server za obradu.";load.textContent="AI UKLJUČEN";
 }catch(error){
  status.textContent="AI nije dostupan na ovom uređaju ili učitavanje nije uspjelo. Lite ostaje aktivan.";
  state.textContent="LITE AKTIVAN";load.disabled=false;model.disabled=false;
  console.warn("Local AI initialization failed",error);
 }finally{loading=false;progress.hidden=true;}
}
load.addEventListener("click",()=>{void loadModel()});
input.addEventListener("keydown",e=>{if(e.key==="Enter"&&!e.shiftKey){e.preventDefault();form.requestSubmit();}});
