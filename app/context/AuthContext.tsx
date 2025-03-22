import React, { createContext, useState, useEffect, useContext } from 'react';
import { supabase } from '../services/supabase';
import { Session, User } from '@supabase/supabase-js';
import { User as AppUser } from '../types';
import { verifyCode, resendVerificationCode } from '../services/auth';
import { markUserHasAccount, resetAccountStatus } from '../utils/accountUtils';

type AuthContextType = {
  session: Session | null;
  user: User | null;
  profile: AppUser | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: any | null }>;
  signUp: (email: string, password: string, fullName: string) => Promise<{ error: any | null; userId?: string }>;
  verifySignUpCode: (email: string, code: string) => Promise<{ error: any | null; success?: boolean }>;
  resendCode: (email: string) => Promise<{ error: any | null }>;
  signOut: () => Promise<void>;
  updateProfile: (updates: Partial<AppUser>) => Promise<{ error: any | null }>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for an existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id);
      } else {
        setLoading(false);
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        await fetchProfile(session.user.id);
      } else {
        setProfile(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchProfile = async (userId: string) => {
    try {
      console.log('Fetching profile for user ID:', userId);
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.log('Profile fetch error:', error.message);
        
        // If profile doesn't exist, create one using user metadata
        if (error.code === 'PGRST116') { // No rows returned
          const { data: userData } = await supabase.auth.getUser();
          if (userData?.user) {
            console.log('Creating missing profile for user:', userId);
            
            // Create profile without returning option
            const { error: createError } = await supabase
              .from('profiles')
              .upsert({
                id: userId,
                email: userData.user.email || '',
                full_name: userData.user.user_metadata?.full_name || '',
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
              });
            
            if (createError) {
              console.error('Error creating missing profile:', createError);
            } else {
              console.log('Missing profile created successfully');
              // Fetch the newly created profile
              const { data: newProfile } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', userId)
                .single();
                
              if (newProfile) {
                setProfile(newProfile as AppUser);
              }
            }
          } else {
            console.error('No user data available to create profile');
            throw error;
          }
        } else {
          throw error;
        }
      } else if (data) {
        console.log('Profile found:', data.id);
        setProfile(data as AppUser);
      }
    } catch (error) {
      console.error('Error in fetchProfile:', error);
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      console.log('Attempting sign in for:', email);
      
      const { data, error } = await supabase.auth.signInWithPassword({ 
        email, 
        password 
      });
      
      if (error) {
        console.error('Sign in error:', error.message);
        return { error };
      }
      
      console.log('Sign in successful, user ID:', data.user?.id);
      
      // Mark that the user has an account on successful sign in
      await markUserHasAccount();
      
      // Check if the user has a profile and create one if needed
      if (data.user) {
        try {
          console.log('Checking for profile after login');
          const { data: profileData, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', data.user.id)
            .single();
            
          if (profileError || !profileData) {
            console.log('Profile not found after login, creating profile from metadata');
            
            // Create profile from user metadata
            await supabase.from('profiles').upsert({
              id: data.user.id,
              email: data.user.email || email,
              full_name: data.user.user_metadata?.full_name || '',
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            }, { onConflict: 'id' });
            
            console.log('Profile created during login');
          } else {
            console.log('Existing profile found:', profileData.id);
          }
        } catch (profileCheckError) {
          console.error('Error checking/creating profile during login:', profileCheckError);
        }
      }
      
      return { error: null };
    } catch (error) {
      console.error('Unexpected error during sign in:', error);
      return { error };
    }
  };

  const signUp = async (email: string, password: string, fullName: string) => {
    try {
      console.log('Creating temporary account for email:', email);
      // Create the auth user with Supabase
      const { data, error } = await supabase.auth.signUp({ 
        email, 
        password,
        options: {
          // Disable auto-confirmation email with link
          emailRedirectTo: undefined,
          data: {
            // Store full name in user metadata
            full_name: fullName,
            // Mark this as a temporary account that needs profile setup
            needs_profile_setup: true
          }
        }
      });

      // Don't create profile at this stage - we'll do that after password confirmation
      // Just return the user ID for tracking
      return { error, userId: data?.user?.id };
    } catch (error) {
      console.error('Error in signUp:', error);
      return { error };
    }
  };

  const verifySignUpCode = async (email: string, code: string): Promise<{ error: any | null; success?: boolean }> => {
    try {
      console.log('Verifying signup code for email:', email);
      const { success, error } = await verifyCode(email, code);
      
      if (error) {
        console.error('Code verification error:', error.message);
        return { error, success: false };
      }
      
      console.log('Code verified successfully');
      
      try {
        // No longer signing out after verification since display name is already collected
        // Simply return success
        return { error: null, success: true };
      } catch (innerError) {
        console.error('Error during post-verification process:', innerError);
        return { error: innerError, success: false };
      }
    } catch (error) {
      console.error('Error in verifySignUpCode:', error);
      return { error, success: false };
    }
  };

  const resendCode = async (email: string) => {
    try {
      // Try to resend verification code but don't report errors to the UI
      const { success, error } = await resendVerificationCode(email);
      if (error) {
        // Just log the error but return success to the caller
        console.error('Suppressed error sending verification code:', error.message);
        return { error: null };
      }
      return { error: null };
    } catch (error) {
      // Suppress all errors, just log them
      console.error('Caught and suppressed error in resendCode:', error);
      return { error: null };
    }
  };

  const signOut = async () => {
    try {
      // Always clear our local state first to ensure UI updates
      setSession(null);
      setUser(null);
      setProfile(null);
      
      // First check if profile exists - if not, this might be a deleted account
      const currentUser = user;
      if (currentUser) {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', currentUser.id)
          .single();
        
        // If profile doesn't exist, reset account status
        if (error || !data) {
          await resetAccountStatus();
        }
      }
      
      try {
        // Try to sign out from Supabase but don't let it block the UI flow
        await supabase.auth.signOut();
      } catch (signOutError: any) {
        // Just log the error but don't throw it or let it affect the user experience
        // This specifically handles "Auth session missing!" errors
        console.log('Note: Supabase signOut error (safe to ignore):', signOutError.message);
      }
    } catch (error) {
      console.error('Error in signOut process:', error);
      // Still throw this error since it's not a Supabase auth error but something else
      throw error;
    }
  };

  const updateProfile = async (updates: Partial<AppUser>) => {
    try {
      if (!user) throw new Error('No user logged in');

      const { error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', user.id);

      if (!error && profile) {
        setProfile({ ...profile, ...updates });
      }

      return { error };
    } catch (error) {
      return { error };
    }
  };

  const value = {
    session,
    user,
    profile,
    loading,
    signIn,
    signUp,
    signOut,
    updateProfile,
    verifySignUpCode,
    resendCode,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}; 