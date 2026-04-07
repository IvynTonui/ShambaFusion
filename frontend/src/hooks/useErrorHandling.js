import { useState } from 'react';

export const useErrorHandling = () => {
    const [error, setError] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    const handleError = (err) => {
        const errorMessage = err.response?.data?.message
            || err.message
            || 'An unexpected error occurred';

        setError(errorMessage);
        console.error('Error:', err);
    };

    const clearError = () => {
        setError(null);
    };

    return {
        error,
        isLoading,
        setIsLoading,
        handleError,
        clearError
    };
};