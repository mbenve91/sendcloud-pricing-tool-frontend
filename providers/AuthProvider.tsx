'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authService, LoginCredentials, AuthResponse } from '@/services/authService';

interface AuthContextType {
    isAuthenticated: boolean;
    isLoading: boolean;
    error: string | null;
    login: (credentials: LoginCredentials) => Promise<AuthResponse>;
    logout: () => void;
    user: { email: string; _id: string } | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [user, setUser] = useState<{ email: string; _id: string } | null>(null);

    // Verifica lo stato di autenticazione all'avvio e quando cambia l'URI
    useEffect(() => {
        const checkAuth = () => {
            console.log('Checking authentication status');
            const isAuth = authService.isAuthenticated();
            console.log('Auth status:', isAuth);
            setIsAuthenticated(isAuth);
            setIsLoading(false);
        };
        
        checkAuth();

        // Verifica anche quando l'utente ritorna alla pagina
        window.addEventListener('focus', checkAuth);
        return () => {
            window.removeEventListener('focus', checkAuth);
        };
    }, []);

    const login = async (credentials: LoginCredentials): Promise<AuthResponse> => {
        try {
            setError(null);
            setIsLoading(true);
            const response = await authService.login(credentials);
            console.log('Login response:', response);
            setUser(response.user);
            setIsAuthenticated(true);
            return response;
        } catch (err) {
            console.error('Login error in provider:', err);
            setError('Invalid login credentials');
            setIsAuthenticated(false);
            throw err;
        } finally {
            setIsLoading(false);
        }
    };

    const logout = () => {
        authService.logout();
        setIsAuthenticated(false);
        setUser(null);
        // Reindirizza alla pagina di login dopo il logout
        window.location.href = '/login';
    };

    const value = {
        isAuthenticated,
        isLoading,
        error,
        login,
        logout,
        user
    };

    console.log('Auth provider state:', { isAuthenticated, isLoading, error });

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}; 