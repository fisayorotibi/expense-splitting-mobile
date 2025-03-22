import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  Image,
  RefreshControl,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import { RootStackParamList } from '../../navigation/types';
import { supabase } from '../../services/supabase';
import { useAuth } from '../../context/AuthContext';
import { colors, spacing, fontSizes, borderRadius, shadows } from '../../utils/theme';
import { Group } from '../../types';
import { ScreenHeader } from '../../components/ScreenHeader';

type GroupsScreenNavigationProp = StackNavigationProp<RootStackParamList>;

export default function GroupsScreen() {
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  
  const navigation = useNavigation<GroupsScreenNavigationProp>();
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
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchGroups();
  };

  const navigateToCreateGroup = () => {
    navigation.navigate('GroupStack', { screen: 'CreateGroup' });
  };

  const navigateToGroupDetails = (groupId: string) => {
    navigation.navigate('GroupStack', { 
      screen: 'GroupDetails',
      params: { groupId }
    });
  };

  const renderGroupItem = ({ item }: { item: Group }) => (
    <TouchableOpacity
      style={styles.groupCard}
      onPress={() => navigateToGroupDetails(item.id)}
    >
      <View style={styles.groupCardContent}>
        {item.avatar_url ? (
          <Image 
            source={{ uri: item.avatar_url }} 
            style={styles.groupAvatar} 
          />
        ) : (
          <View style={[styles.groupAvatar, styles.defaultAvatar]}>
            <Text style={styles.avatarText}>
              {item.name.charAt(0).toUpperCase()}
            </Text>
          </View>
        )}
        <View style={styles.groupInfo}>
          <Text style={styles.groupName}>{item.name}</Text>
          {item.description && (
            <Text style={styles.groupDescription} numberOfLines={1}>
              {item.description}
            </Text>
          )}
        </View>
        <Ionicons 
          name="chevron-forward" 
          size={24} 
          color={colors.gray[400]} 
        />
      </View>
    </TouchableOpacity>
  );

  if (loading && !refreshing && groups.length === 0) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <ScreenHeader
      title="My Circles"
      headerSize="medium"
      titleAlignment="left"
      rightAction={{
        icon: 'add-outline',
        onPress: navigateToCreateGroup
      }}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {groups.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons 
            name="people-outline" 
            size={64} 
            color={colors.gray[400]} 
          />
          <Text style={styles.emptyText}>You don't have any groups yet</Text>
          <Text style={styles.emptySubtext}>
            Create a group to start splitting expenses with friends
          </Text>
          <TouchableOpacity
            style={styles.createGroupButton}
            onPress={navigateToCreateGroup}
          >
            <Text style={styles.createGroupButtonText}>Create a Group</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.groupsList}>
          {groups.map(group => (
            <React.Fragment key={group.id}>
              {renderGroupItem({ item: group })}
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
    padding: spacing.lg,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background.primary,
  },
  groupCard: {
    backgroundColor: colors.background.secondary,
    borderRadius: borderRadius.md,
    marginBottom: spacing.md,
    ...shadows.sm,
  },
  groupCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
  },
  groupAvatar: {
    width: 50,
    height: 50,
    borderRadius: borderRadius.round,
    marginRight: spacing.md,
  },
  defaultAvatar: {
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: colors.white,
    fontSize: fontSizes.xl,
    fontWeight: 'bold',
  },
  groupInfo: {
    flex: 1,
  },
  groupName: {
    fontSize: fontSizes.lg,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: 2,
  },
  groupDescription: {
    fontSize: fontSizes.sm,
    color: colors.text.secondary,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
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
  createGroupButton: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: borderRadius.md,
  },
  createGroupButtonText: {
    color: colors.white,
    fontSize: fontSizes.md,
    fontWeight: '600',
  },
  fab: {
    position: 'absolute',
    bottom: spacing.xl,
    right: spacing.xl,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    ...shadows.lg,
  },
  groupsList: {
    flex: 1,
  },
}); 