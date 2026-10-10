#!/usr/bin/env python3
"""Create TECH Pulse entries from permitted official RSS titles only.

No article bodies, images, author bylines or copied descriptions are published.
Each link goes to the source. Runs in CI with no API secrets or Firebase.
"""
from __future__ import annotations
import datetime as dt
import email.utils
import json
import urllib.parse
import urllib.request
import xml.etree.ElementTree as ET
from pathlib import Path

SOURCES = [
    ("GitHub Blog", "https://github.blog/feed/", "github.blog"),
    ("Mozilla Hacks", "https://hacks.mozilla.org/feed/", "hacks.mozilla.org"),
]
BASE = Path(__file__).resolve().parent
OUT = BASE / "news-feed.js"
LIMIT = 10

def load_rss(source_name: str, feed_url: str, hostname: str) -> list[dict]:
    req = urllib.request.Request(feed_url, headers={
        "User-Agent": "BrzoILokalnoTECH/1.0 (RSS title attribution; link to original)",
        "Accept": "application/rss+xml, application/xml, text/xml",
    })
    with urllib.request.urlopen(req, timeout=20) as reply:
        if urllib.parse.urlparse(reply.url).hostname != hostname:
            raise ValueError("Unexpected redirect domain")
        data = reply.read(2_000_001)
        if len(data) > 2_000_000:
            raise ValueError("Feed is too large")
    root = ET.fromstring(data)
    entries = []
    for item in root.findall(".//channel/item")[:20]:
        title = (item.findtext("title") or "").strip()
        link = (item.findtext("link") or "").strip()
        parsed = urllib.parse.urlparse(link)
        if not (8 < len(title) <= 180 and parsed.scheme == "https" and parsed.hostname == hostname):
            continue
        raw_date = (item.findtext("pubDate") or "").strip()
        try:
            date = email.utils.parsedate_to_datetime(raw_date).date().isoformat()
        except (ValueError, TypeError, IndexError, OverflowError):
            continue
        if dt.date.fromisoformat(date) > dt.datetime.now(dt.timezone.utc).date() + dt.timedelta(days=1):
            continue
        entries.append({"title": title, "source": source_name, "date": date, "url": link})
    return entries

def main() -> None:
    all_items: list[dict] = []
    errors = []
    for name, url, domain in SOURCES:
        try:
            found = load_rss(name, url, domain)
            if len(found) < 1:
                errors.append(f"{name}: empty feed")
            all_items.extend(found)
        except Exception as exc:
            errors.append(f"{name}: {type(exc).__name__}: {exc}")
    if not all_items:
        raise SystemExit("No verified RSS entries; preserve existing news feed. " + "; ".join(errors))
    unique = {}
    for item in all_items:
        unique[item["url"]] = item
    selected = sorted(unique.values(), key=lambda x: x["date"], reverse=True)[:LIMIT]
    data = json.dumps(selected, ensure_ascii=False, indent=2)
    # Serialize for a classic script, avoiding JS/HTML closing tag injection.
    safe = data.replace("<", "\\u003c").replace(">", "\\u003e").replace("&", "\\u0026")
    OUT.write_text("// Official external RSS headlines only. All stories link to their source.\n"
                   "window.BL_TECH_PULSE = " + safe + ";\n", encoding="utf-8")
    print(f"Wrote {len(selected)} verified external headlines to {OUT}")
    if errors:
        print("Partial errors: " + "; ".join(errors))

if __name__ == "__main__":
    main()
