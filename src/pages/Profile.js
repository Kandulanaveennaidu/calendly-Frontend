import React, { useState, useEffect, useCallback, useContext } from 'react';
import { Container, Row, Col, Card, Form, Button, Alert, Spinner, Badge, Modal } from 'react-bootstrap';
import { motion } from 'framer-motion';
import { FiUser, FiMail, FiPhone, FiMapPin, FiEdit3, FiSave, FiX, FiCamera, FiBarChart, FiCalendar, FiClock, FiUsers, FiSettings } from 'react-icons/fi';
import { AuthContext } from '../context/AuthContext';
import profileService from '../services/profileService';
import integrationsService from '../services/integrationsService';
import IntegrationCard from '../components/integrations/IntegrationCard';
import '../styles/integrations.css';

const Profile = () => {
    const { user, login } = useContext(AuthContext);
    const [profileData, setProfileData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        bio: '',
        phone: '',
        timezone: '',
        avatar: ''
    });
    const [originalData, setOriginalData] = useState({});
    const [errors, setErrors] = useState({});
    const [isEditing, setIsEditing] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [userStats, setUserStats] = useState(null);
    const [showAvatarModal, setShowAvatarModal] = useState(false);
    const [avatarUrl, setAvatarUrl] = useState('');
    const [integrations, setIntegrations] = useState([]);
    const [integrationsLoading, setIntegrationsLoading] = useState(false);

    // Timezone options
    const timezoneOptions = [
        'America/New_York',
        'America/Chicago',
        'America/Denver',
        'America/Los_Angeles',
        'Europe/London',
        'Europe/Paris',
        'Europe/Berlin',
        'Asia/Tokyo',
        'Asia/Shanghai',
        'Asia/Kolkata',
        'Australia/Sydney'
    ];

    // Load integrations data
    const loadIntegrations = useCallback(async () => {
        setIntegrationsLoading(true);
        try {
            const response = await integrationsService.getIntegrations();
            if (response.success) {
                setIntegrations(response.data);
            } else {
                // Fallback to default integrations
                setIntegrations(integrationsService.getDefaultIntegrations());
            }
        } catch (error) {
            console.error('Error loading integrations:', error);
            // Fallback to default integrations
            setIntegrations(integrationsService.getDefaultIntegrations());
        } finally {
            setIntegrationsLoading(false);
        }
    }, []);

    const loadProfileData = useCallback(async () => {
        try {
            setIsLoading(true);
            const response = await profileService.getProfile();

            const data = {
                firstName: response.user?.firstName || user?.firstName || '',
                lastName: response.user?.lastName || user?.lastName || '',
                email: response.user?.email || user?.email || '',
                bio: response.user?.bio || '',
                phone: response.user?.phone || '',
                timezone: response.user?.timezone || 'America/New_York',
                avatar: response.user?.avatar || user?.avatar || 'https://i.pravatar.cc/150?img=68'
            };

            setProfileData(data);
            setOriginalData(data);
        } catch (error) {
            console.error('Failed to load profile:', error);
            setError('Failed to load profile data. Please try again.');
        } finally {
            setIsLoading(false);
        }
    }, [user]);

    const loadUserStats = useCallback(async () => {
        try {
            const response = await profileService.getUserStats();
            setUserStats(response.stats || response);
        } catch (error) {
            console.error('Failed to load user stats:', error);
        }
    }, []);

    const validateForm = useCallback(() => {
        const newErrors = {};

        if (!profileData.firstName.trim()) {
            newErrors.firstName = "First name is required";
        }
        if (!profileData.lastName.trim()) {
            newErrors.lastName = "Last name is required";
        }
        if (!profileData.email.trim()) {
            newErrors.email = "Email is required";
        } else if (!/\S+@\S+\.\S+/.test(profileData.email)) {
            newErrors.email = "Please enter a valid email address";
        }
        if (profileData.phone && !/^\+?[\d\s\-()]{10,15}$/.test(profileData.phone)) {
            newErrors.phone = "Please enter a valid phone number";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    }, [profileData]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setProfileData({
            ...profileData,
            [name]: value
        });

        // Clear error when user starts typing
        if (errors[name]) {
            setErrors({
                ...errors,
                [name]: ''
            });
        }
    };

    const handleEdit = () => {
        setIsEditing(true);
        setError('');
        setSuccess('');
    };

    const handleCancel = () => {
        setProfileData(originalData);
        setIsEditing(false);
        setErrors({});
        setError('');
        setSuccess('');
    };

    const handleSave = useCallback(async () => {
        setError('');
        setSuccess('');

        if (validateForm()) {
            setIsSaving(true);

            try {
                const updateData = {
                    firstName: profileData.firstName.trim(),
                    lastName: profileData.lastName.trim(),
                    bio: profileData.bio.trim(),
                    phone: profileData.phone.trim(),
                    timezone: profileData.timezone
                };

                const response = await profileService.updateProfile(updateData);

                console.log('Profile updated successfully:', response);

                // Update local data
                const updatedData = {
                    ...profileData,
                    ...updateData
                };
                setProfileData(updatedData);
                setOriginalData(updatedData);

                // Update auth context
                const updatedUser = {
                    ...user,
                    firstName: updatedData.firstName,
                    lastName: updatedData.lastName,
                    name: `${updatedData.firstName} ${updatedData.lastName}`,
                    bio: updatedData.bio,
                    phone: updatedData.phone,
                    timezone: updatedData.timezone
                };

                localStorage.setItem('currentUser', JSON.stringify(updatedUser));
                login(updatedUser);

                setSuccess(response.message || 'Profile updated successfully!');
                setIsEditing(false);

                // Reload stats in case they changed
                loadUserStats();

            } catch (error) {
                console.error('Profile update error:', error);

                if (error.message.includes('Email already exists')) {
                    setError('This email is already in use by another account.');
                } else if (error.message.includes('validation')) {
                    setError('Please check your input and ensure all fields are properly filled.');
                } else if (error.message.includes('Network') || error.message.includes('fetch')) {
                    setError('Network error. Please check your connection and try again.');
                } else {
                    setError(error.message || 'Failed to update profile. Please try again.');
                }
            } finally {
                setIsSaving(false);
            }
        }
    }, [profileData, validateForm, user, login, loadUserStats]);

    const handleAvatarSubmit = useCallback(async () => {
        if (!avatarUrl.trim()) {
            setError('Please enter a valid avatar URL');
            return;
        }

        setIsUploadingAvatar(true);
        setError('');

        try {
            const response = await profileService.uploadAvatar(avatarUrl.trim());

            console.log('Avatar updated successfully:', response);

            // Update profile data
            const updatedData = {
                ...profileData,
                avatar: response.user?.avatar || avatarUrl
            };
            setProfileData(updatedData);
            setOriginalData(updatedData);

            // Update auth context
            const updatedUser = {
                ...user,
                avatar: updatedData.avatar
            };
            localStorage.setItem('currentUser', JSON.stringify(updatedUser));
            login(updatedUser);

            setSuccess(response.message || 'Avatar updated successfully!');
            setShowAvatarModal(false);
            setAvatarUrl('');

        } catch (error) {
            console.error('Avatar upload error:', error);
            setError(error.message || 'Failed to update avatar. Please try again.');
        } finally {
            setIsUploadingAvatar(false);
        }
    }, [avatarUrl, profileData, user, login]);

    // Integration handlers
    const handleConnectIntegration = useCallback(async (integrationType) => {
        setIntegrationsLoading(true);
        try {
            const response = await integrationsService.connectIntegration(integrationType);
            if (response.success) {
                setSuccess(`Successfully connected to ${integrationType}!`);
                loadIntegrations(); // Reload integrations
            } else {
                setError(response.error || `Failed to connect to ${integrationType}`);
            }
        } catch (error) {
            console.error(`Error connecting to ${integrationType}:`, error);
            setError(`Failed to connect to ${integrationType}. Please try again.`);
        } finally {
            setIntegrationsLoading(false);
        }
    }, [loadIntegrations]);

    const handleDisconnectIntegration = useCallback(async (integrationType) => {
        setIntegrationsLoading(true);
        try {
            const response = await integrationsService.disconnectIntegration(integrationType);
            if (response.success) {
                setSuccess(`Successfully disconnected from ${integrationType}!`);
                loadIntegrations(); // Reload integrations
            } else {
                setError(response.error || `Failed to disconnect from ${integrationType}`);
            }
        } catch (error) {
            console.error(`Error disconnecting from ${integrationType}:`, error);
            setError(`Failed to disconnect from ${integrationType}. Please try again.`);
        } finally {
            setIntegrationsLoading(false);
        }
    }, [loadIntegrations]);

    const handleConfigureIntegration = useCallback(async (integrationType, config) => {
        try {
            const response = await integrationsService.configureIntegration(integrationType, config);
            if (response.success) {
                setSuccess(`Successfully configured ${integrationType}!`);
                loadIntegrations(); // Reload integrations
            } else {
                setError(response.error || `Failed to configure ${integrationType}`);
            }
        } catch (error) {
            console.error(`Error configuring ${integrationType}:`, error);
            setError(`Failed to configure ${integrationType}. Please try again.`);
        }
    }, [loadIntegrations]);

    // Load profile data on component mount
    useEffect(() => {
        loadProfileData();
        loadUserStats();
        loadIntegrations();
    }, [loadProfileData, loadUserStats, loadIntegrations]);

    if (isLoading) {
        return (
            <Container className="py-5">
                <div className="text-center">
                    <Spinner animation="border" variant="primary" />
                    <p className="mt-2">Loading profile...</p>
                </div>
            </Container>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="py-5"
        >
            <Container>
                <Row>
                    <Col lg={4}>
                        {/* Profile Card */}
                        <Card className="card-modern shadow-sm mb-4">
                            <Card.Body className="text-center p-4">
                                <div className="position-relative d-inline-block mb-3">
                                    <img
                                        src={profileData.avatar}
                                        alt="Profile"
                                        className="rounded-circle"
                                        style={{ width: '120px', height: '120px', objectFit: 'cover' }}
                                        onError={(e) => {
                                            e.target.src = 'https://i.pravatar.cc/150?img=68';
                                        }}
                                    />
                                    <Button
                                        variant="primary"
                                        size="sm"
                                        className="position-absolute bottom-0 end-0 rounded-circle p-2"
                                        onClick={() => setShowAvatarModal(true)}
                                        style={{ width: '36px', height: '36px' }}
                                    >
                                        <FiCamera size={16} />
                                    </Button>
                                </div>
                                <h4 className="mb-1">{profileData.firstName} {profileData.lastName}</h4>
                                <p className="text-muted mb-2">{profileData.email}</p>
                                {profileData.bio && <p className="small text-muted mb-3">{profileData.bio}</p>}

                                {!isEditing ? (
                                    <Button variant="primary" onClick={handleEdit} className="btn-modern">
                                        <FiEdit3 className="me-2" />
                                        Edit Profile
                                    </Button>
                                ) : (
                                    <div className="d-flex gap-2 justify-content-center">
                                        <Button
                                            variant="success"
                                            onClick={handleSave}
                                            disabled={isSaving}
                                            className="btn-modern"
                                        >
                                            {isSaving ? (
                                                <>
                                                    <Spinner size="sm" className="me-2" />
                                                    Saving...
                                                </>
                                            ) : (
                                                <>
                                                    <FiSave className="me-2" />
                                                    Save
                                                </>
                                            )}
                                        </Button>
                                        <Button
                                            variant="outline-secondary"
                                            onClick={handleCancel}
                                            disabled={isSaving}
                                            className="btn-modern"
                                        >
                                            <FiX className="me-2" />
                                            Cancel
                                        </Button>
                                    </div>
                                )}
                            </Card.Body>
                        </Card>

                        {/* User Statistics */}
                        {userStats && (
                            <Card className="card-modern shadow-sm">
                                <Card.Body>
                                    <h5 className="mb-3">
                                        <FiBarChart className="me-2" />
                                        Statistics
                                    </h5>
                                    <div className="d-flex justify-content-between align-items-center mb-2">
                                        <span className="text-muted">
                                            <FiCalendar className="me-2" />
                                            Total Meetings
                                        </span>
                                        <Badge bg="primary">{userStats.totalMeetings || 0}</Badge>
                                    </div>
                                    <div className="d-flex justify-content-between align-items-center mb-2">
                                        <span className="text-muted">
                                            <FiClock className="me-2" />
                                            Hours Scheduled
                                        </span>
                                        <Badge bg="success">{userStats.totalHours || 0}</Badge>
                                    </div>
                                    <div className="d-flex justify-content-between align-items-center">
                                        <span className="text-muted">
                                            <FiUsers className="me-2" />
                                            Unique Attendees
                                        </span>
                                        <Badge bg="info">{userStats.uniqueAttendees || 0}</Badge>
                                    </div>
                                </Card.Body>
                            </Card>
                        )}
                    </Col>

                    <Col lg={8}>
                        {/* Profile Form */}
                        <Card className="card-modern shadow-sm">
                            <Card.Body className="p-4">
                                <h4 className="mb-4">Profile Information</h4>

                                {error && (
                                    <Alert variant="danger" className="mb-4">
                                        {error}
                                    </Alert>
                                )}

                                {success && (
                                    <Alert variant="success" className="mb-4">
                                        {success}
                                    </Alert>
                                )}

                                <Form>
                                    <Row>
                                        <Col md={6}>
                                            <Form.Group className="mb-4">
                                                <Form.Label>First Name</Form.Label>
                                                <div className="input-group">
                                                    <span className="input-group-text bg-light border-end-0">
                                                        <FiUser />
                                                    </span>
                                                    <Form.Control
                                                        type="text"
                                                        name="firstName"
                                                        value={profileData.firstName}
                                                        onChange={handleChange}
                                                        disabled={!isEditing}
                                                        isInvalid={!!errors.firstName}
                                                        className="border-start-0 form-control-modern"
                                                    />
                                                    <Form.Control.Feedback type="invalid">
                                                        {errors.firstName}
                                                    </Form.Control.Feedback>
                                                </div>
                                            </Form.Group>
                                        </Col>
                                        <Col md={6}>
                                            <Form.Group className="mb-4">
                                                <Form.Label>Last Name</Form.Label>
                                                <div className="input-group">
                                                    <span className="input-group-text bg-light border-end-0">
                                                        <FiUser />
                                                    </span>
                                                    <Form.Control
                                                        type="text"
                                                        name="lastName"
                                                        value={profileData.lastName}
                                                        onChange={handleChange}
                                                        disabled={!isEditing}
                                                        isInvalid={!!errors.lastName}
                                                        className="border-start-0 form-control-modern"
                                                    />
                                                    <Form.Control.Feedback type="invalid">
                                                        {errors.lastName}
                                                    </Form.Control.Feedback>
                                                </div>
                                            </Form.Group>
                                        </Col>
                                    </Row>

                                    <Form.Group className="mb-4">
                                        <Form.Label>Email Address</Form.Label>
                                        <div className="input-group">
                                            <span className="input-group-text bg-light border-end-0">
                                                <FiMail />
                                            </span>
                                            <Form.Control
                                                type="email"
                                                name="email"
                                                value={profileData.email}
                                                disabled={true} // Email usually can't be changed
                                                className="border-start-0 form-control-modern"
                                            />
                                        </div>
                                        <Form.Text className="text-muted">
                                            Email address cannot be changed here. Contact support if needed.
                                        </Form.Text>
                                    </Form.Group>

                                    <Form.Group className="mb-4">
                                        <Form.Label>Bio</Form.Label>
                                        <Form.Control
                                            as="textarea"
                                            rows={3}
                                            name="bio"
                                            placeholder="Tell us about yourself..."
                                            value={profileData.bio}
                                            onChange={handleChange}
                                            disabled={!isEditing}
                                            className="form-control-modern"
                                        />
                                    </Form.Group>

                                    <Row>
                                        <Col md={6}>
                                            <Form.Group className="mb-4">
                                                <Form.Label>Phone Number</Form.Label>
                                                <div className="input-group">
                                                    <span className="input-group-text bg-light border-end-0">
                                                        <FiPhone />
                                                    </span>
                                                    <Form.Control
                                                        type="tel"
                                                        name="phone"
                                                        placeholder="+1 (555) 123-4567"
                                                        value={profileData.phone}
                                                        onChange={handleChange}
                                                        disabled={!isEditing}
                                                        isInvalid={!!errors.phone}
                                                        className="border-start-0 form-control-modern"
                                                    />
                                                    <Form.Control.Feedback type="invalid">
                                                        {errors.phone}
                                                    </Form.Control.Feedback>
                                                </div>
                                            </Form.Group>
                                        </Col>
                                        <Col md={6}>
                                            <Form.Group className="mb-4">
                                                <Form.Label>Timezone</Form.Label>
                                                <div className="input-group">
                                                    <span className="input-group-text bg-light border-end-0">
                                                        <FiMapPin />
                                                    </span>
                                                    <Form.Select
                                                        name="timezone"
                                                        value={profileData.timezone}
                                                        onChange={handleChange}
                                                        disabled={!isEditing}
                                                        className="border-start-0 form-control-modern"
                                                    >
                                                        {timezoneOptions.map(tz => (
                                                            <option key={tz} value={tz}>{tz}</option>
                                                        ))}
                                                    </Form.Select>
                                                </div>
                                            </Form.Group>
                                        </Col>
                                    </Row>
                                </Form>
                            </Card.Body>
                        </Card>

                        {/* Integrations Section */}
                        <Card className="card-modern shadow-sm mt-4">
                            <Card.Body className="p-4">
                                <div className="d-flex align-items-center justify-content-between mb-4">
                                    <h4 className="mb-0">
                                        <FiSettings className="me-2" />
                                        Connected Integrations
                                    </h4>
                                    {integrationsLoading && (
                                        <Spinner size="sm" animation="border" variant="primary" />
                                    )}
                                </div>
                                <p className="text-muted mb-4">
                                    Connect your favorite tools to enhance your scheduling workflow.
                                </p>

                                <Row>
                                    {integrations.map((integration) => (
                                        <Col lg={6} key={integration.type} className="mb-4">
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
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>

                {/* Avatar Upload Modal */}
                <Modal show={showAvatarModal} onHide={() => setShowAvatarModal(false)} centered>
                    <Modal.Header closeButton>
                        <Modal.Title>Update Avatar</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <Form.Group className="mb-3">
                            <Form.Label>Avatar URL</Form.Label>
                            <Form.Control
                                type="url"
                                placeholder="https://example.com/avatar.jpg"
                                value={avatarUrl}
                                onChange={(e) => setAvatarUrl(e.target.value)}
                                className="form-control-modern"
                            />
                            <Form.Text className="text-muted">
                                Enter a direct link to your avatar image
                            </Form.Text>
                        </Form.Group>
                        {avatarUrl && (
                            <div className="text-center mb-3">
                                <img
                                    src={avatarUrl}
                                    alt="Preview"
                                    className="rounded-circle"
                                    style={{ width: '80px', height: '80px', objectFit: 'cover' }}
                                    onError={(e) => {
                                        e.target.style.display = 'none';
                                    }}
                                />
                            </div>
                        )}
                    </Modal.Body>
                    <Modal.Footer>
                        <Button
                            variant="secondary"
                            onClick={() => {
                                setShowAvatarModal(false);
                                setAvatarUrl('');
                            }}
                        >
                            Cancel
                        </Button>
                        <Button
                            variant="primary"
                            onClick={handleAvatarSubmit}
                            disabled={isUploadingAvatar || !avatarUrl.trim()}
                        >
                            {isUploadingAvatar ? (
                                <>
                                    <Spinner size="sm" className="me-2" />
                                    Updating...
                                </>
                            ) : (
                                'Update Avatar'
                            )}
                        </Button>
                    </Modal.Footer>
                </Modal>
            </Container>
        </motion.div>
    );
};

export default Profile;
