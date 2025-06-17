const API_BASE_URL = 'http://localhost:5000/api/v1';

class CalendarService {
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

    // 1. Get All Events
    async getAllEvents(page = 1, limit = 10, filters = {}) {
        const token = this.getAuthToken();

        const queryParams = new URLSearchParams({
            page: page.toString(),
            limit: limit.toString(),
            ...filters
        });

        const response = await fetch(`${API_BASE_URL}/calendar/events?${queryParams}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
        });

        const data = await response.json();

        if (!response.ok) {
            if (response.status === 401) {
                return this.handleTokenRefresh(() => this.getAllEvents(page, limit, filters));
            }
            throw new Error(data.message || 'Failed to get events');
        }

        return data;
    }

    // 2. Create Event
    async createEvent(eventData) {
        const token = this.getAuthToken();

        // Clean up the event data to prevent validation errors
        const cleanEventData = {
            title: eventData.title,
            date: eventData.date,
            time: eventData.time,
            duration: eventData.duration,
            type: eventData.type,
            attendees: eventData.attendees || [],
            description: eventData.description || '',
            location: eventData.location || {
                type: 'video-call',
                details: 'Google Meet'
            },
            timezone: eventData.timezone || 'UTC'
        };

        // Only include recurring pattern if it's actually set
        if (eventData.isRecurring && eventData.recurringPattern && eventData.recurringPattern.frequency) {
            cleanEventData.isRecurring = true;
            cleanEventData.recurringPattern = {
                frequency: eventData.recurringPattern.frequency,
                interval: eventData.recurringPattern.interval || 1,
                endDate: eventData.recurringPattern.endDate || null
            };
        }

        const response = await fetch(`${API_BASE_URL}/calendar/events`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(cleanEventData),
        });

        const data = await response.json();

        if (!response.ok) {
            if (response.status === 401) {
                return this.handleTokenRefresh(() => this.createEvent(eventData));
            }
            throw new Error(data.message || 'Failed to create event');
        }

        return data;
    }

    // 3. Update Event
    async updateEvent(eventId, eventData) {
        const token = this.getAuthToken();

        // Clean up the event data to prevent validation errors
        const cleanEventData = {
            title: eventData.title,
            date: eventData.date,
            time: eventData.time,
            duration: eventData.duration,
            type: eventData.type,
            attendees: eventData.attendees || [],
            description: eventData.description || '',
            location: eventData.location || {
                type: 'video-call',
                details: 'Google Meet'
            },
            timezone: eventData.timezone || 'UTC'
        };

        // Only include recurring pattern if it's actually set
        if (eventData.isRecurring && eventData.recurringPattern && eventData.recurringPattern.frequency) {
            cleanEventData.isRecurring = true;
            cleanEventData.recurringPattern = {
                frequency: eventData.recurringPattern.frequency,
                interval: eventData.recurringPattern.interval || 1,
                endDate: eventData.recurringPattern.endDate || null
            };
        }

        const response = await fetch(`${API_BASE_URL}/calendar/events/${eventId}`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(cleanEventData),
        });

        const data = await response.json();

        if (!response.ok) {
            if (response.status === 401) {
                return this.handleTokenRefresh(() => this.updateEvent(eventId, eventData));
            }
            throw new Error(data.message || 'Failed to update event');
        }

        return data;
    }

    // 4. Delete Event
    async deleteEvent(eventId) {
        const token = this.getAuthToken();

        const response = await fetch(`${API_BASE_URL}/calendar/events/${eventId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            if (response.status === 401) {
                return this.handleTokenRefresh(() => this.deleteEvent(eventId));
            }
            const data = await response.json();
            throw new Error(data.message || 'Failed to delete event');
        }

        return { success: true };
    }

    // 5. Get Events by Date Range
    async getEventsByDateRange(startDate, endDate) {
        const token = this.getAuthToken();

        const queryParams = new URLSearchParams({
            startDate,
            endDate
        });

        const response = await fetch(`${API_BASE_URL}/calendar/events/date-range?${queryParams}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
        });

        const data = await response.json();

        if (!response.ok) {
            if (response.status === 401) {
                return this.handleTokenRefresh(() => this.getEventsByDateRange(startDate, endDate));
            }
            throw new Error(data.message || 'Failed to get events by date range');
        }

        return data;
    }

    // 6. Get Today's Events
    async getTodaysEvents() {
        const token = this.getAuthToken();

        const response = await fetch(`${API_BASE_URL}/calendar/events/today`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
        });

        const data = await response.json();

        if (!response.ok) {
            if (response.status === 401) {
                return this.handleTokenRefresh(() => this.getTodaysEvents());
            }
            throw new Error(data.message || 'Failed to get today\'s events');
        }

        return data;
    }

    // 7. Get Upcoming Events
    async getUpcomingEvents(limit = 5) {
        const token = this.getAuthToken();

        const queryParams = new URLSearchParams({
            limit: limit.toString()
        });

        const response = await fetch(`${API_BASE_URL}/calendar/events/upcoming?${queryParams}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
        });

        const data = await response.json();

        if (!response.ok) {
            if (response.status === 401) {
                return this.handleTokenRefresh(() => this.getUpcomingEvents(limit));
            }
            throw new Error(data.message || 'Failed to get upcoming events');
        }

        return data;
    }

    // 8. Search Events
    async searchEvents(query, filters = {}) {
        const token = this.getAuthToken();

        const queryParams = new URLSearchParams({
            q: query,
            ...filters
        });

        const response = await fetch(`${API_BASE_URL}/calendar/events/search?${queryParams}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
        });

        const data = await response.json();

        if (!response.ok) {
            if (response.status === 401) {
                return this.handleTokenRefresh(() => this.searchEvents(query, filters));
            }
            throw new Error(data.message || 'Failed to search events');
        }

        return data;
    }

    // 9. Update Event Status
    async updateEventStatus(eventId, status) {
        const token = this.getAuthToken();

        const response = await fetch(`${API_BASE_URL}/calendar/events/${eventId}/status`, {
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
                return this.handleTokenRefresh(() => this.updateEventStatus(eventId, status));
            }
            throw new Error(data.message || 'Failed to update event status');
        }

        return data;
    }

    // 10. Add Attendees
    async addAttendees(eventId, attendees) {
        const token = this.getAuthToken();

        const response = await fetch(`${API_BASE_URL}/calendar/events/${eventId}/attendees`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ attendees }),
        });

        const data = await response.json();

        if (!response.ok) {
            if (response.status === 401) {
                return this.handleTokenRefresh(() => this.addAttendees(eventId, attendees));
            }
            throw new Error(data.message || 'Failed to add attendees');
        }

        return data;
    }

    // 11. Remove Attendee
    async removeAttendee(eventId, attendeeEmail) {
        const token = this.getAuthToken();

        const response = await fetch(`${API_BASE_URL}/calendar/events/${eventId}/attendees/${encodeURIComponent(attendeeEmail)}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            if (response.status === 401) {
                return this.handleTokenRefresh(() => this.removeAttendee(eventId, attendeeEmail));
            }
            const data = await response.json();
            throw new Error(data.message || 'Failed to remove attendee');
        }

        return { success: true };
    }

    // 12. Get Calendar Stats
    async getCalendarStats() {
        const token = this.getAuthToken();

        const response = await fetch(`${API_BASE_URL}/calendar/stats`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
        });

        const data = await response.json();

        if (!response.ok) {
            if (response.status === 401) {
                return this.handleTokenRefresh(() => this.getCalendarStats());
            }
            throw new Error(data.message || 'Failed to get calendar statistics');
        }

        return data;
    }
}

export default new CalendarService();
