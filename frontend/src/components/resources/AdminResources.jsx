import React, { useState, useEffect } from "react";
import { Download, Trash } from "lucide-react";
import { resourceService } from "../../services/service.js";

const AdminResources = () => {
    const [resources, setResources] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [successMessage, setSuccessMessage] = useState("");
    const [newResource, setNewResource] = useState({
        name: "",
        description: "",
        file: null,
    });

    useEffect(() => {
        fetchResources();
    }, []);

    const fetchResources = async () => {
        setIsLoading(true);
        try {
            const data = await resourceService.getAllResources();
            console.log("Fetched resources:", JSON.stringify(data, null, 2));
            setResources(data);
            setError(null);
        } catch (err) {
            setError("Failed to load resources");
            console.error("Error fetching resources:", err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setNewResource((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleFileChange = (e) => {
        setNewResource((prev) => ({
            ...prev,
            file: e.target.files[0],
        }));
    };

    const resetForm = () => {
        setNewResource({
            name: "",
            description: "",
            file: null,
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);
        setSuccessMessage("");

        if (!newResource.name || !newResource.description || !newResource.file) {
            setError("Please fill in all fields and select a file");
            setIsLoading(false);
            return;
        }

        try {
            await resourceService.createResource(newResource);
            setSuccessMessage("Resource added successfully!");
            resetForm();
            fetchResources();
        } catch (err) {
            setError(err.message || "Failed to add resource");
            console.error("Error creating resource:", err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this resource?")) return;

        setIsLoading(true);
        try {
            await resourceService.deleteResource(id);
            setSuccessMessage("Resource deleted successfully!");
            fetchResources();
        } catch (err) {
            setError("Failed to delete resource");
            console.error("Error deleting resource:", err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleDownload = async (resourceId) => {
        try {
            // Find the specific resource to get its filename
            const resource = resources.find(r => r.resource_id === resourceId);
            if (resource) {
                await resourceService.downloadResource(resourceId, resource.name);
            }
        } catch (err) {
            console.error("Error downloading resource:", err);
        }
    };

    return (
        <div className="p-8 bg-gray-50 min-h-screen">
            <div className="max-w-6xl mx-auto bg-white rounded-lg shadow p-6 space-y-6">
                <h2 className="text-2xl font-bold text-gray-800">Manage Resources</h2>

                {error && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
                        {error}
                    </div>
                )}
                {successMessage && (
                    <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative">
                        {successMessage}
                    </div>
                )}

                {/* Add New Resource */}
                <form onSubmit={handleSubmit} className="space-y-4">
                    <input
                        type="text"
                        name="name"
                        placeholder="Resource Name"
                        className="border p-2 rounded w-full"
                        value={newResource.name}
                        onChange={handleInputChange}
                        required
                    />
                    <textarea
                        name="description"
                        placeholder="Description"
                        className="border p-2 w-full rounded"
                        value={newResource.description}
                        onChange={handleInputChange}
                        required
                    ></textarea>
                    <input
                        type="file"
                        className="border p-2 rounded w-full"
                        onChange={handleFileChange}
                        required
                    />
                    <button
                        type="submit"
                        className="bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 disabled:bg-blue-300"
                        disabled={isLoading}
                    >
                        {isLoading ? "Adding..." : "Add Resource"}
                    </button>
                </form>

                {/* Resource List */}
                <div className="overflow-x-auto">
                    <table className="table-auto min-w-full border-collapse border border-gray-300">
                        <thead>
                        <tr className="bg-gray-200 text-left">
                            <th className="px-6 py-3 border border-gray-300">Name</th>
                            <th className="px-6 py-3 border border-gray-300">Description</th>
                            <th className="px-6 py-3 border border-gray-300">Actions</th>
                        </tr>
                        </thead>
                        <tbody>
                        {resources.map((resource) => (
                            <tr key={resource.resource_id} className="hover:bg-gray-100">
                                <td className="px-6 py-4 border border-gray-300">{resource.name}</td>
                                <td className="px-6 py-4 border border-gray-300">{resource.description}</td>
                                <td className="px-6 py-4 border border-gray-300 flex gap-4">
                                    <button
                                        onClick={() => handleDownload(resource.resource_id)}
                                        className="text-green-600 hover:text-green-800"
                                    >
                                        <Download size={16} /> Download
                                    </button>
                                    <button
                                        onClick={() => handleDelete(resource.resource_id)}
                                        className="text-red-600 hover:text-red-800"
                                    >
                                        <Trash size={16} /> Delete
                                    </button>
                                </td>
                            </tr>
                        ))}
                        {resources.length === 0 && (
                            <tr>
                                <td colSpan="3" className="text-center text-gray-500 py-4">
                                    No resources available.
                                </td>
                            </tr>
                        )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default AdminResources;
