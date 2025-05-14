'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/providers/AuthProvider';
import { FileText } from 'lucide-react';

const Navbar = () => {
    const { isAuthenticated, logout } = useAuth();
    const router = useRouter();

    const handleLogout = () => {
        logout();
        router.push('/login');
    };

    return (
        <nav className="bg-transparent p-4">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center">
                    <div className="flex items-center space-x-4">
                        <Link href="/" className="text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium transition duration-150 ease-in-out hover:bg-gray-100">
                            Home
                        </Link>
                        {isAuthenticated && (
                            <Link href="/assistant" className="flex items-center text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium transition duration-150 ease-in-out hover:bg-gray-100">
                                <FileText className="mr-2 h-4 w-4" />
                                Assistente AI
                            </Link>
                        )}
                    </div>
                    <div className="flex items-center space-x-4">
                        {isAuthenticated && (
                            <button
                                onClick={handleLogout}
                                className="text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium transition duration-150 ease-in-out hover:bg-gray-100"
                            >
                                Logout
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navbar; 