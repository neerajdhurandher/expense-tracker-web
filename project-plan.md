# Expense Tracker Web — Project Plan

Web companion for the Android app at `../expense-tracker-android`. Both apps share the **same Firebase project** (`expense-tracker-4d8de`) and the **same Firestore data**. The web app must read data written by the Android app without changing its shape.

## 1. Goal (Phase 1 — current scope)

Read-only view of the signed-in user's expenses, month-wise:

- Sign in with Google (same account as the Android app → same Firebase UID).
- Month selector: last 12 months + "All Time" (default = current month).
- **Untracked expenses** section (`isTracked == false`) — collapsible, orange header, count + total.
- **History** section (tracked, `isTracked == true`) — sorted by `occurredAt` desc.
- Summary card: total spent (tracked only), transaction count, top category.

Out of scope for now: add/edit/delete, confirming untracked expenses, budgets, analytics graphs, filters by category/source.

## 2. Tech stack

| Concern | Choice |
|---|---|
| Framework | Next.js 16 (App Router) + React 19 + TypeScript |
| Styling | Tailwind CSS v4 (`@tailwindcss/postcss`) |
| Backend | Firebase JS SDK v13 — Auth (Google popup) + Firestore |
| Rendering | Client components for anything touching Firebase (`"use client"`) |

## 3. Firebase

- Config comes from `NEXT_PUBLIC_FIREBASE_*` env vars in `.env.local` (git-ignored). See `.env.example`.
- Values originate from `../expense-tracker-android/app/google-services.json`.
- `authDomain` = `expense-tracker-4d8de.firebaseapp.com`.
- Ideally register a **Web app** in Firebase Console and use its `appId`/`apiKey`; the Android API key may be restricted to Android apps.
- Google sign-in provider must be enabled and `localhost` must be in Auth → Authorized domains.

### Firestore data model (owned by the Android app — do not change)

Path: `users/{uid}/expenses/{docId}`

| Field | Type | Notes |
|---|---|---|
| `name` | string | Merchant / description |
| `amount` | number | Double |
| `category` | string | Matches doc ID in `users/{uid}/categories` |
| `currency` | string | Default `"INR"` |
| `source` | string | `"sms"` or `"manual"` |
| `rawSms`, `sender` | string \| null | SMS origin info |
| `occurredAt` | number | Unix **millis** |
| `createdAt`, `updatedAt` | number | Unix millis |
| `createdAtLocalTime` | string | `yyyy-MM-dd HH:mm:ss` |
| `yearMonth` | string | `YYYY-MM` — used for month filter |
| `paymentSource` | string | e.g. `UPI`, `Cash`, `Credit Card` |
| `isTracked` | boolean | `false` = untracked / pending |
| `isDeleted` | boolean | Soft delete — always exclude `true` |

`users/{uid}/categories/{name}` → `{ color: "#RRGGBB", isCustom, isDeleted, ... }` (used for category color dots).

### Query rules

- Month selected: `where("yearMonth", "==", ym)`. All Time: whole collection.
- Filter `isDeleted` and split `isTracked` **client-side**, sort by `occurredAt` desc client-side → avoids composite indexes.
- Totals use **tracked** expenses only (matches Android).

### Write rules (mirror Android `ExpenseRepository`)

- **Add (manual):** `setDoc` at `users/{uid}/expenses/{crypto.randomUUID()}` with `source: "manual"`, `currency: "INR"`, `rawSms/sender: null`, `createdAt = occurredAt`, `createdAtLocalTime` = `yyyy-MM-dd HH:mm:ss` local, `yearMonth` from `occurredAt`, `isTracked: true`, `isDeleted: false`, `updatedAt: now`. Form defaults: category `Other`, payment source `UPI`, date = now.
- **Save (track):** `updateDoc` → `{ isTracked: true, updatedAt: now }`.
- **Edit:** update `name, amount, category, paymentSource, occurredAt`, recompute `yearMonth`, set `isTracked: true`, `updatedAt: now`.
- **Delete:** hard `deleteDoc` (Android does the same on push; other devices remove synced docs missing remotely).
- Always bump `updatedAt` — Android sync is last-write-wins on it. Never write `syncStatus` (Room-only).
- Defaults when user lists are empty — categories: Food, Travel, Groceries, Shopping, Bills, Entertainment, Health, Other; payment sources: Cash, UPI, Credit Card.

## 4. Folder structure

```
src/
  app/
    layout.tsx          # Root layout, wraps AuthProvider
    page.tsx            # Sign-in gate → ExpensesDashboard
    globals.css         # Tailwind + theme tokens
  components/
    SignIn.tsx
    ExpensesDashboard.tsx  # Owns month state, fetches data
    MonthSelector.tsx
    SummaryCard.tsx
    UntrackedSection.tsx
    ReviewUntrackedModal.tsx  # Save / Edit / Delete untracked, shows raw SMS
    AddExpenseModal.tsx       # Manual add (FAB)
    ExpenseForm.tsx           # Shared add/edit form
    Modal.tsx                 # Shared dialog shell
    ExpenseItem.tsx
  context/
    AuthContext.tsx     # onAuthStateChanged, signIn/signOut
  lib/
    firebase.ts         # initializeApp singleton, auth, db
    types.ts            # Expense, Category
    expenses.ts         # Firestore fetch functions
    months.ts           # YearMonthItem list (last 12 + All Time)
    format.ts           # ₹ currency + date formatting
```

## 5. UI / theme (mirrors Android)

- Dark theme: background `#1B1A1A`, surface `#232222`, accent `#FFE600`, text `#FFFFFF`, muted `#B8B8B8`, untracked orange `#FF9F43`.
- Currency: `₹` + `en-IN` grouping + 2 decimals.
- Expense row: category color dot, name, category · payment source, date/time, amount.

## 6. Conventions for Copilot

- Keep Firebase access inside `src/lib/*`; components never import `firebase/firestore` directly.
- Never commit secrets; read config only from `process.env.NEXT_PUBLIC_FIREBASE_*`.
- Don't write to Firestore except via the write helpers in `src/lib/expenses.ts`.
- Keep the Firestore schema identical to the Android `FirestoreMappers.kt`.

## 7. Roadmap

1. [Done] Phase 1 — Auth, month filter, tracked + untracked list, summary.
2. Phase 2 — [Done] Review untracked (Save / Edit / Delete). [Todo] Filters (category / payment source).
3. Phase 3 — [Done] Manual add (FAB + form). [Todo] Edit/delete tracked expenses.
4. Phase 4 — Analytics (charts by category / source), budgets (`source_budgets`).

## 8. Run

```bash
cp .env.example .env.local   # fill values
npm install
npm run dev                  # http://localhost:3000
```

## 9. Deploy (GitHub Pages)

- Static export (`output: "export"` in `next.config.ts`) → no server; no API routes, server actions, or `headers()`.
- `.github/workflows/deploy.yml` builds on push to `main` with `NEXT_PUBLIC_BASE_PATH=/expense-tracker-web` and publishes `out/`.
- Firebase config comes from repo secrets named like the `NEXT_PUBLIC_FIREBASE_*` env vars.
- Live URL: https://neerajdhurandher.github.io/expense-tracker-web/
