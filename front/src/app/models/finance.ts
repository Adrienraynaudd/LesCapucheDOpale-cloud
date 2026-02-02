export interface Transaction {
  id: number;
  amount: number;
  description: string;
  date: string;
  total: number;
}

export interface FinanceStats {
  totalIncome: number;
  totalExpenses: number;
  balance: number;
  transactionCount: number;
}

export interface BalanceResponse {
  balance: number;
}

export interface HistoryResponse {
  transactions: Transaction[];
  totalCount: number;
  skip: number;
  take: number;
}

export interface CreateTransactionDto {
  amount: number;
  description: string;
}
