import { useState, useEffect } from 'react';
import { authService, LoginCredentials } from '../services/authService';

export const useAuth = () => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        checkAuth();
    }, []);

    const checkAuth = () => {
        setIsAuthenticated(authService.isAuthenticated());
        setIsLoading(false);
    };

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

    return {
        isAuthenticated,
        isLoading,
        error,
        login,
        logout
    };
}; 