#!/usr/bin/env python3
"""Refresh attributed TECH headlines from two publisher RSS feeds."""
import datetime as dt
import email.utils
import json
import urllib.request
import urllib.parse
import xml.etree.ElementTree as ET
from pathlib import Path

SOURCES=[("GitHub Blog","https://github.blog/feed/","github.blog"),("Mozilla Hacks","https://hacks.mozilla.org/feed/","hacks.mozilla.org")]
OUTPUT=Path(__file__).with_name("news-live.json")
today=dt.datetime.now(dt.timezone.utc).date()
stories=[]
for source,feed,hostname in SOURCES:
    try:
        req=urllib.request.Request(feed,headers={"User-Agent":"BLTECHFeed/1.0","Accept":"application/rss+xml"})
        with urllib.request.urlopen(req,timeout=15) as response:
            if urllib.parse.urlparse(response.url).hostname!=hostname: raise ValueError("Unexpected domain")
            body=response.read(1000001)
        if len(body)>1000000 or b"<!DOCTYPE" in body.upper(): raise ValueError("Invalid feed")
        root=ET.fromstring(body)
        for item in root.findall(".//channel/item")[:15]:
            title=" ".join((item.findtext("title") or "").split())
            link=(item.findtext("link") or "").strip()
            parsed=urllib.parse.urlparse(link)
            if not (9<=len(title)<=180 and parsed.scheme=="https" and parsed.hostname==hostname): continue
            try: date=email.utils.parsedate_to_datetime(item.findtext("pubDate") or "").date()
            except (ValueError,TypeError,OverflowError): continue
            if not today-dt.timedelta(days=45)<=date<=today: continue
            stories.append({"title":title,"source":source,"date":date.isoformat(),"url":link,"category":"RAZVOJ","kind":"vanjski","origin":"automatski-rss","description":"Naslov iz RSS izvora; otvori originalnu objavu."})
    except Exception as e:
        print(source,"unavailable:",type(e).__name__)
stories=list({s["url"]:s for s in stories}.values())
stories.sort(key=lambda s:s["date"],reverse=True)
if len(stories)<3:
    raise SystemExit("Not enough valid stories; preserving last good feed")
OUTPUT.write_text(json.dumps({"updated":today.isoformat(),"method":"automatski-rss","stories":stories[:10]},ensure_ascii=False,indent=2)+"\n",encoding="utf-8")
print("Saved",min(len(stories),10),"headlines")
