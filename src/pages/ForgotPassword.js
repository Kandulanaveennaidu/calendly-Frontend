import React, { useState, useCallback } from 'react';
import { Container, Row, Col, Card, Form, Button, Alert, Spinner } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiMail, FiArrowLeft, FiSend } from 'react-icons/fi';
import authService from '../services/authService';

const ForgotPassword = () => {
    const [formData, setFormData] = useState({
        email: ''
    });
    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [emailSent, setEmailSent] = useState(false);
    const navigate = useNavigate();

    const validateForm = useCallback(() => {
        const newErrors = {};

        if (!formData.email) {
            newErrors.email = "Email is required";
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            newErrors.email = "Please enter a valid email address";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    }, [formData.email]);

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
                const response = await authService.forgotPassword(formData.email.toLowerCase().trim());

                console.log('Forgot password response:', response);

                setEmailSent(true);
                setSuccess(
                    response.message ||
                    `Reset instructions have been sent to ${formData.email}. Please check your email and follow the instructions to reset your password.`
                );

                // Optional: Auto redirect to login after success
                setTimeout(() => {
                    navigate('/login', {
                        state: {
                            message: 'Please check your email for password reset instructions.'
                        }
                    });
                }, 5000);

            } catch (error) {
                console.error('Forgot password error:', error);

                if (error.message.includes('User not found') ||
                    error.message.includes('Email not found')) {
                    setError('No account found with this email address. Please check your email or create a new account.');
                } else if (error.message.includes('Too many requests')) {
                    setError('Too many password reset requests. Please wait before trying again.');
                } else if (error.message.includes('Email service')) {
                    setError('Unable to send email at this time. Please try again later.');
                } else if (error.message.includes('Network') || error.message.includes('fetch')) {
                    setError('Network error. Please check your connection and try again.');
                } else {
                    setError(error.message || 'An error occurred while sending the reset email. Please try again.');
                }
            } finally {
                setIsSubmitting(false);
            }
        }
    }, [formData, validateForm, navigate]);

    const handleResendEmail = useCallback(async () => {
        if (!isSubmitting && formData.email) {
            await handleSubmit({ preventDefault: () => { } });
        }
    }, [handleSubmit, isSubmitting, formData.email]);

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
                                <h2 className="fw-bold mb-0">
                                    {emailSent ? 'Check Your Email' : 'Forgot Password?'}
                                </h2>
                                <p className="text-muted">
                                    {emailSent
                                        ? 'We sent you a password reset link'
                                        : 'Enter your email address and we\'ll send you a link to reset your password'
                                    }
                                </p>
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
                                            {success}
                                        </Alert>
                                    )}

                                    {!emailSent ? (
                                        <Form onSubmit={handleSubmit}>
                                            <Form.Group className="mb-4">
                                                <Form.Label>Email Address</Form.Label>
                                                <div className="input-group">
                                                    <span className="input-group-text bg-light border-end-0">
                                                        <FiMail />
                                                    </span>
                                                    <Form.Control
                                                        type="email"
                                                        name="email"
                                                        placeholder="Enter your email address"
                                                        value={formData.email}
                                                        onChange={handleChange}
                                                        isInvalid={!!errors.email}
                                                        className="border-start-0 form-control-modern"
                                                    />
                                                    <Form.Control.Feedback type="invalid">
                                                        {errors.email}
                                                    </Form.Control.Feedback>
                                                </div>
                                            </Form.Group>

                                            <Button
                                                variant="primary"
                                                type="submit"
                                                disabled={isSubmitting}
                                                className="w-100 btn-modern py-2 mb-4"
                                            >
                                                {isSubmitting ? (
                                                    <>
                                                        <Spinner size="sm" className="me-2" animation="border" />
                                                        Sending Reset Link...
                                                    </>
                                                ) : (
                                                    <>
                                                        <FiSend className="me-2" />
                                                        Send Reset Link
                                                    </>
                                                )}
                                            </Button>
                                        </Form>
                                    ) : (
                                        <div className="text-center">
                                            <div className="mb-4">
                                                <div className="text-success fs-1 mb-3">
                                                    <FiMail />
                                                </div>
                                                <p className="mb-3">
                                                    If an account with <strong>{formData.email}</strong> exists,
                                                    you will receive a password reset link shortly.
                                                </p>
                                                <p className="text-muted small">
                                                    Didn't receive the email? Check your spam folder or try again.
                                                </p>
                                            </div>

                                            <Button
                                                variant="outline-primary"
                                                onClick={handleResendEmail}
                                                disabled={isSubmitting}
                                                className="mb-3"
                                            >
                                                {isSubmitting ? (
                                                    <>
                                                        <Spinner size="sm" className="me-2" animation="border" />
                                                        Resending...
                                                    </>
                                                ) : (
                                                    'Resend Email'
                                                )}
                                            </Button>
                                        </div>
                                    )}

                                    <div className="text-center">
                                        <Link to="/login" className="text-primary d-inline-flex align-items-center">
                                            <FiArrowLeft className="me-1" />
                                            Back to Login
                                        </Link>
                                    </div>
                                </Card.Body>
                            </Card>
                        </motion.div>
                    </Col>
                </Row>
            </Container>
        </motion.div>
    );
};

export default ForgotPassword;
