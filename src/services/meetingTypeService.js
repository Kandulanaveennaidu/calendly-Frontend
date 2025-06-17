const API_BASE_URL = 'http://localhost:5000/api/v1';

class MeetingTypeService {
    async getMeetingTypes(page = 1, limit = 10) {
        const token = localStorage.getItem('authToken');
        if (!token) {
            throw new Error('No authentication token found');
        }

        const response = await fetch(`${API_BASE_URL}/meeting-types?page=${page}&limit=${limit}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
        });

        const data = await response.json();

        if (!response.ok) {
            if (response.status === 401) {
                try {
                    const authService = (await import('./authService')).default;
                    await authService.refreshToken();
                    return this.getMeetingTypes(page, limit);
                } catch (refreshError) {
                    throw new Error('Session expired. Please log in again.');
                }
            }
            throw new Error(data.message || 'Failed to get meeting types');
        }

        return data;
    }

    async createMeetingType(meetingTypeData) {
        const token = localStorage.getItem('authToken');
        if (!token) {
            throw new Error('No authentication token found');
        }

        const response = await fetch(`${API_BASE_URL}/meeting-types`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                ...meetingTypeData,
                settings: {
                    bufferTimeBefore: 5,
                    bufferTimeAfter: 5,
                    allowRescheduling: true,
                    allowCancellation: true,
                    requireApproval: false,
                    maxAdvanceBooking: 30,
                    ...meetingTypeData.settings
                }
            }),
        });

        const data = await response.json();

        if (!response.ok) {
            if (response.status === 401) {
                try {
                    const authService = (await import('./authService')).default;
                    await authService.refreshToken();
                    return this.createMeetingType(meetingTypeData);
                } catch (refreshError) {
                    throw new Error('Session expired. Please log in again.');
                }
            }
            throw new Error(data.message || 'Failed to create meeting type');
        }

        return data;
    }

    async updateMeetingType(meetingTypeId, meetingTypeData) {
        const token = localStorage.getItem('authToken');
        if (!token) {
            throw new Error('No authentication token found');
        }

        const response = await fetch(`${API_BASE_URL}/meeting-types/${meetingTypeId}`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(meetingTypeData),
        });

        const data = await response.json();

        if (!response.ok) {
            if (response.status === 401) {
                try {
                    const authService = (await import('./authService')).default;
                    await authService.refreshToken();
                    return this.updateMeetingType(meetingTypeId, meetingTypeData);
                } catch (refreshError) {
                    throw new Error('Session expired. Please log in again.');
                }
            }
            throw new Error(data.message || 'Failed to update meeting type');
        }

        return data;
    }

    async toggleMeetingTypeStatus(meetingTypeId) {
        const token = localStorage.getItem('authToken');
        if (!token) {
            throw new Error('No authentication token found');
        }

        const response = await fetch(`${API_BASE_URL}/meeting-types/${meetingTypeId}/toggle-status`, {
            method: 'PATCH',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
        });

        const data = await response.json();

        if (!response.ok) {
            if (response.status === 401) {
                try {
                    const authService = (await import('./authService')).default;
                    await authService.refreshToken();
                    return this.toggleMeetingTypeStatus(meetingTypeId);
                } catch (refreshError) {
                    throw new Error('Session expired. Please log in again.');
                }
            }
            throw new Error(data.message || 'Failed to toggle meeting type status');
        }

        return data;
    }

    async deleteMeetingType(meetingTypeId) {
        const token = localStorage.getItem('authToken');
        if (!token) {
            throw new Error('No authentication token found');
        }

        const response = await fetch(`${API_BASE_URL}/meeting-types/${meetingTypeId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            if (response.status === 401) {
                try {
                    const authService = (await import('./authService')).default;
                    await authService.refreshToken();
                    return this.deleteMeetingType(meetingTypeId);
                } catch (refreshError) {
                    throw new Error('Session expired. Please log in again.');
                }
            }
            const data = await response.json();
            throw new Error(data.message || 'Failed to delete meeting type');
        }

        return { success: true };
    }
}

export default new MeetingTypeService();
