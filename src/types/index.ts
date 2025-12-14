export interface ExpenseType {
  id: string;
  name: string;
  type: string;
  updated_at: string;
  created_at?: string;
  amount: number;
  cashFlowType: "income" | "expense";
  transactionMode?: string;
  user_id?: string;
  collection_id?: string;
  datetime?: any; // keeping as any for now as it comes from firestore Timestamp often
}

export interface CollectionType {
  id: string;
  name: string;
  user_id: string;
  created_at: string;
  updated_at: string;
  balance?: number;
}
