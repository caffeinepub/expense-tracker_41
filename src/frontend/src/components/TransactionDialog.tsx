import type { Transaction } from "@/backend.d";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { useAddTransaction, useUpdateTransaction } from "@/hooks/useQueries";
import { CATEGORY_NAMES } from "@/lib/categories";
import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

interface TransactionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingTransaction?: Transaction | null;
}

const today = new Date().toISOString().split("T")[0];

export function TransactionDialog({
  open,
  onOpenChange,
  editingTransaction,
}: TransactionDialogProps) {
  const isEditing = !!editingTransaction;

  const [txType, setTxType] = useState<"expense" | "income">("expense");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState(today);

  const addMutation = useAddTransaction();
  const updateMutation = useUpdateTransaction();
  const isPending = addMutation.isPending || updateMutation.isPending;

  // Reset/populate form when the dialog opens or the editing target changes
  useEffect(() => {
    if (!open) return;
    if (editingTransaction) {
      setTxType(editingTransaction.txType as "expense" | "income");
      setAmount(editingTransaction.amount.toString());
      setCategory(editingTransaction.category);
      setDescription(editingTransaction.description);
      setDate(editingTransaction.date);
    } else {
      setTxType("expense");
      setAmount("");
      setCategory("");
      setDescription("");
      setDate(today);
    }
  }, [editingTransaction, open]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const parsedAmount = Number.parseFloat(amount);
    if (!amount || Number.isNaN(parsedAmount) || parsedAmount <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }
    if (!category) {
      toast.error("Please select a category");
      return;
    }
    if (!description.trim()) {
      toast.error("Please enter a description");
      return;
    }
    if (!date) {
      toast.error("Please select a date");
      return;
    }

    if (isEditing && editingTransaction) {
      updateMutation.mutate(
        {
          id: editingTransaction.id,
          txType,
          amount: parsedAmount,
          category,
          description: description.trim(),
          date,
        },
        {
          onSuccess: () => {
            toast.success("Transaction updated!");
            onOpenChange(false);
          },
          onError: () => {
            toast.error("Failed to update transaction");
          },
        },
      );
    } else {
      addMutation.mutate(
        {
          txType,
          amount: parsedAmount,
          category,
          description: description.trim(),
          date,
        },
        {
          onSuccess: () => {
            toast.success("Transaction added!");
            onOpenChange(false);
          },
          onError: () => {
            toast.error("Failed to add transaction");
          },
        },
      );
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        data-ocid="transaction.form.dialog"
        className="sm:max-w-md"
        style={{
          background: "oklch(var(--card))",
          border: "1px solid oklch(var(--border))",
        }}
      >
        <DialogHeader>
          <DialogTitle className="font-display text-xl">
            {isEditing ? "Edit Transaction" : "Add Transaction"}
          </DialogTitle>
          <DialogDescription className="text-muted-foreground text-sm">
            {isEditing
              ? "Update the transaction details below."
              : "Fill in the details to add a new transaction."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5 mt-2">
          {/* Type Toggle */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Type</Label>
            <ToggleGroup
              data-ocid="transaction.type.toggle"
              type="single"
              value={txType}
              onValueChange={(v) => {
                if (v) setTxType(v as "expense" | "income");
              }}
              className="grid grid-cols-2 gap-2"
            >
              <ToggleGroupItem
                value="expense"
                className="h-10 data-[state=on]:bg-red-500/20 data-[state=on]:text-red-400 data-[state=on]:border-red-500/40 border"
                style={{ border: "1px solid oklch(var(--border))" }}
              >
                Expense
              </ToggleGroupItem>
              <ToggleGroupItem
                value="income"
                className="h-10 data-[state=on]:bg-emerald-500/20 data-[state=on]:text-emerald-400 data-[state=on]:border-emerald-500/40 border"
                style={{ border: "1px solid oklch(var(--border))" }}
              >
                Income
              </ToggleGroupItem>
            </ToggleGroup>
          </div>

          {/* Amount */}
          <div className="space-y-2">
            <Label htmlFor="tx-amount" className="text-sm font-medium">
              Amount
            </Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm font-mono">
                $
              </span>
              <Input
                id="tx-amount"
                data-ocid="transaction.amount.input"
                type="number"
                step="0.01"
                min="0.01"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="pl-7 font-mono"
                required
              />
            </div>
          </div>

          {/* Category */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Category</Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger
                data-ocid="transaction.category.select"
                className="w-full"
              >
                <SelectValue placeholder="Select category..." />
              </SelectTrigger>
              <SelectContent>
                {CATEGORY_NAMES.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="tx-desc" className="text-sm font-medium">
              Description
            </Label>
            <Input
              id="tx-desc"
              data-ocid="transaction.description.input"
              placeholder="What was this for?"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              maxLength={100}
              required
            />
          </div>

          {/* Date */}
          <div className="space-y-2">
            <Label htmlFor="tx-date" className="text-sm font-medium">
              Date
            </Label>
            <Input
              id="tx-date"
              data-ocid="transaction.date.input"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
              className="font-mono"
            />
          </div>

          <DialogFooter className="gap-2 mt-6">
            <Button
              type="button"
              variant="outline"
              data-ocid="transaction.cancel_button"
              onClick={() => onOpenChange(false)}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              data-ocid="transaction.submit_button"
              disabled={isPending}
              style={{
                background:
                  "linear-gradient(135deg, oklch(0.78 0.18 200), oklch(0.72 0.20 145))",
                color: "oklch(0.06 0 0)",
              }}
            >
              {isPending ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Saving…
                </span>
              ) : isEditing ? (
                "Update"
              ) : (
                "Add Transaction"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
