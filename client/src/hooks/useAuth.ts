import { useState, useEffect, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useQuery, useMutation } from '@tanstack/react-query';
import { queryClient, apiRequest } from '@/lib/queryClient';
import { useGame } from '@/contexts/GameContext';

interface GoogleUser {
  googleId: string;
  email: string;
  username: string;
  avatarUrl?: string;
}

export function useAuth() {
  const { toast } = useToast();
  const { setUser } = useGame();
  const [isInitializing, setIsInitializing] = useState(true);

  // Function to initialize Google Auth
  const initializeGoogleAuth = useCallback(() => {
    if (typeof window === 'undefined' || !window.google) return;

    try {
      window.google.accounts.id.initialize({
        client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID || '',
        callback: handleCredentialResponse,
        auto_select: false,
        cancel_on_tap_outside: true,
      });
      setIsInitializing(false);
    } catch (error) {
      console.error('Error initializing Google Auth:', error);
      toast({
        title: 'Error',
        description: 'Failed to initialize Google authentication',
        variant: 'destructive',
      });
      setIsInitializing(false);
    }
  }, [toast]);

  // Mutation to create a new user
  const createUserMutation = useMutation({
    mutationFn: async (userData: GoogleUser) => {
      const res = await apiRequest('POST', '/api/users', userData);
      return res.json();
    },
    onSuccess: (data) => {
      setUser(data);
      toast({
        title: 'Success',
        description: 'Account created successfully!',
      });
      queryClient.invalidateQueries({ queryKey: ['/api/users'] });
    },
    onError: (error) => {
      console.error('Error creating user:', error);
      toast({
        title: 'Error',
        description: 'Failed to create account',
        variant: 'destructive',
      });
    },
  });

  // Handle Google credential response
  const handleCredentialResponse = useCallback(
    async (response: any) => {
      try {
        // Decode the JWT token
        const credential = response.credential;
        const payload = JSON.parse(atob(credential.split('.')[1]));

        // Extract user information from payload
        const googleUser: GoogleUser = {
          googleId: payload.sub,
          email: payload.email,
          username: payload.name,
          avatarUrl: payload.picture,
        };

        // Check if user exists
        const userResponse = await fetch(`/api/users/google/${googleUser.googleId}`);
        
        if (userResponse.status === 200) {
          // User exists, set user in context
          const userData = await userResponse.json();
          setUser(userData);
          toast({
            title: 'Success',
            description: 'Signed in successfully!',
          });
        } else if (userResponse.status === 404) {
          // User doesn't exist, create a new user
          createUserMutation.mutate(googleUser);
        } else {
          // Handle other errors
          throw new Error('Error fetching user data');
        }
      } catch (error) {
        console.error('Error handling Google credential response:', error);
        toast({
          title: 'Error',
          description: 'Failed to sign in with Google',
          variant: 'destructive',
        });
      }
    },
    [createUserMutation, setUser, toast]
  );

  // Function to sign in with Google
  const signInWithGoogle = useCallback(() => {
    if (typeof window === 'undefined' || !window.google) return;
    
    try {
      window.google.accounts.id.prompt();
    } catch (error) {
      console.error('Error prompting Google sign-in:', error);
      toast({
        title: 'Error',
        description: 'Failed to open Google sign-in',
        variant: 'destructive',
      });
    }
  }, [toast]);

  // Function to sign out
  const signOut = useCallback(() => {
    if (typeof window === 'undefined' || !window.google) return;
    
    try {
      window.google.accounts.id.revoke('', () => {
        setUser(null);
        toast({
          title: 'Success',
          description: 'Signed out successfully',
        });
      });
    } catch (error) {
      console.error('Error signing out:', error);
      // Even if Google revoke fails, we still want to clear the user from our app
      setUser(null);
      toast({
        title: 'Success',
        description: 'Signed out successfully',
      });
    }
  }, [setUser, toast]);

  // Initialize Google Auth on component mount
  useEffect(() => {
    // Wait until the Google API is loaded
    const checkGoogleLoaded = setInterval(() => {
      if (window.google && window.google.accounts) {
        clearInterval(checkGoogleLoaded);
        initializeGoogleAuth();
      }
    }, 100);

    // Clean up interval on unmount
    return () => clearInterval(checkGoogleLoaded);
  }, [initializeGoogleAuth]);

  return {
    signInWithGoogle,
    signOut,
    isInitializing,
  };
}

// Add type definitions for the Google API
declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: any) => void;
          prompt: (notification?: any) => void;
          renderButton: (element: HTMLElement, options: any) => void;
          revoke: (hint: string, callback: () => void) => void;
        };
      };
    };
  }
}
