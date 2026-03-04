import { SEED_TRANSACTIONS } from "@/lib/seedData";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef } from "react";
import { useActor } from "./useActor";
import { QUERY_KEYS } from "./useQueries";

/**
 * Checks if the app has no transactions and seeds sample data on first load.
 */
export function useSeedData() {
  const { actor, isFetching } = useActor();
  const queryClient = useQueryClient();
  const seeded = useRef(false);

  useEffect(() => {
    if (!actor || isFetching || seeded.current) return;

    void (async () => {
      try {
        const existing = await actor.getAllTransactions();
        if (existing.length > 0) {
          seeded.current = true;
          return;
        }

        seeded.current = true;

        // Add seed transactions in parallel batches of 3
        for (let i = 0; i < SEED_TRANSACTIONS.length; i += 3) {
          const batch = SEED_TRANSACTIONS.slice(i, i + 3);
          await Promise.all(
            batch.map((tx) =>
              actor.addTransaction(
                tx.txType,
                tx.amount,
                tx.category,
                tx.description,
                tx.date,
              ),
            ),
          );
        }

        // Invalidate all queries to refetch with new data
        void queryClient.invalidateQueries({
          queryKey: QUERY_KEYS.transactions,
        });
        void queryClient.invalidateQueries({
          queryKey: QUERY_KEYS.monthlyStats,
        });
        void queryClient.invalidateQueries({
          queryKey: QUERY_KEYS.categoryStats,
        });
      } catch {
        // Silently fail — seed data is best-effort
      }
    })();
  }, [actor, isFetching, queryClient]);
}
