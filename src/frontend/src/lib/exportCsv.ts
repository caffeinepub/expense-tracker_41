import type { Transaction } from "@/backend.d";

export function exportTransactionsCsv(transactions: Transaction[]): void {
  if (transactions.length === 0) {
    return;
  }

  const headers = ["ID", "Date", "Type", "Category", "Description", "Amount"];
  const rows = transactions.map((tx) => [
    tx.id.toString(),
    tx.date,
    tx.txType,
    tx.category,
    `"${tx.description.replace(/"/g, '""')}"`,
    tx.amount.toFixed(2),
  ]);

  const csvContent = [headers.join(","), ...rows.map((r) => r.join(","))].join(
    "\n",
  );

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `expenzo-transactions-${new Date().toISOString().split("T")[0]}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
