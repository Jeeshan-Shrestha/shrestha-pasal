# Deploying New Shrestha Bhada Pasal (free tier)

```
Browser ──► Vercel (React site) ──/api rewrite──► Render (Spring Boot, Docker) ──► Neon (Postgres)
                                                          └──► Brevo (order emails over HTTPS)
```

Do the steps in this order, because each one gives you a value the next step needs.
Keep a scratch note of: Neon details, Brevo key, Render URL, Vercel URL.

## 1. Database: Neon (free Postgres)

1. Sign up at neon.com, create a project (pick the region closest to your Render region).
2. From the connection details note: **host**, **database**, **user**, **password**.
3. Build the JDBC URL (host only, no user or password inside):
   `DB_URL = jdbc:postgresql://<host>/<database>?sslmode=require`

Tables are created automatically on first start.

## 2. Order emails: Brevo

Render's free tier **blocks SMTP**, so Gmail SMTP cannot work there. The app uses Brevo's HTTPS API instead.

1. Sign up at brevo.com (free plan: 300 emails a day).
2. *Senders, Domains & Dedicated IPs → Senders → Add a sender*: use an email you own (for example your Gmail). Click the verification link they email you.
3. *SMTP & API → API keys → Generate*. Copy the key.
   - `BREVO_API_KEY` = that key
   - `MAIL_FROM` = the verified sender address
   - `OWNER_EMAIL` = where you want new-order and cancellation alerts

## 3. Backend: Render

1. Push the repo to GitHub (it already is: `Jeeshan-Shrestha/shrestha-pasal`).
2. render.com → *New → Blueprint* → pick the repo. Render reads `render.yaml` at the repo root.
3. Fill in the values it asks for:

| Variable | Value |
|---|---|
| `DB_URL` | from step 1 |
| `DB_USERNAME` / `DB_PASSWORD` | Neon user and password |
| `ADMIN_EMAIL` | your admin login email |
| `ADMIN_PASSWORD` | a strong password (**only used the first time**; changing it later does not change the existing admin) |
| `CORS_ALLOWED_ORIGINS` | your Vercel URL, set after step 4 (use `https://example.com` for now) |
| `BREVO_API_KEY`, `MAIL_FROM`, `OWNER_EMAIL` | from step 2 |

`JWT_SECRET` is generated for you. `SPRING_PROFILES_ACTIVE=prod` is already set.

4. Wait for the deploy, then open `https://<your-service>.onrender.com/api/categories`. You should see the starter categories as JSON. Note this URL.

## 4. Frontend: Vercel

1. In `frontend/vercel.json`, replace `REPLACE-WITH-YOUR-RENDER-SERVICE.onrender.com` with your Render host, then commit and push.
2. vercel.com → *Add New → Project* → import the repo → **Root Directory: `frontend`** (framework: Vite, defaults are fine) → Deploy.
3. Copy the Vercel URL (for example `https://pasal.vercel.app`).
4. Back on Render, set `CORS_ALLOWED_ORIGINS` to that exact URL (no trailing slash) and let it redeploy.

Step 4 matters: Vercel forwards the browser's `Origin` header, and the backend rejects origins it does not know.

## 5. Check it works

- Open the Vercel URL, register, add to cart, place an order. The customer and `OWNER_EMAIL` should each get an email, and cancelling the order sends two more.
- Log in as the admin, add real products and photos (image URLs), set stock.
- If no emails arrive, open Render → *Logs* and look for `Order emails ON via Brevo API` at startup and `Order email sent to …` or `failed (…)` after an order. The usual cause is an unverified `MAIL_FROM`.

## Free-tier things to know

- **Render sleeps after ~15 minutes idle.** The next visitor waits about a minute. A free uptime pinger (for example UptimeRobot hitting `/api/categories` every 5 minutes) keeps it awake.
- **Neon also pauses when idle** and wakes in about a second.
- **Images:** the shop stores image URLs only. Host photos elsewhere (for example Cloudinary or Imgur) and paste the link.
- **Not production-grade yet:** database tables are managed by Hibernate `update` (move to Flyway before the data matters), there is no login rate limiting, and the only password reset is contacting the shop.
