import { formatAmount } from "@/lib/format";
import type { Expense } from "@/lib/types";

export default function SummaryCard({ expenses }: { expenses: Expense[] }) {
  const total = expenses.reduce((sum, e) => sum + e.amount, 0);

  const byCategory = new Map<string, number>();
  expenses.forEach((e) => byCategory.set(e.category, (byCategory.get(e.category) ?? 0) + e.amount));
  const topCategory = [...byCategory.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] ?? "—";

  return (
    <section className="rounded-3xl bg-accent p-6 text-black">
      <p className="text-sm font-medium opacity-70">Total Spent</p>
      <p className="mt-1 text-4xl font-bold">{formatAmount(total)}</p>
      <div className="mt-6 flex gap-8 text-sm">
        <div>
          <p className="opacity-70">Transactions</p>
          <p className="text-lg font-semibold">{expenses.length}</p>
        </div>
        <div>
          <p className="opacity-70">Top Category</p>
          <p className="text-lg font-semibold">{topCategory}</p>
        </div>
      </div>
    </section>
  );
}
