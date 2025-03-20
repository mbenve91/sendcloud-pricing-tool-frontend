'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/providers/AuthProvider';

const Navbar = () => {
    const { isAuthenticated, logout } = useAuth();
    const router = useRouter();

    const handleLogout = () => {
        logout();
        router.push('/login');
    };

    return (
        <nav className="bg-indigo-600 p-4 shadow-md">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center">
                    <div className="flex-shrink-0">
                        <Link href="/" className="text-white font-bold text-xl">
                            SendCloud Pricing Tool
                        </Link>
                    </div>
                    <div className="ml-4 flex items-center space-x-4">
                        {isAuthenticated && (
                            <button
                                onClick={handleLogout}
                                className="text-white hover:text-gray-200 px-3 py-2 rounded-md text-sm font-medium transition duration-150 ease-in-out hover:bg-indigo-700"
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