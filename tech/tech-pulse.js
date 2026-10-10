"use strict";
(()=>{const track=document.getElementById("tech-live-track"),toggle=document.getElementById("tech-live-toggle");if(!track||!toggle)return;
const entries=Array.isArray(window.BL_TECH_PULSE)?window.BL_TECH_PULSE:[];
const allowed=url=>{try{let u=new URL(url,location.href);return u.protocol==="https:"||u.origin===location.origin;}catch{return false}};
const items=entries.filter(x=>x&&typeof x.title==="string"&&x.title.length>8&&x.title.length<=180&&allowed(x.url)&&typeof x.source==="string").slice(0,14);
if(!items.length){toggle.hidden=true;return;}
track.replaceChildren();const group=document.createElement("div");group.className="tech-live-group";
for(const item of items){const link=document.createElement("a");link.href=item.url;link.target=item.url.startsWith("http")?"_blank":"_self";link.rel="noopener noreferrer";
const source=document.createElement("strong");source.textContent=item.source+" · ";
const title=document.createElement("span");title.textContent=item.title;
const date=document.createElement("time");date.textContent=item.date||"";if(/^\d{4}-\d{2}-\d{2}$/.test(item.date||""))date.dateTime=item.date;
link.append(source,title,date);group.append(link);
}
track.append(group);if(items.length>1){const dupe=group.cloneNode(true);dupe.setAttribute("aria-hidden","true");dupe.querySelectorAll("a").forEach(a=>a.tabIndex=-1);track.append(dupe);}
const reducedMotion=matchMedia("(prefers-reduced-motion: reduce)").matches;
let paused=reducedMotion||items.length===1;
if(reducedMotion||items.length===1){toggle.hidden=true;toggle.setAttribute("aria-label","Panel vijesti se pomjera ručno");}
const apply=()=>{track.classList.toggle("paused",paused);toggle.setAttribute("aria-pressed",String(paused));toggle.textContent=paused?"POKRENI ▶":"PAUZA II";};
toggle.addEventListener("click",()=>{if(reducedMotion)return;paused=!paused;apply()});track.addEventListener("mouseenter",()=>{track.classList.add("hover-stop")});track.addEventListener("mouseleave",()=>track.classList.remove("hover-stop"));track.addEventListener("focusin",()=>track.classList.add("hover-stop"));track.addEventListener("focusout",()=>track.classList.remove("hover-stop"));apply();
})();