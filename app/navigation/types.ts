import { NavigatorScreenParams } from '@react-navigation/native';

export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
  ForgotPassword: undefined;
  AuthCallback: { url?: string; code?: string };
  VerifyCode: { email: string; userId?: string };
};

export type MainTabParamList = {
  Home: undefined;
  Circles: undefined;
  Settle: undefined;
  Profile: undefined;
};

export type GroupStackParamList = {
  GroupsList: undefined;
  GroupDetails: { groupId: string };
  CreateGroup: undefined;
  EditGroup: { groupId: string };
  GroupMembers: { groupId: string };
  InviteMember: { groupId: string };
};

export type ExpenseStackParamList = {
  AddNewExpense: { groupId?: string };
  ExpenseDetails: { expenseId: string };
  EditExpense: { expenseId: string };
};

export type ProfileStackParamList = {
  ProfileMain: undefined;
  EditProfile: undefined;
  Settings: undefined;
  Notifications: undefined;
  Friends: undefined;
};

export type RootStackParamList = {
  Auth: NavigatorScreenParams<AuthStackParamList>;
  Main: NavigatorScreenParams<MainTabParamList>;
  GroupStack: NavigatorScreenParams<GroupStackParamList>;
  ExpenseStack: NavigatorScreenParams<ExpenseStackParamList>;
  ProfileStack: NavigatorScreenParams<ProfileStackParamList>;
  SettleUp: { groupId?: string };
}; 