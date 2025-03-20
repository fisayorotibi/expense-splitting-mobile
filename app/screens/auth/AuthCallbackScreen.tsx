import React, { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { handleDeepLink } from '../../services/auth';
import { StackNavigationProp } from '@react-navigation/stack';
import { AuthStackParamList } from '../../navigation/types';
import * as Linking from 'expo-linking';

type AuthCallbackScreenNavigationProp = StackNavigationProp<AuthStackParamList, 'AuthCallback'>;
type AuthCallbackScreenRouteProp = RouteProp<AuthStackParamList, 'AuthCallback'>;

export default function AuthCallbackScreen() {
  const navigation = useNavigation<AuthCallbackScreenNavigationProp>();
  const route = useRoute<AuthCallbackScreenRouteProp>();
  const [status, setStatus] = useState<'processing' | 'success' | 'error'>('processing');

  useEffect(() => {
    const processAuth = async () => {
      try {
        // Get the full URL from the route params if available
        let fullUrl = route.params?.url;
        
        // If URL not provided in route params, try to get from code param or use callback path
        if (!fullUrl) {
          const redirectUrl = Linking.createURL('auth/callback');
          fullUrl = route.params?.code 
            ? `${redirectUrl}?code=${route.params.code}` 
            : redirectUrl;
        }
        
        console.log('Processing auth callback URL:', fullUrl);
        
        // Process the deep link using the handler from auth.tsx
        const success = await handleDeepLink(fullUrl);
        
        if (success) {
          setStatus('success');
          // Wait a moment before navigating to allow the success message to be seen
          setTimeout(() => {
            navigation.replace('Login');
          }, 1500);
        } else {
          setStatus('error');
          // Wait a moment before navigating to allow the error message to be seen
          setTimeout(() => {
            navigation.replace('Login');
          }, 2000);
        }
      } catch (error) {
        console.error('Error in AuthCallbackScreen:', error);
        setStatus('error');
        // Navigate back to login on error
        setTimeout(() => {
          navigation.replace('Login');
        }, 2000);
      }
    };

    processAuth();
  }, [navigation, route.params]);

  return (
    <View style={styles.container}>
      {status === 'processing' && (
        <>
          <ActivityIndicator size="large" color="#0000ff" />
          <Text style={styles.text}>Processing your authentication...</Text>
        </>
      )}
      
      {status === 'success' && (
        <>
          <Text style={styles.successText}>Authentication successful!</Text>
          <Text style={styles.text}>Redirecting to login...</Text>
        </>
      )}
      
      {status === 'error' && (
        <>
          <Text style={styles.errorText}>Authentication failed</Text>
          <Text style={styles.text}>Redirecting to login...</Text>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  text: {
    fontSize: 16,
    textAlign: 'center',
    marginTop: 20,
  },
  successText: {
    fontSize: 22,
    fontWeight: 'bold',
    color: 'green',
    marginTop: 20,
  },
  errorText: {
    fontSize: 22,
    fontWeight: 'bold',
    color: 'red',
    marginTop: 20,
  },
}); 