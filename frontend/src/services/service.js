import axios from '../utils/axios-config';

// Authentication Service
export const service = {
    login: async (credentials) => {
        const response = await axios.post('/auth/login', credentials);
        if (response.data.token) {
            localStorage.setItem('token', response.data.token);
            localStorage.setItem('user', JSON.stringify(response.data.user));
        }
        return response.data;
    },

    register: async (userData) => {
        const response = await axios.post('/auth/register', userData);
        return response.data;
    },

    logout: () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
    },

    getCurrentUser: () => {
        const userStr = localStorage.getItem('user');
        return userStr ? JSON.parse(userStr) : null;
    },

    getAllUsers: async () => {
        const response = await axios.get('/auth');
        return response.data;
    },

    deleteUser: async (id) => {
        const response = await axios.delete(`/auth/${id}`);
        return response.data;
    },

    updateUserRole: async (id, role) => {
        const response = await axios.put(`/auth/${id}/role`, { role });
        return response.data;
    },
};

// Post Service (Discussions)
export const postService = {
    getPosts: async () => {
        const response = await axios.get('/posts');
        return response.data;
    },

    createPost: async (postData) => {
        const response = await axios.post('/posts', postData);
        return response.data;
    },

    updatePost: async (postId, postData) => {
        const response = await axios.put(`/posts/${postId}`, postData);
        return response.data;
    },
        deletePost: async (postId) => {
            try {
                console.log('Delete request details:', {
                    url: `/posts/${postId}`,
                    postId: postId,
                    type: typeof postId
                });

                const response = await axios.delete(`/posts/${postId}`);
                return response.data;
            } catch (error) {
                console.error('Full error details:', {
                    message: error.message,
                    response: error.response,
                    request: error.request
                });
                throw error;
            }
        },
    likePost: async (postId) => {
        try {
            const response = await axios.put(`/posts/${postId}/like`);
            return response.data;
        } catch (error) {
            console.error("Error liking post:", error);
            throw error;
        }
    },

    // Unlike a post
    unlikePost: async (postId) => {
        try {
            const response = await axios.put(`/posts/${postId}/unlike`);
            return response.data;
        } catch (error) {
            console.error("Error unliking post:", error);
            throw error;
        }
    },

    // Check if a user has liked a post
    checkIfLiked: async (postId) => {
        try {
            const response = await axios.get(`/posts/${postId}/like-status`);
            return response.data.isLiked;
        } catch (error) {
            console.error("Error checking like status:", error);
            return false; // Default to not liked if there's an error
        }
    },

};

// Comment Service
export const commentService = {
    getCommentsByPostId: async (postId) => {
        const response = await axios.get(`/comments/post/${postId}`);
        return response.data;
    },

    createComment: async (postId, comment) => {
        const response = await axios.post('/comments', {
            post_id: postId,
            comment: comment,
        });
        return response.data;
    },

    updateComment: async (commentId, comment) => {
        const response = await axios.put(`/comments/${commentId}`, { comment });
        return response.data;
    },

    deleteComment: async (commentId) => {
        const response = await axios.delete(`/comments/${commentId}`);
        return response.data;
    },
};

// Category Service
export const categoryService = {
    getAllCategories: async () => {
        const response = await axios.get('/categories');
        return response.data;
    },

    getPostsByCategory: async (categoryId) => {
        const response = await axios.get(`/categories/${categoryId}`);
        return response.data;
    },

    createCategory: async (categoryData) => {
        const response = await axios.post('/categories', categoryData);
        return response.data;
    },

    updateCategory: async (categoryId, categoryData) => {
        const response = await axios.put(`/categories/${categoryId}`, categoryData);
        return response.data;
    },

    deleteCategory: async (categoryId) => {
        const response = await axios.delete(`/categories/${categoryId}`);
        return response.data;
    },
};

// Resource Service
export const resourceService = {
    getAllResources: async () => {
        try {
            const response = await axios.get('/resources');
            return response.data;
        } catch (error) {
            throw error.response?.data?.message || 'Failed to fetch resources';
        }
    },

    createResource: async (resourceData) => {
        try {
            const formData = new FormData();
            // Correctly append all fields
            formData.append('name', resourceData.name);
            formData.append('description', resourceData.description);
            formData.append('file', resourceData.file);

            const response = await axios.post('/resources', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            return response.data;
        } catch (error) {
            throw error.response?.data?.message || 'Failed to create resource';
        }
    },

    downloadResource: async (resourceId, filename) => {
        try {
            const response = await axios.get(`/resources/${resourceId}/download`, {
                responseType: 'blob'
            });

            // Create a link element and trigger download
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', filename);
            document.body.appendChild(link);
            link.click();

            // Clean up
            link.remove();
            window.URL.revokeObjectURL(url);
        } catch (error) {
            throw error.response?.data?.message || 'Failed to download resource';
        }
    },

    deleteResource: async (resourceId) => {
        try {
            const response = await axios.delete(`/resources/${resourceId}`);
            return response.data;
        } catch (error) {
            throw error.response?.data?.message || 'Failed to delete resource';
        }
    }
};
// System Service - New
export const systemService = {
    getSystemMetrics: async () => {
        try {
            const response = await axios.get('/system/metrics');
            return response.data;
        } catch (error) {
            throw error.response?.data?.message || 'Failed to fetch system metrics';
        }
    }
};
