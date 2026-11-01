import { formatAmount, formatDateTime } from "@/lib/format";
import type { Expense } from "@/lib/types";

export default function ExpenseItem({ expense, color }: { expense: Expense; color?: string }) {
  return (
    <li className="flex items-center gap-4 rounded-2xl bg-surface px-4 py-3">
      <span className="h-3 w-3 shrink-0 rounded-full" style={{ backgroundColor: color ?? "#B8B8B8" }} />
      <div className="min-w-0 flex-1">
        <p className="truncate font-medium">{expense.name || "Unnamed"}</p>
        <p className="truncate text-xs text-muted">
          {expense.category}
          {expense.paymentSource && ` · ${expense.paymentSource}`} · {formatDateTime(expense.occurredAt)}
        </p>
      </div>
      <p className="shrink-0 font-semibold">{formatAmount(expense.amount)}</p>
    </li>
  );
}
