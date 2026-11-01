import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  query,
  setDoc,
  updateDoc,
  where,
  type DocumentData,
} from "firebase/firestore";
import { db } from "./firebase";
import { toLocalDateTimeString } from "./format";
import { toYearMonth } from "./months";
import type { Category, Expense } from "./types";

const DEFAULT_CATEGORIES: Category[] = [
  { name: "Food", color: "#FF6B6B" },
  { name: "Travel", color: "#4DABF7" },
  { name: "Groceries", color: "#51CF66" },
  { name: "Shopping", color: "#FCC419" },
  { name: "Bills", color: "#BE4BDB" },
  { name: "Entertainment", color: "#FF922B" },
  { name: "Health", color: "#20C997" },
  { name: "Other", color: "#ADB5BD" },
];

const DEFAULT_PAYMENT_SOURCES = ["Cash", "UPI", "Credit Card"];

function toExpense(id: string, d: DocumentData): Expense {
  return {
    id,
    name: d.name ?? "",
    amount: Number(d.amount ?? 0),
    category: d.category ?? "Other",
    currency: d.currency ?? "INR",
    source: d.source ?? "manual",
    rawSms: d.rawSms ?? null,
    sender: d.sender ?? null,
    occurredAt: Number(d.occurredAt ?? 0),
    createdAt: Number(d.createdAt ?? 0),
    createdAtLocalTime: d.createdAtLocalTime ?? "",
    updatedAt: Number(d.updatedAt ?? 0),
    yearMonth: d.yearMonth ?? "",
    paymentSource: d.paymentSource ?? "",
    isTracked: d.isTracked ?? true,
    isDeleted: d.isDeleted ?? false,
  };
}

export interface MonthExpenses {
  tracked: Expense[];
  untracked: Expense[];
}

/** yearMonth = "YYYY-MM", or null for all time. Filtering/sorting is client-side to avoid composite indexes. */
export async function fetchExpenses(uid: string, yearMonth: string | null): Promise<MonthExpenses> {
  const ref = collection(db, "users", uid, "expenses");
  const q = yearMonth ? query(ref, where("yearMonth", "==", yearMonth)) : ref;
  const snap = await getDocs(q);

  const all = snap.docs
    .map((doc) => toExpense(doc.id, doc.data()))
    .filter((e) => !e.isDeleted)
    .sort((a, b) => b.occurredAt - a.occurredAt);

  return {
    tracked: all.filter((e) => e.isTracked),
    untracked: all.filter((e) => !e.isTracked),
  };
}

export async function fetchCategories(uid: string): Promise<Category[]> {
  const snap = await getDocs(collection(db, "users", uid, "categories"));
  const categories = snap.docs
    .filter((d) => !d.data().isDeleted)
    .map((d) => ({ name: d.id, color: (d.data().color as string) ?? "#ADB5BD" }));
  return categories.length ? categories : DEFAULT_CATEGORIES;
}

export async function fetchPaymentSources(uid: string): Promise<string[]> {
  const snap = await getDocs(collection(db, "users", uid, "payment_sources"));
  const sources = snap.docs.filter((d) => !d.data().isDeleted).map((d) => d.id);
  return sources.length ? sources : DEFAULT_PAYMENT_SOURCES;
}

// Writes mirror the Android ExpenseRepository so its updatedAt-based sync stays consistent.
function expenseRef(uid: string, id: string) {
  return doc(db, "users", uid, "expenses", id);
}

export async function trackExpense(uid: string, id: string): Promise<void> {
  await updateDoc(expenseRef(uid, id), { isTracked: true, updatedAt: Date.now() });
}

export interface ExpenseEdits {
  name: string;
  amount: number;
  category: string;
  paymentSource: string;
  occurredAt: number;
}

/** Same as Android confirmExpenseWithEdits: applies edits and marks the expense tracked. */
export async function saveExpenseWithEdits(uid: string, id: string, edits: ExpenseEdits): Promise<void> {
  await updateDoc(expenseRef(uid, id), {
    ...edits,
    yearMonth: toYearMonth(edits.occurredAt),
    isTracked: true,
    updatedAt: Date.now(),
  });
}

/** Same as Android addManualExpense + ExpenseRepository.insertExpense (UUID doc id, createdAt = occurredAt). */
export async function addExpense(uid: string, values: ExpenseEdits): Promise<void> {
  const id = crypto.randomUUID();
  await setDoc(expenseRef(uid, id), {
    name: values.name,
    amount: values.amount,
    category: values.category,
    currency: "INR",
    source: "manual",
    rawSms: null,
    sender: null,
    occurredAt: values.occurredAt,
    createdAt: values.occurredAt,
    createdAtLocalTime: toLocalDateTimeString(values.occurredAt),
    updatedAt: Date.now(),
    yearMonth: toYearMonth(values.occurredAt),
    paymentSource: values.paymentSource,
    isTracked: true,
    isDeleted: false,
  });
}

// Android hard-deletes in Firestore; other devices drop synced docs missing remotely.
export async function deleteExpense(uid: string, id: string): Promise<void> {
  await deleteDoc(expenseRef(uid, id));
}
