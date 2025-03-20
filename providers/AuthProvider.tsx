'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authService, LoginCredentials } from '@/services/authService';

interface AuthContextType {
    isAuthenticated: boolean;
    isLoading: boolean;
    error: string | null;
    login: (credentials: LoginCredentials) => Promise<void>;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const checkAuth = () => {
            setIsAuthenticated(authService.isAuthenticated());
            setIsLoading(false);
        };
        
        checkAuth();
    }, []);

    const login = async (credentials: LoginCredentials) => {
        try {
            setError(null);
            setIsLoading(true);
            await authService.login(credentials);
            setIsAuthenticated(true);
        } catch (err) {
            setError('Invalid login credentials');
            setIsAuthenticated(false);
        } finally {
            setIsLoading(false);
        }
    };

    const logout = () => {
        authService.logout();
        setIsAuthenticated(false);
    };

    return (
        <AuthContext.Provider value={{ isAuthenticated, isLoading, error, login, logout }}>
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