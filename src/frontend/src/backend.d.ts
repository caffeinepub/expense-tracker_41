import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface CategoryStat {
    total: number;
    category: string;
}
export interface UserProfile {
    name: string;
}
export interface Transaction {
    id: bigint;
    date: string;
    createdAt: bigint;
    description: string;
    category: string;
    txType: string;
    amount: number;
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    addTransaction(txType: string, amount: number, category: string, description: string, date: string): Promise<bigint>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    deleteTransaction(id: bigint): Promise<void>;
    getAllTransactions(): Promise<Array<Transaction>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getCategoryStats(): Promise<Array<CategoryStat>>;
    getMonthlyBudget(): Promise<number | null>;
    getMonthlyStats(): Promise<{
        balance: number;
        totalIncome: number;
        totalExpenses: number;
    }>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    setMonthlyBudget(budget: number): Promise<void>;
    updateTransaction(id: bigint, txType: string, amount: number, category: string, description: string, date: string): Promise<void>;
}
