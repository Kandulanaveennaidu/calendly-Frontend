import React, { useState, useContext, useEffect, useCallback, useRef } from 'react';
import { Container, Row, Col, Card, Form, Button, Alert, Spinner } from 'react-bootstrap';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiLogIn, FiMail, FiLock, FiUser, FiGithub } from 'react-icons/fi';
import { FaGoogle } from 'react-icons/fa';
import { AuthContext } from '../context/AuthContext';
import authService from '../services/authService';

const Login = () => {
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        rememberMe: false
    });

    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [loginError, setLoginError] = useState('');
    const navigate = useNavigate();
    const location = useLocation();
    const { login } = useContext(AuthContext);

    // Use a ref to prevent the redirect effect from running multiple times
    const isRedirectingRef = useRef(false);

    // Improved authentication check to prevent flickering
    useEffect(() => {
        // Prevent running multiple times
        if (isRedirectingRef.current) return;

        const checkAndRedirect = () => {
            const hasAuth = localStorage.getItem('authToken') || localStorage.getItem('currentUser');
            const redirectPath = location.state?.from || '/dashboard';

            if (hasAuth && !isRedirectingRef.current) {
                isRedirectingRef.current = true;
                // Use requestAnimationFrame to ensure smooth transition
                requestAnimationFrame(() => {
                    navigate(redirectPath, { replace: true });
                });
            }
        };

        // Slight delay to ensure DOM is ready
        const timer = setTimeout(checkAndRedirect, 50);
        return () => clearTimeout(timer);
    }, [navigate, location]);

    // Stabilize form validation
    const validateForm = useCallback(() => {
        const newErrors = {};

        if (!formData.email) {
            newErrors.email = "Email is required";
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            newErrors.email = "Email is invalid";
        }

        if (!formData.password) {
            newErrors.password = "Password is required";
        } else if (formData.password.length < 6) {
            newErrors.password = "Password must be at least 6 characters";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    }, [formData.email, formData.password]);

    // Real API integration for form submission
    const handleSubmit = useCallback(async (e) => {
        e.preventDefault();
        setLoginError('');

        if (validateForm()) {
            setIsSubmitting(true);

            try {
                // Ensure proper JSON data structure
                const loginData = {
                    email: formData.email.trim(),
                    password: formData.password
                };

                console.log('Sending login data:', loginData);

                // Call real API login endpoint with proper JSON structure
                const response = await authService.login(loginData.email, loginData.password);

                console.log('Login successful:', response);

                // Set redirecting flag to prevent flicker during navigation
                isRedirectingRef.current = true;

                // Extract user data from API response
                const userData = {
                    email: response.user?.email || formData.email,
                    name: response.user?.firstName && response.user?.lastName
                        ? `${response.user.firstName} ${response.user.lastName}`
                        : response.user?.name || 'User',
                    firstName: response.user?.firstName,
                    lastName: response.user?.lastName,
                    avatar: response.user?.avatar || 'https://i.pravatar.cc/150?img=68',
                    isEmailVerified: response.user?.isEmailVerified || false,
                    id: response.user?.id || response.user?._id,
                    phone: response.user?.phone,
                    timezone: response.user?.timezone,
                    bio: response.user?.bio
                };

                // Store user data in localStorage
                localStorage.setItem('currentUser', JSON.stringify(userData));

                // Call login function from AuthContext
                login(userData);

                // Show success message if available
                if (response.message) {
                    console.log('Login message:', response.message);
                }

                // Redirect based on email verification status
                const redirectTo = location.state?.from || '/dashboard'; // Changed back to '/dashboard'

                if (!userData.isEmailVerified) {
                    // Redirect to email verification page
                    navigate('/verify-email', {
                        state: {
                            email: userData.email,
                            showMessage: true,
                            from: redirectTo
                        },
                        replace: true
                    });
                } else {
                    // Redirect to main application
                    navigate(redirectTo, { replace: true });
                }

            } catch (error) {
                console.error('Login error:', error);

                // Handle specific error messages from API
                if (error.message.includes('Invalid credentials') ||
                    error.message.includes('Invalid email or password') ||
                    error.message.includes('User not found')) {
                    setLoginError('Invalid email or password. Please check your credentials and try again.');
                } else if (error.message.includes('Account not verified') ||
                    error.message.includes('Email not verified')) {
                    setLoginError('Please verify your email address before logging in. Check your inbox for the verification link.');
                } else if (error.message.includes('Account suspended') ||
                    error.message.includes('Account disabled')) {
                    setLoginError('Your account has been suspended. Please contact support for assistance.');
                } else if (error.message.includes('Too many login attempts')) {
                    setLoginError('Too many failed login attempts. Please try again later or reset your password.');
                } else if (error.message.includes('Network') ||
                    error.message.includes('fetch') ||
                    error.message.includes('Failed to fetch')) {
                    setLoginError('Network error. Please check your internet connection and try again.');
                } else if (error.message.includes('Server error') ||
                    error.message.includes('Internal server')) {
                    setLoginError('Server is temporarily unavailable. Please try again in a few moments.');
                } else {
                    setLoginError(error.message || 'An unexpected error occurred during login. Please try again.');
                }
            } finally {
                setIsSubmitting(false);
            }
        }
    }, [formData, validateForm, login, navigate, location]);

    const handleChange = (e) => {
        const { name, value, checked } = e.target;
        setFormData({
            ...formData,
            [name]: name === 'rememberMe' ? checked : value
        });

        // Clear specific error when user starts typing
        if (errors[name]) {
            setErrors({
                ...errors,
                [name]: ''
            });
        }
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
                                <h2 className="fw-bold mb-0">Welcome Back!</h2>
                                <p className="text-muted">Sign in to your meetslot.ai account</p>
                            </div>

                            <Card className="card-modern shadow-sm">
                                <Card.Body className="p-4 p-md-5">
                                    {loginError && (
                                        <Alert variant="danger" className="mb-4">
                                            {loginError}
                                        </Alert>
                                    )}

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
                                                    placeholder="name@example.com"
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

                                        <Form.Group className="mb-4">
                                            <div className="d-flex justify-content-between">
                                                <Form.Label>Password</Form.Label>
                                                {/* <Link to="/forgot-password" className="text-primary small">
                                                    Forgot Password?
                                                </Link> */}
                                            </div>
                                            <div className="input-group">
                                                <span className="input-group-text bg-light border-end-0">
                                                    <FiLock />
                                                </span>
                                                <Form.Control
                                                    type="password"
                                                    name="password"
                                                    placeholder="Enter your password"
                                                    value={formData.password}
                                                    onChange={handleChange}
                                                    isInvalid={!!errors.password}
                                                    className="border-start-0 form-control-modern"
                                                />
                                                <Form.Control.Feedback type="invalid">
                                                    {errors.password}
                                                </Form.Control.Feedback>
                                            </div>
                                        </Form.Group>

                                        <Form.Group className="mb-4">
                                            <Form.Check
                                                type="checkbox"
                                                id="rememberMe"
                                                name="rememberMe"
                                                label="Remember me"
                                                checked={formData.rememberMe}
                                                onChange={handleChange}
                                            />
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
                                                    Signing in...
                                                </>
                                            ) : (
                                                <>
                                                    <FiLogIn className="me-2" />
                                                    Sign In
                                                </>
                                            )}
                                        </Button>
                                        {/* 
                                        <div className="text-center mb-4">
                                            <p className="text-muted small mb-0">Or sign in with</p>
                                            <div className="d-flex justify-content-center gap-2 mt-3">
                                                <Button variant="outline-secondary" className="btn-icon">
                                                    <FaGoogle />
                                                </Button>
                                                <Button variant="outline-secondary" className="btn-icon">
                                                    <FiGithub />
                                                </Button>
                                            </div>
                                        </div> */}

                                        <div className="text-center">
                                            <p className="mb-0">
                                                Don't have an account?{' '}
                                                <Link to="/signup" className="text-primary fw-semibold">
                                                    Sign Up
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

export default React.memo(Login);