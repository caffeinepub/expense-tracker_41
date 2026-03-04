// Seed data for first-load experience
// These are added via the backend if no transactions exist

export interface SeedTransaction {
  txType: string;
  amount: number;
  category: string;
  description: string;
  date: string;
}

const today = new Date();
const y = today.getFullYear();
const m = today.getMonth() + 1;

function dateStr(monthOffset: number, day: number): string {
  const d = new Date(y, today.getMonth() + monthOffset, day);
  return d.toISOString().split("T")[0];
}

export const SEED_TRANSACTIONS: SeedTransaction[] = [
  {
    txType: "income",
    amount: 4500,
    category: "Salary",
    description: "Monthly salary — software engineer",
    date: dateStr(0, 1),
  },
  {
    txType: "income",
    amount: 850,
    category: "Salary",
    description: "Freelance project payment",
    date: dateStr(-1, 15),
  },
  {
    txType: "expense",
    amount: 1200,
    category: "Housing",
    description: "Monthly rent payment",
    date: dateStr(0, 3),
  },
  {
    txType: "expense",
    amount: 89.5,
    category: "Food",
    description: "Weekly groceries — Whole Foods",
    date: dateStr(0, 5),
  },
  {
    txType: "expense",
    amount: 45,
    category: "Transport",
    description: "Monthly metro card",
    date: dateStr(0, 2),
  },
  {
    txType: "expense",
    amount: 14.99,
    category: "Entertainment",
    description: "Netflix subscription",
    date: dateStr(0, 4),
  },
  {
    txType: "expense",
    amount: 235,
    category: "Shopping",
    description: "New running shoes — Nike",
    date: dateStr(-1, 22),
  },
  {
    txType: "expense",
    amount: 60,
    category: "Health",
    description: "Gym membership — monthly",
    date: dateStr(0, 1),
  },
  {
    txType: "expense",
    amount: 32.5,
    category: "Food",
    description: "Team lunch at Italian restaurant",
    date: dateStr(0, 8),
  },
  {
    txType: "income",
    amount: 250,
    category: "Other",
    description: "Sold old laptop on eBay",
    date: dateStr(-1, 28),
  },
  {
    txType: "expense",
    amount: 18,
    category: "Transport",
    description: "Uber rides — weekend",
    date: dateStr(0, 9),
  },
  {
    txType: "expense",
    amount: 120,
    category: "Health",
    description: "Annual flu shot + vitamins",
    date: dateStr(-1, 10),
  },
];

// Unused export kept for potential future use
export const _currentMonth = `${y}-${String(m).padStart(2, "0")}`;
