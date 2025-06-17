const API_BASE_URL = 'http://localhost:5000/api/v1';

class NotificationService {
    // Get authentication token
    getAuthToken() {
        const token = localStorage.getItem('authToken');
        if (!token) {
            throw new Error('No authentication token found');
        }
        return token;
    }

    // Handle token refresh
    async handleTokenRefresh(originalRequest) {
        try {
            const authService = (await import('./authService')).default;
            await authService.refreshToken();
            return originalRequest();
        } catch (refreshError) {
            throw new Error('Session expired. Please log in again.');
        }
    }

    // Get user's notifications
    async getNotifications(params = {}) {
        const token = this.getAuthToken();

        const queryParams = new URLSearchParams({
            page: params.page || 1,
            limit: params.limit || 10,
            isRead: params.isRead !== undefined ? params.isRead : '',
            type: params.type || ''
        });

        try {
            const response = await fetch(`${API_BASE_URL}/notifications?${queryParams}`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });

            const data = await response.json();

            if (!response.ok) {
                if (response.status === 401) {
                    return this.handleTokenRefresh(() => this.getNotifications(params));
                }
                throw new Error(data.message || 'Failed to get notifications');
            }

            return data;
        } catch (error) {
            console.error('API Error:', error);
            throw error;
        }
    }

    // Create notification (when user creates meeting type)
    async createNotification(notificationData) {
        const token = this.getAuthToken();

        try {
            const response = await fetch(`${API_BASE_URL}/notifications`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(notificationData),
            });

            const data = await response.json();

            if (!response.ok) {
                if (response.status === 401) {
                    return this.handleTokenRefresh(() => this.createNotification(notificationData));
                }
                throw new Error(data.message || 'Failed to create notification');
            }

            return data;
        } catch (error) {
            console.error('API Error:', error);
            throw error;
        }
    }

    // Mark notification as read
    async markAsRead(notificationId) {
        const token = this.getAuthToken();

        try {
            const response = await fetch(`${API_BASE_URL}/notifications/${notificationId}/read`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });

            const data = await response.json();

            if (!response.ok) {
                if (response.status === 401) {
                    return this.handleTokenRefresh(() => this.markAsRead(notificationId));
                }
                throw new Error(data.message || 'Failed to mark notification as read');
            }

            return data;
        } catch (error) {
            console.error('API Error:', error);
            throw error;
        }
    }

    // Mark all notifications as read
    async markAllAsRead() {
        const token = this.getAuthToken();

        try {
            const response = await fetch(`${API_BASE_URL}/notifications/mark-all-read`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });

            const data = await response.json();

            if (!response.ok) {
                if (response.status === 401) {
                    return this.handleTokenRefresh(() => this.markAllAsRead());
                }
                throw new Error(data.message || 'Failed to mark all notifications as read');
            }

            return data;
        } catch (error) {
            console.error('API Error:', error);
            throw error;
        }
    }

    // Delete notification
    async deleteNotification(notificationId) {
        const token = this.getAuthToken();

        try {
            const response = await fetch(`${API_BASE_URL}/notifications/${notificationId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                if (response.status === 401) {
                    return this.handleTokenRefresh(() => this.deleteNotification(notificationId));
                }
                const data = await response.json();
                throw new Error(data.message || 'Failed to delete notification');
            }

            return { success: true };
        } catch (error) {
            console.error('API Error:', error);
            throw error;
        }
    }

    // Get unread count
    async getUnreadCount() {
        const token = this.getAuthToken();

        try {
            const response = await fetch(`${API_BASE_URL}/notifications/unread-count`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });

            const data = await response.json();

            if (!response.ok) {
                if (response.status === 401) {
                    return this.handleTokenRefresh(() => this.getUnreadCount());
                }
                throw new Error(data.message || 'Failed to get unread count');
            }

            return data;
        } catch (error) {
            console.error('API Error:', error);
            throw error;
        }
    }
}

export default new NotificationService();
