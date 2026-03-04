import type { Transaction } from "@/backend.d";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useCategoryStats,
  useMonthlyBudget,
  useMonthlyStats,
  useTransactions,
} from "@/hooks/useQueries";
import { CATEGORY_NAMES, getCategoryConfig } from "@/lib/categories";
import {
  ArrowDownRight,
  ArrowUpRight,
  Target,
  TrendingDown,
  TrendingUp,
  Wallet,
} from "lucide-react";
import { motion } from "motion/react";
import { useMemo } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
  }).format(amount);
}

function formatDate(dateStr: string): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(dateStr));
}

// ─── Monthly Chart Data ───────────────────────────────────────────────────────

function useMonthlyChartData(transactions: Transaction[]) {
  return useMemo(() => {
    const months: { month: string; expenses: number; income: number }[] = [];
    const now = new Date();

    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      const label = d.toLocaleDateString("en-US", { month: "short" });

      const monthTxs = transactions.filter((tx) => tx.date.startsWith(key));
      const expenses = monthTxs
        .filter((tx) => tx.txType === "expense")
        .reduce((s, tx) => s + tx.amount, 0);
      const income = monthTxs
        .filter((tx) => tx.txType === "income")
        .reduce((s, tx) => s + tx.amount, 0);

      months.push({ month: label, expenses, income });
    }
    return months;
  }, [transactions]);
}

// ─── Components ──────────────────────────────────────────────────────────────

interface StatCardProps {
  title: string;
  value: string;
  icon: React.ReactNode;
  change?: string;
  changePositive?: boolean;
  accent?: string;
  "data-ocid"?: string;
}

function StatCard({
  title,
  value,
  icon,
  change,
  changePositive,
  accent = "oklch(0.78 0.18 200)",
  "data-ocid": dataOcid,
}: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <Card
        data-ocid={dataOcid}
        className="relative overflow-hidden"
        style={{
          background: "oklch(var(--card))",
          border: "1px solid oklch(var(--border))",
          boxShadow: "0 4px 24px rgba(0,0,0,0.3)",
        }}
      >
        <div
          className="absolute top-0 right-0 w-32 h-32 rounded-full -translate-y-1/2 translate-x-1/2 opacity-10 pointer-events-none"
          style={{ background: accent }}
        />
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            {title}
          </CardTitle>
          <div
            className="w-9 h-9 rounded-lg flex items-center justify-center"
            style={{
              background: `${accent}22`,
              border: `1px solid ${accent}33`,
            }}
          >
            <span style={{ color: accent }}>{icon}</span>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold font-mono tracking-tight">{value}</p>
          {change && (
            <p
              className={`text-xs mt-1 flex items-center gap-1 ${
                changePositive ? "text-emerald-400" : "text-red-400"
              }`}
            >
              {changePositive ? (
                <ArrowUpRight className="w-3 h-3" />
              ) : (
                <ArrowDownRight className="w-3 h-3" />
              )}
              {change}
            </p>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}

// ─── Custom Tooltip ───────────────────────────────────────────────────────────

interface TooltipPayloadEntry {
  name: string;
  value: number;
  color: string;
}

interface ChartTooltipProps {
  active?: boolean;
  payload?: TooltipPayloadEntry[];
  label?: string;
}

function DarkTooltip({ active, payload, label }: ChartTooltipProps) {
  if (!active || !payload?.length) return null;
  return (
    <div
      className="rounded-lg p-3 text-sm shadow-xl"
      style={{
        background: "oklch(0.13 0.005 240)",
        border: "1px solid oklch(0.22 0.005 240)",
      }}
    >
      {label && (
        <p className="text-muted-foreground mb-2 text-xs font-medium">
          {label}
        </p>
      )}
      {payload.map((entry) => (
        <p key={entry.name} className="flex items-center gap-2">
          <span
            className="w-2 h-2 rounded-full inline-block"
            style={{ background: entry.color }}
          />
          <span className="text-foreground/70">{entry.name}:</span>
          <span className="font-mono font-semibold text-foreground">
            {formatCurrency(entry.value)}
          </span>
        </p>
      ))}
    </div>
  );
}

interface PieTooltipProps {
  active?: boolean;
  payload?: Array<{ name: string; value: number; payload: { fill: string } }>;
}

function PieDarkTooltip({ active, payload }: PieTooltipProps) {
  if (!active || !payload?.length) return null;
  return (
    <div
      className="rounded-lg p-3 text-sm shadow-xl"
      style={{
        background: "oklch(0.13 0.005 240)",
        border: "1px solid oklch(0.22 0.005 240)",
      }}
    >
      <p className="flex items-center gap-2">
        <span
          className="w-2 h-2 rounded-full inline-block"
          style={{ background: payload[0].payload.fill }}
        />
        <span className="text-foreground/70">{payload[0].name}:</span>
        <span className="font-mono font-semibold">
          {formatCurrency(payload[0].value)}
        </span>
      </p>
    </div>
  );
}

// ─── Main Dashboard ───────────────────────────────────────────────────────────

export function Dashboard() {
  const { data: transactions = [], isLoading: txLoading } = useTransactions();
  const { data: stats, isLoading: statsLoading } = useMonthlyStats();
  const { data: categoryStats = [], isLoading: catLoading } =
    useCategoryStats();
  const { data: budget } = useMonthlyBudget();

  const monthlyData = useMonthlyChartData(transactions);

  // Recent 5 transactions sorted by date desc
  const recentTransactions = useMemo(() => {
    return [...transactions]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 5);
  }, [transactions]);

  // Pie chart data from category stats
  const pieData = useMemo(() => {
    return categoryStats
      .filter((c) => c.total > 0)
      .map((c) => ({
        name: c.category,
        value: c.total,
        fill: getCategoryConfig(c.category).chartColor,
      }));
  }, [categoryStats]);

  const budgetPercent = useMemo(() => {
    if (!budget || !stats?.totalExpenses) return 0;
    return Math.min((stats.totalExpenses / budget) * 100, 100);
  }, [budget, stats]);

  const budgetColor =
    budgetPercent >= 90
      ? "oklch(0.65 0.24 25)"
      : budgetPercent >= 75
        ? "oklch(0.82 0.20 55)"
        : "oklch(0.72 0.20 145)";

  const isLoading = txLoading || statsLoading || catLoading;

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="font-display text-3xl font-bold tracking-tight">
          Dashboard
        </h1>
        <p className="text-muted-foreground mt-1">
          {new Intl.DateTimeFormat("en-US", {
            month: "long",
            year: "numeric",
          }).format(new Date())}{" "}
          overview
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {isLoading ? (
          <>
            {["s1", "s2", "s3", "s4"].map((k) => (
              <Skeleton key={k} className="h-32 rounded-xl" />
            ))}
          </>
        ) : (
          <>
            <StatCard
              data-ocid="dashboard.balance.card"
              title="Total Balance"
              value={formatCurrency(stats?.balance ?? 0)}
              icon={<Wallet className="w-4 h-4" />}
              accent="oklch(0.78 0.18 200)"
              changePositive={(stats?.balance ?? 0) >= 0}
            />
            <StatCard
              data-ocid="dashboard.income.card"
              title="Monthly Income"
              value={formatCurrency(stats?.totalIncome ?? 0)}
              icon={<TrendingUp className="w-4 h-4" />}
              accent="oklch(0.72 0.20 145)"
              changePositive={true}
            />
            <StatCard
              data-ocid="dashboard.expenses.card"
              title="Monthly Expenses"
              value={formatCurrency(stats?.totalExpenses ?? 0)}
              icon={<TrendingDown className="w-4 h-4" />}
              accent="oklch(0.65 0.24 25)"
              changePositive={false}
            />
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.15 }}
            >
              <Card
                data-ocid="dashboard.budget.card"
                className="relative overflow-hidden"
                style={{
                  background: "oklch(var(--card))",
                  border: "1px solid oklch(var(--border))",
                  boxShadow: "0 4px 24px rgba(0,0,0,0.3)",
                }}
              >
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Budget
                  </CardTitle>
                  <div
                    className="w-9 h-9 rounded-lg flex items-center justify-center"
                    style={{
                      background: `${budgetColor}22`,
                      border: `1px solid ${budgetColor}33`,
                    }}
                  >
                    <Target
                      className="w-4 h-4"
                      style={{ color: budgetColor }}
                    />
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold font-mono tracking-tight">
                    {budget ? formatCurrency(budget) : "Not set"}
                  </p>
                  {budget && (
                    <div className="mt-3">
                      <div className="flex justify-between text-xs mb-1.5">
                        <span className="text-muted-foreground">
                          {formatCurrency(stats?.totalExpenses ?? 0)} used
                        </span>
                        <span style={{ color: budgetColor }}>
                          {budgetPercent.toFixed(0)}%
                        </span>
                      </div>
                      <Progress
                        value={budgetPercent}
                        className="h-1.5"
                        style={{
                          ["--progress-color" as string]: budgetColor,
                        }}
                      />
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </>
        )}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Bar Chart */}
        <motion.div
          className="xl:col-span-2"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card
            style={{
              background: "oklch(var(--card))",
              border: "1px solid oklch(var(--border))",
            }}
          >
            <CardHeader>
              <CardTitle className="font-display text-lg">
                Monthly Overview
              </CardTitle>
              <p className="text-muted-foreground text-sm">
                Income vs Expenses — last 6 months
              </p>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-56 w-full rounded-lg" />
              ) : (
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={monthlyData} barCategoryGap="30%">
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="oklch(0.22 0.005 240)"
                      vertical={false}
                    />
                    <XAxis
                      dataKey="month"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: "oklch(0.52 0 0)", fontSize: 12 }}
                    />
                    <YAxis
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: "oklch(0.52 0 0)", fontSize: 12 }}
                      tickFormatter={(v) => `$${v}`}
                    />
                    <Tooltip
                      content={<DarkTooltip />}
                      cursor={{ fill: "oklch(1 0 0 / 0.03)" }}
                    />
                    <Bar dataKey="income" name="Income" radius={[4, 4, 0, 0]}>
                      {monthlyData.map((entry) => (
                        <Cell
                          key={`income-${entry.month}`}
                          fill="oklch(0.72 0.20 145)"
                        />
                      ))}
                    </Bar>
                    <Bar
                      dataKey="expenses"
                      name="Expenses"
                      radius={[4, 4, 0, 0]}
                    >
                      {monthlyData.map((entry) => (
                        <Cell
                          key={`expenses-${entry.month}`}
                          fill="oklch(0.65 0.24 25)"
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              )}
              {/* Legend */}
              <div className="flex gap-6 mt-3 justify-center">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <span className="w-3 h-3 rounded-sm bg-emerald-500 inline-block" />
                  Income
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <span className="w-3 h-3 rounded-sm bg-red-500 inline-block" />
                  Expenses
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Donut Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card
            style={{
              background: "oklch(var(--card))",
              border: "1px solid oklch(var(--border))",
            }}
          >
            <CardHeader>
              <CardTitle className="font-display text-lg">
                By Category
              </CardTitle>
              <p className="text-muted-foreground text-sm">Expense breakdown</p>
            </CardHeader>
            <CardContent>
              {catLoading ? (
                <Skeleton className="h-44 w-full rounded-lg" />
              ) : pieData.length === 0 ? (
                <div className="h-44 flex items-center justify-center text-muted-foreground text-sm">
                  No expense data yet
                </div>
              ) : (
                <>
                  <ResponsiveContainer width="100%" height={180}>
                    <PieChart>
                      <Pie
                        data={pieData}
                        cx="50%"
                        cy="50%"
                        innerRadius={55}
                        outerRadius={80}
                        paddingAngle={2}
                        dataKey="value"
                      >
                        {pieData.map((entry) => (
                          <Cell
                            key={entry.name}
                            fill={entry.fill}
                            stroke="oklch(0.10 0 0)"
                            strokeWidth={2}
                          />
                        ))}
                      </Pie>
                      <Tooltip content={<PieDarkTooltip />} />
                    </PieChart>
                  </ResponsiveContainer>
                  {/* Legend */}
                  <div className="mt-2 space-y-1.5">
                    {pieData.slice(0, 5).map((item) => {
                      const total = pieData.reduce((s, c) => s + c.value, 0);
                      const pct = total
                        ? ((item.value / total) * 100).toFixed(0)
                        : "0";
                      return (
                        <div
                          key={item.name}
                          className="flex items-center justify-between text-xs"
                        >
                          <div className="flex items-center gap-2">
                            <span
                              className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                              style={{ background: item.fill }}
                            />
                            <span className="text-muted-foreground">
                              {item.name}
                            </span>
                          </div>
                          <span className="font-mono text-foreground/80">
                            {pct}%
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Recent Transactions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <Card
          style={{
            background: "oklch(var(--card))",
            border: "1px solid oklch(var(--border))",
          }}
        >
          <CardHeader>
            <CardTitle className="font-display text-lg">
              Recent Transactions
            </CardTitle>
            <p className="text-muted-foreground text-sm">
              Your latest 5 transactions
            </p>
          </CardHeader>
          <CardContent>
            {txLoading ? (
              <div className="space-y-3">
                {["r1", "r2", "r3", "r4"].map((k) => (
                  <Skeleton key={k} className="h-14 rounded-lg" />
                ))}
              </div>
            ) : recentTransactions.length === 0 ? (
              <div className="text-center py-10 text-muted-foreground">
                <Wallet className="w-10 h-10 mx-auto mb-3 opacity-30" />
                <p className="text-sm">No transactions yet</p>
              </div>
            ) : (
              <div className="space-y-2">
                {recentTransactions.map((tx) => {
                  const cat = getCategoryConfig(tx.category);
                  const isExpense = tx.txType === "expense";
                  return (
                    <div
                      key={tx.id.toString()}
                      className="flex items-center justify-between p-3 rounded-xl transition-colors hover:bg-white/[0.03]"
                      style={{ border: "1px solid oklch(var(--border))" }}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 text-sm ${cat.bgClass}`}
                        >
                          {getCategoryIcon(tx.category)}
                        </div>
                        <div>
                          <p className="text-sm font-medium leading-tight">
                            {tx.description}
                          </p>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className={`text-xs ${cat.textClass}`}>
                              {tx.category}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {formatDate(tx.date)}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <p
                          className={`font-mono font-semibold text-sm ${
                            isExpense ? "text-red-400" : "text-emerald-400"
                          }`}
                        >
                          {isExpense ? "-" : "+"}
                          {formatCurrency(tx.amount)}
                        </p>
                        <Badge
                          variant="outline"
                          className={`text-xs mt-1 ${isExpense ? "border-red-500/30 text-red-400" : "border-emerald-500/30 text-emerald-400"}`}
                        >
                          {tx.txType}
                        </Badge>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}

// ─── Category Icons ───────────────────────────────────────────────────────────

function getCategoryIcon(category: string): string {
  const icons: Record<string, string> = {
    Food: "🍔",
    Transport: "🚇",
    Housing: "🏠",
    Entertainment: "🎬",
    Health: "💊",
    Shopping: "🛍️",
    Salary: "💰",
    Other: "📦",
  };
  return icons[category] ?? "📦";
}

export { getCategoryIcon, CATEGORY_NAMES };
