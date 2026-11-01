import type { YearMonthItem } from "@/lib/types";

interface Props {
  months: YearMonthItem[];
  selected: YearMonthItem;
  onChange: (m: YearMonthItem) => void;
}

export default function MonthSelector({ months, selected, onChange }: Props) {
  return (
    <label className="inline-flex items-center gap-2 rounded-full bg-surface px-4 py-2">
      <span className="text-sm text-muted">Month</span>
      <select
        className="cursor-pointer bg-transparent font-medium outline-none"
        value={selected.queryValue ?? ""}
        onChange={(e) => onChange(months.find((m) => (m.queryValue ?? "") === e.target.value) ?? months[0])}
      >
        {months.map((m) => (
          <option key={m.queryValue ?? "all"} value={m.queryValue ?? ""} className="bg-surface">
            {m.displayLabel}
          </option>
        ))}
      </select>
    </label>
  );
}
