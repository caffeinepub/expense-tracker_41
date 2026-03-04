import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { useInternetIdentity } from "@/hooks/useInternetIdentity";
import { useTransactions } from "@/hooks/useQueries";
import { exportTransactionsCsv } from "@/lib/exportCsv";
import {
  ArrowLeftRight,
  ChevronRight,
  Download,
  LayoutDashboard,
  LogOut,
  Menu,
  Target,
  Wallet,
  X,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import { Budget } from "./Budget";
import { Dashboard } from "./Dashboard";
import { Transactions } from "./Transactions";

export type Page = "dashboard" | "transactions" | "budget";

interface NavItem {
  id: Page;
  label: string;
  icon: React.ReactNode;
  ocid: string;
}

const NAV_ITEMS: NavItem[] = [
  {
    id: "dashboard",
    label: "Dashboard",
    icon: <LayoutDashboard className="w-4 h-4" />,
    ocid: "nav.dashboard.link",
  },
  {
    id: "transactions",
    label: "Transactions",
    icon: <ArrowLeftRight className="w-4 h-4" />,
    ocid: "nav.transactions.link",
  },
  {
    id: "budget",
    label: "Budget",
    icon: <Target className="w-4 h-4" />,
    ocid: "nav.budget.link",
  },
];

export function AppLayout() {
  const { clear, identity } = useInternetIdentity();
  const [page, setPage] = useState<Page>("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { data: transactions = [] } = useTransactions();

  const principal = identity?.getPrincipal().toString();
  const shortPrincipal = principal
    ? `${principal.slice(0, 5)}…${principal.slice(-4)}`
    : "";

  function handleExport() {
    if (transactions.length === 0) {
      toast.error("No transactions to export");
      return;
    }
    exportTransactionsCsv(transactions);
    toast.success(`Exported ${transactions.length} transactions`);
  }

  function handleLogout() {
    clear();
    toast.success("Logged out successfully");
  }

  function navigateTo(newPage: Page) {
    setPage(newPage);
    setSidebarOpen(false);
  }

  return (
    <div className="min-h-screen bg-background flex">
      {/* Mobile overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-30 bg-black/60 backdrop-blur-sm lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.aside
        initial={false}
        animate={{ x: sidebarOpen ? 0 : undefined }}
        className={[
          "fixed lg:static inset-y-0 left-0 z-40",
          "w-64 flex flex-col",
          "lg:translate-x-0",
          !sidebarOpen && "-translate-x-full lg:translate-x-0",
          "transition-transform duration-300 ease-in-out",
        ].join(" ")}
        style={{
          background: "oklch(var(--sidebar))",
          borderRight: "1px solid oklch(var(--sidebar-border))",
        }}
      >
        {/* Logo */}
        <div className="flex items-center justify-between px-5 py-5">
          <div className="flex items-center gap-2.5">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{
                background:
                  "linear-gradient(135deg, oklch(0.78 0.18 200 / 0.25), oklch(0.72 0.20 145 / 0.2))",
                border: "1px solid oklch(0.78 0.18 200 / 0.3)",
              }}
            >
              <Wallet className="w-4 h-4 text-primary" />
            </div>
            <span className="font-display font-bold text-xl tracking-tight gradient-text">
              Expenzo
            </span>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden h-8 w-8"
            onClick={() => setSidebarOpen(false)}
          >
            <X className="w-4 h-4" />
          </Button>
        </div>

        <Separator style={{ background: "oklch(var(--sidebar-border))" }} />

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-1">
          <p className="text-xs font-semibold text-muted-foreground/60 uppercase tracking-wider px-2 mb-3">
            Menu
          </p>
          {NAV_ITEMS.map((item) => {
            const isActive = page === item.id;
            return (
              <button
                type="button"
                key={item.id}
                data-ocid={item.ocid}
                onClick={() => navigateTo(item.id)}
                className={[
                  "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150",
                  isActive
                    ? "text-sidebar-primary"
                    : "text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent/40",
                ].join(" ")}
                style={
                  isActive
                    ? {
                        background: "oklch(var(--sidebar-accent))",
                        border: "1px solid oklch(0.78 0.18 200 / 0.2)",
                        boxShadow: "0 0 12px oklch(0.78 0.18 200 / 0.08)",
                      }
                    : {}
                }
              >
                <span className={isActive ? "text-primary" : ""}>
                  {item.icon}
                </span>
                <span>{item.label}</span>
                {isActive && (
                  <ChevronRight className="w-3.5 h-3.5 ml-auto text-primary/60" />
                )}
              </button>
            );
          })}

          <div className="pt-4">
            <Separator style={{ background: "oklch(var(--sidebar-border))" }} />
          </div>

          {/* Export */}
          <div className="pt-2">
            <button
              type="button"
              data-ocid="export.csv.button"
              onClick={handleExport}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent/40"
            >
              <Download className="w-4 h-4" />
              Export CSV
            </button>
          </div>
        </nav>

        {/* User / Logout */}
        <div className="p-3">
          <div
            className="rounded-xl p-3"
            style={{
              background: "oklch(var(--sidebar-accent))",
              border: "1px solid oklch(var(--sidebar-border))",
            }}
          >
            <div className="flex items-center gap-2.5 mb-3">
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold"
                style={{
                  background:
                    "linear-gradient(135deg, oklch(0.78 0.18 200 / 0.3), oklch(0.72 0.20 145 / 0.2))",
                  border: "1px solid oklch(0.78 0.18 200 / 0.3)",
                  color: "oklch(0.78 0.18 200)",
                }}
              >
                {shortPrincipal ? shortPrincipal[0].toUpperCase() : "U"}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-foreground/80 truncate">
                  {shortPrincipal || "Connected"}
                </p>
                <p className="text-[10px] text-muted-foreground">
                  Internet Identity
                </p>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="w-full h-8 text-xs text-muted-foreground hover:text-destructive hover:border-destructive/50 transition-colors"
              onClick={handleLogout}
            >
              <LogOut className="w-3.5 h-3.5 mr-1.5" />
              Sign Out
            </Button>
          </div>
        </div>
      </motion.aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 lg:ml-0">
        {/* Top Header (mobile) */}
        <header
          className="lg:hidden sticky top-0 z-20 flex items-center justify-between px-4 py-3"
          style={{
            background: "oklch(var(--background) / 0.95)",
            borderBottom: "1px solid oklch(var(--border))",
            backdropFilter: "blur(12px)",
          }}
        >
          <button
            type="button"
            onClick={() => setSidebarOpen(true)}
            className="p-2 rounded-lg hover:bg-white/5 transition-colors"
          >
            <Menu className="w-5 h-5" />
          </button>
          <span className="font-display font-bold text-lg gradient-text">
            Expenzo
          </span>
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9 text-muted-foreground"
            onClick={handleExport}
            title="Export CSV"
          >
            <Download className="w-4 h-4" />
          </Button>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-6 lg:p-8 overflow-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={page}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
            >
              {page === "dashboard" && <Dashboard />}
              {page === "transactions" && <Transactions />}
              {page === "budget" && <Budget />}
            </motion.div>
          </AnimatePresence>
        </main>

        {/* Footer */}
        <footer className="px-6 py-4 text-center">
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()}. Built with ❤️ using{" "}
            <a
              href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              caffeine.ai
            </a>
          </p>
        </footer>
      </div>
    </div>
  );
}
