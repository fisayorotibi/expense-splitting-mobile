import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import { RootStackParamList } from '../../navigation/types';
import { useAuth } from '../../context/AuthContext';
import { colors, spacing, fontSizes, borderRadius, shadows } from '../../utils/theme';
import { Group, Expense, Settlement, Notification } from '../../types';
import { ScreenHeader } from '../../components/ScreenHeader';

type ActivityScreenNavigationProp = StackNavigationProp<RootStackParamList>;

// Define activity item structure
type ActivityItem = {
  id: string;
  type: 'expense' | 'settlement' | 'invitation' | 'notification';
  title: string;
  description: string;
  timestamp: string;
  read: boolean;
  relatedId?: string;
  amount?: number;
};

export default function ActivityScreen() {
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  
  const navigation = useNavigation<ActivityScreenNavigationProp>();
  const { user } = useAuth();

  useEffect(() => {
    fetchActivities();
  }, []);

  const fetchActivities = async () => {
    setLoading(true);
    try {
      // In a real app, this would fetch from the backend
      // For now, we'll use mock data
      const mockActivities: ActivityItem[] = [
        {
          id: '1',
          type: 'expense',
          title: 'New expense added',
          description: 'John added "Dinner at Lagos Restaurant" - ₦12,500.00',
          timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 minutes ago
          read: false,
          relatedId: 'exp-1',
          amount: 12500,
        },
        {
          id: '2',
          type: 'settlement',
          title: 'Settlement request',
          description: 'Sarah requested ₦7,200.00 for "Weekend grocery shopping"',
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2 hours ago
          read: true,
          relatedId: 'stl-1',
          amount: 7200,
        },
        {
          id: '3',
          type: 'invitation',
          title: 'Group invitation',
          description: 'Michael invited you to join "Lagos Foodies"',
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(), // 5 hours ago
          read: false,
          relatedId: 'grp-1',
        },
        {
          id: '4',
          type: 'expense',
          title: 'Expense updated',
          description: 'Chioma updated "Uber ride" amount to ₦3,800.00',
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 10).toISOString(), // 10 hours ago
          read: true,
          relatedId: 'exp-2',
          amount: 3800,
        },
        {
          id: '5',
          type: 'settlement',
          title: 'Settlement completed',
          description: 'You paid David ₦5,000.00',
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 1 day ago
          read: true,
          relatedId: 'stl-2',
          amount: 5000,
        },
        {
          id: '6',
          type: 'notification',
          title: 'Reminder',
          description: 'You have 3 unsettled expenses in "Office Lunch" group',
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 36).toISOString(), // 1.5 days ago
          read: true,
        },
      ];
      
      setActivities(mockActivities);
    } catch (error) {
      console.error('Error fetching activities:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchActivities();
  };

  const markAsRead = (activityId: string) => {
    // In a real app, this would update the backend
    setActivities(prev => 
      prev.map(activity => 
        activity.id === activityId 
          ? { ...activity, read: true } 
          : activity
      )
    );
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 60) {
      return `${diffMins} minute${diffMins !== 1 ? 's' : ''} ago`;
    } else if (diffHours < 24) {
      return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
    } else {
      return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'expense':
        return <Ionicons name="receipt-outline" size={24} color={colors.primary} />;
      case 'settlement':
        return <Ionicons name="cash-outline" size={24} color={colors.secondary} />;
      case 'invitation':
        return <Ionicons name="person-add-outline" size={24} color={colors.accent} />;
      case 'notification':
        return <Ionicons name="notifications-outline" size={24} color={colors.info} />;
      default:
        return <Ionicons name="ellipsis-horizontal" size={24} color={colors.gray[500]} />;
    }
  };

  const handleActivityPress = (activity: ActivityItem) => {
    markAsRead(activity.id);
    
    // Navigate based on activity type
    switch (activity.type) {
      case 'expense':
        if (activity.relatedId) {
          navigation.navigate('ExpenseStack', {
            screen: 'ExpenseDetails',
            params: { expenseId: activity.relatedId }
          });
        }
        break;
      case 'settlement':
        navigation.navigate('SettleUp', {});
        break;
      case 'invitation':
        if (activity.relatedId) {
          navigation.navigate('GroupStack', {
            screen: 'GroupDetails',
            params: { groupId: activity.relatedId }
          });
        }
        break;
      default:
        // Just mark as read for other types
        break;
    }
  };

  const renderActivityItem = ({ item }: { item: ActivityItem }) => (
    <TouchableOpacity
      style={[
        styles.activityItem,
        !item.read && styles.unreadActivity
      ]}
      onPress={() => handleActivityPress(item)}
    >
      <View style={styles.iconContainer}>
        {getActivityIcon(item.type)}
      </View>
      <View style={styles.activityContent}>
        <Text style={styles.activityTitle}>{item.title}</Text>
        <Text style={styles.activityDescription} numberOfLines={2}>
          {item.description}
        </Text>
        <Text style={styles.timestamp}>{formatTimestamp(item.timestamp)}</Text>
      </View>
      {!item.read && <View style={styles.unreadDot} />}
    </TouchableOpacity>
  );

  if (loading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <ScreenHeader
      title="Activity"
      headerSize="medium"
      titleAlignment="left"
      rightAction={{
        icon: 'filter-outline',
        onPress: () => Alert.alert('Filter', 'Filter functionality coming soon')
      }}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {activities.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="notifications-outline" size={64} color={colors.gray[400]} />
          <Text style={styles.emptyText}>No activity yet</Text>
          <Text style={styles.emptySubtext}>
            When you have new expenses, settlements, or notifications, 
            they will appear here.
          </Text>
        </View>
      ) : (
        <View style={styles.listContainer}>
          {activities.map(item => (
            <React.Fragment key={item.id}>
              {renderActivityItem({ item })}
            </React.Fragment>
          ))}
        </View>
      )}
    </ScreenHeader>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  listContent: {
    flexGrow: 1,
    padding: spacing.md,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background.primary,
  },
  activityItem: {
    flexDirection: 'row',
    padding: spacing.md,
    backgroundColor: colors.background.secondary,
    borderRadius: borderRadius.md,
    marginBottom: spacing.md,
    ...shadows.sm,
  },
  unreadActivity: {
    backgroundColor: colors.primary + '10', // 10% opacity of primary color
    borderLeftWidth: 3,
    borderLeftColor: colors.primary,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.background.tertiary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  activityContent: {
    flex: 1,
  },
  activityTitle: {
    fontSize: fontSizes.md,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: 2,
  },
  activityDescription: {
    fontSize: fontSizes.sm,
    color: colors.text.secondary,
    marginBottom: spacing.xs,
  },
  timestamp: {
    fontSize: fontSizes.xs,
    color: colors.text.tertiary,
  },
  unreadDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.primary,
    marginTop: spacing.xs,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
    marginTop: spacing.xxxl,
  },
  emptyText: {
    fontSize: fontSizes.lg,
    fontWeight: '600',
    color: colors.text.primary,
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
  emptySubtext: {
    fontSize: fontSizes.md,
    color: colors.text.secondary,
    textAlign: 'center',
    marginBottom: spacing.xl,
  },
  listContainer: {
    flex: 1,
  },
}); 