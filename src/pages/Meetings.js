import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Container, Row, Col, Card, Button, Badge, Form, InputGroup, Table, Dropdown, Modal, Spinner, OverlayTrigger, Tooltip, Alert } from 'react-bootstrap';
import { motion, AnimatePresence } from 'framer-motion';
import { FiSearch, FiFilter, FiDownload, FiMoreVertical, FiVideo, FiMail, FiCalendar, FiClock, FiUsers, FiFileText, FiRefreshCw, FiSettings } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import meetingService from '../services/meetingService';
import meetingTypeService from '../services/meetingTypeService';
import timezoneService from '../services/timezoneService';

// Improved Loading indicator component with stable height
const LoadingIndicator = () => (
    <div className="text-center py-3 loading-indicator" style={{ height: '50px', opacity: 1 }}>
        <Spinner animation="border" variant="primary" size="sm" className="me-2" />
        <span className="text-muted">Loading more meetings...</span>
    </div>
);

const MeetingsPage = () => {
    const navigate = useNavigate();

    // Search and Filter States
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');
    const [dateFilter, setDateFilter] = useState('all'); // all, today, upcoming, past

    // Advanced Filters
    const [showMoreFiltersModal, setShowMoreFiltersModal] = useState(false);
    const [advancedFilters, setAdvancedFilters] = useState({
        dateFrom: '',
        dateTo: '',
        meetingType: 'all',
        duration: 'all',
        attendeeEmail: ''
    });
    const [filtersApplied, setFiltersApplied] = useState(false);

    // Meetings Data States (now from API)
    const [allMeetings, setAllMeetings] = useState([]);
    const [displayedMeetings, setDisplayedMeetings] = useState([]);
    const [meetingsStats, setMeetingsStats] = useState({
        total: 0,
        confirmed: 0,
        pending: 0,
        completed: 0,
        cancelled: 0
    });

    // Recent Bookings State
    const [recentBookings, setRecentBookings] = useState([]);
    const [bookingsLoading, setBookingsLoading] = useState(false);
    const [showBookingsModal, setShowBookingsModal] = useState(false);
    const [selectedMeetingBookings, setSelectedMeetingBookings] = useState([]);
    const [selectedMeetingName, setSelectedMeetingName] = useState('');

    // Pagination and Loading States
    const [currentPage, setCurrentPage] = useState(1);
    const [loading, setLoading] = useState(false);
    const [initialLoading, setInitialLoading] = useState(true);
    const [hasMore, setHasMore] = useState(true);
    const [totalPages, setTotalPages] = useState(0);
    const itemsPerPage = 10;

    // Modal States
    const [showRescheduleModal, setShowRescheduleModal] = useState(false);
    const [selectedMeetingForReschedule, setSelectedMeetingForReschedule] = useState(null);
    const [rescheduleForm, setRescheduleForm] = useState({
        date: '',
        time: '',
        reason: ''
    });

    // Add new modal state for meeting details
    const [showDetailsModal, setShowDetailsModal] = useState(false);
    const [selectedMeetingForDetails, setSelectedMeetingForDetails] = useState(null);

    // Edit Meeting Modal States
    const [showEditModal, setShowEditModal] = useState(false);
    const [selectedMeetingForEdit, setSelectedMeetingForEdit] = useState(null);
    const [editForm, setEditForm] = useState({
        name: '',
        description: '',
        duration: 30,
        color: '#006bff',
        isActive: true,
        settings: {
            bufferTimeBefore: 5,
            bufferTimeAfter: 5,
            allowRescheduling: true,
            allowCancellation: true,
            requireApproval: false,
            maxAdvanceBooking: 30
        }
    });
    const [editLoading, setEditLoading] = useState(false);

    // Create Meeting Modal States (same as Dashboard)
    const [showNewMeetingModal, setShowNewMeetingModal] = useState(false);
    const [newMeetingType, setNewMeetingType] = useState({
        name: '',
        duration: 30,
        description: '',
        color: '#006bff',
        availableDate: '',
        timezone: 'Asia/Kolkata' // Default to India timezone
    });
    const [timeZones, setTimeZones] = useState([]);

    // Alert States
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    // Intersection Observer for infinite scrolling
    const observer = useRef();
    const isLoadingRef = useRef(false);
    const debounceTimerRef = useRef(null);

    // Load meetings from API - Handle the actual API response structure
    const loadMeetings = async (page = 1, append = false, filters = {}) => {
        try {
            if (!append) {
                setLoading(true);
                if (page === 1) setInitialLoading(true);
            }

            isLoadingRef.current = true;

            // Prepare query parameters - support date filtering
            const queryParams = {
                page,
                limit: itemsPerPage
            };

            // Add status filter
            if (filterStatus !== 'all') queryParams.status = filterStatus;

            // Add date filtering support
            if (advancedFilters.dateFrom) queryParams.dateFrom = advancedFilters.dateFrom;
            if (advancedFilters.dateTo) queryParams.dateTo = advancedFilters.dateTo;

            // Add specific date filter if needed
            if (filters.availableDate) queryParams.availableDate = filters.availableDate;

            console.log('Loading meetings with params:', queryParams);

            const response = await meetingService.getMeetings(queryParams);
            console.log('Meetings API response:', response);

            if (response && response.success) {
                const { data } = response;
                const meetings = data?.meetingTypes || [];

                const pagination = data?.pagination || {
                    page: page,
                    pages: 1,
                    total: meetings.length,
                    hasMore: false
                };

                // Transform to display format using correct API fields
                const transformedMeetings = meetings.map(meetingType => ({
                    _id: meetingType._id,
                    title: meetingType.name,
                    description: meetingType.description,
                    duration: meetingType.duration, // Use 'duration' from API
                    type: 'Meeting Type',
                    status: meetingType.isActive ? 'active' : 'inactive',
                    color: meetingType.color,
                    totalBookings: meetingType.totalBookings || 0,
                    bookingLink: meetingType.bookingLink,
                    createdAt: meetingType.createdAt,
                    updatedAt: meetingType.updatedAt,
                    settings: meetingType.settings,
                    // Use the user-selected availableDate for filtering/display
                    availableDate: meetingType.dateFormatted ||
                        (meetingType.availableDate ? new Date(meetingType.availableDate).toISOString().split('T')[0] : null),
                    availableDateRaw: meetingType.availableDate,
                    dateFormatted: meetingType.dateFormatted,
                    // For display purposes
                    date: meetingType.dateFormatted ||
                        (meetingType.availableDate ? new Date(meetingType.availableDate).toLocaleDateString() :
                            new Date(meetingType.createdAt).toLocaleDateString()),
                    time: new Date(meetingType.createdAt).toLocaleTimeString(),
                    attendees: [],
                    attendeeCount: 0,
                    // Include additional fields
                    availableDays: meetingType.availableDays,
                    availableTimeSlots: meetingType.availableTimeSlots
                }));

                // Client-side search filtering
                let filteredMeetings = transformedMeetings;
                if (searchTerm && searchTerm.trim()) {
                    const searchLower = searchTerm.toLowerCase().trim();
                    filteredMeetings = transformedMeetings.filter(meeting => {
                        return (
                            meeting.title.toLowerCase().includes(searchLower) ||
                            meeting.description?.toLowerCase().includes(searchLower) ||
                            meeting.type.toLowerCase().includes(searchLower) ||
                            meeting.status.toLowerCase().includes(searchLower) ||
                            meeting.duration.toString().includes(searchLower) ||
                            meeting.availableDate?.includes(searchLower)
                        );
                    });
                    console.log(`Client-side search: Found ${filteredMeetings.length} results for "${searchTerm}"`);
                }

                // Calculate stats
                const stats = {
                    total: searchTerm ? filteredMeetings.length : (pagination.total || transformedMeetings.length),
                    active: filteredMeetings.filter(m => m.status === 'active').length,
                    inactive: filteredMeetings.filter(m => m.status === 'inactive').length,
                    completed: filteredMeetings.filter(m => m.totalBookings > 0).length,
                    cancelled: 0
                };

                if (append && !searchTerm) {
                    setDisplayedMeetings(prev => [...prev, ...filteredMeetings]);
                } else {
                    setDisplayedMeetings(filteredMeetings);
                    setAllMeetings(searchTerm ? transformedMeetings : filteredMeetings);
                }

                // Update pagination info - disable pagination when searching
                if (searchTerm) {
                    setCurrentPage(1);
                    setTotalPages(1);
                    setHasMore(false);
                } else {
                    setCurrentPage(pagination.page || page);
                    setTotalPages(pagination.pages || 1);
                    setHasMore(pagination.hasMore || false);
                }

                // Update stats
                setMeetingsStats(stats);

            } else {
                throw new Error(response?.message || 'Failed to load meetings');
            }

        } catch (error) {
            console.error('Failed to load meetings:', error);
            setError(error.message || 'Failed to load meetings');
            if (!append) {
                setDisplayedMeetings([]);
                setAllMeetings([]);
                setMeetingsStats({
                    total: 0,
                    active: 0,
                    inactive: 0,
                    completed: 0,
                    cancelled: 0
                });
            }
        } finally {
            setLoading(false);
            setInitialLoading(false);
            isLoadingRef.current = false;
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

    // Updated loadRecentBookings to handle actual API response
    const loadRecentBookings = async () => {
        try {
            setBookingsLoading(true);
            console.log('Loading recent bookings...');

            // First, get all meeting types to iterate through
            let meetingTypes = [];

            // Check if allMeetings has meeting types data
            if (allMeetings && allMeetings.length > 0) {
                meetingTypes = allMeetings;
                console.log('Using existing meeting types:', meetingTypes.length);
            } else {
                // Fetch meeting types if not available
                console.log('Fetching meeting types for bookings...');
                try {
                    const meetingTypesResponse = await meetingTypeService.getMeetingTypes(1, 50); // Get up to 50 meeting types
                    if (meetingTypesResponse.success && meetingTypesResponse.data && meetingTypesResponse.data.meetingTypes) {
                        meetingTypes = meetingTypesResponse.data.meetingTypes;
                        console.log('Fetched meeting types:', meetingTypes.length);
                    }
                } catch (error) {
                    console.error('Failed to fetch meeting types:', error);
                    setRecentBookings([]);
                    return;
                }
            }

            if (meetingTypes.length === 0) {
                console.log('No meeting types available');
                setRecentBookings([]);
                return;
            }

            const allBookings = [];

            // Iterate through first 5 meeting types to avoid too many API calls
            for (const meetingType of meetingTypes.slice(0, 5)) {
                try {
                    console.log(`Loading bookings for meeting type: ${meetingType.name || meetingType.title}`);
                    const response = await makeAuthenticatedRequest(
                        `http://localhost:5000/api/v1/meetings/public/${meetingType._id || meetingType.id}/bookings`
                    );
                    const data = await response.json();

                    console.log(`Bookings API Response for ${meetingType.name}:`, data);

                    // Handle your actual API response structure
                    if (data.success && data.data && data.data.bookings && Array.isArray(data.data.bookings)) {
                        const processedBookings = data.data.bookings.map(booking => {
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
                                // Map your API fields to frontend expected fields
                                _id: booking._id || booking.id,
                                date: formattedDate,
                                time: formattedTime,
                                status: booking.status || 'confirmed',
                                createdAt: booking.createdAt,
                                scheduledAt: booking.scheduledAt || booking.createdAt,
                                title: booking.title || `${meetingType.name || meetingType.title} with ${booking.guestInfo?.name || 'Guest'}`,
                                duration: booking.duration || meetingType.duration || 30,
                                timezone: booking.timezone || 'UTC',
                                // Extract guest info from the booking object
                                guestInfo: {
                                    name: booking.guestInfo?.name || 'Guest',
                                    email: booking.guestInfo?.email || '',
                                    phone: booking.guestInfo?.phone || '',
                                    message: booking.guestInfo?.message || ''
                                },
                                // Google Meet information
                                googleMeetJoinUrl: booking.googleMeetJoinUrl || null,
                                googleMeetHtmlLink: booking.googleMeetHtmlLink || null,
                                googleMeetId: booking.googleMeetId || null,
                                // Add meeting type info
                                meetingTypeName: meetingType.name || meetingType.title,
                                meetingTypeColor: meetingType.color || '#006bff',
                                meetingTypeId: meetingType._id || meetingType.id
                            };
                        });
                        allBookings.push(...processedBookings);
                        console.log(`Added ${processedBookings.length} bookings from ${meetingType.name}`);
                    } else {
                        console.log(`No bookings found for meeting type: ${meetingType.name}`);
                    }
                } catch (error) {
                    console.error(`Failed to load bookings for ${meetingType.name || meetingType.title}:`, error);
                    if (error.message.includes('Session expired')) {
                        setError(error.message);
                        navigate('/login');
                        return;
                    }
                }
            }

            console.log('Total processed bookings:', allBookings.length);

            // Sort by creation date (newest first)
            const sortedBookings = allBookings
                .sort((a, b) => new Date(b.createdAt || b.scheduledAt) - new Date(a.createdAt || a.scheduledAt));

            setRecentBookings(sortedBookings);
            console.log('Recent bookings set successfully:', sortedBookings.length);
        } catch (error) {
            console.error('Failed to load recent bookings:', error);
            setRecentBookings([]);
            if (error.message.includes('Session expired')) {
                setError(error.message);
                navigate('/login');
            }
        } finally {
            setBookingsLoading(false);
        }
    };

    // Load bookings for specific meeting type
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
                            name: booking.guestInfo?.name || (booking.title ? booking.title.replace(' with ', ' - ') : 'Guest'),
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

    // Load more meetings for infinite scroll
    const loadMoreMeetings = () => {
        if (isLoadingRef.current || !hasMore) return;

        // Use debouncing to prevent multiple triggers
        if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
        debounceTimerRef.current = setTimeout(() => {
            loadMeetings(currentPage + 1, true);
        }, 300);
    };

    // Intersection Observer for infinite scrolling
    const lastMeetingElementRef = useCallback(node => {
        if (loading || !hasMore) return;

        if (observer.current) observer.current.disconnect();
        observer.current = new IntersectionObserver(entries => {
            if (entries[0].isIntersecting && hasMore && !isLoadingRef.current) {
                loadMoreMeetings();
            }
        }, {
            rootMargin: '200px',
            threshold: 0.1
        });

        if (node) observer.current.observe(node);
    }, [loading, hasMore]);

    // Initial load and filter changes
    useEffect(() => {
        loadMeetings(1, false);

        // Listen for new meeting types created from navbar
        const handleMeetingTypesUpdated = (event) => {
            // Show subtle success message
            setSuccess('Meeting type created successfully!');

            // Auto-hide success message after 3 seconds
            setTimeout(() => {
                setSuccess('');
            }, 3000);

            // Refresh the meetings list when a new meeting type is created
            handleRefresh();
        };

        window.addEventListener('meetingTypesUpdated', handleMeetingTypesUpdated);

        return () => {
            window.removeEventListener('meetingTypesUpdated', handleMeetingTypesUpdated);
        };
    }, [filterStatus, dateFilter]);

    // Load recent bookings when meetings are loaded
    useEffect(() => {
        if (allMeetings.length > 0) {
            loadRecentBookings();
        }
    }, [allMeetings]);

    // Load recent bookings on component mount (independent of allMeetings)
    useEffect(() => {
        loadRecentBookings();
    }, []);

    // Advanced filters apply
    useEffect(() => {
        if (filtersApplied) {
            loadMeetings(1, false);
        }
    }, [filtersApplied]);

    // Handle search with immediate client-side filtering
    const handleSearchChange = (value) => {
        setSearchTerm(value);

        // Clear debounce timer
        if (debounceTimerRef.current) {
            clearTimeout(debounceTimerRef.current);
        }

        // If search is cleared, reload from API
        if (!value || value.trim() === '') {
            setCurrentPage(1);
            setHasMore(true);
            setDisplayedMeetings([]);
            loadMeetings(1, false);
            return;
        }

        // For search, filter from existing data immediately
        if (allMeetings.length > 0) {
            const searchLower = value.toLowerCase().trim();
            const filteredMeetings = allMeetings.filter(meeting => {
                return (
                    meeting.title.toLowerCase().includes(searchLower) ||
                    meeting.description?.toLowerCase().includes(searchLower) ||
                    meeting.type.toLowerCase().includes(searchLower) ||
                    meeting.status.toLowerCase().includes(searchLower) ||
                    meeting.duration.toString().includes(searchLower)
                );
            });

            setDisplayedMeetings(filteredMeetings);

            // Update stats for search results
            const stats = {
                total: filteredMeetings.length,
                active: filteredMeetings.filter(m => m.status === 'active').length,
                inactive: filteredMeetings.filter(m => m.status === 'inactive').length,
                completed: filteredMeetings.filter(m => m.totalBookings > 0).length,
                cancelled: 0
            };
            setMeetingsStats(stats);

            // Disable pagination during search
            setHasMore(false);
            setCurrentPage(1);
            setTotalPages(1);
        } else {
            // If no data loaded yet, trigger API call
            debounceTimerRef.current = setTimeout(() => {
                loadMeetings(1, false);
            }, 300);
        }
    };

    // Apply advanced filters
    const applyAdvancedFilters = () => {
        setFiltersApplied(true);
        setShowMoreFiltersModal(false);
        setCurrentPage(1);
        setHasMore(true);
        setDisplayedMeetings([]);

        // Call loadMeetings with advanced filters
        const filterParams = {};
        if (advancedFilters.dateFrom) filterParams.dateFrom = advancedFilters.dateFrom;
        if (advancedFilters.dateTo) filterParams.dateTo = advancedFilters.dateTo;

        loadMeetings(1, false, filterParams);
    };

    // Reset advanced filters
    const resetAdvancedFilters = () => {
        setAdvancedFilters({
            dateFrom: '',
            dateTo: '',
            meetingType: 'all',
            duration: 'all',
            attendeeEmail: ''
        });
        setFiltersApplied(false);
        setCurrentPage(1);
        setHasMore(true);
        setDisplayedMeetings([]);
    };

    // Refresh meetings
    const handleRefresh = () => {
        setCurrentPage(1);
        setHasMore(true);
        setDisplayedMeetings([]);
        loadMeetings(1, false);
    };

    // Handle reschedule meeting
    const handleReschedule = (meeting) => {
        setSelectedMeetingForReschedule(meeting);
        setRescheduleForm({
            date: meeting.date,
            time: meeting.time ? meeting.time.replace(' AM', '').replace(' PM', '') : '',
            reason: ''
        });
        setShowRescheduleModal(true);
    };

    // Submit reschedule
    const handleRescheduleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        try {
            const meetingId = selectedMeetingForReschedule._id || selectedMeetingForReschedule.id;

            const rescheduleData = {
                date: rescheduleForm.date,
                time: rescheduleForm.time,
                reason: rescheduleForm.reason
            };

            const response = await meetingService.rescheduleMeeting(meetingId, rescheduleData);

            if (response.success) {
                setSuccess('Meeting rescheduled successfully!');
                setShowRescheduleModal(false);
                setSelectedMeetingForReschedule(null);

                // Refresh the meetings list
                handleRefresh();

                // Optionally send email notification
                if (window.confirm('Would you like to send notification emails to attendees?')) {
                    try {
                        await meetingService.sendRescheduleNotification(meetingId, rescheduleData);
                    } catch (emailError) {
                        console.error('Failed to send email notifications:', emailError);
                    }
                }
            } else {
                throw new Error(response.message || 'Failed to reschedule meeting');
            }

        } catch (error) {
            console.error('Failed to reschedule meeting:', error);
            setError(error.message || 'Failed to reschedule meeting');
        }
    };

    // Handle cancel meeting
    const handleCancelMeeting = async (meetingId) => {
        if (!window.confirm('Are you sure you want to cancel this meeting?')) return;

        try {
            const response = await meetingService.cancelMeeting(meetingId);

            if (response.success) {
                setSuccess('Meeting cancelled successfully!');

                // Refresh the meetings list
                handleRefresh();

                // Optionally send cancellation notifications
                if (window.confirm('Send cancellation notifications to attendees?')) {
                    try {
                        await meetingService.sendCancellationNotification(meetingId);
                    } catch (emailError) {
                        console.error('Failed to send cancellation notifications:', emailError);
                    }
                }
            } else {
                throw new Error(response.message || 'Failed to cancel meeting');
            }

        } catch (error) {
            console.error('Failed to cancel meeting:', error);
            setError(error.message || 'Failed to cancel meeting');
        }
    };

    // Handle copy meeting link
    const handleCopyLink = async (meeting) => {
        try {
            const link = meeting.meetingLink || meeting.joinLink || '';
            if (link) {
                await navigator.clipboard.writeText(link);
                setSuccess('Meeting link copied to clipboard!');
            } else {
                setError('No meeting link available');
            }
        } catch (error) {
            console.error('Failed to copy link:', error);
            setError('Failed to copy link');
        }
    };

    // Handle send email
    const handleSendEmail = (meeting) => {
        const attendeeEmails = meeting.attendees?.map(a => a.email).filter(Boolean).join(',') || '';
        const subject = encodeURIComponent(`Meeting: ${meeting.title}`);
        const body = encodeURIComponent(`
Dear Attendee,

You have a scheduled meeting:

Title: ${meeting.title}
Date: ${meeting.date}
Time: ${meeting.time}
Duration: ${meeting.duration} minutes

${meeting.meetingLink ? `Join Link: ${meeting.meetingLink}` : ''}

Best regards,
ScheduleMe Team
        `);

        if (attendeeEmails) {
            window.open(`mailto:${attendeeEmails}?subject=${subject}&body=${body}`);
        } else {
            setError('No attendee email addresses found');
        }
    };

    // Enhanced export functionality
    const handleExportMeetings = async (format = 'csv') => {
        try {
            // Use all meetings data for export, not just displayed ones
            const exportData = await meetingService.exportMeetings({
                format,
                search: searchTerm,
                status: filterStatus !== 'all' ? filterStatus : undefined,
                dateFilter: dateFilter !== 'all' ? dateFilter : undefined,
                ...advancedFilters
            });

            if (exportData.success && exportData.data) {
                // Create and download file
                const blob = new Blob([exportData.data.content], {
                    type: format === 'csv' ? 'text/csv' : 'application/json'
                });
                const url = URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = url;
                link.download = exportData.data.filename;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                URL.revokeObjectURL(url);

                setSuccess(`Meetings exported successfully as ${format.toUpperCase()}!`);
            } else {
                throw new Error('Failed to export meetings');
            }

        } catch (error) {
            console.error('Export failed:', error);
            setError('Failed to export meetings');
        }
    };

    const getStatusColor = (status) => {
        const colors = {
            active: 'success',
            inactive: 'secondary',
            confirmed: 'success',
            pending: 'warning',
            cancelled: 'danger',
            completed: 'info',
            rescheduled: 'warning'
        };
        return colors[status] || 'secondary';
    };

    const getAttendeeStatusColor = (status) => {
        const colors = {
            confirmed: 'success',
            pending: 'warning',
            tentative: 'info',
            declined: 'danger'
        };
        return colors[status] || 'secondary';
    };

    // Helper function for creating tooltips
    const renderTooltip = (text) => (
        <Tooltip className="custom-tooltip">
            {text}
        </Tooltip>
    );

    // Get unique meeting types for filter from API data
    const getMeetingTypes = () => {
        const types = [...new Set(allMeetings.map(m => m.type || m.meetingType?.name).filter(Boolean))];
        return types.sort();
    };

    // Add function to handle viewing details
    const handleViewDetails = (meeting) => {
        setSelectedMeetingForDetails(meeting);
        setShowDetailsModal(true);
    };

    // Handle edit meeting - Auto-fill form with selected meeting data
    const handleEditMeeting = (meeting) => {
        setSelectedMeetingForEdit(meeting);

        // Auto-fill the form with existing meeting data
        const editData = {
            name: meeting.title || '',
            description: meeting.description || '',
            duration: meeting.duration || 30,
            color: meeting.color || '#006bff',
            isActive: meeting.status === 'active',
            settings: {
                bufferTimeBefore: meeting.settings?.bufferTimeBefore || 5,
                bufferTimeAfter: meeting.settings?.bufferTimeAfter || 5,
                allowRescheduling: meeting.settings?.allowRescheduling !== undefined ? meeting.settings.allowRescheduling : true,
                allowCancellation: meeting.settings?.allowCancellation !== undefined ? meeting.settings.allowCancellation : true,
                requireApproval: meeting.settings?.requireApproval || false,
                maxAdvanceBooking: meeting.settings?.maxAdvanceBooking || 30
            }
        };

        setEditForm(editData);
        setShowEditModal(true);
    };

    // Handle edit form input changes
    const handleEditInputChange = (field, value) => {
        setEditForm(prev => ({
            ...prev,
            [field]: value
        }));
    };

    // Handle edit settings changes
    const handleEditSettingsChange = (field, value) => {
        setEditForm(prev => ({
            ...prev,
            settings: {
                ...prev.settings,
                [field]: value
            }
        }));
    };

    // Submit edit form
    const handleEditSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        try {
            setEditLoading(true);
            const meetingId = selectedMeetingForEdit._id || selectedMeetingForEdit.id;

            const response = await meetingService.updateMeetingType(meetingId, editForm);

            if (response.success) {
                setSuccess('Meeting updated successfully!');
                setShowEditModal(false);
                setSelectedMeetingForEdit(null);

                // Refresh the meetings list
                handleRefresh();

                // Auto-hide success message after 3 seconds
                setTimeout(() => {
                    setSuccess('');
                }, 3000);
            } else {
                throw new Error(response.message || 'Failed to update meeting');
            }
        } catch (error) {
            console.error('Failed to update meeting:', error);
            setError(error.message || 'Failed to update meeting');
        } finally {
            setEditLoading(false);
        }
    };

    // Predefined colors for the edit modal
    const predefinedColors = [
        '#006bff', '#28a745', '#dc3545', '#ffc107', '#17a2b8',
        '#6f42c1', '#e83e8c', '#fd7e14', '#20c997', '#6c757d'
    ];

    // Duration options for the edit modal
    const durationOptions = [
        { value: 15, label: '15 minutes' },
        { value: 30, label: '30 minutes' },
        { value: 45, label: '45 minutes' },
        { value: 60, label: '1 hour' },
        { value: 90, label: '1.5 hours' },
        { value: 120, label: '2 hours' }
    ];

    // Load timezones
    const loadTimezones = async () => {
        try {
            const response = await timezoneService.getTimezones();
            if (response.success && response.data) {
                setTimeZones(response.data);
            }
        } catch (error) {
            console.error('Failed to load timezones:', error);
        }
    };

    // Load timezones on component mount
    useEffect(() => {
        loadTimezones();
    }, []);

    // Handle Create Meeting Type (same as Dashboard)
    const handleCreateMeetingType = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        try {
            const response = await meetingTypeService.createMeetingType(newMeetingType);

            if (response.success) {
                setSuccess('Meeting type created successfully!');
                setShowNewMeetingModal(false);

                // Reset form
                setNewMeetingType({
                    name: '',
                    duration: 30,
                    description: '',
                    color: '#006bff',
                    availableDate: '',
                    timezone: timezoneService.getUserTimezone()
                });

                // Refresh meetings list
                handleRefresh();

                // Auto-hide success message
                setTimeout(() => {
                    setSuccess('');
                }, 3000);

                // Dispatch event for other components
                window.dispatchEvent(new CustomEvent('meetingTypesUpdated'));
            } else {
                throw new Error(response.message || 'Failed to create meeting type');
            }
        } catch (error) {
            console.error('Failed to create meeting type:', error);
            setError(error.message || 'Failed to create meeting type');
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="meetings-bg"
        >
            <Container fluid className="py-5 d-flex justify-content-center align-items-start" style={{ minHeight: '100vh' }}>
                <div className="meetings-content-wrapper">
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
                                    <h1 className="display-5 fw-bold mb-1 text-gradient">Meetings</h1>
                                    <p className="text-muted mb-0">
                                        Manage all your scheduled meetings ({meetingsStats.total} total)
                                    </p>
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
                                    <FiCalendar className="me-2" />
                                    Schedule New
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

                    {/* Filters and Content - Keep the same UI design */}
                    {(initialLoading || displayedMeetings.length > 0 || searchTerm || filterStatus !== 'all' || filtersApplied) && (
                        <>
                            {/* Filter Controls - Same as existing design */}
                            <Row className="mb-4">
                                <Col md={4}>
                                    <motion.div
                                        initial={{ x: -30, opacity: 0 }}
                                        animate={{ x: 0, opacity: 1 }}
                                        transition={{ delay: 0.2 }}
                                    >
                                        <InputGroup>
                                            <InputGroup.Text>
                                                <FiSearch />
                                            </InputGroup.Text>
                                            <Form.Control
                                                type="text"
                                                placeholder="Search meeting types by name..."
                                                value={searchTerm}
                                                onChange={(e) => handleSearchChange(e.target.value)}
                                                className="form-control-modern"
                                            />
                                        </InputGroup>
                                    </motion.div>
                                </Col>
                                <Col md={2}>
                                    <motion.div
                                        initial={{ x: 30, opacity: 0 }}
                                        animate={{ x: 0, opacity: 1 }}
                                        transition={{ delay: 0.3 }}
                                    >
                                        <Form.Select
                                            value={filterStatus}
                                            onChange={(e) => setFilterStatus(e.target.value)}
                                            className="form-control-modern"
                                        >
                                            <option value="all">All Status</option>
                                            <option value="active">Active</option>
                                            <option value="inactive">Inactive</option>
                                        </Form.Select>
                                    </motion.div>
                                </Col>
                            </Row>

                            {/* Advanced Filters Modal - Same as existing */}
                            <Modal
                                show={showMoreFiltersModal}
                                onHide={() => setShowMoreFiltersModal(false)}
                                centered
                                size="lg"
                            >
                                <Modal.Header closeButton>
                                    <Modal.Title>Advanced Filters</Modal.Title>
                                </Modal.Header>
                                <Modal.Body>
                                    <Form>
                                        <Row className="mb-3">
                                            <Col md={6}>
                                                <Form.Group>
                                                    <Form.Label>Date From</Form.Label>
                                                    <Form.Control
                                                        type="date"
                                                        value={advancedFilters.dateFrom}
                                                        onChange={(e) => setAdvancedFilters({
                                                            ...advancedFilters,
                                                            dateFrom: e.target.value
                                                        })}
                                                        className="form-control-modern"
                                                    />
                                                </Form.Group>
                                            </Col>
                                            <Col md={6}>
                                                <Form.Group>
                                                    <Form.Label>Date To</Form.Label>
                                                    <Form.Control
                                                        type="date"
                                                        value={advancedFilters.dateTo}
                                                        onChange={(e) => setAdvancedFilters({
                                                            ...advancedFilters,
                                                            dateTo: e.target.value
                                                        })}
                                                        className="form-control-modern"
                                                    />
                                                </Form.Group>
                                            </Col>
                                        </Row>

                                        <Row className="mb-4">
                                            <Col md={6}>
                                                <Form.Group>
                                                    <Form.Label>Meeting Type</Form.Label>
                                                    <Form.Select
                                                        value={advancedFilters.meetingType}
                                                        onChange={(e) => setAdvancedFilters({
                                                            ...advancedFilters,
                                                            meetingType: e.target.value
                                                        })}
                                                        className="form-control-modern"
                                                    >
                                                        <option value="all">All Types</option>
                                                        {getMeetingTypes().map(type => (
                                                            <option key={type} value={type}>{type}</option>
                                                        ))}
                                                    </Form.Select>
                                                </Form.Group>
                                            </Col>
                                            <Col md={6}>
                                                <Form.Group>
                                                    <Form.Label>Duration</Form.Label>
                                                    <Form.Select
                                                        value={advancedFilters.duration}
                                                        onChange={(e) => setAdvancedFilters({
                                                            ...advancedFilters,
                                                            duration: e.target.value
                                                        })}
                                                        className="form-control-modern"
                                                    >
                                                        <option value="all">Any Duration</option>
                                                        <option value="0-15">Short (0-15 mins)</option>
                                                        <option value="15-30">Medium (15-30 mins)</option>
                                                        <option value="30-60">Standard (30-60 mins)</option>
                                                        <option value="60+">Long (60+ mins)</option>
                                                    </Form.Select>
                                                </Form.Group>
                                            </Col>
                                        </Row>

                                        <Row className="mb-4">
                                            <Col md={12}>
                                                <Form.Group>
                                                    <Form.Label>Attendee Email</Form.Label>
                                                    <Form.Control
                                                        type="email"
                                                        placeholder="Filter by attendee email"
                                                        value={advancedFilters.attendeeEmail}
                                                        onChange={(e) => setAdvancedFilters({
                                                            ...advancedFilters,
                                                            attendeeEmail: e.target.value
                                                        })}
                                                        className="form-control-modern"
                                                    />
                                                </Form.Group>
                                            </Col>
                                        </Row>
                                    </Form>

                                    {filtersApplied && (
                                        <div className="mb-3">
                                            <Badge bg="primary" className="px-2 py-1">
                                                {Object.values(advancedFilters).filter(v => v !== '' && v !== 'all').length} filters applied
                                            </Badge>
                                        </div>
                                    )}
                                </Modal.Body>
                                <Modal.Footer>
                                    <Button
                                        variant="outline-secondary"
                                        onClick={resetAdvancedFilters}
                                    >
                                        Reset Filters
                                    </Button>
                                    <Button
                                        variant="primary"
                                        onClick={applyAdvancedFilters}
                                        className="btn-modern"
                                    >
                                        Apply Filters
                                    </Button>
                                </Modal.Footer>
                            </Modal>

                            {/* Meetings Table - Same UI design but with API data */}
                            <Row>
                                <Col>
                                    <motion.div
                                        initial={{ y: 30, opacity: 0 }}
                                        animate={{ y: 0, opacity: 1 }}
                                        transition={{ delay: 0.5 }}
                                    >
                                        <Card className="card-modern">
                                            <Card.Body className="p-0">
                                                {initialLoading ? (
                                                    <div className="text-center py-5">
                                                        <Spinner animation="border" variant="primary" />
                                                        <p className="mt-2 text-muted">Loading meetings...</p>
                                                    </div>
                                                ) : displayedMeetings.length === 0 ? (
                                                    <div className="text-center py-5">
                                                        <FiCalendar size={48} className="text-muted mb-3" />
                                                        <h6 className="text-muted">No meetings found</h6>
                                                        <p className="text-muted">
                                                            {searchTerm
                                                                ? `No results found for "${searchTerm}". Try different search terms.`
                                                                : "Try adjusting your filters or search terms"
                                                            }
                                                        </p>
                                                    </div>
                                                ) : (
                                                    <div style={{
                                                        maxHeight: '600px',
                                                        overflowY: 'auto',
                                                        scrollBehavior: 'smooth',
                                                        overflowAnchor: 'none'
                                                    }}>
                                                        <Table responsive hover className="mb-0 table-fixed">
                                                            <thead className="bg-light" style={{
                                                                position: 'sticky',
                                                                top: 0,
                                                                zIndex: 10,
                                                                boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
                                                            }}>
                                                                <tr>
                                                                    <th className="border-0 p-3">Meeting</th>
                                                                    <th className="border-0 p-3">Available Date</th>
                                                                    <th className="border-0 p-3">Created</th>
                                                                    <th className="border-0 p-3">Bookings</th>
                                                                    <th className="border-0 p-3">Type</th>
                                                                    <th className="border-0 p-3">Status</th>
                                                                    <th className="border-0 p-3">Actions</th>
                                                                </tr>
                                                            </thead>
                                                            <tbody>
                                                                {displayedMeetings.map((meeting, index) => {
                                                                    const isLast = displayedMeetings.length === index + 1;
                                                                    return (
                                                                        <tr
                                                                            ref={isLast ? lastMeetingElementRef : null}
                                                                            key={meeting._id || meeting.id}
                                                                            className="meeting-row"
                                                                        >
                                                                            <td className="p-3">
                                                                                <div>
                                                                                    <h6 className="mb-1 fw-semibold">{meeting.title}</h6>
                                                                                    <small className="text-muted d-flex align-items-center">
                                                                                        <FiClock size={12} className="me-1" />
                                                                                        {meeting.duration} minutes
                                                                                    </small>
                                                                                    {meeting.description && (
                                                                                        <small className="text-muted d-block mt-1">
                                                                                            {meeting.description}
                                                                                        </small>
                                                                                    )}
                                                                                </div>
                                                                            </td>
                                                                            <td className="p-3">
                                                                                <div className="d-flex align-items-center">
                                                                                    <FiCalendar size={14} className="me-2 text-muted" />
                                                                                    <div>
                                                                                        <div className="fw-semibold">
                                                                                            {meeting.availableDate || meeting.dateFormatted || 'Not set'}
                                                                                        </div>
                                                                                        <small className="text-muted">
                                                                                            {meeting.availableDate ? 'Available for booking' : 'No date set'}
                                                                                        </small>
                                                                                    </div>
                                                                                </div>
                                                                            </td>
                                                                            <td className="p-3">
                                                                                <div className="d-flex align-items-center">
                                                                                    <FiClock size={14} className="me-2 text-muted" />
                                                                                    <div>
                                                                                        <div className="fw-semibold">
                                                                                            {new Date(meeting.createdAt).toLocaleDateString()}
                                                                                        </div>
                                                                                        <small className="text-muted">
                                                                                            {new Date(meeting.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                                                        </small>
                                                                                    </div>
                                                                                </div>
                                                                            </td>
                                                                            <td className="p-3">
                                                                                <div>
                                                                                    <div className="d-flex align-items-center mb-1">
                                                                                        <FiUsers size={14} className="me-1 text-muted" />
                                                                                        <span className="fw-semibold">
                                                                                            {meeting.totalBookings} bookings
                                                                                        </span>
                                                                                    </div>
                                                                                    <small className="text-muted">
                                                                                        Meeting Type Template
                                                                                    </small>
                                                                                </div>
                                                                            </td>
                                                                            <td className="p-3">
                                                                                <div className="d-flex align-items-center">
                                                                                    <div
                                                                                        className="me-2"
                                                                                        style={{
                                                                                            width: '12px',
                                                                                            height: '12px',
                                                                                            borderRadius: '50%',
                                                                                            backgroundColor: meeting.color
                                                                                        }}
                                                                                    ></div>
                                                                                    <Badge bg="light" text="dark" className="px-2 py-1">
                                                                                        {meeting.type}
                                                                                    </Badge>
                                                                                </div>
                                                                            </td>
                                                                            <td className="p-3">
                                                                                <Badge
                                                                                    bg={getStatusColor(meeting.status)}
                                                                                    className="text-capitalize px-2 py-1"
                                                                                >
                                                                                    {meeting.status}
                                                                                </Badge>
                                                                            </td>
                                                                            <td className="p-3">
                                                                                <div className="d-flex gap-1">
                                                                                    {meeting.bookingLink && (
                                                                                        <OverlayTrigger
                                                                                            placement="top"
                                                                                            delay={{ show: 400, hide: 100 }}
                                                                                            overlay={renderTooltip("Copy Booking Link")}
                                                                                        >
                                                                                            <Button
                                                                                                variant="outline-primary"
                                                                                                size="sm"
                                                                                                onClick={() => {
                                                                                                    navigator.clipboard.writeText(`https://${meeting.bookingLink}`);
                                                                                                    setSuccess('Booking link copied to clipboard!');
                                                                                                }}
                                                                                            >
                                                                                                <FiDownload size={12} />
                                                                                            </Button>
                                                                                        </OverlayTrigger>
                                                                                    )}
                                                                                    <OverlayTrigger
                                                                                        placement="top"
                                                                                        delay={{ show: 400, hide: 100 }}
                                                                                        overlay={renderTooltip("Edit Meeting")}
                                                                                    >
                                                                                        <Button
                                                                                            variant="outline-warning"
                                                                                            size="sm"
                                                                                            onClick={() => handleEditMeeting(meeting)}
                                                                                        >
                                                                                            <FiSettings size={12} />
                                                                                        </Button>
                                                                                    </OverlayTrigger>
                                                                                </div>
                                                                            </td>
                                                                        </tr>
                                                                    );
                                                                })}
                                                            </tbody>
                                                        </Table>

                                                        {/* Loading indicator for infinite scroll */}
                                                        {loading && !initialLoading && (
                                                            <div style={{ height: '50px', position: 'relative', overflow: 'hidden' }}>
                                                                <LoadingIndicator />
                                                            </div>
                                                        )}

                                                        {!loading && !hasMore && displayedMeetings.length > 0 && (
                                                            <div className="text-center py-3" style={{ height: '50px' }}>
                                                                <span className="text-muted">All meetings loaded</span>
                                                            </div>
                                                        )}
                                                    </div>
                                                )}
                                            </Card.Body>
                                        </Card>
                                    </motion.div>
                                </Col>
                            </Row>

                            {/* Recent Bookings Section */}
                            <Row className="mt-4">
                                <Col lg={12}>
                                    <motion.div
                                        initial={{ y: 30, opacity: 0 }}
                                        animate={{ y: 0, opacity: 1 }}
                                        transition={{ delay: 0.6 }}
                                    >
                                        <Card className="card-modern shadow-sm w-100">
                                            <Card.Header className="bg-white border-0 p-4">
                                                <div className="d-flex justify-content-between align-items-center">
                                                    <h5 className="mb-0 fw-bold">Recent Bookings</h5>
                                                </div>
                                            </Card.Header>
                                            <Card.Body
                                                className="p-0"
                                                style={{
                                                    maxHeight: '400px',
                                                    overflowY: 'auto',
                                                    width: '100%'
                                                }}
                                            >
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
                                                        <motion.div
                                                            key={booking._id || index}
                                                            className="booking-card-detailed p-3 border-bottom"
                                                            initial={{ opacity: 0, y: 10 }}
                                                            animate={{ opacity: 1, y: 0 }}
                                                            transition={{ delay: 0.05 * index }}
                                                        >
                                                            {/* Header with Title and Status */}
                                                            <div className="d-flex justify-content-between align-items-start mb-2">
                                                                <div className="flex-grow-1">
                                                                    <h6 className="fw-bold text-primary mb-1" style={{ fontSize: '14px' }}>
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

                                                            {/* Guest and Meeting Information */}
                                                            <div className="row g-2 mb-2">
                                                                <div className="col-lg-6">
                                                                    <div className="bg-light rounded p-2">
                                                                        <small className="text-muted d-block fw-semibold mb-1">Guest Info</small>
                                                                        <div className="d-flex align-items-center mb-1">
                                                                            <FiUsers className="me-1 text-primary" size={12} />
                                                                            <small className="fw-semibold">{booking.guestInfo?.name || 'Guest'}</small>
                                                                        </div>
                                                                        {booking.guestInfo?.email && (
                                                                            <div className="d-flex align-items-center mb-1">
                                                                                <FiMail className="me-1 text-muted" size={12} />
                                                                                <small className="text-muted text-truncate" style={{ fontSize: '11px' }}>
                                                                                    {booking.guestInfo.email}
                                                                                </small>
                                                                            </div>
                                                                        )}
                                                                        {booking.guestInfo?.phone && (
                                                                            <div className="d-flex align-items-center">
                                                                                <i className="fas fa-phone me-1 text-muted" style={{ fontSize: '10px' }}></i>
                                                                                <small className="text-muted" style={{ fontSize: '11px' }}>
                                                                                    {booking.guestInfo.phone}
                                                                                </small>
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                </div>

                                                                {/* Google Meet Information */}
                                                                <div className="col-lg-6">
                                                                    <div className="bg-light rounded p-2">
                                                                        <small className="text-muted d-block fw-semibold mb-1">Google Meet</small>
                                                                        {booking.googleMeetJoinUrl && (
                                                                            <div>
                                                                                <a
                                                                                    href={booking.googleMeetJoinUrl}
                                                                                    target="_blank"
                                                                                    rel="noopener noreferrer"
                                                                                    className="btn btn-sm btn-outline-primary d-flex align-items-center justify-content-center mb-1"
                                                                                    style={{ fontSize: '10px', padding: '3px 6px' }}
                                                                                >
                                                                                    <FiVideo className="me-1" size={10} />
                                                                                    Join Meeting
                                                                                </a>
                                                                                {booking.googleMeetId && (
                                                                                    <small className="text-muted d-block text-truncate" style={{ fontSize: '9px' }}>
                                                                                        ID: {booking.googleMeetId}
                                                                                    </small>
                                                                                )}
                                                                            </div>
                                                                        )}
                                                                        {booking.googleMeetHtmlLink && !booking.googleMeetJoinUrl && (
                                                                            <div>
                                                                                <a
                                                                                    href={booking.googleMeetHtmlLink}
                                                                                    target="_blank"
                                                                                    rel="noopener noreferrer"
                                                                                    className="btn btn-sm btn-outline-primary d-flex align-items-center justify-content-center"
                                                                                    style={{ fontSize: '10px', padding: '3px 6px' }}
                                                                                >
                                                                                    <FiVideo className="me-1" size={10} />
                                                                                    Join Meeting
                                                                                </a>
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            </div>

                                                            {/* Footer with Meeting Type and Timezone */}
                                                            <div className="d-flex justify-content-between align-items-center text-muted mt-2">
                                                                <small style={{ fontSize: '10px' }}>
                                                                    <span className="rounded-circle me-1" style={{
                                                                        width: 6, height: 6, backgroundColor: booking.meetingTypeColor || '#6366f1', display: 'inline-block'
                                                                    }} />
                                                                    {booking.meetingTypeName || 'Meeting Type'}
                                                                    {booking.meetingTypeName && (
                                                                        <Button
                                                                            variant="link"
                                                                            className="p-0 ms-1 text-decoration-none"
                                                                            style={{ fontSize: '10px' }}
                                                                            onClick={() => loadMeetingBookings(booking.meetingTypeId, booking.meetingTypeName)}
                                                                        >
                                                                            (View All)
                                                                        </Button>
                                                                    )}
                                                                </small>
                                                                {booking.timezone && (
                                                                    <small style={{ fontSize: '9px' }}>
                                                                        <i className="fas fa-globe me-1"></i>
                                                                        {booking.timezone}
                                                                    </small>
                                                                )}
                                                            </div>
                                                        </motion.div>
                                                    ))
                                                )}
                                            </Card.Body>
                                        </Card>
                                    </motion.div>
                                </Col>
                            </Row>

                            {/* Meeting Stats - Now from API */}
                            <Row className="mt-4">
                                {[
                                    { title: "Total Meeting Types", value: meetingsStats.total, color: "primary" },
                                    { title: "Active", value: meetingsStats.active, color: "success" },
                                    { title: "Inactive", value: meetingsStats.inactive, color: "secondary" },
                                    { title: "With Bookings", value: meetingsStats.completed, color: "info" }
                                ].map((stat, index) => (
                                    <Col md={3} key={index}>
                                        <motion.div
                                            initial={{ y: 30, opacity: 0 }}
                                            animate={{ y: 0, opacity: 1 }}
                                            transition={{ delay: 0.8 + index * 0.1 }}
                                        >
                                            <Card className="card-modern text-center">
                                                <Card.Body className="p-3">
                                                    <h3 className={`fw-bold text-${stat.color} mb-1`}>{stat.value}</h3>
                                                    <p className="text-muted mb-0 small">{stat.title}</p>
                                                </Card.Body>
                                            </Card>
                                        </motion.div>
                                    </Col>
                                ))}
                            </Row>
                        </>
                    )}

                    {/* Meeting Details Modal - New */}
                    <Modal
                        show={showDetailsModal}
                        onHide={() => setShowDetailsModal(false)}
                        centered
                        size="lg"
                    >
                        <Modal.Header closeButton>
                            <Modal.Title>Meetings Details</Modal.Title>
                        </Modal.Header>
                        <Modal.Body>
                            {selectedMeetingForDetails && (
                                <div className="meeting-details">
                                    {/* Header Section */}
                                    <div className="d-flex align-items-start mb-4">
                                        <div
                                            className="me-3 rounded-circle d-flex align-items-center justify-content-center"
                                            style={{
                                                width: '60px',
                                                height: '60px',
                                                backgroundColor: selectedMeetingForDetails.color,
                                                color: 'white',
                                                fontSize: '24px',
                                                fontWeight: 'bold'
                                            }}
                                        >
                                            {selectedMeetingForDetails.title.charAt(0).toUpperCase()}
                                        </div>
                                        <div className="flex-grow-1">
                                            <h4 className="mb-1">{selectedMeetingForDetails.title}</h4>
                                            <Badge
                                                bg={getStatusColor(selectedMeetingForDetails.status)}
                                                className="text-capitalize"
                                            >
                                                {selectedMeetingForDetails.status}
                                            </Badge>
                                        </div>
                                    </div>

                                    {/* Basic Information */}
                                    <Row className="mb-4">
                                        <Col md={6}>
                                            <Card className="h-100 border-0 bg-light">
                                                <Card.Body>
                                                    <h6 className="text-muted mb-3">
                                                        <FiClock className="me-2" />
                                                        Duration & Timing
                                                    </h6>
                                                    <div className="mb-2">
                                                        <strong>Duration:</strong> {selectedMeetingForDetails.duration} minutes
                                                    </div>
                                                    <div className="mb-2">
                                                        <strong>Created:</strong> {selectedMeetingForDetails.date}
                                                    </div>
                                                    <div>
                                                        <strong>Last Updated:</strong> {
                                                            new Date(selectedMeetingForDetails.updatedAt).toLocaleDateString()
                                                        }
                                                    </div>
                                                </Card.Body>
                                            </Card>
                                        </Col>
                                        <Col md={6}>
                                            <Card className="h-100 border-0 bg-light">
                                                <Card.Body>
                                                    <h6 className="text-muted mb-3">
                                                        <FiUsers className="me-2" />
                                                        Booking Statistics
                                                    </h6>
                                                    <div className="mb-2">
                                                        <strong>Total Bookings:</strong> {selectedMeetingForDetails.totalBookings}
                                                    </div>
                                                    <div className="mb-2">
                                                        <strong>Meeting Type:</strong> {selectedMeetingForDetails.type}
                                                    </div>
                                                    <div>
                                                        <strong>ID:</strong> {selectedMeetingForDetails._id}
                                                    </div>
                                                </Card.Body>
                                            </Card>
                                        </Col>
                                    </Row>

                                    {/* Description */}
                                    {selectedMeetingForDetails.description && (
                                        <div className="mb-4">
                                            <h6 className="text-muted mb-2">
                                                <FiFileText className="me-2" />
                                                Description
                                            </h6>
                                            <Card className="border-0 bg-light">
                                                <Card.Body>
                                                    <p className="mb-0">{selectedMeetingForDetails.description}</p>
                                                </Card.Body>
                                            </Card>
                                        </div>
                                    )}

                                    {/* Booking Link */}
                                    {selectedMeetingForDetails.bookingLink && (
                                        <div className="mb-4">
                                            <h6 className="text-muted mb-2">
                                                <FiDownload className="me-2" />
                                                Booking Link
                                            </h6>
                                            <Card className="border-0 bg-light">
                                                <Card.Body>
                                                    <div className="d-flex align-items-center justify-content-between">
                                                        <code className="text-primary">
                                                            https://{selectedMeetingForDetails.bookingLink}
                                                        </code>
                                                        <Button
                                                            variant="outline-primary"
                                                            size="sm"
                                                            onClick={() => {
                                                                navigator.clipboard.writeText(`https://${selectedMeetingForDetails.bookingLink}`);
                                                                setSuccess('Booking link copied to clipboard!');
                                                            }}
                                                        >
                                                            Copy
                                                        </Button>
                                                    </div>
                                                </Card.Body>
                                            </Card>
                                        </div>
                                    )}

                                    {/* Settings */}
                                    {selectedMeetingForDetails.settings && (
                                        <div className="mb-4">
                                            <h6 className="text-muted mb-2">
                                                <FiFilter className="me-2" />
                                                Meeting Settings
                                            </h6>
                                            <Card className="border-0 bg-light">
                                                <Card.Body>
                                                    <Row>
                                                        <Col md={6}>
                                                            <div className="mb-2">
                                                                <strong>Buffer Time Before:</strong> {selectedMeetingForDetails.settings.bufferTimeBefore || 0} mins
                                                            </div>
                                                            <div className="mb-2">
                                                                <strong>Buffer Time After:</strong> {selectedMeetingForDetails.settings.bufferTimeAfter || 0} mins
                                                            </div>
                                                            <div className="mb-2">
                                                                <strong>Max Advance Booking:</strong> {selectedMeetingForDetails.settings.maxAdvanceBooking || 'No limit'} days
                                                            </div>
                                                        </Col>
                                                        <Col md={6}>
                                                            <div className="mb-2">
                                                                <strong>Allow Rescheduling:</strong>
                                                                <Badge bg={selectedMeetingForDetails.settings.allowRescheduling ? 'success' : 'danger'} className="ms-2">
                                                                    {selectedMeetingForDetails.settings.allowRescheduling ? 'Yes' : 'No'}
                                                                </Badge>
                                                            </div>
                                                            <div className="mb-2">
                                                                <strong>Allow Cancellation:</strong>
                                                                <Badge bg={selectedMeetingForDetails.settings.allowCancellation ? 'success' : 'danger'} className="ms-2">
                                                                    {selectedMeetingForDetails.settings.allowCancellation ? 'Yes' : 'No'}
                                                                </Badge>
                                                            </div>
                                                            <div className="mb-2">
                                                                <strong>Require Approval:</strong>
                                                                <Badge bg={selectedMeetingForDetails.settings.requireApproval ? 'warning' : 'success'} className="ms-2">
                                                                    {selectedMeetingForDetails.settings.requireApproval ? 'Yes' : 'No'}
                                                                </Badge>
                                                            </div>
                                                        </Col>
                                                    </Row>
                                                </Card.Body>
                                            </Card>
                                        </div>
                                    )}

                                    {/* Color Theme */}
                                    <div className="mb-4">
                                        <h6 className="text-muted mb-2">
                                            Color Theme
                                        </h6>
                                        <div className="d-flex align-items-center">
                                            <div
                                                className="rounded me-3"
                                                style={{
                                                    width: '40px',
                                                    height: '40px',
                                                    backgroundColor: selectedMeetingForDetails.color,
                                                    border: '2px solid #dee2e6'
                                                }}
                                            ></div>
                                            <div>
                                                <div><strong>Color Code:</strong> {selectedMeetingForDetails.color}</div>
                                                <small className="text-muted">This color represents the meeting type in calendars and bookings</small>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="d-flex gap-2 justify-content-end mt-4">
                                        {/* <Button
                                            variant="outline-primary"
                                            onClick={() => {
                                                navigator.clipboard.writeText(`https://${selectedMeetingForDetails.bookingLink}`);
                                                setSuccess('Booking link copied to clipboard!');
                                            }}
                                        >
                                            <FiDownload className="me-2" />
                                            Copy Booking Link
                                        </Button> */}
                                        <Button
                                            variant="primary"
                                            onClick={() => {
                                                setShowDetailsModal(false);
                                                handleEditMeeting(selectedMeetingForDetails);
                                            }}
                                        >
                                            <FiSettings className="me-2" />
                                            Edit Meeting
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </Modal.Body>
                    </Modal>

                    {/* Reschedule Modal - Same as existing */}
                    <Modal show={showRescheduleModal} onHide={() => setShowRescheduleModal(false)} centered>
                        <Modal.Header closeButton>
                            <Modal.Title>Reschedule Meeting</Modal.Title>
                        </Modal.Header>
                        <Modal.Body>
                            {selectedMeetingForReschedule && (
                                <>
                                    <div className="mb-3">
                                        <h6 className="fw-bold">{selectedMeetingForReschedule.title}</h6>
                                        <small className="text-muted">
                                            Current: {selectedMeetingForReschedule.date} at {selectedMeetingForReschedule.time}
                                        </small>
                                    </div>

                                    <Form onSubmit={handleRescheduleSubmit}>
                                        <Row>
                                            <Col md={6}>
                                                <Form.Group className="mb-3">
                                                    <Form.Label>New Date *</Form.Label>
                                                    <Form.Control
                                                        type="date"
                                                        value={rescheduleForm.date}
                                                        onChange={(e) => setRescheduleForm({
                                                            ...rescheduleForm,
                                                            date: e.target.value
                                                        })}
                                                        className="form-control-modern"
                                                        required
                                                    />
                                                </Form.Group>
                                            </Col>
                                            <Col md={6}>
                                                <Form.Group className="mb-3">
                                                    <Form.Label>New Time *</Form.Label>
                                                    <Form.Control
                                                        type="time"
                                                        value={rescheduleForm.time}
                                                        onChange={(e) => setRescheduleForm({
                                                            ...rescheduleForm,
                                                            time: e.target.value
                                                        })}
                                                        className="form-control-modern"
                                                        required
                                                    />
                                                </Form.Group>
                                            </Col>
                                        </Row>

                                        <Form.Group className="mb-4">
                                            <Form.Label>Reason for Reschedule</Form.Label>
                                            <Form.Control
                                                as="textarea"
                                                rows={3}
                                                placeholder="Optional: Explain why the meeting is being rescheduled..."
                                                value={rescheduleForm.reason}
                                                onChange={(e) => setRescheduleForm({
                                                    ...rescheduleForm,
                                                    reason: e.target.value
                                                })}
                                                className="form-control-modern"
                                            />
                                        </Form.Group>

                                        <div className="d-flex justify-content-end gap-2">
                                            <Button
                                                variant="outline-secondary"
                                                onClick={() => setShowRescheduleModal(false)}
                                            >
                                                Cancel
                                            </Button>
                                            <Button type="submit" variant="primary" className="btn-modern">
                                                Reschedule Meeting
                                            </Button>
                                        </div>
                                    </Form>
                                </>
                            )}
                        </Modal.Body>
                    </Modal>

                    {/* Bookings Detail Modal - Add this new modal */}
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
                                        <Card key={booking._id || index} className="mb-3 border-start border-primary border-3">
                                            <Card.Body className="p-3">
                                                {/* Header with Title and Status */}
                                                <div className="d-flex justify-content-between align-items-start mb-3">
                                                    <div className="flex-grow-1">
                                                        <h6 className="fw-bold text-primary mb-1">
                                                            {booking.title || `${selectedMeetingName} with ${booking.guestInfo?.name || 'Guest'}`}
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

                                                {/* Guest and Meeting Information */}
                                                <Row className="g-3">
                                                    <Col md={6}>
                                                        <div className="bg-light rounded p-3">
                                                            <h6 className="text-muted mb-2 fw-semibold">Guest Information</h6>
                                                            <div className="d-flex align-items-center mb-2">
                                                                <FiUsers className="me-2 text-primary" size={16} />
                                                                <strong>{booking.guestInfo?.name || 'Guest'}</strong>
                                                            </div>
                                                            {booking.guestInfo?.email && (
                                                                <div className="d-flex align-items-center mb-2">
                                                                    <FiMail className="me-2 text-muted" size={16} />
                                                                    <span className="text-muted">{booking.guestInfo.email}</span>
                                                                </div>
                                                            )}
                                                            {booking.guestInfo?.phone && (
                                                                <div className="d-flex align-items-center mb-2">
                                                                    <i className="fas fa-phone me-2 text-muted"></i>
                                                                    <span className="text-muted">{booking.guestInfo.phone}</span>
                                                                </div>
                                                            )}
                                                            {booking.guestInfo?.message && (
                                                                <div className="mt-2">
                                                                    <small className="text-muted fw-semibold d-block">Message:</small>
                                                                    <small className="text-muted fst-italic">{booking.guestInfo.message}</small>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </Col>

                                                    <Col md={6}>
                                                        <div className="bg-light rounded p-3">
                                                            <h6 className="text-muted mb-2 fw-semibold">Google Meet Details</h6>
                                                            {booking.googleMeetJoinUrl && (
                                                                <div className="mb-2">
                                                                    <a
                                                                        href={booking.googleMeetJoinUrl}
                                                                        target="_blank"
                                                                        rel="noopener noreferrer"
                                                                        className="btn btn-outline-primary btn-sm d-flex align-items-center justify-content-center"
                                                                    >
                                                                        <FiVideo className="me-2" />
                                                                        Join Google Meet
                                                                    </a>
                                                                    {booking.googleMeetId && (
                                                                        <small className="text-muted d-block mt-2">
                                                                            <strong>Meeting ID:</strong> {booking.googleMeetId}
                                                                        </small>
                                                                    )}
                                                                </div>
                                                            )}
                                                            {booking.googleMeetHtmlLink && !booking.googleMeetJoinUrl && (
                                                                <div className="mb-2">
                                                                    <a
                                                                        href={booking.googleMeetHtmlLink}
                                                                        target="_blank"
                                                                        rel="noopener noreferrer"
                                                                        className="btn btn-outline-primary btn-sm d-flex align-items-center justify-content-center"
                                                                    >
                                                                        <FiVideo className="me-2" />
                                                                        Join Google Meet
                                                                    </a>
                                                                </div>
                                                            )}
                                                            {booking.timezone && (
                                                                <small className="text-muted d-block">
                                                                    <i className="fas fa-globe me-1"></i>
                                                                    <strong>Timezone:</strong> {booking.timezone}
                                                                </small>
                                                            )}
                                                        </div>
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

                    {/* Edit Meeting Modal */}
                    <Modal
                        show={showEditModal}
                        onHide={() => setShowEditModal(false)}
                        centered
                        size="lg"
                    >
                        <Modal.Header closeButton>
                            <Modal.Title>Edit Meetings</Modal.Title>
                        </Modal.Header>
                        <Modal.Body style={{ maxHeight: '70vh', overflowY: 'auto' }}>
                            {selectedMeetingForEdit && (
                                <Form onSubmit={handleEditSubmit}>
                                    <Row>
                                        <Col md={12}>
                                            <Form.Group className="mb-3">
                                                <Form.Label>Meeting Name *</Form.Label>
                                                <Form.Control
                                                    type="text"
                                                    placeholder="Enter meeting name"
                                                    value={editForm.name}
                                                    onChange={(e) => handleEditInputChange('name', e.target.value)}
                                                    className="form-control-modern"
                                                    required
                                                />
                                            </Form.Group>
                                        </Col>
                                    </Row>

                                    <Row>
                                        <Col md={12}>
                                            <Form.Group className="mb-3">
                                                <Form.Label>Description</Form.Label>
                                                <Form.Control
                                                    as="textarea"
                                                    rows={3}
                                                    placeholder="Enter meeting description"
                                                    value={editForm.description}
                                                    onChange={(e) => handleEditInputChange('description', e.target.value)}
                                                    className="form-control-modern"
                                                />
                                            </Form.Group>
                                        </Col>
                                    </Row>

                                    <Row>
                                        <Col md={6}>
                                            <Form.Group className="mb-3">
                                                <Form.Label>Duration *</Form.Label>
                                                <Form.Select
                                                    value={editForm.duration}
                                                    onChange={(e) => handleEditInputChange('duration', parseInt(e.target.value))}
                                                    className="form-control-modern"
                                                    required
                                                >
                                                    {durationOptions.map(option => (
                                                        <option key={option.value} value={option.value}>
                                                            {option.label}
                                                        </option>
                                                    ))}
                                                </Form.Select>
                                            </Form.Group>
                                        </Col>
                                        <Col md={6}>
                                            <Form.Group className="mb-3">
                                                <Form.Label>Color Theme</Form.Label>
                                                <div className="d-flex gap-2 flex-wrap">
                                                    {predefinedColors.map(color => (
                                                        <div
                                                            key={color}
                                                            className={`color-option ${editForm.color === color ? 'selected' : ''}`}
                                                            style={{
                                                                width: '32px',
                                                                height: '32px',
                                                                backgroundColor: color,
                                                                borderRadius: '6px',
                                                                cursor: 'pointer',
                                                                border: editForm.color === color ? '3px solid #007bff' : '2px solid #dee2e6'
                                                            }}
                                                            onClick={() => handleEditInputChange('color', color)}
                                                        />
                                                    ))}
                                                </div>
                                            </Form.Group>
                                        </Col>
                                    </Row>

                                    <Row>
                                        <Col md={12}>
                                            <Form.Group className="mb-3">
                                                <Form.Check
                                                    type="switch"
                                                    id="isActive"
                                                    label="Meeting Type Active"
                                                    checked={editForm.isActive}
                                                    onChange={(e) => handleEditInputChange('isActive', e.target.checked)}
                                                />
                                            </Form.Group>
                                        </Col>
                                    </Row>

                                    <Card className="mb-3">
                                        <Card.Header>
                                            <h6 className="mb-0">Advanced Settings</h6>
                                        </Card.Header>
                                        <Card.Body>
                                            <Row>
                                                <Col md={6}>
                                                    <Form.Group className="mb-3">
                                                        <Form.Label>Buffer Time Before (minutes)</Form.Label>
                                                        <Form.Control
                                                            type="number"
                                                            min="0"
                                                            max="60"
                                                            value={editForm.settings.bufferTimeBefore}
                                                            onChange={(e) => handleEditSettingsChange('bufferTimeBefore', parseInt(e.target.value))}
                                                            className="form-control-modern"
                                                        />
                                                    </Form.Group>
                                                </Col>
                                                <Col md={6}>
                                                    <Form.Group className="mb-3">
                                                        <Form.Label>Buffer Time After (minutes)</Form.Label>
                                                        <Form.Control
                                                            type="number"
                                                            min="0"
                                                            max="60"
                                                            value={editForm.settings.bufferTimeAfter}
                                                            onChange={(e) => handleEditSettingsChange('bufferTimeAfter', parseInt(e.target.value))}
                                                            className="form-control-modern"
                                                        />
                                                    </Form.Group>
                                                </Col>
                                            </Row>

                                            <Row>
                                                <Col md={6}>
                                                    <Form.Group className="mb-3">
                                                        <Form.Label>Max Advance Booking (days)</Form.Label>
                                                        <Form.Control
                                                            type="number"
                                                            min="1"
                                                            max="365"
                                                            value={editForm.settings.maxAdvanceBooking}
                                                            onChange={(e) => handleEditSettingsChange('maxAdvanceBooking', parseInt(e.target.value))}
                                                            className="form-control-modern"
                                                        />
                                                    </Form.Group>
                                                </Col>
                                                <Col md={6}>
                                                    <div className="pt-4">
                                                        <Form.Check
                                                            type="switch"
                                                            id="allowRescheduling"
                                                            label="Allow Rescheduling"
                                                            checked={editForm.settings.allowRescheduling}
                                                            onChange={(e) => handleEditSettingsChange('allowRescheduling', e.target.checked)}
                                                            className="mb-2"
                                                        />
                                                        <Form.Check
                                                            type="switch"
                                                            id="allowCancellation"
                                                            label="Allow Cancellation"
                                                            checked={editForm.settings.allowCancellation}
                                                            onChange={(e) => handleEditSettingsChange('allowCancellation', e.target.checked)}
                                                            className="mb-2"
                                                        />
                                                        <Form.Check
                                                            type="switch"
                                                            id="requireApproval"
                                                            label="Require Approval"
                                                            checked={editForm.settings.requireApproval}
                                                            onChange={(e) => handleEditSettingsChange('requireApproval', e.target.checked)}
                                                        />
                                                    </div>
                                                </Col>
                                            </Row>
                                        </Card.Body>
                                    </Card>

                                    <div className="d-flex justify-content-end gap-2 mt-4">
                                        <Button
                                            variant="outline-secondary"
                                            onClick={() => setShowEditModal(false)}
                                            disabled={editLoading}
                                        >
                                            Cancel
                                        </Button>
                                        <Button
                                            type="submit"
                                            variant="primary"
                                            className="btn-modern"
                                            disabled={editLoading}
                                        >
                                            {editLoading ? (
                                                <>
                                                    <Spinner size="sm" className="me-2" />
                                                    Updating...
                                                </>
                                            ) : (
                                                <>
                                                    <FiSettings className="me-2" />
                                                    Update Meeting
                                                </>
                                            )}
                                        </Button>
                                    </div>
                                </Form>
                            )}
                        </Modal.Body>
                    </Modal>

                    {/* Create Meeting Modal */}
                    <Modal
                        show={showNewMeetingModal}
                        onHide={() => {
                            setShowNewMeetingModal(false);
                            setNewMeetingType({
                                name: '',
                                duration: 30,
                                description: '',
                                color: '#006bff',
                                availableDate: '',
                                timezone: 'Asia/Kolkata'
                            });
                        }}
                        centered
                        size="lg"
                    >
                        <Modal.Header closeButton>
                            <Modal.Title>Create New Meeting Type</Modal.Title>
                        </Modal.Header>
                        <Modal.Body>
                            <Form onSubmit={handleCreateMeetingType}>
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

                                <Form.Group className="mb-3">
                                    <Form.Label>Time Zone *</Form.Label>
                                    {timeZones.length > 0 ? (
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
                                        <Form.Control
                                            type="text"
                                            value={newMeetingType.timezone}
                                            onChange={(e) => setNewMeetingType({
                                                ...newMeetingType,
                                                timezone: e.target.value
                                            })}
                                            className="form-control-modern"
                                            placeholder="Asia/Kolkata"
                                            required
                                        />
                                    )}
                                    <Form.Text className="text-muted">
                                        This timezone will be used for your meeting availability and booking times.
                                    </Form.Text>
                                </Form.Group>

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
                                    </Form.Text>
                                </Form.Group>

                                <div className="d-flex justify-content-end gap-2">
                                    <Button
                                        variant="outline-secondary"
                                        onClick={() => {
                                            setShowNewMeetingModal(false);
                                            setNewMeetingType({
                                                name: '',
                                                duration: 30,
                                                description: '',
                                                color: '#006bff',
                                                availableDate: '',
                                                timezone: 'Asia/Kolkata'
                                            });
                                        }}
                                    >
                                        Cancel
                                    </Button>
                                    <Button type="submit" variant="primary" className="btn-modern">
                                        <FiCalendar className="me-2" />
                                        Create Meeting Type
                                    </Button>
                                </div>
                            </Form>
                        </Modal.Body>
                    </Modal>
                </div>
            </Container>

            {/* Modern Meetings Styles */}
            <style jsx>{`
                .meetings-bg {
                    min-height: 100vh;
                    background: linear-gradient(135deg, #f8fafc 0%, #e0e7ff 100%);
                }
                .meetings-content-wrapper {
                    max-width: 1200px;
                    width: 100%;
                    margin: 0 auto;
                }
                .meetings-main-row {
                    min-height: 540px;
                }
                .glass-card {
                    background: rgba(255,255,255,0.85);
                    border-radius: 18px;
                    box-shadow: 0 8px 32px rgba(99,102,241,0.08), 0 1.5px 4px rgba(0,0,0,0.04);
                    backdrop-filter: blur(8px);
                }
                .meetings-card-equal {
                    min-height: 420px;
                    height: 420px;
                    display: flex;
                    flex-direction: column;
                    justify-content: flex-start;
                }
                .text-gradient {
                    background: linear-gradient(90deg,#6366f1,#a5b4fc);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                }
                .meetings-list-table {
                    min-height: 320px;
                    max-height: 320px;
                    overflow-y: auto;
                }
                @media (max-width: 991.98px) {
                    .meetings-content-wrapper {
                        max-width: 100%;
                        padding: 0 10px;
                    }
                    .meetings-card-equal {
                        min-height: 320px;
                        height: auto;
                    }
                }
            `}</style>

            {/* Footer */}
            <footer className="mt-5 py-4 bg-light border-top">
                <Container>
                    <Row className="align-items-center">
                        <Col md={6}>
                            <div className="d-flex align-items-center">
                                <FiCalendar className="me-2 text-primary" size={20} />
                                <span className="fw-bold text-primary">ScheduleMe</span>
                                <span className="text-muted ms-2">© 2025</span>
                            </div>
                        </Col>
                        <Col md={6} className="text-md-end mt-3 mt-md-0">
                            <div className="d-flex justify-content-md-end justify-content-start gap-4">
                                <span className="text-muted text-decoration-none small" style={{ cursor: 'pointer' }}>
                                    Privacy Policy
                                </span>
                                <span className="text-muted text-decoration-none small" style={{ cursor: 'pointer' }}>
                                    Terms of Service
                                </span>
                                <span className="text-muted text-decoration-none small" style={{ cursor: 'pointer' }}>
                                    Support
                                </span>
                            </div>
                        </Col>
                    </Row>
                    <Row className="mt-3">
                        <Col>
                            <hr className="my-2" />
                            <p className="text-center text-muted small mb-0">
                                Making scheduling simple and efficient for everyone.
                            </p>
                        </Col>
                    </Row>
                </Container>
            </footer>
        </motion.div>
    );
};

export default MeetingsPage;