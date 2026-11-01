"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { User } from "firebase/auth";
import { useAuth } from "@/context/AuthContext";
import { fetchCategories, fetchExpenses, fetchPaymentSources, type MonthExpenses } from "@/lib/expenses";
import { getAvailableMonths } from "@/lib/months";
import type { Category, YearMonthItem } from "@/lib/types";
import MonthSelector from "./MonthSelector";
import SummaryCard from "./SummaryCard";
import UntrackedSection from "./UntrackedSection";
import ExpenseItem from "./ExpenseItem";
import ReviewUntrackedModal from "./ReviewUntrackedModal";
import AddExpenseModal from "./AddExpenseModal";

export default function ExpensesDashboard({ user }: { user: User }) {
  const { signOut } = useAuth();
  const months = useMemo(() => getAvailableMonths(), []);
  const [selected, setSelected] = useState<YearMonthItem>(months[0]);
  const [data, setData] = useState<MonthExpenses>({ tracked: [], untracked: [] });
  const [categories, setCategories] = useState<Category[]>([]);
  const [paymentSources, setPaymentSources] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reviewOpen, setReviewOpen] = useState(false);
  const [addOpen, setAddOpen] = useState(false);

  const colors = useMemo(() => Object.fromEntries(categories.map((c) => [c.name, c.color])), [categories]);

  useEffect(() => {
    fetchCategories(user.uid).then(setCategories).catch(() => setCategories([]));
    fetchPaymentSources(user.uid).then(setPaymentSources).catch(() => setPaymentSources([]));
  }, [user.uid]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    fetchExpenses(user.uid, selected.queryValue)
      .then((res) => !cancelled && setData(res))
      .catch((e: unknown) => !cancelled && setError(e instanceof Error ? e.message : "Failed to load expenses"))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [user.uid, selected.queryValue]);

  // Refetch without the loading spinner so the review modal stays in place.
  const refresh = useCallback(async () => {
    setData(await fetchExpenses(user.uid, selected.queryValue));
  }, [user.uid, selected.queryValue]);

  const closeReview = useCallback(() => setReviewOpen(false), []);
  const closeAdd = useCallback(() => setAddOpen(false), []);

  const firstName = user.displayName?.split(" ")[0] ?? "there";

  return (
    <main className="mx-auto flex max-w-2xl flex-col gap-6 px-4 pb-28 pt-8">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Expenses</h1>
          <p className="text-muted">Hello, {firstName}</p>
        </div>
        <button
          onClick={signOut}
          title="Sign out"
          className="flex h-11 w-11 items-center justify-center rounded-full bg-accent text-lg font-bold text-black"
        >
          {firstName.charAt(0).toUpperCase()}
        </button>
      </header>

      <MonthSelector months={months} selected={selected} onChange={setSelected} />

      {error && <p className="rounded-xl bg-red-500/10 p-4 text-sm text-red-400">{error}</p>}

      {loading ? (
        <p className="py-10 text-center text-muted">Loading…</p>
      ) : (
        <>
          <SummaryCard expenses={data.tracked} />
          <UntrackedSection expenses={data.untracked} colors={colors} onReview={() => setReviewOpen(true)} />

          <section className="flex flex-col gap-3">
            <h2 className="text-lg font-semibold">History</h2>
            {data.tracked.length === 0 ? (
              <div className="rounded-2xl bg-surface p-8 text-center">
                <p className="font-medium">No recorded expenses</p>
                <p className="text-sm text-muted">Nothing tracked for {selected.displayLabel}.</p>
              </div>
            ) : (
              <ul className="flex flex-col gap-2">
                {data.tracked.map((e) => (
                  <ExpenseItem key={e.id} expense={e} color={colors[e.category]} />
                ))}
              </ul>
            )}
          </section>
        </>
      )}

      {reviewOpen && (
        <ReviewUntrackedModal
          uid={user.uid}
          expenses={data.untracked}
          categories={categories}
          paymentSources={paymentSources}
          onChanged={refresh}
          onClose={closeReview}
        />
      )}

      {addOpen && (
        <AddExpenseModal
          uid={user.uid}
          categories={categories}
          paymentSources={paymentSources}
          onAdded={refresh}
          onClose={closeAdd}
        />
      )}

      <button
        onClick={() => setAddOpen(true)}
        aria-label="Add expense"
        title="Add expense"
        className="fixed bottom-6 right-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-accent text-3xl font-light text-black shadow-lg shadow-black/40 hover:brightness-95"
      >
        +
      </button>
    </main>
  );
}
