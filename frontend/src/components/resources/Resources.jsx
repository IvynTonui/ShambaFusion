import React, { useState, useEffect } from "react";
import { Download } from "lucide-react";
import { resourceService } from "../../services/service.js";

const Resources = () => {
    const [resources, setResources] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchResources();
    }, []);

    const fetchResources = async () => {
        setIsLoading(true);
        try {
            const data = await resourceService.getAllResources();
            setResources(data);
            setError(null);
        } catch (err) {
            setError("Failed to load resources. Please try again later.");
            console.error("Error fetching resources:", err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleDownload = async (resourceId) => {
        try {
            // Find the specific resource to get its name
            const resource = resources.find(r => r.resource_id === resourceId);
            if (resource) {
                await resourceService.downloadResource(resourceId, resource.name);
            }
        } catch (err) {
            console.error("Error downloading resource:", err);
        }
    };

    if (isLoading) {
        return (
            <div className="p-6 text-center">
                <p>Loading resources...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-6 text-center text-red-600">
                <p>{error}</p>
            </div>
        );
    }

    return (
        <div className="p-6 space-y-6">
            <h2 className="text-2xl font-bold">Resource Library</h2>
            <p className="text-gray-600">Access knowledge and learning materials</p>

            {resources.length === 0 ? (
                <p className="text-center text-gray-500">No resources available.</p>
            ) : (
                <div className="space-y-4">
                    {resources.map((resource) => (
                        <div
                            key={resource.id}
                            className="p-4 bg-white shadow rounded flex justify-between items-center"
                        >
                            <div>
                                <h3 className="font-semibold">{resource.name}</h3>
                                <p className="text-gray-600">{resource.description}</p>
                            </div>
                            <button
                                onClick={() => handleDownload(resource.resource_id)}
                                className="text-green-600 hover:text-green-700 flex items-center gap-1"
                            >
                                <Download size={16} />
                                Download
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default Resources;
