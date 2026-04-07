import React, { useState } from "react";
import { postService } from "../../../services/service.js";
import { Trash2 } from "lucide-react";

const DeletePostButton = ({ postId, onPostDeleted }) => {
    const [isDeleting, setIsDeleting] = useState(false);

    const handleDelete = async () => {
        if (!confirm("Are you sure you want to delete this post?")) return;
        setIsDeleting(true);

        try {
            await postService.deletePost(postId);
            onPostDeleted(postId); // Remove from parent state
        } catch (err) {
            console.error("Error deleting post:", err);
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <button onClick={handleDelete} disabled={isDeleting} className="text-red-500 hover:text-red-700">
            {isDeleting ? "Deleting..." : <Trash2 size={18} />}
        </button>
    );
};

export default DeletePostButton;
