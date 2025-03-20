'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/providers/AuthProvider';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [localError, setLocalError] = useState<string | null>(null);
    const { login, error, isLoading, isAuthenticated } = useAuth();
    const router = useRouter();

    // Se l'utente è già autenticato, reindirizza alla home
    useEffect(() => {
        if (isAuthenticated) {
            console.log('User is authenticated, redirecting to home page');
            router.push('/');
        }
    }, [isAuthenticated, router]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLocalError(null);
        try {
            console.log('Attempting login with:', { email });
            await login({ email, password });
            console.log('Login successful, authenticated status:', isAuthenticated);
            
            // Forza il reindirizzamento dopo il login riuscito
            window.location.href = '/';
        } catch (err: any) {
            console.error('Login failed:', err);
            // Mostra un messaggio di errore più specifico se disponibile
            setLocalError(err.message || 'Login failed. Please try again.');
        }
    };

    // Mostra sia gli errori locali che quelli dal provider di autenticazione
    const displayError = localError || error;

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8">
                <div>
                    <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
                        Sign in to your account
                    </h2>
                    <p className="mt-2 text-center text-sm text-gray-600">
                        Enter your credentials to access the SendCloud Pricing Tool
                    </p>
                </div>
                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                    <div className="rounded-md shadow-sm -space-y-px">
                        <div>
                            <label htmlFor="email-address" className="sr-only">
                                Email address
                            </label>
                            <input
                                id="email-address"
                                name="email"
                                type="email"
                                autoComplete="email"
                                required
                                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                                placeholder="Email address"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>
                        <div>
                            <label htmlFor="password" className="sr-only">
                                Password
                            </label>
                            <input
                                id="password"
                                name="password"
                                type="password"
                                autoComplete="current-password"
                                required
                                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                                placeholder="Password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>
                    </div>

                    {displayError && (
                        <div className="text-red-500 text-sm text-center">
                            {displayError}
                        </div>
                    )}

                    <div>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                        >
                            {isLoading ? 'Signing in...' : 'Sign in'}
                        </button>
                    </div>
                    
                    {/* Credenziali di prova */}
                    <div className="mt-4 p-4 bg-gray-50 border border-gray-200 rounded">
                        <h3 className="text-sm font-medium text-gray-700 mb-2">Test Credentials:</h3>
                        <p className="text-xs text-gray-500 mb-1">Email: marco.benvenuti@sendcloud.com</p>
                        <p className="text-xs text-gray-500">Password: tBYaVxxJ&6z^rtZ93FXVjo</p>
                    </div>
                </form>
            </div>
        </div>
    );
} 