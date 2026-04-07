// src/components/layout/MainLayout.jsx
import React from 'react';
import { Outlet } from 'react-router-dom';
import Header from './Header.jsx';
import Sidebar from './Sidebar.jsx';

const MainLayout = ({ user, onLogout }) => {
    return (
        <div className="flex max-w-screen overflow-hidden min-h-screen bg-gray-50">
            <Sidebar user={user} onLogout={onLogout} />
            <div className="flex-1 ml-64">
                <Header user={user} />
                <main className="pt-20 min-h-screen">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default MainLayout;