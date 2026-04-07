import React, { useState } from "react";
import UsersManagement from "./UsersManagement";
import DiscussionsManagement from "./DiscussionsManagement";
import AdminResources from "../resources/AdminResources";
import SystemReports from "./SystemReport.jsx";

const AdminDashboard = () => {
    const [activeTab, setActiveTab] = useState("users");

    return (
        <div className="p-6">
            <h2 className="text-2xl font-bold mb-6">Admin Dashboard</h2>

            {/* Tabs */}
            <div className="flex gap-4 mb-6">
                <button
                    onClick={() => setActiveTab("users")}
                    className={`px-4 py-2 rounded ${activeTab === "users" ? "bg-blue-600 text-white" : "bg-gray-200"}`}
                >
                    Users
                </button>
                <button
                    onClick={() => setActiveTab("posts")}
                    className={`px-4 py-2 rounded ${activeTab === "posts" ? "bg-blue-600 text-white" : "bg-gray-200"}`}
                >
                    Discussions
                </button>
                <button
                    onClick={() => setActiveTab("resources")}
                    className={`px-4 py-2 rounded ${activeTab === "resources" ? "bg-blue-600 text-white" : "bg-gray-200"}`}
                >
                    Resources
                </button>
                <button
                    onClick={() => setActiveTab("reports")}
                    className={`px-4 py-2 rounded ${activeTab === "reports" ? "bg-blue-600 text-white" : "bg-gray-200"}`}
                >
                    Reports
                </button>

            </div>

            {/* Content */}
            <div>
                {activeTab === "users" && <UsersManagement/>}
                {activeTab === "posts" && <DiscussionsManagement/>}
                {activeTab === "resources" && <AdminResources />}
                {activeTab === "reports" && <SystemReports />}

            </div>
        </div>
    );
};

export default AdminDashboard;
