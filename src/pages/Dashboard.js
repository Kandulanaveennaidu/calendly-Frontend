import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Badge, Modal, Form, Table, Dropdown, Spinner, Alert } from 'react-bootstrap';
import { motion } from 'framer-motion';
import { FiCalendar, FiPlus, FiUsers, FiClock, FiSettings, FiEdit, FiTrash2, FiCopy, FiEye, FiEyeOff, FiMoreVertical, FiX, FiVideo, FiMail, FiPhone, FiUser, FiRefreshCw } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import dashboardService from '../services/dashboardService';
import meetingTypeService from '../services/meetingTypeService';
import timezoneService from '../services/timezoneService';

// Loader component for infinite scrolling
const LoadingIndicator = () => (
    <div className="text-center py-3">
        <Spinner animation="border" variant="primary" size="sm" className="me-2" />
        <span className="text-muted">Loading more items...</span>
    </div>
);

const Dashboard = () => {
    const navigate = useNavigate();

    // Dashboard Stats State
    const [dashboardStats, setDashboardStats] = useState({
        totalMeetings: 0,
        thisWeekMeetings: 0,
        totalMeetingTypes: 0,
        totalBookings: 0
    });

    // Meetings State - Ensure it's always an array
    const [meetingTypes, setMeetingTypes] = useState([]);
    const [meetingTypesPage, setMeetingTypesPage] = useState(1);
    const [meetingTypesLoading, setMeetingTypesLoading] = useState(false);
    const [meetingTypesHasMore, setMeetingTypesHasMore] = useState(true);
    const [meetingTypesInitialLoading, setMeetingTypesInitialLoading] = useState(true);

    // Modal States
    const [showNewMeetingModal, setShowNewMeetingModal] = useState(false);
    const [showManageModal, setShowManageModal] = useState(false);
    const [editingMeetingType, setEditingMeetingType] = useState(null);

    // Add timezone state - Initialize as empty array
    const [timeZones, setTimeZones] = useState([]);
    const [timeZonesLoading, setTimeZonesLoading] = useState(true);

    // Form State - Initialize with India timezone
    const [newMeetingType, setNewMeetingType] = useState({
        name: '',
        duration: 30,
        description: '',
        color: '#006bff',
        availableDate: '',
        timezone: 'Asia/Kolkata' // Default to India timezone
    });

    // Error and Success States
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    // Manage Modal States
    const [manageMeetingTypes, setManageMeetingTypes] = useState([]);
    const [manageMeetingTypesPage, setManageMeetingTypesPage] = useState(1);
    const [manageMeetingTypesLoading, setManageMeetingTypesLoading] = useState(false);
    const [manageMeetingTypesHasMore, setManageMeetingTypesHasMore] = useState(true);

    // Intersection Observer refs
    const meetingTypesObserver = useRef();
    const manageMeetingTypesObserver = useRef();

    // Add confirmation modal states
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [deleteTarget, setDeleteTarget] = useState(null);

    // Add new state for bookings
    const [recentBookings, setRecentBookings] = useState([]);
    const [bookingsLoading, setBookingsLoading] = useState(false);
    const [showBookingsModal, setShowBookingsModal] = useState(false);
    const [selectedMeetingBookings, setSelectedMeetingBookings] = useState([]);
    const [selectedMeetingName, setSelectedMeetingName] = useState('');

    // Load initial data on component mount
    useEffect(() => {
        loadDashboardStats();
        loadMeetingTypes();
        loadTimezones(); // Add timezone loading
    }, []);

    // Load Dashboard Statistics
    const loadDashboardStats = async () => {
        try {
            const response = await dashboardService.getDashboardStats();
            console.log('Dashboard stats loaded:', response);

            // Handle the new API response structure
            if (response.stats) {
                setDashboardStats(response.stats);
            } else if (response.success && response.data && response.data.statistics) {
                // Direct handling if the service doesn't process it
                const stats = {
                    totalMeetings: 0,
                    thisWeekMeetings: 0,
                    totalMeetingTypes: 0,
                    totalBookings: 0
                };

                response.data.statistics.forEach(stat => {
                    switch (stat.title) {
                        case 'Total Meetings':
                            stats.totalMeetings = parseInt(stat.value) || 0;
                            break;
                        case 'This Week':
                            stats.thisWeekMeetings = parseInt(stat.value) || 0;
                            break;
                        case 'Total Meetings Types':
                            stats.totalMeetingTypes = parseInt(stat.value) || 0;
                            break;
                        case 'Total Bookings':
                            stats.totalBookings = parseInt(stat.value) || 0;
                            break;
                    }
                });

                setDashboardStats(stats);
            } else {
                // Fallback for other response structures
                setDashboardStats({
                    totalMeetings: response.totalMeetings || 0,
                    thisWeekMeetings: response.thisWeekMeetings || 0,
                    totalMeetingTypes: response.totalMeetingTypes || 0,
                    totalBookings: response.totalBookings || 0
                });
            }
        } catch (error) {
            console.error('Failed to load dashboard stats:', error);
            setError('Failed to load dashboard statistics');
        }
    };

    // Load Meetings
    const loadMeetingTypes = async (page = 1, append = false) => {
        try {
            setMeetingTypesLoading(true);
            const response = await meetingTypeService.getMeetingTypes(page, 10);
            console.log('Meetings loaded:', response);

            // Handle different response structures based on the actual API response
            let newMeetingTypes = [];
            if (response.success && response.data && response.data.meetingTypes && Array.isArray(response.data.meetingTypes)) {
                // This matches your actual API response structure
                newMeetingTypes = response.data.meetingTypes;
            } else if (response.meetingTypes && Array.isArray(response.meetingTypes)) {
                newMeetingTypes = response.meetingTypes;
            } else if (response.data && Array.isArray(response.data)) {
                newMeetingTypes = response.data;
            } else if (Array.isArray(response)) {
                newMeetingTypes = response;
            } else {
                console.warn('Unexpected response structure:', response);
                newMeetingTypes = [];
            }

            console.log('Processed Meetings:', newMeetingTypes);

            if (append) {
                setMeetingTypes(prev => {
                    // Ensure prev is an array
                    const prevArray = Array.isArray(prev) ? prev : [];
                    return [...prevArray, ...newMeetingTypes];
                });
            } else {
                setMeetingTypes(newMeetingTypes);
            }

            // Handle pagination from the actual API response
            let hasMoreItems = false;
            if (response.success && response.data && response.data.pagination) {
                hasMoreItems = response.data.pagination.hasMore;
            } else if (response.pagination) {
                hasMoreItems = response.pagination.hasMore ||
                    (response.pagination.total > response.pagination.page * response.pagination.limit);
            } else {
                hasMoreItems = newMeetingTypes.length === 10;
            }

            setMeetingTypesHasMore(hasMoreItems);
            setMeetingTypesPage(page);
        } catch (error) {
            console.error('Failed to load Meetings:', error);
            setError('Failed to load Meetings');
            // Ensure meetingTypes is always an array even on error
            if (!append) {
                setMeetingTypes([]);
            }
        } finally {
            setMeetingTypesLoading(false);
            setMeetingTypesInitialLoading(false);
        }
    };

    // Intersection Observer for Meetings
    const meetingTypesLastElementRef = useCallback(node => {
        if (meetingTypesLoading) return;
        if (meetingTypesObserver.current) meetingTypesObserver.current.disconnect();
        meetingTypesObserver.current = new IntersectionObserver(entries => {
            if (entries[0].isIntersecting && meetingTypesHasMore) {
                loadMeetingTypes(meetingTypesPage + 1, true);
            }
        });
        if (node) meetingTypesObserver.current.observe(node);
    }, [meetingTypesLoading, meetingTypesHasMore, meetingTypesPage]);

    // Load timezones from API only
    const loadTimezones = async () => {
        try {
            setTimeZonesLoading(true);
            console.log('Loading timezones from API...');

            const response = await timezoneService.getTimezones();

            if (response.success && response.data && Array.isArray(response.data)) {
                setTimeZones(response.data);
                console.log('Timezones loaded:', response.data.length, 'timezones');

                // Set user's timezone as default if form timezone is empty
                if (!newMeetingType.timezone || newMeetingType.timezone === 'Asia/Kolkata') {
                    const userTimezone = timezoneService.getUserTimezone();
                    console.log('Setting default timezone to user timezone:', userTimezone);

                    // Check if user's timezone exists in the API data
                    const userTimezoneData = response.data.find(tz => tz.value === userTimezone);
                    if (userTimezoneData) {
                        setNewMeetingType(prev => ({
                            ...prev,
                            timezone: userTimezone
                        }));
                        console.log('User timezone found in API data:', userTimezoneData.label);
                    } else {
                        // Try to find India timezone
                        const indiaTimezone = response.data.find(tz =>
                            tz.value.includes('Asia/Kolkata') ||
                            tz.value.includes('Asia/Calcutta') ||
                            tz.label.toLowerCase().includes('india') ||
                            tz.label.toLowerCase().includes('kolkata')
                        );

                        if (indiaTimezone) {
                            setNewMeetingType(prev => ({
                                ...prev,
                                timezone: indiaTimezone.value
                            }));
                            console.log('Using India timezone:', indiaTimezone.label);
                        } else if (response.data.length > 0) {
                            // Use first available timezone as fallback
                            setNewMeetingType(prev => ({
                                ...prev,
                                timezone: response.data[0].value
                            }));
                            console.log('Using first available timezone:', response.data[0].label);
                        }
                    }
                }
            } else {
                console.error('Invalid timezone response from API:', response);
                setError('Failed to load timezones from server.');
            }
        } catch (error) {
            console.error('Error loading timezones:', error);
            setError('Unable to load timezones. Please check your connection.');
        } finally {
            setTimeZonesLoading(false);
        }
    };

    // Handle Create Meeting Type
    const handleCreateMeetingType = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        try {
            // Create the payload with timezone support
            const apiData = {
                name: newMeetingType.name,
                description: newMeetingType.description,
                duration: newMeetingType.duration,
                color: newMeetingType.color,
                timezone: newMeetingType.timezone, // Include timezone
                availableDate: newMeetingType.availableDate,
                availableDays: [1, 2, 3, 4, 5], // Monday to Friday
                availableTimeSlots: [
                    {
                        "start": "09:00",
                        "end": "17:00",
                        "timezone": newMeetingType.timezone // Include timezone in slots
                    }
                ]
            };

            const response = await meetingTypeService.createMeetingType(apiData);
            console.log('Meeting type created:', response);

            setSuccess(response.message || 'Meeting type created successfully!');
            setNewMeetingType({
                name: '',
                duration: 30,
                description: '',
                color: '#006bff',
                availableDate: '',
                timezone: timezoneService.getUserTimezone()
            });
            setShowNewMeetingModal(false);

            // Force reload all data
            await Promise.all([
                loadMeetingTypes(1, false),
                loadDashboardStats(),
                loadManageMeetingTypes(1, false)
            ]);

        } catch (error) {
            console.error('Failed to create meeting type:', error);
            setError(error.message || 'Failed to create meeting type');
        }
    };

    // Handle Update Meeting Type
    const handleUpdateMeetingType = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        try {
            const meetingTypeId = editingMeetingType._id || editingMeetingType.id;

            // Create the payload with timezone support
            const apiData = {
                name: newMeetingType.name,
                description: newMeetingType.description,
                duration: newMeetingType.duration,
                color: newMeetingType.color,
                timezone: newMeetingType.timezone, // Include timezone
                availableDate: newMeetingType.availableDate,
                availableDays: [1, 2, 3, 4, 5], // Monday to Friday
                availableTimeSlots: [
                    {
                        "start": "09:00",
                        "end": "17:00",
                        "timezone": newMeetingType.timezone // Include timezone in slots
                    }
                ]
            };

            const response = await meetingTypeService.updateMeetingType(meetingTypeId, apiData);
            console.log('Meeting type updated:', response);

            setSuccess(response.message || 'Meeting type updated successfully!');
            setEditingMeetingType(null);
            setNewMeetingType({
                name: '',
                duration: 30,
                description: '',
                color: '#006bff',
                availableDate: '',
                timezone: timezoneService.getUserTimezone()
            });
            setShowNewMeetingModal(false);

            // Force reload all data
            await Promise.all([
                loadMeetingTypes(1, false),
                loadDashboardStats(),
                loadManageMeetingTypes(1, false)
            ]);

        } catch (error) {
            console.error('Failed to update meeting type:', error);
            setError(error.message || 'Failed to update meeting type');
        }
    };

    // Handle Delete Meeting Type - Updated with professional confirmation
    const handleDeleteMeetingType = async (meetingType) => {
        setDeleteTarget(meetingType);
        setShowDeleteConfirm(true);
    };

    // Confirm delete function
    const confirmDelete = async () => {
        if (deleteTarget) {
            try {
                const meetingTypeId = deleteTarget._id || deleteTarget.id;
                await meetingTypeService.deleteMeetingType(meetingTypeId);
                setSuccess('Meeting type deleted successfully!');

                // Force reload all data to ensure UI updates
                await Promise.all([
                    loadMeetingTypes(1, false), // Reset to first page
                    loadDashboardStats(),
                    loadManageMeetingTypes(1, false) // Also reload manage modal data
                ]);

            } catch (error) {
                console.error('Failed to delete meeting type:', error);
                setError(error.message || 'Failed to delete meeting type');
            }
        }
        setShowDeleteConfirm(false);
        setDeleteTarget(null);
    };

    // Cancel delete function
    const cancelDelete = () => {
        setShowDeleteConfirm(false);
        setDeleteTarget(null);
    };

    // Handle Toggle Active Status - Updated to refresh manage modal
    const handleToggleActive = async (meetingType) => {
        try {
            const meetingTypeId = meetingType._id || meetingType.id;
            const response = await meetingTypeService.toggleMeetingTypeStatus(meetingTypeId);
            console.log('Meeting type status toggled:', response);

            setSuccess(response.message || 'Meeting type status updated successfully!');

            // Force reload all data to ensure UI updates
            await Promise.all([
                loadMeetingTypes(1, false), // Reset to first page
                loadDashboardStats(),
                loadManageMeetingTypes(1, false) // Also reload manage modal data
            ]);

        } catch (error) {
            console.error('Failed to toggle meeting type status:', error);
            setError(error.message || 'Failed to update meeting type status');
        }
    };

    // Enhanced handleEditMeetingType with timezone
    const handleEditMeetingType = (meetingType) => {
        setEditingMeetingType(meetingType);
        setNewMeetingType({
            name: meetingType.name || '',
            duration: meetingType.duration || 30,
            description: meetingType.description || '',
            color: meetingType.color || '#006bff',
            timezone: meetingType.timezone || timezoneService.getUserTimezone(), // Include timezone
            availableDate: meetingType.dateFormatted ||
                (meetingType.availableDate ? meetingType.availableDate.split('T')[0] : '')
        });
        setShowNewMeetingModal(true);
        setShowManageModal(false);
    };

    // Copy Link to Clipboard
    const handleCopyLink = (link) => {
        const fullLink = link.startsWith('http') ? link : `https://${link}`;
        navigator.clipboard.writeText(fullLink);
        setSuccess('Link copied to clipboard!');
        setTimeout(() => setSuccess(''), 3000);
    };

    // Load Manage Modal Meetings
    const loadManageMeetingTypes = async (page = 1, append = false) => {
        try {
            setManageMeetingTypesLoading(true);
            const response = await meetingTypeService.getMeetingTypes(page, 10);

            // Handle different response structures - same as loadMeetingTypes
            let newMeetingTypes = [];
            if (response.success && response.data && response.data.meetingTypes && Array.isArray(response.data.meetingTypes)) {
                newMeetingTypes = response.data.meetingTypes;
            } else if (response.meetingTypes && Array.isArray(response.meetingTypes)) {
                newMeetingTypes = response.meetingTypes;
            } else if (response.data && Array.isArray(response.data)) {
                newMeetingTypes = response.data;
            } else if (Array.isArray(response)) {
                newMeetingTypes = response;
            } else {
                console.warn('Unexpected response structure:', response);
                newMeetingTypes = [];
            }

            if (append) {
                setManageMeetingTypes(prev => {
                    // Ensure prev is an array
                    const prevArray = Array.isArray(prev) ? prev : [];
                    return [...prevArray, ...newMeetingTypes];
                });
            } else {
                setManageMeetingTypes(newMeetingTypes);
            }

            // Handle pagination
            let hasMoreItems = false;
            if (response.success && response.data && response.data.pagination) {
                hasMoreItems = response.data.pagination.hasMore;
            } else if (response.pagination) {
                hasMoreItems = response.pagination.hasMore ||
                    (response.pagination.total > response.pagination.page * response.pagination.limit);
            } else {
                hasMoreItems = newMeetingTypes.length === 10;
            }

            setManageMeetingTypesHasMore(hasMoreItems);
            setManageMeetingTypesPage(page);
        } catch (error) {
            console.error('Failed to load manage Meetings:', error);
            // Ensure manageMeetingTypes is always an array even on error
            if (!append) {
                setManageMeetingTypes([]);
            }
        } finally {
            setManageMeetingTypesLoading(false);
        }
    };

    // Intersection Observer for Manage Modal
    const manageMeetingTypesLastElementRef = useCallback(node => {
        if (manageMeetingTypesLoading) return;
        if (manageMeetingTypesObserver.current) manageMeetingTypesObserver.current.disconnect();
        manageMeetingTypesObserver.current = new IntersectionObserver(entries => {
            if (entries[0].isIntersecting && manageMeetingTypesHasMore) {
                loadManageMeetingTypes(manageMeetingTypesPage + 1, true);
            }
        });
        if (node) manageMeetingTypesObserver.current.observe(node);
    }, [manageMeetingTypesLoading, manageMeetingTypesHasMore, manageMeetingTypesPage]);

    // Reset and initialize manage Meetings when modal opens
    useEffect(() => {
        if (showManageModal) {
            loadManageMeetingTypes();
        }
    }, [showManageModal]);

    // Statistics data with real values
    const statisticsData = [
        { title: "Total Meetings", value: dashboardStats.totalMeetings.toString(), icon: FiCalendar, color: "primary" },
        { title: "This Week", value: dashboardStats.thisWeekMeetings.toString(), icon: FiClock, color: "success" },
        { title: "Total Meetings Types", value: dashboardStats.totalMeetingTypes.toString(), icon: FiSettings, color: "info" },
        { title: "Total Bookings", value: dashboardStats.totalBookings.toString(), icon: FiUsers, color: "warning" }
    ];

    // Add a manual refresh function
    const handleRefreshDashboard = async () => {
        setError('');
        setSuccess('');

        try {
            await Promise.all([
                loadDashboardStats(),
                loadMeetingTypes(1, false)
            ]);
            setSuccess('Dashboard refreshed successfully!');
        } catch (error) {
            console.error('Failed to refresh dashboard:', error);
            setError('Failed to refresh dashboard');
        }
    };

    // Helper function for authenticated API calls
    const makeAuthenticatedRequest = async (url, options = {}) => {
        const authToken = localStorage.getItem('authToken');

        if (!authToken) {
            throw new Error('No authentication token found');
        }

        const defaultHeaders = {
            'Authorization': `Bearer ${authToken}`,
            'Content-Type': 'application/json',
            ...options.headers
        };

        const response = await fetch(url, {
            ...options,
            headers: defaultHeaders
        });

        if (response.status === 401) {
            // Token expired or invalid
            localStorage.removeItem('authToken');
            localStorage.removeItem('currentUser');
            throw new Error('Session expired. Please log in again.');
        }

        return response;
    };

    // Updated loadRecentBookings to handle your actual API response
    const loadRecentBookings = async () => {
        try {
            setBookingsLoading(true);
            const allBookings = [];

            for (const meetingType of meetingTypes) {
                try {
                    const response = await makeAuthenticatedRequest(
                        `http://localhost:5000/api/v1/meetings/public/${meetingType._id || meetingType.id}/bookings`
                    );
                    const data = await response.json();

                    console.log('Bookings API Response:', data);

                    // Handle your actual API response structure
                    if (data.success && data.data && Array.isArray(data.data)) {
                        const processedBookings = data.data.map(booking => ({
                            // Map your API fields to frontend expected fields
                            _id: booking.id,
                            date: booking.date,
                            time: booking.time || '10:00', // Default time if not provided
                            status: booking.status,
                            createdAt: booking.createdAt,
                            scheduledAt: booking.createdAt,
                            // Extract guest info from title (if available) or set defaults
                            guestInfo: {
                                name: booking.title ? booking.title.replace(' with ', ' - ') : 'Guest',
                                // email: booking.email || 'No email provided',
                                phone: booking.phone || '',
                                message: booking.message || ''
                            },
                            // Add meeting type info
                            meetingTypeName: meetingType.name,
                            meetingTypeColor: meetingType.color,
                            meetingTypeId: meetingType._id || meetingType.id
                        }));
                        allBookings.push(...processedBookings);
                    }
                } catch (error) {
                    console.error(`Failed to load bookings for ${meetingType.name}:`, error);
                    if (error.message.includes('Session expired')) {
                        setError(error.message);
                        navigate('/login');
                        return;
                    }
                }
            }

            console.log('Processed bookings:', allBookings);

            // Sort by creation date (newest first) and take last 5
            const sortedBookings = allBookings
                .sort((a, b) => new Date(b.createdAt || b.scheduledAt) - new Date(a.createdAt || a.scheduledAt))
                .slice(0, 5);

            setRecentBookings(sortedBookings);
        } catch (error) {
            console.error('Failed to load recent bookings:', error);
            if (error.message.includes('Session expired')) {
                setError(error.message);
                navigate('/login');
            }
        } finally {
            setBookingsLoading(false);
        }
    };

    // Updated loadMeetingBookings to handle your actual API response
    const loadMeetingBookings = async (meetingTypeId, meetingTypeName) => {
        try {
            const response = await makeAuthenticatedRequest(
                `http://localhost:5000/api/v1/meetings/public/${meetingTypeId}/bookings`
            );
            const data = await response.json();

            console.log('Single meeting bookings response:', data);

            if (data.success && data.data && Array.isArray(data.data)) {
                // Map your API response to expected format
                const mappedBookings = data.data.map(booking => ({
                    _id: booking.id,
                    date: booking.date,
                    time: booking.time || '10:00',
                    status: booking.status,
                    createdAt: booking.createdAt,
                    scheduledAt: booking.createdAt,
                    guestInfo: {
                        name: booking.title ? booking.title.replace(' with ', ' - ') : 'Guest',
                        // email: booking.email || 'No email provided',
                        phone: booking.phone || '',
                        message: booking.message || ''
                    }
                }));

                setSelectedMeetingBookings(mappedBookings);
                setSelectedMeetingName(meetingTypeName);
                setShowBookingsModal(true);
            } else {
                setError(data.message || 'Failed to load meeting bookings');
            }
        } catch (error) {
            console.error('Failed to load meeting bookings:', error);
            if (error.message.includes('Session expired')) {
                setError(error.message);
                navigate('/login');
            } else {
                setError('Failed to load meeting bookings');
            }
        }
    };

    // Update useEffect to load bookings when meetingTypes change
    useEffect(() => {
        if (meetingTypes.length > 0) {
            console.log('Loading bookings for meeting List:', meetingTypes);
            loadRecentBookings();
        }
    }, [meetingTypes]);

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="page-transition py-5"
        >
            <Container>
                {/* Header */}
                <Row>
                    <Col>
                        <motion.div
                            initial={{ y: 30, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.1 }}
                            className="d-flex justify-content-between align-items-center mb-4"
                        >
                            <div>
                                <h1 className="h2 fw-bold mb-2">Dashboard</h1>
                                <p className="text-muted">Manage your meetings and schedule</p>
                            </div>
                            <div className="d-flex gap-2">
                                {/* <Button
                                    variant="outline-secondary"
                                    onClick={handleRefreshDashboard}
                                    size="sm"
                                >
                                    Refresh
                                </Button> */}
                                <Button
                                    variant="primary"
                                    className="btn-modern"
                                    onClick={() => setShowNewMeetingModal(true)}
                                >
                                    <FiPlus className="me-2" />
                                    New Meetings
                                </Button>
                            </div>
                        </motion.div>
                    </Col>
                </Row>

                {/* Alert Messages */}
                {error && (
                    <Alert variant="danger" dismissible onClose={() => setError('')} className="mb-4">
                        {error}
                    </Alert>
                )}

                {success && (
                    <Alert variant="success" dismissible onClose={() => setSuccess('')} className="mb-4">
                        {success}
                    </Alert>
                )}

                {/* Statistics Cards - Force re-render with key */}
                <Row className="mb-4" key={`stats-${dashboardStats.totalMeetingTypes}-${Date.now()}`}>
                    {statisticsData.map((stat, index) => (
                        <Col md={3} key={`${stat.title}-${index}`} className="mb-3">
                            <motion.div
                                initial={{ y: 30, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ delay: 0.2 + index * 0.1 }}
                                whileHover={{ y: -5 }}
                                key={`motion-${stat.value}-${index}`}
                            >
                                <Card className="card-modern text-center h-100">
                                    <Card.Body className="p-4">
                                        <stat.icon size={40} className={`text-${stat.color} mb-3`} />
                                        <h3 className="fw-bold">{stat.value}</h3>
                                        <p className="text-muted mb-0">{stat.title}</p>
                                    </Card.Body>
                                </Card>
                            </motion.div>
                        </Col>
                    ))}
                </Row>

                {/* Main Content Row */}
                <Row className="mb-4">
                    {/* Meetings Section - Make it smaller to fit bookings */}
                    <Col lg={8}>
                        <motion.div
                            initial={{ y: 30, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.5 }}
                        >
                            <Card className="card-modern">
                                <Card.Header className="bg-white border-0 p-4">
                                    <div className="d-flex justify-content-between align-items-center">
                                        <h5 className="mb-0 fw-bold">Meeting List</h5>
                                        <div className="d-flex gap-2">
                                            <Button
                                                variant="outline-primary"
                                                size="sm"
                                                onClick={() => setShowManageModal(true)}
                                            >
                                                <FiSettings className="me-1" />
                                                Manage
                                            </Button>
                                        </div>
                                    </div>
                                </Card.Header>
                                <Card.Body className="p-0" style={{ maxHeight: '400px', overflowY: 'auto' }}>
                                    {meetingTypesInitialLoading ? (
                                        <div className="text-center py-5">
                                            <Spinner animation="border" variant="primary" />
                                            <p className="mt-2 text-muted">Loading Meeting List...</p>
                                        </div>
                                    ) : !Array.isArray(meetingTypes) || meetingTypes.length === 0 ? (
                                        <div className="text-center py-5">
                                            <p className="text-muted">No Meeting List found. Create your first meeting type!</p>
                                            <Button
                                                variant="primary"
                                                onClick={() => setShowNewMeetingModal(true)}
                                                className="mt-2"
                                            >
                                                <FiPlus className="me-2" />
                                                Create Meeting Type
                                            </Button>
                                        </div>
                                    ) : (
                                        meetingTypes.map((type, index) => {
                                            const isLast = meetingTypes.length === index + 1;
                                            const shareUrl = `${window.location.origin}/schedule/${type._id || type.id}`;

                                            return (
                                                <motion.div
                                                    ref={isLast ? meetingTypesLastElementRef : null}
                                                    key={type._id || type.id}
                                                    initial={{ x: -30, opacity: 0 }}
                                                    animate={{ x: 0, opacity: 1 }}
                                                    transition={{ delay: 0.1 }}
                                                    className="p-3 border-bottom"
                                                    whileHover={{ backgroundColor: "#f8f9fa" }}
                                                >
                                                    <div className="d-flex justify-content-between align-items-center">
                                                        <div className="d-flex align-items-center">
                                                            <div
                                                                className="rounded-circle me-3"
                                                                style={{
                                                                    width: '10px',
                                                                    height: '10px',
                                                                    backgroundColor: type.color || '#006bff'
                                                                }}
                                                            ></div>
                                                            <div>
                                                                <h6 className="mb-1 fw-semibold small">{type.name || 'Unnamed Meeting'}</h6>
                                                                <div className="d-flex align-items-center text-muted" style={{ fontSize: '12px' }}>
                                                                    <FiClock size={12} className="me-1" />
                                                                    {type.duration || 30} min
                                                                    <span className="mx-1">•</span>
                                                                    <FiUsers size={12} className="me-1" />
                                                                    <Button
                                                                        variant="link"
                                                                        className="p-0 text-decoration-none"
                                                                        style={{ fontSize: '12px' }}
                                                                        onClick={() => loadMeetingBookings(type._id || type.id, type.name)}
                                                                    >
                                                                        {type.totalBookings || 0} bookings
                                                                    </Button>
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div className="d-flex align-items-center gap-1">
                                                            <Button
                                                                variant="outline-secondary"
                                                                size="sm"
                                                                onClick={() => handleCopyLink(shareUrl)}
                                                                title="Copy link"
                                                            >
                                                                <FiCopy size={12} />
                                                            </Button>
                                                            <Dropdown>
                                                                <Dropdown.Toggle variant="outline-secondary" size="sm">
                                                                    <FiMoreVertical size={12} />
                                                                </Dropdown.Toggle>
                                                                <Dropdown.Menu>
                                                                    <Dropdown.Item onClick={() => handleEditMeetingType(type)}>
                                                                        <FiEdit className="me-2" /> Edit
                                                                    </Dropdown.Item>
                                                                    <Dropdown.Item onClick={() => handleToggleActive(type)}>
                                                                        <FiEye className="me-2" />
                                                                        {type.isActive !== false ? 'Deactivate' : 'Activate'}
                                                                    </Dropdown.Item>
                                                                    <Dropdown.Divider />
                                                                    <Dropdown.Item
                                                                        className="text-danger"
                                                                        onClick={() => handleDeleteMeetingType(type)}
                                                                    >
                                                                        <FiTrash2 className="me-2" /> Delete
                                                                    </Dropdown.Item>
                                                                </Dropdown.Menu>
                                                            </Dropdown>
                                                        </div>
                                                    </div>
                                                </motion.div>
                                            );
                                        })
                                    )}
                                    {meetingTypesLoading && <LoadingIndicator />}
                                </Card.Body>
                            </Card>
                        </motion.div>
                    </Col>

                    {/* Recent Bookings Section - Update UI to handle the data better */}
                    <Col lg={4}>
                        <motion.div
                            initial={{ y: 30, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.6 }}
                        >
                            <Card className="card-modern">
                                <Card.Header className="bg-white border-0 p-4">
                                    <div className="d-flex justify-content-between align-items-center">
                                        <h5 className="mb-0 fw-bold">Recent Bookings</h5>
                                        {/* <Button
                                            variant="outline-primary"
                                            size="sm"
                                            onClick={loadRecentBookings}
                                            disabled={bookingsLoading}
                                        >
                                            {bookingsLoading ? <Spinner size="sm" /> : 'Refresh'}
                                        </Button> */}
                                    </div>
                                </Card.Header>
                                <Card.Body className="p-0" style={{ maxHeight: '400px', overflowY: 'auto' }}>
                                    {bookingsLoading ? (
                                        <div className="text-center py-4">
                                            <Spinner animation="border" variant="primary" size="sm" />
                                            <p className="mt-2 text-muted small">Loading bookings...</p>
                                        </div>
                                    ) : recentBookings.length === 0 ? (
                                        <div className="text-center py-4">
                                            <p className="text-muted small">No bookings yet</p>
                                            <p className="text-muted" style={{ fontSize: '11px' }}>Share your meeting links to get started!</p>
                                        </div>
                                    ) : (
                                        recentBookings.map((booking, index) => (
                                            <div key={booking._id || index} className="p-3 border-bottom">
                                                <div className="d-flex align-items-start">
                                                    <div
                                                        className="rounded-circle me-2 flex-shrink-0"
                                                        style={{
                                                            width: '8px',
                                                            height: '8px',
                                                            backgroundColor: booking.meetingTypeColor || '#006bff',
                                                            marginTop: '6px'
                                                        }}
                                                    ></div>
                                                    <div className="flex-grow-1">
                                                        <div className="d-flex justify-content-between align-items-start mb-1">
                                                            <h6 className="mb-0" style={{ fontSize: '13px', fontWeight: 600 }}>
                                                                {booking.guestInfo?.name || 'Guest'}
                                                            </h6>
                                                            <span className="text-muted" style={{ fontSize: '10px' }}>
                                                                {new Date(booking.scheduledAt || booking.date).toLocaleDateString()}
                                                            </span>
                                                        </div>
                                                        {/* <p className="mb-1 text-muted" style={{ fontSize: '11px' }}>
                                                            <FiMail size={10} className="me-1" />
                                                            {booking.guestInfo?.email || 'No email'}
                                                        </p> */}
                                                        <p className="mb-1" style={{ fontSize: '11px', fontWeight: 500 }}>
                                                            {booking.meetingTypeName}
                                                        </p>
                                                        <div className="d-flex align-items-center text-muted" style={{ fontSize: '10px' }}>
                                                            <FiCalendar size={10} className="me-1" />
                                                            {booking.date} at {booking.time}
                                                            <span className="mx-1">•</span>
                                                            <Badge
                                                                bg={booking.status === 'confirmed' ? 'success' : 'secondary'}
                                                                className="small"
                                                                style={{ fontSize: '8px' }}
                                                            >
                                                                {booking.status}
                                                            </Badge>
                                                        </div>
                                                        {booking.guestInfo?.message && (
                                                            <p className="mb-0 mt-1 text-muted" style={{ fontSize: '10px', fontStyle: 'italic' }}>
                                                                "{booking.guestInfo.message.substring(0, 50)}..."
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </Card.Body>
                            </Card>
                        </motion.div>
                    </Col>
                </Row>

                {/* New Meeting Type Modal */}
                <Modal
                    show={showNewMeetingModal}
                    onHide={() => {
                        setShowNewMeetingModal(false);
                        setEditingMeetingType(null);
                        setNewMeetingType({
                            name: '',
                            duration: 30,
                            description: '',
                            color: '#006bff',
                            availableDate: '',
                            timezone: timezoneService.getUserTimezone()
                        });
                    }}
                    centered
                    size="lg"
                >
                    <Modal.Header closeButton>
                        <Modal.Title>
                            {editingMeetingType ? 'Edit Meeting Type' : 'Create New Meeting Type'}
                        </Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <Form onSubmit={editingMeetingType ? handleUpdateMeetingType : handleCreateMeetingType}>
                            <Row>
                                <Col md={8}>
                                    <Form.Group className="mb-3">
                                        <Form.Label>Meeting Name *</Form.Label>
                                        <Form.Control
                                            type="text"
                                            placeholder="e.g., 30 Minute Meeting"
                                            value={newMeetingType.name}
                                            onChange={(e) => setNewMeetingType({
                                                ...newMeetingType,
                                                name: e.target.value
                                            })}
                                            className="form-control-modern"
                                            required
                                        />
                                    </Form.Group>
                                </Col>
                                <Col md={4}>
                                    <Form.Group className="mb-3">
                                        <Form.Label>Duration (minutes) *</Form.Label>
                                        <Form.Select
                                            value={newMeetingType.duration}
                                            onChange={(e) => setNewMeetingType({
                                                ...newMeetingType,
                                                duration: parseInt(e.target.value)
                                            })}
                                            className="form-control-modern"
                                        >
                                            <option value={15}>15 minutes</option>
                                            <option value={30}>30 minutes</option>
                                            <option value={45}>45 minutes</option>
                                            <option value={60}>1 hour</option>
                                            <option value={90}>1.5 hours</option>
                                            <option value={120}>2 hours</option>
                                        </Form.Select>
                                    </Form.Group>
                                </Col>
                            </Row>

                            <Form.Group className="mb-3">
                                <Form.Label>Description</Form.Label>
                                <Form.Control
                                    as="textarea"
                                    rows={3}
                                    placeholder="Brief description of what this meeting is for..."
                                    value={newMeetingType.description}
                                    onChange={(e) => setNewMeetingType({
                                        ...newMeetingType,
                                        description: e.target.value
                                    })}
                                    className="form-control-modern"
                                />
                            </Form.Group>

                            <Form.Group className="mb-4">
                                <Form.Label>Color Theme</Form.Label>
                                <Row className="align-items-center">
                                    <Col xs={12} md={8}>
                                        <div className="d-flex flex-wrap gap-2 mt-2">
                                            {['#006bff', '#28a745', '#ffc107', '#dc3545', '#6f42c1', '#fd7e14', '#17a2b8', '#343a40'].map(color => (
                                                <button
                                                    key={color}
                                                    type="button"
                                                    className="color-selector-btn"
                                                    style={{
                                                        width: '40px',
                                                        height: '40px',
                                                        backgroundColor: color,
                                                        border: newMeetingType.color === color ? '3px solid #000' : '1px solid #ced4da',
                                                        borderRadius: '50%',
                                                        cursor: 'pointer',
                                                        boxShadow: newMeetingType.color === color ? '0 0 0 2px white, 0 0 0 4px ' + color : 'none',
                                                        transition: 'all 0.2s ease',
                                                    }}
                                                    onClick={() => {
                                                        setNewMeetingType({
                                                            ...newMeetingType,
                                                            color: color
                                                        });
                                                    }}
                                                    aria-label={`Select color ${color}`}
                                                />
                                            ))}
                                        </div>
                                    </Col>
                                    <Col xs={12} md={4} className="mt-3 mt-md-0">
                                        <div className="color-preview p-3 rounded d-flex align-items-center" style={{
                                            backgroundColor: newMeetingType.color,
                                            color: ['#ffc107', '#28a745', '#17a2b8'].includes(newMeetingType.color) ? '#000' : '#fff'
                                        }}>
                                            <div className="w-100 text-center">
                                                <strong>Selected Color</strong>
                                                <div className="small mt-1">{newMeetingType.color}</div>
                                            </div>
                                        </div>
                                    </Col>
                                </Row>

                                <Form.Group className="mt-3">
                                    <Form.Label>Custom Color (HEX code)</Form.Label>
                                    <Form.Control
                                        type="text"
                                        placeholder="#RRGGBB"
                                        value={newMeetingType.color}
                                        onChange={(e) => {
                                            const colorValue = e.target.value;
                                            // Only update if it's a valid hex color or empty
                                            if (/^#([0-9A-F]{3}){1,2}$/i.test(colorValue) || colorValue === '#' || colorValue === '') {
                                                setNewMeetingType({
                                                    ...newMeetingType,
                                                    color: colorValue
                                                });
                                            }
                                        }}
                                        className="form-control-modern"
                                        style={{ maxWidth: "180px" }}
                                    />
                                    <Form.Text className="text-muted">
                                        Enter a custom color in hexadecimal format
                                    </Form.Text>
                                </Form.Group>
                            </Form.Group>

                            {/* Time Zone field with API data only */}
                            <Form.Group className="mb-3">
                                <Form.Label>Time Zone *</Form.Label>
                                {timeZonesLoading ? (
                                    <div className="d-flex align-items-center p-2 border rounded">
                                        <Spinner size="sm" className="me-2" />
                                        <span className="text-muted">Loading timezones from server...</span>
                                    </div>
                                ) : Array.isArray(timeZones) && timeZones.length > 0 ? (
                                    <Form.Select
                                        value={newMeetingType.timezone}
                                        onChange={(e) => setNewMeetingType({
                                            ...newMeetingType,
                                            timezone: e.target.value
                                        })}
                                        className="form-control-modern"
                                        required
                                    >
                                        {timeZones.map(tz => (
                                            <option key={tz.value} value={tz.value}>
                                                {tz.label}
                                            </option>
                                        ))}
                                    </Form.Select>
                                ) : (
                                    <div className="p-2 border rounded bg-light">
                                        <span className="text-muted">Unable to load timezones from server.</span>
                                        <Button
                                            variant="outline-primary"
                                            size="sm"
                                            onClick={loadTimezones}
                                            className="ms-2"
                                        >
                                            <FiRefreshCw className="me-1" />
                                            Retry
                                        </Button>
                                    </div>
                                )}
                                <Form.Text className="text-muted">
                                    This timezone will be used for your meeting availability and booking times.
                                    {timeZones.length > 0 && (
                                        <span className="d-block small mt-1">
                                            {timeZones.length} timezones available from server
                                        </span>
                                    )}
                                </Form.Text>
                            </Form.Group>

                            {/* Add Available Date Field to Form */}
                            <Form.Group className="mb-3">
                                <Form.Label>Available Date *</Form.Label>
                                <Form.Control
                                    type="date"
                                    value={newMeetingType.availableDate}
                                    onChange={(e) => setNewMeetingType({
                                        ...newMeetingType,
                                        availableDate: e.target.value
                                    })}
                                    className="form-control-modern"
                                    min={new Date().toISOString().split('T')[0]}
                                    required
                                />
                                <Form.Text className="text-muted">
                                    Select when this meeting type should be available for booking
                                    {newMeetingType.timezone && ` (${timeZones.find(tz => tz.value === newMeetingType.timezone)?.label || newMeetingType.timezone})`}
                                </Form.Text>
                            </Form.Group>

                            <div className="d-flex justify-content-end gap-2">
                                <Button
                                    variant="outline-secondary"
                                    onClick={() => {
                                        setShowNewMeetingModal(false);
                                        setEditingMeetingType(null);
                                        setNewMeetingType({
                                            name: '',
                                            duration: 30,
                                            description: '',
                                            color: '#006bff',
                                            availableDate: '',
                                            timezone: timezoneService.getUserTimezone()
                                        });
                                    }}
                                >
                                    Cancel
                                </Button>
                                <Button type="submit" variant="primary" className="btn-modern">
                                    {editingMeetingType ? 'Update Meeting Type' : 'Create Meeting Type'}
                                </Button>
                            </div>
                        </Form>
                    </Modal.Body>
                </Modal>

                {/* Delete Confirmation Modal */}
                <Modal
                    show={showDeleteConfirm}
                    onHide={cancelDelete}
                    centered
                    size="sm"
                >
                    <Modal.Header closeButton className="border-0 pb-0">
                        <Modal.Title className="h5 text-danger">
                            <FiTrash2 className="me-2" />
                            Delete Meeting Type
                        </Modal.Title>
                    </Modal.Header>
                    <Modal.Body className="pt-2">
                        <div className="text-center">
                            <div className="mb-3">
                                <div
                                    className="mx-auto mb-3 d-flex align-items-center justify-content-center"
                                    style={{
                                        width: '60px',
                                        height: '60px',
                                        backgroundColor: '#fee2e2',
                                        borderRadius: '50%'
                                    }}
                                >
                                    <FiTrash2 size={24} className="text-danger" />
                                </div>
                                <h6 className="mb-2">Are you sure?</h6>
                                <p className="text-muted small mb-0">
                                    You're about to delete <strong>"{deleteTarget?.name}"</strong>.
                                    This action cannot be undone and will permanently remove this meeting type.
                                </p>
                            </div>
                        </div>
                    </Modal.Body>
                    <Modal.Footer className="border-0 pt-0">
                        <div className="w-100 d-flex gap-2">
                            <Button
                                variant="outline-secondary"
                                onClick={cancelDelete}
                                className="flex-fill"
                            >
                                Cancel
                            </Button>
                            <Button
                                variant="danger"
                                onClick={confirmDelete}
                                className="flex-fill"
                            >
                                <FiTrash2 className="me-1" />
                                Delete
                            </Button>
                        </div>
                    </Modal.Footer>
                </Modal>

                {/* Manage Meetings Modal */}
                <Modal
                    show={showManageModal}
                    onHide={() => setShowManageModal(false)}
                    centered
                    size="xl"
                >
                    <Modal.Header closeButton>
                        <Modal.Title>Manage Meetings</Modal.Title>
                    </Modal.Header>
                    <Modal.Body style={{ maxHeight: '70vh' }}>
                        <div style={{ overflowY: 'auto', overflowX: 'visible' }}>
                            <Table responsive hover className="mb-0">
                                <thead style={{ position: 'sticky', top: 0, backgroundColor: 'white', zIndex: 10 }}>
                                    <tr>
                                        <th>Name</th>
                                        <th>Duration</th>
                                        <th>Status</th>
                                        <th>Bookings</th>
                                        <th>Booking Link</th>
                                        <th width="120">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {manageMeetingTypes.map((type, index) => {
                                        const isLast = manageMeetingTypes.length === index + 1;
                                        return (
                                            <tr
                                                key={type._id || type.id}
                                                ref={isLast ? manageMeetingTypesLastElementRef : null}
                                                style={{ position: 'relative', zIndex: manageMeetingTypes.length - index }}
                                            >
                                                <td>
                                                    <div className="d-flex align-items-center">
                                                        <div
                                                            className="rounded-circle me-2"
                                                            style={{
                                                                width: '8px',
                                                                height: '8px',
                                                                backgroundColor: type.color
                                                            }}
                                                        ></div>
                                                        <div>
                                                            <strong>{type.name}</strong>
                                                            <div className="small text-muted">
                                                                Available: {type.dateFormatted ||
                                                                    (type.availableDate ? new Date(type.availableDate).toLocaleDateString() : 'Not set')}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td>{type.duration} min</td>
                                                <td>
                                                    <Badge bg={type.isActive ? 'success' : 'secondary'}>
                                                        {type.isActive ? 'Active' : 'Inactive'}
                                                    </Badge>
                                                </td>
                                                <td>{type.totalBookings || 0}</td>
                                                <td>
                                                    <code className="small">{type.bookingLink || `scheduleme.com/user/${type.name.toLowerCase().replace(/\s+/g, '-')}`}</code>
                                                    <Button
                                                        variant="link"
                                                        size="sm"
                                                        className="p-0 ms-2"
                                                        onClick={() => handleCopyLink(type.bookingLink || `scheduleme.com/user/${type.name.toLowerCase().replace(/\s+/g, '-')}`)}
                                                        title="Copy link"
                                                    >
                                                        <FiCopy size={12} />
                                                    </Button>
                                                </td>
                                                <td>
                                                    <div className="d-flex gap-1">
                                                        <Button
                                                            variant="outline-primary"
                                                            size="sm"
                                                            onClick={() => handleEditMeetingType(type)}
                                                            title="Edit"
                                                        >
                                                            <FiEdit size={12} />
                                                        </Button>
                                                        <Button
                                                            variant={type.isActive ? 'outline-warning' : 'outline-success'}
                                                            size="sm"
                                                            onClick={() => handleToggleActive(type)}
                                                            title={type.isActive ? 'Deactivate' : 'Activate'}
                                                        >
                                                            {type.isActive ? <FiEyeOff size={12} /> : <FiEye size={12} />}
                                                        </Button>
                                                        <Button
                                                            variant="outline-danger"
                                                            size="sm"
                                                            onClick={() => handleDeleteMeetingType(type)}
                                                            title="Delete"
                                                        >
                                                            <FiTrash2 size={12} />
                                                        </Button>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </Table>
                        </div>
                        {manageMeetingTypesLoading && <LoadingIndicator />}

                        {manageMeetingTypes.length === 0 && !manageMeetingTypesLoading && (
                            <div className="text-center py-5">
                                <p className="text-muted">No Meetings found.</p>
                                <Button
                                    variant="primary"
                                    onClick={() => {
                                        setShowManageModal(false);
                                        setShowNewMeetingModal(true);
                                    }}
                                    className="mt-2"
                                >
                                    <FiPlus className="me-2" />
                                    Create Meeting Type
                                </Button>
                            </div>
                        )}
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="secondary" onClick={() => setShowManageModal(false)}>
                            Close
                        </Button>
                        <Button
                            variant="primary"
                            onClick={() => {
                                setShowManageModal(false);
                                setShowNewMeetingModal(true);
                            }}
                        >
                            <FiPlus className="me-2" />
                            Add New Meeting Type
                        </Button>
                    </Modal.Footer>
                </Modal>

                {/* Bookings Detail Modal - Update to handle your data structure */}
                <Modal
                    show={showBookingsModal}
                    onHide={() => setShowBookingsModal(false)}
                    centered
                    size="lg"
                >
                    <Modal.Header closeButton>
                        <Modal.Title>Bookings for "{selectedMeetingName}"</Modal.Title>
                    </Modal.Header>
                    <Modal.Body style={{ maxHeight: '70vh', overflowY: 'auto' }}>
                        {selectedMeetingBookings.length === 0 ? (
                            <div className="text-center py-4">
                                <p className="text-muted">No bookings for this meeting type yet.</p>
                            </div>
                        ) : (
                            <div className="booking-list">
                                {selectedMeetingBookings.map((booking, index) => (
                                    <Card key={booking._id || index} className="mb-3 border">
                                        <Card.Body className="p-3">
                                            <Row>
                                                <Col md={8}>
                                                    <h6 className="mb-2 fw-bold">{booking.guestInfo?.name || 'Guest'}</h6>
                                                    <div className="mb-2">
                                                        {/* <small className="text-muted d-block">
                                                            <FiMail className="me-1" />
                                                            {booking.guestInfo?.email || 'No email provided'}
                                                        </small> */}
                                                        {booking.guestInfo?.phone && (
                                                            <small className="text-muted d-block">
                                                                <FiPhone className="me-1" />
                                                                {booking.guestInfo.phone}
                                                            </small>
                                                        )}
                                                    </div>
                                                    {booking.guestInfo?.message && (
                                                        <div className="mb-2">
                                                            <small className="text-muted">
                                                                <strong>Message:</strong> {booking.guestInfo.message}
                                                            </small>
                                                        </div>
                                                    )}
                                                </Col>
                                                <Col md={4} className="text-md-end">
                                                    <div className="mb-1">
                                                        <small className="text-muted d-block">
                                                            <FiCalendar className="me-1" />
                                                            {booking.date}
                                                        </small>
                                                        <small className="text-muted d-block">
                                                            <FiClock className="me-1" />
                                                            {booking.time}
                                                        </small>
                                                    </div>
                                                    <Badge bg={booking.status === 'confirmed' ? 'success' : 'secondary'} className="small">
                                                        {booking.status || 'Confirmed'}
                                                    </Badge>
                                                </Col>
                                            </Row>
                                        </Card.Body>
                                    </Card>
                                ))}
                            </div>
                        )}
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="secondary" onClick={() => setShowBookingsModal(false)}>
                            Close
                        </Button>
                    </Modal.Footer>
                </Modal>

            </Container>
        </motion.div>
    );
};

export default Dashboard;
