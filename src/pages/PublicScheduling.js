import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Form, Alert, Spinner, Badge, Modal } from 'react-bootstrap';
import { motion } from 'framer-motion';
import { FiCalendar, FiClock, FiUser, FiMail, FiPhone, FiMessageSquare, FiGlobe, FiCheck, FiChevronLeft, FiChevronRight, FiMapPin, FiRefreshCw } from 'react-icons/fi';
import { useParams, useNavigate } from 'react-router-dom';
import meetingService from '../services/meetingService';
import timezoneService from '../services/timezoneService';

const PublicScheduling = () => {
    const { meetingId } = useParams();
    const navigate = useNavigate();

    // Debug logging to check if meetingId is received correctly
    console.log('PublicScheduling - meetingId from params:', meetingId);
    console.log('PublicScheduling - All params:', useParams());

    // Use meetingId as meetingTypeId for consistency with existing code
    const meetingTypeId = meetingId;

    // Validate meetingTypeId early
    useEffect(() => {
        if (!meetingId || meetingId === 'undefined') {
            console.error('Invalid meetingId:', meetingId);
            setError('Invalid meeting type ID. Please check your booking link.');
            setLoading(false);
            return;
        }
    }, [meetingId]);

    // Meeting Type State
    const [meetingType, setMeetingType] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    // Calendar State
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState(null);
    const [availableSlots, setAvailableSlots] = useState([]);
    const [selectedTimeSlot, setSelectedTimeSlot] = useState(null);
    const [loadingSlots, setLoadingSlots] = useState(false);

    // Dynamic Time Zone State - Initialize as empty array to prevent map error
    const [selectedTimeZone, setSelectedTimeZone] = useState('');
    const [timeZones, setTimeZones] = useState([]); // Initialize as empty array
    const [timeZonesLoading, setTimeZonesLoading] = useState(true);

    // Form State
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        message: ''
    });

    // Step State
    const [currentStep, setCurrentStep] = useState(1);
    const [showConfirmModal, setShowConfirmModal] = useState(false);

    // Load timezones on component mount
    useEffect(() => {
        loadTimezones();
    }, []);

    // Load timezones from API only
    const loadTimezones = async () => {
        try {
            setTimeZonesLoading(true);
            console.log('Loading timezones from API...');

            const response = await timezoneService.getTimezones();

            if (response.success && response.data && Array.isArray(response.data)) {
                setTimeZones(response.data);
                console.log('Timezones loaded:', response.data.length, 'timezones');

                // Set user's timezone as default if not already set
                if (!selectedTimeZone) {
                    const userTimezone = timezoneService.getUserTimezone();
                    console.log('Setting default timezone to user timezone:', userTimezone);

                    // Check if user's timezone exists in the API data
                    const userTimezoneData = response.data.find(tz => tz.value === userTimezone);
                    if (userTimezoneData) {
                        setSelectedTimeZone(userTimezone);
                        console.log('User timezone found in API data:', userTimezoneData.label);
                    } else {
                        // Try to find India timezone variations
                        const indiaTimezone = response.data.find(tz =>
                            tz.value.includes('Asia/Kolkata') ||
                            tz.value.includes('Asia/Calcutta') ||
                            tz.value.includes('India') ||
                            tz.label.toLowerCase().includes('india') ||
                            tz.label.toLowerCase().includes('kolkata')
                        );

                        if (indiaTimezone) {
                            setSelectedTimeZone(indiaTimezone.value);
                            console.log('Using India timezone:', indiaTimezone.label);
                        } else {
                            // If India timezone not found, try UTC
                            const fallbackTimezone = response.data.find(tz =>
                                tz.value.includes('UTC') ||
                                tz.value === 'UTC' ||
                                tz.value === 'Etc/UTC'
                            );
                            if (fallbackTimezone) {
                                setSelectedTimeZone(fallbackTimezone.value);
                                console.log('Using fallback timezone:', fallbackTimezone.label);
                            } else if (response.data.length > 0) {
                                // Last resort: use first timezone in list
                                setSelectedTimeZone(response.data[0].value);
                                console.log('Using first available timezone:', response.data[0].label);
                            }
                        }
                    }
                }
            } else {
                console.error('Invalid timezone response from API');
                setError('Failed to load timezones. Please refresh the page.');
            }
        } catch (error) {
            console.error('Error loading timezones:', error);
            setError('Unable to load timezones. Please check your connection and try again.');
        } finally {
            setTimeZonesLoading(false);
        }
    };

    // Updated service methods to use new timezone API
    const publicSchedulingService = {
        getMeetingType: async (meetingTypeId) => {
            console.log('getMeetingType called with ID:', meetingTypeId);

            if (!meetingTypeId || meetingTypeId === 'undefined') {
                throw new Error('Invalid meeting type ID provided');
            }

            try {
                // Try using meetingService first
                if (meetingService.getMeetingType) {
                    console.log('Using meetingService.getMeetingType');
                    const response = await meetingService.getMeetingType(meetingTypeId);
                    console.log('meetingService response:', response);
                    return response;
                }

                // Fallback to direct API call with new API base URL
                console.log('Using direct API call');
                const apiUrl = `http://localhost:5000/api/v1/meetings/public/${meetingTypeId}`;
                console.log('API URL:', apiUrl);

                const response = await fetch(apiUrl);
                const data = await response.json();

                console.log('Direct API response:', data);

                if (!response.ok) {
                    throw new Error(data.message || `HTTP error! status: ${response.status}`);
                }

                return { success: true, data: data };
            } catch (error) {
                console.error('Error in getMeetingType:', error);
                throw new Error(`Failed to load meeting type: ${error.message}`);
            }
        },

        getAvailableSlots: async (meetingTypeId, date, timeZone) => {
            console.log('getAvailableSlots called with:', { meetingTypeId, date, timeZone });

            if (!meetingTypeId || meetingTypeId === 'undefined') {
                throw new Error('Invalid meeting type ID for slots');
            }

            try {
                // Use new timezone-aware API
                const response = await timezoneService.getAvailableTimes(meetingTypeId, date, timeZone);

                if (response.success) {
                    // Handle the API response - check for 'times' field first, then 'slots'
                    let slots = [];

                    if (Array.isArray(response.data)) {
                        slots = response.data;
                    } else if (response.data && Array.isArray(response.data.times)) {
                        slots = response.data.times;
                    } else if (response.data && Array.isArray(response.data.slots)) {
                        slots = response.data.slots;
                    }

                    console.log('Available slots loaded:', slots.length, 'slots for timezone:', timeZone);

                    return {
                        success: true,
                        data: slots, // Always return an array
                        originalTimezone: response.originalTimezone,
                        requestedTimezone: response.requestedTimezone
                    };
                } else {
                    throw new Error('Failed to load available slots');
                }
            } catch (error) {
                console.error('Error in getAvailableSlots:', error);
                // Return empty slots on error
                return { success: true, data: [] };
            }
        },

        createBooking: async (bookingData) => {
            console.log('createBooking called with:', bookingData);

            if (!bookingData.meetingTypeId || bookingData.meetingTypeId === 'undefined') {
                throw new Error('Invalid meeting type ID for booking');
            }

            try {
                // Use new API with timezone support
                const apiUrl = `http://localhost:5000/api/v1/meetings/public/${bookingData.meetingTypeId}/bookings`;

                const payload = {
                    date: bookingData.date,
                    time: bookingData.time,
                    timezone: bookingData.timeZone, // User's selected timezone
                    guestInfo: bookingData.guestInfo
                };

                console.log('Creating booking with payload:', payload);

                const response = await fetch(apiUrl, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });

                const data = await response.json();

                if (!response.ok) {
                    throw new Error(data.message || `HTTP error! status: ${response.status}`);
                }

                return { success: true, data };
            } catch (error) {
                console.error('Error in createBooking:', error);
                throw new Error(`Failed to create booking: ${error.message}`);
            }
        }
    };

    useEffect(() => {
        console.log('useEffect triggered with meetingId:', meetingId);
        if (meetingId && meetingId !== 'undefined') {
            loadMeetingType();
        } else {
            console.error('No valid meetingId provided');
            setError('No meeting type ID provided in the URL');
            setLoading(false);
        }
    }, [meetingId]);

    useEffect(() => {
        if (selectedDate && meetingType && meetingId && meetingId !== 'undefined') {
            loadAvailableSlots();
        }
    }, [selectedDate, selectedTimeZone, meetingType, meetingId]);

    const loadMeetingType = async () => {
        try {
            console.log('loadMeetingType starting with ID:', meetingTypeId);
            setLoading(true);
            setError('');

            const response = await publicSchedulingService.getMeetingType(meetingTypeId);
            console.log('loadMeetingType response:', response);

            if (response.success && response.data) {
                setMeetingType(response.data);
                console.log('Meeting type loaded successfully:', response.data);
            } else {
                console.error('Invalid response structure:', response);
                setError('Meeting type not found or not available for booking');
            }
        } catch (error) {
            console.error('Failed to load meeting type:', error);
            setError(`Failed to load meeting type: ${error.message}`);
        } finally {
            setLoading(false);
        }
    };

    const loadAvailableSlots = async () => {
        try {
            setLoadingSlots(true);
            const dateStr = selectedDate.toISOString().split('T')[0];

            console.log('Loading slots for:', { meetingTypeId, dateStr, selectedTimeZone });

            const response = await publicSchedulingService.getAvailableSlots(
                meetingTypeId,
                dateStr,
                selectedTimeZone
            );

            if (response.success) {
                // Ensure we always set an array
                const slots = response.data || [];
                // Additional safety check to ensure it's an array
                const validSlots = Array.isArray(slots) ? slots : [];
                setAvailableSlots(validSlots);

                console.log('Final available slots set:', validSlots);

                // Log timezone conversion info if available
                if (response.originalTimezone && response.requestedTimezone) {
                    console.log(`Times converted from ${response.originalTimezone} to ${response.requestedTimezone}`);
                }
            } else {
                console.warn('API response not successful:', response);
                setAvailableSlots([]); // Always set empty array on failure
            }
        } catch (error) {
            console.error('Failed to load available slots:', error);
            setAvailableSlots([]); // Always set empty array on error
        } finally {
            setLoadingSlots(false);
        }
    };

    const handleBooking = async () => {
        try {
            setLoading(true);

            if (!meetingTypeId || meetingTypeId === 'undefined') {
                throw new Error('Invalid meeting type ID for booking');
            }

            const bookingData = {
                meetingTypeId,
                date: selectedDate.toISOString().split('T')[0],
                time: selectedTimeSlot,
                timeZone: selectedTimeZone, // Include user's timezone
                guestInfo: formData
            };

            console.log('Creating booking with data:', bookingData);

            const response = await publicSchedulingService.createBooking(bookingData);

            if (response.success) {
                setSuccess('Meeting booked successfully!');
                setShowConfirmModal(true);
            } else {
                setError(response.message || 'Failed to book meeting');
            }
        } catch (error) {
            console.error('Failed to book meeting:', error);
            setError(`Failed to book meeting: ${error.message}`);
        } finally {
            setLoading(false);
        }
    };

    const getDaysInMonth = (date) => {
        const year = date.getFullYear();
        const month = date.getMonth();
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const daysInMonth = lastDay.getDate();
        const startingDayOfWeek = firstDay.getDay();

        const days = [];

        for (let i = 0; i < startingDayOfWeek; i++) {
            days.push(null);
        }

        for (let day = 1; day <= daysInMonth; day++) {
            days.push(new Date(year, month, day));
        }

        return days;
    };

    const isDateAvailable = (date) => {
        if (!date || !meetingType) return false;

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        if (date < today) return false;

        const maxDate = new Date();
        maxDate.setDate(maxDate.getDate() + 60);
        if (date > maxDate) return false;

        const dayOfWeek = date.getDay();
        if (meetingType.availableDays && !meetingType.availableDays.includes(dayOfWeek)) {
            return false;
        }

        return true;
    };

    // Enhanced time formatting with timezone support
    const formatTimeInTimeZone = (time, timeZone) => {
        if (!time || !timeZone) {
            return 'Invalid time';
        }

        try {
            // If it's already formatted (e.g., "2:00 PM"), return as is
            if (time.includes('AM') || time.includes('PM')) {
                return time;
            }

            // Use timezone service for conversion
            return timezoneService.convertTime(time, 'UTC', timeZone);
        } catch (error) {
            console.error('Error formatting time:', error);
            return time || 'Invalid time';
        }
    };

    const nextStep = () => {
        if (currentStep === 1 && selectedDate && selectedTimeSlot) {
            setCurrentStep(2);
        } else if (currentStep === 2 && formData.name && formData.email) {
            setCurrentStep(3);
        }
    };

    const prevStep = () => {
        if (currentStep > 1) {
            setCurrentStep(currentStep - 1);
        }
    };

    // Helper function to get timezone display label with safety check
    const getTimezoneLabel = (timezoneValue) => {
        if (!Array.isArray(timeZones) || timeZones.length === 0) {
            return timezoneValue || 'Unknown timezone';
        }

        const timezone = timeZones.find(tz => tz.value === timezoneValue);
        if (timezone) {
            return timezone.label || timezoneService.formatTimezoneLabel(timezone);
        }
        return timezoneValue || 'Unknown timezone';
    };

    // Early return for missing meetingId
    if (!meetingId || meetingId === 'undefined') {
        return (
            <Container className="py-5">
                <Row className="justify-content-center">
                    <Col md={6}>
                        <Alert variant="danger" className="text-center">
                            <h5>Invalid Booking Link</h5>
                            <p>The meeting type ID is missing or invalid in this booking link.</p>
                            <Button variant="outline-danger" onClick={() => navigate('/')}>
                                Go Back Home
                            </Button>
                        </Alert>
                    </Col>
                </Row>
            </Container>
        );
    }

    if (loading && !meetingType) {
        return (
            <Container className="py-5">
                <Row className="justify-content-center">
                    <Col md={6} className="text-center">
                        <Spinner animation="border" variant="primary" />
                        <p className="mt-3 text-muted">Loading meeting details...</p>
                        <small className="text-muted">Meeting ID: {meetingId}</small>
                    </Col>
                </Row>
            </Container>
        );
    }

    if (error && !meetingType) {
        return (
            <Container className="py-5">
                <Row className="justify-content-center">
                    <Col md={6}>
                        <Alert variant="danger" className="text-center">
                            <h5>Oops! Something went wrong</h5>
                            <p>{error}</p>
                            <small className="text-muted d-block mb-3">Meeting ID: {meetingId}</small>
                            <Button variant="outline-danger" onClick={() => navigate('/')}>
                                Go Back Home
                            </Button>
                        </Alert>
                    </Col>
                </Row>
            </Container>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="public-scheduling-page"
            style={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                minHeight: '100vh'
            }}
        >
            <Container className="py-5">
                {/* Meeting ID Debug Info (remove in production) */}
                {process.env.NODE_ENV === 'development' && (
                    <div className="text-center mb-3">
                        <small className="text-white-50">Debug: Meeting ID = {meetingId}</small>
                    </div>
                )}

                <Row className="justify-content-center">
                    {/* Main Content Card */}
                    <Col xl={10} lg={11}>
                        <Card className="shadow-lg border-0 overflow-hidden" style={{ borderRadius: '20px' }}>
                            <Row className="g-0">
                                {/* Meeting Info Sidebar */}
                                <Col lg={4} className="position-relative">
                                    <div
                                        className="h-100 p-4 text-white d-flex flex-column"
                                        style={{
                                            background: 'linear-gradient(145deg, #4c63d2 0%, #5a67d8 50%, #667eea 100%)',
                                            minHeight: '600px'
                                        }}
                                    >
                                        {/* Meeting Type Header */}
                                        <div className="mb-4">
                                            <div className="d-flex align-items-center mb-3">
                                                <div
                                                    className="rounded-circle me-3 shadow-sm"
                                                    style={{
                                                        width: '16px',
                                                        height: '16px',
                                                        backgroundColor: meetingType?.color || '#ffffff'
                                                    }}
                                                />
                                                <div>
                                                    <h4 className="mb-1 fw-bold">{meetingType?.name || 'Meeting'}</h4>
                                                    <div className="d-flex align-items-center text-white-50">
                                                        <FiClock className="me-2" size={14} />
                                                        <span style={{ fontSize: '14px' }}>
                                                            {meetingType?.duration || 30} minutes
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>

                                            {meetingType?.description && (
                                                <p className="text-white-50 mb-0" style={{ fontSize: '14px', lineHeight: '1.5' }}>
                                                    {meetingType.description}
                                                </p>
                                            )}
                                        </div>

                                        {/* Enhanced Time Zone Selection - API only */}
                                        <div className="mb-4">
                                            <label className="form-label text-white fw-semibold mb-2" style={{ fontSize: '14px' }}>
                                                <FiGlobe className="me-2" />
                                                Time Zone
                                            </label>
                                            {timeZonesLoading ? (
                                                <div className="d-flex align-items-center">
                                                    <Spinner size="sm" className="me-2" />
                                                    <small className="text-white-50">Loading timezones from server...</small>
                                                </div>
                                            ) : Array.isArray(timeZones) && timeZones.length > 0 ? (
                                                <Form.Select
                                                    size="sm"
                                                    value={selectedTimeZone}
                                                    onChange={(e) => {
                                                        setSelectedTimeZone(e.target.value);
                                                        console.log('Timezone changed to:', e.target.value);
                                                    }}
                                                    className="border-0 shadow-sm"
                                                    style={{
                                                        backgroundColor: 'rgba(255,255,255,0.1)',
                                                        color: 'white',
                                                        backdropFilter: 'blur(10px)'
                                                    }}
                                                >
                                                    {timeZones.map(tz => (
                                                        <option key={tz.value} value={tz.value} style={{ color: '#333' }}>
                                                            {tz.label}
                                                        </option>
                                                    ))}
                                                </Form.Select>
                                            ) : (
                                                <div className="text-white-50 small">
                                                    <p>Unable to load timezones from server.</p>
                                                    <Button
                                                        variant="outline-light"
                                                        size="sm"
                                                        onClick={loadTimezones}
                                                        className="mt-1"
                                                    >
                                                        <FiRefreshCw className="me-1" />
                                                        Retry
                                                    </Button>
                                                </div>
                                            )}
                                            {selectedTimeZone && Array.isArray(timeZones) && timeZones.length > 0 && (
                                                <small className="text-white-50 d-block mt-1">
                                                    Selected: {getTimezoneLabel(selectedTimeZone)}
                                                </small>
                                            )}
                                            {timeZones.length > 0 && (
                                                <small className="text-white-50 d-block mt-1" style={{ fontSize: '11px' }}>
                                                    {timeZones.length} timezones available
                                                </small>
                                            )}
                                        </div>

                                        {/* Meeting Summary */}
                                        {selectedDate && selectedTimeSlot && (
                                            <motion.div
                                                initial={{ y: 20, opacity: 0 }}
                                                animate={{ y: 0, opacity: 1 }}
                                                className="p-3 rounded-3 shadow-sm mb-4"
                                                style={{
                                                    backgroundColor: 'rgba(255,255,255,0.15)',
                                                    backdropFilter: 'blur(10px)',
                                                    border: '1px solid rgba(255,255,255,0.2)'
                                                }}
                                            >
                                                <h6 className="fw-bold mb-3 d-flex align-items-center">
                                                    <FiCheck className="me-2 text-success" />
                                                    Meeting Summary
                                                </h6>
                                                <div style={{ fontSize: '13px', lineHeight: '1.6' }}>
                                                    <div className="mb-2 d-flex align-items-start">
                                                        <FiCalendar className="me-2 mt-1 flex-shrink-0" size={12} />
                                                        <span>
                                                            {selectedDate.toLocaleDateString('en-US', {
                                                                weekday: 'long',
                                                                year: 'numeric',
                                                                month: 'long',
                                                                day: 'numeric'
                                                            })}
                                                        </span>
                                                    </div>
                                                    <div className="mb-2 d-flex align-items-center">
                                                        <FiClock className="me-2 flex-shrink-0" size={12} />
                                                        <span>{formatTimeInTimeZone(selectedTimeSlot, selectedTimeZone)}</span>
                                                    </div>
                                                    <div className="d-flex align-items-center">
                                                        <FiMapPin className="me-2 flex-shrink-0" size={12} />
                                                        <span style={{ fontSize: '12px' }}>
                                                            {getTimezoneLabel(selectedTimeZone)}
                                                        </span>
                                                    </div>
                                                </div>
                                            </motion.div>
                                        )}

                                        {/* Progress Steps */}
                                        <div className="mt-auto">
                                            <div className="d-flex justify-content-between align-items-center">
                                                {[1, 2, 3].map(step => (
                                                    <div key={step} className="d-flex flex-column align-items-center">
                                                        <div
                                                            className={`rounded-circle d-flex align-items-center justify-content-center shadow-sm ${step <= currentStep
                                                                ? 'bg-white text-primary'
                                                                : 'text-white'
                                                                }`}
                                                            style={{
                                                                width: '32px',
                                                                height: '32px',
                                                                backgroundColor: step <= currentStep ? 'white' : 'rgba(255,255,255,0.2)'
                                                            }}
                                                        >
                                                            {step < currentStep ? <FiCheck size={14} /> : step}
                                                        </div>
                                                        <small className={`mt-2 ${step <= currentStep ? 'text-white' : 'text-white-50'}`} style={{ fontSize: '11px' }}>
                                                            {step === 1 ? 'Date & Time' : step === 2 ? 'Your Details' : 'Confirm'}
                                                        </small>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </Col>

                                {/* Main Content Area */}
                                <Col lg={8}>
                                    <div className="p-4 p-lg-5">
                                        {/* Step 1: Date & Time Selection */}
                                        {currentStep === 1 && (
                                            <>
                                                <div className="mb-4">
                                                    <h3 className="fw-bold text-dark mb-2">Select a Date & Time</h3>
                                                    <p className="text-muted mb-0">
                                                        Choose your preferred date and time slot
                                                        {selectedTimeZone && (
                                                            <span className="d-block small">
                                                                Times shown in: <strong>{getTimezoneLabel(selectedTimeZone)}</strong>
                                                            </span>
                                                        )}
                                                    </p>
                                                </div>

                                                <Row>
                                                    {/* Enhanced Calendar */}
                                                    <Col md={7} className="mb-4">
                                                        <Card className="border-0 shadow-sm" style={{ borderRadius: '15px' }}>
                                                            <Card.Body className="p-4">
                                                                {/* Calendar Header */}
                                                                <div className="d-flex justify-content-between align-items-center mb-3">
                                                                    <Button
                                                                        variant="outline-primary"
                                                                        size="sm"
                                                                        className="rounded-circle p-2"
                                                                        onClick={() => {
                                                                            const newDate = new Date(currentDate);
                                                                            newDate.setMonth(newDate.getMonth() - 1);
                                                                            setCurrentDate(newDate);
                                                                        }}
                                                                    >
                                                                        <FiChevronLeft />
                                                                    </Button>
                                                                    <h5 className="fw-bold mb-0 text-primary">
                                                                        {currentDate.toLocaleDateString('en-US', {
                                                                            month: 'long',
                                                                            year: 'numeric'
                                                                        })}
                                                                    </h5>
                                                                    <Button
                                                                        variant="outline-primary"
                                                                        size="sm"
                                                                        className="rounded-circle p-2"
                                                                        onClick={() => {
                                                                            const newDate = new Date(currentDate);
                                                                            newDate.setMonth(newDate.getMonth() + 1);
                                                                            setCurrentDate(newDate);
                                                                        }}
                                                                    >
                                                                        <FiChevronRight />
                                                                    </Button>
                                                                </div>

                                                                {/* Enhanced Calendar Grid */}
                                                                <div className="modern-calendar">
                                                                    {/* Day Headers */}
                                                                    <div className="calendar-header-modern">
                                                                        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                                                                            <div key={day} className="calendar-day-header-modern">
                                                                                {day}
                                                                            </div>
                                                                        ))}
                                                                    </div>

                                                                    {/* Calendar Days */}
                                                                    <div className="calendar-body-modern">
                                                                        {getDaysInMonth(currentDate).map((date, index) => (
                                                                            <div key={index} className="calendar-cell-modern">
                                                                                {date && (
                                                                                    <button
                                                                                        type="button"
                                                                                        className={`calendar-day-modern ${selectedDate?.toDateString() === date.toDateString()
                                                                                            ? 'selected'
                                                                                            : isDateAvailable(date)
                                                                                                ? 'available'
                                                                                                : 'unavailable'
                                                                                            }`}
                                                                                        disabled={!isDateAvailable(date)}
                                                                                        onClick={() => {
                                                                                            if (isDateAvailable(date)) {
                                                                                                setSelectedDate(date);
                                                                                                setSelectedTimeSlot(null);
                                                                                            }
                                                                                        }}
                                                                                    >
                                                                                        {date.getDate()}
                                                                                    </button>
                                                                                )}
                                                                            </div>
                                                                        ))}
                                                                    </div>
                                                                </div>
                                                            </Card.Body>
                                                        </Card>
                                                    </Col>

                                                    {/* Enhanced Time Slots with timezone info */}
                                                    <Col md={5}>
                                                        <Card className="border-0 shadow-sm h-100" style={{ borderRadius: '15px' }}>
                                                            <Card.Body className="p-4">
                                                                <h6 className="fw-semibold mb-3 text-dark">
                                                                    {selectedDate ?
                                                                        `Available times for ${selectedDate.toLocaleDateString('en-US', {
                                                                            month: 'short',
                                                                            day: 'numeric'
                                                                        })}` :
                                                                        'Select a date first'
                                                                    }
                                                                </h6>

                                                                {loadingSlots ? (
                                                                    <div className="text-center py-4">
                                                                        <Spinner animation="border" size="sm" variant="primary" />
                                                                        <p className="small text-muted mt-2">
                                                                            Loading available times for {getTimezoneLabel(selectedTimeZone)}...
                                                                        </p>
                                                                    </div>
                                                                ) : selectedDate ? (
                                                                    <div className="time-slots-modern">
                                                                        {availableSlots.length === 0 ? (
                                                                            <div className="text-center py-4">
                                                                                <p className="text-muted small">
                                                                                    No available times for this date.
                                                                                    <br />Please select another date.
                                                                                </p>
                                                                            </div>
                                                                        ) : (
                                                                            <div className="d-grid gap-2">
                                                                                {availableSlots.map(slot => (
                                                                                    <Button
                                                                                        key={slot}
                                                                                        variant={selectedTimeSlot === slot ? 'primary' : 'outline-primary'}
                                                                                        size="sm"
                                                                                        onClick={() => setSelectedTimeSlot(slot)}
                                                                                        className="text-start time-slot-btn"
                                                                                        style={{
                                                                                            borderRadius: '10px',
                                                                                            padding: '12px 16px',
                                                                                            fontWeight: '500'
                                                                                        }}
                                                                                    >
                                                                                        {formatTimeInTimeZone(slot, selectedTimeZone)}
                                                                                    </Button>
                                                                                ))}
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                ) : (
                                                                    <div className="text-center py-4">
                                                                        <FiCalendar size={32} className="text-muted mb-2" />
                                                                        <p className="text-muted small">
                                                                            Choose a date from the calendar to see available times
                                                                        </p>
                                                                    </div>
                                                                )}
                                                            </Card.Body>
                                                        </Card>
                                                    </Col>
                                                </Row>

                                                {/* Step 1 Navigation */}
                                                <div className="d-flex justify-content-end mt-4">
                                                    <Button
                                                        variant="primary"
                                                        disabled={!selectedDate || !selectedTimeSlot}
                                                        onClick={nextStep}
                                                        className="px-4 py-2"
                                                        style={{ borderRadius: '10px', fontWeight: '600' }}
                                                    >
                                                        Next: Enter Your Details
                                                    </Button>
                                                </div>
                                            </>
                                        )}

                                        {/* Step 2: Enhanced Guest Details Form */}
                                        {currentStep === 2 && (
                                            <>
                                                <div className="mb-4">
                                                    <h3 className="fw-bold text-dark mb-2">Enter Your Details</h3>
                                                    <p className="text-muted mb-0">Tell us about yourself so we can prepare for the meeting</p>
                                                </div>

                                                <Card className="border-0 shadow-sm" style={{ borderRadius: '15px' }}>
                                                    <Card.Body className="p-4">
                                                        <Form>
                                                            <Row>
                                                                <Col md={6}>
                                                                    <Form.Group className="mb-3">
                                                                        <Form.Label className="fw-semibold">Name *</Form.Label>
                                                                        <div className="input-group-modern">
                                                                            <span className="input-icon">
                                                                                <FiUser size={16} />
                                                                            </span>
                                                                            <Form.Control
                                                                                type="text"
                                                                                placeholder="Your full name"
                                                                                value={formData.name}
                                                                                onChange={(e) => setFormData({
                                                                                    ...formData,
                                                                                    name: e.target.value
                                                                                })}
                                                                                className="form-control-modern"
                                                                                required
                                                                            />
                                                                        </div>
                                                                    </Form.Group>
                                                                </Col>
                                                                <Col md={6}>
                                                                    <Form.Group className="mb-3">
                                                                        <Form.Label className="fw-semibold">Email *</Form.Label>
                                                                        <div className="input-group-modern">
                                                                            <span className="input-icon">
                                                                                <FiMail size={16} />
                                                                            </span>
                                                                            <Form.Control
                                                                                type="email"
                                                                                placeholder="your@email.com"
                                                                                value={formData.email}
                                                                                onChange={(e) => setFormData({
                                                                                    ...formData,
                                                                                    email: e.target.value
                                                                                })}
                                                                                className="form-control-modern"
                                                                                required
                                                                            />
                                                                        </div>
                                                                    </Form.Group>
                                                                </Col>
                                                            </Row>

                                                            <Form.Group className="mb-3">
                                                                <Form.Label className="fw-semibold">Phone Number (optional)</Form.Label>
                                                                <div className="input-group-modern">
                                                                    <span className="input-icon">
                                                                        <FiPhone size={16} />
                                                                    </span>
                                                                    <Form.Control
                                                                        type="tel"
                                                                        placeholder="+1 (555) 123-4567"
                                                                        value={formData.phone}
                                                                        onChange={(e) => setFormData({
                                                                            ...formData,
                                                                            phone: e.target.value
                                                                        })}
                                                                        className="form-control-modern"
                                                                    />
                                                                </div>
                                                            </Form.Group>

                                                            <Form.Group className="mb-4">
                                                                <Form.Label className="fw-semibold">Additional Notes (optional)</Form.Label>
                                                                <div className="input-group-modern">
                                                                    <span className="input-icon-textarea">
                                                                        <FiMessageSquare size={16} />
                                                                    </span>
                                                                    <Form.Control
                                                                        as="textarea"
                                                                        rows={4}
                                                                        placeholder="Please share anything that will help prepare for our meeting..."
                                                                        value={formData.message}
                                                                        onChange={(e) => setFormData({
                                                                            ...formData,
                                                                            message: e.target.value
                                                                        })}
                                                                        className="form-control-modern"
                                                                    />
                                                                </div>
                                                            </Form.Group>
                                                        </Form>
                                                    </Card.Body>
                                                </Card>

                                                {/* Step 2 Navigation */}
                                                <div className="d-flex justify-content-between mt-4">
                                                    <Button
                                                        variant="outline-secondary"
                                                        onClick={prevStep}
                                                        className="px-4 py-2"
                                                        style={{ borderRadius: '10px' }}
                                                    >
                                                        <FiChevronLeft className="me-1" />
                                                        Back
                                                    </Button>
                                                    <Button
                                                        variant="primary"
                                                        disabled={!formData.name || !formData.email}
                                                        onClick={nextStep}
                                                        className="px-4 py-2"
                                                        style={{ borderRadius: '10px', fontWeight: '600' }}
                                                    >
                                                        Review & Confirm
                                                    </Button>
                                                </div>
                                            </>
                                        )}

                                        {/* Step 3: Enhanced Confirmation */}
                                        {currentStep === 3 && (
                                            <>
                                                <div className="mb-4">
                                                    <h3 className="fw-bold text-dark mb-2">Confirm Your Booking</h3>
                                                    <p className="text-muted mb-0">Please review your booking details before confirming</p>
                                                </div>

                                                <div className="confirmation-details">
                                                    {/* Enhanced Meeting Details Card */}
                                                    <Card className="border-0 shadow-sm mb-3" style={{ borderRadius: '15px' }}>
                                                        <Card.Body className="p-4">
                                                            <h6 className="fw-semibold mb-3 d-flex align-items-center text-primary">
                                                                <FiCalendar className="me-2" />
                                                                Meeting Details
                                                            </h6>
                                                            <Row>
                                                                <Col sm={6}>
                                                                    <div className="mb-3">
                                                                        <small className="text-muted text-uppercase fw-semibold" style={{ fontSize: '11px' }}>Meeting Type</small>
                                                                        <div className="fw-semibold text-dark">{meetingType?.name || 'Meeting'}</div>
                                                                    </div>
                                                                    <div className="mb-3">
                                                                        <small className="text-muted text-uppercase fw-semibold" style={{ fontSize: '11px' }}>Duration</small>
                                                                        <div className="fw-semibold text-dark">{meetingType?.duration || 30} minutes</div>
                                                                    </div>
                                                                </Col>
                                                                <Col sm={6}>
                                                                    <div className="mb-3">
                                                                        <small className="text-muted text-uppercase fw-semibold" style={{ fontSize: '11px' }}>Date</small>
                                                                        <div className="fw-semibold text-dark">
                                                                            {selectedDate?.toLocaleDateString('en-US', {
                                                                                weekday: 'long',
                                                                                year: 'numeric',
                                                                                month: 'long',
                                                                                day: 'numeric'
                                                                            }) || 'No date selected'}
                                                                        </div>
                                                                    </div>
                                                                    <div className="mb-3">
                                                                        <small className="text-muted text-uppercase fw-semibold" style={{ fontSize: '11px' }}>Time</small>
                                                                        <div className="fw-semibold text-dark">
                                                                            {selectedTimeSlot && selectedTimeZone ? (
                                                                                <>
                                                                                    {formatTimeInTimeZone(selectedTimeSlot, selectedTimeZone)}
                                                                                    <small className="text-muted ms-2 d-block" style={{ fontSize: '12px' }}>
                                                                                        {getTimezoneLabel(selectedTimeZone)}
                                                                                    </small>
                                                                                </>
                                                                            ) : (
                                                                                'No time selected'
                                                                            )}
                                                                        </div>
                                                                    </div>
                                                                </Col>
                                                            </Row>
                                                        </Card.Body>
                                                    </Card>

                                                    {/* Enhanced Your Details Card */}
                                                    <Card className="border-0 shadow-sm mb-4" style={{ borderRadius: '15px' }}>
                                                        <Card.Body className="p-4">
                                                            <h6 className="fw-semibold mb-3 d-flex align-items-center text-primary">
                                                                <FiUser className="me-2" />
                                                                Your Details
                                                            </h6>
                                                            <Row>
                                                                <Col sm={6}>
                                                                    <div className="mb-3">
                                                                        <small className="text-muted text-uppercase fw-semibold" style={{ fontSize: '11px' }}>Name</small>
                                                                        <div className="fw-semibold text-dark">{formData.name || 'Not provided'}</div>
                                                                    </div>
                                                                    <div className="mb-3">
                                                                        <small className="text-muted text-uppercase fw-semibold" style={{ fontSize: '11px' }}>Email</small>
                                                                        <div className="fw-semibold text-dark">{formData.email || 'Not provided'}</div>
                                                                    </div>
                                                                </Col>
                                                                <Col sm={6}>
                                                                    {formData.phone && (
                                                                        <div className="mb-3">
                                                                            <small className="text-muted text-uppercase fw-semibold" style={{ fontSize: '11px' }}>Phone</small>
                                                                            <div className="fw-semibold text-dark">{formData.phone}</div>
                                                                        </div>
                                                                    )}
                                                                    {formData.message && (
                                                                        <div className="mb-3">
                                                                            <small className="text-muted text-uppercase fw-semibold" style={{ fontSize: '11px' }}>Notes</small>
                                                                            <div className="fw-semibold text-dark" style={{ wordBreak: 'break-word' }}>{formData.message}</div>
                                                                        </div>
                                                                    )}
                                                                </Col>
                                                            </Row>
                                                        </Card.Body>
                                                    </Card>
                                                </div>

                                                {/* Error Display */}
                                                {error && (
                                                    <Alert variant="danger" className="mb-4" style={{ borderRadius: '10px' }}>
                                                        {error}
                                                    </Alert>
                                                )}

                                                {/* Step 3 Navigation */}
                                                <div className="d-flex justify-content-between">
                                                    <Button
                                                        variant="outline-secondary"
                                                        onClick={prevStep}
                                                        disabled={loading}
                                                        className="px-4 py-2"
                                                        style={{ borderRadius: '10px' }}
                                                    >
                                                        <FiChevronLeft className="me-1" />
                                                        Back
                                                    </Button>
                                                    <Button
                                                        variant="success"
                                                        onClick={handleBooking}
                                                        disabled={loading}
                                                        className="px-4 py-2"
                                                        style={{ borderRadius: '10px', fontWeight: '600' }}
                                                    >
                                                        {loading ? (
                                                            <>
                                                                <Spinner animation="border" size="sm" className="me-2" />
                                                                Confirming...
                                                            </>
                                                        ) : (
                                                            <>
                                                                <FiCheck className="me-2" />
                                                                Confirm Booking
                                                            </>
                                                        )}
                                                    </Button>
                                                </div>
                                            </>
                                        )}
                                    </div>
                                </Col>
                            </Row>
                        </Card>
                    </Col>
                </Row>

                {/* Enhanced Success Modal with timezone */}
                <Modal
                    show={showConfirmModal}
                    onHide={() => setShowConfirmModal(false)}
                    centered
                    size="md"
                    backdrop="static"
                >
                    <Modal.Body className="text-center p-5" style={{ borderRadius: '20px' }}>
                        <div className="mb-4">
                            <div
                                className="mx-auto mb-4 d-flex align-items-center justify-content-center"
                                style={{
                                    width: '80px',
                                    height: '80px',
                                    background: 'linear-gradient(135deg, #48bb78, #38a169)',
                                    borderRadius: '50%'
                                }}
                            >
                                <FiCheck size={40} className="text-white" />
                            </div>
                            <h4 className="fw-bold text-success mb-3">Booking Confirmed!</h4>
                            <p className="text-muted mb-0">
                                Your meeting has been successfully scheduled. You'll receive a confirmation email with all the details shortly.
                            </p>
                        </div>

                        <Card className="border-0 shadow-sm mb-4" style={{ borderRadius: '15px', backgroundColor: '#f8f9fa' }}>
                            <Card.Body className="p-3">
                                <h6 className="fw-semibold mb-2 text-primary">{meetingType?.name || 'Meeting'}</h6>
                                <div className="small text-muted">
                                    <div className="mb-1">{selectedDate?.toLocaleDateString('en-US', {
                                        weekday: 'long',
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric'
                                    }) || 'Date not available'}</div>
                                    <div className="mb-1">
                                        {selectedTimeSlot && selectedTimeZone ?
                                            formatTimeInTimeZone(selectedTimeSlot, selectedTimeZone) :
                                            'Time not available'
                                        }
                                    </div>
                                    <div>{getTimezoneLabel(selectedTimeZone)}</div>
                                </div>
                            </Card.Body>
                        </Card>

                        <Button
                            variant="primary"
                            onClick={() => navigate('/')}
                            className="px-4 py-2"
                            style={{ borderRadius: '10px', fontWeight: '600' }}
                        >
                            Done
                        </Button>
                    </Modal.Body>
                </Modal>
            </Container>

            {/* Enhanced Custom Styles */}
            <style jsx>{`
                .modern-calendar {
                    border-radius: 10px;
                    overflow: hidden;
                }

                .calendar-header-modern {
                    display: grid;
                    grid-template-columns: repeat(7, 1fr);
                    background: linear-gradient(135deg, #667eea, #764ba2);
                }

                .calendar-day-header-modern {
                    padding: 12px 8px;
                    text-align: center;
                    font-size: 12px;
                    font-weight: 600;
                    color: white;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                }

                .calendar-body-modern {
                    display: grid;
                    grid-template-columns: repeat(7, 1fr);
                    background: white;
                }

                .calendar-cell-modern {
                    border-right: 1px solid #f1f5f9;
                    border-bottom: 1px solid #f1f5f9;
                    min-height: 50px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }

                .calendar-cell-modern:nth-child(7n) {
                    border-right: none;
                }

                .calendar-day-modern {
                    width: 40px;
                    height: 40px;
                    border: none;
                    background: none;
                    border-radius: 50%;
                    font-weight: 500;
                    transition: all 0.2s ease;
                    cursor: pointer;
                    font-size: 14px;
                }

                .calendar-day-modern.available {
                    color: #1a202c;
                }

                .calendar-day-modern.available:hover {
                    background: linear-gradient(135deg, #667eea, #764ba2);
                    color: white;
                    transform: scale(1.05);
                }

                .calendar-day-modern.selected {
                    background: linear-gradient(135deg, #667eea, #764ba2);
                    color: white;
                    box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
                }

                .calendar-day-modern.unavailable {
                    color: #cbd5e0;
                    cursor: not-allowed;
                }

                .time-slots-modern {
                    max-height: 350px;
                    overflow-y: auto;
                }

                .time-slot-btn:hover {
                    transform: translateY(-1px);
                    box-shadow: 0 4px 12px rgba(102, 126, 234, 0.15);
                }

                .input-group-modern {
                    position: relative;
                }

                .input-icon {
                    position: absolute;
                    left: 12px;
                    top: 50%;
                    transform: translateY(-50%);
                    color: #667eea;
                    z-index: 5;
                }

                .input-icon-textarea {
                    position: absolute;
                    left: 12px;
                    top: 12px;
                    color: #667eea;
                    z-index: 5;
                }

                .form-control-modern {
                    border: 2px solid #e2e8f0;
                    border-radius: 10px;
                    padding: 12px 12px 12px 40px;
                    transition: all 0.2s ease;
                    background: #f8fafc;
                }

                .form-control-modern:focus {
                    border-color: #667eea;
                    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
                    background: white;
                }

                .form-control-modern[as="textarea"] {
                    padding-left: 40px;
                    padding-top: 12px;
                }

                @media (max-width: 991.98px) {
                    .sticky-top {
                        position: relative;
                        top: auto;
                    }
                }
            `}</style>
        </motion.div>
    );
};

export default PublicScheduling;