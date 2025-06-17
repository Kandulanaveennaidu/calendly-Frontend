import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Form, Button, Alert, Spinner, Badge } from 'react-bootstrap';
import { motion } from 'framer-motion';
import { FiSave, FiArrowLeft, FiClock, FiSettings, FiGrid } from 'react-icons/fi';
import { useNavigate, useParams } from 'react-router-dom';
import meetingService from '../services/meetingService';

const EditMeetingType = () => {
    const navigate = useNavigate();
    const { id } = useParams();

    // Form States
    const [formData, setFormData] = useState({
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

    // UI States
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [originalData, setOriginalData] = useState(null);

    // Load meeting type data
    useEffect(() => {
        loadMeetingType();
    }, [id]);

    const loadMeetingType = async () => {
        try {
            setLoading(true);
            const response = await meetingService.getMeetingTypeById(id);

            if (response.success && response.data) {
                const meetingType = response.data;
                const loadedData = {
                    name: meetingType.name || '',
                    description: meetingType.description || '',
                    duration: meetingType.duration || 30,
                    color: meetingType.color || '#006bff',
                    isActive: meetingType.isActive !== undefined ? meetingType.isActive : true,
                    settings: {
                        bufferTimeBefore: meetingType.settings?.bufferTimeBefore || 5,
                        bufferTimeAfter: meetingType.settings?.bufferTimeAfter || 5,
                        allowRescheduling: meetingType.settings?.allowRescheduling !== undefined ? meetingType.settings.allowRescheduling : true,
                        allowCancellation: meetingType.settings?.allowCancellation !== undefined ? meetingType.settings.allowCancellation : true,
                        requireApproval: meetingType.settings?.requireApproval || false,
                        maxAdvanceBooking: meetingType.settings?.maxAdvanceBooking || 30
                    }
                };
                setFormData(loadedData);
                setOriginalData(loadedData);
            } else {
                throw new Error('Meeting type not found');
            }
        } catch (error) {
            console.error('Failed to load meeting type:', error);
            setError(error.message || 'Failed to load meeting type');
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (field, value) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleSettingsChange = (field, value) => {
        setFormData(prev => ({
            ...prev,
            settings: {
                ...prev.settings,
                [field]: value
            }
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        try {
            setSaving(true);
            const response = await meetingService.updateMeetingType(id, formData);

            if (response.success) {
                setSuccess('Meeting type updated successfully!');
                setOriginalData(formData);

                // Redirect back to meetings page after a short delay
                setTimeout(() => {
                    navigate('/meetings');
                }, 1500);
            } else {
                throw new Error(response.message || 'Failed to update meeting type');
            }
        } catch (error) {
            console.error('Failed to update meeting type:', error);
            setError(error.message || 'Failed to update meeting type');
        } finally {
            setSaving(false);
        }
    };

    const hasChanges = () => {
        return JSON.stringify(formData) !== JSON.stringify(originalData);
    };

    const predefinedColors = [
        '#006bff', '#28a745', '#dc3545', '#ffc107', '#17a2b8',
        '#6f42c1', '#e83e8c', '#fd7e14', '#20c997', '#6c757d'
    ];

    const durationOptions = [
        { value: 15, label: '15 minutes' },
        { value: 30, label: '30 minutes' },
        { value: 45, label: '45 minutes' },
        { value: 60, label: '1 hour' },
        { value: 90, label: '1.5 hours' },
        { value: 120, label: '2 hours' }
    ];

    if (loading) {
        return (
            <Container className="py-5">
                <div className="text-center">
                    <Spinner animation="border" variant="primary" />
                    <p className="mt-2 text-muted">Loading meeting type...</p>
                </div>
            </Container>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="page-transition py-5"
        >
            <Container>
                {/* Header */}
                <Row className="mb-4">
                    <Col>
                        <div className="d-flex align-items-center justify-content-between">
                            <div className="d-flex align-items-center">
                                <Button
                                    variant="outline-secondary"
                                    onClick={() => navigate('/meetings')}
                                    className="me-3"
                                >
                                    <FiArrowLeft className="me-2" />
                                    Back to Meetings
                                </Button>
                                <div>
                                    <h1 className="h2 fw-bold mb-1">Edit Meeting Type</h1>
                                    <p className="text-muted mb-0">Modify your meeting type settings</p>
                                </div>
                            </div>
                            <Badge bg={formData.isActive ? 'success' : 'secondary'} className="px-3 py-2">
                                {formData.isActive ? 'Active' : 'Inactive'}
                            </Badge>
                        </div>
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

                <Form onSubmit={handleSubmit}>
                    <Row>
                        <Col lg={8}>
                            {/* Basic Information */}
                            <Card className="card-modern mb-4">
                                <Card.Header>
                                    <h5 className="mb-0">
                                        <FiSettings className="me-2" />
                                        Basic Information
                                    </h5>
                                </Card.Header>
                                <Card.Body>
                                    <Row>
                                        <Col md={12} className="mb-3">
                                            <Form.Group>
                                                <Form.Label>Meeting Type Name *</Form.Label>
                                                <Form.Control
                                                    type="text"
                                                    value={formData.name}
                                                    onChange={(e) => handleInputChange('name', e.target.value)}
                                                    placeholder="e.g., 30 Minute Meeting"
                                                    required
                                                    className="form-control-modern"
                                                />
                                            </Form.Group>
                                        </Col>

                                        <Col md={12} className="mb-3">
                                            <Form.Group>
                                                <Form.Label>Description</Form.Label>
                                                <Form.Control
                                                    as="textarea"
                                                    rows={4}
                                                    value={formData.description}
                                                    onChange={(e) => handleInputChange('description', e.target.value)}
                                                    placeholder="Describe what this meeting is for..."
                                                    className="form-control-modern"
                                                />
                                            </Form.Group>
                                        </Col>

                                        <Col md={6} className="mb-3">
                                            <Form.Group>
                                                <Form.Label>
                                                    <FiClock className="me-2" />
                                                    Duration *
                                                </Form.Label>
                                                <Form.Select
                                                    value={formData.duration}
                                                    onChange={(e) => handleInputChange('duration', parseInt(e.target.value))}
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

                                        <Col md={6} className="mb-3">
                                            <Form.Group>
                                                <Form.Label>Status</Form.Label>
                                                <Form.Select
                                                    value={formData.isActive}
                                                    onChange={(e) => handleInputChange('isActive', e.target.value === 'true')}
                                                    className="form-control-modern"
                                                >
                                                    <option value={true}>Active</option>
                                                    <option value={false}>Inactive</option>
                                                </Form.Select>
                                            </Form.Group>
                                        </Col>
                                    </Row>
                                </Card.Body>
                            </Card>

                            {/* Advanced Settings */}
                            <Card className="card-modern mb-4">
                                <Card.Header>
                                    <h5 className="mb-0">
                                        <FiSettings className="me-2" />
                                        Advanced Settings
                                    </h5>
                                </Card.Header>
                                <Card.Body>
                                    <Row>
                                        <Col md={6} className="mb-3">
                                            <Form.Group>
                                                <Form.Label>Buffer Time Before (minutes)</Form.Label>
                                                <Form.Control
                                                    type="number"
                                                    min="0"
                                                    max="60"
                                                    value={formData.settings.bufferTimeBefore}
                                                    onChange={(e) => handleSettingsChange('bufferTimeBefore', parseInt(e.target.value))}
                                                    className="form-control-modern"
                                                />
                                                <Form.Text className="text-muted">
                                                    Time to block before the meeting
                                                </Form.Text>
                                            </Form.Group>
                                        </Col>

                                        <Col md={6} className="mb-3">
                                            <Form.Group>
                                                <Form.Label>Buffer Time After (minutes)</Form.Label>
                                                <Form.Control
                                                    type="number"
                                                    min="0"
                                                    max="60"
                                                    value={formData.settings.bufferTimeAfter}
                                                    onChange={(e) => handleSettingsChange('bufferTimeAfter', parseInt(e.target.value))}
                                                    className="form-control-modern"
                                                />
                                                <Form.Text className="text-muted">
                                                    Time to block after the meeting
                                                </Form.Text>
                                            </Form.Group>
                                        </Col>

                                        <Col md={6} className="mb-3">
                                            <Form.Group>
                                                <Form.Label>Max Advance Booking (days)</Form.Label>
                                                <Form.Control
                                                    type="number"
                                                    min="1"
                                                    max="365"
                                                    value={formData.settings.maxAdvanceBooking}
                                                    onChange={(e) => handleSettingsChange('maxAdvanceBooking', parseInt(e.target.value))}
                                                    className="form-control-modern"
                                                />
                                                <Form.Text className="text-muted">
                                                    How far in advance can people book
                                                </Form.Text>
                                            </Form.Group>
                                        </Col>

                                        <Col md={12}>
                                            <div className="mb-3">
                                                <Form.Check
                                                    type="checkbox"
                                                    id="allowRescheduling"
                                                    label="Allow attendees to reschedule"
                                                    checked={formData.settings.allowRescheduling}
                                                    onChange={(e) => handleSettingsChange('allowRescheduling', e.target.checked)}
                                                    className="mb-2"
                                                />
                                                <Form.Check
                                                    type="checkbox"
                                                    id="allowCancellation"
                                                    label="Allow attendees to cancel"
                                                    checked={formData.settings.allowCancellation}
                                                    onChange={(e) => handleSettingsChange('allowCancellation', e.target.checked)}
                                                    className="mb-2"
                                                />
                                                <Form.Check
                                                    type="checkbox"
                                                    id="requireApproval"
                                                    label="Require approval before booking"
                                                    checked={formData.settings.requireApproval}
                                                    onChange={(e) => handleSettingsChange('requireApproval', e.target.checked)}
                                                />
                                            </div>
                                        </Col>
                                    </Row>
                                </Card.Body>
                            </Card>
                        </Col>

                        <Col lg={4}>
                            {/* Color Theme */}
                            <Card className="card-modern mb-4">
                                <Card.Header>
                                    <h5 className="mb-0">
                                        <FiGrid className="me-2" />
                                        Color Theme
                                    </h5>
                                </Card.Header>
                                <Card.Body>
                                    <div className="mb-3">
                                        <Form.Label>Selected Color</Form.Label>
                                        <div className="d-flex align-items-center mb-3">
                                            <div
                                                className="rounded me-3"
                                                style={{
                                                    width: '50px',
                                                    height: '50px',
                                                    backgroundColor: formData.color,
                                                    border: '2px solid #dee2e6'
                                                }}
                                            ></div>
                                            <div>
                                                <Form.Control
                                                    type="color"
                                                    value={formData.color}
                                                    onChange={(e) => handleInputChange('color', e.target.value)}
                                                    className="form-control-color"
                                                />
                                                <Form.Text className="text-muted">
                                                    {formData.color}
                                                </Form.Text>
                                            </div>
                                        </div>
                                    </div>

                                    <div>
                                        <Form.Label>Quick Colors</Form.Label>
                                        <div className="d-flex flex-wrap gap-2">
                                            {predefinedColors.map(color => (
                                                <button
                                                    key={color}
                                                    type="button"
                                                    className={`btn p-0 border-0 rounded ${formData.color === color ? 'ring' : ''}`}
                                                    style={{
                                                        width: '30px',
                                                        height: '30px',
                                                        backgroundColor: color,
                                                        border: formData.color === color ? '3px solid #007bff' : '2px solid #dee2e6'
                                                    }}
                                                    onClick={() => handleInputChange('color', color)}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                </Card.Body>
                            </Card>

                            {/* Save Actions */}
                            <Card className="card-modern">
                                <Card.Body>
                                    <div className="d-grid gap-2">
                                        <Button
                                            type="submit"
                                            variant="primary"
                                            size="lg"
                                            disabled={saving || !hasChanges()}
                                            className="btn-modern"
                                        >
                                            {saving ? (
                                                <>
                                                    <Spinner size="sm" className="me-2" />
                                                    Saving...
                                                </>
                                            ) : (
                                                <>
                                                    <FiSave className="me-2" />
                                                    Save Changes
                                                </>
                                            )}
                                        </Button>

                                        <Button
                                            type="button"
                                            variant="outline-secondary"
                                            onClick={() => navigate('/meetings')}
                                            disabled={saving}
                                        >
                                            Cancel
                                        </Button>
                                    </div>

                                    {!hasChanges() && (
                                        <small className="text-muted mt-2 d-block text-center">
                                            No changes to save
                                        </small>
                                    )}
                                </Card.Body>
                            </Card>
                        </Col>
                    </Row>
                </Form>
            </Container>
        </motion.div>
    );
};

export default EditMeetingType;
