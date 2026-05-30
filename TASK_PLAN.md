# Task Plan - Scraper Universal

## Task Curent

Urmatorul task major primit de la mentor este construirea unui website scraper universal pentru import de produse.

Mentorul cere un sistem real, nu un script simplu:

- clientul indica website-ul sursa;
- clientul poate da filtre generale: brand, tip produs, titlu, pret;
- scraperul gaseste produse pe website;
- citeste metadata;
- parcurge pagini multiple;
- normalizeaza datele la arhitectura proiectului;
- salveaza produse, categorii, imagini si atribute in DB;
- trebuie sa fie generic pentru HTML, API, HTTP, sitemap sau alte surse;
- trebuie sa evite date corupte sau incurcate;
- trebuie sa nu loveasca agresiv website-ul sursa.

## Decizie Arhitecturala

Scraperul se implementeaza separat, intr-un modul dedicat:

```txt
mini_shop_backend_nest/src/modules/scraper
```

Nu se amesteca logica de scraping in:

- `ProductsService`;
- `ImagesService`;
- `CategoriesService`;
- controllerul de admin.

Aceste servicii pot fi reutilizate sau apelate controlat, dar responsabilitatea principala ramane in `ScraperModule`.

## Arhitectura Propusa

```txt
scraper/
  scraper.module.ts
  scraper.controller.ts
  scraper.service.ts
  dto/
  interfaces/
  adapters/
    ultra/
    bestbuy/
  normalizers/
  importers/
  utils/
```

## Componente Principale

### 1. ScraperController

Responsabilitati:

- porneste un job de scraping;
- listeaza joburile;
- afiseaza statusul unui job;
- optional: opreste/anuleaza un job.

### 2. ScraperService

Responsabilitati:

- primeste cererea;
- creeaza `ScrapeJob`;
- alege adapterul corect;
- coordoneaza extractia;
- trimite datele catre normalizer;
- trimite datele catre importer.

### 3. ScraperAdapter

Contract comun pentru orice website.

Exemple de adaptori:

- `UltraScraperAdapter`;
- `BestBuyScraperAdapter`;
- `GenericHtmlAdapter`;
- `GenericApiAdapter`.

Rol:

- stie cum se citeste website-ul respectiv;
- gaseste pagini de categorie;
- parcurge paginarea;
- extrage date brute.

### 4. Normalizer

Transforma produsul brut extern in produs intern.

Exemple:

- `"12 999 MDL"` -> `12999`;
- `"TV / OLED / LG"` -> category + brand + type;
- HTML description -> text curat;
- image URL extern -> lista de imagini pentru import.

### 5. Importer

Salveaza datele in sistemul nostru.

Responsabilitati:

- creeaza sau gaseste categoria;
- creeaza sau actualizeaza produsul;
- descarca si salveaza imaginile in storage;
- creeaza `ProductImage`;
- seteaza imagine primara;
- evita duplicatele.

## Modele DB Propuse

### ScrapeJob

Scop:

Urmarim fiecare rulare de scraping.

Campuri propuse:

- `id`
- `sourceWebsite`
- `sourceBaseUrl`
- `brand`
- `productType`
- `searchText`
- `minPrice`
- `maxPrice`
- `status`
- `totalFound`
- `totalImported`
- `totalUpdated`
- `totalFailed`
- `errorMessage`
- `createdAt`
- `updatedAt`
- `finishedAt`

Status propus:

- `PENDING`
- `RUNNING`
- `COMPLETED`
- `FAILED`
- `CANCELED`

### ScrapedProductSource

Scop:

Evitam duplicatele si stim de unde vine fiecare produs.

Campuri propuse:

- `id`
- `productId`
- `scrapeJobId`
- `sourceWebsite`
- `sourceUrl`
- `externalId`
- `externalHash`
- `lastScrapedAt`

### Brand

Scop:

Mentorul cere explicit brand. Este mai curat sa fie model separat decat string aruncat in `Product`.

Campuri propuse:

- `id`
- `name`
- `slug`
- `products`

### ProductAttribute

Scop:

Produsele externe au specificatii diferite. Nu toate pot fi coloane fixe in `Product`.

Campuri propuse:

- `id`
- `productId`
- `name`
- `value`
- `unit`

Exemple:

- `Screen size = 55 inch`
- `RAM = 16 GB`
- `Color = Black`

## Ordinea Corecta De Implementare

### Pasul 1 - Schema Prisma

Adaugam modelele:

- `ScrapeJob`;
- `ScrapedProductSource`;
- `Brand`;
- `ProductAttribute`;
- enum `ScrapeJobStatus`.

Ajustam `Product`:

- optional `brandId`;
- relatie cu `Brand`;
- relatie cu `ProductAttribute`;
- relatie cu `ScrapedProductSource`.

Verificare:

```bash
cd mini_shop_backend_nest
npx prisma format
npx prisma migrate dev --name add_scraper_models
npm run build
```

### Pasul 2 - Generare ScraperModule

Comanda propusa:

```bash
cd mini_shop_backend_nest
nest g module modules/scraper
nest g controller modules/scraper --no-spec
nest g service modules/scraper --no-spec
```

### Pasul 3 - DTO Pentru Pornire Job

Cream DTO:

```txt
src/modules/scraper/dto/start-scrape-job.dto.ts
```

Campuri:

- `sourceWebsite`
- `sourceBaseUrl`
- `brand`
- `productType`
- `searchText`
- `minPrice`
- `maxPrice`
- `limit`

### Pasul 4 - Interfete Universale

Cream:

```txt
src/modules/scraper/interfaces/scraper-adapter.interface.ts
src/modules/scraper/interfaces/raw-scraped-product.interface.ts
src/modules/scraper/interfaces/normalized-product.interface.ts
```

Scop:

Separarea clara intre:

- date brute externe;
- date normalizate;
- date salvate in DB.

### Pasul 5 - Scraper Registry

Cream un mecanism care alege adapterul corect:

- `ultra.md` -> `UltraScraperAdapter`;
- `bestbuy.com` -> `BestBuyScraperAdapter`;
- fallback -> eroare clara: adapter unsupported.

### Pasul 6 - Ultra Adapter

Prima implementare reala.

Scop:

- citeste website-ul Ultra;
- identifica produse;
- extrage titlu, pret, categorie, brand, URL produs, imagini.

Important:

- se verifica `robots.txt`;
- se prefera sitemap/categorii permise;
- nu se porneste crawler agresiv pe rute blocate.

### Pasul 7 - Normalizer

Normalizeaza:

- titlu;
- descriere;
- pret;
- brand;
- categorie;
- atribute;
- imagini.

### Pasul 8 - Importer

Salveaza in DB:

- category;
- brand;
- product;
- attributes;
- product source;
- product images.

Regula:

Daca exista deja `sourceUrl` sau `externalId`, se face update, nu create.

### Pasul 9 - Endpointuri Scraper

Endpointuri propuse:

- `POST /scraper/jobs`
- `GET /scraper/jobs`
- `GET /scraper/jobs/:id`
- `POST /scraper/jobs/:id/cancel`

Pentru inceput, endpointurile trebuie protejate cu:

- `JwtAuthGuard`;
- `AdminGuard`.

### Pasul 10 - Swagger

Documentam:

- DTO-urile;
- statusurile;
- exemplele reale;
- erorile posibile.

### Pasul 11 - Admin Panel

Dupa backend:

- form de pornire job;
- tabela joburi;
- status/progres;
- numar produse importate/actualizate/esuate;
- erori.

## Principii De Calitate

1. Scraperul nu salveaza direct date brute in `Product`.
2. Orice produs trece prin normalizer.
3. Orice produs are sursa salvata.
4. Orice import trebuie sa fie idempotent: rularea de doua ori nu dubleaza produsele.
5. Imaginile externe se copiaza in storage-ul nostru.
6. Produsele incomplete se marcheaza ca failed, nu se salveaza ca produse valide.
7. Orice eroare trebuie legata de `ScrapeJob`.
8. Adapterele specifice nu trebuie sa cunoasca detaliile de Prisma.
9. Importerul nu trebuie sa stie cum a fost citit website-ul.
10. Controllerul nu trebuie sa contina logica de scraping.

## Primul Pas Cand Reluam

Primul pas concret:

1. Deschide `mini_shop_backend_nest/prisma/schema.prisma`.
2. Adauga modelele pentru scraper.
3. Ruleaza `npx prisma format`.
4. Ruleaza migrarea.
5. Verifica `npm run build`.

Inainte de implementare, agentul trebuie sa verifice schema reala si sa ofere schimbarea pas cu pas, conform regulilor din `AGENTS.md`.
