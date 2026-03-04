export interface CategoryConfig {
  label: string;
  color: string; // Tailwind class or CSS variable reference
  chartColor: string; // oklch value for charts
  bgClass: string;
  textClass: string;
  dotClass: string;
}

export const CATEGORIES: Record<string, CategoryConfig> = {
  Food: {
    label: "Food",
    color: "oklch(0.82 0.20 55)",
    chartColor: "oklch(0.82 0.20 55)",
    bgClass: "bg-amber-500/15",
    textClass: "text-amber-400",
    dotClass: "bg-amber-400",
  },
  Transport: {
    label: "Transport",
    color: "oklch(0.72 0.20 260)",
    chartColor: "oklch(0.72 0.20 260)",
    bgClass: "bg-indigo-500/15",
    textClass: "text-indigo-400",
    dotClass: "bg-indigo-400",
  },
  Housing: {
    label: "Housing",
    color: "oklch(0.68 0.22 310)",
    chartColor: "oklch(0.68 0.22 310)",
    bgClass: "bg-violet-500/15",
    textClass: "text-violet-400",
    dotClass: "bg-violet-400",
  },
  Entertainment: {
    label: "Entertainment",
    color: "oklch(0.78 0.22 320)",
    chartColor: "oklch(0.78 0.22 320)",
    bgClass: "bg-pink-500/15",
    textClass: "text-pink-400",
    dotClass: "bg-pink-400",
  },
  Health: {
    label: "Health",
    color: "oklch(0.72 0.20 145)",
    chartColor: "oklch(0.72 0.20 145)",
    bgClass: "bg-emerald-500/15",
    textClass: "text-emerald-400",
    dotClass: "bg-emerald-400",
  },
  Shopping: {
    label: "Shopping",
    color: "oklch(0.65 0.24 25)",
    chartColor: "oklch(0.65 0.24 25)",
    bgClass: "bg-red-500/15",
    textClass: "text-red-400",
    dotClass: "bg-red-400",
  },
  Salary: {
    label: "Salary",
    color: "oklch(0.78 0.18 200)",
    chartColor: "oklch(0.78 0.18 200)",
    bgClass: "bg-cyan-500/15",
    textClass: "text-cyan-400",
    dotClass: "bg-cyan-400",
  },
  Other: {
    label: "Other",
    color: "oklch(0.55 0.02 240)",
    chartColor: "oklch(0.55 0.02 240)",
    bgClass: "bg-slate-500/15",
    textClass: "text-slate-400",
    dotClass: "bg-slate-400",
  },
};

export const CATEGORY_NAMES = Object.keys(CATEGORIES);

export function getCategoryConfig(category: string): CategoryConfig {
  return CATEGORIES[category] ?? CATEGORIES.Other;
}
