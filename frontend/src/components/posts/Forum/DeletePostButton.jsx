import React, { useState } from "react";
import { postService } from "../../../services/service.js";
import { Trash2 } from "lucide-react";

const DeletePostButton = ({ postId, onPostDeleted }) => {
    const [error, setError] = useState("");
    const [isDeleting, setIsDeleting] = useState(false);

    const handleDelete = async () => {
        if (!confirm("Are you sure you want to delete this post?")) return;
        setIsDeleting(true);

        try {
            await postService.deletePost(postId);
            onPostDeleted(postId); // Remove from parent state
        } catch (err) {
            setError(err.response?.data?.message || "Delete failed. Please retry.");
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <><span role="alert">{error}</span><button aria-label="Delete discussion" onClick={handleDelete} disabled={isDeleting} className="text-red-500 hover:text-red-700">
            {isDeleting ? "Deleting..." : <Trash2 size={18} />}
        </button></>
    );
};

export default DeletePostButton;
