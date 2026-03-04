import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { CategoryStat, Transaction, UserProfile } from "../backend.d";
import { useActor } from "./useActor";

// ─── Query Keys ──────────────────────────────────────────────────────────────
export const QUERY_KEYS = {
  transactions: ["transactions"] as const,
  monthlyStats: ["monthlyStats"] as const,
  categoryStats: ["categoryStats"] as const,
  monthlyBudget: ["monthlyBudget"] as const,
  userProfile: ["userProfile"] as const,
};

// ─── Queries ─────────────────────────────────────────────────────────────────

export function useTransactions() {
  const { actor, isFetching } = useActor();
  return useQuery<Transaction[]>({
    queryKey: QUERY_KEYS.transactions,
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllTransactions();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useMonthlyStats() {
  const { actor, isFetching } = useActor();
  return useQuery<{
    balance: number;
    totalIncome: number;
    totalExpenses: number;
  }>({
    queryKey: QUERY_KEYS.monthlyStats,
    queryFn: async () => {
      if (!actor) return { balance: 0, totalIncome: 0, totalExpenses: 0 };
      return actor.getMonthlyStats();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useCategoryStats() {
  const { actor, isFetching } = useActor();
  return useQuery<CategoryStat[]>({
    queryKey: QUERY_KEYS.categoryStats,
    queryFn: async () => {
      if (!actor) return [];
      return actor.getCategoryStats();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useMonthlyBudget() {
  const { actor, isFetching } = useActor();
  return useQuery<number | null>({
    queryKey: QUERY_KEYS.monthlyBudget,
    queryFn: async () => {
      if (!actor) return null;
      return actor.getMonthlyBudget();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useUserProfile() {
  const { actor, isFetching } = useActor();
  return useQuery<UserProfile | null>({
    queryKey: QUERY_KEYS.userProfile,
    queryFn: async () => {
      if (!actor) return null;
      return actor.getCallerUserProfile();
    },
    enabled: !!actor && !isFetching,
  });
}

// ─── Mutations ───────────────────────────────────────────────────────────────

export function useAddTransaction() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      txType,
      amount,
      category,
      description,
      date,
    }: {
      txType: string;
      amount: number;
      category: string;
      description: string;
      date: string;
    }) => {
      if (!actor) throw new Error("Actor not available");
      return actor.addTransaction(txType, amount, category, description, date);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: QUERY_KEYS.transactions });
      void queryClient.invalidateQueries({ queryKey: QUERY_KEYS.monthlyStats });
      void queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.categoryStats,
      });
    },
  });
}

export function useUpdateTransaction() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      txType,
      amount,
      category,
      description,
      date,
    }: {
      id: bigint;
      txType: string;
      amount: number;
      category: string;
      description: string;
      date: string;
    }) => {
      if (!actor) throw new Error("Actor not available");
      return actor.updateTransaction(
        id,
        txType,
        amount,
        category,
        description,
        date,
      );
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: QUERY_KEYS.transactions });
      void queryClient.invalidateQueries({ queryKey: QUERY_KEYS.monthlyStats });
      void queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.categoryStats,
      });
    },
  });
}

export function useDeleteTransaction() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: bigint) => {
      if (!actor) throw new Error("Actor not available");
      return actor.deleteTransaction(id);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: QUERY_KEYS.transactions });
      void queryClient.invalidateQueries({ queryKey: QUERY_KEYS.monthlyStats });
      void queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.categoryStats,
      });
    },
  });
}

export function useSetBudget() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (budget: number) => {
      if (!actor) throw new Error("Actor not available");
      return actor.setMonthlyBudget(budget);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.monthlyBudget,
      });
    },
  });
}

export function useSaveProfile() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (profile: UserProfile) => {
      if (!actor) throw new Error("Actor not available");
      return actor.saveCallerUserProfile(profile);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: QUERY_KEYS.userProfile });
    },
  });
}
