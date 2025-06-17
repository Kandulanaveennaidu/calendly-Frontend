import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Badge, Alert, Spinner } from 'react-bootstrap';
import { motion } from 'framer-motion';
import { FiBell, FiCheck, FiTrash2, FiCalendar, FiArrowLeft } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import notificationService from '../services/notificationService';

const NotificationsPage = () => {
    const navigate = useNavigate();
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    useEffect(() => {
        loadNotifications();
    }, []);

    const loadNotifications = async () => {
        try {
            setLoading(true);
            const response = await notificationService.getNotifications({ limit: 50 });

            if (response.success) {
                setNotifications(response.data.notifications || []);
            } else {
                throw new Error(response.message);
            }
        } catch (error) {
            console.error('Failed to load notifications:', error);
            setError('Failed to load notifications');
        } finally {
            setLoading(false);
        }
    };

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

    const deleteNotification = async (notificationId) => {
        try {
            await notificationService.deleteNotification(notificationId);
            setNotifications(prev => prev.filter(notif => notif.id !== notificationId));
            setSuccess('Notification deleted successfully');
        } catch (error) {
            console.error('Failed to delete notification:', error);
            setError('Failed to delete notification');
        }
    };

    const markAllAsRead = async () => {
        try {
            await notificationService.markAllAsRead();
            setNotifications(prev => prev.map(notif => ({ ...notif, isRead: true })));
            setSuccess('All notifications marked as read');
        } catch (error) {
            console.error('Failed to mark all as read:', error);
            setError('Failed to mark all notifications as read');
        }
    };

    const getNotificationIcon = (type) => {
        switch (type) {
            case 'meeting_created':
                return <FiCalendar className="text-primary" />;
            default:
                return <FiBell className="text-info" />;
        }
    };

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
                                    onClick={() => navigate(-1)}
                                    className="me-3"
                                >
                                    <FiArrowLeft className="me-2" />
                                    Back
                                </Button>
                                <div>
                                    <h1 className="h2 fw-bold mb-1">Notifications</h1>
                                    <p className="text-muted mb-0">Manage all your notifications</p>
                                </div>
                            </div>
                            {notifications.some(n => !n.isRead) && (
                                <Button
                                    variant="primary"
                                    onClick={markAllAsRead}
                                    className="btn-modern"
                                >
                                    <FiCheck className="me-2" />
                                    Mark All Read
                                </Button>
                            )}
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

                {/* Notifications List */}
                <Row>
                    <Col>
                        <Card className="card-modern">
                            <Card.Body className="p-0">
                                {loading ? (
                                    <div className="text-center py-5">
                                        <Spinner animation="border" variant="primary" />
                                        <p className="mt-2 text-muted">Loading notifications...</p>
                                    </div>
                                ) : notifications.length === 0 ? (
                                    <div className="text-center py-5">
                                        <FiBell size={64} className="text-muted mb-3 opacity-50" />
                                        <h5 className="text-muted">No notifications</h5>
                                        <p className="text-muted">You'll see notifications here when they arrive</p>
                                    </div>
                                ) : (
                                    <div className="list-group list-group-flush">
                                        {notifications.map((notification) => (
                                            <motion.div
                                                key={notification.id}
                                                initial={{ opacity: 0, y: 20 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                className={`list-group-item list-group-item-action border-0 ${!notification.isRead ? 'bg-light' : ''}`}
                                            >
                                                <div className="d-flex align-items-start">
                                                    <div className="me-3 mt-1">
                                                        {getNotificationIcon(notification.type)}
                                                    </div>
                                                    <div className="flex-grow-1">
                                                        <div className="d-flex justify-content-between align-items-start">
                                                            <div>
                                                                <h6 className={`mb-1 ${!notification.isRead ? 'fw-bold' : ''}`}>
                                                                    {notification.title}
                                                                </h6>
                                                                <p className="mb-2 text-muted">
                                                                    {notification.message}
                                                                </p>
                                                                <small className="text-muted">
                                                                    {new Date(notification.createdAt).toLocaleString()}
                                                                </small>
                                                            </div>
                                                            <div className="d-flex gap-2 ms-3">
                                                                {!notification.isRead && (
                                                                    <Button
                                                                        variant="outline-primary"
                                                                        size="sm"
                                                                        onClick={() => markAsRead(notification.id)}
                                                                    >
                                                                        <FiCheck size={14} />
                                                                    </Button>
                                                                )}
                                                                <Button
                                                                    variant="outline-danger"
                                                                    size="sm"
                                                                    onClick={() => deleteNotification(notification.id)}
                                                                >
                                                                    <FiTrash2 size={14} />
                                                                </Button>
                                                            </div>
                                                        </div>
                                                        {!notification.isRead && (
                                                            <div className="position-absolute top-0 end-0 mt-3 me-3">
                                                                <div className="bg-primary rounded-circle"
                                                                    style={{ width: '8px', height: '8px' }}>
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </motion.div>
                                        ))}
                                    </div>
                                )}
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>
            </Container>
        </motion.div>
    );
};

export default NotificationsPage;
