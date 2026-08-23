# System Design Write-up

## 1. Complaint History Model & Transactional State Management
The system uses an append-only architecture for complaint history (`ComplaintHistory` table). Instead of merely updating a single `status` column on the `Complaint` table, every state change generates a new, immutable `ComplaintHistory` record containing the `fromStatus`, `toStatus`, `actorId`, `note`, and `changedAt` timestamp.

To guarantee ACID compliance, all state transitions, history logs, and notifications are executed within an interactive database transaction (`prisma.$transaction`). For example, when an admin transitions a complaint from `InProgress` to `Resolved`:
1. The `Complaint` table's status is updated and `resolvedAt` is timestamped.
2. The immutable `ComplaintHistory` entry is inserted with the admin's ID and optional note.
3. The corresponding notification payload is inserted into the `EmailOutbox` table.

If any of these three steps fails (e.g., database constraint violation or connection glitch), the entire operation rolls back, preventing orphaned state changes or untracked notifications. This append-only model prevents historical data tampering, making SLA monitoring accurate and dispute resolution transparent.

---

## 2. Overdue Detection Logic
Overdue status is calculated dynamically at query-time rather than being stored as a static boolean flag in the database.
When an admin views the dashboard or the complaint list, the system fetches the complaints and their associated categories. It then computes the difference between the `createdAt` timestamp and the current `now()` time. If this difference (in calendar days) exceeds the category's `overdueThresholdDays`, and the complaint is not 'Resolved', it is flagged as overdue.

Storing an `is_overdue` flag in the DB would be an anti-pattern because the "overdue" state changes passively as time passes. To keep a static flag accurate, we would need a background cron job running every minute to constantly update rows, which creates unnecessary database write-load and lock contention. Query-time calculation ensures 100% accuracy with zero background maintenance overhead.

---

## 3. Photo Handling Approach
Instead of storing raw binary image data (BLOBs) directly in the PostgreSQL database, the system uploads images to Cloudinary. 
When a resident submits a photo, the Express backend temporarily receives the file via `multer` (with strict MIME type validation for JPG/PNG and a 5MB size limit), uploads it to Cloudinary (under the `society-maintenance-tracker` folder), retrieves a secure HTTPS CDN URL, and deletes the local temporary file. Only this `photoUrl` string is saved in PostgreSQL.

Storing binaries in PostgreSQL bloats the database size rapidly, degrades query performance, and increases backup times. Cloudinary provides a dedicated CDN for fast image delivery, automatic optimization, and infinite storage scaling, making it the industry-standard approach for modern web applications.

---

## 4. Notification Flow (Transactional Outbox Pattern with Retry Worker)
Email notifications are handled asynchronously using the Transactional Outbox pattern. When an event requiring an email occurs (status update, reopen event, or an important notice), the request handler does *not* call the Resend API synchronously. Doing so would add network latency (200ms–2s) to user requests and cause silent notification loss if the third-party API is temporarily degraded.

Instead, the email payload is inserted directly into the `EmailOutbox` table with `status = pending` within the **same atomic database transaction** as the business logic write.

### Asynchronous Worker & Retry Loop:
A background poller (`services/emailPoller.js`) runs every 30 seconds:
1. It queries pending emails with `retryCount < 3`.
2. It attempts to dispatch each email via Resend.
3. **On Success:** It marks `status = 'sent'` and records `sentAt = now()`.
4. **On Failure:** It logs the error and increments `retryCount`. If `retryCount >= 3`, the email is marked `status = 'failed'` for dead-letter inspection. Otherwise, it remains `pending` and is automatically retried in the next polling cycle.

This design decouples HTTP response latency from external API dependencies and provides resilience against transient email service outages.

---

## 5. Recurrence Intelligence Algorithm & Concurrency Analysis
The core differentiator, Recurrence Intelligence, groups similar complaints into `IssueThread`s to prevent duplicate efforts and highlight chronic infrastructure problems. 

The algorithm is a deterministic heuristic executed upon complaint creation within an atomic `prisma.$transaction`:
1. It queries the database for an existing `IssueThread` matching the new complaint's `categoryId` and resident's `block`.
2. It enforces a rolling time window, ensuring the thread's `lastReportedAt` is within the configured `RECURRENCE_WINDOW_DAYS` (default 30).
3. **If a match is found:** The complaint is attached to the existing thread, `recurrenceCount` is updated atomically (`increment: 1`), and `lastReportedAt` is refreshed to `now()`.
4. **Auto-Escalation Rule:** If the incremented `recurrenceCount >= 3` and the thread has not yet been auto-escalated, the new complaint's priority is automatically set to **'High'** (`priorityAutoSet: true`), and the thread is marked `autoEscalated: true`.
5. **If no match is found:** A new `IssueThread` is created with `recurrenceCount = 1`.

### Concurrency & Limitations Discussion:
* **Concurrency Handling:** Wrapping thread lookup, atomic increment, complaint creation, and history insertion inside `prisma.$transaction` ensures that concurrent requests for the same block and category do not leave the database in an inconsistent state. In enterprise-scale distributed architectures with thousands of concurrent submissions per second, explicit row-level pessimistic locking (`SELECT ... FOR UPDATE`) or a distributed Redis lock per `(categoryId, block)` tuple can be added to prevent race conditions during new thread instantiation.
* **Deterministic vs. ML:** The heuristic relies on deterministic categorical and geographical bucketing (same category + same block). It deliberately avoids complex ML/NLP models to keep latency minimal and execution predictable, though it cannot detect cross-category semantic duplicates (e.g., "pipe leak" filed under Plumbing vs "wet ceiling" filed under Carpentry). For society maintenance operations, this deterministic approach provides the highest precision with zero training overhead.

---

## 6. Authentication & Privilege Separation
The application enforces strict role-based access control (RBAC):
* **Public Registration:** Public registration is restricted solely to the `resident` role, requiring `block` and `flatNumber`. Users cannot arbitrarily self-promote to `admin` via API payloads.
* **Admin Accounts:** Administrative privileges are securely provisioned during system setup via the database seed script or direct administrative management.
* **Environment Integrity:** JWT secret keys are strictly validated at runtime; if `JWT_SECRET` is missing in the environment, the server refuses to sign tokens rather than falling back to an insecure default secret.
