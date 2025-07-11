import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Badge, Modal, Form, Table, Dropdown, Spinner, Alert } from 'react-bootstrap';
import { motion, AnimatePresence } from 'framer-motion';
import { FiCalendar, FiPlus, FiUsers, FiClock, FiSettings, FiEdit, FiTrash2, FiCopy, FiEye, FiEyeOff, FiMoreVertical, FiRefreshCw, FiPhone } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import dashboardService from '../services/dashboardService';
import meetingTypeService from '../services/meetingTypeService';
import meetingService from '../services/meetingService';
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
                        default:
                            // Unknown stat type, ignore
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
    const loadTimezones = useCallback(async () => {
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
    }, [newMeetingType.timezone]);

    // Load initial data on component mount
    useEffect(() => {
        loadDashboardStats();
        loadMeetingTypes();
        loadTimezones(); // Add timezone loading
    }, [loadTimezones]);

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

    // Enhanced handleEditMeetingType with timezone and correct date formatting
    const handleEditMeetingType = (meetingType) => {
        setEditingMeetingType(meetingType);

        // Fix date formatting to ensure YYYY-MM-DD format
        let formattedDate = '';
        if (meetingType.availableDate) {
            const dateValue = meetingType.availableDate;

            // If it's already in YYYY-MM-DD format, use it directly
            if (/^\d{4}-\d{2}-\d{2}$/.test(dateValue)) {
                formattedDate = dateValue;
            } else {
                // Try to parse and format the date
                try {
                    const dateObj = new Date(dateValue);
                    if (!isNaN(dateObj.getTime())) {
                        const year = dateObj.getFullYear();
                        const month = String(dateObj.getMonth() + 1).padStart(2, '0');
                        const day = String(dateObj.getDate()).padStart(2, '0');
                        formattedDate = `${year}-${month}-${day}`;
                    }
                } catch (error) {
                    console.error('Error parsing date:', error);
                }
            }
        }

        // Fallback to dateFormatted if available and in correct format
        if (!formattedDate && meetingType.dateFormatted) {
            if (/^\d{4}-\d{2}-\d{2}$/.test(meetingType.dateFormatted)) {
                formattedDate = meetingType.dateFormatted;
            } else {
                // Try to parse dateFormatted
                try {
                    const dateObj = new Date(meetingType.dateFormatted);
                    if (!isNaN(dateObj.getTime())) {
                        const year = dateObj.getFullYear();
                        const month = String(dateObj.getMonth() + 1).padStart(2, '0');
                        const day = String(dateObj.getDate()).padStart(2, '0');
                        formattedDate = `${year}-${month}-${day}`;
                    }
                } catch (error) {
                    console.error('Error parsing dateFormatted:', error);
                }
            }
        }

        setNewMeetingType({
            name: meetingType.name || '',
            duration: meetingType.duration || 30,
            description: meetingType.description || '',
            color: meetingType.color || '#006bff',
            timezone: meetingType.timezone || timezoneService.getUserTimezone(),
            availableDate: formattedDate // Use the properly formatted date
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

    // Updated loadMeetingBookings to handle your actual API response
    const loadMeetingBookings = async (meetingTypeId, meetingTypeName) => {
        try {
            const response = await makeAuthenticatedRequest(
                `http://localhost:5000/api/v1/meetings/public/${meetingTypeId}/bookings`
            );
            const data = await response.json();

            console.log('Single meeting bookings response:', data);

            // Fix the data structure - should be data.data.bookings based on your API response
            if (data.success && data.data && data.data.bookings && Array.isArray(data.data.bookings)) {
                // Map your API response to expected format
                const mappedBookings = data.data.bookings.map(booking => {
                    // Use the time field from backend API (in HH:MM format) and convert to 12-hour format
                    let formattedTime;
                    if (booking.time) {
                        // Backend returns time in "HH:MM" format (24-hour) - convert to 12-hour format
                        const [hours, minutes] = booking.time.split(':');
                        const hour24 = parseInt(hours, 10);
                        const hour12 = hour24 === 0 ? 12 : hour24 > 12 ? hour24 - 12 : hour24;
                        const ampm = hour24 >= 12 ? 'PM' : 'AM';
                        formattedTime = `${hour12.toString().padStart(2, '0')}:${minutes} ${ampm}`;
                    } else {
                        // Fallback to createdAt time if time field is not available
                        const bookingDate = new Date(booking.createdAt);
                        formattedTime = bookingDate.toLocaleTimeString('en-US', {
                            hour: '2-digit',
                            minute: '2-digit',
                            hour12: true
                        });
                    }

                    // Format the date properly
                    const formattedDate = booking.date ?
                        new Date(booking.date).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                        }) :
                        new Date(booking.createdAt).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                        });

                    return {
                        _id: booking._id || booking.id,
                        date: formattedDate,
                        time: formattedTime,
                        status: booking.status,
                        createdAt: booking.createdAt,
                        scheduledAt: booking.scheduledAt || booking.createdAt,
                        title: booking.title || `${meetingTypeName} with ${booking.guestInfo?.name || 'Guest'}`,
                        duration: booking.duration || 30,
                        timezone: booking.timezone || 'UTC',
                        guestInfo: {
                            name: booking.guestInfo?.name || (booking.title ? booking.title.replace(' with ', '') : 'Guest'),
                            email: booking.guestInfo?.email || '',
                            phone: booking.guestInfo?.phone || '',
                            message: booking.guestInfo?.message || ''
                        },
                        // Google Meet information  
                        googleMeetJoinUrl: booking.googleMeetJoinUrl || null,
                        googleMeetHtmlLink: booking.googleMeetHtmlLink || null,
                        googleMeetId: booking.googleMeetId || null
                    };
                });

                console.log('Mapped bookings:', mappedBookings);
                setSelectedMeetingBookings(mappedBookings);
                setSelectedMeetingName(meetingTypeName);
                setShowBookingsModal(true);
            } else {
                console.warn('No bookings found or invalid response structure:', data);
                setSelectedMeetingBookings([]);
                setSelectedMeetingName(meetingTypeName);
                setShowBookingsModal(true);
                setError(data.message || 'No bookings found for this meeting type');
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

    // Load recent bookings for dashboard
    const loadRecentBookings = useCallback(async () => {
        try {
            setBookingsLoading(true);
            console.log('Loading recent bookings...');

            // Use the direct API method first
            try {
                const response = await meetingService.getRecentBookings(10);
                console.log('Recent bookings API response:', response);

                if (response.success && response.data && response.data.bookings) {
                    // Map the bookings to the expected format
                    const mappedBookings = response.data.bookings.map(booking => {
                        // Format time from HH:MM to 12-hour format
                        let formattedTime;
                        if (booking.time) {
                            const [hours, minutes] = booking.time.split(':');
                            const hour24 = parseInt(hours, 10);
                            const hour12 = hour24 === 0 ? 12 : hour24 > 12 ? hour24 - 12 : hour24;
                            const ampm = hour24 >= 12 ? 'PM' : 'AM';
                            formattedTime = `${hour12.toString().padStart(2, '0')}:${minutes} ${ampm}`;
                        } else {
                            // Fallback to createdAt time if time field is not available
                            const bookingDate = new Date(booking.createdAt);
                            formattedTime = bookingDate.toLocaleTimeString('en-US', {
                                hour: '2-digit',
                                minute: '2-digit',
                                hour12: true
                            });
                        }

                        // Format the date
                        const formattedDate = booking.date ?
                            new Date(booking.date).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric'
                            }) :
                            new Date(booking.createdAt).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric'
                            });

                        return {
                            ...booking,
                            date: formattedDate,
                            time: formattedTime,
                            title: booking.title || `${booking.meetingTypeName || 'Meeting'} with ${booking.guestInfo?.name || 'Guest'}`,
                            guestInfo: {
                                name: booking.guestInfo?.name || 'Guest',
                                email: booking.guestInfo?.email || '',
                                phone: booking.guestInfo?.phone || '',
                                message: booking.guestInfo?.message || ''
                            },
                            googleMeetJoinUrl: booking.googleMeetJoinUrl || null,
                            googleMeetHtmlLink: booking.googleMeetHtmlLink || null,
                            googleMeetId: booking.googleMeetId || null,
                            duration: booking.duration || 30,
                            timezone: booking.timezone || 'UTC'
                        };
                    });

                    setRecentBookings(mappedBookings);
                    console.log('Recent bookings loaded successfully:', mappedBookings);
                    return; // Exit early if successful
                }
            } catch (directApiError) {
                console.warn('Direct API method failed, falling back to meeting types method:', directApiError);
            }

            // Fallback method: Use the fallback method to get bookings from meeting types
            if (meetingTypes && meetingTypes.length > 0) {
                console.log('Using fallback method with meeting types:', meetingTypes);
                const response = await meetingService.getRecentBookingsFromMeetingTypes(meetingTypes, 10);

                console.log('Fallback recent bookings response:', response);

                if (response.success && response.data && response.data.bookings) {
                    // Map the bookings to the expected format (same as above)
                    const mappedBookings = response.data.bookings.map(booking => {
                        // Format time from HH:MM to 12-hour format
                        let formattedTime;
                        if (booking.time) {
                            const [hours, minutes] = booking.time.split(':');
                            const hour24 = parseInt(hours, 10);
                            const hour12 = hour24 === 0 ? 12 : hour24 > 12 ? hour24 - 12 : hour24;
                            const ampm = hour24 >= 12 ? 'PM' : 'AM';
                            formattedTime = `${hour12.toString().padStart(2, '0')}:${minutes} ${ampm}`;
                        } else {
                            const bookingDate = new Date(booking.createdAt);
                            formattedTime = bookingDate.toLocaleTimeString('en-US', {
                                hour: '2-digit',
                                minute: '2-digit',
                                hour12: true
                            });
                        }

                        const formattedDate = booking.date ?
                            new Date(booking.date).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric'
                            }) :
                            new Date(booking.createdAt).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric'
                            });

                        return {
                            ...booking,
                            date: formattedDate,
                            time: formattedTime,
                            title: booking.title || `${booking.meetingTypeName || 'Meeting'} with ${booking.guestInfo?.name || 'Guest'}`,
                            guestInfo: {
                                name: booking.guestInfo?.name || 'Guest',
                                email: booking.guestInfo?.email || '',
                                phone: booking.guestInfo?.phone || '',
                                message: booking.guestInfo?.message || ''
                            },
                            googleMeetJoinUrl: booking.googleMeetJoinUrl || null,
                            googleMeetHtmlLink: booking.googleMeetHtmlLink || null,
                            googleMeetId: booking.googleMeetId || null,
                            duration: booking.duration || 30,
                            timezone: booking.timezone || 'UTC'
                        };
                    });

                    setRecentBookings(mappedBookings);
                    console.log('Fallback recent bookings loaded successfully:', mappedBookings);
                } else {
                    console.warn('No bookings found in fallback response:', response);
                    setRecentBookings([]);
                }
            } else {
                console.warn('No meeting types available for fallback method');
                setRecentBookings([]);
            }
        } catch (error) {
            console.error('Failed to load recent bookings:', error);
            setRecentBookings([]);
            if (error.message.includes('Session expired') || error.message.includes('authentication')) {
                setError('Session expired. Please log in again.');
                // Don't auto-navigate to login from dashboard as user might want to refresh
            } else {
                setError('Failed to load recent bookings');
            }
        } finally {
            setBookingsLoading(false);
        }
    }, [meetingTypes]);

    // Update useEffect to load bookings when meetingTypes change
    useEffect(() => {
        if (meetingTypes.length > 0) {
            console.log('Loading bookings for meeting List:', meetingTypes);
            loadRecentBookings();
        }
    }, [meetingTypes, loadRecentBookings]);

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="dashboard-bg"
        >
            <Container fluid className="py-5 d-flex justify-content-center align-items-start" style={{ minHeight: '100vh' }}>
                <div className="dashboard-content-wrapper">
                    {/* Header */}
                    <Row className="mb-4">
                        <Col>
                            <motion.div
                                initial={{ y: -30, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ duration: 0.6 }}
                                className="d-flex justify-content-between align-items-center"
                            >
                                <div>
                                    <h1 className="display-5 fw-bold mb-1 text-gradient">Dashboard</h1>
                                    <p className="text-muted mb-0">Your meetings, bookings, and productivity at a glance</p>
                                </div>
                                <Button
                                    variant="primary"
                                    className="btn-modern px-4 py-2 shadow-lg"
                                    style={{ fontSize: '1.1rem', borderRadius: '12px' }}
                                    onClick={() => setShowNewMeetingModal(true)}
                                    as={motion.button}
                                    whileHover={{ scale: 1.05, boxShadow: "0 8px 32px rgba(99,102,241,0.15)" }}
                                    whileTap={{ scale: 0.97 }}
                                >
                                    <FiPlus className="me-2" />
                                    Create Meeting
                                </Button>
                            </motion.div>
                        </Col>
                    </Row>

                    {/* Alerts */}
                    <Row>
                        <Col md={8} lg={7} xl={6}>
                            <AnimatePresence>
                                {error && (
                                    <motion.div
                                        initial={{ opacity: 0, y: -10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -10 }}
                                    >
                                        <Alert variant="danger" dismissible onClose={() => setError('')} className="mb-4 shadow">
                                            {error}
                                        </Alert>
                                    </motion.div>
                                )}
                                {success && (
                                    <motion.div
                                        initial={{ opacity: 0, y: -10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -10 }}
                                    >
                                        <Alert variant="success" dismissible onClose={() => setSuccess('')} className="mb-4 shadow">
                                            {success}
                                        </Alert>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </Col>
                    </Row>

                    {/* Stats */}
                    <Row className="g-4 mb-4">
                        {statisticsData.map((stat, idx) => (
                            <Col xs={6} md={3} key={stat.title}>
                                <motion.div
                                    initial={{ y: 30, opacity: 0 }}
                                    animate={{ y: 0, opacity: 1 }}
                                    transition={{ delay: 0.1 + idx * 0.1 }}
                                    whileHover={{ y: -6, scale: 1.03 }}
                                >
                                    <Card className="glass-card text-center border-0 shadow-sm h-100">
                                        <Card.Body className="py-4">
                                            <div className={`icon-circle mb-3 bg-gradient-${stat.color}`}>
                                                <stat.icon size={28} />
                                            </div>
                                            <h2 className={`fw-bold mb-1 text-${stat.color}`}>{stat.value}</h2>
                                            <div className="text-muted small">{stat.title}</div>
                                        </Card.Body>
                                    </Card>
                                </motion.div>
                            </Col>
                        ))}
                    </Row>

                    {/* Main Content */}
                    <Row className="g-4 dashboard-main-row">
                        {/* Meeting Types List */}
                        <Col lg={6}>
                            <motion.div
                                initial={{ opacity: 0, y: 30 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2 }}
                            >
                                <Card className="glass-card border-0 shadow-lg dashboard-card-equal">
                                    <Card.Header className="bg-transparent border-0 px-4 pt-4 pb-2">
                                        <div className="d-flex justify-content-between align-items-center">
                                            <h4 className="fw-bold mb-0">Your Meeting List</h4>
                                            <Button
                                                variant="outline-primary"
                                                size="sm"
                                                className="rounded-pill px-3"
                                                onClick={() => setShowManageModal(true)}
                                                as={motion.button}
                                                whileHover={{ scale: 1.07 }}
                                            >
                                                <FiSettings className="me-1" />
                                                Manage
                                            </Button>
                                        </div>
                                    </Card.Header>
                                    <Card.Body className="p-0">
                                        {meetingTypesInitialLoading ? (
                                            <div className="text-center py-5">
                                                <Spinner animation="border" variant="primary" />
                                                <p className="mt-2 text-muted">Loading Meeting Types...</p>
                                            </div>
                                        ) : !Array.isArray(meetingTypes) || meetingTypes.length === 0 ? (
                                            <div className="text-center py-5">
                                                <p className="text-muted">No meeting types yet. Create your first meeting type!</p>
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
                                            <div className="meeting-list-table px-3 py-3">
                                                <Table borderless hover responsive className="mb-0 align-middle">
                                                    <thead>
                                                        <tr>
                                                            <th>Name</th>
                                                            <th>Status</th>
                                                            <th>Duration</th>
                                                            <th>Bookings</th>
                                                            <th>Actions</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {meetingTypes.map((type, idx) => {
                                                            const isLast = meetingTypes.length === idx + 1;
                                                            const shareUrl = `${window.location.origin}/schedule/${type._id || type.id}`;
                                                            return (
                                                                <motion.tr
                                                                    ref={isLast ? meetingTypesLastElementRef : null}
                                                                    key={type._id || type.id}
                                                                    initial={{ opacity: 0, y: 10 }}
                                                                    animate={{ opacity: 1, y: 0 }}
                                                                    transition={{ delay: 0.05 * idx }}
                                                                    whileHover={{ backgroundColor: "#f8fafd" }}
                                                                    className="meeting-row"
                                                                >
                                                                    <td>
                                                                        <div className="d-flex align-items-center">
                                                                            <span className="rounded-circle me-2" style={{
                                                                                width: 12, height: 12, background: type.color || '#6366f1'
                                                                            }} />
                                                                            <span className="fw-semibold">{type.name}</span>
                                                                        </div>
                                                                    </td>
                                                                    <td>
                                                                        <Badge bg={type.isActive !== false ? 'success' : 'secondary'}>
                                                                            {type.isActive !== false ? 'Active' : 'Inactive'}
                                                                        </Badge>
                                                                    </td>
                                                                    <td>
                                                                        <span className="d-flex align-items-center">
                                                                            <FiClock className="me-1" size={14} />
                                                                            {type.duration || 30} min
                                                                        </span>
                                                                    </td>
                                                                    <td>
                                                                        <Button
                                                                            variant="link"
                                                                            className="p-0 text-decoration-none"
                                                                            style={{ fontSize: '13px' }}
                                                                            onClick={() => loadMeetingBookings(type._id || type.id, type.name)}
                                                                        >
                                                                            <FiUsers className="me-1" size={14} />
                                                                            {type.totalBookings || 0}
                                                                        </Button>
                                                                    </td>
                                                                    <td>
                                                                        <div className="d-flex gap-1">
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
                                                                    </td>
                                                                </motion.tr>
                                                            );
                                                        })}
                                                    </tbody>
                                                </Table>
                                                {meetingTypesLoading && <LoadingIndicator />}
                                            </div>
                                        )}
                                    </Card.Body>
                                </Card>
                            </motion.div>
                        </Col>

                        {/* Recent Bookings */}
                        <Col lg={6}>
                            <motion.div
                                initial={{ opacity: 0, y: 30 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.3 }}
                            >
                                <Card className="glass-card border-0 shadow-lg dashboard-card-equal">
                                    <Card.Header className="bg-transparent border-0 px-4 pt-4 pb-2">
                                        <h4 className="fw-bold mb-0">Recent Bookings List</h4>
                                    </Card.Header>
                                    <Card.Body className="p-0">
                                        {bookingsLoading ? (
                                            <div className="text-center py-5">
                                                <Spinner animation="border" variant="primary" />
                                                <p className="mt-2 text-muted">Loading bookings...</p>
                                            </div>
                                        ) : recentBookings.length === 0 ? (
                                            <div className="text-center py-5">
                                                <p className="text-muted">No bookings yet. Share your meeting links to get started!</p>
                                            </div>
                                        ) : (
                                            <div className="recent-bookings-list px-3 py-3">
                                                {recentBookings.map((booking, idx) => (
                                                    <motion.div
                                                        key={booking._id || idx}
                                                        initial={{ opacity: 0, y: 10 }}
                                                        animate={{ opacity: 1, y: 0 }}
                                                        transition={{ delay: 0.05 * idx }}
                                                        className="booking-card mb-3 p-3 border rounded-3 shadow-sm"
                                                        style={{
                                                            background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
                                                            borderLeft: `4px solid ${booking.meetingTypeColor || '#6366f1'}`
                                                        }}
                                                    >
                                                        {/* Header with Title and Status */}
                                                        <div className="d-flex justify-content-between align-items-start mb-2">
                                                            <div className="flex-grow-1">
                                                                <h6 className="fw-bold text-primary mb-1">
                                                                    {booking.title || `${booking.meetingTypeName || 'Meeting'} with ${booking.guestInfo?.name || 'Guest'}`}
                                                                </h6>
                                                                <Badge bg={booking.status === 'confirmed' ? 'success' : 'secondary'} className="small">
                                                                    {booking.status || 'Confirmed'}
                                                                </Badge>
                                                            </div>
                                                            <div className="text-end">
                                                                <small className="text-muted d-block">
                                                                    <FiCalendar className="me-1" size={12} />
                                                                    {booking.date}
                                                                </small>
                                                                <small className="text-muted d-block">
                                                                    <FiClock className="me-1" size={12} />
                                                                    {booking.time} ({booking.duration || 30} min)
                                                                </small>
                                                            </div>
                                                        </div>

                                                        {/* Guest Information */}
                                                        <div className="row g-2 mb-2">
                                                            <div className="col-md-6">
                                                                <div className="bg-light rounded p-2">
                                                                    <small className="text-muted d-block fw-semibold">Guest Info</small>
                                                                    <div className="d-flex align-items-center mt-1">
                                                                        <FiUsers className="me-1 text-primary" size={14} />
                                                                        <small className="fw-semibold">{booking.guestInfo?.name || 'Guest'}</small>
                                                                    </div>
                                                                    {booking.guestInfo?.email && (
                                                                        <div className="d-flex align-items-center mt-1">
                                                                            <i className="fas fa-envelope me-1 text-muted" style={{ fontSize: '12px' }}></i>
                                                                            <small className="text-muted">{booking.guestInfo.email}</small>
                                                                        </div>
                                                                    )}
                                                                    {booking.guestInfo?.phone && (
                                                                        <div className="d-flex align-items-center mt-1">
                                                                            <FiPhone className="me-1 text-muted" size={12} />
                                                                            <small className="text-muted">{booking.guestInfo.phone}</small>
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </div>

                                                            {/* Google Meet Information */}
                                                            <div className="col-md-6">
                                                                <div className="bg-light rounded p-2">
                                                                    <small className="text-muted d-block fw-semibold">Google Meet</small>
                                                                    {booking.googleMeetJoinUrl && (
                                                                        <div className="mt-1">
                                                                            <a
                                                                                href={booking.googleMeetJoinUrl}
                                                                                target="_blank"
                                                                                rel="noopener noreferrer"
                                                                                className="btn btn-sm btn-outline-primary d-flex align-items-center justify-content-center"
                                                                                style={{ fontSize: '11px', padding: '4px 8px' }}
                                                                            >
                                                                                <i className="fab fa-google me-1"></i>
                                                                                Join Meeting
                                                                            </a>
                                                                            {booking.googleMeetId && (
                                                                                <small className="text-muted d-block mt-1">
                                                                                    ID: {booking.googleMeetId}
                                                                                </small>
                                                                            )}
                                                                        </div>
                                                                    )}
                                                                    {booking.googleMeetHtmlLink && !booking.googleMeetJoinUrl && (
                                                                        <div className="mt-1">
                                                                            <a
                                                                                href={booking.googleMeetHtmlLink}
                                                                                target="_blank"
                                                                                rel="noopener noreferrer"
                                                                                className="btn btn-sm btn-outline-primary d-flex align-items-center justify-content-center"
                                                                                style={{ fontSize: '11px', padding: '4px 8px' }}
                                                                            >
                                                                                <i className="fab fa-google me-1"></i>
                                                                                Join Meeting
                                                                            </a>
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </div>

                                                        {/* Additional Details */}
                                                        <div className="d-flex justify-content-between align-items-center text-muted">
                                                            <small>
                                                                <span className="rounded-circle me-1" style={{
                                                                    width: 8, height: 8, background: booking.meetingTypeColor || '#6366f1', display: 'inline-block'
                                                                }} />
                                                                {booking.meetingTypeName || 'Meeting Type'}
                                                            </small>
                                                            {booking.timezone && (
                                                                <small>
                                                                    <i className="fas fa-globe me-1"></i>
                                                                    {booking.timezone}
                                                                </small>
                                                            )}
                                                        </div>
                                                    </motion.div>
                                                ))}
                                            </div>
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
                                {editingMeetingType ? 'Edit Meetings' : 'Create New Meetings'}
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
                                            const bookingLink = type.bookingLink || `${window.location.origin}/schedule/${type._id || type.id}`;
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
                                                    <td>
                                                        {type.duration} min
                                                    </td>
                                                    <td>
                                                        <Badge bg={type.isActive ? 'success' : 'secondary'}>
                                                            {type.isActive ? 'Active' : 'Inactive'}
                                                        </Badge>
                                                    </td>
                                                    <td>{type.totalBookings || 0}</td>
                                                    <td>
                                                        <div className="d-flex align-items-center">
                                                            <code className="small" style={{ wordBreak: 'break-all' }}>{bookingLink}</code>
                                                            <Button
                                                                variant="link"
                                                                size="sm"
                                                                className="p-0 ms-2"
                                                                onClick={() => handleCopyLink(bookingLink)}
                                                                title="Copy link"
                                                            >
                                                                <FiCopy size={12} />
                                                            </Button>
                                                        </div>
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

                    {/* Enhanced Bookings Detail Modal */}
                    <Modal
                        show={showBookingsModal}
                        onHide={() => setShowBookingsModal(false)}
                        centered
                        size="xl"
                    >
                        <Modal.Header closeButton className="bg-light">
                            <Modal.Title className="d-flex align-items-center">
                                <FiUsers className="me-2 text-primary" />
                                Bookings for "{selectedMeetingName}"
                                <Badge bg="info" className="ms-2">{selectedMeetingBookings.length}</Badge>
                            </Modal.Title>
                        </Modal.Header>
                        <Modal.Body style={{ maxHeight: '75vh', overflowY: 'auto' }}>
                            {selectedMeetingBookings.length === 0 ? (
                                <div className="text-center py-5">
                                    <div className="mb-3">
                                        <FiUsers size={48} className="text-muted" />
                                    </div>
                                    <h5 className="text-muted">No bookings yet</h5>
                                    <p className="text-muted">This meeting type hasn't received any bookings yet.</p>
                                </div>
                            ) : (
                                <div className="booking-list">
                                    {selectedMeetingBookings.map((booking, index) => (
                                        <motion.div
                                            key={booking._id || index}
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: index * 0.1 }}
                                        >
                                            <Card className="mb-4 border-0 shadow-sm">
                                                <Card.Body className="p-4">
                                                    {/* Header with Title and Status */}
                                                    <div className="d-flex justify-content-between align-items-start mb-3">
                                                        <div className="flex-grow-1">
                                                            <h5 className="fw-bold text-primary mb-1">
                                                                {booking.title || `${selectedMeetingName} with ${booking.guestInfo?.name || 'Guest'}`}
                                                            </h5>
                                                            <div className="d-flex align-items-center gap-2">
                                                                <Badge bg={booking.status === 'confirmed' ? 'success' : 'secondary'} className="px-3 py-2">
                                                                    {booking.status || 'Confirmed'}
                                                                </Badge>
                                                                <small className="text-muted">
                                                                    <FiClock className="me-1" />
                                                                    {booking.duration || 30} minutes
                                                                </small>
                                                            </div>
                                                        </div>
                                                        <div className="text-end">
                                                            <div className="text-muted mb-1">
                                                                <FiCalendar className="me-1" size={14} />
                                                                <strong>{booking.date}</strong>
                                                            </div>
                                                            <div className="text-primary fw-semibold">
                                                                <FiClock className="me-1" size={14} />
                                                                {booking.time}
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* Main Content */}
                                                    <Row className="g-4">
                                                        {/* Guest Information */}
                                                        <Col md={6}>
                                                            <div className="bg-light rounded-3 p-3 h-100">
                                                                <h6 className="text-muted mb-3 fw-semibold d-flex align-items-center">
                                                                    <FiUsers className="me-2" />
                                                                    Guest Information
                                                                </h6>
                                                                <div className="space-y-2">
                                                                    <div className="d-flex align-items-center mb-2">
                                                                        <div className="bg-primary rounded-circle p-2 me-3" style={{ width: '32px', height: '32px' }}>
                                                                            <FiUsers className="text-white" size={16} />
                                                                        </div>
                                                                        <div>
                                                                            <div className="fw-semibold">{booking.guestInfo?.name || 'Guest'}</div>
                                                                            <small className="text-muted">Name</small>
                                                                        </div>
                                                                    </div>
                                                                    {booking.guestInfo?.email && (
                                                                        <div className="d-flex align-items-center mb-2">
                                                                            <div className="bg-info rounded-circle p-2 me-3" style={{ width: '32px', height: '32px' }}>
                                                                                <i className="fas fa-envelope text-white" style={{ fontSize: '12px' }}></i>
                                                                            </div>
                                                                            <div>
                                                                                <div className="fw-semibold">{booking.guestInfo.email}</div>
                                                                                <small className="text-muted">Email</small>
                                                                            </div>
                                                                        </div>
                                                                    )}
                                                                    {booking.guestInfo?.phone && (
                                                                        <div className="d-flex align-items-center mb-2">
                                                                            <div className="bg-success rounded-circle p-2 me-3" style={{ width: '32px', height: '32px' }}>
                                                                                <FiPhone className="text-white" size={16} />
                                                                            </div>
                                                                            <div>
                                                                                <div className="fw-semibold">{booking.guestInfo.phone}</div>
                                                                                <small className="text-muted">Phone</small>
                                                                            </div>
                                                                        </div>
                                                                    )}
                                                                    {booking.guestInfo?.message && (
                                                                        <div className="mt-3 p-2 bg-white rounded border-start border-primary border-3">
                                                                            <small className="text-muted fw-semibold d-block mb-1">Message:</small>
                                                                            <small className="text-dark">{booking.guestInfo.message}</small>
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </Col>

                                                        {/* Google Meet & Meeting Details */}
                                                        <Col md={6}>
                                                            <div className="bg-light rounded-3 p-3 h-100">
                                                                <h6 className="text-muted mb-3 fw-semibold d-flex align-items-center">
                                                                    <i className="fab fa-google me-2"></i>
                                                                    Google Meet Details
                                                                </h6>
                                                                <div className="space-y-3">
                                                                    {(booking.googleMeetJoinUrl || booking.googleMeetHtmlLink) && (
                                                                        <div className="mb-3">
                                                                            <a
                                                                                href={booking.googleMeetJoinUrl || booking.googleMeetHtmlLink}
                                                                                target="_blank"
                                                                                rel="noopener noreferrer"
                                                                                className="btn btn-primary w-100 d-flex align-items-center justify-content-center py-2"
                                                                            >
                                                                                <i className="fab fa-google me-2"></i>
                                                                                Join Google Meet
                                                                            </a>
                                                                        </div>
                                                                    )}
                                                                    {booking.googleMeetId && (
                                                                        <div className="bg-white rounded p-2 border">
                                                                            <small className="text-muted fw-semibold d-block">Meeting ID:</small>
                                                                            <code className="text-primary">{booking.googleMeetId}</code>
                                                                        </div>
                                                                    )}
                                                                    {(booking.googleMeetJoinUrl || booking.googleMeetHtmlLink) && (
                                                                        <div className="bg-white rounded p-2 border">
                                                                            <small className="text-muted fw-semibold d-block mb-1">Join URL:</small>
                                                                            <div className="d-flex align-items-center">
                                                                                <input
                                                                                    type="text"
                                                                                    className="form-control form-control-sm me-2"
                                                                                    value={booking.googleMeetJoinUrl || booking.googleMeetHtmlLink}
                                                                                    readOnly
                                                                                    style={{ fontSize: '11px' }}
                                                                                />
                                                                                <Button
                                                                                    variant="outline-primary"
                                                                                    size="sm"
                                                                                    onClick={() => navigator.clipboard.writeText(booking.googleMeetJoinUrl || booking.googleMeetHtmlLink)}
                                                                                >
                                                                                    <FiCopy size={12} />
                                                                                </Button>
                                                                            </div>
                                                                        </div>
                                                                    )}
                                                                    {booking.timezone && (
                                                                        <div className="bg-white rounded p-2 border">
                                                                            <small className="text-muted fw-semibold d-block">Timezone:</small>
                                                                            <div className="text-dark">
                                                                                <i className="fas fa-globe me-1 text-muted"></i>
                                                                                {booking.timezone}
                                                                            </div>
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </Col>
                                                    </Row>

                                                    {/* Footer with additional info */}
                                                    <div className="mt-3 pt-3 border-top">
                                                        <div className="d-flex justify-content-between align-items-center text-muted">
                                                            <small>
                                                                Created: {new Date(booking.createdAt).toLocaleDateString('en-US', {
                                                                    year: 'numeric',
                                                                    month: 'short',
                                                                    day: 'numeric',
                                                                    hour: '2-digit',
                                                                    minute: '2-digit'
                                                                })}
                                                            </small>
                                                            {booking.scheduledAt && (
                                                                <small>
                                                                    Scheduled: {new Date(booking.scheduledAt).toLocaleDateString('en-US', {
                                                                        year: 'numeric',
                                                                        month: 'short',
                                                                        day: 'numeric',
                                                                        hour: '2-digit',
                                                                        minute: '2-digit'
                                                                    })}
                                                                </small>
                                                            )}
                                                        </div>
                                                    </div>
                                                </Card.Body>
                                            </Card>
                                        </motion.div>
                                    ))}
                                </div>
                            )}
                        </Modal.Body>
                        <Modal.Footer className="bg-light">
                            <div className="d-flex w-100 justify-content-between align-items-center">
                                <small className="text-muted">
                                    Showing {selectedMeetingBookings.length} booking{selectedMeetingBookings.length !== 1 ? 's' : ''}
                                </small>
                                <Button variant="secondary" onClick={() => setShowBookingsModal(false)}>
                                    Close
                                </Button>
                            </div>
                        </Modal.Footer>
                    </Modal>
                </div>
            </Container>

            {/* Modern Dashboard Styles */}
            <style jsx>{`
                .dashboard-bg {
                    min-height: 100vh;
                    background: linear-gradient(135deg, #f8fafc 0%, #e0e7ff 100%);
                }
                .dashboard-content-wrapper {
                    max-width: 1200px;
                    width: 100%;
                    margin: 0 auto;
                }
                .dashboard-main-row {
                    min-height: 540px;
                }
                .glass-card {
                    background: rgba(255,255,255,0.85);
                    border-radius: 18px;
                    box-shadow: 0 8px 32px rgba(99,102,241,0.08), 0 1.5px 4px rgba(0,0,0,0.04);
                    backdrop-filter: blur(8px);
                }
                .dashboard-card-equal {
                    min-height: 420px;
                    height: 420px;
                    display: flex;
                    flex-direction: column;
                    justify-content: flex-start;
                }
                .icon-circle {
                    width: 48px;
                    height: 48px;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    margin: 0 auto;
                    color: #fff;
                    font-size: 1.5rem;
                }
                .bg-gradient-primary { background: linear-gradient(135deg,#6366f1,#60a5fa); }
                .bg-gradient-success { background: linear-gradient(135deg,#22d3ee,#38bdf8); }
                .bg-gradient-info { background: linear-gradient(135deg,#818cf8,#a5b4fc); }
                .bg-gradient-warning { background: linear-gradient(135deg,#fbbf24,#f59e42); }
                .text-gradient {
                    background: linear-gradient(90deg,#6366f1,#a5b4fc);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                }
                .meeting-list-table thead th {
                    font-weight: 600;
                    color: #6366f1;
                    background: transparent;
                    border-bottom: 2px solid #e0e7ff;
                }
                .meeting-row td {
                    vertical-align: middle;
                }
                .meeting-list-table, .recent-bookings-list {
                    min-height: 320px;
                    max-height: 320px;
                    overflow-y: auto;
                }
                @media (max-width: 991.98px) {
                    .dashboard-content-wrapper {
                        max-width: 100%;
                        padding: 0 10px;
                    }
                    .dashboard-card-equal {
                        min-height: 320px;
                        height: auto;
                    }
                }

                /* Enhanced Professional Footer */
                .enhanced-footer {
                    background: linear-gradient(135deg, #1a202c 0%, #2d3748 100%);
                    color: #e2e8f0;
                    position: relative;
                    overflow: hidden;
                    padding: 4rem 0 2rem;
                    margin-top: 4rem;
                }

                .footer-background {
                    position: absolute;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    z-index: 0;
                }

                .footer-pattern {
                    position: absolute;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background-image: 
                        radial-gradient(circle at 1px 1px, rgba(255,255,255,0.05) 1px, transparent 0);
                    background-size: 20px 20px;
                    animation: float 20s ease-in-out infinite;
                }

                .footer-glow {
                    position: absolute;
                    top: -50%;
                    left: 50%;
                    transform: translateX(-50%);
                    width: 200%;
                    height: 100%;
                    background: radial-gradient(
                        ellipse at center,
                        rgba(99, 102, 241, 0.1) 0%,
                        transparent 70%
                    );
                    animation: pulse 4s ease-in-out infinite;
                }

                .footer-main {
                    position: relative;
                    z-index: 1;
                    padding: 2rem 0;
                }

                .footer-brand-section {
                    text-align: center;
                }

                .brand-container {
                    display: flex;
                    align-items: center;
                    margin-bottom: 1.5rem;
                }

                .brand-icon-footer {
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    color: white;
                    width: 48px;
                    height: 48px;
                    border-radius: 12px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    margin-right: 1rem;
                    box-shadow: 0 8px 25px rgba(102, 126, 234, 0.3);
                }

                .brand-name-footer {
                    color: #f7fafc;
                    font-size: 1.5rem;
                    font-weight: 700;
                    margin: 0;
                    background: linear-gradient(135deg, #f7fafc 0%, #cbd5e0 100%);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                    background-clip: text;
                }

                .brand-description {
                    color: #a0aec0;
                    font-size: 0.95rem;
                    line-height: 1.6;
                    margin-bottom: 2rem;
                    max-width: 400px;
                    margin-left: auto;
                    margin-right: auto;
                }

                .footer-section-title {
                    color: #f7fafc;
                    font-size: 1.1rem;
                    font-weight: 600;
                    margin-bottom: 1.5rem;
                    display: flex;
                    align-items: center;
                    position: relative;
                }

                .footer-section-title::after {
                    content: '';
                    position: absolute;
                    bottom: -5px;
                    left: 0;
                    width: 30px;
                    height: 2px;
                    background: linear-gradient(90deg, #667eea, #764ba2);
                    border-radius: 1px;
                }

                .footer-nav-list {
                    list-style: none;
                    padding: 0;
                    margin: 0;
                    text-align: center;
                }

                .footer-nav-list li {
                    margin-bottom: 0.75rem;
                }

                .footer-nav-link {
                    color: #a0aec0;
                    text-decoration: none;
                    font-size: 0.9rem;
                    transition: all 0.3s ease;
                    position: relative;
                    padding: 0.5rem 1rem;
                    border-radius: 6px;
                    display: inline-block;
                }

                .footer-nav-link:hover {
                    color: #667eea;
                    background: rgba(102, 126, 234, 0.1);
                    transform: translateY(-2px);
                }

                .footer-divider-enhanced {
                    position: relative;
                    margin: 3rem 0 2rem;
                    height: 1px;
                    background: rgba(160, 174, 192, 0.2);
                    overflow: hidden;
                }

                .divider-line {
                    position: absolute;
                    top: 0;
                    left: 0;
                    right: 0;
                    height: 1px;
                    background: linear-gradient(
                        90deg,
                        transparent 0%,
                        rgba(102, 126, 234, 0.5) 50%,
                        transparent 100%
                    );
                }

                .divider-glow {
                    position: absolute;
                    top: -2px;
                    left: 50%;
                    transform: translateX(-50%);
                    width: 100px;
                    height: 5px;
                    background: radial-gradient(
                        ellipse,
                        rgba(102, 126, 234, 0.6) 0%,
                        transparent 70%
                    );
                    border-radius: 50%;
                }

                .footer-bottom {
                    position: relative;
                    z-index: 1;
                    padding-top: 2rem;
                }

                .copyright-text {
                    color: #718096;
                    font-size: 0.85rem;
                    margin: 0;
                    line-height: 1.6;
                }

                .brand-highlight {
                    color: #667eea;
                    font-weight: 600;
                }

                @keyframes float {
                    0%, 100% { transform: translateY(0px) rotate(0deg); }
                    33% { transform: translateY(-10px) rotate(1deg); }
                    66% { transform: translateY(5px) rotate(-1deg); }
                }

                @keyframes pulse {
                    0%, 100% { opacity: 0.5; transform: translateX(-50%) scale(1); }
                    50% { opacity: 0.8; transform: translateX(-50%) scale(1.05); }
                }
            `}</style>

            {/* Enhanced Professional Footer */}
            <footer className="enhanced-footer">
                <div className="footer-background">
                    <div className="footer-pattern"></div>
                    <div className="footer-glow"></div>
                </div>

                <Container className="position-relative">
                    {/* Main Footer Content */}
                    <Row className="footer-main justify-content-center">
                        <Col lg={4} md={6} className="mb-4 text-center">
                            <motion.div
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.8 }}
                                viewport={{ once: true }}
                                className="footer-brand-section"
                            >
                                <div className="brand-container mb-4 justify-content-center">
                                    <motion.div
                                        className="brand-icon-footer"
                                        animate={{
                                            rotate: [0, 5, -5, 0],
                                            scale: [1, 1.05, 1]
                                        }}
                                        transition={{
                                            duration: 4,
                                            repeat: Infinity,
                                            ease: "easeInOut"
                                        }}
                                    >
                                        <FiCalendar size={28} />
                                    </motion.div>
                                    <h4 className="brand-name-footer">meetslot.ai</h4>
                                </div>

                                <p className="brand-description">
                                    Making scheduling simple and efficient for everyone.
                                </p>
                            </motion.div>
                        </Col>

                        <Col lg={6} md={6} className="mb-4">
                            <motion.div
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.8, delay: 0.2 }}
                                viewport={{ once: true }}
                                className="text-center"
                            >
                                <h6 className="footer-section-title justify-content-center">
                                    <FiUsers className="me-2" />
                                    Legal & Support
                                </h6>
                                <ul className="footer-nav-list">
                                    {[
                                        { name: "Privacy Policy", href: "/privacy-policy", external: true },
                                        { name: "Terms of Service", href: "/terms-of-service", external: true },
                                        { name: "Support Center", href: "/support", external: true }
                                    ].map((item, index) => (
                                        <motion.li
                                            key={index}
                                            initial={{ opacity: 0, x: -20 }}
                                            whileInView={{ opacity: 1, x: 0 }}
                                            transition={{ delay: 0.1 * index }}
                                            viewport={{ once: true }}
                                            className="d-inline-block mx-3"
                                        >
                                            <motion.a
                                                href={item.href}
                                                className="footer-nav-link"
                                                target={item.external ? "_blank" : "_self"}
                                                rel={item.external ? "noopener noreferrer" : ""}
                                                whileHover={{ x: 5, color: "#667eea" }}
                                                transition={{ duration: 0.2 }}
                                            >
                                                {item.name}
                                                {item.external && <FiUsers className="ms-1" size={12} />}
                                            </motion.a>
                                        </motion.li>
                                    ))}
                                </ul>
                            </motion.div>
                        </Col>
                    </Row>

                    {/* Animated Divider */}
                    <motion.div
                        className="footer-divider-enhanced"
                        initial={{ scaleX: 0 }}
                        whileInView={{ scaleX: 1 }}
                        transition={{ duration: 1.2 }}
                        viewport={{ once: true }}
                    >
                        <div className="divider-line"></div>
                        <motion.div
                            className="divider-glow"
                            animate={{
                                opacity: [0.5, 1, 0.5],
                                scale: [1, 1.1, 1]
                            }}
                            transition={{
                                duration: 3,
                                repeat: Infinity,
                                ease: "easeInOut"
                            }}
                        />
                    </motion.div>

                    {/* Bottom Footer */}
                    <Row className="footer-bottom align-items-center">
                        <Col className="text-center">
                            <motion.p
                                className="copyright-text"
                                initial={{ opacity: 0 }}
                                whileInView={{ opacity: 1 }}
                                transition={{ duration: 0.8, delay: 0.5 }}
                                viewport={{ once: true }}
                            >
                                © 2024 <span className="brand-highlight">meetslot.ai</span>.
                                All rights reserved.
                            </motion.p>
                        </Col>
                    </Row>
                </Container>
            </footer>
        </motion.div>
    );
};

export default Dashboard;
