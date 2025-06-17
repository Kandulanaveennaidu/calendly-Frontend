const API_BASE_URL = 'http://localhost:5000/api/v1';

class DashboardService {
    async getDashboardStats() {
        const token = localStorage.getItem('authToken');
        if (!token) {
            throw new Error('No authentication token found');
        }

        const response = await fetch(`${API_BASE_URL}/profile/dashboard-stats`, {
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
                    return this.getDashboardStats();
                } catch (refreshError) {
                    throw new Error('Session expired. Please log in again.');
                }
            }
            throw new Error(data.message || 'Failed to get dashboard statistics');
        }

        // Handle the API response structure you provided
        if (data.success && data.data && data.data.statistics) {
            // Convert the statistics array to a simple object for easier use
            const stats = {};
            data.data.statistics.forEach(stat => {
                switch (stat.title) {
                    case 'Total Meetings':
                        stats.totalMeetings = parseInt(stat.value) || 0;
                        break;
                    case 'This Week':
                        stats.thisWeekMeetings = parseInt(stat.value) || 0;
                        break;
                    case 'Total Meeting Types':
                        stats.totalMeetingTypes = parseInt(stat.value) || 0;
                        break;
                    case 'Total Bookings':
                        stats.totalBookings = parseInt(stat.value) || 0;
                        break;
                }
            });
            return { stats, rawStatistics: data.data.statistics };
        }

        return data;
    }
}

export default new DashboardService();
