# Society Maintenance Tracker

A production-quality full-stack web application for tracking society maintenance complaints with Recurrence Intelligence.

## Tech Stack
- **Frontend**: React (Vite), React Router, React Query, Axios, Tailwind CSS
- **Backend**: Node.js, Express, Prisma ORM
- **Database**: PostgreSQL
- **Auth**: JWT, bcrypt
- **Photo Storage**: Cloudinary
- **Email**: Resend (Outbox pattern)

## Setup Guide

### 1. Environment Variables
Create a `.env` file in the `/backend` directory based on the `.env.example`:

```
DATABASE_URL="postgresql://smt_user:smt_password@localhost:5432/smt_db"
PORT=5000
JWT_SECRET="your_jwt_secret"
CLOUDINARY_URL="cloudinary://YOUR_KEY:YOUR_SECRET@YOUR_CLOUD_NAME"
RESEND_API_KEY="re_your_resend_key"
RECURRENCE_WINDOW_DAYS="30"
```

Create a `.env` file in the `/frontend` directory:
```
VITE_API_URL="http://localhost:5000/api"
```

### 2. Local Development (Docker Recommended)
We provide a `docker-compose.yml` for seamless local setup.

1. Install Docker and Docker Compose.
2. In the root directory, run:
   ```bash
   docker-compose up --build
   ```
   This will start PostgreSQL, the Backend API, and the Frontend Vite server.

### 3. Database Migration and Seeding
Once the backend container is running, you need to apply the schema and seed the database.
In a new terminal:
```bash
# Enter the backend container
docker exec -it smt_backend sh

# Run migrations
npx prisma migrate dev --name init

# Seed the database
npm run seed
```

The seed script creates:
- 2 Admin Users (`admin1@test.com`, `admin2@test.com` | Password: `password123`)
- 5 Resident Users (e.g. `resA1@test.com` | Password: `password123`)
- Initial Categories (Plumbing, Electrical, Cleaning) with varying SLA thresholds
- A simulated auto-escalation scenario (3 plumbing complaints in Block A)

### 4. Running the apps directly (Without Docker)
If you prefer running without Docker:
1. Ensure PostgreSQL is running locally and update `DATABASE_URL`.
2. Inside `/backend`:
   ```bash
   npm install
   npx prisma migrate dev
   npm run seed
   npm run dev
   ```
3. Inside `/frontend`:
   ```bash
   npm install
   npm run dev
   ```

## Deployment Steps

### Frontend (Vercel)
1. Import the `/frontend` directory to Vercel.
2. The `vercel.json` file handles client-side routing.
3. Set `VITE_API_URL` to your deployed backend URL.

### Backend (Render / Railway)
1. Import the `/backend` directory.
2. Configure environment variables (DB URL, Cloudinary, Resend, JWT).
3. Build Command: `npm install && npx prisma generate`
4. Start Command: `node src/index.js`
5. The `render.yaml` file (if deploying on Render) automates this along with the PostgreSQL instance.

## API Documentation

### Auth
| Route | Method | Access | Body | Description |
|-------|--------|--------|------|-------------|
| `/api/auth/register` | POST | Public | `name, email, password, role, block, flatNumber` | Register a new user |
| `/api/auth/login` | POST | Public | `email, password` | Authenticate and get JWT |

### Resident
| Route | Method | Access | Body/Params | Description |
|-------|--------|--------|-------------|-------------|
| `/api/complaints` | POST | Resident | `categoryId, title, description, photoUrl` | Raise new complaint (runs recurrence) |
| `/api/complaints/mine` | GET | Resident | | Get own complaints |
| `/api/complaints/:id/history` | GET | Resident/Admin | | View status timeline |
| `/api/complaints/:id/feedback`| POST | Resident | `rating, reopen` | Submit feedback (post-resolution) |

### Admin
| Route | Method | Access | Body/Params | Description |
|-------|--------|--------|-------------|-------------|
| `/api/admin/complaints` | GET | Admin | `?category=&status=&overdue=` | Query complaints |
| `/api/admin/complaints/recurring` | GET | Admin | | View threads by recurrence |
| `/api/admin/complaints/:id/status`| PATCH | Admin | `status, note` | Update status (adds to history, emails) |
| `/api/admin/complaints/:id/priority`|PATCH| Admin | `priority` | Update priority |
| `/api/admin/dashboard` | GET | Admin | | Aggregated stats |
| `/api/admin/categories/:id` | PATCH | Admin | `overdueThresholdDays` | Update SLA threshold |

### Notices & Utilities
| Route | Method | Access | Body/Params | Description |
|-------|--------|--------|-------------|-------------|
| `/api/notices` | POST | Admin | `title, body, isImportant` | Post notice (emails if important) |
| `/api/notices` | GET | Auth | | Get all notices |
| `/api/categories` | GET | Auth | | Get all categories |
| `/api/upload` | POST | Auth | `form-data: photo` | Upload image to Cloudinary |
