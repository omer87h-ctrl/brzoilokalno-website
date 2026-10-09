// Only point this at a deployed, validated, rate-limited, App-Check-protected HTTPS endpoint.
// Do not place secret keys or service-account credentials in this public file.
const JOIN_ENDPOINT = "";
const form = document.getElementById("join-form");
const output = document.getElementById("form-status");
const button = document.getElementById("submit-button");
const roles = new Set(["graphic_design","ux_ui","content","android","web","social","other"]);
const availabilityOptions = new Set(["flexible","few_hours","project_based"]);
let lang = "bs";
const messages = {
  bs:{required:"Popuni obavezna polja i označi saglasnost.",email:"Unesi ispravnu email adresu.",sending:"Šaljem prijavu…",success:"Prijava je primljena. Hvala! Kontaktirat ću te ako se otvori prilika za saradnju.",error:"Prijava nije poslana. Sistem trenutno nije dostupan — pokušaj kasnije ili piši na kontakt iz politike privatnosti.",slow:"Prijavu si već poslao/la. Pokušaj malo kasnije."},
  en:{required:"Complete the required fields and consent checkbox.",email:"Enter a valid email address.",sending:"Sending application…",success:"Application received. Thank you! I'll contact you if there's an opportunity to collaborate.",error:"Application not sent. The service is currently unavailable — try later or use the contact in the privacy policy.",slow:"You just sent an application. Please try again later."}
};
function status(key,kind=""){output.textContent=messages[lang][key]||key;output.className="form-status "+kind;}
function language(next){lang=next;document.documentElement.lang=next;document.querySelectorAll("[data-bs][data-en]").forEach(el=>{el.textContent=el.dataset[next]});document.querySelectorAll("[data-language]").forEach(b=>{const active=b.dataset.language===next;b.classList.toggle("active",active);b.setAttribute("aria-pressed",String(active));});sessionStorage.setItem("join-lang",next);output.textContent="";}
document.querySelectorAll("[data-language]").forEach(b=>b.addEventListener("click",()=>language(b.dataset.language)));
language(sessionStorage.getItem("join-lang")==="en"?"en":"bs");
form.addEventListener("submit",async event=>{
  event.preventDefault();
  if(form.elements.website.value)return;
  const fullName=form.elements.fullName.value.trim().replace(/\s+/g," ");
  const email=form.elements.email.value.trim().toLowerCase();
  const role=form.elements.role.value;
  const portfolio=form.elements.portfolio.value.trim();
  const about=form.elements.about.value.trim();
  const availability=form.elements.availability.value;
  if(fullName.length<2||fullName.length>80||about.length<10||about.length>750||!roles.has(role)||!availabilityOptions.has(availability)||!form.elements.consent.checked){status("required","error");return;}
  if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)||email.length>120){status("email","error");return;}
  if(portfolio&&(!/^https:\/\//i.test(portfolio)||portfolio.length>220)){status(lang==="bs"?"Portfolio link mora počinjati sa https://":"Portfolio link must start with https://","error");return;}
  const last=Number(localStorage.getItem("join-last-sent")||0);
  if(Date.now()-last<60000){status("slow","error");return;}
  button.disabled=true;status("sending");
  try {
    if (!JOIN_ENDPOINT) throw new Error("Application endpoint not configured");
    const response = await fetch(JOIN_ENDPOINT,{
      method:"POST",
      headers:{"Content-Type":"application/json"},
      body:JSON.stringify({fullName,email,role,portfolio,about,availability,consent:true,source:"website"})
    });
    if(!response.ok)throw new Error("Application submission failed");
    localStorage.setItem("join-last-sent",String(Date.now()));
    form.reset();status("success","success");
  }catch(error){console.error("Join application failed:",error?.code||"unknown");status("error","error");}
  finally{button.disabled=false;}
});