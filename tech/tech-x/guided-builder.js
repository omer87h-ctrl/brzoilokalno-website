'use strict';
(() => {
 const {$,clone,button}=TEZ,website=TEZWebsite;
 const styles={
  business:{name:'Linija · usluge',theme:'midnight',decoration:'grid',description:'Jasna ponuda, tok saradnje i kontakt. Podijeljena naslovnica s originalnom CSS mrežom.'},
  portfolio:{name:'Folio · portfolio',theme:'daylight',decoration:'plain',description:'Svijetla urednička kompozicija koja daje prostor vlastitim projektima i stvarnom iskustvu.'},
  craft:{name:'Radionica · obrt',theme:'sunset',decoration:'shapes',description:'Topla tipografija i urednički raspored za zanat, usluge i ličan pristup poslu.'},
  community:{name:'Zajedno · inicijativa',theme:'forest',decoration:'orbit',description:'Centralna poruka, jasan cilj zajednice i koraci za uključivanje.'},
  event:{name:'Susret · događaj',theme:'daylight',decoration:'grid',description:'Centralni naslov, program susreta i praktična pitanja. Datume i organizatore unosiš ti.'},
  product:{name:'Forma · proizvod',theme:'forest',decoration:'orbit',description:'Geometrijska naslovnica, stvarne funkcije proizvoda i odgovori prije korištenja.'}
 };
 function seed(purpose){
  const data=clone(website.read()),example=website.examples[purpose],style=styles[purpose];
  data.site={...data.site,template:purpose,theme:style.theme,decoration:style.decoration,brand:example.brand,title:example.title,summary:example.summary,layout:example.layout,kicker:'',email:'','action-target':'#ponuda','action-text':purpose==='event'?'Pogledaj program':purpose==='portfolio'?'Pogledaj projekte':'Saznaj više'};
  ['bg','fg','accent'].forEach((key,i)=>data.site[key]=website.palettes[style.theme][i]);data.sections=clone(example.sections);return data;
 }
 const create=(tag,text)=>{const e=document.createElement(tag);if(text!==undefined)e.textContent=text;return e;};
 let lastFocus=null;
 function open(purpose){lastFocus=document.activeElement;$('onboarding-purpose').value=purpose||website.read().site.template;$('onboarding-status').textContent='';$('visual-onboarding').showModal();$('onboarding-brand').focus();}
 $('visual-start').addEventListener('click',()=>open());
 $('onboarding-cancel').addEventListener('click',()=>$('visual-onboarding').close());
 $('visual-onboarding').addEventListener('close',()=>lastFocus?.focus());
 $('visual-onboarding-form').addEventListener('submit',event=>{
  event.preventDefault();try{
   const data=seed($('onboarding-purpose').value);
   for(const name of ['brand','title','summary','email'])data.site[name]=$('onboarding-'+name).value.trim();
   if(!data.site.brand||!data.site.title||!data.site.summary)throw Error('Upiši naziv, naslov i kratak opis.');
   website.build(data);
   if(!confirm('Primijeniti tvoj novi početak? Trenutni rad možeš vratiti dugmetom PONIŠTI. Sačuvani projekti ostaju.'))return;
   website.restore(data);$('visual-onboarding').close();$('visual-identity').scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth'});$('visual-brand').focus({preventScroll:true});
   $('visual-status').textContent='Tvoj početak je napravljen. Zamijeni uputne tekstove sekcija svojim sadržajem, provjeri telefon i sačuvaj projekat.';
  }catch(e){$('onboarding-status').textContent=e.message;}
 });
 for(const [purpose,style] of Object.entries(styles)){
  const card=create('article');card.className='template-card';const preview=create('iframe');preview.title='Pregled originalnog predloška '+style.name;preview.setAttribute('sandbox','');preview.setAttribute('referrerpolicy','no-referrer');preview.setAttribute('aria-hidden','true');preview.tabIndex=-1;preview.loading='lazy';preview.srcdoc=website.build(seed(purpose));
  const copy=create('div');copy.append(create('h3',style.name),create('p',style.description),button('POČNI S OVIM PREDLOŠKOM →',()=>open(purpose)));card.append(preview,copy);$('visual-template-gallery').append(card);
 }
 const originalText=new Set(Object.values(website.examples).flatMap(e=>[e.brand,e.title,e.summary,...e.sections.flatMap(s=>[s.title,s.body,...s.items.flatMap(i=>[i.title,i.body])])]).filter(Boolean));
 const lum=c=>{const rgb=c.slice(1).match(/../g).map(x=>parseInt(x,16)/255).map(x=>x<=.04045?x/12.92:((x+.055)/1.055)**2.4);return rgb[0]*.2126+rgb[1]*.7152+rgb[2]*.0722;};
 const contrast=(a,b)=>(Math.max(lum(a),lum(b))+.05)/(Math.min(lum(a),lum(b))+.05);
 function refresh(){
  const d=website.read(),issues=[];let blocked=false;
  try{website.build(d);}catch(e){blocked=true;issues.push({text:e.message,target:'#visual-identity',error:true});}
  if(!blocked){
   if(contrast(d.site.bg,d.site.fg)<4.5)issues.push({text:'Tekst i pozadina imaju slab kontrast. Izaberi čitljiviju paletu.',target:'#visual-bg'});
   if(contrast(d.site.bg,d.site.accent)<4.5)issues.push({text:'Tekst glavnog dugmeta ima slab kontrast s akcentom. Promijeni boju akcenta.',target:'#visual-accent'});
   if(!d.site.summary.trim())issues.push({text:'Dodaj kratak opis: koristi se i za opis preuzete web stranice.',target:'#visual-summary'});
   if(!d.sections.length)issues.push({text:'Stranica nema sekcije. Dodaj sadržaj koji objašnjava tvoj rad.',target:'#visual-section-type'});
   if([d.site.brand,d.site.title,d.site.summary].some(t=>originalText.has(t)||t==='Moj projekat'||t.startsWith('Uredi ovaj tekst')))issues.push({text:'Naziv, naslov ili opis još sadrže početni primjer. Upiši svoj sadržaj.',target:'#visual-identity'});
   const placeholder=d.sections.filter(s=>[s.body,...s.items.flatMap(i=>[i.title,i.body])].some(t=>t&&(originalText.has(t)||/^(Uredi|Upiši|Napiši|Opiši|Dodaj|Navedi)\b/.test(t))));
   if(placeholder.length)issues.push({text:`${placeholder.length} sekcija još sadrži početni ili uputni tekst. Provjeri sadržaj prije objave.`,target:'#visual-sections'});
   if(!d.site.email&&!d.sections.some(s=>s.items.some(i=>/^mailto:|^tel:/.test(i.link))))issues.push({text:'Nema emaila ili telefonskog linka. Ako očekuješ kontakt, dodaj javni kontakt ili objasni način javljanja.',target:'#visual-email'});
  }
  $('visual-quality-summary').textContent=blocked?'Izvoz je zaustavljen dok ne ispraviš grešku.':issues.length?`${issues.length} napomena za pregled prije objave.`:'Tehnička provjera prolazi. Još provjeri tekst, stvarne linkove i prikaz na telefonu.';
  const root=$('visual-quality-list');root.replaceChildren();
  for(const issue of issues){const li=create('li');if(issue.error)li.className='quality-error';const a=create('a',issue.text);a.href=issue.target;li.append(a);root.append(li);}
 }
 window.TEZGuidance={refresh,seed};refresh();
 if(new URLSearchParams(location.search).get('vodic')==='web')open('business');
})();
