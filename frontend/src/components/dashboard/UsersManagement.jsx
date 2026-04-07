import React, { useState, useEffect } from "react";
import { service } from "../../services/service";

const UsersManagement = () => {
    const [users, setUsers] = useState([]);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const response = await service.getAllUsers();
            console.log("Fetched Users:", response);
            setUsers(response);
        } catch (err) {
            console.error("Error fetching users:", err);
            setError("Failed to fetch users. Please try again later.");
        }
    };

    const deleteUser = async (id) => {
        if (!window.confirm("Are you sure you want to delete this user?")) return;

        try {
            await service.deleteUser(id);
            setUsers(users.filter(user => user.id !== id));
        } catch (err) {
            setError("Failed to delete user");
        }
    };

    return (
        <div className="p-6 bg-gray-50 min-h-screen">
            <div className="max-w-4xl mx-auto">
                <h3 className="text-2xl font-bold text-gray-800 mb-6">Manage Users</h3>

                {error && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                        {error}
                    </div>
                )}

                <div className="bg-white shadow rounded-lg overflow-hidden">
                    <table className="min-w-full table-auto">
                        <thead>
                        <tr className="bg-gray-200 text-left">
                            <th className="px-6 py-3 text-gray-600 font-semibold">Name</th>
                            <th className="px-6 py-3 text-gray-600 font-semibold">Email</th>
                            <th className="px-6 py-3 text-gray-600 font-semibold">Role</th>
                            <th className="px-6 py-3 text-gray-600 font-semibold">Actions</th>
                        </tr>
                        </thead>
                        <tbody>
                        {users.map(user => (
                            <tr
                                key={user.id}
                                className="border-t hover:bg-gray-100 transition"
                            >
                                <td className="px-6 py-4">{user.name}</td>
                                <td className="px-6 py-4">{user.email}</td>
                                <td className="px-6 py-4">
                                        <span
                                            className={`px-2 py-1 rounded-full text-sm ${
                                                user.role === "admin"
                                                    ? "bg-green-100 text-green-800"
                                                    : "bg-blue-100 text-blue-800"
                                            }`}
                                        >
                                            {user.role}
                                        </span>
                                </td>
                                <td className="px-6 py-4">
                                    <button
                                        onClick={() => deleteUser(user.id)}
                                        className="text-red-500 hover:text-red-700 font-medium"
                                    >
                                        Delete
                                    </button>
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>

                    {users.length === 0 && (
                        <div className="p-6 text-center text-gray-500">
                            No users found.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default UsersManagement;
