#!/usr/bin/env python3
"""Publish attributed outbound RSS headlines. Never copy article bodies or images."""
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
    ("NASA", "https://www.nasa.gov/feed/", "www.nasa.gov"),
    ("The Verge AI", "https://www.theverge.com/rss/ai-artificial-intelligence/index.xml", "www.theverge.com"),
    ("The Verge", "https://www.theverge.com/rss/index.xml", "www.theverge.com"),
    ("BleepingComputer", "https://www.bleepingcomputer.com/feed/", "www.bleepingcomputer.com"),
    ("ScienceDaily", "https://www.sciencedaily.com/rss/top/technology.xml", "www.sciencedaily.com"),
]
OUTPUT = Path(__file__).with_name("news-live.json")
ARCHIVE = Path(__file__).with_name("news-archive.json")
TODAY = dt.datetime.now(dt.timezone.utc).date()
MAX_AGE = 30
MAX_ITEMS = 42


def safe_text(value):
    return " ".join((value or "").split())[:180]


def accepted_url(value, hostname):
    u = urllib.parse.urlsplit((value or "").strip())
    return (u.scheme == "https" and u.hostname == hostname
            and not u.username and not u.password and bool(u.path))


def date_from(raw):
    try:
        parsed = email.utils.parsedate_to_datetime(raw)
        if parsed.tzinfo is None:
            parsed = parsed.replace(tzinfo=dt.timezone.utc)
        return parsed.astimezone(dt.timezone.utc).date()
    except (ValueError, TypeError, OverflowError):
        pass
    try:
        return dt.datetime.fromisoformat(raw.replace("Z", "+00:00")).date()
    except (ValueError, TypeError, AttributeError):
        return None


def entries(root):
    # RSS 2.0 and Atom 1.0 are both supported.
    for item in root.findall("./channel/item"):
        yield (
            item.findtext("title"),
            item.findtext("link"),
            item.findtext("pubDate") or item.findtext("date"),
        )
    ns = "{http://www.w3.org/2005/Atom}"
    for item in root.findall(f".//{ns}entry"):
        href = next((e.attrib.get("href") for e in item.findall(f"{ns}link")
                     if e.attrib.get("rel", "alternate") == "alternate"), None)
        yield (
            item.findtext(f"{ns}title"),
            href,
            item.findtext(f"{ns}published") or item.findtext(f"{ns}updated"),
        )


def load_feed(source, url, hostname):
    request = urllib.request.Request(
        url, headers={"User-Agent": "BrzoILokalnoTECH/1.0 (+https://brzoilokalno.com/tech/)",
                      "Accept": "application/rss+xml, application/atom+xml, application/xml"})
    with urllib.request.urlopen(request, timeout=20) as response:
        if urllib.parse.urlsplit(response.url).hostname != hostname:
            raise ValueError("Unexpected feed redirect hostname")
        body = response.read(1_000_001)
    if len(body) > 1_000_000 or b"<!DOCTYPE" in body.upper():
        raise ValueError("Feed too large or unsafe XML")
    result = []
    for title, link, raw_date in entries(ET.fromstring(body)):
        title = safe_text(title)
        link = (link or "").strip()
        date = date_from(raw_date)
        if not (9 <= len(title) <= 180 and accepted_url(link, hostname) and date):
            continue
        if not TODAY - dt.timedelta(days=MAX_AGE) <= date <= TODAY:
            continue
        category = {
            "NASA": "NAUKA", "ScienceDaily": "NAUKA",
            "The Verge AI": "AI", "The Verge": "TEHNOLOGIJA",
            "BleepingComputer": "SIGURNOST", "Mozilla Hacks": "WEB",
        }.get(source, "SOFTVER")
        result.append({
            "title": title, "source": source, "date": date.isoformat(),
            "url": link, "category": category, "kind": "vanjski",
            "origin": "automatski-rss",
            "description": "Naslov iz izdavačevog RSS izvora. Otvori original."
        })
    return result


def main():
    stories = []
    for source, feed, hostname in SOURCES:
        try:
            collected = load_feed(source, feed, hostname)
            stories.extend(collected[:8])
            print(f"{source}: {len(collected)} verified links")
        except Exception as error:
            print(f"{source}: unavailable ({type(error).__name__})")
    unique = {entry["url"]: entry for entry in stories}
    items = sorted(unique.values(), key=lambda item: item["date"], reverse=True)[:MAX_ITEMS]
    if not items:
        print("No new valid feed entries; existing data preserved")
        return
    data = {"updated": TODAY.isoformat(), "method": "automatski-rss", "stories": items}
    OUTPUT.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(f"Published {len(items)} attributed outbound links")



def refresh_archive():
    try:
        latest = json.loads(OUTPUT.read_text(encoding="utf-8"))
        if latest.get("updated") != TODAY.isoformat():
            return
        fresh = latest.get("stories", [])
        previous = json.loads(ARCHIVE.read_text(encoding="utf-8"))
        older = previous.get("stories", [])
        valid = {"github.blog", "hacks.mozilla.org", "www.nasa.gov",
                 "developer.android.com", "www.reuters.com", "www.theverge.com",
                 "www.bleepingcomputer.com", "www.sciencedaily.com"}
        merged = {}
        for story in older + fresh:
            if not isinstance(story, dict) or story.get("kind") != "vanjski":
                continue
            url = story.get("url", "")
            try:
                parts = urllib.parse.urlsplit(url)
                if parts.scheme != "https" or parts.hostname not in valid:
                    continue
            except (ValueError, TypeError):
                continue
            if not isinstance(story.get("title"), str) or not isinstance(story.get("date"), str):
                continue
            if url in merged:
                for field in ("titleBs", "summaryBs", "translationStatus"):
                    if isinstance(merged[url].get(field), str) and merged[url][field]:
                        story[field] = merged[url][field]
            merged[url] = story
        stories = sorted(merged.values(), key=lambda x: x.get("date", ""), reverse=True)[:180]
        ARCHIVE.write_text(json.dumps(
            {"updated": TODAY.isoformat(), "method": "RSS i urednicki odabrani linkovi", "stories": stories},
            ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
        print("Archive contains", len(stories), "outbound links")
    except (OSError, ValueError, TypeError) as exc:
        print("Archive preserved:", type(exc).__name__)


if __name__ == "__main__":
    main()
    refresh_archive()
