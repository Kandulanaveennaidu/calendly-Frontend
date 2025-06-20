import React, { useState, useEffect, useCallback } from 'react';
import { Container, Row, Col, Card, Form, Button, Tab, Tabs, Alert, Badge } from 'react-bootstrap';
import { motion } from 'framer-motion';
import { FiSettings, FiCalendar, FiCheck, FiMoon, FiSun, FiVideo } from 'react-icons/fi';
import integrationsService from '../services/integrationsService';
import IntegrationCard from '../components/integrations/IntegrationCard';
import '../styles/integrations.css';

const SettingsPage = () => {
    const [activeTab, setActiveTab] = useState('account');
    const [showAlert, setShowAlert] = useState(false);
    const [alertMessage, setAlertMessage] = useState('');

    const [themeSettings, setThemeSettings] = useState({
        primaryColor: '#006bff',
        secondaryColor: '#6c757d',
        accentColor: '#28a745',
        darkMode: false
    });

    const [integrations, setIntegrations] = useState({
        outlook: { connected: true, email: 'user@company.com' },
        google: { connected: false, email: '' },
        zoom: { connected: true, email: 'user@company.com' },
        teams: { connected: false, email: '' },
        vitelglobal: { connected: false, email: '' } // New VitelGlobal Meet integration
    });

    const [advancedIntegrations, setAdvancedIntegrations] = useState([]);
    const [integrationsLoading, setIntegrationsLoading] = useState(false);

    const [settings, setSettings] = useState({
        emailNotifications: true,
        browserNotifications: true,
        reminderTime: 15,
        workingHours: {
            start: '09:00',
            end: '17:00',
            timezone: 'UTC-05:00'
        },
        bufferTime: 15,
        maxBookingsPerDay: 8
    });

    // Utility function to adjust color brightness
    const adjustColor = (color, amount) => {
        const usePound = color[0] === '#';
        const col = usePound ? color.slice(1) : color;
        const num = parseInt(col, 16);
        let r = (num >> 16) + amount;
        let g = ((num >> 8) & 0x00FF) + amount;
        let b = (num & 0x0000FF) + amount;
        r = r > 255 ? 255 : r < 0 ? 0 : r;
        g = g > 255 ? 255 : g < 0 ? 0 : g;
        b = b > 255 ? 255 : b < 0 ? 0 : b;
        return (usePound ? '#' : '') + ((r << 16) | (g << 8) | b).toString(16).padStart(6, '0');
    };

    // Apply theme function that handles all theme changes
    const applyTheme = useCallback((theme) => {
        // Apply primary colors
        document.documentElement.style.setProperty('--primary-color', theme.primaryColor);
        document.documentElement.style.setProperty('--secondary-color', theme.secondaryColor);
        document.documentElement.style.setProperty('--accent-color', theme.accentColor);

        // Apply derived colors (lighten/darken versions for hover states, etc)
        document.documentElement.style.setProperty('--primary-hover', adjustColor(theme.primaryColor, -20));
        document.documentElement.style.setProperty('--secondary-hover', adjustColor(theme.secondaryColor, -20));
        document.documentElement.style.setProperty('--accent-hover', adjustColor(theme.accentColor, -20));

        // Save to localStorage
        localStorage.setItem('themeSettings', JSON.stringify(theme));
    }, []);

    // Load advanced integrations
    const loadAdvancedIntegrations = useCallback(async () => {
        setIntegrationsLoading(true);
        try {
            const response = await integrationsService.getIntegrations();
            if (response.success) {
                setAdvancedIntegrations(response.data);
            } else {
                // Fallback to default integrations
                setAdvancedIntegrations(integrationsService.getDefaultIntegrations());
            }
        } catch (error) {
            console.error('Error loading integrations:', error);
            // Fallback to default integrations
            setAdvancedIntegrations(integrationsService.getDefaultIntegrations());
        } finally {
            setIntegrationsLoading(false);
        }
    }, []);

    useEffect(() => {
        // Load saved theme from localStorage on component mount
        const savedTheme = localStorage.getItem('themeSettings');
        if (savedTheme) {
            const parsedTheme = JSON.parse(savedTheme);
            setThemeSettings(parsedTheme);

            // Apply saved theme immediately
            applyTheme(parsedTheme);

            // Apply dark mode if it was enabled
            if (parsedTheme.darkMode) {
                document.documentElement.setAttribute('data-theme', 'dark');
                document.body.classList.add('dark-mode');
            }
        }

        // Load advanced integrations
        loadAdvancedIntegrations();
    }, [applyTheme, loadAdvancedIntegrations]);

    // Handle individual color changes
    const handleColorThemeChange = (colorType, color) => {
        const updatedTheme = {
            ...themeSettings,
            [colorType]: color
        };

        setThemeSettings(updatedTheme);
        applyTheme(updatedTheme);

        setAlertMessage('Theme updated successfully!');
        setShowAlert(true);
        setTimeout(() => setShowAlert(false), 2000);
    };

    // Handle complete theme palette changes
    const handleThemePaletteChange = (palette) => {
        const updatedTheme = {
            ...themeSettings,
            primaryColor: palette.primary,
            secondaryColor: palette.secondary,
            accentColor: palette.accent
        };

        setThemeSettings(updatedTheme);
        applyTheme(updatedTheme);

        setAlertMessage('Theme palette applied successfully!');
        setShowAlert(true);
        setTimeout(() => setShowAlert(false), 2000);
    };

    // Handle dark mode toggle
    const handleDarkModeToggle = (isDarkMode) => {
        const updatedTheme = {
            ...themeSettings,
            darkMode: isDarkMode
        };

        setThemeSettings(updatedTheme);

        // Apply dark mode
        if (isDarkMode) {
            document.documentElement.setAttribute('data-theme', 'dark');
            document.body.classList.add('dark-mode');
        } else {
            document.documentElement.setAttribute('data-theme', 'light');
            document.body.classList.remove('dark-mode');
        }

        // Save to localStorage
        localStorage.setItem('themeSettings', JSON.stringify(updatedTheme));

        setAlertMessage(`Dark mode ${isDarkMode ? 'enabled' : 'disabled'} successfully!`);
        setShowAlert(true);
        setTimeout(() => setShowAlert(false), 2000);
    };

    // Expanded color palettes with more options
    const colorPalettes = [
        { name: 'Default Blue', primary: '#0d6efd', secondary: '#6c757d', accent: '#28a745' },
        { name: 'Purple Pro', primary: '#6f42c1', secondary: '#6c757d', accent: '#fd7e14' },
        { name: 'Green Fresh', primary: '#198754', secondary: '#6c757d', accent: '#0dcaf0' },
        { name: 'Red Bold', primary: '#dc3545', secondary: '#6c757d', accent: '#ffc107' },
        { name: 'Orange Warm', primary: '#fd7e14', secondary: '#6c757d', accent: '#20c997' },
        { name: 'Indigo Cool', primary: '#6610f2', secondary: '#6c757d', accent: '#0dcaf0' },
        { name: 'Teal Ocean', primary: '#20c997', secondary: '#6c757d', accent: '#0d6efd' },
        { name: 'Pink Delight', primary: '#d63384', secondary: '#6c757d', accent: '#6f42c1' }
    ];

    const timezones = [
        // North America
        { value: 'UTC-10:00', label: 'Hawaii-Aleutian Standard Time (UTC-10)' },
        { value: 'UTC-09:00', label: 'Alaska Standard Time (UTC-9)' },
        { value: 'UTC-08:00', label: 'Pacific Standard Time (UTC-8) - Los Angeles, Vancouver' },
        { value: 'UTC-07:00', label: 'Mountain Standard Time (UTC-7) - Denver, Phoenix' },
        { value: 'UTC-06:00', label: 'Central Standard Time (UTC-6) - Chicago, Mexico City' },
        { value: 'UTC-05:00', label: 'Eastern Standard Time (UTC-5) - New York, Toronto' },
        { value: 'UTC-04:00', label: 'Atlantic Standard Time (UTC-4) - Halifax, San Juan' },
        { value: 'UTC-03:30', label: 'Newfoundland Standard Time (UTC-3:30) - St. John\'s' },

        // South America
        { value: 'UTC-03:00', label: 'Brasilia Standard Time (UTC-3) - São Paulo, Rio de Janeiro' },
        { value: 'UTC-03:00', label: 'Argentina Standard Time (UTC-3) - Buenos Aires' },
        { value: 'UTC-04:00', label: 'Chile Standard Time (UTC-4) - Santiago' },
        { value: 'UTC-05:00', label: 'Peru Standard Time (UTC-5) - Lima' },

        // Europe & Africa
        { value: 'UTC+00:00', label: 'Greenwich Mean Time (UTC+0) - London, Dublin, Lisbon' },
        { value: 'UTC+01:00', label: 'Central European Time (UTC+1) - Paris, Berlin, Rome, Madrid' },
        { value: 'UTC+02:00', label: 'Eastern European Time (UTC+2) - Athens, Cairo, Helsinki' },
        { value: 'UTC+02:00', label: 'South Africa Standard Time (UTC+2) - Johannesburg' },
        { value: 'UTC+03:00', label: 'Moscow Standard Time (UTC+3) - Moscow' },
        { value: 'UTC+03:00', label: 'East Africa Time (UTC+3) - Nairobi, Addis Ababa' },

        // Asia & Middle East
        { value: 'UTC+03:30', label: 'Iran Standard Time (UTC+3:30) - Tehran' },
        { value: 'UTC+04:00', label: 'Gulf Standard Time (UTC+4) - Dubai, Abu Dhabi' },
        { value: 'UTC+04:30', label: 'Afghanistan Time (UTC+4:30) - Kabul' },
        { value: 'UTC+05:00', label: 'Pakistan Standard Time (UTC+5) - Karachi, Islamabad' },
        { value: 'UTC+05:30', label: 'India Standard Time (UTC+5:30) - New Delhi, Mumbai' },
        { value: 'UTC+05:45', label: 'Nepal Time (UTC+5:45) - Kathmandu' },
        { value: 'UTC+06:00', label: 'Bangladesh Standard Time (UTC+6) - Dhaka' },
        { value: 'UTC+06:30', label: 'Myanmar Time (UTC+6:30) - Yangon' },
        { value: 'UTC+07:00', label: 'Indochina Time (UTC+7) - Bangkok, Hanoi' },
        { value: 'UTC+08:00', label: 'China Standard Time (UTC+8) - Beijing, Shanghai, Singapore' },
        { value: 'UTC+08:00', label: 'Malaysia Time (UTC+8) - Kuala Lumpur' },
        { value: 'UTC+08:00', label: 'Philippine Time (UTC+8) - Manila' },
        { value: 'UTC+09:00', label: 'Japan Standard Time (UTC+9) - Tokyo, Seoul' },

        // Australia & Pacific
        { value: 'UTC+09:30', label: 'Australian Central Standard Time (UTC+9:30) - Adelaide' },
        { value: 'UTC+10:00', label: 'Australian Eastern Standard Time (UTC+10) - Sydney, Melbourne' },
        { value: 'UTC+11:00', label: 'Solomon Islands Time (UTC+11) - Honiara' },
        { value: 'UTC+12:00', label: 'New Zealand Standard Time (UTC+12) - Auckland' },
        { value: 'UTC+13:00', label: 'Tonga Standard Time (UTC+13) - Nuku\'alofa' },
        { value: 'UTC+14:00', label: 'Line Islands Time (UTC+14) - Kiritimati' }
    ];

    const handleSaveSettings = () => {
        setAlertMessage('Settings saved successfully!');
        setShowAlert(true);
        setTimeout(() => setShowAlert(false), 3000);
    };

    // Integration handlers
    const handleConnectIntegration = async (integrationType) => {
        setIntegrationsLoading(true);
        try {
            const response = await integrationsService.connectIntegration(integrationType);
            if (response.success) {
                setAlertMessage(`Successfully connected to ${integrationType}!`);
                setShowAlert(true);
                setTimeout(() => setShowAlert(false), 3000);
                loadAdvancedIntegrations(); // Reload integrations
            } else {
                setAlertMessage(`Failed to connect to ${integrationType}: ${response.error}`);
                setShowAlert(true);
                setTimeout(() => setShowAlert(false), 5000);
            }
        } catch (error) {
            console.error(`Error connecting to ${integrationType}:`, error);
            setAlertMessage(`Failed to connect to ${integrationType}. Please try again.`);
            setShowAlert(true);
            setTimeout(() => setShowAlert(false), 5000);
        } finally {
            setIntegrationsLoading(false);
        }
    };

    const handleDisconnectIntegration = async (integrationType) => {
        setIntegrationsLoading(true);
        try {
            const response = await integrationsService.disconnectIntegration(integrationType);
            if (response.success) {
                setAlertMessage(`Successfully disconnected from ${integrationType}!`);
                setShowAlert(true);
                setTimeout(() => setShowAlert(false), 3000);
                loadAdvancedIntegrations(); // Reload integrations
            } else {
                setAlertMessage(`Failed to disconnect from ${integrationType}: ${response.error}`);
                setShowAlert(true);
                setTimeout(() => setShowAlert(false), 5000);
            }
        } catch (error) {
            console.error(`Error disconnecting from ${integrationType}:`, error);
            setAlertMessage(`Failed to disconnect from ${integrationType}. Please try again.`);
            setShowAlert(true);
            setTimeout(() => setShowAlert(false), 5000);
        } finally {
            setIntegrationsLoading(false);
        }
    };

    const handleConfigureIntegration = async (integrationType, config) => {
        try {
            const response = await integrationsService.configureIntegration(integrationType, config);
            if (response.success) {
                setAlertMessage(`Successfully configured ${integrationType}!`);
                setShowAlert(true);
                setTimeout(() => setShowAlert(false), 3000);
                loadAdvancedIntegrations(); // Reload integrations
            } else {
                setAlertMessage(`Failed to configure ${integrationType}: ${response.error}`);
                setShowAlert(true);
                setTimeout(() => setShowAlert(false), 5000);
            }
        } catch (error) {
            console.error(`Error configuring ${integrationType}:`, error);
            setAlertMessage(`Failed to configure ${integrationType}. Please try again.`);
            setShowAlert(true);
            setTimeout(() => setShowAlert(false), 5000);
        }
    };

    const handleToggleIntegration = (service) => {
        setIntegrations(prev => ({
            ...prev,
            [service]: {
                ...prev[service],
                connected: !prev[service].connected
            }
        }));
    };

    const handleOutlookConnect = async () => {
        try {
            // Microsoft Graph API configuration (for production use)
            // const msalConfig = {
            //     auth: {
            //         clientId: process.env.REACT_APP_AZURE_CLIENT_ID || 'demo-client-id',
            //         authority: 'https://login.microsoftonline.com/common',
            //         redirectUri: window.location.origin
            //     }
            // };

            // const loginRequest = {
            //     scopes: [
            //         'https://graph.microsoft.com/calendars.readwrite',
            //         'https://graph.microsoft.com/user.read',
            //         'offline_access'
            //     ]
            // };

            // For production, use MSAL library
            // import { PublicClientApplication } from '@azure/msal-browser';
            // const msalInstance = new PublicClientApplication(msalConfig);
            // const response = await msalInstance.loginPopup(loginRequest);

            // Demo implementation
            setAlertMessage('Starting Outlook authentication...');
            setShowAlert(true);

            // Simulate OAuth flow
            const popup = window.open(
                'about:blank',
                'outlook-auth',
                'width=500,height=600,scrollbars=yes,resizable=yes'
            );

            popup.document.write(`
                <html>
                    <head><title>Connect to Outlook</title></head>
                    <body style="font-family: Arial, sans-serif; padding: 20px; text-align: center;">
                        <h2>Outlook Integration</h2>
                        <p>In a production environment, this would redirect to Microsoft's OAuth page.</p>
                        <p>For demo purposes, click below to simulate successful connection:</p>
                        <button onclick="simulateSuccess()" style="background: #0078d4; color: white; padding: 10px 20px; border: none; border-radius: 4px; cursor: pointer;">
                            Simulate Successful Connection
                        </button>
                        <br><br>
                        <small>This is a demo. Real implementation requires Azure app registration.</small>
                        <script>
                            function simulateSuccess() {
                                window.opener.postMessage({
                                    type: 'OUTLOOK_AUTH_SUCCESS',
                                    data: {
                                        accessToken: 'demo-access-token',
                                        email: 'user@company.com',
                                        name: 'John Doe'
                                    }
                                }, '*');
                                window.close();
                            }
                        </script>
                    </body>
                </html>
            `);

            // Listen for auth success
            window.addEventListener('message', (event) => {
                if (event.data.type === 'OUTLOOK_AUTH_SUCCESS') {
                    setIntegrations(prev => ({
                        ...prev,
                        outlook: {
                            connected: true,
                            email: event.data.data.email,
                            accessToken: event.data.data.accessToken,
                            lastSync: new Date().toISOString()
                        }
                    }));

                    setAlertMessage('Outlook connected successfully! Calendar sync enabled.');
                    setShowAlert(true);
                    setTimeout(() => setShowAlert(false), 5000);
                }
            }, { once: true });

        } catch (error) {
            console.error('Outlook connection error:', error);
            setAlertMessage('Failed to connect to Outlook. Please try again.');
            setShowAlert(true);
        }
    };

    const handleDisconnectOutlook = () => {
        if (window.confirm('Are you sure you want to disconnect Outlook? This will stop calendar synchronization.')) {
            setIntegrations(prev => ({
                ...prev,
                outlook: { connected: false, email: '' }
            }));

            setAlertMessage('Outlook disconnected successfully.');
            setShowAlert(true);
            setTimeout(() => setShowAlert(false), 3000);
        }
    };

    const syncOutlookCalendar = async () => {
        if (!integrations.outlook.connected) {
            setAlertMessage('Please connect to Outlook first.');
            setShowAlert(true);
            return;
        }

        setAlertMessage('Syncing calendar...');
        setShowAlert(true);

        // Simulate calendar sync
        setTimeout(() => {
            setIntegrations(prev => ({
                ...prev,
                outlook: {
                    ...prev.outlook,
                    lastSync: new Date().toISOString()
                }
            }));

            setAlertMessage('Calendar sync completed successfully!');
            setShowAlert(true);
            setTimeout(() => setShowAlert(false), 3000);
        }, 2000);
    };

    // Integration name formatting helper
    const getIntegrationName = (service) => {
        const nameMap = {
            outlook: 'Microsoft Outlook',
            google: 'Google Calendar',
            zoom: 'Zoom Meetings',
            teams: 'Microsoft Teams',
            vitelglobal: 'VitelGlobal Meet'
        };
        return nameMap[service] || service.charAt(0).toUpperCase() + service.slice(1);
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="page-transition py-5"
        >
            <Container>
                <Row>
                    <Col lg={8} className="mx-auto">
                        <motion.div
                            initial={{ y: 30, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.1 }}
                        >
                            <div className="text-center mb-4">
                                <FiSettings size={64} className="text-primary mb-3" />
                                <h1 className="h2 fw-bold">Settings</h1>
                                <p className="text-muted">Manage your account preferences and integrations</p>
                            </div>

                            {showAlert && (
                                <Alert variant="success" className="d-flex align-items-center">
                                    <FiCheck className="me-2" />
                                    {alertMessage}
                                </Alert>
                            )}

                            <Card className="card-modern">
                                <Card.Body className="p-0">
                                    <Tabs
                                        activeKey={activeTab}
                                        onSelect={setActiveTab}
                                        className="border-0 px-4 pt-4"
                                    >
                                        <Tab eventKey="account" title="Account">
                                            <motion.div
                                                initial={{ opacity: 0, y: 20 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                className="p-4"
                                            >
                                                <h5 className="fw-bold mb-4">Account Information</h5>
                                                <Form>
                                                    <Row>
                                                        <Col md={6}>
                                                            <Form.Group className="mb-3">
                                                                <Form.Label>First Name</Form.Label>
                                                                <Form.Control
                                                                    type="text"
                                                                    defaultValue="John"
                                                                    className="form-control-modern"
                                                                />
                                                            </Form.Group>
                                                        </Col>
                                                        <Col md={6}>
                                                            <Form.Group className="mb-3">
                                                                <Form.Label>Last Name</Form.Label>
                                                                <Form.Control
                                                                    type="text"
                                                                    defaultValue="Doe"
                                                                    className="form-control-modern"
                                                                />
                                                            </Form.Group>
                                                        </Col>
                                                    </Row>

                                                    <Form.Group className="mb-3">
                                                        <Form.Label>Email Address</Form.Label>
                                                        <Form.Control
                                                            type="email"
                                                            defaultValue="john.doe@example.com"
                                                            className="form-control-modern"
                                                        />
                                                    </Form.Group>

                                                    <Form.Group className="mb-3">
                                                        <Form.Label>Phone Number</Form.Label>
                                                        <Form.Control
                                                            type="tel"
                                                            defaultValue="+1 (555) 123-4567"
                                                            className="form-control-modern"
                                                        />
                                                    </Form.Group>

                                                    <Form.Group className="mb-4">
                                                        <Form.Label>Bio</Form.Label>
                                                        <Form.Control
                                                            as="textarea"
                                                            rows={3}
                                                            defaultValue="Product Manager with 5+ years of experience in SaaS platforms."
                                                            className="form-control-modern"
                                                        />
                                                    </Form.Group>

                                                    <Button variant="primary" className="btn-modern" onClick={handleSaveSettings}>
                                                        Save Changes
                                                    </Button>
                                                </Form>
                                            </motion.div>
                                        </Tab>

                                        <Tab eventKey="calendar" title="Calendar">
                                            <motion.div
                                                initial={{ opacity: 0, y: 20 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                className="p-4"
                                            >
                                                <h5 className="fw-bold mb-4">Calendar Settings</h5>
                                                <Form>
                                                    <Row>
                                                        <Col md={6}>
                                                            <Form.Group className="mb-3">
                                                                <Form.Label>Working Hours Start</Form.Label>
                                                                <Form.Control
                                                                    type="time"
                                                                    value={settings.workingHours.start}
                                                                    onChange={(e) => setSettings({
                                                                        ...settings,
                                                                        workingHours: { ...settings.workingHours, start: e.target.value }
                                                                    })}
                                                                    className="form-control-modern"
                                                                />
                                                            </Form.Group>
                                                        </Col>
                                                        <Col md={6}>
                                                            <Form.Group className="mb-3">
                                                                <Form.Label>Working Hours End</Form.Label>
                                                                <Form.Control
                                                                    type="time"
                                                                    value={settings.workingHours.end}
                                                                    onChange={(e) => setSettings({
                                                                        ...settings,
                                                                        workingHours: { ...settings.workingHours, end: e.target.value }
                                                                    })}
                                                                    className="form-control-modern"
                                                                />
                                                            </Form.Group>
                                                        </Col>
                                                    </Row>

                                                    <Form.Group className="mb-3">
                                                        <Form.Label>Timezone</Form.Label>
                                                        <Form.Select
                                                            value={settings.workingHours.timezone}
                                                            onChange={(e) => setSettings({
                                                                ...settings,
                                                                workingHours: { ...settings.workingHours, timezone: e.target.value }
                                                            })}
                                                            className="form-control-modern"
                                                        >
                                                            {timezones.map(tz => (
                                                                <option key={tz.value} value={tz.value}>{tz.label}</option>
                                                            ))}
                                                        </Form.Select>
                                                        <Form.Text className="text-muted">
                                                            Your current local timezone will be used as the default for scheduling.
                                                        </Form.Text>
                                                    </Form.Group>

                                                    <Row>
                                                        <Col md={6}>
                                                            <Form.Group className="mb-3">
                                                                <Form.Label>Buffer Time (minutes)</Form.Label>
                                                                <Form.Select
                                                                    value={settings.bufferTime}
                                                                    onChange={(e) => setSettings({
                                                                        ...settings,
                                                                        bufferTime: parseInt(e.target.value)
                                                                    })}
                                                                    className="form-control-modern"
                                                                >
                                                                    <option value={0}>No buffer</option>
                                                                    <option value={5}>5 minutes</option>
                                                                    <option value={10}>10 minutes</option>
                                                                    <option value={15}>15 minutes</option>
                                                                    <option value={30}>30 minutes</option>
                                                                </Form.Select>
                                                            </Form.Group>
                                                        </Col>
                                                        <Col md={6}>
                                                            <Form.Group className="mb-3">
                                                                <Form.Label>Max Bookings Per Day</Form.Label>
                                                                <Form.Control
                                                                    type="number"
                                                                    min="1"
                                                                    max="20"
                                                                    value={settings.maxBookingsPerDay}
                                                                    onChange={(e) => setSettings({
                                                                        ...settings,
                                                                        maxBookingsPerDay: parseInt(e.target.value)
                                                                    })}
                                                                    className="form-control-modern"
                                                                />
                                                            </Form.Group>
                                                        </Col>
                                                    </Row>

                                                    <Button variant="primary" className="btn-modern" onClick={handleSaveSettings}>
                                                        Save Calendar Settings
                                                    </Button>
                                                </Form>
                                            </motion.div>
                                        </Tab>

                                        <Tab eventKey="notifications" title="Notifications">
                                            <motion.div
                                                initial={{ opacity: 0, y: 20 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                className="p-4"
                                            >
                                                <h5 className="fw-bold mb-4">Notification Preferences</h5>
                                                <Form>
                                                    <Form.Group className="mb-3">
                                                        <Form.Check
                                                            type="switch"
                                                            id="email-notifications"
                                                            label="Email Notifications"
                                                            checked={settings.emailNotifications}
                                                            onChange={(e) => setSettings({
                                                                ...settings,
                                                                emailNotifications: e.target.checked
                                                            })}
                                                        />
                                                        <small className="text-muted">Receive email notifications for bookings and reminders</small>
                                                    </Form.Group>

                                                    <Form.Group className="mb-3">
                                                        <Form.Check
                                                            type="switch"
                                                            id="browser-notifications"
                                                            label="Browser Notifications"
                                                            checked={settings.browserNotifications}
                                                            onChange={(e) => setSettings({
                                                                ...settings,
                                                                browserNotifications: e.target.checked
                                                            })}
                                                        />
                                                        <small className="text-muted">Show browser notifications for upcoming meetings</small>
                                                    </Form.Group>

                                                    <Form.Group className="mb-4">
                                                        <Form.Label>Reminder Time</Form.Label>
                                                        <Form.Select
                                                            value={settings.reminderTime}
                                                            onChange={(e) => setSettings({
                                                                ...settings,
                                                                reminderTime: parseInt(e.target.value)
                                                            })}
                                                            className="form-control-modern"
                                                        >
                                                            <option value={5}>5 minutes before</option>
                                                            <option value={10}>10 minutes before</option>
                                                            <option value={15}>15 minutes before</option>
                                                            <option value={30}>30 minutes before</option>
                                                            <option value={60}>1 hour before</option>
                                                        </Form.Select>
                                                    </Form.Group>

                                                    <Button variant="primary" className="btn-modern" onClick={handleSaveSettings}>
                                                        Save Notification Settings
                                                    </Button>
                                                </Form>
                                            </motion.div>
                                        </Tab>

                                        <Tab eventKey="appearance" title="Appearance">
                                            <motion.div
                                                initial={{ opacity: 0, y: 20 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                className="p-4"
                                            >
                                                <h5 className="fw-bold mb-4">Color Theme</h5>

                                                {/* Real-time theme preview */}
                                                <Card className="mb-4 shadow-sm border">
                                                    <Card.Body>
                                                        <h6 className="mb-3">Theme Preview</h6>
                                                        <div className="d-flex gap-3 mb-3 flex-wrap">
                                                            <Button style={{ backgroundColor: themeSettings.primaryColor, borderColor: themeSettings.primaryColor }}>
                                                                Primary Button
                                                            </Button>
                                                            <Button variant="outline-primary" style={{
                                                                color: themeSettings.primaryColor,
                                                                borderColor: themeSettings.primaryColor
                                                            }}>
                                                                Outline Button
                                                            </Button>
                                                            <Button style={{ backgroundColor: themeSettings.secondaryColor, borderColor: themeSettings.secondaryColor }}>
                                                                Secondary
                                                            </Button>
                                                            <Button style={{ backgroundColor: themeSettings.accentColor, borderColor: themeSettings.accentColor }}>
                                                                Accent
                                                            </Button>
                                                        </div>

                                                        <div className="d-flex gap-2 flex-wrap">
                                                            <Badge style={{ backgroundColor: themeSettings.primaryColor }}>Primary Badge</Badge>
                                                            <Badge style={{ backgroundColor: themeSettings.secondaryColor }}>Secondary</Badge>
                                                            <Badge style={{ backgroundColor: themeSettings.accentColor }}>Accent</Badge>
                                                        </div>
                                                    </Card.Body>
                                                </Card>

                                                <div className="mb-4">
                                                    <h6 className="mb-3">Quick Themes</h6>
                                                    <div className="row">
                                                        {colorPalettes.map((palette, index) => (
                                                            <div key={index} className="col-md-3 mb-3">
                                                                <Card
                                                                    className="h-100 cursor-pointer"
                                                                    style={{
                                                                        borderWidth: themeSettings.primaryColor === palette.primary ? '2px' : '1px',
                                                                        borderColor: themeSettings.primaryColor === palette.primary ? palette.primary : '#dee2e6',
                                                                        cursor: 'pointer',
                                                                        boxShadow: themeSettings.primaryColor === palette.primary ? `0 0 0 2px ${palette.primary}30` : 'none'
                                                                    }}
                                                                    onClick={() => handleThemePaletteChange(palette)}
                                                                >
                                                                    <Card.Body className="p-3 text-center">
                                                                        <div className="d-flex justify-content-center gap-2 mb-2">
                                                                            <div
                                                                                className="rounded-circle"
                                                                                style={{
                                                                                    width: '20px',
                                                                                    height: '20px',
                                                                                    backgroundColor: palette.primary
                                                                                }}
                                                                            ></div>
                                                                            <div
                                                                                className="rounded-circle"
                                                                                style={{
                                                                                    width: '20px',
                                                                                    height: '20px',
                                                                                    backgroundColor: palette.secondary
                                                                                }}
                                                                            ></div>
                                                                            <div
                                                                                className="rounded-circle"
                                                                                style={{
                                                                                    width: '20px',
                                                                                    height: '20px',
                                                                                    backgroundColor: palette.accent
                                                                                }}
                                                                            ></div>
                                                                        </div>
                                                                        <small className="fw-semibold">{palette.name}</small>

                                                                        {themeSettings.primaryColor === palette.primary && (
                                                                            <span className="position-absolute top-0 end-0 p-1 m-1">
                                                                                <FiCheck className="text-success" size={16} />
                                                                            </span>
                                                                        )}
                                                                    </Card.Body>
                                                                </Card>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>

                                                <div className="mb-4">
                                                    <h6 className="mb-3">Custom Colors</h6>
                                                    <div className="row">
                                                        <div className="col-md-4">
                                                            <Form.Group className="mb-3">
                                                                <Form.Label>Primary Color</Form.Label>
                                                                <div className="d-flex align-items-center">
                                                                    <Form.Control
                                                                        type="color"
                                                                        value={themeSettings.primaryColor}
                                                                        onChange={(e) => handleColorThemeChange('primaryColor', e.target.value)}
                                                                        className="me-2"
                                                                        style={{ width: '50px', height: '38px' }}
                                                                    />
                                                                    <Form.Control
                                                                        type="text"
                                                                        value={themeSettings.primaryColor}
                                                                        onChange={(e) => handleColorThemeChange('primaryColor', e.target.value)}
                                                                        className="form-control-modern"
                                                                    />
                                                                </div>
                                                            </Form.Group>
                                                        </div>
                                                        <div className="col-md-4">
                                                            <Form.Group className="mb-3">
                                                                <Form.Label>Secondary Color</Form.Label>
                                                                <div className="d-flex align-items-center">
                                                                    <Form.Control
                                                                        type="color"
                                                                        value={themeSettings.secondaryColor}
                                                                        onChange={(e) => handleColorThemeChange('secondaryColor', e.target.value)}
                                                                        className="me-2"
                                                                        style={{ width: '50px', height: '38px' }}
                                                                    />
                                                                    <Form.Control
                                                                        type="text"
                                                                        value={themeSettings.secondaryColor}
                                                                        onChange={(e) => handleColorThemeChange('secondaryColor', e.target.value)}
                                                                        className="form-control-modern"
                                                                    />
                                                                </div>
                                                            </Form.Group>
                                                        </div>
                                                        <div className="col-md-4">
                                                            <Form.Group className="mb-3">
                                                                <Form.Label>Accent Color</Form.Label>
                                                                <div className="d-flex align-items-center">
                                                                    <Form.Control
                                                                        type="color"
                                                                        value={themeSettings.accentColor}
                                                                        onChange={(e) => handleColorThemeChange('accentColor', e.target.value)}
                                                                        className="me-2"
                                                                        style={{ width: '50px', height: '38px' }}
                                                                    />
                                                                    <Form.Control
                                                                        type="text"
                                                                        value={themeSettings.accentColor}
                                                                        onChange={(e) => handleColorThemeChange('accentColor', e.target.value)}
                                                                        className="form-control-modern"
                                                                    />
                                                                </div>
                                                            </Form.Group>
                                                        </div>
                                                    </div>
                                                </div>

                                                <Card className="mb-4">
                                                    <Card.Body className="p-4">
                                                        <div className="d-flex justify-content-between align-items-center">
                                                            <div>
                                                                <h6 className="mb-1 fw-bold">Dark Mode</h6>
                                                                <p className="text-muted mb-0">Switch to dark theme for better viewing in low-light environments</p>
                                                            </div>
                                                            <div className="form-switch form-switch-lg">
                                                                <Form.Check
                                                                    type="switch"
                                                                    id="dark-mode"
                                                                    checked={themeSettings.darkMode}
                                                                    onChange={(e) => handleDarkModeToggle(e.target.checked)}
                                                                    className="mt-2"
                                                                    label={themeSettings.darkMode ?
                                                                        <FiMoon className="text-primary ms-2" size={18} /> :
                                                                        <FiSun className="text-warning ms-2" size={18} />
                                                                    }
                                                                />
                                                            </div>
                                                        </div>
                                                    </Card.Body>
                                                </Card>
                                            </motion.div>
                                        </Tab>

                                        <Tab eventKey="integrations" title="Integrations">
                                            <motion.div
                                                initial={{ opacity: 0, y: 20 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                className="p-4"
                                            >
                                                <div className="d-flex align-items-center justify-content-between mb-4">
                                                    <div>
                                                        <h5 className="fw-bold mb-2">Advanced Integrations</h5>
                                                        <p className="text-muted mb-0">
                                                            Connect your favorite tools to enhance your scheduling workflow with advanced features.
                                                        </p>
                                                    </div>
                                                    {integrationsLoading && (
                                                        <div className="d-flex align-items-center gap-2 text-muted">
                                                            <div className="spinner-border spinner-border-sm" role="status"></div>
                                                            <span>Loading...</span>
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Advanced Integration Cards */}
                                                <Row className="g-4 mb-5">
                                                    {advancedIntegrations.map((integration) => (
                                                        <Col lg={6} key={integration.type}>
                                                            <IntegrationCard
                                                                integration={integration}
                                                                onConnect={handleConnectIntegration}
                                                                onDisconnect={handleDisconnectIntegration}
                                                                onConfigure={handleConfigureIntegration}
                                                                isLoading={integrationsLoading}
                                                            />
                                                        </Col>
                                                    ))}
                                                </Row>

                                                <hr className="my-5" />

                                                <h5 className="fw-bold mb-4">Legacy Integrations</h5>
                                                <p className="text-muted mb-4">
                                                    Basic integrations with simplified configuration.
                                                </p>

                                                {/* Enhanced Outlook Integration Card */}
                                                <Card className="mb-3 border">
                                                    <Card.Body className="p-3">
                                                        <div className="d-flex justify-content-between align-items-center">
                                                            <div className="d-flex align-items-center">
                                                                <div className="me-3">
                                                                    <FiCalendar size={24} className="text-primary" />
                                                                </div>
                                                                <div>
                                                                    <h6 className="mb-1 fw-semibold">Microsoft Outlook</h6>
                                                                    <small className="text-muted">
                                                                        {integrations.outlook.connected
                                                                            ? `Connected: ${integrations.outlook.email}`
                                                                            : 'Sync your Outlook calendar and events'
                                                                        }
                                                                    </small>
                                                                </div>
                                                            </div>
                                                            <div className="d-flex align-items-center gap-2">
                                                                {integrations.outlook.connected && (
                                                                    <>
                                                                        <Badge bg="success" className="me-2">
                                                                            <FiCheck size={12} className="me-1" />
                                                                            Connected
                                                                        </Badge>
                                                                        <Button
                                                                            variant="outline-info"
                                                                            size="sm"
                                                                            onClick={syncOutlookCalendar}
                                                                            title="Sync Calendar"
                                                                        >
                                                                            Sync Now
                                                                        </Button>
                                                                    </>
                                                                )}
                                                                <Button
                                                                    variant={integrations.outlook.connected ? 'outline-danger' : 'primary'}
                                                                    size="sm"
                                                                    onClick={integrations.outlook.connected
                                                                        ? handleDisconnectOutlook
                                                                        : handleOutlookConnect
                                                                    }
                                                                >
                                                                    {integrations.outlook.connected ? 'Disconnect' : 'Connect to Outlook'}
                                                                </Button>
                                                            </div>
                                                        </div>

                                                        {integrations.outlook.connected && (
                                                            <div className="mt-3 pt-3 border-top">
                                                                <small className="text-muted">
                                                                    <strong>Permissions:</strong> Read/Write Calendar Events, Create Meetings
                                                                </small>
                                                                <br />
                                                                <small className="text-muted">
                                                                    <strong>Last Sync:</strong> {
                                                                        integrations.outlook.lastSync
                                                                            ? new Date(integrations.outlook.lastSync).toLocaleString()
                                                                            : 'Never'
                                                                    }
                                                                </small>
                                                                <br />
                                                                <small className="text-success">
                                                                    <strong>Status:</strong> Active • Events syncing automatically
                                                                </small>
                                                            </div>
                                                        )}

                                                        {!integrations.outlook.connected && (
                                                            <div className="mt-3 pt-3 border-top">
                                                                <small className="text-muted">
                                                                    <strong>Benefits of connecting:</strong>
                                                                    <ul className="mb-0 mt-1">
                                                                        <li>Automatic calendar synchronization</li>
                                                                        <li>Prevent double-booking</li>
                                                                        <li>Meeting reminders in Outlook</li>
                                                                        <li>Seamless meeting creation</li>
                                                                    </ul>
                                                                </small>
                                                            </div>
                                                        )}
                                                    </Card.Body>
                                                </Card>

                                                {/* Other integrations */}
                                                {Object.entries(integrations).filter(([service]) => service !== 'outlook').map(([service, config]) => (
                                                    <Card key={service} className="mb-3 border">
                                                        <Card.Body className="p-3">
                                                            <div className="d-flex justify-content-between align-items-center">
                                                                <div className="d-flex align-items-center">
                                                                    <div className="me-3">
                                                                        {service === 'google' && <FiCalendar size={24} className="text-danger" />}
                                                                        {service === 'zoom' && <FiVideo size={24} className="text-info" />}
                                                                        {service === 'teams' && <FiVideo size={24} className="text-primary" />}
                                                                        {service === 'vitelglobal' && <FiVideo size={24} className="text-success" />}
                                                                    </div>
                                                                    <div>
                                                                        <h6 className="mb-1 fw-semibold">{getIntegrationName(service)}</h6>
                                                                        <small className="text-muted">
                                                                            {config.connected ? `Connected: ${config.email}` : 'Not connected'}
                                                                        </small>
                                                                    </div>
                                                                </div>
                                                                <div className="d-flex align-items-center">
                                                                    {config.connected && (
                                                                        <Badge bg="success" className="me-2">
                                                                            <FiCheck size={12} className="me-1" />
                                                                            Connected
                                                                        </Badge>
                                                                    )}
                                                                    <Button
                                                                        variant={config.connected ? 'outline-danger' : 'outline-primary'}
                                                                        size="sm"
                                                                        onClick={() => handleToggleIntegration(service)}
                                                                    >
                                                                        {config.connected ? 'Disconnect' : 'Connect'}
                                                                    </Button>
                                                                </div>
                                                            </div>

                                                            {/* Additional information for VitelGlobal Meet */}
                                                            {service === 'vitelglobal' && !config.connected && (
                                                                <div className="mt-3 pt-3 border-top">
                                                                    <small className="text-muted">
                                                                        <strong>About VitelGlobal Meet:</strong> Secure, high-quality video conferencing for seamless virtual meetings and collaboration.
                                                                    </small>
                                                                </div>
                                                            )}
                                                        </Card.Body>
                                                    </Card>
                                                ))}
                                            </motion.div>
                                        </Tab>
                                    </Tabs>
                                </Card.Body>
                            </Card>
                        </motion.div>
                    </Col>
                </Row>
            </Container>
        </motion.div>
    );
};

export default SettingsPage;
