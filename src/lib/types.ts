// Mirrors Expense.toFirestoreMap() in the Android app (FirestoreMappers.kt).
export interface Expense {
  id: string;
  name: string;
  amount: number;
  category: string;
  currency: string;
  source: string;
  rawSms: string | null;
  sender: string | null;
  occurredAt: number;
  createdAt: number;
  createdAtLocalTime: string;
  updatedAt: number;
  yearMonth: string;
  paymentSource: string;
  isTracked: boolean;
  isDeleted: boolean;
}

export interface Category {
  name: string;
  color: string;
}

export interface YearMonthItem {
  /** "YYYY-MM", or null for All Time */
  queryValue: string | null;
  displayLabel: string;
}
