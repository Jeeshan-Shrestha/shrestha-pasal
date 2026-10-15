# New Shrestha Bhada Pasal: backend

Spring Boot 3 / Java 21 / PostgreSQL REST API for an online utensils shop. Payment is cash on delivery.

## Run locally

```bash
docker compose up -d postgres
export JAVA_HOME=/usr/lib/jvm/java-21-temurin-jdk   # Maven needs a full JDK 21
mvn spring-boot:run
```

- Swagger UI: http://localhost:8080/swagger-ui.html (use **Authorize** with the login token)
- The `dev` profile is the default. It seeds an admin account `admin@pasal.local` / `admin12345` and 8 starter categories.
- Tests (need Docker, they start a throwaway Postgres): `mvn test`

## Run the whole stack in Docker

```bash
cp .env.example .env     # fill in DB_PASSWORD, JWT_SECRET (32+ chars), ADMIN_PASSWORD
docker compose --profile app up -d --build
```

The `prod` profile has **no** default secrets: it will not start without `JWT_SECRET`, `DB_*` and `ADMIN_PASSWORD`.

## API overview

Send `Authorization: Bearer <token>` (from register/login). Lists are paginated with `?page=0&size=20&sort=field,asc`.

| Area | Endpoints | Access |
|---|---|---|
| Auth | `POST /api/auth/register`, `POST /api/auth/login` | public |
| Profile | `GET/PUT /api/users/me`, `PUT /api/users/me/password` | customer |
| Browse | `GET /api/products` (`q, categoryId, material, brand, minPrice, maxPrice, inStockOnly, sort`), `GET /api/products/{id}`, `GET /api/categories` | public |
| Utensil CRUD | `POST /api/products`, `PUT/DELETE /api/products/{id}`, `PATCH /api/admin/products/{id}/stock`, `GET /api/admin/products` (includes inactive) | admin |
| Categories | `POST /api/categories`, `PUT/DELETE /api/categories/{id}` | admin |
| Addresses | `GET/POST /api/addresses`, `PUT/DELETE /api/addresses/{id}` | customer |
| Cart | `GET /api/cart`, `POST /api/cart/items`, `PUT/DELETE /api/cart/items/{productId}`, `DELETE /api/cart` | customer |
| Orders | `POST /api/orders` (checkout, COD), `GET /api/orders`, `GET /api/orders/{id}`, `POST /api/orders/{id}/cancel` | customer |
| Wishlist | `GET /api/wishlist`, `PUT/DELETE /api/wishlist/{productId}` | customer |
| Reviews | `GET /api/products/{id}/reviews` (public), `POST /api/products/{id}/reviews`, `PUT/DELETE /api/reviews/{id}` | customer (after delivery) |
| Admin | `GET /api/admin/orders?status=`, `GET /api/admin/orders/{id}`, `PATCH /api/admin/orders/{id}/status`, `GET /api/admin/users`, `PATCH /api/admin/users/{id}/enabled?value=` | admin |

### Business rules

- Delivery fee is NPR 100, free for subtotals of NPR 3000 or more (`DELIVERY_FEE`, `FREE_DELIVERY_THRESHOLD`).
- Checkout locks the products, checks stock, snapshots names and prices into the order, decrements stock and empties the cart in one transaction.
- Order flow: `PLACED → CONFIRMED → SHIPPED → DELIVERED`. `CANCELLED` is allowed before `DELIVERED`, and cancelling restores stock. Customers can cancel only while `PLACED` or `CONFIRMED`. `DELIVERED` marks the cash payment `PAID`.
- `DELETE /api/products/{id}` is a soft delete (the product is hidden but stays in past orders).
- Only customers with a delivered order containing the product can review it, once per product.
- Registration always creates a `CUSTOMER`. Admins come from the seeded account.

## Notes for later

- The schema is managed by Hibernate `ddl-auto=update`. Switch to Flyway migrations before the data matters.
- `imageUrl` is a plain URL. File upload is not built yet.
- Login has no rate limiting yet.
