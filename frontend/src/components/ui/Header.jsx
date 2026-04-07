// src/components/layout/Header.jsx
import React from 'react';
import { useLocation } from 'react-router-dom';
import { Bell } from 'lucide-react';

const Header = ({ user }) => {
    const location = useLocation();
    const pageName = location.pathname === '/' ? 'Dashboard' :
        location.pathname.slice(1).charAt(0).toUpperCase() +
        location.pathname.slice(2);

    return (
        <header className="bg-white shadow-md w-full py-4 px-6 flex justify-between items-center fixed top-0 left-64 right-0">
            <h1 className="text-xl font-semibold text-green-800">{pageName}</h1>

            {user && (
                <div className="flex items-center gap-4">
                    <button className="relative hover:bg-gray-100 p-2 rounded-full">
                        <Bell size={20} />
                        <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                    </button>
                    <div className="flex items-center gap-3">
                        <img
                            src="/api/placeholder/32/32"
                            alt={user.name}
                            className="w-8 h-8 rounded-full"
                        />
                        <div className="text-sm">
                            <p className="font-medium text-gray-700">{user.name}</p>
                            <p className="text-gray-500">{user.email}</p>
                        </div>
                    </div>
                </div>
            )}
        </header>
    );
};

export default Header;