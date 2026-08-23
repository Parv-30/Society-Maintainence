# System Design Write-up

## 1. Complaint History Model
The system uses an append-only architecture for complaint history (`ComplaintHistory` table). Instead of merely updating a single `status` column on the `Complaint` table, every state change generates a new, immutable `ComplaintHistory` record containing the `fromStatus`, `toStatus`, `actorId`, `note`, and `changedAt` timestamp. 
This is critical for a maintenance tracking system because it guarantees an audit trail. It allows residents and admins to see exactly *when* an issue moved from 'Open' to 'In Progress', *who* authorized the change, and any associated explanations. An append-only model prevents historical data tampering, making SLA monitoring accurate and dispute resolution transparent. The `Complaint` table still stores the current status for quick querying, but the source of truth for the timeline is the history table.

## 2. Overdue Detection Logic
Overdue status is calculated dynamically at query-time rather than being stored as a static boolean flag in the database.
When an admin views the dashboard or the complaint list, the system fetches the complaints and their associated categories. It then computes the difference between the `createdAt` timestamp and the current `now()` time. If this difference (in calendar days) exceeds the category's `overdueThresholdDays`, and the complaint is not 'Resolved', it is flagged as overdue.
Storing an `is_overdue` flag in the DB would be an anti-pattern because the "overdue" state changes passively as time passes. To keep a static flag accurate, we would need a cron job running every minute to constantly update rows, which creates unnecessary database write-load. Query-time calculation ensures 100% accuracy with zero background maintenance.

## 3. Photo Handling Approach
Instead of storing raw binary image data (BLOBs) directly in the PostgreSQL database, the system uploads images to Cloudinary. 
When a resident submits a photo, the Express backend temporarily receives the file via `multer`, uploads it to Cloudinary (using the `society-maintenance-tracker` folder), retrieves a secure HTTPS URL, and deletes the local temporary file. Only this `photoUrl` string is saved in PostgreSQL.
Storing binaries in PostgreSQL bloats the database size rapidly, degrades query performance, and increases backup times. Cloudinary provides a dedicated CDN for fast image delivery, automatic optimization, and infinite storage scaling, making it the industry-standard approach for modern web applications.

## 4. Notification Flow (Outbox Pattern)
Email notifications are handled asynchronously using the Transactional Outbox pattern. When an event requiring an email occurs (e.g., status change or an important notice), the request handler does *not* call the Resend API directly. Instead, it inserts a record into the `EmailOutbox` table with `status = pending` in the exact same database transaction as the primary data change.
A background `setInterval` poller (`emailPoller.js`) runs every 30 seconds, picks up pending emails, sends them via the Resend API, and updates their status to `sent` or `failed`.
This prevents slow third-party API calls from blocking the HTTP response to the user. Furthermore, if the Resend API is temporarily down, the email intent is not lost; the poller will simply retry the pending rows in the database, guaranteeing eventual delivery and system resilience.

## 5. Recurrence Intelligence Algorithm
The core novelty, Recurrence Intelligence, groups similar complaints into `IssueThread`s to prevent duplicate efforts and highlight chronic problems. 
The algorithm is a deterministic heuristic executed upon complaint creation:
1. It queries the database for an existing `IssueThread` matching the new complaint's `categoryId` and resident's `block`.
2. It enforces a rolling time window, ensuring the thread's `lastReportedAt` is within the configured `RECURRENCE_WINDOW_DAYS` (default 30).
3. If a match is found, the complaint is attached to the thread, `recurrenceCount` increments, and `lastReportedAt` updates.
4. **Auto-escalation Rule**: If `recurrenceCount >= 3` and the thread has not yet been escalated, the new complaint's priority is forced to 'High' (`priorityAutoSet = true`), and the thread is marked as `autoEscalated`.
5. If no match is found, a new `IssueThread` is instantiated.

**Limitations**: Because it relies on strict equality (same category, same block), it cannot detect semantic duplicates across different categories (e.g., "pipe burst" in Plumbing vs "water everywhere" mistakenly filed in Cleaning). It is a deterministic, rule-based grouping mechanism, not a Machine Learning NLP model. However, for a society block paradigm, this geographic and categorical bucketing is highly effective and computationally cheap.
