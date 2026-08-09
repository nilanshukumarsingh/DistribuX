# DistribuX - ERP & CRM Operations Portal

DistribuX is a web application designed for wholesale and distribution operations. It handles customer CRM, product stock management, inventory logs, and sales challans with role-based access control and transactional stock deductions.

---

## 📌 Submission Details

- **GitHub Repository**: https://github.com/nilanshukumarsingh/DistribuX.git
- **Live Frontend URL**: [Insert Live Frontend Link Here]
- **Live Backend API URL**: [Insert Live Backend Link Here]
- **Postman Collection**: `postman_collection.json` (included in project root)

---

## 🔑 Test Login Credentials

| Role | Email | Password | Access Rights |
| :--- | :--- | :--- | :--- |
| **ADMIN** | `admin@company.com` | `Admin123!` | Full system access across all modules |
| **SALES** | `sales@company.com` | `Sales123!` | Customers CRM, Follow-ups, Create/Confirm Challans |
| **WAREHOUSE** | `warehouse@company.com` | `Warehouse123!` | Product Catalog, Stock-IN, Inventory Logs, Confirm Challans |
| **ACCOUNTS** | `accounts@company.com` | `Accounts123!` | Customer Directory, Financial Reports, View Challans |

*Note: The login page includes quick-fill buttons to test each role instantly.*

---

## 🏛️ Short Explanation of Architecture

DistribuX uses a decoupled client-server architecture:

- **Frontend**: Built with React 18, TypeScript, Tailwind CSS, and React Router v6. State management uses React Context (`AuthContext`) and API queries use Axios with automatic JWT header interceptors.
- **Backend**: Built with Node.js, Express, TypeScript, and Prisma ORM. Authentication is managed using JWT tokens and bcrypt password hashing.
- **Database & Stock Transactions**: Uses SQLite for local development (PostgreSQL for production). Stock deduction on challan confirmation runs inside an isolated transaction (`prisma.$transaction`). If stock is insufficient for any item, the transaction cancels with zero database changes.
- **Authorization**: Protected routes and actions are governed by role middleware (`authorizeRoles`).

---

## 🛠️ Setup Instructions

### Prerequisites
- Node.js (v18+)
- npm

### 1. Backend Setup

```bash
cd backend
npm install
npx prisma db push
npm run seed
npm run dev
```
Backend server runs on `http://localhost:5000`.

### 2. Frontend Setup

```bash
cd frontend
npm install
npm run dev
```
Frontend application runs on `http://localhost:5173`.

---

## 🚀 Deployment Instructions

### Backend (Render / Railway)
1. Environment variables required: `DATABASE_URL`, `JWT_SECRET`, `FRONTEND_URL`, `PORT`.
2. Build command: `npm install && npx prisma db push && npm run build && npm run seed`
3. Start command: `npm start`

### Frontend (Vercel / Netlify)
1. Environment variable required: `VITE_API_URL` pointing to live backend.
2. Build command: `npm run build`
3. Output directory: `dist`

---

## 📄 Postman Collection & API Endpoints

Import `postman_collection.json` into Postman to test all endpoints. Key routes include:

- `POST /api/auth/login` - Authenticate user & receive JWT token
- `GET /api/customers` - Search & filter customer CRM records
- `POST /api/customers/:id/followups` - Add customer interaction history
- `GET /api/products` - List products & check low-stock alerts
- `POST /api/products/:id/stock-in` - Replenish product inventory
- `GET /api/inventory/movements` - Audit log of stock movement
- `POST /api/challans` - Create draft sales challan
- `POST /api/challans/:id/confirm` - Confirm sales challan & deduct inventory atomically
- `GET /api/dashboard/stats` - Live metrics breakdown

---

## ⚠️ Known Limitations

1. **Default Database**: Configured to use SQLite out of the box for quick local testing. Switching to PostgreSQL is required for high-concurrency production setups.
2. **Notification Delivery**: Low stock warnings appear on the dashboard; automated email/SMS alerts are not configured.
3. **Invoice Printing**: Challans can be viewed and printed via standard browser print commands, but native PDF document generation is omitted.
4. **Payment Processing**: Tracks order amounts and invoice totals, but external payment gateway integration (e.g. Stripe/Razorpay) is not included.
