const API_BASE_URL = 'http://localhost:5000/api/v1/auth';

class AuthService {
    async register(userData) {
        const response = await fetch(`${API_BASE_URL}/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                firstName: userData.firstName,
                lastName: userData.lastName,
                email: userData.email,
                password: userData.password
            }),
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'Registration failed');
        }

        // Store tokens if provided immediately after registration
        if (data.token) {
            localStorage.setItem('authToken', data.token);
        }
        if (data.refreshToken) {
            localStorage.setItem('refreshToken', data.refreshToken);
        }

        return data;
    }

    async login(email, password) {
        const response = await fetch(`${API_BASE_URL}/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, password }),
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'Login failed');
        }

        // Store tokens
        if (data.token) {
            localStorage.setItem('authToken', data.token);
        }
        if (data.refreshToken) {
            localStorage.setItem('refreshToken', data.refreshToken);
        }

        return data;
    }

    async forgotPassword(email) {
        const response = await fetch(`${API_BASE_URL}/forgot-password`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email }),
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'Failed to send reset email');
        }

        return data;
    }

    async resetPassword(code, newPassword) {
        const response = await fetch(`${API_BASE_URL}/reset-password`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ code, newPassword }),
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'Failed to reset password');
        }

        return data;
    }

    async sendVerificationEmail() {
        const token = localStorage.getItem('authToken');
        if (!token) {
            throw new Error('No authentication token found');
        }

        const response = await fetch(`${API_BASE_URL}/send-verification-email`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'Failed to send verification email');
        }

        return data;
    }

    async verifyEmail(code) {
        const response = await fetch(`${API_BASE_URL}/verify-email`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ code }),
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'Email verification failed');
        }

        return data;
    }

    async changePassword(currentPassword, newPassword) {
        const token = localStorage.getItem('authToken');
        if (!token) {
            throw new Error('No authentication token found');
        }

        const response = await fetch(`${API_BASE_URL}/change-password`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ currentPassword, newPassword }),
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'Failed to change password');
        }

        return data;
    }

    async updateProfile(profileData) {
        const token = localStorage.getItem('authToken');
        if (!token) {
            throw new Error('No authentication token found');
        }

        const response = await fetch(`${API_BASE_URL}/update-profile`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(profileData),
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'Failed to update profile');
        }

        return data;
    }

    async getCurrentUser() {
        const token = localStorage.getItem('authToken');
        if (!token) {
            throw new Error('No authentication token found');
        }

        const response = await fetch(`${API_BASE_URL}/me`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
        });

        const data = await response.json();

        if (!response.ok) {
            if (response.status === 401) {
                // Token expired, try to refresh
                await this.refreshToken();
                return this.getCurrentUser();
            }
            throw new Error(data.message || 'Failed to get user data');
        }

        return data;
    }

    async refreshToken() {
        const refreshToken = localStorage.getItem('refreshToken') ||
            'a5dd7377fa6829aed80f14bc941394cdf7d7baa52e6c3ccc4380b7c3495e9bae9f6687c100e1da830950a3a91b0b37a573f9a44763660c905b3a37b5efe5543c';

        const response = await fetch(`${API_BASE_URL}/refresh-token`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ refreshToken }),
        });

        const data = await response.json();

        if (!response.ok) {
            // Refresh failed, redirect to login
            this.logout();
            throw new Error(data.message || 'Session expired');
        }

        // Update tokens
        if (data.token) {
            localStorage.setItem('authToken', data.token);
        }
        if (data.refreshToken) {
            localStorage.setItem('refreshToken', data.refreshToken);
        }

        return data;
    }

    async logout() {
        const token = localStorage.getItem('authToken');
        const refreshToken = localStorage.getItem('refreshToken');

        if (token && refreshToken) {
            try {
                await fetch(`${API_BASE_URL}/logout`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ refreshToken }),
                });
            } catch (error) {
                console.error('Logout API call failed:', error);
            }
        }

        // Clear tokens regardless of API call success
        localStorage.removeItem('authToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('currentUser');
    }
}

export default new AuthService();