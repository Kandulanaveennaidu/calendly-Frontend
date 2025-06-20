import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Badge, Modal, Form, Alert, Spinner } from 'react-bootstrap';
import { motion, AnimatePresence } from 'framer-motion';
import { FiCalendar, FiPlus, FiEdit, FiTrash2, FiUsers, FiClock, FiVideo, FiRefreshCw } from 'react-icons/fi';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import '../styles/custom-calendar.css';
import calendarService from '../services/calendarService';

const CalendarPage = () => {
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [showEventModal, setShowEventModal] = useState(false);
    const [showAddEventModal, setShowAddEventModal] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [selectedEvent, setSelectedEvent] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [editSuccessMessage, setEditSuccessMessage] = useState("");
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [successType, setSuccessType] = useState('success'); // Track success alert type
    const [loading, setLoading] = useState(false);
    const [deleteTarget, setDeleteTarget] = useState(null);

    // State for API data
    const [events, setEvents] = useState([]);
    const [todaysEvents, setTodaysEvents] = useState([]);
    const [upcomingEvents, setUpcomingEvents] = useState([]);
    const [calendarStats, setCalendarStats] = useState({});
    const [eventsLoading, setEventsLoading] = useState(true);

    const [newEvent, setNewEvent] = useState({
        title: '',
        date: '',
        time: '',
        duration: 30,
        attendees: '',
        type: 'meeting',
        description: '',
        location: {
            type: 'video-call',
            details: 'Google Meet'
        },
        timezone: 'UTC',
        status: 'confirmed' // Default to confirmed
    });

    // Load initial data on component mount
    useEffect(() => {
        loadInitialData();
    }, []);

    // Load all calendar data
    const loadInitialData = async () => {
        setEventsLoading(true);
        try {
            await Promise.all([
                loadAllEvents(),
                loadTodaysEvents(),
                loadUpcomingEvents(),
                loadCalendarStats()
            ]);
        } catch (error) {
            console.error('Failed to load initial data:', error);
            setError('Failed to load calendar data');
        } finally {
            setEventsLoading(false);
        }
    };

    // 1. Load All Events
    const loadAllEvents = async (page = 1, limit = 100) => {
        try {
            const response = await calendarService.getAllEvents(page, limit);
            console.log('All events loaded:', response);

            let eventsList = [];
            if (response.success && response.data && response.data.events) {
                eventsList = response.data.events;
            } else if (response.events) {
                eventsList = response.events;
            }

            setEvents(eventsList);
        } catch (error) {
            console.error('Failed to load events:', error);
            setError('Failed to load events');
        }
    };

    // 6. Load Today's Events
    const loadTodaysEvents = async () => {
        try {
            const response = await calendarService.getTodaysEvents();
            console.log('Today\'s events loaded:', response);

            let todaysList = [];
            if (response.success && response.data && response.data.events) {
                todaysList = response.data.events;
            } else if (response.events) {
                todaysList = response.events;
            }

            setTodaysEvents(todaysList);
        } catch (error) {
            console.error('Failed to load today\'s events:', error);
        }
    };

    // 7. Load Upcoming Events
    const loadUpcomingEvents = async () => {
        try {
            const response = await calendarService.getUpcomingEvents(5);
            console.log('Upcoming events loaded:', response);

            let upcomingList = [];
            if (response.success && response.data && response.data.events) {
                upcomingList = response.data.events;
            } else if (response.events) {
                upcomingList = response.events;
            }

            setUpcomingEvents(upcomingList);
        } catch (error) {
            console.error('Failed to load upcoming events:', error);
        }
    };

    // 12. Load Calendar Stats
    const loadCalendarStats = async () => {
        try {
            const response = await calendarService.getCalendarStats();
            console.log('Calendar stats loaded:', response);

            if (response.success && response.data) {
                setCalendarStats(response.data);
            }
        } catch (error) {
            console.error('Failed to load calendar stats:', error);
        }
    };

    const formatDate = (date) => {
        return date.toISOString().split('T')[0];
    };

    const getEventsForDate = (date) => {
        const dateStr = formatDate(date);
        return events.filter(event => {
            const eventDate = event.date ? event.date.split('T')[0] : event.date;
            return eventDate === dateStr;
        });
    };

    const handleEventClick = (event) => {
        setSelectedEvent(event);
        setShowEventModal(true);
    };

    const getEventTypeColor = (type) => {
        const colors = {
            meeting: 'primary',
            presentation: 'success',
            review: 'warning',
            interview: 'info'
        };
        return colors[type] || 'secondary';
    };

    // Handle Edit button click
    const handleEditEvent = () => {
        if (selectedEvent) {
            setNewEvent({
                title: selectedEvent.title || '',
                date: selectedEvent.date ? selectedEvent.date.split('T')[0] : '',
                time: selectedEvent.time || '',
                duration: selectedEvent.duration || 30,
                attendees: selectedEvent.attendees ?
                    (Array.isArray(selectedEvent.attendees) ?
                        selectedEvent.attendees.map(a => typeof a === 'string' ? a : a.email).join(', ') :
                        selectedEvent.attendees
                    ) : '',
                type: selectedEvent.type || 'meeting',
                description: selectedEvent.description || '',
                location: selectedEvent.location || { type: 'video-call', details: 'Google Meet' },
                timezone: selectedEvent.timezone || 'UTC',
                status: selectedEvent.status || 'confirmed'
            });
            setIsEditing(true);
            setShowEventModal(false);
            setShowAddEventModal(true);
        }
    };

    // 2. Handle Add/Create Event
    const handleAddEvent = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        setLoading(true);

        try {
            // Prepare attendees data
            const attendeesArray = newEvent.attendees
                ? newEvent.attendees.split(',').map(email => ({
                    name: email.trim().split('@')[0],
                    email: email.trim()
                }))
                : [];

            // Clean event data to prevent validation errors
            const eventData = {
                title: newEvent.title.trim(),
                date: newEvent.date,
                time: newEvent.time,
                duration: parseInt(newEvent.duration),
                type: newEvent.type,
                attendees: attendeesArray,
                description: newEvent.description.trim(),
                location: {
                    type: newEvent.location?.type || 'video-call',
                    details: newEvent.location?.details || 'Google Meet'
                },
                timezone: newEvent.timezone || 'UTC',
                status: newEvent.status || 'confirmed'
            };

            // Validate required fields
            if (!eventData.title) {
                throw new Error('Event title is required');
            }
            if (!eventData.date) {
                throw new Error('Event date is required');
            }
            if (!eventData.time) {
                throw new Error('Event time is required');
            }

            if (isEditing && selectedEvent) {
                // 3. Update existing event
                const response = await calendarService.updateEvent(
                    selectedEvent._id || selectedEvent.id,
                    eventData
                );
                console.log('Event updated:', response);
                const statusMessage = eventData.status === 'confirmed'
                    ? '✅ Meeting Updated & Confirmed!'
                    : '⏳ Meeting Updated (Pending Confirmation)';
                setSuccess(response.message || statusMessage);
                setSuccessType(eventData.status === 'confirmed' ? 'success' : 'warning');
            } else {
                // 2. Create new event
                const response = await calendarService.createEvent(eventData);
                console.log('Event created:', response);
                const statusMessage = eventData.status === 'confirmed'
                    ? '✅ Meeting Created & Confirmed!'
                    : '⏳ Meeting Created (Pending Confirmation)';
                setSuccess(response.message || statusMessage);
                setSuccessType(eventData.status === 'confirmed' ? 'success' : 'warning');
            }

            // Reload all data
            await loadInitialData();
            resetForm();

        } catch (error) {
            console.error('Failed to save event:', error);

            // Handle specific validation errors
            if (error.message.includes('enum value')) {
                setError('Invalid event data. Please check all fields and try again.');
            } else if (error.message.includes('required')) {
                setError('Please fill in all required fields.');
            } else if (error.message.includes('validation')) {
                setError('Please check your input data and try again.');
            } else {
                setError(error.message || 'Failed to save event');
            }
        } finally {
            setLoading(false);
        }
    };

    // 4. Handle Delete Event
    const handleDeleteEvent = (event) => {
        setDeleteTarget(event);
        setShowDeleteConfirm(true);
    };

    // Confirm delete function
    const confirmDelete = async () => {
        if (deleteTarget) {
            setLoading(true);
            try {
                await calendarService.deleteEvent(deleteTarget._id || deleteTarget.id);
                setSuccess('Event deleted successfully!');

                // Reload all data
                await loadInitialData();

            } catch (error) {
                console.error('Failed to delete event:', error);
                setError(error.message || 'Failed to delete event');
            } finally {
                setLoading(false);
            }
        }
        setShowDeleteConfirm(false);
        setDeleteTarget(null);
        setShowEventModal(false);
    };

    // Cancel delete function
    const cancelDelete = () => {
        setShowDeleteConfirm(false);
        setDeleteTarget(null);
    };

    // Function to reset form and state
    const resetForm = () => {
        setShowAddEventModal(false);
        setNewEvent({
            title: '',
            date: '',
            time: '',
            duration: 30,
            attendees: '',
            type: 'meeting',
            description: '',
            location: {
                type: 'video-call',
                details: 'Google Meet'
            },
            timezone: 'UTC',
            status: 'confirmed'
        });
        setIsEditing(false);
        setEditSuccessMessage('');
        setError('');
        setSuccess('');
        setSuccessType('success');
    };

    // Manual refresh function
    const handleRefresh = async () => {
        await loadInitialData();
        setSuccess('Calendar refreshed successfully!');
        setTimeout(() => setSuccess(''), 3000);
    };

    // 9. Handle Status Update
    const handleStatusUpdate = async (eventId, status) => {
        try {
            await calendarService.updateEventStatus(eventId, status);
            setSuccess(`Event status updated to ${status}!`);
            await loadInitialData();
        } catch (error) {
            console.error('Failed to update status:', error);
            setError('Failed to update event status');
        }
    };

    // if (eventsLoading) {
    //     return (
    //         <Container className="py-5">
    //             <div className="text-center">
    //                 <Spinner animation="border" variant="primary" />
    //                 <p className="mt-2">Loading calendar...</p>
    //             </div>
    //         </Container>
    //     );
    // }

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="calendar-bg"
        >
            <Container fluid className="py-5 d-flex justify-content-center align-items-start" style={{ minHeight: '100vh' }}>
                <div className="calendar-content-wrapper">
                    <Row className="mb-4">
                        <Col>
                            <motion.div
                                initial={{ y: -30, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ duration: 0.6 }}
                                className="d-flex justify-content-between align-items-center"
                            >
                                <div>
                                    <h1 className="display-5 fw-bold mb-1 text-gradient">Events</h1>
                                    <p className="text-muted mb-0">
                                        View and manage your scheduled meetings - {todaysEvents.length} events today
                                    </p>
                                </div>
                                <Button
                                    variant="primary"
                                    className="btn-modern px-4 py-2 shadow-lg"
                                    style={{ fontSize: '1.1rem', borderRadius: '12px' }}
                                    onClick={() => setShowAddEventModal(true)}
                                    as={motion.button}
                                    whileHover={{ scale: 1.05, boxShadow: "0 8px 32px rgba(99,102,241,0.15)" }}
                                    whileTap={{ scale: 0.97 }}
                                >
                                    <FiPlus className="me-2" />
                                    Add Event
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
                                        <Alert
                                            variant={successType}
                                            dismissible
                                            onClose={() => {
                                                setSuccess('');
                                                setSuccessType('success');
                                            }}
                                            className="mb-4 shadow d-flex align-items-center"
                                        >
                                            {successType === 'success' ? (
                                                <div className="d-flex align-items-center w-100">
                                                    <span className="me-2" style={{ fontSize: '1.2rem' }}>✅</span>
                                                    <div>
                                                        <strong>{success}</strong>
                                                        <div className="small text-muted mt-1">
                                                            Meeting is confirmed and ready to go!
                                                        </div>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="d-flex align-items-center w-100">
                                                    <span className="me-2" style={{ fontSize: '1.2rem' }}>⏳</span>
                                                    <div>
                                                        <strong>{success}</strong>
                                                        <div className="small text-muted mt-1">
                                                            Meeting requires confirmation from attendees.
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                        </Alert>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </Col>
                    </Row>

                    {/* Today's Events Alert */}
                    {todaysEvents.length > 0 && (
                        <Row className="mb-4">
                            <Col>
                                <Alert variant="info" className="d-flex align-items-center">
                                    <FiClock className="me-2" />
                                    <strong>Today:</strong> You have {todaysEvents.length} meeting{todaysEvents.length > 1 ? 's' : ''} scheduled
                                </Alert>
                            </Col>
                        </Row>
                    )}

                    <Row className="g-4 calendar-main-row">
                        <Col lg={6}>
                            <motion.div
                                initial={{ y: 30, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ delay: 0.2 }}
                            >
                                <Card className="glass-card border-0 shadow-lg calendar-card-equal">
                                    <Card.Body className="p-4">
                                        <Calendar
                                            onChange={setSelectedDate}
                                            value={selectedDate}
                                            className="modern-calendar w-100"
                                            tileContent={({ date, view }) => {
                                                if (view === 'month') {
                                                    const dayEvents = getEventsForDate(date);
                                                    return dayEvents.length > 0 ? (
                                                        <div className="d-flex flex-column align-items-center gap-1 mt-1">
                                                            {dayEvents.slice(0, 2).map((event, index) => (
                                                                <div
                                                                    key={index}
                                                                    className={`event-indicator event-indicator-${getEventTypeColor(event.type)} ${event.status === 'pending' ? 'pending-event' : ''}`}
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        handleEventClick(event);
                                                                    }}
                                                                    title={`${event.title} at ${event.time} ${event.status ? `(${event.status})` : ''}`}
                                                                    style={{
                                                                        opacity: event.status === 'pending' ? 0.7 : 1,
                                                                        border: event.status === 'pending' ? '1px dashed #ffc107' : 'none'
                                                                    }}
                                                                >
                                                                    {event.status === 'pending' && <span style={{ fontSize: '8px', marginRight: '2px' }}>⏳</span>}
                                                                    {event.title.length > 6 ? `${event.title.substring(0, 5)}...` : event.title}
                                                                </div>
                                                            ))}
                                                            {dayEvents.length > 2 && (
                                                                <div className="more-events">
                                                                    +{dayEvents.length - 2} more
                                                                </div>
                                                            )}
                                                        </div>
                                                    ) : null;
                                                }
                                            }}
                                        />
                                    </Card.Body>
                                </Card>
                            </motion.div>
                        </Col>

                        <Col lg={6}>
                            <motion.div
                                initial={{ y: 30, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ delay: 0.3 }}
                            >
                                <Card className="glass-card border-0 shadow-lg calendar-card-equal mb-4">
                                    <Card.Header className="bg-white border-0 p-4">
                                        <h5 className="mb-0 fw-bold">
                                            Events for {selectedDate.toLocaleDateString()}
                                        </h5>
                                    </Card.Header>
                                    <Card.Body className="p-0" style={{ maxHeight: '260px', overflowY: 'auto' }}>
                                        {getEventsForDate(selectedDate).length > 0 ? (
                                            getEventsForDate(selectedDate).map((event, index) => (
                                                <motion.div
                                                    key={event._id || event.id}
                                                    initial={{ x: 30, opacity: 0 }}
                                                    animate={{ x: 0, opacity: 1 }}
                                                    transition={{ delay: 0.4 + index * 0.1 }}
                                                    className="p-3 border-bottom cursor-pointer"
                                                    whileHover={{ backgroundColor: "#f8f9fa" }}
                                                    onClick={() => handleEventClick(event)}
                                                >
                                                    <div className="d-flex justify-content-between align-items-start">
                                                        <div>
                                                            <h6 className="mb-1 fw-semibold">{event.title}</h6>
                                                            <div className="d-flex align-items-center text-muted small mb-2">
                                                                <FiClock size={12} className="me-1" />
                                                                {event.time} ({event.duration} min)
                                                            </div>
                                                            <div className="d-flex align-items-center text-muted small">
                                                                <FiUsers size={12} className="me-1" />
                                                                {event.attendees ? event.attendees.length : 0} attendees
                                                            </div>
                                                        </div>
                                                        <div className="d-flex flex-column align-items-end gap-1">
                                                            <Badge bg={getEventTypeColor(event.type)} className="text-capitalize">
                                                                {event.type}
                                                            </Badge>
                                                            {event.status && (
                                                                <Badge
                                                                    bg={event.status === 'confirmed' ? 'success' : 'warning'}
                                                                    className="small px-2"
                                                                >
                                                                    {event.status === 'confirmed' ? '✓ Confirmed' : '⏳ Pending'}
                                                                </Badge>
                                                            )}
                                                        </div>
                                                    </div>
                                                </motion.div>
                                            ))
                                        ) : (
                                            <div className="p-4 text-center text-muted">
                                                <FiCalendar size={48} className="mb-3 opacity-50" />
                                                <p>No events scheduled for this date</p>
                                            </div>
                                        )}
                                    </Card.Body>
                                </Card>
                            </motion.div>

                            {/* Upcoming Events */}
                            <motion.div
                                initial={{ y: 30, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ delay: 0.5 }}
                            >
                                <Card className="glass-card border-0 shadow-lg">
                                    <Card.Header className="bg-white border-0 p-4">
                                        <h5 className="mb-0 fw-bold">Upcoming Events</h5>
                                    </Card.Header>
                                    <Card.Body className="p-0" style={{ maxHeight: '260px', overflowY: 'auto' }}>
                                        {upcomingEvents.length > 0 ? upcomingEvents.map((event, index) => (
                                            <div key={event._id || event.id} className="p-3 border-bottom">
                                                <div className="d-flex justify-content-between align-items-start">
                                                    <div>
                                                        <h6 className="mb-1 fw-semibold">{event.title}</h6>
                                                        <small className="text-muted">
                                                            {event.date ? new Date(event.date).toLocaleDateString() : 'No date'} at {event.time || 'No time'}
                                                        </small>
                                                        {event.status && (
                                                            <div className="mt-1">
                                                                <Badge
                                                                    bg={event.status === 'confirmed' ? 'success' : 'warning'}
                                                                    className="small"
                                                                >
                                                                    {event.status === 'confirmed' ? '✓ Confirmed' : '⏳ Pending'}
                                                                </Badge>
                                                            </div>
                                                        )}
                                                    </div>
                                                    <Badge bg={getEventTypeColor(event.type)}>
                                                        {event.type}
                                                    </Badge>
                                                </div>
                                            </div>
                                        )) : (
                                            <div className="p-4 text-center text-muted">
                                                <p>No upcoming events</p>
                                            </div>
                                        )}
                                    </Card.Body>
                                </Card>
                            </motion.div>
                        </Col>
                    </Row>

                    {/* Add/Edit Event Modal */}
                    <Modal
                        show={showAddEventModal}
                        onHide={resetForm}
                        centered
                        size="lg"
                    >
                        <Modal.Header closeButton>
                            <Modal.Title>{isEditing ? 'Edit Event' : 'Add New Event'}</Modal.Title>
                        </Modal.Header>
                        <Modal.Body>
                            {editSuccessMessage && (
                                <Alert variant="success" className="mb-3">
                                    {editSuccessMessage}
                                </Alert>
                            )}
                            <Form onSubmit={handleAddEvent}>
                                <Row>
                                    <Col md={8}>
                                        <Form.Group className="mb-3">
                                            <Form.Label>Event Title *</Form.Label>
                                            <Form.Control
                                                type="text"
                                                placeholder="Enter event title"
                                                value={newEvent.title}
                                                onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                                                className="form-control-modern"
                                                required
                                            />
                                        </Form.Group>
                                    </Col>
                                    <Col md={4}>
                                        <Form.Group className="mb-3">
                                            <Form.Label>Event Type</Form.Label>
                                            <Form.Select
                                                value={newEvent.type}
                                                onChange={(e) => setNewEvent({ ...newEvent, type: e.target.value })}
                                                className="form-control-modern"
                                            >
                                                <option value="meeting">Meeting</option>
                                                <option value="presentation">Presentation</option>
                                                <option value="review">Review</option>
                                                <option value="interview">Interview</option>
                                            </Form.Select>
                                        </Form.Group>
                                    </Col>
                                </Row>

                                <Row>
                                    <Col md={4}>
                                        <Form.Group className="mb-3">
                                            <Form.Label>Date *</Form.Label>
                                            <Form.Control
                                                type="date"
                                                value={newEvent.date}
                                                onChange={(e) => setNewEvent({ ...newEvent, date: e.target.value })}
                                                className="form-control-modern"
                                                required
                                            />
                                        </Form.Group>
                                    </Col>
                                    <Col md={4}>
                                        <Form.Group className="mb-3">
                                            <Form.Label>Time *</Form.Label>
                                            <Form.Control
                                                type="time"
                                                value={newEvent.time}
                                                onChange={(e) => setNewEvent({ ...newEvent, time: e.target.value })}
                                                className="form-control-modern"
                                                required
                                            />
                                        </Form.Group>
                                    </Col>
                                    <Col md={4}>
                                        <Form.Group className="mb-3">
                                            <Form.Label>Duration (minutes)</Form.Label>
                                            <Form.Select
                                                value={newEvent.duration}
                                                onChange={(e) => setNewEvent({ ...newEvent, duration: parseInt(e.target.value) })}
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
                                    <Form.Label>Attendees (Email addresses, separated by commas)</Form.Label>
                                    <Form.Control
                                        type="text"
                                        placeholder="john@example.com, jane@example.com"
                                        value={newEvent.attendees}
                                        onChange={(e) => setNewEvent({ ...newEvent, attendees: e.target.value })}
                                        className="form-control-modern"
                                    />
                                </Form.Group>

                                <Form.Group className="mb-4">
                                    <Form.Label>Description</Form.Label>
                                    <Form.Control
                                        as="textarea"
                                        rows={3}
                                        placeholder="Add event description or agenda..."
                                        value={newEvent.description}
                                        onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
                                        className="form-control-modern"
                                    />
                                </Form.Group>

                                <Row>
                                    <Col md={6}>
                                        <Form.Group className="mb-3">
                                            <Form.Label className="d-flex align-items-center">
                                                Meeting Status *
                                                <Badge
                                                    bg={newEvent.status === 'confirmed' ? 'success' : 'warning'}
                                                    className="ms-2 px-2"
                                                >
                                                    {newEvent.status === 'confirmed' ? '✓ Confirmed' : '⏳ Pending'}
                                                </Badge>
                                            </Form.Label>
                                            <Form.Select
                                                value={newEvent.status}
                                                onChange={(e) => setNewEvent({ ...newEvent, status: e.target.value })}
                                                className="form-control-modern"
                                            >
                                                <option value="confirmed">✅ Confirmed - Meeting is scheduled and confirmed</option>
                                                <option value="pending">⏳ Pending - Waiting for confirmation</option>
                                            </Form.Select>
                                            <Form.Text className="text-muted">
                                                {newEvent.status === 'confirmed'
                                                    ? 'This meeting is confirmed and ready to go!'
                                                    : 'This meeting requires confirmation from attendees.'}
                                            </Form.Text>
                                        </Form.Group>
                                    </Col>
                                    <Col md={6}>
                                        <div className="mt-4 p-3 rounded" style={{
                                            backgroundColor: newEvent.status === 'confirmed' ? '#d4edda' : '#fff3cd',
                                            border: `1px solid ${newEvent.status === 'confirmed' ? '#c3e6cb' : '#ffeaa7'}`,
                                            color: newEvent.status === 'confirmed' ? '#155724' : '#856404'
                                        }}>
                                            <small className="fw-semibold d-block mb-1">
                                                {newEvent.status === 'confirmed' ? '✅ Ready to Schedule' : '⏳ Needs Confirmation'}
                                            </small>
                                            <small>
                                                {newEvent.status === 'confirmed'
                                                    ? 'This meeting will be immediately available and confirmed.'
                                                    : 'Attendees will receive a confirmation request for this meeting.'}
                                            </small>
                                        </div>
                                    </Col>
                                </Row>

                                <div className="d-flex justify-content-end gap-2">
                                    <Button variant="outline-secondary" onClick={resetForm} disabled={loading}>
                                        Cancel
                                    </Button>
                                    <Button type="submit" variant="primary" className="btn-modern" disabled={loading}>
                                        {loading ? (
                                            <>
                                                <Spinner size="sm" className="me-2" />
                                                {isEditing ? 'Updating...' : 'Creating...'}
                                            </>
                                        ) : (
                                            <>
                                                {isEditing ? 'Update Event' : 'Add Event'}
                                            </>
                                        )}
                                    </Button>
                                </div>
                            </Form>
                        </Modal.Body>
                    </Modal>

                    {/* Event Details Modal */}
                    <Modal show={showEventModal} onHide={() => setShowEventModal(false)} centered>
                        <Modal.Header closeButton>
                            <Modal.Title>Event Details</Modal.Title>
                        </Modal.Header>
                        {selectedEvent && (
                            <Modal.Body>
                                <div className="mb-3">
                                    <h5 className="fw-bold">{selectedEvent.title}</h5>
                                    <Badge bg={getEventTypeColor(selectedEvent.type)} className="text-capitalize mb-3">
                                        {selectedEvent.type}
                                    </Badge>
                                    {selectedEvent.status && (
                                        <Badge bg={selectedEvent.status === 'confirmed' ? 'success' : 'warning'} className="ms-2">
                                            {selectedEvent.status}
                                        </Badge>
                                    )}
                                </div>

                                <div className="mb-3">
                                    <div className="d-flex align-items-center mb-2">
                                        <FiCalendar className="me-2 text-muted" />
                                        <span>{selectedEvent.date ? new Date(selectedEvent.date).toLocaleDateString() : 'No date'}</span>
                                    </div>
                                    <div className="d-flex align-items-center mb-2">
                                        <FiClock className="me-2 text-muted" />
                                        <span>{selectedEvent.time} ({selectedEvent.duration} minutes)</span>
                                    </div>
                                    <div className="d-flex align-items-center mb-2">
                                        <FiUsers className="me-2 text-muted" />
                                        <span>{selectedEvent.attendees ? selectedEvent.attendees.length : 0} attendees</span>
                                    </div>
                                    <div className="d-flex align-items-center">
                                        <FiVideo className="me-2 text-muted" />
                                        <span>{selectedEvent.location?.details || 'Video call link will be sent'}</span>
                                    </div>
                                </div>

                                {selectedEvent.description && (
                                    <div className="mb-3">
                                        <h6 className="fw-semibold">Description:</h6>
                                        <p className="text-muted">{selectedEvent.description}</p>
                                    </div>
                                )}

                                <div className="mb-3">
                                    <h6 className="fw-semibold">Attendees:</h6>
                                    {selectedEvent.attendees && selectedEvent.attendees.length > 0 ? (
                                        selectedEvent.attendees.map((attendee, index) => (
                                            <div key={index} className="text-muted small">
                                                {typeof attendee === 'string' ? attendee : `${attendee.name} (${attendee.email})`}
                                            </div>
                                        ))
                                    ) : (
                                        <p className="text-muted small">No attendees added</p>
                                    )}
                                </div>
                            </Modal.Body>
                        )}
                        <Modal.Footer>
                            <Button variant="outline-secondary" onClick={() => setShowEventModal(false)}>
                                Close
                            </Button>
                            {selectedEvent?.status === 'pending' && (
                                <Button
                                    variant="outline-success"
                                    onClick={() => handleStatusUpdate(selectedEvent._id || selectedEvent.id, 'confirmed')}
                                >
                                    Confirm
                                </Button>
                            )}
                            <Button variant="outline-primary" onClick={handleEditEvent}>
                                <FiEdit className="me-1" />
                                Edit
                            </Button>
                            <Button
                                variant="outline-danger"
                                onClick={() => selectedEvent && handleDeleteEvent(selectedEvent)}
                            >
                                <FiTrash2 className="me-1" />
                                Delete
                            </Button>
                        </Modal.Footer>
                    </Modal>

                    {/* Delete Confirmation Modal */}
                    <Modal show={showDeleteConfirm} onHide={cancelDelete} centered size="sm">
                        <Modal.Header closeButton className="border-0 pb-0">
                            <Modal.Title className="h5 text-danger">
                                <FiTrash2 className="me-2" />
                                Delete Event
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
                                        You're about to delete <strong>"{deleteTarget?.title}"</strong>.
                                        This action cannot be undone and will permanently remove this event.
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
                                    disabled={loading}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    variant="danger"
                                    onClick={confirmDelete}
                                    className="flex-fill"
                                    disabled={loading}
                                >
                                    {loading ? (
                                        <>
                                            <Spinner size="sm" className="me-1" />
                                            Deleting...
                                        </>
                                    ) : (
                                        <>
                                            <FiTrash2 className="me-1" />
                                            Delete
                                        </>
                                    )}
                                </Button>
                            </div>
                        </Modal.Footer>
                    </Modal>
                </div>
            </Container>

            {/* Modern Calendar Styles */}
            <style jsx>{`
                .calendar-bg {
                    min-height: 100vh;
                    background: linear-gradient(135deg, #f8fafc 0%, #e0e7ff 100%);
                }
                .calendar-content-wrapper {
                    max-width: 1200px;
                    width: 100%;
                    margin: 0 auto;
                }
                .calendar-main-row {
                    min-height: 540px;
                }
                .glass-card {
                    background: rgba(255,255,255,0.85);
                    border-radius: 18px;
                    box-shadow: 0 8px 32px rgba(99,102,241,0.08), 0 1.5px 4px rgba(0,0,0,0.04);
                    backdrop-filter: blur(8px);
                }
                .calendar-card-equal {
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

                /* Status-aware event styling */
                .pending-event {
                    animation: pulse-border 2s infinite;
                }

                @keyframes pulse-border {
                    0% { border-color: #ffc107; }
                    50% { border-color: #ffcd39; }
                    100% { border-color: #ffc107; }
                }

                .event-indicator {
                    transition: all 0.3s ease;
                }

                .event-indicator:hover {
                    transform: scale(1.05);
                    box-shadow: 0 2px 8px rgba(0,0,0,0.15);
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
                    opacity: 0.1;
                }

                .footer-pattern {
                    position: absolute;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background-image: 
                        radial-gradient(circle at 25% 25%, rgba(103, 126, 234, 0.1) 0%, transparent 50%),
                        radial-gradient(circle at 75% 75%, rgba(240, 147, 251, 0.1) 0%, transparent 50%);
                    animation: patternFloat 20s ease-in-out infinite;
                }

                .footer-glow {
                    position: absolute;
                    top: -50%;
                    left: -50%;
                    right: -50%;
                    bottom: -50%;
                    background: radial-gradient(circle, rgba(103, 126, 234, 0.03) 0%, transparent 70%);
                    animation: glowPulse 8s ease-in-out infinite;
                }

                @keyframes patternFloat {
                    0%, 100% { transform: translate(0, 0) scale(1); }
                    50% { transform: translate(-10px, -10px) scale(1.05); }
                }

                @keyframes glowPulse {
                    0%, 100% { opacity: 0.3; transform: scale(1); }
                    50% { opacity: 0.6; transform: scale(1.1); }
                }

                .footer-main {
                    position: relative;
                    z-index: 2;
                }

                .footer-brand-section {
                    padding: 0 2rem;
                }

                .brand-container {
                    display: flex;
                    align-items: center;
                    gap: 1rem;
                }

                .brand-icon-footer {
                    width: 60px;
                    height: 60px;
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    border-radius: 15px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: white;
                    box-shadow: 0 10px 30px rgba(103, 126, 234, 0.3);
                }

                .brand-name-footer {
                    font-size: 2rem;
                    font-weight: 800;
                    color: white;
                    margin: 0;
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                    background-clip: text;
                }

                .brand-description {
                    color: #a0aec0;
                    line-height: 1.6;
                    font-size: 1rem;
                    margin-bottom: 2rem;
                }

                .footer-section-title {
                    color: white;
                    font-weight: 700;
                    font-size: 1.1rem;
                    margin-bottom: 2rem;
                    display: flex;
                    align-items: center;
                    position: relative;
                }

                .footer-section-title::after {
                    content: '';
                    position: absolute;
                    bottom: -8px;
                    left: 50%;
                    transform: translateX(-50%);
                    width: 30px;
                    height: 2px;
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    border-radius: 1px;
                }

                .footer-nav-list {
                    list-style: none;
                    padding: 0;
                    margin: 0;
                    text-align: center;
                }

                .footer-nav-list li {
                    margin-bottom: 1rem;
                }

                .footer-nav-link {
                    color: #a0aec0;
                    text-decoration: none;
                    font-size: 0.95rem;
                    display: inline-flex;
                    align-items: center;
                    transition: all 0.3s ease;
                    position: relative;
                }

                .footer-nav-link:hover {
                    color: white;
                    text-decoration: none;
                }

                .footer-divider-enhanced {
                    margin: 3rem 0;
                    position: relative;
                    height: 1px;
                    overflow: hidden;
                }

                .divider-line {
                    width: 100%;
                    height: 1px;
                    background: linear-gradient(90deg, 
                        transparent 0%, 
                        rgba(255, 255, 255, 0.1) 25%, 
                        rgba(103, 126, 234, 0.3) 50%, 
                        rgba(255, 255, 255, 0.1) 75%, 
                        transparent 100%
                    );
                }

                .divider-glow {
                    position: absolute;
                    top: -5px;
                    left: 50%;
                    transform: translateX(-50%);
                    width: 100px;
                    height: 10px;
                    background: radial-gradient(ellipse, rgba(103, 126, 234, 0.4) 0%, transparent 70%);
                    border-radius: 50%;
                }

                .footer-bottom {
                    position: relative;
                    z-index: 2;
                    padding-top: 2rem;
                }

                .copyright-text {
                    color: #a0aec0;
                    margin: 0;
                    font-size: 0.9rem;
                }

                .brand-highlight {
                    color: white;
                    font-weight: 600;
                }

                @media (max-width: 991.98px) {
                    .calendar-content-wrapper {
                        max-width: 100%;
                        padding: 0 10px;
                    }
                    .calendar-card-equal {
                        min-height: 320px;
                        height: auto;
                    }
                    .enhanced-footer {
                        padding: 3rem 0 2rem;
                    }
                    .footer-brand-section {
                        padding: 0;
                        margin-bottom: 2rem;
                    }
                    .brand-container {
                        justify-content: center;
                    }
                    .footer-section-title {
                        justify-content: center;
                    }
                    .footer-nav-list li {
                        display: inline-block;
                        margin: 0.5rem 1rem;
                    }
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

export default CalendarPage;