# Project Context - Mini Shop Fullstack

## Locatie Proiect

Folder principal:

```txt
C:\Users\Nata\Desktop\REACT\fullstack_mini_shop_project
```

Backend NestJS:

```txt
C:\Users\Nata\Desktop\REACT\fullstack_mini_shop_project\mini_shop_backend_nest
```

Frontend React:

```txt
C:\Users\Nata\Desktop\REACT\fullstack_mini_shop_project\mini_shop_frontend
```

Repo GitHub:

```txt
https://github.com/MaxDoby/test_React_online_shop_repo
```

## Descriere Generala

Proiectul este un mini-shop fullstack. A pornit initial cu backend Express, apoi backendul a fost migrat la NestJS conform taskului de stagiu.

Stack actual:

- Frontend: React + TypeScript + Vite.
- Backend: NestJS + TypeScript.
- ORM: Prisma.
- DB: PostgreSQL.
- Auth: JWT + roluri `USER` si `ADMIN`.
- Storage imagini: S3-compatible object storage.
- Procesare imagini: `sharp`.
- Documentatie API: Swagger.

Folderul vechi Express ramane in proiect pentru referinta:

```txt
mini-shop-backend-Express-old
```

## Structura Backend

Backendul este reorganizat pe module:

```txt
mini_shop_backend_nest/src
  common/
    dto/
  core/
    prisma/
    storage/
  modules/
    auth/
    categories/
    images/
    orders/
    products/
    users/
```

Module principale:

- `auth`: register, login, JWT, guarduri.
- `users`: operatii de user care nu tin direct de autentificare.
- `products`: CRUD produse, filtrare, sortare, paginare.
- `categories`: CRUD/citire categorii.
- `orders`: creare comenzi pe baza userului autentificat.
- `images`: upload, stergere, resize/scaling, setare imagine primara.
- `core/storage`: conectare la storage extern compatibil S3.
- `core/prisma`: PrismaService global.
- `common/dto`: DTO-uri reutilizabile pentru paginare.

## Structura Frontend

Frontendul este impartit in:

```txt
mini_shop_frontend/src
  components/
  hooks/
  pages/
  utils/
```

Zone importante:

- `useProducts`: incarca produse, categorii, paginare, reload produse.
- `useAuth`: login/register/logout si sesiune locala.
- `useCart`: cart, checkout, order history.
- `useAdminProducts`: produse admin, imagini produs, delete, set primary.
- `useAdminProductForm`: formular create/update produs.
- `AdminPage`: admin panel pentru produse si imagini.

## Functionalitati Implementate

### Backend

- Migrare Express -> NestJS.
- Prisma global prin `PrismaModule`.
- DTO-uri separate pentru create/update/query.
- Paginare reutilizabila.
- Categorii separate de produse.
- Auth module cu register/login.
- JWT access token.
- Guard JWT.
- Guard Admin.
- Orders module cu produse comandate si cost total.
- Swagger configurat.
- Image service:
  - upload imagine produs;
  - salvare metadata in DB;
  - salvare fisier in object storage;
  - resize cu endpoint pe dimensiuni separate;
  - resize cu varianta `size=500x300`;
  - stergere imagine;
  - setare imagine primara.

### Frontend

- Lista produse cu filtre, cautare, paginare.
- Cart si checkout.
- Auth page cu register/login.
- Admin panel.
- Create/update/delete produse din admin.
- Upload imagine produs din admin.
- Afisare imagini produs in admin.
- Stergere imagine.
- Setare imagine primara.
- Produsele publice folosesc imaginea primara cand exista.
- Header fixat sus.
- Buton `Sus` pentru revenire la inceputul paginii curente.

## Feedback Mentor Acoperit

Au fost abordate urmatoarele directii din feedback:

- Modularizare NestJS.
- Prisma global, nu importat inutil in fiecare modul.
- DTO-uri separate si documentate.
- Separare products/categories.
- Logica de filtrare/sortare/paginare pe backend.
- Auth/register/login.
- Orders.
- Image service cu object storage si `sharp`.
- Scaling imagini prin endpointuri.
- Admin panel pentru gestionare produse si imagini.
- Swagger pentru DTO-uri si controllere.

## Observatii Tehnice Curente

- `Product.thumbnail` inca exista in schema pentru compatibilitate cu produse vechi.
- Produsele noi pot avea imagini in `ProductImage`.
- Pentru viitor se poate decide daca `thumbnail` ramane fallback sau va fi eliminat dupa migrare completa de date.
- Exista fisiere locale de lucru care pot sa nu fie urcate automat pe GitHub fara verificare:
  - `ADMIN_PANEL_PLAN.md`
  - `docs/`
  - `scripts/`

## Ultimele Ajustari Locale Importante

- Headerul frontend a fost facut `fixed`, lipit de marginea de sus a ecranului.
- A fost adaugat butonul `Sus` in header pentru scroll la inceputul paginii curente.
- In admin, lista de imagini se deschide sub randul produsului.
- Click repetat pe `Images` inchide lista de imagini.
- Preview-ul imaginilor admin este randat ca overlay separat, centrat in browser.

## Comenzi Verificare

Backend:

```bash
cd mini_shop_backend_nest
npm run build
npm run lint
```

Frontend:

```bash
cd mini_shop_frontend
npm run build
npm run lint
```

## Regula De Lucru In Continuare

Inainte de orice task nou:

1. Verifica fisierele reale.
2. Verifica schema Prisma daca taskul atinge DB.
3. Propune pasii.
4. Cere confirmare daca nu exista cerere explicita de implementare.
5. Dupa implementare ruleaza build/lint/test relevant.
