"use client";

import { useState } from "react";
import { deleteExpense, saveExpenseWithEdits, trackExpense } from "@/lib/expenses";
import { formatAmount, formatDateTime } from "@/lib/format";
import type { Category, Expense } from "@/lib/types";
import ExpenseForm from "./ExpenseForm";
import Modal from "./Modal";

interface Props {
  uid: string;
  expenses: Expense[];
  categories: Category[];
  paymentSources: string[];
  onChanged: () => Promise<void>;
  onClose: () => void;
}

export default function ReviewUntrackedModal({ uid, expenses, categories, paymentSources, onChanged, onClose }: Props) {
  return (
    <Modal
      title={
        <>
          Review Untracked <span className="text-untracked">({expenses.length})</span>
        </>
      }
      onClose={onClose}
    >
      {expenses.length === 0 ? (
        <p className="py-10 text-center text-muted">All caught up — nothing left to review.</p>
      ) : (
        expenses.map((e) => (
          <ReviewCard
            key={e.id}
            uid={uid}
            expense={e}
            categories={categories}
            paymentSources={paymentSources}
            onChanged={onChanged}
          />
        ))
      )}
    </Modal>
  );
}

interface CardProps {
  uid: string;
  expense: Expense;
  categories: Category[];
  paymentSources: string[];
  onChanged: () => Promise<void>;
}

function ReviewCard({ uid, expense, categories, paymentSources, onChanged }: CardProps) {
  const [editing, setEditing] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const run = async (action: () => Promise<void>) => {
    setBusy(true);
    setError(null);
    try {
      await action();
      await onChanged();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
      setBusy(false);
    }
  };

  const handleDelete = () => {
    if (window.confirm(`Delete "${expense.name || "this expense"}" (${formatAmount(expense.amount)})?`)) {
      run(() => deleteExpense(uid, expense.id));
    }
  };

  return (
    <article className="rounded-2xl bg-surface p-4">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="truncate font-medium">{expense.name || "Unnamed"}</p>
          <p className="text-xs text-muted">
            {formatDateTime(expense.occurredAt)}
            {expense.sender && ` · ${expense.sender}`}
          </p>
        </div>
        <p className="shrink-0 text-lg font-semibold text-untracked">{formatAmount(expense.amount)}</p>
      </div>

      <div className="mt-3 rounded-xl bg-surface-2 p-3">
        <p className="mb-1 text-xs font-medium uppercase tracking-wide text-muted">Raw message</p>
        <p className="whitespace-pre-wrap break-words text-sm">{expense.rawSms || "No SMS captured (manual entry)."}</p>
      </div>

      {editing ? (
        <div className="mt-4">
          <ExpenseForm
            initial={expense}
            categories={categories}
            paymentSources={paymentSources}
            busy={busy}
            submitLabel="Save changes"
            onCancel={() => setEditing(false)}
            onSubmit={(edits) => run(() => saveExpenseWithEdits(uid, expense.id, edits))}
          />
        </div>
      ) : (
        <div className="mt-4 flex gap-2">
          <button
            onClick={() => run(() => trackExpense(uid, expense.id))}
            disabled={busy}
            className="flex-1 rounded-full bg-accent py-2 font-semibold text-black disabled:opacity-50"
          >
            Save
          </button>
          <button
            onClick={() => setEditing(true)}
            disabled={busy}
            className="flex-1 rounded-full bg-surface-2 py-2 font-semibold disabled:opacity-50"
          >
            Edit
          </button>
          <button
            onClick={handleDelete}
            disabled={busy}
            className="flex-1 rounded-full bg-red-500/15 py-2 font-semibold text-red-400 disabled:opacity-50"
          >
            Delete
          </button>
        </div>
      )}

      {error && <p className="mt-2 text-sm text-red-400">{error}</p>}
    </article>
  );
}
