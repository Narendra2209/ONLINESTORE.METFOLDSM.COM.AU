# Metfold E-Commerce Platform

A production-grade B2B/B2C industrial e-commerce platform for **Metfold Sheet Metal** — an Australian sheet metal and roofing business. Built with Next.js, Express.js, MongoDB, and Stripe.

The core complexity is a **configurable product system** where one product (e.g., "5-Ribsheet") has dozens of purchasable combinations based on finish, colour, thickness, and length — each with dynamically calculated pricing.

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────┐
│                         CLIENT (Browser)                            │
└──────────────────────────────┬──────────────────────────────────────┘
                               │
                    ┌──────────▼──────────┐
                    │   FRONTEND (3000)    │
                    │   Next.js 14        │
                    │   App Router        │
                    │   Zustand State     │
                    │   Tailwind CSS      │
                    └──────────┬──────────┘
                               │ Axios (HTTP)
                    ┌──────────▼──────────┐
                    │   BACKEND (5000)    │
                    │   Express.js        │
                    │   REST API v1       │
                    │   JWT Auth          │
                    └──────────┬──────────┘
                               │ Mongoose
              ┌────────────────┼────────────────┐
    ┌─────────▼─────────┐     │     ┌──────────▼──────────┐
    │   MongoDB Atlas    │     │     │    Cloudinary CDN    │
    │   (Primary DB)     │     │     │    (Product Images)  │
    └────────────────────┘     │     └─────────────────────┘
                         ┌─────▼─────┐
                         │  Stripe   │
                         │ (Payments)│
                         └───────────┘
```

---

## Tech Stack

| Layer        | Technology                                       |
| ------------ | ------------------------------------------------ |
| Frontend     | Next.js 14 (App Router), React 18, TypeScript    |
| Styling      | Tailwind CSS (custom brand theme)                |
| State        | Zustand (auth, cart stores)                       |
| Backend      | Express.js, TypeScript, Node.js 20               |
| Database     | MongoDB Atlas, Mongoose ODM                       |
| Auth         | JWT (access + refresh tokens), bcrypt             |
| Payments     | Stripe (Payment Intents + Webhooks)              |
| Images       | Cloudinary CDN                                    |
| Email        | Nodemailer (SMTP)                                |
| Validation   | Zod (shared frontend/backend)                    |
| Imports      | ExcelJS (bulk product upload)                    |
| CI/CD        | GitHub Actions, Docker                            |

---

## Project Structure

```
claude-metfold-ecommerce/
├── backend/                          # Express.js REST API
│   ├── src/
│   │   ├── config/                   # Environment, DB connection, constants
│   │   │   ├── db.ts                 # Mongoose connection
│   │   │   ├── env.ts                # Zod-validated environment variables
│   │   │   └── constants.ts          # Enums, status codes
│   │   │
│   │   ├── models/                   # 19 Mongoose schemas
│   │   │   ├── User.ts              # Users with bcrypt password hashing
│   │   │   ├── Role.ts              # RBAC roles with permission matrix
│   │   │   ├── Product.ts           # Simple + configurable products
│   │   │   ├── ProductVariant.ts    # Variant combinations with attribute hash
│   │   │   ├── PricingRule.ts       # Dynamic pricing engine rules
│   │   │   ├── Category.ts          # Self-referencing category tree
│   │   │   ├── Attribute.ts         # Configurable dimensions (colour, thickness)
│   │   │   ├── Order.ts             # Order lifecycle with status workflow
│   │   │   ├── Cart.ts              # Session/user carts with TTL
│   │   │   ├── Address.ts           # Shipping/billing addresses
│   │   │   ├── Coupon.ts            # Discount coupons
│   │   │   ├── Wishlist.ts          # User wishlists
│   │   │   ├── Review.ts            # Product reviews with moderation
│   │   │   ├── Banner.ts            # CMS banners with scheduling
│   │   │   ├── Blog.ts              # Blog posts
│   │   │   ├── Page.ts              # Dynamic CMS pages
│   │   │   ├── Settings.ts          # Key-value site settings
│   │   │   ├── ImportJob.ts         # Bulk import tracking
│   │   │   └── AuditLog.ts          # Admin action audit trail
│   │   │
│   │   ├── services/                 # 12 business logic modules
│   │   │   ├── auth.service.ts       # Registration, login, token refresh
│   │   │   ├── product.service.ts    # Product CRUD, filtering, search
│   │   │   ├── pricing.service.ts    # ★ Core pricing engine
│   │   │   ├── category.service.ts   # Category tree management
│   │   │   ├── attribute.service.ts  # Attribute CRUD
│   │   │   ├── cart.service.ts       # Cart operations
│   │   │   ├── order.service.ts      # Order lifecycle
│   │   │   ├── cms.service.ts        # Banners, blog, pages, reviews
│   │   │   ├── email.service.ts      # Transactional email templates
│   │   │   ├── import.service.ts     # Excel parsing & bulk upsert
│   │   │   ├── report.service.ts     # MongoDB aggregation pipelines
│   │   │   └── admin-user.service.ts # Admin user & role management
│   │   │
│   │   ├── controllers/              # 9 request handlers
│   │   ├── routes/                   # 10 route definitions
│   │   ├── middlewares/              # Auth, RBAC, validation, error handling
│   │   ├── validators/               # Zod request schemas
│   │   ├── utils/                    # ApiError, ApiResponse, helpers, logger
│   │   ├── seeds/                    # Database initialisation data
│   │   ├── app.ts                    # Express setup
│   │   └── server.ts                 # Boot & listen
│   │
│   ├── Dockerfile
│   ├── package.json
│   └── tsconfig.json
│
├── frontend/                         # Next.js 14 App Router
│   ├── src/
│   │   ├── app/                      # 35 pages & layouts
│   │   │   ├── page.tsx              # Homepage
│   │   │   ├── layout.tsx            # Root layout (Header + Footer)
│   │   │   │
│   │   │   ├── (auth)/               # Auth route group
│   │   │   │   ├── login/page.tsx
│   │   │   │   └── register/page.tsx
│   │   │   │
│   │   │   ├── products/
│   │   │   │   ├── page.tsx          # Product listing with filters
│   │   │   │   └── [slug]/page.tsx   # Product detail + configurator
│   │   │   │
│   │   │   ├── categories/
│   │   │   │   └── [slug]/page.tsx   # Category page with products
│   │   │   │
│   │   │   ├── cart/page.tsx         # Shopping cart
│   │   │   ├── checkout/             # Checkout flow
│   │   │   ├── search/page.tsx       # Search results
│   │   │   ├── blog/                 # Blog listing & detail
│   │   │   ├── pages/[slug]/         # Dynamic CMS pages
│   │   │   │
│   │   │   ├── account/              # User account (protected)
│   │   │   │   ├── page.tsx          # Dashboard
│   │   │   │   ├── orders/           # Order history & detail
│   │   │   │   ├── addresses/        # Address management
│   │   │   │   ├── wishlist/         # Wishlist
│   │   │   │   ├── profile/          # Profile & password
│   │   │   │   └── quotes/           # Trade quotes
│   │   │   │
│   │   │   └── admin/                # Admin dashboard (protected)
│   │   │       ├── page.tsx          # Dashboard with stats
│   │   │       ├── layout.tsx        # Admin sidebar layout
│   │   │       ├── products/         # Product CRUD + pricing rules
│   │   │       ├── categories/       # Category tree management
│   │   │       ├── attributes/       # Attribute & colour management
│   │   │       ├── orders/           # Order management
│   │   │       ├── customers/        # Customer list
│   │   │       ├── users/            # Admin users & role permissions
│   │   │       ├── imports/          # Bulk Excel import
│   │   │       └── settings/         # Site configuration
│   │   │
│   │   ├── components/
│   │   │   ├── layout/               # Header, Footer
│   │   │   ├── product/              # ProductCard, ProductConfigurator
│   │   │   └── ui/                   # Button, Input, Modal, Badge, etc.
│   │   │
│   │   ├── store/                    # Zustand state
│   │   │   ├── authStore.ts          # Auth state + login/logout/fetchUser
│   │   │   └── cartStore.ts          # Cart state + localStorage persistence
│   │   │
│   │   ├── hooks/
│   │   │   └── useProductPrice.ts    # Debounced pricing API hook
│   │   │
│   │   ├── services/
│   │   │   └── product.service.ts    # Product & category API calls
│   │   │
│   │   ├── lib/
│   │   │   ├── axios.ts              # Configured client + token interceptors
│   │   │   └── utils.ts              # cn(), formatCurrency()
│   │   │
│   │   ├── types/                    # TypeScript interfaces
│   │   └── styles/globals.css        # Tailwind base styles
│   │
│   ├── public/images/                # Static assets (logo, navicon)
│   ├── Dockerfile
│   ├── next.config.js
│   ├── tailwind.config.ts
│   ├── package.json
│   └── tsconfig.json
│
├── docker-compose.yml                # MongoDB + Backend + Frontend
├── .github/workflows/ci.yml          # Build checks
└── .dockerignore
```

---

## Pricing Engine (Core Business Logic)

The pricing engine is the most architecturally critical component. It supports dynamic, rule-based pricing for configurable industrial products.

### How It Works

For a **per-metre** product like "5-Ribsheet" with selections (Colorbond, Monument, 0.48mm, 3.6m, qty 10):

```
Step 1: Start with baseRate                           $14.50/m
Step 2: Apply thickness modifier (0.48mm × 1.18)      $17.11/m
Step 3: Apply finish surcharge (if applicable)         $17.11/m
Step 4: Unit price = rate × length (× 3.6)            $61.60
Step 5: Apply quantity break (10 units → 3% off)       $59.75/ea
Step 6: Apply trade discount (if trade user → 10%)    $53.78/ea
Step 7: Line total = $53.78 × 10                       $537.75
```

### Pricing Models

| Model        | Description                                | Example               |
| ------------ | ------------------------------------------ | ---------------------- |
| `per_metre`  | Rate × length × quantity                   | Roof sheets, gutters   |
| `per_piece`  | Fixed rate per unit                        | Brackets, clips        |
| `per_sheet`  | Fixed rate per sheet                       | Flat panels            |
| `quote_only` | No online price, request quote             | Custom fabrication     |
| `fixed`      | Simple product with set price              | Screws, accessories    |

### Key Design Decision

Variants are **optional** for per-metre products (price is fully calculable from rules). This avoids combinatorial explosion — a product with 5 finishes × 22 colours × 2 thicknesses would need 220 variants, but pricing rules handle it with ~5 modifier entries.

---

## Colour System

The platform supports the full **Colorbond** colour range with finish-category filtering:

| Finish          | Colours                                     |
| --------------- | ------------------------------------------- |
| Colorbond       | 22 standard colours (Dover White → Monument) |
| Matt Colorbond  | Shared subset + dedicated matt variants      |
| Ultra           | Ultra Monument, Ultra Basalt                 |
| Galvanised      | Galvanised Steel                             |
| Zinc            | Natural Zinc                                 |

Colours are stored with hex codes and `finishCategories` metadata. When a customer selects a finish on the product page, only matching colours appear as swatches. Admins can add new colours via the Attributes page.

---

## API Endpoints

### Public

```
GET    /api/v1/health                    Health check
GET    /api/v1/categories                Category tree
GET    /api/v1/categories/:slug          Category detail + products
GET    /api/v1/products                  Product listing (filtered)
GET    /api/v1/products/:slug            Product detail + pricing rules
POST   /api/v1/products/:id/calculate-price   Dynamic price calculation
GET    /api/v1/banners                   Active banners
GET    /api/v1/blog                      Published blog posts
GET    /api/v1/blog/:slug                Blog post detail
GET    /api/v1/pages/:slug               CMS page content
```

### Auth

```
POST   /api/v1/auth/register             Create account
POST   /api/v1/auth/login                Login (returns JWT)
POST   /api/v1/auth/refresh              Refresh access token
POST   /api/v1/auth/logout               Invalidate refresh token
POST   /api/v1/auth/forgot-password      Send reset email
POST   /api/v1/auth/reset-password       Reset with token
GET    /api/v1/auth/me                   Current user profile
```

### Protected (Authenticated)

```
GET    /api/v1/cart                       Get cart
POST   /api/v1/cart/items                 Add to cart
PUT    /api/v1/cart/items/:id             Update cart item
DELETE /api/v1/cart/items/:id             Remove from cart
POST   /api/v1/orders                    Create order
GET    /api/v1/orders/my-orders           Order history
GET    /api/v1/orders/:orderNumber        Order detail
GET    /api/v1/wishlist                   Get wishlist
POST   /api/v1/wishlist/:productId        Add to wishlist
DELETE /api/v1/wishlist/:productId        Remove from wishlist
```

### Admin (Role-based)

```
# Products
GET    /api/v1/admin/products             All products (inc. draft)
POST   /api/v1/admin/products             Create product
PUT    /api/v1/admin/products/:id          Update product
DELETE /api/v1/admin/products/:id          Archive product
POST   /api/v1/admin/products/:id/pricing-rules   Set pricing rules

# Categories & Attributes
GET    /api/v1/admin/categories            All categories
POST   /api/v1/admin/categories            Create category
PUT    /api/v1/admin/categories/:id        Update category
DELETE /api/v1/admin/categories/:id        Delete category
GET    /api/v1/admin/attributes            All attributes
POST   /api/v1/admin/attributes            Create attribute
PUT    /api/v1/admin/attributes/:id        Update attribute

# Orders
GET    /api/v1/admin/orders                All orders
PATCH  /api/v1/admin/orders/:id/status     Update order status

# Users & Roles
GET    /api/v1/admin/users                 Admin users list
POST   /api/v1/admin/users                 Create admin user
PUT    /api/v1/admin/users/:id             Update admin user
DELETE /api/v1/admin/users/:id             Delete admin user
GET    /api/v1/admin/roles                 All roles
PUT    /api/v1/admin/roles/:id             Update role permissions

# CMS
GET    /api/v1/admin/cms/banners           Manage banners
POST   /api/v1/admin/cms/banners           Create banner
GET    /api/v1/admin/cms/blog              Manage blog posts
POST   /api/v1/admin/cms/blog              Create blog post
GET    /api/v1/admin/cms/pages             Manage pages
GET    /api/v1/admin/cms/reviews           Moderate reviews

# Imports & Reports
POST   /api/v1/admin/imports/upload        Upload Excel file
GET    /api/v1/admin/imports               Import history
GET    /api/v1/admin/reports/dashboard     Dashboard stats
GET    /api/v1/admin/reports/revenue       Revenue by period
GET    /api/v1/admin/reports/top-products  Top selling products
```

---

## Data Flow

```
┌──────────┐     ┌───────────┐     ┌────────────┐     ┌──────────┐
│ Customer │────▶│  Next.js  │────▶│  Express   │────▶│ MongoDB  │
│ Browser  │     │  Frontend │     │  Backend   │     │  Atlas   │
└──────────┘     └───────────┘     └────────────┘     └──────────┘
                       │                 │
              ┌────────▼──────┐   ┌──────▼──────┐
              │   Zustand     │   │  Middleware  │
              │  ┌──────────┐ │   │ ┌─────────┐ │
              │  │ authStore│ │   │ │  auth    │ │
              │  │ cartStore│ │   │ │authorize │ │
              │  └──────────┘ │   │ │ validate │ │
              └───────────────┘   │ │rateLimit │ │
                                  │ └─────────┘ │
                                  │      │      │
                              ┌───▼──────▼───┐  │
                              │  Controller  │  │
                              │      │       │  │
                              │  ┌───▼────┐  │  │
                              │  │Service │  │  │
                              │  │   │    │  │  │
                              │  │┌──▼──┐ │  │  │
                              │  ││Model│ │  │  │
                              │  │└─────┘ │  │  │
                              │  └────────┘  │  │
                              └──────────────┘  │
                                                │
```

---

## Security

- **Passwords** — bcrypt with 12 salt rounds, `select: false` on schema
- **Authentication** — JWT access tokens (15min) + refresh tokens (7d)
- **Authorization** — Role-based with granular permission matrix (resource × action)
- **API Security** — Helmet headers, CORS whitelist, rate limiting
- **Input Validation** — Zod schemas on all endpoints
- **Data Protection** — Password field excluded from all API responses

### Roles

| Role             | Access                                         |
| ---------------- | ---------------------------------------------- |
| `super_admin`    | Full access to everything                      |
| `admin`          | All management except role editing             |
| `manager`        | Products, orders, customers, reports           |
| `sales_staff`    | Orders, customers, pricing                     |
| `inventory_staff`| Products, stock, imports                       |
| `content_staff`  | CMS (blog, pages, banners)                     |
| `customer`       | Storefront, own orders, account                |

---

## Getting Started

### Prerequisites

- Node.js 20+
- MongoDB Atlas account (or local MongoDB 7+)
- npm

### Backend Setup

```bash
cd backend
npm install
cp .env.example .env    # Edit with your MongoDB URI
npm run seed            # Seed roles, admin user, categories, products
npm run dev             # Starts on http://localhost:5000
```

### Frontend Setup

```bash
cd frontend
npm install
npm run dev             # Starts on http://localhost:3000
```



### Docker (Production)

```bash
docker-compose up --build
```

---

## Environment Variables



```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb+srv://...
JWT_ACCESS_SECRET=your_secret
JWT_REFRESH_SECRET=your_secret
JWT_ACCESS_EXPIRY=15m
JWT_REFRESH_EXPIRY=7d
STRIPE_SECRET_KEY=sk_test_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx
CLOUDINARY_CLOUD_NAME=your_cloud
CLOUDINARY_API_KEY=your_key
CLOUDINARY_API_SECRET=your_secret
CORS_ORIGIN=http://localhost:3000
SMTP_HOST=smtp.mailtrap.io
SMTP_PORT=587
SMTP_USER=user
SMTP_PASS=pass
EMAIL_FROM=noreply@metfold.com.au
```

### Frontend

```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api/v1
```

---

## Excel Import Format

Upload `.xlsx` files via Admin > Imports. Required columns:

| Column          | Required | Aliases Accepted                     |
| --------------- | -------- | ------------------------------------ |
| `product_name`  | Yes      | `name`, `title`, `product name`      |
| `sku`           | Yes      | `sku_code`, `item_code`              |
| `category`      | Yes      | `product_category`, `main_category`  |
| `product_type`  | Yes      | `type` (`simple` or `configurable`)  |
| `base_price`    | No       | `price`, `unit_price`                |
| `stock`         | No       | `quantity`, `qty`                    |
| `description`   | No       | `product_description`                |
| `status`        | No       | `draft` (default) or `active`        |
| `tags`          | No       | Comma-separated                      |

---

## File Counts

| Area                | Files |
| ------------------- | ----- |
| Backend models      | 19    |
| Backend services    | 12    |
| Backend controllers | 9     |
| Backend routes      | 10    |
| Frontend pages      | 35    |
| Frontend components | 12    |
| **Total source**    | **131+** |

---

Built for [Metfold Sheet Metal](https://metfold.com.au) — Melbourne, Australia.
