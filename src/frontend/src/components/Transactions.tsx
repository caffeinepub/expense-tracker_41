import type { Transaction } from "@/backend.d";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useDeleteTransaction, useTransactions } from "@/hooks/useQueries";
import { CATEGORY_NAMES, getCategoryConfig } from "@/lib/categories";
import { ChevronDown, Pencil, Plus, Search, Trash2 } from "lucide-react";
import { motion } from "motion/react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { DeleteDialog } from "./DeleteDialog";
import { TransactionDialog } from "./TransactionDialog";

const PAGE_SIZE = 10;

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

export function Transactions() {
  const { data: transactions = [], isLoading } = useTransactions();
  const deleteMutation = useDeleteTransaction();

  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingTx, setEditingTx] = useState<Transaction | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<bigint | null>(null);

  // Filter
  const filtered = useMemo(() => {
    return [...transactions]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .filter((tx) => {
        const matchSearch =
          !search ||
          tx.description.toLowerCase().includes(search.toLowerCase());
        const matchType = typeFilter === "all" || tx.txType === typeFilter;
        const matchCat =
          categoryFilter === "all" || tx.category === categoryFilter;
        return matchSearch && matchType && matchCat;
      });
  }, [transactions, search, typeFilter, categoryFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safeCurrentPage = Math.min(page, totalPages);
  const paginated = filtered.slice(
    (safeCurrentPage - 1) * PAGE_SIZE,
    safeCurrentPage * PAGE_SIZE,
  );

  function handleAddClick() {
    setEditingTx(null);
    setDialogOpen(true);
  }

  function handleEditClick(tx: Transaction) {
    setEditingTx(tx);
    setDialogOpen(true);
  }

  function handleDeleteClick(id: bigint) {
    setDeletingId(id);
    setDeleteDialogOpen(true);
  }

  function confirmDelete() {
    if (!deletingId) return;
    deleteMutation.mutate(deletingId, {
      onSuccess: () => {
        toast.success("Transaction deleted");
        setDeleteDialogOpen(false);
        setDeletingId(null);
      },
      onError: () => {
        toast.error("Failed to delete transaction");
      },
    });
  }

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

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold tracking-tight">
            Transactions
          </h1>
          <p className="text-muted-foreground mt-1">
            {filtered.length} transaction{filtered.length !== 1 ? "s" : ""}
          </p>
        </div>
        <Button
          data-ocid="transactions.add.button"
          onClick={handleAddClick}
          style={{
            background:
              "linear-gradient(135deg, oklch(0.78 0.18 200), oklch(0.72 0.20 145))",
            color: "oklch(0.06 0 0)",
          }}
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Transaction
        </Button>
      </div>

      {/* Filters */}
      <div
        className="flex flex-col sm:flex-row gap-3 p-4 rounded-xl"
        style={{
          background: "oklch(var(--card))",
          border: "1px solid oklch(var(--border))",
        }}
      >
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            data-ocid="transactions.search.input"
            placeholder="Search transactions…"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="pl-9"
          />
        </div>

        {/* Type Filter */}
        <Select
          value={typeFilter}
          onValueChange={(v) => {
            setTypeFilter(v);
            setPage(1);
          }}
        >
          <SelectTrigger
            data-ocid="transactions.type.select"
            className="w-full sm:w-36"
          >
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="income">Income</SelectItem>
            <SelectItem value="expense">Expense</SelectItem>
          </SelectContent>
        </Select>

        {/* Category Filter */}
        <Select
          value={categoryFilter}
          onValueChange={(v) => {
            setCategoryFilter(v);
            setPage(1);
          }}
        >
          <SelectTrigger
            data-ocid="transactions.category.select"
            className="w-full sm:w-44"
          >
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {CATEGORY_NAMES.map((cat) => (
              <SelectItem key={cat} value={cat}>
                {cat}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <div
        className="rounded-xl overflow-hidden"
        style={{
          background: "oklch(var(--card))",
          border: "1px solid oklch(var(--border))",
        }}
      >
        {isLoading ? (
          <div className="p-4 space-y-3">
            {["sk1", "sk2", "sk3", "sk4", "sk5", "sk6"].map((k) => (
              <Skeleton key={k} className="h-14 rounded-lg" />
            ))}
          </div>
        ) : paginated.length === 0 ? (
          <div
            data-ocid="transactions.empty_state"
            className="text-center py-16 text-muted-foreground"
          >
            <ChevronDown className="w-10 h-10 mx-auto mb-3 opacity-20" />
            <p className="text-sm">No transactions match your filters</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow
                style={{ borderBottom: "1px solid oklch(var(--border))" }}
                className="hover:bg-transparent"
              >
                <TableHead className="text-muted-foreground font-medium">
                  Description
                </TableHead>
                <TableHead className="text-muted-foreground font-medium">
                  Category
                </TableHead>
                <TableHead className="text-muted-foreground font-medium">
                  Date
                </TableHead>
                <TableHead className="text-muted-foreground font-medium text-right">
                  Amount
                </TableHead>
                <TableHead className="text-muted-foreground font-medium text-right w-24">
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginated.map((tx, i) => {
                const cat = getCategoryConfig(tx.category);
                const isExpense = tx.txType === "expense";
                const rowIndex = (safeCurrentPage - 1) * PAGE_SIZE + i + 1;
                return (
                  <motion.tr
                    key={tx.id.toString()}
                    data-ocid={`transactions.item.${rowIndex}`}
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.03 }}
                    className="group hover:bg-white/[0.025] transition-colors"
                    style={{
                      borderBottom: "1px solid oklch(var(--border) / 0.5)",
                    }}
                  >
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <span className="text-lg leading-none">
                          {getCategoryIcon(tx.category)}
                        </span>
                        <span className="font-medium text-sm leading-tight">
                          {tx.description}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={`text-xs ${cat.textClass}`}
                        style={{ borderColor: `${cat.chartColor}40` }}
                      >
                        {tx.category}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {formatDate(tx.date)}
                    </TableCell>
                    <TableCell className="text-right">
                      <span
                        className={`font-mono font-semibold text-sm ${
                          isExpense ? "text-red-400" : "text-emerald-400"
                        }`}
                      >
                        {isExpense ? "−" : "+"}
                        {formatCurrency(tx.amount)}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button
                          variant="ghost"
                          size="icon"
                          data-ocid={`transactions.edit_button.${rowIndex}`}
                          onClick={() => handleEditClick(tx)}
                          className="h-8 w-8 text-muted-foreground hover:text-foreground"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          data-ocid={`transactions.delete_button.${rowIndex}`}
                          onClick={() => handleDeleteClick(tx.id)}
                          className="h-8 w-8 text-muted-foreground hover:text-destructive"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </TableCell>
                  </motion.tr>
                );
              })}
            </TableBody>
          </Table>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                data-ocid="transactions.pagination_prev"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className={
                  safeCurrentPage <= 1
                    ? "pointer-events-none opacity-50"
                    : "cursor-pointer"
                }
                href="#"
              />
            </PaginationItem>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(
              (pageNum) => (
                <PaginationItem key={`page-${pageNum}`}>
                  <PaginationLink
                    href="#"
                    isActive={safeCurrentPage === pageNum}
                    onClick={(e) => {
                      e.preventDefault();
                      setPage(pageNum);
                    }}
                  >
                    {pageNum}
                  </PaginationLink>
                </PaginationItem>
              ),
            )}
            <PaginationItem>
              <PaginationNext
                data-ocid="transactions.pagination_next"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                className={
                  safeCurrentPage >= totalPages
                    ? "pointer-events-none opacity-50"
                    : "cursor-pointer"
                }
                href="#"
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}

      {/* Dialogs */}
      <TransactionDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        editingTransaction={editingTx}
      />
      <DeleteDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={confirmDelete}
        isPending={deleteMutation.isPending}
      />
    </div>
  );
}
