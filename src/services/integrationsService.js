import apiClient from './apiClient';

class IntegrationsService {
    constructor() {
        this.baseURL = '/api/integrations';
    }

    // Get all available integrations
    async getIntegrations() {
        try {
            const response = await apiClient.get(`${this.baseURL}`);
            return {
                success: true,
                data: response.data
            };
        } catch (error) {
            console.error('Error fetching integrations:', error);
            return {
                success: false,
                error: error.response?.data?.message || 'Failed to fetch integrations'
            };
        }
    }

    // Connect to an integration
    async connectIntegration(integrationType, config = {}) {
        try {
            const response = await apiClient.post(`${this.baseURL}/${integrationType}/connect`, config);
            return {
                success: true,
                data: response.data
            };
        } catch (error) {
            console.error(`Error connecting to ${integrationType}:`, error);
            return {
                success: false,
                error: error.response?.data?.message || `Failed to connect to ${integrationType}`
            };
        }
    }

    // Disconnect from an integration
    async disconnectIntegration(integrationType) {
        try {
            const response = await apiClient.delete(`${this.baseURL}/${integrationType}/disconnect`);
            return {
                success: true,
                data: response.data
            };
        } catch (error) {
            console.error(`Error disconnecting from ${integrationType}:`, error);
            return {
                success: false,
                error: error.response?.data?.message || `Failed to disconnect from ${integrationType}`
            };
        }
    }

    // Configure integration settings
    async configureIntegration(integrationType, config) {
        try {
            const response = await apiClient.put(`${this.baseURL}/${integrationType}/configure`, config);
            return {
                success: true,
                data: response.data
            };
        } catch (error) {
            console.error(`Error configuring ${integrationType}:`, error);
            return {
                success: false,
                error: error.response?.data?.message || `Failed to configure ${integrationType}`
            };
        }
    }

    // Test integration connection
    async testIntegration(integrationType) {
        try {
            const response = await apiClient.post(`${this.baseURL}/${integrationType}/test`);
            return {
                success: true,
                data: response.data
            };
        } catch (error) {
            console.error(`Error testing ${integrationType}:`, error);
            return {
                success: false,
                error: error.response?.data?.message || `Failed to test ${integrationType}`
            };
        }
    }

    // Zoom-specific methods
    async createZoomMeeting(meetingData) {
        try {
            const response = await apiClient.post(`${this.baseURL}/zoom/meetings`, meetingData);
            return {
                success: true,
                data: response.data
            };
        } catch (error) {
            console.error('Error creating Zoom meeting:', error);
            return {
                success: false,
                error: error.response?.data?.message || 'Failed to create Zoom meeting'
            };
        }
    }

    // Google Meet-specific methods
    async createGoogleMeetMeeting(meetingData) {
        try {
            const response = await apiClient.post(`${this.baseURL}/google-meet/meetings`, meetingData);
            return {
                success: true,
                data: response.data
            };
        } catch (error) {
            console.error('Error creating Google Meet meeting:', error);
            return {
                success: false,
                error: error.response?.data?.message || 'Failed to create Google Meet meeting'
            };
        }
    }

    // VitelGlobal-specific methods
    async createVitelGlobalMeeting(meetingData) {
        try {
            const response = await apiClient.post(`${this.baseURL}/vitelglobal/meetings`, meetingData);
            return {
                success: true,
                data: response.data
            };
        } catch (error) {
            console.error('Error creating VitelGlobal meeting:', error);
            return {
                success: false,
                error: error.response?.data?.message || 'Failed to create VitelGlobal meeting'
            };
        }
    }

    // Gmail-specific methods
    async sendEmail(emailData) {
        try {
            const response = await apiClient.post(`${this.baseURL}/gmail/send`, emailData);
            return {
                success: true,
                data: response.data
            };
        } catch (error) {
            console.error('Error sending email via Gmail:', error);
            return {
                success: false,
                error: error.response?.data?.message || 'Failed to send email'
            };
        }
    }

    // Get email templates
    async getEmailTemplates() {
        try {
            const response = await apiClient.get(`${this.baseURL}/gmail/templates`);
            return {
                success: true,
                data: response.data
            };
        } catch (error) {
            console.error('Error fetching email templates:', error);
            return {
                success: false,
                error: error.response?.data?.message || 'Failed to fetch email templates'
            };
        }
    }

    // Calendar sync methods
    async syncCalendar(integrationType, calendarData) {
        try {
            const response = await apiClient.post(`${this.baseURL}/${integrationType}/calendar/sync`, calendarData);
            return {
                success: true,
                data: response.data
            };
        } catch (error) {
            console.error(`Error syncing calendar with ${integrationType}:`, error);
            return {
                success: false,
                error: error.response?.data?.message || `Failed to sync calendar with ${integrationType}`
            };
        }
    }

    // Get default integrations data (for offline/demo mode)
    getDefaultIntegrations() {
        return [
            {
                type: 'zoom',
                name: 'Zoom',
                provider: 'Zoom Video Communications',
                description: 'Create and manage Zoom meetings directly from your scheduling platform.',
                connected: false,
                email: '',
                requiresConfig: true,
                features: ['Video conferencing', 'Screen sharing', 'Recording', 'Waiting rooms'],
                config: {}
            },
            {
                type: 'google-meet',
                name: 'Google Meet',
                provider: 'Google',
                description: 'Integrate with Google Meet for seamless video conferencing and calendar sync.',
                connected: false,
                email: '',
                requiresConfig: true,
                features: ['Video conferencing', 'Calendar integration', 'Mobile apps', 'Screen sharing'],
                config: {}
            },
            {
                type: 'gmail',
                name: 'Gmail',
                provider: 'Google',
                description: 'Send automated emails for booking confirmations, reminders, and follow-ups.',
                connected: false,
                email: '',
                requiresConfig: false,
                features: ['Email automation', 'Templates', 'Scheduling', 'Analytics'],
                config: {}
            },
            {
                type: 'vitelglobal',
                name: 'VitelGlobal Meet',
                provider: 'VitelGlobal',
                description: 'Enterprise-grade video conferencing with advanced security and compliance features.',
                connected: false,
                email: '',
                requiresConfig: true,
                features: ['Enterprise security', 'Compliance', 'Advanced analytics', 'Custom branding'],
                config: {}
            },
            {
                type: 'outlook',
                name: 'Microsoft Outlook',
                provider: 'Microsoft',
                description: 'Sync with Outlook calendar and send emails through Microsoft Exchange.',
                connected: false,
                email: '',
                requiresConfig: true,
                features: ['Calendar sync', 'Email integration', 'Teams integration', 'Enterprise features'],
                config: {}
            }
        ];
    }
}

const integrationsService = new IntegrationsService();
export default integrationsService;
