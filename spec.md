# Expense Tracker

## Current State
New project. No existing code.

## Requested Changes (Diff)

### Add
- Full-featured expense tracker app with a modern black/dark theme
- User authentication via authorization component
- Dashboard with summary cards: total expenses, income, balance, and monthly spending
- Expense/income entry form: amount, category, description, date, type (expense/income)
- Transaction list with filtering by type (all/income/expense), category, and date range
- Category management: predefined categories (Food, Transport, Housing, Entertainment, Health, Shopping, Salary, Other)
- Monthly spending chart (bar chart showing spending per month)
- Category breakdown chart (pie/donut chart of expenses by category)
- Edit and delete transactions
- Budget tracking: set monthly budget and track progress
- CSV export of transactions
- Search transactions by description

### Modify
- None (new project)

### Remove
- None (new project)

## Implementation Plan
1. Backend (Motoko):
   - User-scoped data model for transactions: id, type (expense/income), amount, category, description, date, createdAt
   - CRUD operations: addTransaction, getTransactions, updateTransaction, deleteTransaction
   - Budget: setBudget, getBudget
   - Summary query: getMonthlyStats, getCategoryStats
2. Frontend:
   - Dark/black theme (OKLCH-based design tokens)
   - Auth guard wrapping main app
   - Dashboard page: summary cards + charts
   - Transactions page: list with filters/search + add/edit modal
   - Budget page: set budget, progress bar
   - CSV export utility
   - Responsive layout with sidebar navigation
