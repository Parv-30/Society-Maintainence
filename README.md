# 🏢 Society Maintenance Tracker (with Recurrence Intelligence)

[![React](https://img.shields.io/badge/Frontend-React%20%7C%20Vite%20%7C%20Tailwind-blue)](https://react.dev/)
[![Node.js](https://img.shields.io/badge/Backend-Node.js%20%7C%20Express-green)](https://nodejs.org/)
[![PostgreSQL](https://img.shields.io/badge/Database-PostgreSQL%20%7C%20Prisma%20ORM-indigo)](https://www.prisma.io/)
[![Cloudinary](https://img.shields.io/badge/Storage-Cloudinary-orange)](https://cloudinary.com/)
[![Resend](https://img.shields.io/badge/Email-Resend%20(Outbox)-black)](https://resend.com/)

A full-stack web application designed for residential societies to track, manage, and resolve maintenance complaints with **Recurrence Intelligence**, **Category-based SLA Tiers**, and **Transactional Outbox Email Notifications**.

---

## 🌟 Key Features

### 1. 🧠 Recurrence Intelligence & Auto-Escalation (Novelty)
* **Deterministic Clustering:** Automatically groups incoming complaints in the same residential block and category within a rolling time window (default: 30 days).
* **Auto-Escalation Rule:** When 3 or more complaints cluster in the same thread, the system auto-escalates the priority to **High** (`priorityAutoSet: true`) and marks the thread as escalated.
* **Dedicated Recurring Issues Panel:** Admins can monitor chronic infrastructure failures through a distinct dashboard sorted by frequency.

### 2. ⏱️ Category-Based SLA Overdue Detection
* **Customizable Overdue Thresholds:** Admins can configure custom SLA resolution times (in days) per category (e.g., Security = 1 day, Plumbing = 3 days, Landscaping = 10 days).
* **Query-Time Calculation:** Computes overdue status dynamically ($\text{status} \neq \text{Resolved} \land (\text{now} - \text{createdAt}) > \text{threshold}$) without stale database flags or resource-heavy background cron writes.

### 3. 🔄 48-Hour Reopen & Feedback Loop
* **Resident Satisfaction Rating:** Once an issue is resolved, residents can submit a 1–5 star rating.
* **Conditional Reopen:** If satisfaction is $\le 2$ stars within 48 hours of resolution, the resident can instantly reopen the issue back to `InProgress`, logging the action to the audit history.

### 4. 📜 Immutable Audit Trail
* **Append-Only History (`ComplaintHistory`):** Every state transition (`Open` $\rightarrow$ `InProgress` $\rightarrow$ `Resolved` $\rightarrow$ `Reopened`) creates an immutable record tracking the timestamp, actor, previous/new status, and optional administrative notes.

### 5. 📬 Resilient Email Notifications (Transactional Outbox Pattern)
* **Asynchronous Outbox Queue:** Status updates and important society notices insert records into `EmailOutbox` within the primary database transaction.
* **Background Poller:** A resilient 30-second background worker handles batch dispatch via the Resend API with automatic retry and error isolation.

---

## 🛠️ Tech Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | React (Vite), TanStack React Query v5, React Router v7, Framer Motion, React Hot Toast, Tailwind CSS, Axios |
| **Backend** | Node.js, Express 5, Prisma ORM 5.22, Zod, JWT, bcrypt |
| **Database** | PostgreSQL 15 (Docker container / Managed Postgres) |
| **Media Storage**| Cloudinary CDN via Multer (5MB limit, JPG/PNG only) |
| **Email Service**| Resend (via Transactional Outbox Worker) |
| **Deployment** | Vercel (`vercel.json`) & Render (`render.yaml`) |

---

## 📂 Project Structure

```
society-maintenance-tracker/
├── backend/
│   ├── prisma/
│   │   ├── migrations/          # Version-controlled SQL migrations
│   │   ├── schema.prisma        # Database schema definitions & models
│   │   └── seed.js              # Initial database seeder script
│   ├── src/
│   │   ├── controllers/         # Request handling & business logic
│   │   ├── middleware/          # JWT authentication & role-based guards
│   │   ├── routes/              # Express API route declarations
│   │   ├── services/            # Recurrence engine & background email poller
│   │   └── utils/               # Prisma client singleton
│   ├── .env.example             # Backend environment template
│   ├── Dockerfile               # Production-ready Node.js container
│   ├── entrypoint.sh            # Auto-migration & seed bootstrap script
│   └── render.yaml              # Backend deployment blueprint
├── frontend/
│   ├── src/
│   │   ├── api/                 # Modular API client methods
│   │   ├── components/          # Reusable UI components (Navbar, Badges)
│   │   ├── context/             # AuthContext (JWT & role state)
│   │   ├── pages/
│   │   │   ├── admin/           # Admin Dashboard, Complaints, Recurring, Categories, Notices
│   │   │   └── resident/        # Resident Dashboard, Raise Complaint, Detail, Notice Board
│   │   └── App.jsx              # Routing & role guards
│   ├── .env.example             # Frontend environment template
│   ├── Dockerfile               # Vite dev/prod container
│   └── vercel.json              # Client-side routing configuration
├── docker-compose.yml           # Multi-container orchestration
├── DESIGN.md                    # In-depth 800+ word system architecture paper
└── README.md                    # Project documentation
```

---

## 🚀 Getting Started

### Option A: Local Setup with Docker Compose (Recommended)

1. **Clone the repository:**
   ```bash
   git clone https://github.com/Parv-30/Society-Maintainence.git
   cd Society-Maintainence
   ```

2. **Start the containers:**
   ```bash
   docker compose up --build -d
   ```
   *This automatically provisions PostgreSQL (port `5433`), runs Prisma migrations, seeds the database, and launches the Backend (`:5000`) and Frontend (`:5173`).*

3. **Access the application:**
   * **Frontend:** [http://localhost:5173](http://localhost:5173)
   * **Backend API:** [http://localhost:5000](http://localhost:5000)

---

### Option B: Running Directly (Without Docker)

#### Prerequisites
* Node.js v18+ & npm
* PostgreSQL running locally

#### 1. Backend Setup
```bash
cd backend
cp .env.example .env
# Edit .env with your PostgreSQL credentials
npm install
npx prisma migrate deploy
node prisma/seed.js
npm run dev
```

#### 2. Frontend Setup
```bash
cd ../frontend
cp .env.example .env
npm install
npm run dev
```

---

## 🔐 Demo Accounts (Pre-Seeded)

| Role | Email | Password | Details |
| :--- | :--- | :--- | :--- |
| **Admin** | `admin1@test.com` | `password123` | Full administrative access |
| **Admin** | `admin2@test.com` | `password123` | Secondary administrator |
| **Resident** | `resA1@test.com` | `password123` | Block A, Flat 101 |
| **Resident** | `resA2@test.com` | `password123` | Block A, Flat 102 |
| **Resident** | `resA3@test.com` | `password123` | Block A, Flat 103 |
| **Resident** | `resB1@test.com` | `password123` | Block B, Flat 201 |
| **Resident** | `resB2@test.com` | `password123` | Block B, Flat 202 |

---

## 📡 API Documentation

### Authentication
| Route | Method | Access | Payload | Description |
| :--- | :--- | :--- | :--- | :--- |
| `/api/auth/register` | `POST` | Public | `name, email, password, role, block, flatNumber` | Registers a resident or admin |
| `/api/auth/login` | `POST` | Public | `email, password` | Authenticates and issues JWT |

### Resident Endpoints
| Route | Method | Access | Payload / Params | Description |
| :--- | :--- | :--- | :--- | :--- |
| `/api/complaints` | `POST` | Resident | `categoryId, title, description, photoUrl` | Raises complaint & triggers recurrence engine |
| `/api/complaints/mine` | `GET` | Resident | - | Retrieves complaints created by logged-in user |
| `/api/complaints/:id` | `GET` | Authenticated | - | Gets complaint metadata and feedback status |
| `/api/complaints/:id/history` | `GET` | Authenticated | - | Retrieves append-only status timeline |
| `/api/complaints/:id/feedback`| `POST` | Resident | `rating (1-5), reopen (bool)` | Submits rating and optional 48h reopen |

### Admin Endpoints
| Route | Method | Access | Payload / Params | Description |
| :--- | :--- | :--- | :--- | :--- |
| `/api/admin/complaints` | `GET` | Admin | `?category=&status=&startDate=&endDate=&overdue=true` | Queries complaints with dynamic filters |
| `/api/admin/complaints/recurring` | `GET` | Admin | - | Lists issue threads ordered by recurrence count |
| `/api/admin/complaints/:id/status` | `PATCH` | Admin | `status, note` | Updates status, appends history, enqueues email |
| `/api/admin/complaints/:id/priority` | `PATCH` | Admin | `priority` | Manually updates complaint priority |
| `/api/admin/dashboard` | `GET` | Admin | - | Aggregated metrics, status counts & top issues |
| `/api/admin/categories` | `GET` | Admin | - | Lists all categories and SLA thresholds |
| `/api/admin/categories/:id` | `PATCH` | Admin | `overdueThresholdDays` | Modifies category SLA threshold |

### Notices & Utilities
| Route | Method | Access | Payload / Params | Description |
| :--- | :--- | :--- | :--- | :--- |
| `/api/notices` | `POST` | Admin | `title, body, isImportant` | Posts announcement (emails residents if important) |
| `/api/notices` | `GET` | Authenticated | - | Lists notices (important pinned to top) |
| `/api/categories` | `GET` | Authenticated | - | Category dropdown list for complaint submission |
| `/api/upload` | `POST` | Authenticated | `multipart/form-data (photo)` | Uploads image to Cloudinary CDN |

---

## 🌐 Deployment

### Frontend (Vercel)
1. Import the `/frontend` directory into Vercel.
2. The included `vercel.json` automatically manages client-side routing.
3. Configure environment variable: `VITE_API_URL=https://your-backend-domain.com/api`.

### Backend (Render)
1. Deploy using the included `backend/render.yaml` infrastructure blueprint.
2. Build Command: `npm install && npx prisma generate && npx prisma migrate deploy`
3. Start Command: `node src/index.js`
4. Configure environment variables (`DATABASE_URL`, `JWT_SECRET`, `CLOUDINARY_URL`, `RESEND_API_KEY`).

---

## 📄 System Architecture & Design
For detailed technical rationales covering:
1. Append-Only Complaint History vs. Mutable Status
2. Dynamic Query-Time Overdue Detection
3. Cloudinary CDN Photo Handling
4. Transactional Email Outbox Architecture
5. Recurrence Intelligence Heuristic & Auto-Escalation Limits

Please refer to [`DESIGN.md`](./DESIGN.md).
