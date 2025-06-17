import React, { useState, useCallback, useEffect } from 'react';
import { Container, Row, Col, Card, Form, Button, Alert, Spinner } from 'react-bootstrap';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiLock, FiCheckCircle, FiEye, FiEyeOff } from 'react-icons/fi';
import authService from '../services/authService';

const ResetPassword = () => {
    const [searchParams] = useSearchParams();
    const [formData, setFormData] = useState({
        code: '',
        newPassword: '',
        confirmPassword: ''
    });
    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const navigate = useNavigate();

    // Get code from URL params if available
    useEffect(() => {
        const codeFromUrl = searchParams.get('code');
        if (codeFromUrl) {
            setFormData(prev => ({ ...prev, code: codeFromUrl }));
        }
    }, [searchParams]);

    const validateForm = useCallback(() => {
        const newErrors = {};

        if (!formData.code.trim()) {
            newErrors.code = "Reset code is required";
        }

        if (!formData.newPassword) {
            newErrors.newPassword = "New password is required";
        } else if (formData.newPassword.length < 8) {
            newErrors.newPassword = "Password must be at least 8 characters";
        } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.newPassword)) {
            newErrors.newPassword = "Password must contain uppercase, lowercase and number";
        }

        if (formData.newPassword !== formData.confirmPassword) {
            newErrors.confirmPassword = "Passwords do not match";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    }, [formData]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
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

    const handleSubmit = useCallback(async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        if (validateForm()) {
            setIsSubmitting(true);

            try {
                const response = await authService.resetPassword(
                    formData.code.trim(),
                    formData.newPassword
                );

                console.log('Password reset successful:', response);

                setSuccess(
                    response.message ||
                    'Your password has been reset successfully! You can now log in with your new password.'
                );

                // Redirect to login after success
                setTimeout(() => {
                    navigate('/login', {
                        state: {
                            message: 'Password reset successful! Please log in with your new password.'
                        }
                    });
                }, 3000);

            } catch (error) {
                console.error('Reset password error:', error);

                if (error.message.includes('Invalid reset code') ||
                    error.message.includes('Code not found')) {
                    setError('Invalid or expired reset code. Please request a new password reset link.');
                } else if (error.message.includes('Code expired')) {
                    setError('Reset code has expired. Please request a new password reset link.');
                } else if (error.message.includes('Password too weak')) {
                    setError('Password is too weak. Please choose a stronger password.');
                } else if (error.message.includes('Same password')) {
                    setError('New password must be different from your current password.');
                } else if (error.message.includes('Network') || error.message.includes('fetch')) {
                    setError('Network error. Please check your connection and try again.');
                } else {
                    setError(error.message || 'An error occurred while resetting your password. Please try again.');
                }
            } finally {
                setIsSubmitting(false);
            }
        }
    }, [formData, validateForm, navigate]);

    const passwordStrength = () => {
        const password = formData.newPassword;
        if (!password) return { width: '0%', color: 'danger' };

        if (password.length < 6) return { width: '25%', color: 'danger' };
        if (password.length < 8) return { width: '50%', color: 'warning' };
        if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password)) return { width: '75%', color: 'info' };
        return { width: '100%', color: 'success' };
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="py-5"
        >
            <Container>
                <Row className="justify-content-center">
                    <Col md={8} lg={6} xl={5}>
                        <motion.div
                            initial={{ y: 50, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.2 }}
                        >
                            <div className="text-center mb-4">
                                <h2 className="fw-bold mb-0">Reset Password</h2>
                                <p className="text-muted">Enter your new password below</p>
                            </div>

                            <Card className="card-modern shadow-sm">
                                <Card.Body className="p-4 p-md-5">
                                    {error && (
                                        <Alert variant="danger" className="mb-4">
                                            {error}
                                        </Alert>
                                    )}

                                    {success && (
                                        <Alert variant="success" className="mb-4">
                                            <FiCheckCircle className="me-2" />
                                            {success}
                                        </Alert>
                                    )}

                                    <Form onSubmit={handleSubmit}>
                                        <Form.Group className="mb-4">
                                            <Form.Label>Reset Code</Form.Label>
                                            <Form.Control
                                                type="text"
                                                name="code"
                                                placeholder="Enter the reset code from your email"
                                                value={formData.code}
                                                onChange={handleChange}
                                                isInvalid={!!errors.code}
                                                className="form-control-modern"
                                            />
                                            <Form.Control.Feedback type="invalid">
                                                {errors.code}
                                            </Form.Control.Feedback>
                                        </Form.Group>

                                        <Form.Group className="mb-4">
                                            <Form.Label>New Password</Form.Label>
                                            <div className="input-group">
                                                <span className="input-group-text bg-light border-end-0">
                                                    <FiLock />
                                                </span>
                                                <Form.Control
                                                    type={showPassword ? 'text' : 'password'}
                                                    name="newPassword"
                                                    placeholder="Enter your new password"
                                                    value={formData.newPassword}
                                                    onChange={handleChange}
                                                    isInvalid={!!errors.newPassword}
                                                    className="border-start-0 border-end-0 form-control-modern"
                                                />
                                                <Button
                                                    variant="outline-secondary"
                                                    type="button"
                                                    onClick={() => setShowPassword(!showPassword)}
                                                    className="border-start-0"
                                                >
                                                    {showPassword ? <FiEyeOff /> : <FiEye />}
                                                </Button>
                                                <Form.Control.Feedback type="invalid">
                                                    {errors.newPassword}
                                                </Form.Control.Feedback>
                                            </div>
                                            <div className="mt-2">
                                                <div className="progress" style={{ height: '6px' }}>
                                                    <div
                                                        className={`progress-bar bg-${passwordStrength().color}`}
                                                        role="progressbar"
                                                        style={{ width: passwordStrength().width }}
                                                    ></div>
                                                </div>
                                                <div className="d-flex justify-content-between mt-1">
                                                    <span className="small text-muted">Password strength</span>
                                                    <span className="small text-muted">
                                                        Min 8 characters with uppercase, lowercase, and number
                                                    </span>
                                                </div>
                                            </div>
                                        </Form.Group>

                                        <Form.Group className="mb-4">
                                            <Form.Label>Confirm New Password</Form.Label>
                                            <div className="input-group">
                                                <span className="input-group-text bg-light border-end-0">
                                                    <FiLock />
                                                </span>
                                                <Form.Control
                                                    type={showConfirmPassword ? 'text' : 'password'}
                                                    name="confirmPassword"
                                                    placeholder="Confirm your new password"
                                                    value={formData.confirmPassword}
                                                    onChange={handleChange}
                                                    isInvalid={!!errors.confirmPassword}
                                                    className="border-start-0 border-end-0 form-control-modern"
                                                />
                                                <Button
                                                    variant="outline-secondary"
                                                    type="button"
                                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                                    className="border-start-0"
                                                >
                                                    {showConfirmPassword ? <FiEyeOff /> : <FiEye />}
                                                </Button>
                                                <Form.Control.Feedback type="invalid">
                                                    {errors.confirmPassword}
                                                </Form.Control.Feedback>
                                            </div>
                                        </Form.Group>

                                        <Button
                                            variant="primary"
                                            type="submit"
                                            disabled={isSubmitting || success}
                                            className="w-100 btn-modern py-2 mb-4"
                                        >
                                            {isSubmitting ? (
                                                <>
                                                    <Spinner size="sm" className="me-2" animation="border" />
                                                    Resetting Password...
                                                </>
                                            ) : success ? (
                                                <>
                                                    <FiCheckCircle className="me-2" />
                                                    Password Reset Successfully
                                                </>
                                            ) : (
                                                <>
                                                    <FiLock className="me-2" />
                                                    Reset Password
                                                </>
                                            )}
                                        </Button>

                                        <div className="text-center">
                                            <p className="mb-0">
                                                Remember your password?{' '}
                                                <Link to="/login" className="text-primary fw-semibold">
                                                    Sign In
                                                </Link>
                                            </p>
                                        </div>
                                    </Form>
                                </Card.Body>
                            </Card>
                        </motion.div>
                    </Col>
                </Row>
            </Container>
        </motion.div>
    );
};

export default ResetPassword;
