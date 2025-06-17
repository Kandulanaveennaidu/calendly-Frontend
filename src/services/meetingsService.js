const API_BASE_URL = 'http://localhost:5000/api/v1';

class MeetingsService {
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

    // 1. Get All Meetings
    async getAllMeetings(page = 1, limit = 10, filters = {}) {
        const token = this.getAuthToken();

        const queryParams = new URLSearchParams({
            page: page.toString(),
            limit: limit.toString(),
            ...filters
        });

        const response = await fetch(`${API_BASE_URL}/meetings?${queryParams}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
        });

        const data = await response.json();

        if (!response.ok) {
            if (response.status === 401) {
                return this.handleTokenRefresh(() => this.getAllMeetings(page, limit, filters));
            }
            throw new Error(data.message || 'Failed to get meetings');
        }

        return data;
    }

    // 2. Create New Meeting
    async createMeeting(meetingData) {
        const token = this.getAuthToken();

        const response = await fetch(`${API_BASE_URL}/meetings`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(meetingData),
        });

        const data = await response.json();

        if (!response.ok) {
            if (response.status === 401) {
                return this.handleTokenRefresh(() => this.createMeeting(meetingData));
            }
            throw new Error(data.message || 'Failed to create meeting');
        }

        return data;
    }

    // 3. Update Meeting
    async updateMeeting(meetingId, meetingData) {
        const token = this.getAuthToken();

        const response = await fetch(`${API_BASE_URL}/meetings/${meetingId}`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(meetingData),
        });

        const data = await response.json();

        if (!response.ok) {
            if (response.status === 401) {
                return this.handleTokenRefresh(() => this.updateMeeting(meetingId, meetingData));
            }
            throw new Error(data.message || 'Failed to update meeting');
        }

        return data;
    }

    // 4. Delete Meeting
    async deleteMeeting(meetingId) {
        const token = this.getAuthToken();

        const response = await fetch(`${API_BASE_URL}/meetings/${meetingId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            if (response.status === 401) {
                return this.handleTokenRefresh(() => this.deleteMeeting(meetingId));
            }
            const data = await response.json();
            throw new Error(data.message || 'Failed to delete meeting');
        }

        return { success: true };
    }

    // 5. Reschedule Meeting
    async rescheduleMeeting(meetingId, rescheduleData) {
        const token = this.getAuthToken();

        const response = await fetch(`${API_BASE_URL}/meetings/${meetingId}/reschedule`, {
            method: 'PATCH',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(rescheduleData),
        });

        const data = await response.json();

        if (!response.ok) {
            if (response.status === 401) {
                return this.handleTokenRefresh(() => this.rescheduleMeeting(meetingId, rescheduleData));
            }
            throw new Error(data.message || 'Failed to reschedule meeting');
        }

        return data;
    }

    // 6. Cancel Meeting
    async cancelMeeting(meetingId, reason) {
        const token = this.getAuthToken();

        const response = await fetch(`${API_BASE_URL}/meetings/${meetingId}/cancel`, {
            method: 'PATCH',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ reason }),
        });

        const data = await response.json();

        if (!response.ok) {
            if (response.status === 401) {
                return this.handleTokenRefresh(() => this.cancelMeeting(meetingId, reason));
            }
            throw new Error(data.message || 'Failed to cancel meeting');
        }

        return data;
    }

    // 7. Update Meeting Status
    async updateMeetingStatus(meetingId, status) {
        const token = this.getAuthToken();

        const response = await fetch(`${API_BASE_URL}/meetings/${meetingId}/status`, {
            method: 'PATCH',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ status }),
        });

        const data = await response.json();

        if (!response.ok) {
            if (response.status === 401) {
                return this.handleTokenRefresh(() => this.updateMeetingStatus(meetingId, status));
            }
            throw new Error(data.message || 'Failed to update meeting status');
        }

        return data;
    }

    // 11. Get Meeting Statistics
    async getMeetingStatistics() {
        const token = this.getAuthToken();

        const response = await fetch(`${API_BASE_URL}/meetings/statistics`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
        });

        const data = await response.json();

        if (!response.ok) {
            if (response.status === 401) {
                return this.handleTokenRefresh(() => this.getMeetingStatistics());
            }
            throw new Error(data.message || 'Failed to get meeting statistics');
        }

        return data;
    }

    // 12. Export Meetings
    async exportMeetings(format = 'csv', filters = {}) {
        const token = this.getAuthToken();

        const queryParams = new URLSearchParams({
            format,
            ...filters
        });

        const response = await fetch(`${API_BASE_URL}/meetings/export?${queryParams}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
            },
        });

        if (!response.ok) {
            if (response.status === 401) {
                return this.handleTokenRefresh(() => this.exportMeetings(format, filters));
            }
            throw new Error('Failed to export meetings');
        }

        return response.blob();
    }

    // 13. Send Meeting Notifications
    async sendMeetingNotifications(meetingId, notificationData) {
        const token = this.getAuthToken();

        const response = await fetch(`${API_BASE_URL}/meetings/${meetingId}/notifications`, {
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
                return this.handleTokenRefresh(() => this.sendMeetingNotifications(meetingId, notificationData));
            }
            throw new Error(data.message || 'Failed to send notifications');
        }

        return data;
    }

    // 14. Get Meeting Types
    async getMeetingTypes() {
        const token = this.getAuthToken();

        const response = await fetch(`${API_BASE_URL}/meetings/types`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
        });

        const data = await response.json();

        if (!response.ok) {
            if (response.status === 401) {
                return this.handleTokenRefresh(() => this.getMeetingTypes());
            }
            throw new Error(data.message || 'Failed to get meeting types');
        }

        return data;
    }

    // 15. Search Meetings
    async searchMeetings(query, filters = {}) {
        const token = this.getAuthToken();

        const queryParams = new URLSearchParams({
            q: query,
            ...filters
        });

        const response = await fetch(`${API_BASE_URL}/meetings/search?${queryParams}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
        });

        const data = await response.json();

        if (!response.ok) {
            if (response.status === 401) {
                return this.handleTokenRefresh(() => this.searchMeetings(query, filters));
            }
            throw new Error(data.message || 'Failed to search meetings');
        }

        return data;
    }

    // 16. Get Upcoming Meetings
    async getUpcomingMeetings(limit = 5, days = 7) {
        const token = this.getAuthToken();

        const queryParams = new URLSearchParams({
            limit: limit.toString(),
            days: days.toString()
        });

        const response = await fetch(`${API_BASE_URL}/meetings/upcoming?${queryParams}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
        });

        const data = await response.json();

        if (!response.ok) {
            if (response.status === 401) {
                return this.handleTokenRefresh(() => this.getUpcomingMeetings(limit, days));
            }
            throw new Error(data.message || 'Failed to get upcoming meetings');
        }

        return data;
    }

    // 20. Get Meeting Analytics
    async getMeetingAnalytics(period = 'month', type = null) {
        const token = this.getAuthToken();

        const queryParams = new URLSearchParams({
            period
        });

        if (type) {
            queryParams.append('type', type);
        }

        const response = await fetch(`${API_BASE_URL}/meetings/analytics?${queryParams}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
        });

        const data = await response.json();

        if (!response.ok) {
            if (response.status === 401) {
                return this.handleTokenRefresh(() => this.getMeetingAnalytics(period, type));
            }
            throw new Error(data.message || 'Failed to get meeting analytics');
        }

        return data;
    }
}

export default new MeetingsService();
