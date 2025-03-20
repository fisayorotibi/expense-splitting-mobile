import 'react-native-url-polyfill/auto';
import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Linking from 'expo-linking';
import Constants from 'expo-constants';

// Auth configuration
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || 'https://xwjajxlbjwmkzzbtftse.supabase.co';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh3amFqeGxiandta3p6YnRmdHNlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDA2MTQ5NDYsImV4cCI6MjA1NjE5MDk0Nn0.niwEDZZ6C-3AMUL4MxYTNhlRI4m46FKpqQSpN76L9Ss';

// Get the redirect URL for auth callbacks
const getAuthRedirectUrl = () => {
  // For development in Expo Go
  if (Constants.appOwnership === 'expo') {
    return Linking.createURL('auth/callback');
  }
  
  // For standalone apps
  return Linking.createURL('auth/callback');
};

// Create Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true, // Important for email confirmation links
    flowType: 'pkce',
  },
});

// Configure the auth settings programmatically
export const configurePKCE = () => {
  // Log the redirect URL for debugging
  const redirectUrl = getAuthRedirectUrl();
  console.log('Auth redirect URL:', redirectUrl);
  
  // For Supabase auth, you need to set the redirect URL in the Supabase Dashboard
  // under Authentication > URL Configuration > Redirect URLs
};

/**
 * IMPORTANT: Supabase Auth Setup Instructions
 * --------------------------------------------
 * 1. Go to your Supabase project dashboard
 * 2. Navigate to Authentication → URL Configuration
 * 3. Set Site URL to your app's URL:
 *    - For Expo Go: exp://u.expo.dev or exp://localhost:...
 *    - For production: your app's scheme URL
 *    
 * 4. Add Redirect URLs:
 *    - For Expo Go: exp://u.expo.dev/auth/callback
 *    - For development with a specific IP: exp://192.168.x.x:PORT/auth/callback
 *    - For production: YOUR-SCHEME://auth/callback
 * 
 * 5. Go to Email Templates and update the confirmation email template:
 *    - For signup confirmation, use:
 *      {{ .SiteURL }}/auth/v1/verify?token={{ .TokenHash }}&type=signup&redirect_to={{ .RedirectTo }}
 *    
 *    - For password reset, use:
 *      {{ .SiteURL }}/auth/v1/verify?token={{ .TokenHash }}&type=recovery&redirect_to={{ .RedirectTo }}
 */

// Initialize auth configuration
configurePKCE();

/**
 * IMPORTANT: Configure Supabase Auth Redirect URLs
 * -------------------------------------------------
 * 1. Go to Supabase Dashboard > Authentication > URL Configuration
 * 2. Update Site URL to your app's URL:
 *    - For development: exp://YOUR-EXPO-IP:PORT (e.g., exp://192.168.1.2:19000)
 *    - For production: your app's production URL
 *
 * 3. Add Redirect URLs:
 *    - For development: exp://YOUR-EXPO-IP:PORT/auth/callback
 *    - For Expo Go: exp://u.expo.dev/auth/callback
 *    - For production: your-app-scheme://auth/callback
 *
 * For Email Auth:
 * 1. Go to Authentication > Email Templates
 * 2. For each template, update the action URL to include your redirect
 * 3. Use this format: {{ .SiteURL }}/auth/v1/callback?#access_token={{ .TokenHash }}&refresh_token={{ .RefreshTokenHash }}&expires_in={{ .ExpiresIn }}&token_type=bearer&type=recovery
 *
 * This will ensure email confirmation links redirect back to your app instead of localhost.
 */ 