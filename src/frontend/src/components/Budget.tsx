import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useMonthlyBudget,
  useMonthlyStats,
  useSetBudget,
} from "@/hooks/useQueries";
import {
  AlertTriangle,
  CheckCircle2,
  Loader2,
  Target,
  TrendingDown,
} from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
  }).format(amount);
}

export function Budget() {
  const { data: budget, isLoading: budgetLoading } = useMonthlyBudget();
  const { data: stats, isLoading: statsLoading } = useMonthlyStats();
  const setBudgetMutation = useSetBudget();

  const [budgetInput, setBudgetInput] = useState("");

  useEffect(() => {
    if (budget != null) {
      setBudgetInput(budget.toString());
    }
  }, [budget]);

  const spent = stats?.totalExpenses ?? 0;

  const budgetPercent = useMemo(() => {
    if (!budget || !spent) return 0;
    return Math.min((spent / budget) * 100, 100);
  }, [budget, spent]);

  const remaining = (budget ?? 0) - spent;

  // Color thresholds
  const {
    color,
    label,
    icon: Icon,
  } = useMemo(() => {
    if (budgetPercent >= 90) {
      return {
        color: "oklch(0.65 0.24 25)",
        label: "Critical — over 90% used",
        icon: AlertTriangle,
      };
    }
    if (budgetPercent >= 75) {
      return {
        color: "oklch(0.82 0.20 80)",
        label: "Warning — over 75% used",
        icon: AlertTriangle,
      };
    }
    return {
      color: "oklch(0.72 0.20 145)",
      label: "Healthy — under budget",
      icon: CheckCircle2,
    };
  }, [budgetPercent]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const parsed = Number.parseFloat(budgetInput);
    if (Number.isNaN(parsed) || parsed <= 0) {
      toast.error("Please enter a valid budget amount");
      return;
    }
    setBudgetMutation.mutate(parsed, {
      onSuccess: () => toast.success("Budget updated!"),
      onError: () => toast.error("Failed to update budget"),
    });
  }

  const isLoading = budgetLoading || statsLoading;

  const currentMonth = new Intl.DateTimeFormat("en-US", {
    month: "long",
    year: "numeric",
  }).format(new Date());

  return (
    <div className="space-y-8 animate-fade-in max-w-2xl">
      {/* Header */}
      <div>
        <h1 className="font-display text-3xl font-bold tracking-tight">
          Budget
        </h1>
        <p className="text-muted-foreground mt-1">{currentMonth}</p>
      </div>

      {/* Budget Progress Card */}
      {isLoading ? (
        <Skeleton className="h-64 rounded-xl" />
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <Card
            style={{
              background: "oklch(var(--card))",
              border: "1px solid oklch(var(--border))",
              boxShadow: "0 4px 24px rgba(0,0,0,0.3)",
            }}
          >
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="font-display text-xl flex items-center gap-2">
                  <Target className="w-5 h-5 text-primary" />
                  Monthly Budget
                </CardTitle>
                {budget != null && (
                  <div
                    className="flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full"
                    style={{
                      background: `${color}20`,
                      border: `1px solid ${color}40`,
                      color,
                    }}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    {label}
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {budget == null ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Target className="w-12 h-12 mx-auto mb-3 opacity-20" />
                  <p className="text-sm">No budget set yet.</p>
                  <p className="text-xs mt-1">
                    Set a monthly budget below to start tracking.
                  </p>
                </div>
              ) : (
                <>
                  {/* Big Numbers */}
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div
                      className="rounded-xl p-4"
                      style={{
                        background: "oklch(var(--secondary))",
                        border: "1px solid oklch(var(--border))",
                      }}
                    >
                      <p className="text-xs text-muted-foreground mb-1">
                        Budget
                      </p>
                      <p className="font-mono font-bold text-lg">
                        {formatCurrency(budget)}
                      </p>
                    </div>
                    <div
                      className="rounded-xl p-4"
                      style={{
                        background: "oklch(var(--secondary))",
                        border: `1px solid ${color}40`,
                      }}
                    >
                      <p className="text-xs text-muted-foreground mb-1">
                        Spent
                      </p>
                      <p
                        className="font-mono font-bold text-lg"
                        style={{ color }}
                      >
                        {formatCurrency(spent)}
                      </p>
                    </div>
                    <div
                      className="rounded-xl p-4"
                      style={{
                        background: "oklch(var(--secondary))",
                        border: "1px solid oklch(var(--border))",
                      }}
                    >
                      <p className="text-xs text-muted-foreground mb-1">
                        Remaining
                      </p>
                      <p
                        className="font-mono font-bold text-lg"
                        style={{
                          color:
                            remaining >= 0
                              ? "oklch(0.72 0.20 145)"
                              : "oklch(0.65 0.24 25)",
                        }}
                      >
                        {formatCurrency(remaining)}
                      </p>
                    </div>
                  </div>

                  {/* Progress */}
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <div className="flex items-center gap-2">
                        <TrendingDown className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">
                          Budget used
                        </span>
                      </div>
                      <span
                        className="font-mono font-semibold text-sm"
                        style={{ color }}
                      >
                        {budgetPercent.toFixed(1)}%
                      </span>
                    </div>
                    <div
                      className="relative h-3 rounded-full overflow-hidden"
                      style={{ background: "oklch(var(--muted))" }}
                    >
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${budgetPercent}%` }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                        className="absolute left-0 top-0 h-full rounded-full"
                        style={{
                          background: `linear-gradient(90deg, ${color}, ${color}cc)`,
                          boxShadow: `0 0 8px ${color}60`,
                        }}
                      />
                    </div>
                    {/* Threshold markers */}
                    <div className="flex justify-between text-xs text-muted-foreground mt-2">
                      <span>0%</span>
                      <span
                        className="relative"
                        style={{
                          left: `${Math.max(0, 75 - 3)}%`,
                          color: "oklch(0.82 0.20 80)",
                        }}
                      >
                        75%
                      </span>
                      <span
                        className="relative"
                        style={{ color: "oklch(0.65 0.24 25)" }}
                      >
                        90% · 100%
                      </span>
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Set Budget Form */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
      >
        <Card
          style={{
            background: "oklch(var(--card))",
            border: "1px solid oklch(var(--border))",
          }}
        >
          <CardHeader>
            <CardTitle className="font-display text-lg">
              {budget != null ? "Update Budget" : "Set Monthly Budget"}
            </CardTitle>
            <p className="text-muted-foreground text-sm">
              Define your spending limit for the month.
            </p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="flex gap-3">
              <div className="relative flex-1">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm font-mono">
                  $
                </span>
                <Input
                  data-ocid="budget.amount.input"
                  type="number"
                  step="0.01"
                  min="1"
                  placeholder="e.g. 2000.00"
                  value={budgetInput}
                  onChange={(e) => setBudgetInput(e.target.value)}
                  className="pl-7 font-mono"
                  required
                />
              </div>
              <Button
                type="submit"
                data-ocid="budget.save.submit_button"
                disabled={setBudgetMutation.isPending}
                style={{
                  background:
                    "linear-gradient(135deg, oklch(0.78 0.18 200), oklch(0.72 0.20 145))",
                  color: "oklch(0.06 0 0)",
                }}
              >
                {setBudgetMutation.isPending ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Saving…
                  </span>
                ) : (
                  "Save Budget"
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </motion.div>

      {/* Budget Tips */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2 }}
      >
        <Card
          style={{
            background: "oklch(var(--card))",
            border: "1px solid oklch(var(--border))",
          }}
        >
          <CardHeader>
            <CardTitle className="font-display text-base">
              Budget Tips
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3 text-sm text-muted-foreground">
              {[
                "The 50/30/20 rule: 50% on needs, 30% on wants, 20% on savings.",
                "Review your spending weekly to catch over-budget categories early.",
                "Set your budget at the start of each month to stay intentional.",
                "Use the category breakdown in Dashboard to find where you overspend.",
              ].map((tip) => (
                <li key={tip} className="flex items-start gap-2">
                  <span className="text-primary mt-0.5">•</span>
                  <span>{tip}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
