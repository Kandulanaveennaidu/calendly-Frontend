const API_BASE_URL = 'http://localhost:5000/api/v1';

class MeetingService {
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

    // Get Meeting Types (not meetings) - using meeting-types API endpoint
    async getMeetings(queryParams = {}) {
        const token = this.getAuthToken();

        // Clean up parameters - same pattern as Dashboard
        const cleanParams = {
            page: queryParams.page || 1,
            limit: queryParams.limit || 10
        };

        // Add other parameters if they exist and are not empty/default values
        Object.keys(queryParams).forEach(key => {
            if (queryParams[key] !== undefined &&
                queryParams[key] !== null &&
                queryParams[key] !== '' &&
                queryParams[key] !== 'all' &&
                key !== 'page' &&
                key !== 'limit') {
                cleanParams[key] = queryParams[key];
            }
        });

        const searchParams = new URLSearchParams(cleanParams);

        console.log('Final API call params:', cleanParams);
        console.log('Search params string:', searchParams.toString());

        try {
            // Use meeting-types API endpoint like you requested
            const response = await fetch(`${API_BASE_URL}/meeting-types?${searchParams}`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });

            const data = await response.json();
            console.log('Raw API response:', data);

            if (!response.ok) {
                if (response.status === 401) {
                    return this.handleTokenRefresh(() => this.getMeetings(queryParams));
                }
                throw new Error(data.message || 'Failed to get meeting types');
            }

            // Return in same format as your API response structure
            return {
                success: true,
                data: {
                    meetingTypes: data.data?.meetingTypes || data.meetingTypes || [],
                    pagination: data.pagination || {
                        page: cleanParams.page,
                        pages: Math.ceil((data.total || 0) / cleanParams.limit),
                        total: data.total || 0,
                        hasMore: (data.data?.meetingTypes || data.meetingTypes || []).length === cleanParams.limit
                    }
                },
                total: data.total || (data.data?.meetingTypes || data.meetingTypes || []).length,
                message: data.message || 'Meeting types retrieved successfully'
            };

        } catch (error) {
            console.error('API Error:', error);
            return {
                success: false,
                data: {
                    meetingTypes: [],
                    pagination: {
                        page: 1,
                        pages: 0,
                        total: 0,
                        hasMore: false
                    }
                },
                total: 0,
                message: error.message || 'Failed to fetch meeting types'
            };
        }
    }

    // Get Upcoming Meetings
    async getUpcomingMeetings(page = 1, limit = 10) {
        const token = this.getAuthToken();

        const queryParams = new URLSearchParams({
            page: page.toString(),
            limit: limit.toString()
        });

        try {
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
                    return this.handleTokenRefresh(() => this.getUpcomingMeetings(page, limit));
                }
                throw new Error(data.message || 'Failed to get upcoming meetings');
            }

            return data;
        } catch (error) {
            console.error('API Error:', error);
            throw error;
        }
    }

    async createMeeting(meetingData) {
        const token = localStorage.getItem('authToken');
        if (!token) {
            throw new Error('No authentication token found');
        }

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
                try {
                    const authService = (await import('./authService')).default;
                    await authService.refreshToken();
                    return this.createMeeting(meetingData);
                } catch (refreshError) {
                    throw new Error('Session expired. Please log in again.');
                }
            }
            throw new Error(data.message || 'Failed to create meeting');
        }

        return data;
    }

    async updateMeetingStatus(meetingId, status) {
        const token = localStorage.getItem('authToken');
        if (!token) {
            throw new Error('No authentication token found');
        }

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
                try {
                    const authService = (await import('./authService')).default;
                    await authService.refreshToken();
                    return this.updateMeetingStatus(meetingId, status);
                } catch (refreshError) {
                    throw new Error('Session expired. Please log in again.');
                }
            }
            throw new Error(data.message || 'Failed to update meeting status');
        }

        return data;
    }

    // Reschedule Meeting
    async rescheduleMeeting(meetingId, rescheduleData) {
        const token = this.getAuthToken();

        const response = await fetch(`${API_BASE_URL}/meetings/${meetingId}/reschedule`, {
            method: 'PUT',
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

    // Cancel Meeting
    async cancelMeeting(meetingId, reason = '') {
        const token = this.getAuthToken();

        const response = await fetch(`${API_BASE_URL}/meetings/${meetingId}/cancel`, {
            method: 'PUT',
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

    // Export Meetings
    async exportMeetings(filters = {}) {
        const token = this.getAuthToken();

        const cleanParams = {};
        Object.keys(filters).forEach(key => {
            if (filters[key] !== undefined && filters[key] !== null && filters[key] !== '' && filters[key] !== 'all') {
                cleanParams[key] = filters[key];
            }
        });

        const queryParams = new URLSearchParams(cleanParams);

        const response = await fetch(`${API_BASE_URL}/meetings/export?${queryParams}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
            },
        });

        if (!response.ok) {
            if (response.status === 401) {
                return this.handleTokenRefresh(() => this.exportMeetings(filters));
            }
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to export meetings');
        }

        const data = await response.json();
        return data;
    }

    // Send Reschedule Notification
    async sendRescheduleNotification(meetingId, rescheduleData) {
        const token = this.getAuthToken();

        const response = await fetch(`${API_BASE_URL}/meetings/${meetingId}/notify/reschedule`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(rescheduleData),
        });

        const data = await response.json();

        if (!response.ok) {
            if (response.status === 401) {
                return this.handleTokenRefresh(() => this.sendRescheduleNotification(meetingId, rescheduleData));
            }
            throw new Error(data.message || 'Failed to send reschedule notification');
        }

        return data;
    }

    // Send Cancellation Notification
    async sendCancellationNotification(meetingId, reason = '') {
        const token = this.getAuthToken();

        const response = await fetch(`${API_BASE_URL}/meetings/${meetingId}/notify/cancel`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ reason }),
        });

        const data = await response.json();

        if (!response.ok) {
            if (response.status === 401) {
                return this.handleTokenRefresh(() => this.sendCancellationNotification(meetingId, reason));
            }
            throw new Error(data.message || 'Failed to send cancellation notification');
        }

        return data;
    }

    // Get Meeting Type by ID
    async getMeetingTypeById(id) {
        const token = this.getAuthToken();

        try {
            const response = await fetch(`${API_BASE_URL}/meeting-types/${id}`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });

            const data = await response.json();

            if (!response.ok) {
                if (response.status === 401) {
                    return this.handleTokenRefresh(() => this.getMeetingTypeById(id));
                }
                throw new Error(data.message || 'Failed to get meeting type');
            }

            return data;
        } catch (error) {
            console.error('API Error:', error);
            throw error;
        }
    }

    // Update Meeting Type
    async updateMeetingType(id, updateData) {
        const token = this.getAuthToken();

        try {
            const response = await fetch(`${API_BASE_URL}/meeting-types/${id}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(updateData),
            });

            const data = await response.json();

            if (!response.ok) {
                if (response.status === 401) {
                    return this.handleTokenRefresh(() => this.updateMeetingType(id, updateData));
                }
                throw new Error(data.message || 'Failed to update meeting type');
            }

            return data;
        } catch (error) {
            console.error('API Error:', error);
            throw error;
        }
    }

    // Create Meeting Type
    async createMeetingType(meetingTypeData) {
        const token = this.getAuthToken();

        try {
            const response = await fetch(`${API_BASE_URL}/meeting-types`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(meetingTypeData),
            });

            const data = await response.json();

            if (!response.ok) {
                if (response.status === 401) {
                    return this.handleTokenRefresh(() => this.createMeetingType(meetingTypeData));
                }
                throw new Error(data.message || 'Failed to create meeting type');
            }

            return data;
        } catch (error) {
            console.error('API Error:', error);
            throw error;
        }
    }

    // Get all scheduled meetings (bookings)
    async getScheduledMeetings(page = 1, limit = 10) {
        const token = this.getAuthToken();

        const queryParams = new URLSearchParams({
            page: page.toString(),
            limit: limit.toString()
        });

        try {
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
                    return this.handleTokenRefresh(() => this.getScheduledMeetings(page, limit));
                }
                throw new Error(data.message || 'Failed to get scheduled meetings');
            }

            return data;
        } catch (error) {
            console.error('API Error:', error);
            throw error;
        }
    }

    // Get a specific meeting by ID
    async getMeetingById(meetingId) {
        const token = this.getAuthToken();

        try {
            const response = await fetch(`${API_BASE_URL}/meetings/${meetingId}`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });

            const data = await response.json();

            if (!response.ok) {
                if (response.status === 401) {
                    return this.handleTokenRefresh(() => this.getMeetingById(meetingId));
                }
                throw new Error(data.message || 'Failed to get meeting');
            }

            return data;
        } catch (error) {
            console.error('API Error:', error);
            throw error;
        }
    }

    /** GET public bookings for a given meeting type */
    async getPublicBookings(meetingTypeId) {
        // Public endpoints don't require authentication
        const response = await fetch(`${API_BASE_URL}/meetings/public/${meetingTypeId}/bookings`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'Failed to get public bookings');
        }

        return data;
    }
}

export default new MeetingService();

