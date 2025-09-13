# 📝 Multi-Tenant SaaS Notes Application

A full-stack multi-tenant **Notes Application** built with **TypeScript, Express, Prisma, PostgreSQL, and React (Tailwind)**.  
Supports **multi-tenancy, role-based access, subscription limits, and deployment on Vercel**.

---
## 🚀 Live URLs
- **Backend API** → [https://yard-stick-seven.vercel.app](https://yard-stick-seven.vercel.app)  
- **Frontend** → [https://yard-stick-wx19.vercel.app](https://yard-stick-wx19.vercel.app) 

## 🚀 Features

- **Multi-Tenancy**  
  - Two tenants supported by default: `Acme` and `Globex`  
  - Strict tenant isolation – data from one tenant is never accessible to another.  

- **Authentication & Authorization**  
  - JWT-based login.  
  - Roles:  
    - **Admin** → can invite users, upgrade subscription.  
    - **Member** → can create, view, edit, and delete notes.  

- **Subscription Plans**  
  - **Free** → max 3 notes per tenant.  
  - **Pro** → unlimited notes.  
  - Admin can upgrade via `POST /tenants/:slug/upgrade`.

- **Notes API (CRUD)**  
  - `POST   /notes` → create a note  
  - `GET    /notes` → list notes for tenant  
  - `GET    /notes/:id` → get single note  
  - `PUT    /notes/:id` → update note  
  - `DELETE /notes/:id` → delete note  

- **Deployment**  
  - Backend and frontend hosted on **Vercel**.  
  - CORS enabled.  
  - Health check → `GET /health` → `{ "status": "ok" }`

---

## 🏗️ Schema Approach

We used the **Shared Schema with Tenant ID Column** approach:

- A single database schema (`public`) contains all data.  
- Tables include a `tenantId` column to enforce isolation.  
- Prisma models reference `Tenant` → `User` → `Note`.  

**Benefits**:
- Simple to manage with Prisma migrations.  
- Easier scaling in early stages.  
- Strict isolation handled in queries.

---

## 🛠️ Tech Stack

- **Backend**: Express, TypeScript, Prisma, PostgreSQL, JWT, Bcrypt  
- **Frontend**: React, TailwindCSS, TypeScript  
- **Deployment**: Vercel (Serverless Functions + React hosting)  

---


---

## 🔑 Test Accounts

All accounts use password: `password`

- **Acme**  
  - `admin@acme.test` → Admin  
  - `user@acme.test` → Member  
- **Globex**  
  - `admin@globex.test` → Admin  
  - `user@globex.test` → Member  

---

## ▶️ Running Locally

### 1. Clone Repo
```
git clone <your-repo-url>
cd notes-saas
npm install
```
### 2. Setup Database

Use PostgreSQL (local, Supabase, Neon, or Railway).
#### Create .env file:

```
DATABASE_URL="postgresql://user:password@host:port/dbname"
JWT_SECRET="your_secret"
PORT=3000
```

#### Run migrations:
```
npx prisma migrate dev
```

### 3 Backend Adaptation for Vercel

Since Vercel runs serverless functions, you **must not call `app.listen()`**.  
Instead, simply `export default app;` from `app.ts`.  

Example:

```ts
const app = express();
// middlewares + routes...
export default app;
```

For Running Locally remove 
`export default app`
 add `app.listen(3000)`

### 4. Run Dev Server
npm run dev


API available at http://localhost:3000
