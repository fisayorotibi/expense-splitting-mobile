import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { supabase } from './supabase';
import * as Linking from 'expo-linking';

// Add profile creation function after signup
const createProfile = async (userId: string, email: string, fullName?: string) => {
  try {
    const { error } = await supabase
      .from('profiles')
      .insert([
        {
          id: userId,
          email: email,
          full_name: fullName || '',
        },
      ]);

    if (error) {
      console.error('Error creating user profile:', error);
    }
  } catch (err) {
    console.error('Error in createProfile:', err);
  }
};

// Export the signUp function so it can be used by other modules
export const signUp = async (email: string, password: string, fullName?: string): Promise<{ success: boolean; error: Error | null; userId?: string }> => {
  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        // Disable auto-confirmation email with link
        emailRedirectTo: undefined,
        data: {
          full_name: fullName || '',
        }
      }
    });

    if (error) {
      return { success: false, error: new Error(error.message) };
    }

    if (data?.user) {
      // Create user profile
      await createProfile(data.user.id, email, fullName);
      return { success: true, error: null, userId: data.user.id };
    }

    return { success: true, error: null };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error : new Error('An unknown error occurred'),
    };
  }
};

// Add verification code validation function
export const verifyCode = async (email: string, code: string): Promise<{ success: boolean; error: Error | null }> => {
  try {
    const { error } = await supabase.auth.verifyOtp({
      email,
      token: code,
      type: 'signup'
    });

    if (error) {
      return { success: false, error: new Error(error.message) };
    }

    return { success: true, error: null };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error : new Error('An unknown error occurred'),
    };
  }
};

// Add resend verification code function
export const resendVerificationCode = async (email: string): Promise<{ success: boolean; error: Error | null }> => {
  try {
    const { error } = await supabase.auth.resend({
      type: 'signup',
      email,
    });

    if (error) {
      return { success: false, error: new Error(error.message) };
    }

    return { success: true, error: null };
  } catch (error) {
    return {
      success: false, 
      error: error instanceof Error ? error : new Error('An unknown error occurred'),
    };
  }
};

// Add this function to handle URL redirects from Supabase auth and set up a listener
export const setupAuthURLListener = () => {
  console.log('Setting up auth URL listener');
  
  const handleURL = async (url: string) => {
    if (url) {
      console.log('Received URL in listener:', url);
      await handleDeepLink(url);
    }
  };

  // Add event listener for deep links
  const subscription = Linking.addEventListener('url', (event) => {
    handleURL(event.url);
  });

  // Check for initial URL (app opened via link)
  Linking.getInitialURL().then((url) => {
    if (url) {
      console.log('App opened with URL:', url);
      handleURL(url);
    }
  });

  return () => {
    subscription.remove();
  };
};

// Add a function to handle the deep link with auth callback
export const handleDeepLink = async (url: string | null) => {
  if (!url) return false;

  console.log('Handling deep link:', url);

  // Check if this is an auth callback URL
  if (url.includes('auth/callback')) {
    try {
      // Handle different types of callback URLs

      // Case 1: OAuth2 code flow (has code parameter)
      if (url.includes('code=')) {
        // Extract the code from URL
        const code = url.split('code=')[1]?.split('&')[0];
        
        if (!code) {
          console.error('Could not extract code from URL');
          return false;
        }
        
        // Log the code for debugging
        console.log('Got authentication code:', code);
        
        // Handle the OAuth2 code exchange 
        const { data, error } = await supabase.auth.exchangeCodeForSession(code);
        
        if (error) {
          console.error('Error exchanging code for session:', error);
          return false;
        }
        
        console.log('Successfully authenticated via code flow');
        return true;
      }
      
      // Case 2: Email confirmation/magic link (has access_token, type, etc.)
      else if (url.includes('access_token=') || url.includes('type=')) {
        // The supabase client will automatically handle this case in the background
        // We just need to wait a moment for it to process
        console.log('Detected token-based authentication URL');
        
        // Wait for auth state to update
        return new Promise((resolve) => {
          setTimeout(async () => {
            const { data } = await supabase.auth.getSession();
            console.log('Session after auth callback:', data.session ? 'exists' : 'none');
            resolve(!!data.session);
          }, 1000);
        });
      }
    } catch (err) {
      console.error('Error handling deep link auth:', err);
      return false;
    }
  }
  
  return false;
}; 