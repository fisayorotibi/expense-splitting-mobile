import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import { RootStackParamList } from '../../navigation/types';
import { useAuth } from '../../context/AuthContext';
import { colors, spacing, fontSizes, borderRadius } from '../../utils/theme';
import { Group } from '../../types';
import { Button } from '../../components/Button';

type AddExpenseScreenNavigationProp = StackNavigationProp<RootStackParamList>;

export default function AddExpenseScreen() {
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  
  const navigation = useNavigation<AddExpenseScreenNavigationProp>();
  const { user } = useAuth();

  useEffect(() => {
    fetchGroups();
  }, []);

  const fetchGroups = async () => {
    setLoading(true);
    try {
      // This would be a real query to Supabase in production
      // For now, set dummy data
      setGroups([
        {
          id: '1',
          name: 'Weekend Trip',
          description: 'Lagos beach weekend with friends',
          created_by: user?.id || '',
          created_at: new Date().toISOString(),
          avatar_url: 'https://example.com/trip.jpg'
        },
        {
          id: '2',
          name: 'Flatmates',
          description: 'Shared apartment expenses',
          created_by: '2',
          created_at: new Date().toISOString(),
          avatar_url: 'https://example.com/home.jpg'
        },
        {
          id: '3',
          name: 'Office Lunch',
          description: 'Weekday lunch rotation',
          created_by: user?.id || '',
          created_at: new Date().toISOString(),
          avatar_url: 'https://example.com/lunch.jpg'
        }
      ]);
    } catch (error) {
      console.error('Error fetching groups:', error);
    } finally {
      setLoading(false);
    }
  };

  const navigateToAddExpense = (groupId: string) => {
    navigation.navigate('ExpenseStack', { 
      screen: 'AddNewExpense',
      params: { groupId } 
    });
  };

  const navigateToCreateGroup = () => {
    navigation.navigate('GroupStack', { screen: 'CreateGroup' });
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Add an Expense</Text>
      <Text style={styles.subtitle}>Select a group to add an expense to:</Text>

      {groups.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="people-outline" size={64} color={colors.gray[400]} />
          <Text style={styles.emptyText}>You don't have any groups yet</Text>
          <Text style={styles.emptySubtext}>
            Create a group to start splitting expenses with friends
          </Text>
          <Button
            onPress={navigateToCreateGroup}
            style={styles.createGroupButton}
          >
            Create a Group
          </Button>
        </View>
      ) : (
        <View style={styles.groupsContainer}>
          {groups.map((group) => (
            <TouchableOpacity
              key={group.id}
              style={styles.groupCard}
              onPress={() => navigateToAddExpense(group.id)}
            >
              <View style={styles.groupCardContent}>
                {group.avatar_url ? (
                  <View style={styles.groupAvatarContainer}>
                    <Text style={styles.groupAvatarText}>{group.name.charAt(0)}</Text>
                  </View>
                ) : (
                  <View style={styles.groupAvatarContainer}>
                    <Text style={styles.groupAvatarText}>{group.name.charAt(0)}</Text>
                  </View>
                )}
                <View style={styles.groupInfo}>
                  <Text style={styles.groupName}>{group.name}</Text>
                  {group.description && (
                    <Text style={styles.groupDescription} numberOfLines={1}>
                      {group.description}
                    </Text>
                  )}
                </View>
                <Ionicons name="add-circle" size={28} color={colors.primary} />
              </View>
            </TouchableOpacity>
          ))}
        </View>
      )}

      <View style={styles.divider} />

      <View style={styles.quickAddSection}>
        <Text style={styles.sectionTitle}>Quick Add</Text>
        <Text style={styles.sectionSubtitle}>
          Add an expense without selecting a group:
        </Text>
        
        <Button
          onPress={() => navigateToAddExpense('')}
          style={styles.quickAddButton}
        >
          Add Personal Expense
        </Button>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  content: {
    padding: spacing.lg,
  },
  title: {
    fontSize: fontSizes.xxl,
    fontWeight: 'bold',
    color: colors.text.primary,
    marginBottom: spacing.sm,
  },
  subtitle: {
    fontSize: fontSizes.md,
    color: colors.text.secondary,
    marginBottom: spacing.lg,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xl,
    backgroundColor: colors.background.secondary,
    borderRadius: borderRadius.md,
    marginBottom: spacing.xl,
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
    paddingHorizontal: spacing.lg,
  },
  createGroupButton: {
    minWidth: '50%',
  },
  groupsContainer: {
    marginBottom: spacing.xl,
  },
  groupCard: {
    backgroundColor: colors.background.secondary,
    borderRadius: borderRadius.md,
    marginBottom: spacing.md,
    elevation: 2,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  groupCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
  },
  groupAvatarContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  groupAvatarText: {
    color: colors.white,
    fontSize: fontSizes.lg,
    fontWeight: 'bold',
  },
  groupInfo: {
    flex: 1,
  },
  groupName: {
    fontSize: fontSizes.md,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: 2,
  },
  groupDescription: {
    fontSize: fontSizes.sm,
    color: colors.text.secondary,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border.light,
    marginVertical: spacing.lg,
  },
  quickAddSection: {
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    fontSize: fontSizes.lg,
    fontWeight: 'bold',
    color: colors.text.primary,
    marginBottom: spacing.sm,
  },
  sectionSubtitle: {
    fontSize: fontSizes.md,
    color: colors.text.secondary,
    marginBottom: spacing.lg,
  },
  quickAddButton: {
    marginBottom: spacing.md,
  },
}); 