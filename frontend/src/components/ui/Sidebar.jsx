// src/components/layout/Sidebar.jsx
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Users, BookOpen, Bell, LogOut, LogIn, UserPlus, Library as LibraryIcon } from 'lucide-react';
import logo from "../../assets/SFlogo.png";

const Sidebar = ({ user, onLogout }) => {
    const location = useLocation();

    const NavItem = ({ to, icon: Icon, children }) => {
        const isActive = location.pathname === to;
        return (
            <li>
                <Link
                    to={to}
                    className={`flex whitespace-nowrap items-center gap-3 px-3 py-2 rounded-md transition-colors
                        ${isActive ? 'bg-green-700 text-white' : 'text-gray-100 hover:bg-green-700/50'}`}
                >
                    <Icon size={20} />
                    <span>{children}</span>
                </Link>
            </li>
        );
    };

    return (
        <aside className="w-full md:w-64 bg-green-800 text-white md:h-screen p-3 md:p-6 fixed z-30 top-0">
            <div className="hidden md:flex items-center gap-2 mb-8">
                <img src={logo} alt="Logo" className="w-10 h-10 rounded-full" />
                <h2 className="text-2xl font-bold">Shamba Fusion</h2>
            </div>

            <nav>
                <ul className="flex md:block gap-1 overflow-x-auto md:space-y-2">
                    <NavItem to="/" icon={Home}>Dashboard</NavItem>
                    <NavItem to="/forum" icon={Users}>Discussion Forum</NavItem>
                    <NavItem to="/resources" icon={BookOpen}>Resource Library</NavItem>
                    <NavItem to="/notifications" icon={Bell}>Notifications</NavItem>
                    {user?.role === "admin" && <NavItem to="/admin" icon={LibraryIcon}>Admin</NavItem>}
                </ul>

                <div className="md:mt-8 md:pt-8 md:border-t border-green-700">
                    {user ? (
                        <button
                            onClick={onLogout}
                            className="flex whitespace-nowrap items-center gap-3 px-3 py-2 w-full text-red-300 hover:bg-green-700/50 rounded-md"
                        >
                            <LogOut size={20} />
                            <span>Logout</span>
                        </button>
                    ) : (
                        <ul className="flex md:block gap-1 overflow-x-auto md:space-y-2">
                            <NavItem to="/login" icon={LogIn}>Login</NavItem>
                            <NavItem to="/register" icon={UserPlus}>Register</NavItem>
                        </ul>
                    )}
                </div>
            </nav>
        </aside>
    );
};

export default Sidebar;
