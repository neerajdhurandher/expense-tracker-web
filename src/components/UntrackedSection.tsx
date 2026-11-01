"use client";

import { useState } from "react";
import { formatAmount } from "@/lib/format";
import type { Expense } from "@/lib/types";
import ExpenseItem from "./ExpenseItem";

interface Props {
  expenses: Expense[];
  colors: Record<string, string>;
  onReview: () => void;
}

export default function UntrackedSection({ expenses, colors, onReview }: Props) {
  const [open, setOpen] = useState(false);
  if (expenses.length === 0) return null;

  const total = expenses.reduce((sum, e) => sum + e.amount, 0);

  return (
    <section className="rounded-3xl border border-untracked/40 bg-untracked/10">
      <div className="flex items-center gap-2 pr-4">
        <button
          onClick={() => setOpen((o) => !o)}
          className="flex flex-1 items-center gap-3 py-4 pl-5 text-left"
          aria-expanded={open}
        >
          <span className="font-semibold text-untracked">Untracked Expenses</span>
          <span className="rounded-full bg-untracked px-2 py-0.5 text-xs font-bold text-black">{expenses.length}</span>
          <span className="ml-auto font-semibold text-untracked">{formatAmount(total)}</span>
          <span className="text-untracked">{open ? "▲" : "▼"}</span>
        </button>
        <button
          onClick={onReview}
          className="rounded-full bg-untracked px-4 py-1.5 text-sm font-semibold text-black"
        >
          Review
        </button>
      </div>
      {open && (
        <ul className="flex flex-col gap-2 px-3 pb-3">
          {expenses.map((e) => (
            <ExpenseItem key={e.id} expense={e} color={colors[e.category]} />
          ))}
        </ul>
      )}
    </section>
  );
}
