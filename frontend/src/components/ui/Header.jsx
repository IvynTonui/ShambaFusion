// src/components/layout/Header.jsx
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Bell } from 'lucide-react';

const Header = ({ user }) => {
    const location = useLocation();
    const pageName = location.pathname === '/' ? 'Dashboard' :
        location.pathname.slice(1).charAt(0).toUpperCase() +
        location.pathname.slice(2);

    return (
        <header className="bg-white shadow-md py-3 px-6 flex justify-between items-center fixed top-24 md:top-0 left-0 md:left-64 right-0 z-20">
            <h1 className="text-xl font-semibold text-green-800">{pageName}</h1>

            {user && (
                <div className="flex items-center gap-4">
                    <Link to="/notifications" aria-label="Notifications"><Bell size={20} /></Link>
                    <div className="flex items-center gap-3">
                        <span className="w-9 h-9 rounded-full bg-green-100 text-green-800 grid place-items-center font-bold">{user.name?.slice(0,1)}</span>
                        <div className="text-sm">
                            <p className="font-medium text-gray-700 truncate max-w-[140px]">{user.name}</p>
                            <p className="hidden sm:block text-gray-500 truncate max-w-[240px]">{user.email}</p>
                        </div>
                    </div>
                </div>
            )}
        </header>
    );
};

export default Header;