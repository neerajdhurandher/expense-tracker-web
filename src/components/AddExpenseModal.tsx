"use client";

import { useState } from "react";
import { addExpense } from "@/lib/expenses";
import type { Category } from "@/lib/types";
import ExpenseForm from "./ExpenseForm";
import Modal from "./Modal";

interface Props {
  uid: string;
  categories: Category[];
  paymentSources: string[];
  onAdded: () => Promise<void>;
  onClose: () => void;
}

export default function AddExpenseModal({ uid, categories, paymentSources, onAdded, onClose }: Props) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [initial] = useState(() => ({
    name: "",
    amount: 0,
    category: "Other",
    paymentSource: "UPI",
    occurredAt: Date.now(),
  }));

  return (
    <Modal title="Add Expense" onClose={onClose}>
      <ExpenseForm
        initial={initial}
        categories={categories}
        paymentSources={paymentSources}
        busy={busy}
        submitLabel="Add expense"
        onCancel={onClose}
        onSubmit={async (values) => {
          setBusy(true);
          setError(null);
          try {
            await addExpense(uid, values);
            await onAdded();
            onClose();
          } catch (e) {
            setError(e instanceof Error ? e.message : "Failed to add expense");
            setBusy(false);
          }
        }}
      />
      {error && <p className="text-sm text-red-400">{error}</p>}
    </Modal>
  );
}
