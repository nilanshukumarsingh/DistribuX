# DistribuX

## Architecture

DistribuX is a role-based internal web application designed for wholesale and distribution operations. It features Customer CRM, Product & Inventory Management, Stock Movement Auditing, and Sales Order Challans. The core business rule is the atomic challan confirmation transaction (`prisma.$transaction`), ensuring stock is deducted safely with zero partial side-effects.

## Tech Stack

| Layer | Technology |
| :--- | :--- |
| **Backend** | Node.js, TypeScript, Express.js |
| **Database** | PostgreSQL |
| **ORM** | Prisma |
| **Validation** | Zod |
| **Authentication** | JWT, bcrypt |
| **Frontend** | React, Vite, Tailwind CSS |
| **HTTP Client** | Axios |

## Submission Links

- **GitHub Repository**: https://github.com/nilanshukumarsingh/DistribuX.git
- **Live Frontend**: [Pending Deployment / Insert Link]
- **Live Backend API**: [Pending Deployment / Insert Link]
- **Postman Collection**: [docs/postman_collection.json](docs/postman_collection.json)

## Local Setup

### 1. Backend Setup

```bash
cd backend
npm install
# Copy environment variables
cp .env.example .env
# Push database schema & seed demo data
npx prisma db push
npm run seed
# Start development server
npm run dev
```

### 2. Frontend Setup

```bash
cd ../frontend
npm install
# Copy environment variables
cp .env.example .env
# Start development server
npm run dev
```

## Test Credentials

| Role | Email | Password | Access Summary |
| :--- | :--- | :--- | :--- |
| **Admin** | `admin@company.com` | `Admin123!` | Full access to all system modules |
| **Sales** | `sales@company.com` | `Sales123!` | Customer CRM, Follow-ups, Create/Confirm Challans |
| **Warehouse** | `warehouse@company.com` | `Warehouse123!` | Product Catalog, Stock IN, Inventory audit logs |
| **Accounts** | `accounts@company.com` | `Accounts123!` | Customer Directory, Financial Reports, View Challans |

## Environment Variables

```env
DATABASE_URL
JWT_SECRET
JWT_EXPIRES_IN
PORT
NODE_ENV
CORS_ORIGIN
VITE_API_URL
```

## Known Limitations / Assumptions

- PostgreSQL database instance required for production concurrent writes.
- Stock deduction on sales challan confirmation is final and atomic.
- Low-stock alert threshold notifications display on dashboard cards (email/SMS delivery not connected).
- Sales challans use formatted web print layout instead of server-side PDF generation.
