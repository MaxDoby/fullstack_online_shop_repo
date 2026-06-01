# Scraper Universal - Stadiu Implementare

## Scop

Scopul taskului este construirea unui scraper real pentru import de produse in mini-shop, fara sa amestecam logica de scraping in modulele existente de produse, imagini sau admin.

Scraperul este separat in:

```txt
mini_shop_backend_nest/src/modules/scraper
```

Responsabilitatile sunt impartite astfel:

- `UltraScraperAdapter`: citeste site-ul Ultra si extrage date brute.
- `ProductScrapeNormalizer`: transforma datele brute in format intern.
- `ProductScrapeImporter`: salveaza produsul, categoria, manufacturerul si sursa.
- `ProductMetadataScrapeImporter`: salveaza specificatii si variante separat.
- `ScraperService`: coordoneaza jobul si actualizeaza statusul.
- `ScraperController`: expune endpointurile protejate pentru admin.

## Ce Este Implementat Acum

### 1. Endpointuri scraper

Endpointurile existente:

```txt
POST /scraper/jobs
GET /scraper/jobs
GET /scraper/jobs/:id
```

Toate sunt protejate cu:

```txt
JwtAuthGuard
AdminGuard
```

Pentru pornirea unui job este necesar token de admin.

### 2. Citire reala Ultra prin sitemap

Scraperul nu foloseste `/search`, deoarece Ultra blocheaza rutele de search in `robots.txt`.

In schimb, adapterul foloseste sitemapul:

```txt
https://ultra.md/sitemap/products-ro.xml
```

Acest lucru este mai controlat si mai potrivit pentru scraping responsabil.

### 3. Limitare controlata

Requestul accepta `limit`, de exemplu:

```json
{
  "sourceWebsite": "ultra.md",
  "sourceBaseUrl": "https://ultra.md",
  "limit": 2
}
```

Adapterul citeste doar primele URL-uri din sitemap conform limitei, ca sa nu incarce agresiv site-ul sursa.

### 4. Date reale extrase din pagina produsului

Din fiecare pagina Ultra se extrag date din JSON-LD:

- titlu;
- descriere;
- pret;
- brand / manufacturer;
- SKU;
- MPN;
- URL-uri imagini;
- URL sursa.

Din `BreadcrumbList` se extrage categoria reala.

Din HTML se extrag specificatiile reale din blocurile:

```html
<section class="spec-card card"></section>
```

Fiecare bloc devine un `ProductSpecificationGroup`, iar randurile din bloc devin `ProductSpecification`.

### 5. Import in baza de date

La import se salveaza:

- `Category`;
- `Manufacturer`;
- `Product`;
- `ProductSource`;
- `ProductSpecificationGroup`;
- `ProductSpecification`;
- `ProductVariant`, cand exista variante.

Produsul pastreaza in `thumbnail` primul URL extern de imagine gasit pe Ultra.

### 6. Idempotency

Pentru a evita duplicatele, se foloseste `ProductSource` cu cheia unica:

```txt
sourceWebsite + sourceUrl
```

Daca produsul a mai fost importat:

- se face update pe produsul existent;
- se actualizeaza `ProductSource`;
- se rescriu specificatiile produsului fara dublare.

Jobul raporteaza separat:

- `totalImported` pentru produse create;
- `totalUpdated` pentru produse existente actualizate.

### 7. Detalii produs pentru verificare

Endpointul:

```txt
GET /product/:id
```

include acum relatii utile pentru verificarea importului:

- category;
- manufacturer;
- productImages;
- specificationGroups + specifications;
- variants;
- sources.

Acest lucru ajuta la demo, deoarece se poate vedea clar ce a importat scraperul pentru un produs.

## Teste Rulate Local

### Build backend

```bash
cd mini_shop_backend_nest
npm run build
```

Rezultat:

```txt
build OK
```

### Test runtime scraper

Request:

```txt
POST /scraper/jobs
```

Body:

```json
{
  "sourceWebsite": "ultra.md",
  "sourceBaseUrl": "https://ultra.md",
  "limit": 1
}
```

Rezultat observat:

```txt
status: COMPLETED
totalFound: 1
totalFailed: 0
```

Pentru produsul Ultra testat s-au salvat:

```txt
6 grupuri de specificatii
22 specificatii
```

### Test idempotency

La rularea aceluiasi job de mai multe ori, produsul nu se dubleaza. Se foloseste `ProductSource` pentru a gasi produsul importat anterior si pentru a face update.

## Configurare Locala

Fisier local:

```txt
mini_shop_backend_nest/.env
```

Minimul necesar pentru backend + scraper fara upload imagini in storage:

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/mini_shop_db"
JWT_SECRET="replace_me"
PORT=3000
```

Pentru storage S3 real sunt necesare si:

```env
S3_REGION=""
S3_ACCESS_KEY=""
S3_SECRET_KEY=""
S3_BUCKET=""
S3_FORCE_PATH_STYLE="false"
```

Optional, pentru provider S3-compatible:

```env
S3_ENDPOINT=""
```

Pentru AWS S3 clasic, `S3_ENDPOINT` poate lipsi.

## Ce Nu Este Implementat Inca

### 1. Copierea imaginilor externe in storage

Momentan scraperul extrage URL-urile de imagini si seteaza `Product.thumbnail` cu primul URL extern.

Nu se creeaza inca randuri `ProductImage` pentru imaginile importate din Ultra.

Motivul: modelul `ProductImage` cere metadata reala de fisier:

- `storageKey`;
- `originalName`;
- `mimeType`;
- `size`;
- `width`;
- `height`;
- `isPrimary`.

Aceste date trebuie obtinute dupa descarcarea imaginii si upload in storage-ul nostru S3.

Nu este corect sa salvam doar URL extern in `ProductImage`, deoarece ar incalca sensul modelului existent.

### 2. Task ramas pentru calculatorul de baza

Pe calculatorul unde exista `.env` complet pentru storage:

1. Completeaza variabilele `S3_*`.
2. Testeaza endpointul existent de upload imagine:

```txt
POST /images/products/:productId
```

3. Dupa ce storage-ul este confirmat functional, implementeaza:

```txt
src/modules/scraper/importers/product-image-scrape.importer.ts
```

Responsabilitatea acelui importer:

- primeste `productId` si `product.images`;
- descarca imaginea externa;
- verifica MIME type;
- citeste metadata cu `sharp`;
- urca imaginea in S3 prin `StorageService`;
- creeaza `ProductImage`;
- seteaza prima imagine ca `isPrimary`;
- evita duplicatele la rerulare.

### 3. Posibile imbunatatiri ulterioare

- salvarea erorilor pe produs individual;
- `totalFailed` real pe produse partial esuate;
- retry controlat pentru requesturi HTTP;
- delay intre requesturi;
- suport pentru mai multe sitemapuri sau categorii;
- endpoint de cancel job;
- UI in admin pentru pornire job si urmarire status.

## Comenzi Utile

Pornire DB:

```bash
docker compose up -d
```

Migrare DB:

```bash
cd mini_shop_backend_nest
npm run db:migrate
```

Seed produse locale:

```bash
npm run seed:products
```

Pornire backend:

```bash
npm run start:dev
```

Pornire job scraper:

```txt
POST http://localhost:3000/scraper/jobs
Authorization: Bearer <ADMIN_TOKEN>
Content-Type: application/json
```

Body:

```json
{
  "sourceWebsite": "ultra.md",
  "sourceBaseUrl": "https://ultra.md",
  "limit": 2
}
```

Verificare produs:

```txt
GET http://localhost:3000/product/:id
```

Verificare lista produse:

```txt
GET http://localhost:3000/product?limit=40
```
