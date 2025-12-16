/**
 * KOFA Auth Context - React Context for Authentication State
 * Manages user session and provides auth state throughout the app
 */
import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase, getSession, signIn, signUp, signOut, hasCompletedOnboarding, setOnboardingComplete } from '@/lib/auth';

// Auth context type
interface AuthContextType {
    user: User | null;
    session: Session | null;
    isLoading: boolean;
    isAuthenticated: boolean;
    hasOnboarded: boolean;
    signIn: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
    signUp: (email: string, password: string, businessName?: string) => Promise<{ success: boolean; error?: string }>;
    signOut: () => Promise<void>;
    completeOnboarding: () => Promise<void>;
}

// Create context with default values
const AuthContext = createContext<AuthContextType>({
    user: null,
    session: null,
    isLoading: true,
    isAuthenticated: false,
    hasOnboarded: false,
    signIn: async () => ({ success: false }),
    signUp: async () => ({ success: false }),
    signOut: async () => { },
    completeOnboarding: async () => { },
});

// Hook to use auth context
export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}

// Auth Provider component
interface AuthProviderProps {
    children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
    const [user, setUser] = useState<User | null>(null);
    const [session, setSession] = useState<Session | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [hasOnboarded, setHasOnboarded] = useState(false);

    // Initialize auth state on mount
    useEffect(() => {
        initializeAuth();

        // Listen for auth state changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            async (event, newSession) => {
                setSession(newSession);
                setUser(newSession?.user ?? null);

                if (event === 'SIGNED_IN' && newSession) {
                    const onboarded = await hasCompletedOnboarding();
                    setHasOnboarded(onboarded);
                }

                if (event === 'SIGNED_OUT') {
                    setHasOnboarded(false);
                }
            }
        );

        return () => {
            subscription.unsubscribe();
        };
    }, []);

    async function initializeAuth() {
        try {
            const currentSession = await getSession();
            setSession(currentSession);
            setUser(currentSession?.user ?? null);

            if (currentSession) {
                const onboarded = await hasCompletedOnboarding();
                setHasOnboarded(onboarded);
            }
        } catch (error) {
            console.error('Auth initialization error:', error);
        } finally {
            setIsLoading(false);
        }
    }

    // Sign in handler
    async function handleSignIn(email: string, password: string) {
        const result = await signIn(email, password);
        if (result.success && result.user) {
            setUser(result.user);
            setSession(result.session ?? null);
            const onboarded = await hasCompletedOnboarding();
            setHasOnboarded(onboarded);
        }
        return { success: result.success, error: result.error };
    }

    // Sign up handler
    async function handleSignUp(email: string, password: string, businessName?: string) {
        const result = await signUp(email, password, businessName);
        if (result.success && result.user) {
            setUser(result.user);
            setSession(result.session ?? null);
            setHasOnboarded(false); // New users haven't onboarded
        }
        return { success: result.success, error: result.error };
    }

    // Sign out handler
    async function handleSignOut() {
        await signOut();
        setUser(null);
        setSession(null);
        setHasOnboarded(false);
    }

    // Complete onboarding handler
    async function handleCompleteOnboarding() {
        await setOnboardingComplete();
        setHasOnboarded(true);
    }

    const value: AuthContextType = {
        user,
        session,
        isLoading,
        isAuthenticated: !!user,
        hasOnboarded,
        signIn: handleSignIn,
        signUp: handleSignUp,
        signOut: handleSignOut,
        completeOnboarding: handleCompleteOnboarding,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}

export default AuthContext;
