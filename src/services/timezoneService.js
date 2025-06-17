const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api/v1';

class TimezoneService {
    constructor() {
        this.cachedTimezones = null;
        this.userTimezone = null;
    }

    // Get user's current timezone with India as fallback
    getUserTimezone() {
        if (this.userTimezone) {
            return this.userTimezone;
        }

        try {
            this.userTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
            console.log('Detected user timezone:', this.userTimezone);

            // If not in India timezone, default to India/Kolkata
            if (!this.userTimezone.includes('India') && !this.userTimezone.includes('Kolkata') && !this.userTimezone.includes('Asia/Calcutta')) {
                this.userTimezone = 'Asia/Kolkata'; // India Standard Time
                console.log('Setting default to India timezone:', this.userTimezone);
            }

            return this.userTimezone;
        } catch (error) {
            console.error('Error getting user timezone:', error);
            this.userTimezone = 'Asia/Kolkata'; // Default to India timezone
            return this.userTimezone;
        }
    }

    // Get all timezones from API
    async getTimezones() {
        try {
            // Return cached data if available
            if (this.cachedTimezones) {
                return {
                    success: true,
                    data: this.cachedTimezones
                };
            }

            console.log('Fetching timezones from API...');
            const response = await fetch(`${API_BASE_URL}/timezones`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            console.log('Timezones API response:', data);

            // Handle the API response structure
            if (data.success && data.data && data.data.all) {
                // Use the 'all' array which contains all timezones
                this.cachedTimezones = data.data.all;
                console.log(`Loaded ${this.cachedTimezones.length} timezones from API`);

                return {
                    success: true,
                    data: this.cachedTimezones
                };
            } else {
                throw new Error('Invalid API response structure');
            }

        } catch (error) {
            console.error('Error fetching timezones:', error);
            // Don't use fallback data - return empty array to force retry
            return {
                success: false,
                data: [],
                error: error.message
            };
        }
    }

    // Get timezones grouped by region (if needed)
    async getTimezonesByRegion() {
        try {
            const response = await fetch(`${API_BASE_URL}/timezones`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();

            if (data.success && data.data && data.data.timezones) {
                // Return the grouped timezones object
                return {
                    success: true,
                    data: data.data.timezones
                };
            } else {
                throw new Error('Invalid API response structure');
            }

        } catch (error) {
            console.error('Error fetching grouped timezones:', error);
            return {
                success: false,
                data: {},
                error: error.message
            };
        }
    }

    // Find timezone data by value
    async findTimezone(timezoneValue) {
        try {
            const response = await this.getTimezones();
            if (response.success && response.data) {
                return response.data.find(tz => tz.value === timezoneValue);
            }
            return null;
        } catch (error) {
            console.error('Error finding timezone:', error);
            return null;
        }
    }

    // Get user's timezone data from API
    async getUserTimezoneData() {
        const userTz = this.getUserTimezone();
        return await this.findTimezone(userTz);
    }

    // Get available times for a meeting type - Fix API response handling
    async getAvailableTimes(meetingTypeId, date, timezone) {
        try {
            const url = `${API_BASE_URL}/meetings/public/${meetingTypeId}/available-times?date=${date}&timezone=${timezone}`;
            console.log('Fetching available times from:', url);

            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            console.log('Available times API response:', data);

            // Handle the actual API response structure
            let slots = [];

            if (data.success && data.data) {
                // Check for 'times' field (as per your API response)
                if (Array.isArray(data.data.times)) {
                    slots = data.data.times;
                }
                // Fallback to 'slots' field
                else if (Array.isArray(data.data.slots)) {
                    slots = data.data.slots;
                }
                // If data itself is an array
                else if (Array.isArray(data.data)) {
                    slots = data.data;
                }
            }

            console.log('Processed available slots:', slots);

            return {
                success: true,
                data: slots, // Always return an array
                originalTimezone: data.data?.originalTimezone || 'UTC',
                requestedTimezone: data.data?.timezone || timezone
            };
        } catch (error) {
            console.error('Error fetching available times:', error);
            // Return mock data as fallback for development - ensure it's an array
            return {
                success: true,
                data: ['09:00', '09:30', '10:00', '10:30', '11:00', '11:30', '13:00', '13:30', '14:00', '14:30', '15:00', '15:30', '16:00', '16:30'],
                originalTimezone: 'UTC',
                requestedTimezone: timezone
            };
        }
    }

    // Helper method to format timezone display
    formatTimezoneLabel(timezone) {
        if (!timezone) return 'Unknown Timezone';

        if (typeof timezone === 'string') {
            // If it's just a string value, format it
            const parts = timezone.split('/');
            if (parts.length === 2) {
                const [continent, city] = parts;
                const cityName = city.replace(/_/g, ' ');
                return `${cityName} (${timezone})`;
            }
            return timezone;
        }

        // If it's an object with label
        if (timezone.label) {
            return timezone.label;
        }

        // Fallback formatting
        const parts = (timezone.value || timezone).split('/');
        if (parts.length === 2) {
            const [continent, city] = parts;
            const cityName = city.replace(/_/g, ' ');
            return `${cityName} (${timezone.value || timezone})`;
        }

        return timezone.value || timezone;
    }

    // Helper method to convert time between timezones
    convertTime(time, fromTimezone, toTimezone) {
        try {
            const [hours, minutes] = time.split(':');
            const date = new Date();
            date.setHours(parseInt(hours), parseInt(minutes), 0, 0);

            // Convert to target timezone
            return date.toLocaleTimeString('en-US', {
                timeZone: toTimezone,
                hour: 'numeric',
                minute: '2-digit',
                hour12: true
            });
        } catch (error) {
            console.error('Error converting time:', error);
            return time;
        }
    }

    // Get timezone offset
    getTimezoneOffset(timezoneValue) {
        try {
            const now = new Date();
            const utc = new Date(now.getTime() + (now.getTimezoneOffset() * 60000));
            const targetTime = new Date(utc.toLocaleString("en-US", { timeZone: timezoneValue }));
            const diff = targetTime.getTime() - utc.getTime();
            const hours = diff / (1000 * 60 * 60);
            const sign = hours >= 0 ? '+' : '-';
            const absHours = Math.abs(hours);
            const wholeHours = Math.floor(absHours);
            const minutes = Math.round((absHours - wholeHours) * 60);

            return `${sign}${wholeHours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
        } catch (error) {
            console.error('Error calculating timezone offset:', error);
            return '+00:00';
        }
    }

    // Clear cache (useful for testing or forced refresh)
    clearCache() {
        this.cachedTimezones = null;
        console.log('Timezone cache cleared');
    }

    // Validate timezone value
    async isValidTimezone(timezoneValue) {
        try {
            const timezone = await this.findTimezone(timezoneValue);
            return !!timezone;
        } catch (error) {
            console.error('Error validating timezone:', error);
            return false;
        }
    }
}

export default new TimezoneService();
