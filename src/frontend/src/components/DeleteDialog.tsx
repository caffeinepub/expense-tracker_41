import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Loader2, Trash2 } from "lucide-react";

interface DeleteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  isPending?: boolean;
  description?: string;
}

export function DeleteDialog({
  open,
  onOpenChange,
  onConfirm,
  isPending = false,
  description = "This action cannot be undone.",
}: DeleteDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent
        data-ocid="delete.confirm.dialog"
        style={{
          background: "oklch(var(--card))",
          border: "1px solid oklch(var(--border))",
        }}
      >
        <AlertDialogHeader>
          <div className="flex items-center gap-3 mb-1">
            <div className="w-10 h-10 rounded-lg bg-destructive/20 border border-destructive/30 flex items-center justify-center">
              <Trash2 className="w-5 h-5 text-destructive" />
            </div>
            <AlertDialogTitle className="font-display text-lg">
              Delete Transaction
            </AlertDialogTitle>
          </div>
          <AlertDialogDescription className="text-muted-foreground text-sm">
            {description} Are you sure you want to delete this transaction?
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel
            data-ocid="delete.cancel_button"
            disabled={isPending}
          >
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            data-ocid="delete.confirm_button"
            onClick={onConfirm}
            disabled={isPending}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {isPending ? (
              <span className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                Deleting…
              </span>
            ) : (
              "Delete"
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
