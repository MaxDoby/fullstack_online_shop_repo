# TechFlow Mini Shop

TechFlow Mini Shop is a fullstack internship project built with React, NestJS, PostgreSQL, Prisma, RabbitMQ, and S3-compatible image storage.

The project started as a React + Express application and was migrated to a NestJS backend with a modular, layered architecture.

## Public Links

- Frontend: [https://test-react-online-shop-repo.vercel.app](https://test-react-online-shop-repo.vercel.app)
- Backend API: [https://mini-shop-backend-wxq7.onrender.com](https://mini-shop-backend-wxq7.onrender.com)
- Swagger API Docs: [https://mini-shop-backend-wxq7.onrender.com/api-docs](https://mini-shop-backend-wxq7.onrender.com/api-docs)
- Healthcheck: [https://mini-shop-backend-wxq7.onrender.com/health](https://mini-shop-backend-wxq7.onrender.com/health)

## Main Features

- Product catalog with backend pagination, search, sorting, categories, and product details.
- JWT authentication with Passport strategy, register/login/me flow, and role-based admin access.
- Admin panel for product management, image upload, image preview, primary image selection, and scraper jobs.
- Product image service with S3-compatible object storage and dynamic scaling through Sharp.
- Orders flow with authenticated checkout and transactional stock/order creation logic.
- Website scraper flow for importing products from external websites.
- RabbitMQ queue for scraper jobs, so long-running scraping work does not block the HTTP request lifecycle.
- Swagger documentation for controllers and DTOs.
- Standardized error responses with status code, message, path, and timestamp.
- Unit and E2E tests for core backend flows.
- Docker Compose setup for backend, PostgreSQL, and RabbitMQ.

## Tech Stack

Frontend:

- React
- TypeScript
- Vite
- React Router DOM

Backend:

- Node.js
- NestJS
- TypeScript
- Prisma ORM
- PostgreSQL
- Passport JWT
- RabbitMQ
- Swagger
- Sharp
- AWS S3 SDK for S3-compatible storage

Infrastructure:

- Vercel for frontend deployment
- Render for backend deployment
- Render PostgreSQL for production database
- RabbitMQ-compatible queue service for scraper jobs
- S3-compatible object storage for product images
- Docker Compose for local full-stack infrastructure

## Project Structure

```text
fullstack_mini_shop_project
+-- docker-compose.yml
+-- mini_shop_backend_nest
|   +-- prisma
|   +-- scripts
|   +-- src
|   |   +-- common
|   |   +-- config
|   |   +-- core
|   |   +-- modules
|   +-- test
+-- mini_shop_frontend
+-- mini-shop-backend-Express-old
```

Backend structure:

- `src/modules` contains domain modules such as auth, products, categories, images, orders, scraper, and users.
- `src/core` contains infrastructure code such as Prisma, storage, database repositories, and messaging.
- `src/common` contains reusable DTOs, types, decorators, guards, and filters.
- Controllers handle HTTP input/output.
- Services contain business rules.
- Repositories contain Prisma database access.
- Mappers transform database models into response DTOs.

## Backend API Overview

Main routes:

```text
GET     /health

POST    /auth/register
POST    /auth/login
GET     /auth/me

GET     /product
GET     /product/:id
POST    /product
PUT     /product/:id
DELETE  /product/:id

GET     /categories

POST    /images/product/:productId
GET     /images/product/:productId
PATCH   /images/:imageId/primary
DELETE  /images/:imageId
GET     /images/:imageId
GET     /images/:imageId/:width/:height
GET     /images/:imageId/:size

POST    /orders
GET     /orders/my

POST    /scraper/jobs
GET     /scraper/jobs
GET     /scraper/jobs/:id
DELETE  /scraper/jobs/:id
```

Admin-only routes require a valid JWT access token with admin role.

## Environment Variables

Backend `.env` variables:

```env
DATABASE_URL=
JWT_SECRET=

S3_ENDPOINT=
S3_REGION=
S3_ACCESS_KEY=
S3_SECRET_KEY=
S3_BUCKET=
S3_FORCE_PATH_STYLE=true

RABBITMQ_URL=
RABBITMQ_SCRAPER_QUEUE=scraper.jobs

PORT=3000
```

Root `.env.docker` is used by Docker Compose for the backend container. It should contain the same backend variables, but with Docker service hostnames:

```env
DATABASE_URL=postgresql://postgres:postgres@postgres:5432/mini_shop_db
RABBITMQ_URL=amqp://guest:guest@rabbitmq:5672
RABBITMQ_SCRAPER_QUEUE=scraper.jobs
```

The S3 variables are still required in Docker because product images are stored in object storage.

## Local Setup

Install backend dependencies:

```bash
cd mini_shop_backend_nest
npm install
```

Install frontend dependencies:

```bash
cd mini_shop_frontend
npm install
```

Start local infrastructure only:

```bash
docker compose up -d --build
```

Start local infrastructure together with the backend container:

```bash
docker compose --profile fullstack up -d --build
```

Docker services:

- Backend: `http://localhost:3000`
- PostgreSQL: `localhost:5433`
- RabbitMQ AMQP: `localhost:5672`
- RabbitMQ Management UI: `http://localhost:15672`

Apply migrations to the Docker database from the backend folder:

```powershell
$env:DATABASE_URL="postgresql://postgres:postgres@127.0.0.1:5433/mini_shop_db"
npx prisma migrate deploy
```

Seed initial products and product images:

```powershell
$env:DATABASE_URL="postgresql://postgres:postgres@127.0.0.1:5433/mini_shop_db"
npm run seed:products
```

Start frontend locally:

```bash
cd mini_shop_frontend
npm run dev
```

## Useful Commands

Backend:

```bash
cd mini_shop_backend_nest
npm run build
npx tsc --noEmit
npm run lint
npm run test
npm run test:e2e
```

Frontend:

```bash
cd mini_shop_frontend
npm run build
npm run lint
```

Docker:

```bash
docker compose ps
docker compose logs backend
docker compose down
```

## Scraper Flow

The scraper is started from the admin panel or through `POST /scraper/jobs`.

High-level flow:

1. The admin creates a scraper job with source website, source base URL, internal target category, search query, and limit.
2. The backend creates a job record in PostgreSQL.
3. The job is published to RabbitMQ.
4. The scraper consumer processes the job in the background.
5. The scraper discovers search result pages from the source website.
6. Product links are extracted through the scraper pipeline.
7. Parsed products are normalized into the internal product model.
8. Products are imported into the admin-selected internal category.
9. Product images are downloaded, validated, uploaded to storage, and attached to products.
10. The job status is updated as completed or failed.

This keeps long-running scraping work outside the normal HTTP request lifecycle.

The scraper does not use saved source profiles. The current flow relies on a source URL and a search query provided by the admin, then applies the generic discovery/extraction pipeline.

## Image Flow

Images are not stored directly in PostgreSQL. The database stores image metadata and storage keys, while the image bytes are stored in S3-compatible object storage.

Main operations:

- Upload product image.
- Read image metadata with Sharp.
- Save metadata in `ProductImage`.
- Mark one image as primary.
- Scale images dynamically through `/images/:imageId/:width/:height` or `/images/:imageId/:size`.

## Testing Status

The backend includes:

- Unit tests for AuthService.
- Unit tests for ProductsService.
- Unit tests for OrdersService.
- E2E tests for authentication flow.

Recommended verification before presentation:

```bash
cd mini_shop_backend_nest
npm run build
npx tsc --noEmit
npm run test
npm run test:e2e
```

## Deployment

Frontend is deployed on Vercel:

```text
https://test-react-online-shop-repo.vercel.app
```

Backend is deployed on Render:

```text
https://mini-shop-backend-wxq7.onrender.com
```

The frontend proxies `/api/*` requests to the Render backend.

Production backend requires:

- PostgreSQL database.
- RabbitMQ service.
- S3-compatible object storage.
- Valid environment variables configured on Render.
