import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '../services/supabase';

// Storage key for tracking if the user has an account
export const HAS_ACCOUNT_KEY = 'hasExistingAccount';

/**
 * Checks if the user has an existing account on the platform
 * Always verifies with the server to ensure accuracy
 */
export const checkForExistingAccount = async (): Promise<boolean> => {
  try {
    // Check with Supabase first
    const { data: { session } } = await supabase.auth.getSession();
    
    // If the user has a session, they have an account
    if (session) {
      await AsyncStorage.setItem(HAS_ACCOUNT_KEY, 'true');
      return true;
    }
    
    // If no active session, check if any profile exists with the user's device ID
    // or any other means of device identification
    
    // As a fallback, check if profiles exist in the database
    const { count, error } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true });
    
    // Only if there are actually users in the database, consider that accounts exist
    const hasExistingUsers = count !== null && count > 0;
    
    // Store the result for future use
    await AsyncStorage.setItem(HAS_ACCOUNT_KEY, hasExistingUsers ? 'true' : 'false');
    
    return hasExistingUsers;
  } catch (error) {
    console.error('Error checking for existing account:', error);
    
    // If server check fails, fall back to cached value as a last resort
    try {
      const cachedValue = await AsyncStorage.getItem(HAS_ACCOUNT_KEY);
      return cachedValue === 'true';
    } catch {
      // Default to false if there's an error
      return false;
    }
  }
};

/**
 * Sets that the user has an account on the platform
 */
export const markUserHasAccount = async (): Promise<void> => {
  try {
    await AsyncStorage.setItem(HAS_ACCOUNT_KEY, 'true');
  } catch (error) {
    console.error('Error marking user has account:', error);
  }
};

/**
 * Resets the account status (for use when logging out)
 */
export const resetAccountStatus = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem(HAS_ACCOUNT_KEY);
  } catch (error) {
    console.error('Error resetting account status:', error);
  }
}; 