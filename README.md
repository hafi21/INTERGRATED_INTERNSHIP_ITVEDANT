# Aureon Store

Aureon Store is a full-stack e-commerce web application built as an internship-style production project. It includes a premium React storefront, a modular Express API, a normalized MySQL database with Prisma ORM, admin category management, customer cart and order flows, and Razorpay test payment integration.

The project was designed to satisfy the original evaluation goals:
- clean e-commerce UI/UX
- modular frontend and backend architecture
- proper database design
- authentication and secure API access
- category-first product organization
- deployment-ready configuration for Vercel, Render, and Railway

## Table of Contents

- [Project Overview](#project-overview)
- [What the Application Includes](#what-the-application-includes)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Frontend Implementation](#frontend-implementation)
- [Backend Implementation](#backend-implementation)
- [Database Design](#database-design)
- [Authentication and Security](#authentication-and-security)
- [Payments](#payments)
- [Project Structure](#project-structure)
- [API Summary](#api-summary)
- [Environment Variables](#environment-variables)
- [Local Development Setup](#local-development-setup)
- [Seeded Demo Data](#seeded-demo-data)
- [Testing and Verification](#testing-and-verification)
- [Deployment Preparation](#deployment-preparation)
- [Render Backend Deployment](#render-backend-deployment)
- [Vercel Frontend Deployment](#vercel-frontend-deployment)
- [Documentation Files](#documentation-files)
- [Current Status](#current-status)

## Project Overview

This application is an online store for browsing and buying tech, office, and desk-setup products. The system supports:

- customer registration and login
- product browsing and product details
- category-based filtering
- cart management
- order creation
- Razorpay test checkout
- order cancellation for pending unpaid orders
- admin category management with soft delete

The application uses a React SPA frontend and a REST API backend. The frontend consumes the backend through Axios and React Query. The backend uses Express with Prisma against a MySQL database.

## What the Application Includes

### Customer Features

- home page with premium hero section, category highlights, and featured products
- login and registration flows
- product listing page with search and category filter
- product details page
- cart page with quantity updates and checkout
- orders page with:
  - pending order listing
  - Razorpay payment initiation
  - payment verification
  - order cancellation for eligible orders

### Admin Features

- admin-only category dashboard
- create category
- update category
- soft delete category using `status`
- product count per category
- confirmation modal before deactivation

### UX and UI Features

- red and white e-commerce theme
- rounded cards and soft glassmorphism panels
- Framer Motion transitions and content reveals
- lazy-loaded route pages
- loading states and skeletons
- toast notifications
- mobile-friendly layout

## Tech Stack

### Frontend

- React 18
- Vite
- TypeScript
- Tailwind CSS
- Framer Motion
- TanStack React Query
- React Router
- React Hook Form
- Zod
- Axios
- React Hot Toast

### Backend

- Node.js
- Express
- TypeScript
- Prisma ORM
- MySQL
- JWT authentication
- bcrypt password hashing
- Zod request validation
- Razorpay Node SDK

### DevOps and Tooling

- Railway MySQL
- Render backend deployment config
- Vercel frontend deployment config
- GitHub Actions CI

## Architecture

The project is organized as a workspace-based full-stack repository:

- `frontend/` contains the Vite React application
- `backend/` contains the Express API and Prisma schema
- `docs/` contains module-level writeups and schema notes
- `.github/workflows/` contains CI
- `render.yaml` contains the Render backend service blueprint

The application flow is:

1. The user interacts with the React UI.
2. Frontend services call the backend REST API.
3. The backend validates requests with Zod.
4. Prisma reads and writes data in MySQL.
5. The frontend updates UI state with React Query.

## Frontend Implementation

The frontend entry point is [App.tsx](/c:/Users/HAFIQ/Desktop/INTERGRATED_INTERNSHIP/frontend/src/App.tsx). It defines the route structure and wraps the page transitions in Framer Motion.

Implemented pages:

- [home-page.tsx](/c:/Users/HAFIQ/Desktop/INTERGRATED_INTERNSHIP/frontend/src/pages/home-page.tsx)
- [login-page.tsx](/c:/Users/HAFIQ/Desktop/INTERGRATED_INTERNSHIP/frontend/src/pages/login-page.tsx)
- [register-page.tsx](/c:/Users/HAFIQ/Desktop/INTERGRATED_INTERNSHIP/frontend/src/pages/register-page.tsx)
- [products-page.tsx](/c:/Users/HAFIQ/Desktop/INTERGRATED_INTERNSHIP/frontend/src/pages/products-page.tsx)
- [product-details-page.tsx](/c:/Users/HAFIQ/Desktop/INTERGRATED_INTERNSHIP/frontend/src/pages/product-details-page.tsx)
- [cart-page.tsx](/c:/Users/HAFIQ/Desktop/INTERGRATED_INTERNSHIP/frontend/src/pages/cart-page.tsx)
- [orders-page.tsx](/c:/Users/HAFIQ/Desktop/INTERGRATED_INTERNSHIP/frontend/src/pages/orders-page.tsx)
- [admin-categories-page.tsx](/c:/Users/HAFIQ/Desktop/INTERGRATED_INTERNSHIP/frontend/src/pages/admin-categories-page.tsx)

Key frontend implementation details:

- React Query is used for API state and query invalidation.
- Axios is configured in [api.ts](/c:/Users/HAFIQ/Desktop/INTERGRATED_INTERNSHIP/frontend/src/services/api.ts) and automatically attaches the JWT token from local storage.
- Auth state is managed in [auth-provider.tsx](/c:/Users/HAFIQ/Desktop/INTERGRATED_INTERNSHIP/frontend/src/hooks/auth-provider.tsx).
- Protected routes are enforced for cart, orders, and admin category pages.
- Shared components are reused across cards, buttons, empty states, section headings, and confirmation modals.
- Dropdown UI was standardized through a shared `form-select` style in [index.css](/c:/Users/HAFIQ/Desktop/INTERGRATED_INTERNSHIP/frontend/src/index.css).

## Backend Implementation

The backend entry point is [app.ts](/c:/Users/HAFIQ/Desktop/INTERGRATED_INTERNSHIP/backend/src/app.ts), and the server boot logic is in [server.ts](/c:/Users/HAFIQ/Desktop/INTERGRATED_INTERNSHIP/backend/src/server.ts).

Implemented backend modules:

- authentication
- categories
- products
- cart
- orders
- payments

Registered API route files:

- [auth.routes.ts](/c:/Users/HAFIQ/Desktop/INTERGRATED_INTERNSHIP/backend/src/routes/auth.routes.ts)
- [category.routes.ts](/c:/Users/HAFIQ/Desktop/INTERGRATED_INTERNSHIP/backend/src/routes/category.routes.ts)
- [product.routes.ts](/c:/Users/HAFIQ/Desktop/INTERGRATED_INTERNSHIP/backend/src/routes/product.routes.ts)
- [cart.routes.ts](/c:/Users/HAFIQ/Desktop/INTERGRATED_INTERNSHIP/backend/src/routes/cart.routes.ts)
- [order.routes.ts](/c:/Users/HAFIQ/Desktop/INTERGRATED_INTERNSHIP/backend/src/routes/order.routes.ts)
- [payment.routes.ts](/c:/Users/HAFIQ/Desktop/INTERGRATED_INTERNSHIP/backend/src/routes/payment.routes.ts)

Important implementation decisions:

- Requests are validated with Zod before reaching business logic.
- JWT authentication protects cart, order, payment, and admin actions.
- Admin-only middleware protects category management APIs.
- Orders use Prisma transaction steps to keep inventory and cart updates consistent.
- Cancel order restores stock and blocks cancellation for paid or fulfilled orders.
- Razorpay payment verification updates both `payments` and `orders` together in one transaction.

## Database Design

The schema is defined in [schema.prisma](/c:/Users/HAFIQ/Desktop/INTERGRATED_INTERNSHIP/backend/prisma/schema.prisma).

Main tables:

- `users`
- `categories`
- `products`
- `cart_items`
- `orders`
- `order_items`
- `payments`
- `wishlist`

Main relationships:

- one user to many orders
- one category to many products
- one user to many cart items
- one order to many order items
- one order to one payment
- one user to many wishlist items

Database choices implemented:

- normalization through separate order and order item tables
- foreign keys through Prisma relations
- enum-based order and payment state
- indexes on category status, product status, order user, and related foreign keys
- soft delete for categories through boolean `status`

The mandatory first module, category management, is fully backed by the `categories` model:

- `category_id`
- `category_name`
- `description`
- `created_at`
- `updated_at`
- `status`

## Authentication and Security

Authentication and security are handled through:

- bcrypt password hashing
- JWT token signing
- request validation with Zod
- route protection with auth middleware
- admin guard middleware
- CORS restricted through `CLIENT_URL`
- Helmet for security headers

Files involved:

- [auth.controller.ts](/c:/Users/HAFIQ/Desktop/INTERGRATED_INTERNSHIP/backend/src/controllers/auth.controller.ts)
- [authenticate.ts](/c:/Users/HAFIQ/Desktop/INTERGRATED_INTERNSHIP/backend/src/middleware/authenticate.ts)
- [require-admin.ts](/c:/Users/HAFIQ/Desktop/INTERGRATED_INTERNSHIP/backend/src/middleware/require-admin.ts)
- [env.ts](/c:/Users/HAFIQ/Desktop/INTERGRATED_INTERNSHIP/backend/src/config/env.ts)

## Payments

The application uses Razorpay test checkout, not mock-only checkout.

Implemented payment flow:

1. Customer places an order from the cart page.
2. Order is created with `PENDING` status.
3. Orders page requests a Razorpay order from the backend.
4. Frontend opens Razorpay Checkout.
5. Backend verifies the payment signature.
6. Order is marked `PAID` and payment is recorded.

Payment implementation files:

- [payment.controller.ts](/c:/Users/HAFIQ/Desktop/INTERGRATED_INTERNSHIP/backend/src/controllers/payment.controller.ts)
- [razorpay.service.ts](/c:/Users/HAFIQ/Desktop/INTERGRATED_INTERNSHIP/backend/src/services/razorpay.service.ts)
- [razorpay.ts](/c:/Users/HAFIQ/Desktop/INTERGRATED_INTERNSHIP/frontend/src/lib/razorpay.ts)

## Project Structure

```text
.
|-- frontend/
|   |-- src/
|   |   |-- components/
|   |   |-- hooks/
|   |   |-- lib/
|   |   |-- pages/
|   |   |-- services/
|   |   `-- types/
|   |-- index.html
|   `-- vercel.json
|-- backend/
|   |-- prisma/
|   |   |-- migrations/
|   |   |-- schema.prisma
|   |   `-- seed.ts
|   |-- src/
|   |   |-- config/
|   |   |-- controllers/
|   |   |-- middleware/
|   |   |-- models/
|   |   |-- routes/
|   |   |-- services/
|   |   `-- validators/
|   `-- package.json
|-- docs/
|-- .github/workflows/ci.yml
|-- package.json
`-- render.yaml
```

## API Summary

### Auth

- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/me`

### Categories

- `GET /api/categories`
- `POST /api/categories`
- `PUT /api/categories/:id`
- `DELETE /api/categories/:id`

### Products

- `GET /api/products`
- `GET /api/products/:id`
- `POST /api/products`
- `PUT /api/products/:id`
- `DELETE /api/products/:id`

### Cart

- `GET /api/cart`
- `POST /api/cart`
- `PATCH /api/cart/:id`
- `DELETE /api/cart/:id`
- `DELETE /api/cart`

### Orders

- `GET /api/orders`
- `POST /api/orders`
- `PATCH /api/orders/:id/cancel`

### Payments

- `POST /api/payments/razorpay/order`
- `POST /api/payments/razorpay/verify`

## Environment Variables

### Frontend

File: [frontend/.env.example](/c:/Users/HAFIQ/Desktop/INTERGRATED_INTERNSHIP/frontend/.env.example)

```env
VITE_API_URL=http://localhost:4000
```

For production, `VITE_API_URL` should point to the deployed backend origin, for example:

```env
VITE_API_URL=https://your-render-service.onrender.com
```

### Backend

File: [backend/.env.example](/c:/Users/HAFIQ/Desktop/INTERGRATED_INTERNSHIP/backend/.env.example)

```env
PORT=4000
DATABASE_URL=mysql://root:your_mysql_password@interchange.proxy.rlwy.net:17188/railway
JWT_SECRET=change-this-to-a-strong-secret-key
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:5173
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret
```

## Local Development Setup

### 1. Install dependencies

```powershell
npm.cmd install
```

### 2. Create environment files

```powershell
Copy-Item backend\.env.example backend\.env
Copy-Item frontend\.env.example frontend\.env
```

### 3. Update env values

- set your database connection in `backend/.env`
- set your JWT secret
- set Razorpay test keys
- make sure frontend `VITE_API_URL` matches the backend origin

### 4. Generate Prisma client

```powershell
npm.cmd run db:generate
```

### 5. Push schema if needed

```powershell
npx.cmd prisma db push --schema backend/prisma/schema.prisma
```

### 6. Seed demo data

```powershell
npm.cmd run db:seed
```

### 7. Run the application

```powershell
npm.cmd run dev
```

Local URLs:

- frontend: `http://localhost:5173`
- backend health: `http://localhost:4000/api/health`

## Seeded Demo Data

The seed script lives in [seed.ts](/c:/Users/HAFIQ/Desktop/INTERGRATED_INTERNSHIP/backend/prisma/seed.ts).

It currently seeds:

- 3 product categories
- 60 products with online image URLs
- 1 admin user
- 1 customer user

Demo accounts:

- admin: `admin@aureon.com` / `Admin@123`
- customer: `customer@aureon.com` / `Customer@123`

## Testing and Verification

Verification completed so far:

- `npm.cmd run lint`
- `npm.cmd run build`
- backend health check
- customer login flow
- admin login flow
- product list and product detail fetch
- cart add flow
- order creation flow
- Razorpay order creation flow
- order cancellation flow
- category listing flow
- product and page image URL reachability checks

CI pipeline:

- GitHub Actions config is in [.github/workflows/ci.yml](/c:/Users/HAFIQ/Desktop/INTERGRATED_INTERNSHIP/.github/workflows/ci.yml)
- it installs dependencies, generates Prisma client, and builds both workspaces

## Deployment Preparation

Before deploying:

1. Make sure `.env` files are not committed.
2. Rotate any secret that was exposed during development or testing.
3. Confirm `CLIENT_URL` matches the final Vercel frontend URL.
4. Confirm `VITE_API_URL` matches the final Render backend URL.
5. Make sure Railway MySQL public URL is working.
6. Run:

```powershell
npm.cmd run lint
npm.cmd run build
```

7. Push the latest code to GitHub.

## Render Backend Deployment

Backend deployment file:

- [render.yaml](/c:/Users/HAFIQ/Desktop/INTERGRATED_INTERNSHIP/render.yaml)

Current Render service config includes:

- Node runtime
- root repo build
- backend workspace build
- backend workspace start command
- health check path at `/api/health`
- secret-safe environment placeholders

### Render environment variables to set in dashboard

- `CLIENT_URL`
- `DATABASE_URL`
- `JWT_SECRET`
- `JWT_EXPIRES_IN`
- `RAZORPAY_KEY_ID`
- `RAZORPAY_KEY_SECRET`

### Render deployment flow

1. Push the repository to GitHub.
2. In Render, create a new `Blueprint` or `Web Service`.
3. Connect the GitHub repository.
4. Let Render use [render.yaml](/c:/Users/HAFIQ/Desktop/INTERGRATED_INTERNSHIP/render.yaml).
5. Enter the required environment variables.
6. Deploy.
7. Test:

```text
https://your-render-service.onrender.com/api/health
```

## Vercel Frontend Deployment

Frontend deployment file:

- [frontend/vercel.json](/c:/Users/HAFIQ/Desktop/INTERGRATED_INTERNSHIP/frontend/vercel.json)

### Vercel environment variable

```env
VITE_API_URL=https://your-render-service.onrender.com
```

### Vercel deployment flow

1. Import the repository into Vercel.
2. Set root directory to `frontend` if needed.
3. Add `VITE_API_URL`.
4. Deploy.
5. Copy the final frontend URL.
6. Update Render `CLIENT_URL` to that Vercel URL.
7. Redeploy backend if needed.

## Documentation Files

Additional project documentation:

- [Module 1 Category Management](/c:/Users/HAFIQ/Desktop/INTERGRATED_INTERNSHIP/docs/module-1-category-management.md)
- [Module 2 Auth and Catalog](/c:/Users/HAFIQ/Desktop/INTERGRATED_INTERNSHIP/docs/module-2-auth-and-catalog.md)
- [Module 3 Cart, Orders, Payments](/c:/Users/HAFIQ/Desktop/INTERGRATED_INTERNSHIP/docs/module-3-cart-orders-payments.md)
- [Database Schema SQL](/c:/Users/HAFIQ/Desktop/INTERGRATED_INTERNSHIP/docs/database-schema.sql)

## Current Status

The project is currently in a strong pre-deployment state:

- major customer and admin flows are implemented
- Razorpay test checkout is integrated
- category module is complete
- image URL issues found during verification were fixed
- Render backend config is prepared
- Vercel frontend config is prepared

Pending release tasks outside code:

- deploy backend to Render
- deploy frontend to Vercel
- wire production environment variables
- rotate any exposed test secrets before final release
