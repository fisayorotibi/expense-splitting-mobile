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
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        throw error;
      }

      if (data) {
        setProfile(data as AppUser);
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({ 
        email, 
        password 
      });
      
      if (!error) {
        // Mark that the user has an account on successful sign in
        await markUserHasAccount();
      }
      
      return { error };
    } catch (error) {
      return { error };
    }
  };

  const signUp = async (email: string, password: string, fullName: string) => {
    try {
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
          }
        }
      });

      // If user creation is successful, create a profile entry
      if (!error && data.user) {
        // Create the profile with all relevant user data
        const { error: profileError } = await supabase.from('profiles').insert({
          id: data.user.id,
          email,
          full_name: fullName,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });

        if (profileError) {
          console.error('Profile creation error:', profileError);
          return { error: profileError, userId: data.user.id };
        }
      }

      return { error, userId: data?.user?.id };
    } catch (error) {
      console.error('Error in signUp:', error);
      return { error };
    }
  };

  const verifySignUpCode = async (email: string, code: string): Promise<{ error: any | null; success?: boolean }> => {
    try {
      const { success, error } = await verifyCode(email, code);
      
      if (error) {
        return { error, success: false };
      }
      
      try {
        // Always sign out first to prevent automatic login
        await supabase.auth.signOut();
        
        // Get the current user after verification
        const { data } = await supabase.auth.getUser();
        
        // If somehow we still have a user, attempt to create profile
        // but don't worry if this fails - we'll create it later
        if (data?.user) {
          try {
            await supabase.from('profiles').insert({
              id: data.user.id,
              email: email,
              full_name: data.user.user_metadata?.full_name || '',
              created_at: new Date().toISOString(),
            });
            
            // Sign out again to be extra sure
            await supabase.auth.signOut();
          } catch (profileError) {
            console.error('Error creating profile after verification:', profileError);
            // Don't return error - we'll still continue the flow
          }
        }
        
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
      const { success, error } = await resendVerificationCode(email);
      return { error: error };
    } catch (error) {
      return { error };
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