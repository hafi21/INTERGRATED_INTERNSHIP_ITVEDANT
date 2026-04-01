# Aureon Store

Aureon Store is a full-stack e-commerce web application with a React storefront, Express API, Prisma ORM, and MySQL database. It includes customer shopping flows, admin category management, cart, orders, and mock payment handling.

## Tech Stack

- Frontend: React, Vite, TypeScript, Tailwind CSS, Framer Motion, React Query
- Backend: Node.js, Express, TypeScript, Prisma ORM, JWT, bcrypt
- Database: MySQL
- Hosting-ready config: Vercel frontend, Render backend, Railway MySQL
- CI: GitHub Actions

## Main Features

- User registration and login
- Product listing and product detail pages
- Category-based browsing
- Admin category dashboard with create, update, and soft delete
- Cart management
- Order placement
- Razorpay test payment flow
- Responsive e-commerce UI with online product images

## Project Structure

```text
.
|-- frontend/
|   |-- src/
|   |   |-- components/
|   |   |-- hooks/
|   |   |-- pages/
|   |   |-- services/
|   |   `-- assets/
|-- backend/
|   |-- prisma/
|   |-- src/
|   |   |-- config/
|   |   |-- controllers/
|   |   |-- middleware/
|   |   |-- models/
|   |   `-- routes/
|-- docs/
`-- .github/workflows/
```

## Environment Files

Frontend example:
- [frontend/.env.example](/c:/Users/HAFIQ/Desktop/INTERGRATED_INTERNSHIP/frontend/.env.example)

Backend example:
- [backend/.env.example](/c:/Users/HAFIQ/Desktop/INTERGRATED_INTERNSHIP/backend/.env.example)

## Run Locally

### 1. Install dependencies

```powershell
npm.cmd install
```

### 2. Create env files

```powershell
Copy-Item backend\.env.example backend\.env
Copy-Item frontend\.env.example frontend\.env
```

Required backend payment env values:

```env
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret
```

### 3. Generate Prisma client

```powershell
npm.cmd run db:generate
```

### 4. If you need to sync database schema

```powershell
npx.cmd prisma db push --schema backend/prisma/schema.prisma
```

### 5. If you need demo data

```powershell
npm.cmd run db:seed
```

### 6. Start the app

```powershell
npm.cmd run dev
```

Open:
- Frontend: `http://localhost:5173`
- Backend health: `http://localhost:4000/api/health`

## Current Database Setup

The app is currently configured to use Railway MySQL through the backend env file. If you want to change databases later, update `DATABASE_URL` in [backend/.env](/c:/Users/HAFIQ/Desktop/INTERGRATED_INTERNSHIP/backend/.env).

## Demo Accounts

- Admin: `admin@aureon.com` / `Admin@123`
- Customer: `customer@aureon.com` / `Customer@123`

## API Routes

- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/me`
- `GET /api/categories`
- `POST /api/categories`
- `PUT /api/categories/:id`
- `DELETE /api/categories/:id`
- `GET /api/products`
- `GET /api/products/:id`
- `GET /api/cart`
- `POST /api/cart`
- `PATCH /api/cart/:id`
- `DELETE /api/cart/:id`
- `GET /api/orders`
- `POST /api/orders`
- `POST /api/payments/razorpay/order`
- `POST /api/payments/razorpay/verify`

## Deployment Files

- Frontend config: [frontend/vercel.json](/c:/Users/HAFIQ/Desktop/INTERGRATED_INTERNSHIP/frontend/vercel.json)
- Backend config: [render.yaml](/c:/Users/HAFIQ/Desktop/INTERGRATED_INTERNSHIP/render.yaml)
- CI workflow: [.github/workflows/ci.yml](/c:/Users/HAFIQ/Desktop/INTERGRATED_INTERNSHIP/.github/workflows/ci.yml)

## Documentation

- [Module 1 Category Management](/c:/Users/HAFIQ/Desktop/INTERGRATED_INTERNSHIP/docs/module-1-category-management.md)
- [Module 2 Auth and Catalog](/c:/Users/HAFIQ/Desktop/INTERGRATED_INTERNSHIP/docs/module-2-auth-and-catalog.md)
- [Module 3 Cart, Orders, Payments](/c:/Users/HAFIQ/Desktop/INTERGRATED_INTERNSHIP/docs/module-3-cart-orders-payments.md)
- [Database Schema SQL](/c:/Users/HAFIQ/Desktop/INTERGRATED_INTERNSHIP/docs/database-schema.sql)
