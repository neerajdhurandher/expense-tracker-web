"use client";

import { useState, type FormEvent } from "react";
import type { ExpenseEdits } from "@/lib/expenses";
import { toDateTimeLocal } from "@/lib/format";
import type { Category } from "@/lib/types";

interface Props {
  initial: ExpenseEdits;
  categories: Category[];
  paymentSources: string[];
  busy: boolean;
  submitLabel: string;
  onCancel: () => void;
  onSubmit: (values: ExpenseEdits) => void;
}

export default function ExpenseForm({ initial, categories, paymentSources, busy, submitLabel, onCancel, onSubmit }: Props) {
  const [name, setName] = useState(initial.name);
  const [amount, setAmount] = useState(initial.amount ? String(initial.amount) : "");
  const [category, setCategory] = useState(initial.category);
  const [paymentSource, setPaymentSource] = useState(initial.paymentSource);
  const [occurredAt, setOccurredAt] = useState(toDateTimeLocal(initial.occurredAt));
  const [errors, setErrors] = useState<{ name?: string; amount?: string }>({});

  // Keep the initial values selectable even if they're not in the user's lists.
  const categoryNames = [...new Set([...categories.map((c) => c.name), initial.category].filter(Boolean))];
  const sourceNames = [...new Set([...paymentSources, initial.paymentSource].filter(Boolean))];
  const categoryColor = categories.find((c) => c.name === category)?.color ?? "#ADB5BD";

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const parsedAmount = Number(amount);
    const next = {
      name: name.trim() ? undefined : "Merchant name is required.",
      amount: Number.isFinite(parsedAmount) && parsedAmount > 0 ? undefined : "Provide a valid transaction amount.",
    };
    setErrors(next);
    if (next.name || next.amount || !occurredAt) return;
    onSubmit({
      name: name.trim(),
      amount: parsedAmount,
      category,
      paymentSource,
      occurredAt: new Date(occurredAt).getTime(),
    });
  };

  const field = "w-full rounded-xl bg-surface-2 px-3 py-2 outline-none focus:ring-2 focus:ring-accent";

  return (
    <form onSubmit={handleSubmit} noValidate className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      <label className="flex flex-col gap-1 text-sm sm:col-span-2">
        <span className="text-muted">Expense title / merchant</span>
        <input
          className={field}
          value={name}
          maxLength={100}
          placeholder="e.g. Swiggy, Uber, Rent"
          onChange={(e) => setName(e.target.value)}
        />
        {errors.name && <span className="text-xs text-red-400">{errors.name}</span>}
      </label>
      <label className="flex flex-col gap-1 text-sm">
        <span className="text-muted">Amount (₹)</span>
        <input
          className={field}
          type="number"
          inputMode="decimal"
          min="0.01"
          step="0.01"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
        />
        {errors.amount && <span className="text-xs text-red-400">{errors.amount}</span>}
      </label>
      <label className="flex flex-col gap-1 text-sm">
        <span className="text-muted">Date & time</span>
        <input
          className={field}
          type="datetime-local"
          value={occurredAt}
          onChange={(e) => setOccurredAt(e.target.value)}
          required
        />
      </label>
      <label className="flex flex-col gap-1 text-sm">
        <span className="flex items-center gap-2 text-muted">
          Category
          <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: categoryColor }} />
        </span>
        <select className={field} value={category} onChange={(e) => setCategory(e.target.value)}>
          {categoryNames.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </label>
      <label className="flex flex-col gap-1 text-sm">
        <span className="text-muted">Payment source</span>
        <select className={field} value={paymentSource} onChange={(e) => setPaymentSource(e.target.value)}>
          {sourceNames.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </label>
      <div className="flex gap-2 sm:col-span-2">
        <button
          type="submit"
          disabled={busy}
          className="flex-1 rounded-full bg-accent py-2 font-semibold text-black disabled:opacity-50"
        >
          {busy ? "Saving…" : submitLabel}
        </button>
        <button
          type="button"
          onClick={onCancel}
          disabled={busy}
          className="flex-1 rounded-full bg-surface-2 py-2 font-semibold disabled:opacity-50"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
