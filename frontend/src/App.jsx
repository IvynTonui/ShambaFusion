import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { service } from './services/service.js';

// Layout
import MainLayout from './components/ui/MainLayout';

// Pages
import Dashboard from './components/dashboard/Dashboard';
import PostList from './components/posts/Forum/PostList.jsx';
import Resources from './components/resources/Resources';
import Admin from "./components/dashboard/Admin.jsx";
import Notifications from './pages/Notifications';
import CreatePostForm from "./components/posts/Forum/CreatePostForm.jsx";

// Auth
import LoginForm from './components/auth/LoginForm';
import RegisterForm from './components/auth/RegisterForm';

const App = () => {
    const [user, setUser] = useState(service.getCurrentUser());

    const handleLogout = () => {
        service.logout();
        setUser(null);
    };

    // Protect only private routes
    const ProtectedRoute = ({ children }) => {
        return user ? children : <Navigate to="/login" replace />;
    };

    // Admin route protection
    const AdminRoute = ({ children }) => {
        if (!user) {
            return <Navigate to="/login" replace />;
        }
        if (user.role !== 'admin') {
            return <Navigate to="/" replace />;
        }
        return children;
    };

    return (
        <Router>
            <Routes>
                {/* Public Routes */}
                <Route path="/login" element={<LoginForm />} />
                <Route path="/register" element={<RegisterForm />} />

                {/* Main Layout */}
                <Route path="/" element={<MainLayout user={user} onLogout={handleLogout} />}>
                    <Route index element={<Dashboard user={user} />} />

                    {/* Public Routes */}
                    <Route path="forum" element={<PostList user={user} />} />
                    <Route path="newPost" element={<CreatePostForm user={user} />} />
                    <Route path="resources" element={<Resources user={user} />} />
                    <Route path="notifications" element={<Notifications user={user} />} />

                    {/* Admin Routes */}
                    <Route
                        path="/admin"
                        element={
                            <AdminRoute>
                                <Admin user={user} />
                            </AdminRoute>
                        }
                    />
                </Route>

                {/* Catch-all route */}
                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
        </Router>
    );
};

export default App;