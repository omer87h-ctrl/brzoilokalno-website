# Brzo i Lokalno / Tech portal

Preview branch: preview/brzoilokalno-tech-portal. This folder is independent of existing /app and root landing page.

## Sections
Portal (six original guides), Biblioteka (four local files), BL Free Store (same free digital assets), Lab and Radar (email submission), Podcast (clearly marked preparation).

## How to add an article
1. Create tech/clanci/slug.html using existing article HTML as a structural template.
2. Add metadata entry in tech/data.js under articles. Category should match filter chips or be added to the navigation filters.
3. Add the new URL to tech/feed.xml and to the site's sitemap when publishing publicly.
4. Provide source links and rights for images/other content. Never invent ratings, dates, interviews, reviews, or user counts.

## Add a free item
1. Confirm authorship or appropriate license.
2. Place static file in tech/resursi/ (keep within GitHub Pages limits).
3. Add an entry in tech/data.js under materials with filename, description and license.
4. Verify download on mobile and desktop.

## No backend
No Firebase, login, personal data forms, file uploads, shopping cart, payment, live stream or automated external news feed. Emails use mailto and require a local mail client. Podcast section is not an active player without episodes. No new domain or paid hosting needed to preview code.

## Deployment review
Keep the preview branch isolated until approved. Publish by merging to main, then update the main navigation and sitemap *only with explicit approval*.
