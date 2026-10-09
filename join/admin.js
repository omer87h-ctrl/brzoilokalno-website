import { firebaseConfig, ADMIN_EMAIL } from "../app/firebase.js";
import { initializeApp, getApps } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-app.js";
import { getAuth, onAuthStateChanged, signInWithEmailAndPassword, signOut } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js";
import { getFirestore, collection, query, orderBy, limit, getDocs, doc, updateDoc, deleteDoc } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";
const app=getApps()[0]||initializeApp(firebaseConfig),auth=getAuth(app),db=getFirestore(app);
const login=document.getElementById("admin-login"),loginArea=document.getElementById("login-area"),area=document.getElementById("applications-area"),logout=document.getElementById("logout"),status=document.getElementById("admin-status"),root=document.getElementById("applications"),count=document.getElementById("count");
let applications=[];
const roles={graphic_design:"Graphic design",ux_ui:"UX/UI",content:"Content / video",android:"Android",web:"Web / PWA",social:"Social / writing",other:"Other"};
const statusOptions=["new","reviewing","contacted","accepted","closed"];
function say(message){status.textContent=message;}
function node(tag,text,cls){const el=document.createElement(tag);el.textContent=text??"";if(cls)el.className=cls;return el;}
function show(){const search=document.getElementById("search").value.toLowerCase().trim(),role=document.getElementById("role-filter").value;const filtered=applications.filter(a=>(!role||a.role===role)&&(!search||[a.fullName,a.email,a.about,a.portfolio].join(" ").toLowerCase().includes(search)));
count.textContent=filtered.length+" od "+applications.length+" prijava (prikazuje se najviše 200 najnovijih).";root.replaceChildren();
if(!filtered.length){root.append(node("p","Nema pronađenih prijava.","empty"));return;}
for(const a of filtered){
const card=node("article","","application");
card.append(node("span",roles[a.role]||"Other","role"),node("h3",a.fullName),node("p",a.email,"meta"));
card.append(node("p",a.about));
if(a.portfolio&&/^https:\/\//i.test(a.portfolio)){const link=node("a","Portfolio ↗");link.href=a.portfolio;link.target="_blank";link.rel="noopener noreferrer";card.append(link);}
const date=a.createdAt?.toDate?.();card.append(node("p",(date?date.toLocaleString("bs-BA"):"Bez datuma")+" · "+(a.availability||"flexible"),"meta"));
const controls=node("div","","controls"),select=node("select");
for(const option of statusOptions){const el=node("option",option);el.value=option;select.append(el);}
select.value=statusOptions.includes(a.status)?a.status:"new";
select.addEventListener("change",async()=>{select.disabled=true;try{await updateDoc(doc(db,"collaboration_applications",a.id),{status:select.value});a.status=select.value;say("Status sačuvan.");}catch{say("Promjena nije uspjela.");}finally{select.disabled=false;}});
const remove=node("button","Obriši","danger");remove.type="button";remove.addEventListener("click",async()=>{if(!confirm("Trajno obrisati ovu prijavu?"))return;remove.disabled=true;try{await deleteDoc(doc(db,"collaboration_applications",a.id));applications=applications.filter(x=>x.id!==a.id);show();say("Prijava obrisana.");}catch{remove.disabled=false;say("Brisanje nije uspjelo.");}});
controls.append(select,remove);card.append(controls);root.append(card);
}}
async function refresh(){say("Učitavam prijave…");try{const snap=await getDocs(query(collection(db,"collaboration_applications"),orderBy("createdAt","desc"),limit(200)));applications=snap.docs.map(d=>({id:d.id,...d.data()}));show();say("");}catch(e){say("Nije moguće učitati prijave. Provjeri Firestore pravila i administratorska prava.");}}
onAuthStateChanged(auth,user=>{const allowed=!!user&&user.email===ADMIN_EMAIL&&user.emailVerified!==false;loginArea.hidden=allowed;area.hidden=!allowed;logout.hidden=!allowed;if(allowed)refresh();else{applications=[];root.replaceChildren();if(user)say("Ovaj račun nema administratorski pristup.");}});
login.addEventListener("submit",async e=>{e.preventDefault();say("Provjeravam prijavu…");try{await signInWithEmailAndPassword(auth,login.elements.email.value.trim(),login.elements.password.value);login.elements.password.value="";say("");}catch{say("Prijava nije uspjela. Provjeri podatke.");}});
logout.addEventListener("click",()=>signOut(auth));
document.getElementById("refresh").addEventListener("click",refresh);
document.getElementById("search").addEventListener("input",show);
document.getElementById("role-filter").addEventListener("change",show);
document.getElementById("csv").addEventListener("click",()=>{const header=["name","email","role","portfolio","about","availability","status","createdAt"];const quote=x=>'"'+String(x??"").replace(/^[=+@\-\t\r]/,"'").replace(/"/g,'""')+'"';const rows=[header,...applications.map(a=>[a.fullName,a.email,a.role,a.portfolio,a.about,a.availability,a.status,a.createdAt?.toDate?.()?.toISOString()||""])];const csv="\ufeff"+rows.map(r=>r.map(quote).join(",")).join("\r\n");const url=URL.createObjectURL(new Blob([csv],{type:"text/csv;charset=utf-8"}));const a=document.createElement("a");a.href=url;a.download="brzo-i-lokalno-saradnici.csv";a.click();URL.revokeObjectURL(url);});
