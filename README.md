# DistribuX

DistribuX is an ERP & CRM operations portal built for wholesale and distribution businesses. It manages customers, inventory cataloging, stock movement logs, and transactional sales order challans across Admin, Sales, Warehouse, and Accounts roles.

## Submission Links

- **GitHub Repo**: https://github.com/nilanshukumarsingh/DistribuX.git
- **Live Frontend**: [Pending Deployment / Add Link Here]
- **Live Backend API**: [Pending Deployment / Add Link Here]
- **Postman Collection**: [docs/postman_collection.json](docs/postman_collection.json)

## Test Accounts

| Role | Email | Password | Access |
| :--- | :--- | :--- | :--- |
| **Admin** | `admin@company.com` | `Admin123!` | Full access |
| **Sales** | `sales@company.com` | `Sales123!` | CRM, Follow-ups, Create & Confirm Challans |
| **Warehouse** | `warehouse@company.com` | `Warehouse123!` | Products catalog, Stock IN, Inventory logs |
| **Accounts** | `accounts@company.com` | `Accounts123!` | Customer directory, Financial reports, View challans |

## Architecture Overview

- **Frontend**: React 18, TypeScript, Tailwind CSS, Axios with JWT authorization headers.
- **Backend**: Express, TypeScript, Prisma ORM, bcrypt, Zod input validation.
- **Stock Transactions**: Sales challan confirmation uses `prisma.$transaction` to ensure atomic stock deduction. If any item is out of stock, the transaction cancels with zero DB modifications.

## Local Setup

### 1. Backend
```bash
cd backend
npm install
npx prisma db push
npm run seed
npm run dev
```
Runs at `http://localhost:5000`.

### 2. Frontend
```bash
cd frontend
npm install
npm run dev
```
Runs at `http://localhost:5173`.

## Deployment Setup

- **Backend (Render/Railway)**: Set `DATABASE_URL`, `JWT_SECRET`, `FRONTEND_URL`, `PORT`. Build: `npm install && npx prisma db push && npm run build && npm run seed`. Start: `npm start`.
- **Frontend (Vercel)**: Set `VITE_API_URL` to backend URL. Build: `npm run build`. Output: `dist`.

## Known Limitations

- Default database uses SQLite for simple local testing (Postgres required for production).
- Dashboard highlights low stock items, but automated email sending is not hooked up.
- Challans use browser print format instead of a dedicated PDF generation library.
