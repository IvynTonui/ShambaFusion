import React, { useState, useEffect } from "react";
import { systemService } from "../../services/service";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const SystemReport = () => {
    const [metrics, setMetrics] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchSystemMetrics();
    }, []);

    const fetchSystemMetrics = async () => {
        try {
            setLoading(true);
            const data = await systemService.getSystemMetrics();
            setMetrics(data);
            setError(null);
        } catch (err) {
            console.error("Error fetching system metrics:", err);
            setError("Failed to load system metrics. Please try again later.");
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <p className="text-gray-600">Loading system metrics...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                {error}
                <button onClick={fetchSystemMetrics} className="ml-4 text-blue-600 underline">
                    Retry
                </button>
            </div>
        );
    }

    return (
        <div className="p-6 bg-gray-50 min-h-screen">
            <div className="max-w-5xl mx-auto">
                <h3 className="text-2xl font-bold text-gray-800 mb-6">System Overview</h3>

                {metrics && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                        {/* User Metric Card */}
                        <div className="bg-white p-6 rounded-lg shadow">
                            <h4 className="text-lg font-semibold text-gray-700 mb-2">Total Users</h4>
                            <p className="text-3xl font-bold text-blue-600">{metrics.totalUsers}</p>
                            <p className="text-sm text-gray-500 mt-2">Last registered: {metrics.lastRegisteredUser?.name || 'None'}</p>
                        </div>

                        {/* Posts Metric Card */}
                        <div className="bg-white p-6 rounded-lg shadow">
                            <h4 className="text-lg font-semibold text-gray-700 mb-2">Total Discussions</h4>
                            <p className="text-3xl font-bold text-green-600">{metrics.totalPosts}</p>
                            <p className="text-sm text-gray-500 mt-2">Most active category: {metrics.mostActiveCategory?.name || 'None'}</p>
                        </div>

                        {/* Resources Metric Card */}
                        <div className="bg-white p-6 rounded-lg shadow">
                            <h4 className="text-lg font-semibold text-gray-700 mb-2">Resources</h4>
                            <p className="text-3xl font-bold text-purple-600">{metrics.totalResources}</p>
                            <p className="text-sm text-gray-500 mt-2">Last accessed: {metrics.lastAccessedResource?.name || 'None'}</p>
                        </div>
                    </div>
                )}

                {/* User Registration Chart */}
                {metrics?.userRegistrationData && (
                    <div className="bg-white p-6 rounded-lg shadow mb-6">
                        <h4 className="text-lg font-semibold text-gray-700 mb-4">User Registrations</h4>
                        <div className="h-64">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={metrics.userRegistrationData}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="month" />
                                    <YAxis />
                                    <Tooltip />
                                    <Legend />
                                    <Bar dataKey="count" fill="#3b82f6" name="New Users" />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                )}

                {/* Post Activity Chart */}
                {metrics?.postActivityData && (
                    <div className="bg-white p-6 rounded-lg shadow">
                        <h4 className="text-lg font-semibold text-gray-700 mb-4">Discussion Activity</h4>
                        <div className="h-64">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={metrics.postActivityData}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="category" />
                                    <YAxis />
                                    <Tooltip />
                                    <Legend />
                                    <Bar dataKey="posts" fill="#10b981" name="Posts" />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default SystemReport;