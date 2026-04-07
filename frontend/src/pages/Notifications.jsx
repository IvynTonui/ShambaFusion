import React, { useState, useEffect } from 'react';
import { AlertCircle, Info, CheckCircle2, MessageSquare, ThumbsUp, FileText, Bell } from 'lucide-react';
import axios from '../utils/axios-config';

const NotificationItem = ({ type, message, related_id, created_at, is_read }) => {
    // Map notification types to icons and styles
    const getNotificationIcon = () => {
        switch (type) {
            case 'comment':
                return <MessageSquare size={20} className="text-green-600" />;
            case 'like':
                return <ThumbsUp size={20} className="text-blue-600" />;
            case 'resource':
                return <FileText size={20} className="text-purple-600" />;
            case 'alert':
                return <AlertCircle size={20} className="text-red-600" />;
            case 'success':
                return <CheckCircle2 size={20} className="text-green-600" />;
            case 'info':
            default:
                return <Info size={20} className="text-blue-600" />;
        }
    };

    // Map notification types to background colors
    const getBackgroundStyle = () => {
        switch (type) {
            case 'comment':
                return 'bg-green-50';
            case 'like':
                return 'bg-blue-50';
            case 'resource':
                return 'bg-purple-50';
            case 'alert':
                return 'bg-red-50';
            case 'success':
                return 'bg-green-50';
            case 'info':
            default:
                return 'bg-blue-50';
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <div
            className={`p-4 rounded-lg ${getBackgroundStyle()} flex gap-4 ${!is_read ? 'border-l-4 border-blue-600' : ''}`}
            role="alert"
        >
            {getNotificationIcon()}
            <div className="flex-1">
                <p className="mt-1">{message}</p>
                <span className="text-xs opacity-75 mt-2 block">{formatDate(created_at)}</span>
            </div>
        </div>
    );
};

const Notifications = () => {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchNotifications();
    }, []);

    const fetchNotifications = async () => {
        try {
            setLoading(true);
            const response = await axios.get('/notifications');
            setNotifications(response.data);
            setError('');
        } catch (err) {
            setError('Failed to load notifications');
            console.error('Error fetching notifications:', err);
        } finally {
            setLoading(false);
        }
    };

    const markAllAsRead = async () => {
        try {
            await axios.put('/notifications/read-all');
            // Update the local state to mark all as read
            setNotifications(notifications.map(notification => ({
                ...notification,
                is_read: true
            })));
        } catch (err) {
            setError('Failed to mark notifications as read');
            console.error('Error marking notifications as read:', err);
        }
    };

    const markAsRead = async (notificationId) => {
        try {
            await axios.put(`/notifications/${notificationId}/read`);
            // Update the local state
            setNotifications(notifications.map(notification =>
                notification.notification_id === notificationId
                    ? { ...notification, is_read: true }
                    : notification
            ));
        } catch (err) {
            console.error('Error marking notification as read:', err);
        }
    };

    const deleteNotification = async (notificationId) => {
        try {
            await axios.delete(`/notifications/${notificationId}`);
            // Update the local state
            setNotifications(notifications.filter(
                notification => notification.notification_id !== notificationId
            ));
        } catch (err) {
            console.error('Error deleting notification:', err);
        }
    };

    return (
        <div className="p-6 space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold text-gray-800">Notifications</h2>
                    <p className="text-gray-600">Stay updated with important alerts and information</p>
                </div>
                {notifications.length > 0 && (
                    <button
                        className="text-blue-600 hover:text-blue-800 font-medium"
                        onClick={markAllAsRead}
                        aria-label="Mark all notifications as read"
                    >
                        Mark all as read
                    </button>
                )}
            </div>

            <div className="space-y-4">
                {error && <p className="text-red-500">{error}</p>}

                {loading ? (
                    <div className="text-center py-10">
                        <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-blue-500 border-t-transparent"></div>
                        <p className="mt-2 text-gray-600">Loading notifications...</p>
                    </div>
                ) : notifications.length > 0 ? (
                    notifications.map((notification) => (
                        <div key={notification.notification_id} className="relative group">
                            <div
                                onClick={() => markAsRead(notification.notification_id)}
                                className="cursor-pointer"
                            >
                                <NotificationItem {...notification} />
                            </div>
                            <button
                                onClick={() => deleteNotification(notification.notification_id)}
                                className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500 transition-opacity"
                                aria-label="Delete notification"
                            >
                                &times;
                            </button>
                        </div>
                    ))
                ) : (
                    <div className="text-center py-10 bg-gray-50 rounded-lg">
                        <Bell size={48} className="mx-auto text-gray-400 mb-4" />
                        <p className="text-gray-500">You have no notifications.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Notifications;