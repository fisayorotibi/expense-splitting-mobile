import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Alert
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../navigation/types';
import { supabase } from '../../services/supabase';
import { useAuth } from '../../context/AuthContext';
import { colors, spacing, fontSizes, borderRadius, shadows } from '../../utils/theme';
import { ExpenseSplit, Settlement } from '../../types';
import { Ionicons } from '@expo/vector-icons';
import { ScreenHeader } from '../../components/ScreenHeader';
import EqualizeLogoSvg from '../../assets/svg/EqualizeLogoSvg';

type HomeScreenNavigationProp = StackNavigationProp<RootStackParamList>;

export default function HomeScreen() {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [balances, setBalances] = useState<{[key: string]: number}>({});
  const [pendingSettlements, setPendingSettlements] = useState<Settlement[]>([]);
  const [recentExpenses, setRecentExpenses] = useState<ExpenseSplit[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<string | null>(null);
  
  const navigation = useNavigation<HomeScreenNavigationProp>();
  const { user } = useAuth();

  // Test Supabase connection
  const testConnection = async () => {
    setIsLoading(true);
    try {
      // Simple query to test connection
      const { data, error } = await supabase.from('profiles').select('*').limit(1);
      
      if (error) {
        console.error('Supabase connection error:', error.message);
        setConnectionStatus(`Connection error: ${error.message}`);
      } else {
        console.log('Supabase connection successful');
        // Don't set the success message when connected
        setConnectionStatus(null);
      }
    } catch (error) {
      console.error('Error:', error);
      setConnectionStatus(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    testConnection();
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    
    try {
      await Promise.all([
        fetchBalances(),
        fetchPendingSettlements(),
        fetchRecentExpenses()
      ]);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  const fetchBalances = async () => {
    // This would typically be a server-side function or complex query
    // For now, we'll just set dummy data
    setBalances({
      'total': 25000, // 250 NGN
      'owed': 15000,  // 150 NGN
      'you_owe': 10000, // 100 NGN
    });
  };

  const fetchPendingSettlements = async () => {
    // This would be a real query to Supabase
    // For now, set dummy data
    setPendingSettlements([
      {
        id: '1',
        group_id: '1',
        from_user_id: '2',
        to_user_id: user?.id || '',
        amount: 5000,
        currency: 'NGN',
        status: 'pending',
        created_at: new Date().toISOString(),
        from_user: {
          id: '2',
          email: 'friend@example.com',
          full_name: 'John Friend',
          created_at: new Date().toISOString(),
        }
      },
      {
        id: '2',
        group_id: '2',
        from_user_id: user?.id || '',
        to_user_id: '3',
        amount: 10000,
        currency: 'NGN',
        status: 'pending',
        created_at: new Date().toISOString(),
        to_user: {
          id: '3',
          email: 'colleague@example.com',
          full_name: 'Jane Colleague',
          created_at: new Date().toISOString(),
        }
      }
    ]);
  };

  const fetchRecentExpenses = async () => {
    // This would be a real query to Supabase
    // For now, set dummy data
    setRecentExpenses([
      {
        id: '1',
        expense_id: '101',
        user_id: user?.id || '',
        amount: 3000,
        paid: false,
        settled_at: undefined,
      },
      {
        id: '2',
        expense_id: '102',
        user_id: user?.id || '',
        amount: 7000,
        paid: true,
        settled_at: new Date().toISOString(),
      }
    ]);
  };

  const formatCurrency = (amount: number) => {
    return `₦${(amount / 100).toFixed(2)}`;
  };
  
  const handleAddExpense = () => {
    navigation.navigate('ExpenseStack', { 
      screen: 'AddNewExpense',
      params: {} // Add required params object
    });
  };

  const handleNotificationsPress = () => {
    // This would navigate to notifications
    // But for now just show an alert since the screen doesn't exist
    Alert.alert('Notifications', 'Notifications screen coming soon');
  };

  if (loading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <ScreenHeader
      title=""
      headerSize="medium"
      rightAction={{
        icon: 'notifications-outline',
        onPress: handleNotificationsPress
      }}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
      logoComponent={<EqualizeLogoSvg width={75} height={20} color={colors.text.primary} />}
    >
      {/* Balance Summary */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Summary</Text>
        <View style={styles.balanceCards}>
          <View style={[styles.balanceCard, { backgroundColor: colors.primary }]}>
            <Text style={styles.balanceLabel}>Total Balance</Text>
            <Text style={styles.balanceAmount}>{formatCurrency(balances.total || 0)}</Text>
          </View>
          <View style={[styles.balanceCard, { backgroundColor: colors.secondary }]}>
            <Text style={styles.balanceLabel}>Owed to You</Text>
            <Text style={styles.balanceAmount}>{formatCurrency(balances.owed || 0)}</Text>
          </View>
          <View style={[styles.balanceCard, { backgroundColor: colors.accent }]}>
            <Text style={styles.balanceLabel}>You Owe</Text>
            <Text style={styles.balanceAmount}>{formatCurrency(balances.you_owe || 0)}</Text>
          </View>
        </View>
      </View>

      {/* Pending Settlements */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Pending Settlements</Text>
          <TouchableOpacity onPress={() => navigation.navigate('SettleUp', {})}>
            <Text style={styles.seeAllLink}>Settle Up</Text>
          </TouchableOpacity>
        </View>

        {pendingSettlements.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>No pending settlements</Text>
          </View>
        ) : (
          pendingSettlements.slice(0, 3).map((settlement, index) => (
            <TouchableOpacity 
              key={settlement.id || index} 
              style={styles.settlementItem}
              onPress={() => navigation.navigate('SettleUp', { groupId: settlement.group_id })}
            >
              <View style={styles.settlementDetail}>
                <Text style={styles.settlementTitle}>
                  {settlement.from_user_id === user?.id 
                    ? `You owe ${settlement.to_user?.full_name || 'someone'}`
                    : `${settlement.from_user?.full_name || 'Someone'} owes you`
                  }
                </Text>
                <Text style={styles.settlementDate}>
                  {new Date(settlement.created_at).toLocaleDateString()}
                </Text>
              </View>
              <Text style={[
                styles.settlementAmount,
                { color: settlement.from_user_id === user?.id ? colors.accent : colors.secondary }
              ]}>
                {formatCurrency(settlement.amount)}
              </Text>
            </TouchableOpacity>
          ))
        )}
      </View>

      {/* Quick Actions */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.actionButtons}>
          <TouchableOpacity 
            style={[styles.actionButton, {backgroundColor: colors.primary}]}
            onPress={handleAddExpense}
          >
            <Ionicons name="add" size={20} color={colors.white} style={styles.actionIcon} />
            <Text style={styles.actionButtonText}>Add Expense</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.actionButton, {backgroundColor: colors.secondary}]}
            onPress={() => navigation.navigate('GroupStack', { screen: 'CreateGroup' })}
          >
            <Ionicons name="people" size={20} color={colors.white} style={styles.actionIcon} />
            <Text style={styles.actionButtonText}>Create Group</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScreenHeader>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  contentContainer: {
    padding: spacing.lg,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background.primary,
  },
  section: {
    marginBottom: spacing.xl,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  sectionTitle: {
    fontSize: fontSizes.lg,
    fontWeight: 'bold',
    color: colors.text.primary,
    marginBottom: spacing.sm,
  },
  seeAllLink: {
    color: colors.primary,
    fontSize: fontSizes.sm,
  },
  balanceCards: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  balanceCard: {
    flex: 1,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginHorizontal: spacing.xs,
    ...shadows.md,
    alignItems: 'center',
  },
  balanceLabel: {
    color: colors.white,
    fontSize: fontSizes.xs,
    marginBottom: spacing.xs,
  },
  balanceAmount: {
    color: colors.white,
    fontSize: fontSizes.lg,
    fontWeight: 'bold',
  },
  emptyState: {
    padding: spacing.lg,
    backgroundColor: colors.background.secondary,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.sm,
  },
  emptyStateText: {
    color: colors.text.secondary,
    fontSize: fontSizes.md,
  },
  settlementItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.md,
    backgroundColor: colors.background.secondary,
    borderRadius: borderRadius.md,
    marginBottom: spacing.sm,
    ...shadows.sm,
  },
  settlementDetail: {
    flex: 1,
  },
  settlementTitle: {
    fontSize: fontSizes.md,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  settlementDate: {
    fontSize: fontSizes.xs,
    color: colors.text.tertiary,
  },
  settlementAmount: {
    fontSize: fontSizes.lg,
    fontWeight: 'bold',
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionButton: {
    flex: 1,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    marginHorizontal: spacing.xs,
    ...shadows.sm,
  },
  actionButtonText: {
    color: colors.white,
    fontSize: fontSizes.md,
    fontWeight: '600',
  },
  actionIcon: {
    marginRight: spacing.sm,
  },
}); 