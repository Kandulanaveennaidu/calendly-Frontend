const API_BASE_URL = 'http://localhost:5000/api/v1';

class ProfileService {
    async getProfile() {
        const token = localStorage.getItem('authToken');
        if (!token) {
            throw new Error('No authentication token found');
        }

        const response = await fetch(`${API_BASE_URL}/profile`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
        });

        const data = await response.json();

        if (!response.ok) {
            if (response.status === 401) {
                // Try to refresh token
                try {
                    const authService = (await import('./authService')).default;
                    await authService.refreshToken();
                    return this.getProfile(); // Retry with new token
                } catch (refreshError) {
                    throw new Error('Session expired. Please log in again.');
                }
            }
            throw new Error(data.message || 'Failed to get profile data');
        }

        return data;
    }

    async updateProfile(profileData) {
        const token = localStorage.getItem('authToken');
        if (!token) {
            throw new Error('No authentication token found');
        }

        const response = await fetch(`${API_BASE_URL}/profile`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(profileData),
        });

        const data = await response.json();

        if (!response.ok) {
            if (response.status === 401) {
                try {
                    const authService = (await import('./authService')).default;
                    await authService.refreshToken();
                    return this.updateProfile(profileData); // Retry with new token
                } catch (refreshError) {
                    throw new Error('Session expired. Please log in again.');
                }
            }
            throw new Error(data.message || 'Failed to update profile');
        }

        return data;
    }

    async uploadAvatar(avatarUrl) {
        const token = localStorage.getItem('authToken');
        if (!token) {
            throw new Error('No authentication token found');
        }

        const response = await fetch(`${API_BASE_URL}/profile/avatar`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ avatar: avatarUrl }),
        });

        const data = await response.json();

        if (!response.ok) {
            if (response.status === 401) {
                try {
                    const authService = (await import('./authService')).default;
                    await authService.refreshToken();
                    return this.uploadAvatar(avatarUrl); // Retry with new token
                } catch (refreshError) {
                    throw new Error('Session expired. Please log in again.');
                }
            }
            throw new Error(data.message || 'Failed to upload avatar');
        }

        return data;
    }

    async getUserStats() {
        const token = localStorage.getItem('authToken');
        if (!token) {
            throw new Error('No authentication token found');
        }

        const response = await fetch(`${API_BASE_URL}/profile/stats`, {
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
                    return this.getUserStats(); // Retry with new token
                } catch (refreshError) {
                    throw new Error('Session expired. Please log in again.');
                }
            }
            throw new Error(data.message || 'Failed to get user statistics');
        }

        return data;
    }
}

export default new ProfileService();