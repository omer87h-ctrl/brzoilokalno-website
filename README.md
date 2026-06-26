# Brzo i Lokalno — web stranica

Landing stranica za mobilnu aplikaciju **Brzo i Lokalno**.

## Lokalno pregled

Otvori `index.html` u browseru ili pokreni jednostavan server:

```powershell
cd C:\Users\hp\Documents\BrzoiLokalnoWebsite
python -m http.server 8080
```

Zatim otvori: http://localhost:8080

## GitHub Pages

1. Kreiraj repo na GitHubu: `brzoilokalno-website` (nalog `omer87h-ctrl`)
2. Push ovog foldera:

```powershell
cd C:\Users\hp\Documents\BrzoiLokalnoWebsite
git init
git add .
git commit -m "Add Brzo i Lokalno landing page"
git branch -M main
git remote add origin https://github.com/omer87h-ctrl/brzoilokalno-website.git
git push -u origin main
```

3. GitHub → repo → **Settings** → **Pages** → Source: `main` / `/ (root)`
4. Stranica će biti na: `https://omer87h-ctrl.github.io/brzoilokalno-website/`

## Linkovi

- Huawei AppGallery: https://appgallery.huawei.com/app/C117382847
- Politike: https://omer87h-ctrl.github.io/brzoilokalno-policy/
