# Pasal

Online store for **New Shrestha Bhada Pasal**, a utensils shop in Biratnagar, Nepal. Customers browse, add to cart and order (cash on delivery). The owner manages products and orders from an admin panel and gets an email for every new order.

## Stack

- **Frontend:** React 19, Vite, Tailwind, React Query (`frontend/`)
- **Backend:** Spring Boot 3.5, Java 21, Spring Security + JWT (`backend/pasal-backend/`)
- **Database:** PostgreSQL 16

## Features

- Product search, filters, sorting, reviews and wishlist
- Cart, saved addresses, checkout and order tracking
- Admin panel for orders, products, categories and users
- Email alert to the owner on each new order (Gmail)

## Run locally

**1. Configure.** In `backend/pasal-backend/`, copy `.env.example` to `.env` and fill it in:

| Variable | What it is |
|---|---|
| `DB_PASSWORD` | Postgres password |
| `JWT_SECRET` | 32+ random characters (`openssl rand -base64 48`) |
| `ADMIN_EMAIL`, `ADMIN_PASSWORD` | Admin login, created on first start |
| `CORS_ALLOWED_ORIGINS` | Allowed browser origins |
| `MAIL_USERNAME`, `MAIL_PASSWORD` | Gmail address and a Gmail **app password** (optional) |
| `OWNER_EMAIL` | Where alerts go (defaults to `MAIL_USERNAME`) |

**2. Start the backend.**

```bash
cd backend/pasal-backend
docker compose up -d postgres
set -a; source .env; set +a
bash ./mvnw spring-boot:run        # http://localhost:8080
```

**3. Start the frontend.**

```bash
cd frontend
npm install
npm run dev                        # http://localhost:5173
```

Vite proxies `/api` to the backend. Log in at `/login`; admins reach the panel at `/admin`.

## Run everything in Docker

```bash
cd backend/pasal-backend
docker compose --profile app up -d --build
```

The frontend has its own `Dockerfile.prod` with an nginx config that proxies `/api` to the `backend` service.

## Handy

- API docs: http://localhost:8080/swagger-ui.html
- Database shell: `docker exec -it pasal-postgres psql -U pasal -d pasal`
- Tests: `cd backend/pasal-backend && bash ./mvnw test`
- Never commit `.env`; it is git-ignored.
