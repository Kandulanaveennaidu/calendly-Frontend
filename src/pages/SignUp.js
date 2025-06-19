import React, { useState, useContext, useCallback } from 'react';
import { Container, Row, Col, Card, Form, Button, Alert, Spinner } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiUserPlus, FiMail, FiLock, FiUser, FiGithub } from 'react-icons/fi';
// Import Google icon from a different icon package
import { FaGoogle } from 'react-icons/fa';
import { AuthContext } from '../context/AuthContext';
import authService from '../services/authService';

const SignUp = () => {
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        confirmPassword: '',
        termsAccepted: false
    });

    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [signupError, setSignupError] = useState('');
    const [signupSuccess, setSignupSuccess] = useState('');
    const navigate = useNavigate();
    const { login } = useContext(AuthContext);

    const validateForm = useCallback(() => {
        const newErrors = {};

        if (!formData.firstName.trim()) newErrors.firstName = "First name is required";
        if (!formData.lastName.trim()) newErrors.lastName = "Last name is required";

        if (!formData.email) {
            newErrors.email = "Email is required";
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            newErrors.email = "Email is invalid";
        }

        if (!formData.password) {
            newErrors.password = "Password is required";
        } else if (formData.password.length < 8) {
            newErrors.password = "Password must be at least 8 characters";
        } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
            newErrors.password = "Password must contain uppercase, lowercase and number";
        }

        if (formData.password !== formData.confirmPassword) {
            newErrors.confirmPassword = "Passwords do not match";
        }

        if (!formData.termsAccepted) {
            newErrors.termsAccepted = "You must accept the terms and conditions";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    }, [formData]);

    const handleChange = (e) => {
        const { name, value, checked, type } = e.target;
        setFormData({
            ...formData,
            [name]: type === 'checkbox' ? checked : value
        });

        // Clear specific error when user starts typing
        if (errors[name]) {
            setErrors({
                ...errors,
                [name]: ''
            });
        }
    };

    const handleSubmit = useCallback(async (e) => {
        e.preventDefault();
        setSignupError('');
        setSignupSuccess('');

        if (validateForm()) {
            setIsSubmitting(true);

            try {
                // Call real API registration endpoint
                const response = await authService.register({
                    firstName: formData.firstName.trim(),
                    lastName: formData.lastName.trim(),
                    email: formData.email.toLowerCase().trim(),
                    password: formData.password
                });

                console.log('Registration successful:', response);

                // Show success message
                setSignupSuccess(
                    response.message ||
                    "Account created successfully! Please check your email for verification instructions."
                );

                // If user is automatically logged in after registration
                if (response.token && response.user) {
                    const userData = {
                        email: response.user.email || formData.email,
                        name: `${response.user.firstName} ${response.user.lastName}`,
                        firstName: response.user.firstName,
                        lastName: response.user.lastName,
                        avatar: response.user.avatar || 'https://i.pravatar.cc/150?img=68',
                        isEmailVerified: response.user.isEmailVerified || false,
                        id: response.user.id || response.user._id
                    };

                    // Store user data
                    localStorage.setItem('currentUser', JSON.stringify(userData));

                    // Login user via context
                    login(userData);

                    // Redirect to dashboard or verification page
                    setTimeout(() => {
                        if (userData.isEmailVerified) {
                            navigate('/dashboard');
                        } else {
                            navigate('/verify-email', {
                                state: { email: userData.email, showMessage: true }
                            });
                        }
                    }, 2000);
                } else {
                    // Registration successful but manual login required
                    setTimeout(() => {
                        navigate('/login', {
                            state: {
                                message: 'Registration successful! Please log in with your credentials.',
                                email: formData.email
                            }
                        });
                    }, 2000);
                }

            } catch (error) {
                console.error('Signup error:', error);

                // Handle specific error messages
                if (error.message.includes('Email already exists') ||
                    error.message.includes('User already exists')) {
                    setSignupError('An account with this email already exists. Please try logging in instead.');
                } else if (error.message.includes('Invalid email')) {
                    setSignupError('Please provide a valid email address.');
                } else if (error.message.includes('Password too weak')) {
                    setSignupError('Password is too weak. Please choose a stronger password.');
                } else if (error.message.includes('validation')) {
                    setSignupError('Please check your input and ensure all required fields are properly filled.');
                } else if (error.message.includes('Network') || error.message.includes('fetch')) {
                    setSignupError('Network error. Please check your connection and try again.');
                } else {
                    setSignupError(error.message || 'An error occurred during registration. Please try again.');
                }
            } finally {
                setIsSubmitting(false);
            }
        }
    }, [formData, validateForm, login, navigate]);

    const passwordStrength = () => {
        const password = formData.password;
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
            className="py-5"
        >
            <Container>
                <Row className="justify-content-center">
                    <Col md={10} lg={8} xl={7}>
                        <motion.div
                            initial={{ y: 50, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.2 }}
                        >
                            <div className="text-center mb-4">
                                <h2 className="fw-bold mb-0">Create Your Account</h2>
                                <p className="text-muted">Join meetslot.ai and start managing your meetings</p>
                            </div>

                            <Card className="card-modern shadow-sm">
                                <Card.Body className="p-4 p-md-5">
                                    {signupError && (
                                        <Alert variant="danger" className="mb-4">
                                            {signupError}
                                        </Alert>
                                    )}

                                    {signupSuccess && (
                                        <Alert variant="success" className="mb-4">
                                            {signupSuccess}
                                        </Alert>
                                    )}

                                    <Form onSubmit={handleSubmit}>
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
                                                            placeholder="John"
                                                            value={formData.firstName}
                                                            onChange={handleChange}
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
                                                            placeholder="Doe"
                                                            value={formData.lastName}
                                                            onChange={handleChange}
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
                                            <Form.Label>Password</Form.Label>
                                            <div className="input-group">
                                                <span className="input-group-text bg-light border-end-0">
                                                    <FiLock />
                                                </span>
                                                <Form.Control
                                                    type="password"
                                                    name="password"
                                                    placeholder="Create a strong password"
                                                    value={formData.password}
                                                    onChange={handleChange}
                                                    isInvalid={!!errors.password}
                                                    className="border-start-0 form-control-modern"
                                                />
                                                <Form.Control.Feedback type="invalid">
                                                    {errors.password}
                                                </Form.Control.Feedback>
                                            </div>
                                            <div className="mt-2">
                                                <div className="progress" style={{ height: '6px' }}>
                                                    <div
                                                        className={`progress-bar bg-${passwordStrength().color}`}
                                                        role="progressbar"
                                                        style={{ width: passwordStrength().width }}
                                                        aria-valuenow={passwordStrength().width.replace('%', '')}
                                                        aria-valuemin="0"
                                                        aria-valuemax="100"
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
                                            <Form.Label>Confirm Password</Form.Label>
                                            <div className="input-group">
                                                <span className="input-group-text bg-light border-end-0">
                                                    <FiLock />
                                                </span>
                                                <Form.Control
                                                    type="password"
                                                    name="confirmPassword"
                                                    placeholder="Re-enter your password"
                                                    value={formData.confirmPassword}
                                                    onChange={handleChange}
                                                    isInvalid={!!errors.confirmPassword}
                                                    className="border-start-0 form-control-modern"
                                                />
                                                <Form.Control.Feedback type="invalid">
                                                    {errors.confirmPassword}
                                                </Form.Control.Feedback>
                                            </div>
                                        </Form.Group>

                                        <Form.Group className="mb-4">
                                            <Form.Check
                                                type="checkbox"
                                                id="termsAccepted"
                                                name="termsAccepted"
                                                label={
                                                    <span>
                                                        I agree to the <a href="#" className="fw-semibold">Terms of Service</a> and <a href="#" className="fw-semibold">Privacy Policy</a>
                                                    </span>
                                                }
                                                checked={formData.termsAccepted}
                                                onChange={handleChange}
                                                isInvalid={!!errors.termsAccepted}
                                                feedback={errors.termsAccepted}
                                                feedbackType="invalid"
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
                                                    Creating account...
                                                </>
                                            ) : (
                                                <>
                                                    <FiUserPlus className="me-2" />
                                                    Sign Up
                                                </>
                                            )}
                                        </Button>

                                        {/* <div className="text-center mb-4">
                                            <p className="text-muted small mb-0">Or sign up with</p>
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
                                                Already have an account?{' '}
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

export default SignUp;
