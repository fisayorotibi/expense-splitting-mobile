export type User = {
  id: string;
  email: string;
  full_name: string;
  avatar_url?: string;
  created_at: string;
};

export type Group = {
  id: string;
  name: string;
  description?: string;
  created_by: string;
  created_at: string;
  avatar_url?: string;
};

export type GroupMember = {
  id: string;
  group_id: string;
  user_id: string;
  role: 'admin' | 'member';
  joined_at: string;
  user?: User;
};

export type Expense = {
  id: string;
  group_id: string;
  title: string;
  amount: number;
  currency: string;
  date: string;
  paid_by: string;
  category: string;
  split_type: 'equal' | 'exact' | 'percentage';
  created_at: string;
  receipt_url?: string;
  notes?: string;
  payer?: User;
};

export type ExpenseSplit = {
  id: string;
  expense_id: string;
  user_id: string;
  amount: number;
  paid: boolean;
  settled_at?: string;
  user?: User;
};

export type Settlement = {
  id: string;
  group_id: string;
  from_user_id: string;
  to_user_id: string;
  amount: number;
  currency: string;
  status: 'pending' | 'completed' | 'cancelled';
  created_at: string;
  completed_at?: string;
  from_user?: User;
  to_user?: User;
};

export type Category = {
  id: string;
  name: string;
  icon?: string;
};

export type Notification = {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: 'expense_added' | 'settlement_request' | 'settlement_completed' | 'group_invitation' | 'other';
  read: boolean;
  created_at: string;
  related_id?: string;
  related_type?: 'expense' | 'settlement' | 'group';
}; 