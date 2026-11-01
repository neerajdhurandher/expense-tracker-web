import type { YearMonthItem } from "./types";

export const ALL_TIME: YearMonthItem = { queryValue: null, displayLabel: "All Time" };

export function toYearMonth(millis: number): string {
  const d = new Date(millis);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

export function getAvailableMonths(count = 12, now = new Date()): YearMonthItem[] {
  const months: YearMonthItem[] = [];
  for (let i = 0; i < count; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const ym = toYearMonth(d.getTime());
    const label = d.toLocaleDateString("en-US", { month: "long", year: "numeric" });
    months.push({ queryValue: ym, displayLabel: label });
  }
  months.push(ALL_TIME);
  return months;
}
