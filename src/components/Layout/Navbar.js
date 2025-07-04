import React, { useState, useContext, useEffect } from 'react';
import { Navbar, Nav, Container, Button, Dropdown, Modal, Form } from 'react-bootstrap';
import { motion } from 'framer-motion';
import { FiCalendar, FiUser, FiMenu, FiBell, FiLogOut, FiSettings } from 'react-icons/fi';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import meetingService from '../../services/meetingService';
import notificationService from '../../services/notificationService';

const CustomNavbar = () => {
    const { currentUser, logout } = useContext(AuthContext);
    const navigate = useNavigate();
    const location = useLocation();
    const [expanded, setExpanded] = useState(false);
    const [showScheduleModal, setShowScheduleModal] = useState(false);
    const [scheduleLoading, setScheduleLoading] = useState(false);
    const [scheduleError, setScheduleError] = useState('');

    // Notifications State with REST API
    const [notifications, setNotifications] = useState([]);
    const [notificationLoading, setNotificationLoading] = useState(false);

    const [scheduleForm, setScheduleForm] = useState({
        name: '',
        description: '',
        duration: 30,
        date: '', // Add date field
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

    // Initialize notifications
    useEffect(() => {
        if (currentUser) {
            loadNotifications();
        }
    }, [currentUser]);

    // Load notifications from API
    const loadNotifications = async () => {
        try {
            setNotificationLoading(true);
            const response = await notificationService.getNotifications({ limit: 10 });

            if (response.success) {
                setNotifications(response.data.notifications || []);
            }
        } catch (error) {
            console.error('Failed to load notifications:', error);
            // Keep existing notifications on error
        } finally {
            setNotificationLoading(false);
        }
    };

    // Mark notification as read
    const markAsRead = async (notificationId) => {
        try {
            await notificationService.markAsRead(notificationId);

            setNotifications(prev =>
                prev.map(notif =>
                    notif.id === notificationId
                        ? { ...notif, isRead: true }
                        : notif
                )
            );
        } catch (error) {
            console.error('Failed to mark notification as read:', error);
        }
    };

    // Request notification permission
    useEffect(() => {
        if (Notification.permission === 'default') {
            Notification.requestPermission();
        }
    }, []);

    const handleScheduleSubmit = async (e) => {
        e.preventDefault();
        setScheduleError('');
        setScheduleLoading(true);

        const meetingName = scheduleForm.name;

        try {
            // Ensure date is in YYYY-MM-DD format before sending to API
            const apiData = {
                ...scheduleForm,
                availableDate: scheduleForm.date // The HTML date input already provides YYYY-MM-DD format
            };

            // Remove the 'date' field as we're using 'availableDate' for the API
            delete apiData.date;

            console.log('Submitting meeting type with data:', apiData);

            // Create meeting type via API
            const response = await meetingService.createMeetingType(apiData);

            if (response.success) {
                setShowScheduleModal(false);
                setScheduleForm({
                    name: '',
                    description: '',
                    duration: 30,
                    date: '', // Reset date field
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

                // Trigger events
                window.dispatchEvent(new CustomEvent('meetingTypesUpdated', {
                    detail: { newMeetingType: response.data }
                }));

                // Create notification via REST API
                try {
                    await notificationService.createNotification({
                        type: 'meeting_created',
                        title: 'Meeting Type Created Successfully!',
                        message: `"${meetingName}" is now available for booking`,
                        data: { meetingTypeId: response.data.id }
                    });

                    // Reload notifications to show the new one
                    loadNotifications();

                    // Show browser notification
                    if (Notification.permission === 'granted') {
                        new Notification('Meeting Type Created Successfully!', {
                            body: `"${meetingName}" is now available for booking`,
                            icon: '/favicon.ico'
                        });
                    }
                } catch (notifError) {
                    console.error('Failed to create notification:', notifError);
                    // Still show success even if notification fails
                }

                navigate('/meetings');
            } else {
                throw new Error(response.message || 'Failed to create meeting type');
            }
        } catch (error) {
            console.error('Failed to create meeting type:', error);
            setScheduleError(error.message || 'Failed to create meeting type');
        } finally {
            setScheduleLoading(false);
        }
    };

    // Add logout handler
    const handleLogout = () => {
        logout();
        // Navigation is handled in the logout function
    };

    // Check if current route is active
    const isActiveRoute = (path) => {
        return location.pathname === path;
    };

    // Get active link classes
    const getNavLinkClasses = (path) => {
        const baseClasses = "mx-2 nav-link-custom";
        const activeClasses = "active-nav-link";
        return isActiveRoute(path) ? `${baseClasses} ${activeClasses}` : baseClasses;
    };

    // Add navigation handler for brand link - Fixed to prevent logout
    const handleBrandClick = (e) => {
        e.preventDefault();
        if (currentUser) {
            // If logged in, go to dashboard
            navigate('/dashboard');
        } else {
            // If not logged in, go to landing page
            navigate('/');
        }
    };

    // Smooth scroll handler
    const handleScrollToSection = (sectionId) => {
        const el = document.getElementById(sectionId);
        if (el) {
            el.scrollIntoView({ behavior: 'smooth' });
            setExpanded(false); // close mobile menu if open
        }
    };

    return (
        <>
            <motion.div
                initial={{ y: -100 }}
                animate={{ y: 0 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
            >
                <Navbar
                    expand="lg"
                    className="bg-white shadow-sm py-3"
                    expanded={expanded}
                    onToggle={setExpanded}
                >
                    <Container>
                        <Navbar.Brand onClick={handleBrandClick} className="d-flex align-items-center" style={{ cursor: 'pointer' }}>
                            <motion.div
                                className="d-flex align-items-center"
                                whileHover={{ scale: 1.05 }}
                                transition={{ duration: 0.2 }}
                            >
                                <motion.div
                                    className="bg-gradient-primary rounded-circle d-flex align-items-center justify-content-center me-3"
                                    style={{
                                        width: '45px',
                                        height: '45px',
                                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                        boxShadow: '0 4px 15px rgba(102, 126, 234, 0.3)'
                                    }}
                                    animate={{
                                        rotate: [0, 5, -5, 0],
                                        scale: [1, 1.05, 1]
                                    }}
                                    transition={{
                                        duration: 3,
                                        repeat: Infinity,
                                        ease: "easeInOut"
                                    }}
                                >
                                    <FiCalendar className="text-white" size={20} />
                                </motion.div>
                                <div className="d-flex flex-column">
                                    <motion.span
                                        className="fw-bold text-primary mb-0"
                                        style={{
                                            fontSize: '24px',
                                            lineHeight: '1.2',
                                            fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, sans-serif',
                                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                            WebkitBackgroundClip: 'text',
                                            WebkitTextFillColor: 'transparent',
                                            backgroundClip: 'text'
                                        }}
                                    >
                                        meetslot
                                    </motion.span>
                                    <motion.span
                                        className="text-muted"
                                        style={{
                                            fontSize: '12px',
                                            fontWeight: '500',
                                            marginTop: '-2px',
                                            letterSpacing: '0.5px'
                                        }}
                                        initial={{ opacity: 0.6 }}
                                        animate={{ opacity: [0.6, 1, 0.6] }}
                                        transition={{
                                            duration: 2,
                                            repeat: Infinity,
                                            ease: "easeInOut"
                                        }}
                                    >
                                        .ai
                                    </motion.span>
                                </div>
                            </motion.div>
                        </Navbar.Brand>

                        <Navbar.Toggle aria-controls="basic-navbar-nav">
                            <FiMenu />
                        </Navbar.Toggle>

                        <Navbar.Collapse id="basic-navbar-nav">
                            <Nav className="ms-auto align-items-lg-center">
                                {currentUser ? (
                                    <>
                                        <Nav.Link
                                            as={Link}
                                            to="/dashboard"
                                            className={getNavLinkClasses('/dashboard')}
                                        >
                                            Dashboard
                                        </Nav.Link>
                                        <Nav.Link
                                            as={Link}
                                            to="/events"
                                            className={getNavLinkClasses('/events')}
                                        >
                                            Events
                                        </Nav.Link>
                                        <Nav.Link
                                            as={Link}
                                            to="/meetings"
                                            className={getNavLinkClasses('/meetings')}
                                        >
                                            Meetings
                                        </Nav.Link>

                                        {/* Schedule Button */}
                                        <Button
                                            variant="outline-success"
                                            className="btn-modern mx-2"
                                            onClick={() => setShowScheduleModal(true)}
                                        >
                                            <FiCalendar className="me-1" />
                                            Schedule
                                        </Button>

                                        {/* Notifications Dropdown with REST API */}
                                        <Dropdown className="mx-2">
                                            <Dropdown.Toggle
                                                variant="link"
                                                className="text-dark text-decoration-none position-relative p-2"
                                            >
                                                <FiBell size={20} />
                                            </Dropdown.Toggle>
                                            <Dropdown.Menu align="end" style={{ width: '350px', maxHeight: '400px', overflowY: 'auto' }}>
                                                <div className="d-flex justify-content-between align-items-center px-3 py-2 border-bottom">
                                                    <h6 className="mb-0">Notifications</h6>
                                                    <div className="d-flex gap-2">
                                                        <Button
                                                            variant="link"
                                                            size="sm"
                                                            className="text-secondary p-0"
                                                            onClick={loadNotifications}
                                                            disabled={notificationLoading}
                                                        >
                                                            {notificationLoading ? (
                                                                <div className="spinner-border spinner-border-sm" role="status"></div>
                                                            ) : (
                                                                'Refresh'
                                                            )}
                                                        </Button>
                                                        {/* Removed unreadCount check */}
                                                    </div>
                                                </div>

                                                {notificationLoading && notifications.length === 0 ? (
                                                    <div className="text-center py-3">
                                                        <div className="spinner-border spinner-border-sm" role="status"></div>
                                                        <p className="mt-2 text-muted small">Loading notifications...</p>
                                                    </div>
                                                ) : notifications.length === 0 ? (
                                                    <div className="text-center py-4 text-muted">
                                                        <FiBell size={32} className="mb-2 opacity-50" />
                                                        <p className="mb-0">No notifications yet</p>
                                                    </div>
                                                ) : (
                                                    notifications.map((notification) => (
                                                        <Dropdown.Item
                                                            key={notification.id}
                                                            className={`py-3 border-bottom ${!notification.isRead ? 'bg-light' : ''}`}
                                                            onClick={() => {
                                                                if (!notification.isRead) {
                                                                    markAsRead(notification.id);
                                                                }
                                                                // Handle notification click
                                                                if (notification.type === 'meeting_created') {
                                                                    navigate('/meetings');
                                                                }
                                                            }}
                                                        >
                                                            <div className="d-flex justify-content-between align-items-start">
                                                                <div className="flex-grow-1">
                                                                    <h6 className={`mb-1 ${!notification.isRead ? 'fw-bold' : ''}`}>
                                                                        {notification.title}
                                                                    </h6>
                                                                    <p className="mb-1 text-muted small">
                                                                        {notification.message}
                                                                    </p>
                                                                    <small className="text-muted">
                                                                        {new Date(notification.createdAt).toLocaleString()}
                                                                    </small>
                                                                </div>
                                                                {!notification.isRead && (
                                                                    <div className="bg-primary rounded-circle ms-2"
                                                                        style={{ width: '8px', height: '8px', marginTop: '4px' }}>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </Dropdown.Item>
                                                    ))
                                                )}

                                                <Dropdown.Item className="text-center py-2">
                                                    <Button
                                                        variant="link"
                                                        size="sm"
                                                        onClick={() => navigate('/notifications')}
                                                        className="text-decoration-none"
                                                    >
                                                        View All Notifications
                                                    </Button>
                                                </Dropdown.Item>
                                            </Dropdown.Menu>
                                        </Dropdown>

                                        {/* Enhanced User Dropdown */}
                                        <Dropdown className="mx-2">
                                            <Dropdown.Toggle
                                                variant="link"
                                                className="text-dark text-decoration-none user-dropdown-toggle p-2 rounded-circle"
                                                style={{
                                                    transition: 'all 0.2s ease',
                                                    border: '2px solid transparent'
                                                }}
                                            >
                                                <div
                                                    className="d-flex align-items-center justify-content-center"
                                                    style={{
                                                        width: '36px',
                                                        height: '36px',
                                                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                                        borderRadius: '50%',
                                                        color: 'white'
                                                    }}
                                                >
                                                    <FiUser size={18} />
                                                </div>
                                            </Dropdown.Toggle>
                                            <Dropdown.Menu
                                                align="end"
                                                className="user-dropdown-menu shadow-lg border-0"
                                                style={{
                                                    borderRadius: '12px',
                                                    padding: '8px',
                                                    minWidth: '220px',
                                                    marginTop: '8px'
                                                }}
                                            >
                                                <div className="px-3 py-2 border-bottom">
                                                    <small className="text-muted">Signed in as</small>
                                                    <div className="fw-semibold text-truncate">
                                                        {currentUser?.email || 'user@example.com'}
                                                    </div>
                                                </div>
                                                <Dropdown.Item
                                                    as={Link}
                                                    to="/profile"
                                                    className="user-dropdown-item d-flex align-items-center py-2"
                                                >
                                                    <div
                                                        className="me-3 d-flex align-items-center justify-content-center"
                                                        style={{
                                                            width: '32px',
                                                            height: '32px',
                                                            backgroundColor: 'rgba(102, 126, 234, 0.1)',
                                                            borderRadius: '8px',
                                                            color: '#667eea'
                                                        }}
                                                    >
                                                        <FiUser size={16} />
                                                    </div>
                                                    <div>
                                                        <div className="fw-medium">Profile</div>
                                                        <small className="text-muted">Manage your account settings</small>
                                                    </div>
                                                </Dropdown.Item>
                                                <Dropdown.Item
                                                    as={Link}
                                                    to="/settings"
                                                    className="user-dropdown-item d-flex align-items-center py-2"
                                                >
                                                    <div
                                                        className="me-3 d-flex align-items-center justify-content-center"
                                                        style={{
                                                            width: '32px',
                                                            height: '32px',
                                                            backgroundColor: 'rgba(108, 117, 125, 0.1)',
                                                            borderRadius: '8px',
                                                            color: '#6c757d'
                                                        }}
                                                    >
                                                        <FiSettings size={16} />
                                                    </div>
                                                    <div>
                                                        <div className="fw-medium">Settings</div>
                                                        <small className="text-muted">Preferences & integrations</small>
                                                    </div>
                                                </Dropdown.Item>
                                                <Dropdown.Divider className="my-2" />
                                                <Dropdown.Item
                                                    onClick={handleLogout}
                                                    className="user-dropdown-item d-flex align-items-center py-2 text-danger"
                                                >
                                                    <div
                                                        className="me-3 d-flex align-items-center justify-content-center"
                                                        style={{
                                                            width: '32px',
                                                            height: '32px',
                                                            backgroundColor: 'rgba(220, 53, 69, 0.1)',
                                                            borderRadius: '8px',
                                                            color: '#dc3545'
                                                        }}
                                                    >
                                                        <FiLogOut size={16} />
                                                    </div>
                                                    <div>
                                                        <div className="fw-medium">Sign out</div>
                                                        <small style={{ color: 'rgba(220, 53, 69, 0.7)' }}>End your current session</small>
                                                    </div>
                                                </Dropdown.Item>
                                            </Dropdown.Menu>
                                        </Dropdown>

                                        <Button
                                            variant="primary"
                                            className="btn-modern ms-3"
                                            as={Link}
                                            to="/book/demo"
                                        >
                                            Book a Meeting
                                        </Button>
                                    </>
                                ) : (
                                    <>
                                        {/* Show login/signup buttons when not authenticated */}
                                        <Nav.Link as="span" className="mx-2" onClick={() => handleScrollToSection('features')}>Features</Nav.Link>
                                        <Nav.Link as="span" className="mx-2" onClick={() => handleScrollToSection('pricing')}>Pricing</Nav.Link>
                                        <Nav.Link as="span" className="mx-2" onClick={() => handleScrollToSection('contact')}>Contact</Nav.Link>

                                        <div className="d-flex gap-2 ms-3">
                                            <Button
                                                variant="outline-primary"
                                                onClick={() => navigate('/login')}
                                                className="px-3"
                                            >
                                                <FiUser className="me-2" />
                                                Login
                                            </Button>
                                            <Button
                                                variant="primary"
                                                onClick={() => navigate('/signup')}
                                                className="px-3"
                                            >
                                                Sign Up Free
                                            </Button>
                                        </div>
                                    </>
                                )}
                            </Nav>
                        </Navbar.Collapse>
                    </Container>
                </Navbar>
            </motion.div>

            {/* Schedule Modal - only show when authenticated */}
            {currentUser && (
                <Modal show={showScheduleModal} onHide={() => setShowScheduleModal(false)} centered size="lg">
                    <Modal.Header closeButton>
                        <Modal.Title>Create New Meetings</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        {scheduleError && (
                            <div className="alert alert-danger" role="alert">
                                {scheduleError}
                            </div>
                        )}

                        <Form onSubmit={handleScheduleSubmit}>
                            <Form.Group className="mb-3">
                                <Form.Label>Meeting Type Name *</Form.Label>
                                <Form.Control
                                    type="text"
                                    placeholder="e.g., 30 Minute Meeting"
                                    value={scheduleForm.name}
                                    onChange={(e) => setScheduleForm({ ...scheduleForm, name: e.target.value })}
                                    className="form-control-modern"
                                    required
                                    disabled={scheduleLoading}
                                />
                            </Form.Group>

                            <Form.Group className="mb-3">
                                <Form.Label>Description</Form.Label>
                                <Form.Control
                                    as="textarea"
                                    rows={3}
                                    placeholder="Describe what this meeting is for..."
                                    value={scheduleForm.description}
                                    onChange={(e) => setScheduleForm({ ...scheduleForm, description: e.target.value })}
                                    className="form-control-modern"
                                    disabled={scheduleLoading}
                                />
                            </Form.Group>

                            {/* Add Date Field */}
                            <Form.Group className="mb-3">
                                <Form.Label>Available Date *</Form.Label>
                                <Form.Control
                                    type="date"
                                    value={scheduleForm.date}
                                    onChange={(e) => {
                                        const dateValue = e.target.value;
                                        console.log('Date input value:', dateValue); // Debug log
                                        setScheduleForm({ ...scheduleForm, date: dateValue });
                                    }}
                                    className="form-control-modern"
                                    min={new Date().toISOString().split('T')[0]} // Prevent past dates
                                    required
                                    disabled={scheduleLoading}
                                />
                                <Form.Text className="text-muted">
                                    Select when this meeting type should be available for booking
                                </Form.Text>
                            </Form.Group>

                            <div className="row">
                                <div className="col-md-6">
                                    <Form.Group className="mb-3">
                                        <Form.Label>Duration *</Form.Label>
                                        <Form.Select
                                            value={scheduleForm.duration}
                                            onChange={(e) => setScheduleForm({ ...scheduleForm, duration: parseInt(e.target.value) })}
                                            className="form-control-modern"
                                            disabled={scheduleLoading}
                                            required
                                        >
                                            <option value={15}>15 minutes</option>
                                            <option value={30}>30 minutes</option>
                                            <option value={45}>45 minutes</option>
                                            <option value={60}>1 hour</option>
                                            <option value={90}>1.5 hours</option>
                                            <option value={120}>2 hours</option>
                                        </Form.Select>
                                    </Form.Group>
                                </div>
                                <div className="col-md-6">
                                    <Form.Group className="mb-3">
                                        <Form.Label>Color Theme</Form.Label>
                                        <div className="d-flex align-items-center">
                                            <Form.Control
                                                type="color"
                                                value={scheduleForm.color}
                                                onChange={(e) => setScheduleForm({ ...scheduleForm, color: e.target.value })}
                                                className="form-control-color me-2"
                                                style={{ width: '50px', height: '38px' }}
                                                disabled={scheduleLoading}
                                            />
                                            <small className="text-muted">{scheduleForm.color}</small>
                                        </div>
                                    </Form.Group>
                                </div>
                            </div>

                            <div className="row">
                                <div className="col-md-6">
                                    <Form.Group className="mb-3">
                                        <Form.Label>Buffer Time Before (minutes)</Form.Label>
                                        <Form.Control
                                            type="number"
                                            min="0"
                                            max="60"
                                            value={scheduleForm.settings.bufferTimeBefore}
                                            onChange={(e) => setScheduleForm({
                                                ...scheduleForm,
                                                settings: {
                                                    ...scheduleForm.settings,
                                                    bufferTimeBefore: parseInt(e.target.value) || 0
                                                }
                                            })}
                                            className="form-control-modern"
                                            disabled={scheduleLoading}
                                        />
                                    </Form.Group>
                                </div>
                                <div className="col-md-6">
                                    <Form.Group className="mb-3">
                                        <Form.Label>Buffer Time After (minutes)</Form.Label>
                                        <Form.Control
                                            type="number"
                                            min="0"
                                            max="60"
                                            value={scheduleForm.settings.bufferTimeAfter}
                                            onChange={(e) => setScheduleForm({
                                                ...scheduleForm,
                                                settings: {
                                                    ...scheduleForm.settings,
                                                    bufferTimeAfter: parseInt(e.target.value) || 0
                                                }
                                            })}
                                            className="form-control-modern"
                                            disabled={scheduleLoading}
                                        />
                                    </Form.Group>
                                </div>
                            </div>

                            <Form.Group className="mb-3">
                                <Form.Label>Max Advance Booking (days)</Form.Label>
                                <Form.Control
                                    type="number"
                                    min="1"
                                    max="365"
                                    value={scheduleForm.settings.maxAdvanceBooking}
                                    onChange={(e) => setScheduleForm({
                                        ...scheduleForm,
                                        settings: {
                                            ...scheduleForm.settings,
                                            maxAdvanceBooking: parseInt(e.target.value) || 30
                                        }
                                    })}
                                    className="form-control-modern"
                                    disabled={scheduleLoading}
                                />
                            </Form.Group>

                            <div className="mb-4">
                                <Form.Check
                                    type="checkbox"
                                    id="allowRescheduling"
                                    label="Allow attendees to reschedule"
                                    checked={scheduleForm.settings.allowRescheduling}
                                    onChange={(e) => setScheduleForm({
                                        ...scheduleForm,
                                        settings: {
                                            ...scheduleForm.settings,
                                            allowRescheduling: e.target.checked
                                        }
                                    })}
                                    className="mb-2"
                                    disabled={scheduleLoading}
                                />
                                <Form.Check
                                    type="checkbox"
                                    id="allowCancellation"
                                    label="Allow attendees to cancel"
                                    checked={scheduleForm.settings.allowCancellation}
                                    onChange={(e) => setScheduleForm({
                                        ...scheduleForm,
                                        settings: {
                                            ...scheduleForm.settings,
                                            allowCancellation: e.target.checked
                                        }
                                    })}
                                    className="mb-2"
                                    disabled={scheduleLoading}
                                />
                                <Form.Check
                                    type="checkbox"
                                    id="requireApproval"
                                    label="Require approval before booking"
                                    checked={scheduleForm.settings.requireApproval}
                                    onChange={(e) => setScheduleForm({
                                        ...scheduleForm,
                                        settings: {
                                            ...scheduleForm.settings,
                                            requireApproval: e.target.checked
                                        }
                                    })}
                                    disabled={scheduleLoading}
                                />
                            </div>

                            <div className="d-flex justify-content-end gap-2">
                                <Button
                                    variant="outline-secondary"
                                    onClick={() => setShowScheduleModal(false)}
                                    disabled={scheduleLoading}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    type="submit"
                                    variant="primary"
                                    className="btn-modern"
                                    disabled={scheduleLoading}
                                >
                                    {scheduleLoading ? (
                                        <>
                                            <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                            Creating...
                                        </>
                                    ) : (
                                        'Create Meeting Type'
                                    )}
                                </Button>
                            </div>
                        </Form>
                    </Modal.Body>
                </Modal>
            )}

            {/* Custom Styles for Enhanced Logo */}
            <style jsx>{`
                .bg-gradient-primary {
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%) !important;
                }
                
                @keyframes logoGlow {
                    0%, 100% { 
                        box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
                    }
                    50% { 
                        box-shadow: 0 4px 25px rgba(102, 126, 234, 0.5);
                    }
                }
                
                .navbar-brand:hover .bg-gradient-primary {
                    animation: logoGlow 2s ease-in-out infinite;
                }
                
                @media (max-width: 768px) {
                    .navbar-brand span:first-of-type {
                        font-size: 20px !important;
                    }
                    .navbar-brand .bg-gradient-primary {
                        width: 35px !important;
                        height: 35px !important;
                    }
                }
            `}</style>

            {/* Add custom styles for active navigation */}
            <style jsx global>{`
                .nav-link-custom {
                    position: relative;
                    transition: all 0.3s ease;
                    color: #6c757d !important;
                    font-weight: 500;
                    padding: 8px 16px !important;
                    border-radius: 8px;
                    margin: 0 4px;
                }

                .nav-link-custom:hover {
                    color: #0d6efd !important;
                    background-color: rgba(13, 110, 253, 0.1);
                    transform: translateY(-1px);
                }

                .active-nav-link {
                    color: #0d6efd !important;
                    background-color: rgba(13, 110, 253, 0.1);
                    font-weight: 600;
                    box-shadow: 0 2px 8px rgba(13, 110, 253, 0.15);
                }

                /* Enhanced User Dropdown Styling */
                .user-dropdown-toggle:hover {
                    border-color: rgba(102, 126, 234, 0.3) !important;
                    box-shadow: 0 4px 12px rgba(102, 126, 234, 0.15);
                    transform: translateY(-1px);
                }

                .user-dropdown-menu {
                    background: rgba(255, 255, 255, 0.98);
                    backdrop-filter: blur(10px);
                    border: 1px solid rgba(0, 0, 0, 0.08);
                }

                .user-dropdown-item {
                    border-radius: 8px;
                    margin: 2px 0;
                    transition: all 0.2s ease;
                    padding: 8px 12px !important;
                }

                .user-dropdown-item:hover {
                    background-color: rgba(102, 126, 234, 0.05);
                    transform: translateX(4px);
                }

                .user-dropdown-item.text-danger:hover {
                    background-color: rgba(220, 53, 69, 0.05);
                    color: #dc3545 !important;
                }

                /* Dark mode support */
                [data-theme="dark"] .user-dropdown-menu {
                    background: rgba(45, 55, 72, 0.98);
                    border-color: rgba(255, 255, 255, 0.1);
                    color: #e2e8f0;
                }

                [data-theme="dark"] .user-dropdown-item:hover {
                    background-color: rgba(66, 153, 225, 0.1);
                    color: #e2e8f0 !important;
                }

                [data-theme="dark"] .user-dropdown-item.text-danger:hover {
                    background-color: rgba(220, 53, 69, 0.1);
                    color: #fc8181 !important;
                }

                /* Additional styling for mobile */
                @media (max-width: 991.98px) {
                    .nav-link-custom {
                        margin: 2px 0;
                        padding: 12px 16px !important;
                    }
                    
                    .active-nav-link {
                        border-left: 3px solid #0d6efd;
                        padding-left: 13px !important;
                    }

                    .user-dropdown-menu {
                        margin-top: 4px;
                        min-width: 200px;
                    }
                }

                /* Animation for dropdown items */
                @keyframes slideInDown {
                    from {
                        opacity: 0;
                        transform: translateY(-10px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }

                .user-dropdown-menu .dropdown-item {
                    animation: slideInDown 0.2s ease forwards;
                }

                .user-dropdown-menu .dropdown-item:nth-child(2) {
                    animation-delay: 0.05s;
                }

                .user-dropdown-menu .dropdown-item:nth-child(3) {
                    animation-delay: 0.1s;
                }

                .user-dropdown-menu .dropdown-item:nth-child(4) {
                    animation-delay: 0.15s;
                }
            `}</style>
        </>
    );
};

export default CustomNavbar;
