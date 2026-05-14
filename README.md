# TechFlow Mini Shop

Mini online shop built as a fullstack learning project. The frontend is a React + Vite app, and the current backend is a NestJS REST API connected to PostgreSQL through Prisma.

## Features

- Product catalog loaded from the backend API
- Product categories, search, sorting, and pagination handled by the backend
- Cart with add, remove, quantity update, and checkout simulation
- Login/register page
- Backend CRUD endpoints for products
- Separate categories module with Prisma relation between products and categories
- PostgreSQL database with Prisma migrations and seed data
- Local PostgreSQL setup through Docker Compose

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
- Docker Compose for local database setup

Other tools:
- dotenv for environment variables
- ESLint for code quality checks

## Project Structure

```text
fullstack_mini_shop_project
+-- docker-compose.yml
+-- mini-shop-backend-Express-old
+-- mini_shop_backend_nest
L-- mini_shop_frontend
```

## Local Database With Docker

Start PostgreSQL locally:

```bash
docker compose up -d
```

Check that the container is running:

```bash
docker compose ps
```

Stop the database:

```bash
docker compose down
```

The local PostgreSQL connection string is:

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/mini_shop_db"
```

## Backend Setup

Go to the backend folder:

```bash
cd mini_shop_backend_nest
```

Install dependencies:

```bash
npm install
```

Create a `.env` file:

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/mini_shop_db"
```

Run database migrations:

```bash
npm run db:migrate
```

Seed products:

```bash
npm run seed:products
```

Start backend in development mode:

```bash
npm run start:dev
```

Build backend:

```bash
npm run build
```

## Frontend Setup

Go to the frontend folder:

```bash
cd mini_shop_frontend
```

Install dependencies:

```bash
npm install
```

Start frontend in development mode:

```bash
npm run dev
```

Build frontend:

```bash
npm run build
```

## Healthcheck

The backend exposes one healthcheck endpoint:

```text
GET /health
```

Successful response:

```json
{
  "api": {
    "status": "up"
  },
  "database": {
    "status": "up"
  }
}
```

If the database is unavailable, the API still responds, but the database status becomes `down`.

## Product API

```text
GET    /products
GET    /products/:id
POST   /products
PUT    /products/:id
DELETE /products/:id
GET    /categories
```

Create and update requests are validated with NestJS DTOs before data reaches the service and database.

## DummyJSON Usage

Products are loaded from the custom backend and PostgreSQL database.

DummyJSON is still used only for the login flow:

```text
https://dummyjson.com/auth/login
```

Authentication is not yet implemented in the custom backend.

## Deployment

Frontend:

```text
https://test-react-online-shop-repo.vercel.app
```

Backend:

```text
https://mini-shop-backend-wxq7.onrender.com
```

Vercel proxies frontend `/api/*` requests to the Render backend to avoid browser CORS issues.

