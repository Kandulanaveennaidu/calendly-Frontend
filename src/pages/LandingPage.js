import React from 'react';
import { Container, Row, Col, Button, Card, Badge, Form } from 'react-bootstrap';
import { motion } from 'framer-motion';
import {
    FiCalendar, FiClock, FiUsers, FiZap, FiCheck, FiArrowRight,
    FiStar, FiShield, FiGlobe, FiSmartphone, FiMail, FiUser
} from 'react-icons/fi';
import { Link, useNavigate } from 'react-router-dom';

const LandingPage = () => {
    const navigate = useNavigate();

    const features = [
        {
            icon: <FiCalendar size={32} className="text-primary" />,
            title: "Easy Scheduling",
            description: "Create meeting types and let others book time with you automatically"
        },
        {
            icon: <FiClock size={32} className="text-success" />,
            title: "Time Zone Detection",
            description: "Automatically handles time zones so everyone shows up at the right time"
        },
        {
            icon: <FiUsers size={32} className="text-info" />,
            title: "Team Collaboration",
            description: "Share calendars with your team and manage group availability"
        },
        {
            icon: <FiZap size={32} className="text-warning" />,
            title: "Instant Notifications",
            description: "Get real-time updates when meetings are scheduled or changed"
        },
        {
            icon: <FiShield size={32} className="text-danger" />,
            title: "Secure & Private",
            description: "Your data is encrypted and secure with enterprise-level security"
        },
        {
            icon: <FiGlobe size={32} className="text-secondary" />,
            title: "Global Access",
            description: "Access your calendar from anywhere in the world, anytime"
        }
    ];

    const testimonials = [
        {
            name: "Sarah Johnson",
            role: "Product Manager",
            company: "TechCorp",
            image: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face",
            rating: 5,
            text: "ScheduleMe has transformed how I manage meetings. No more back-and-forth emails!"
        },
        {
            name: "David Chen",
            role: "Sales Director",
            company: "GrowthLab",
            image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
            rating: 5,
            text: "Our team productivity increased by 40% since using ScheduleMe. Highly recommended!"
        },
        {
            name: "Emily Rodriguez",
            role: "Consultant",
            company: "Freelancer",
            image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face",
            rating: 5,
            text: "Perfect for client meetings. Professional, reliable, and so easy to use."
        }
    ];

    const pricingPlans = [
        {
            name: "Free",
            price: "$0",
            period: "forever",
            features: [
                "Up to 3 meeting types",
                "Unlimited bookings",
                "Basic integrations",
                "Email support"
            ],
            buttonText: "Get Started",
            popular: false
        },
        {
            name: "Professional",
            price: "$12",
            period: "per month",
            features: [
                "Unlimited meeting types",
                "Advanced scheduling options",
                "Calendar integrations",
                "Priority support",
                "Custom branding",
                "Analytics & reporting"
            ],
            buttonText: "Start Free Trial",
            popular: true
        },
        {
            name: "Team",
            price: "$24",
            period: "per user/month",
            features: [
                "Everything in Professional",
                "Team scheduling",
                "Admin controls",
                "API access",
                "SSO integration",
                "24/7 phone support"
            ],
            buttonText: "Contact Sales",
            popular: false
        }
    ];

    return (
        <>
            {/* Hero Section */}
            <section className="hero-section bg-gradient py-5">
                <Container>
                    <Row className="align-items-center min-vh-100">
                        <Col lg={6}>
                            {/* Add ScheduleMe brand here instead */}
                            <div className="mb-4">
                                <h1 className="display-3 fw-bold text-primary d-flex align-items-center mb-3">
                                    <FiCalendar className="me-3" />
                                    ScheduleMe
                                </h1>
                            </div>
                            <motion.div
                                initial={{ opacity: 0, x: -50 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.8 }}
                            >
                                <h2 className="display-4 fw-bold text-dark mb-4">
                                    Scheduling made
                                    <span className="text-primary"> simple</span>
                                </h2>
                                <p className="lead text-muted mb-4">
                                    Stop the endless email chains. ScheduleMe makes it easy for people to book time with you,
                                    automatically syncing with your calendar and handling all the details.
                                </p>
                                <div className="d-flex gap-3 mb-4">
                                    <Button
                                        size="lg"
                                        variant="primary"
                                        onClick={() => navigate('/signup')}
                                        className="px-5 py-3"
                                    >
                                        Get Started Free
                                        <FiArrowRight className="ms-2" />
                                    </Button>
                                    <Button
                                        size="lg"
                                        variant="outline-secondary"
                                        className="px-5 py-3"
                                    >
                                        Watch Demo
                                    </Button>
                                </div>
                                <div className="d-flex align-items-center text-muted">
                                    <FiCheck className="text-success me-2" />
                                    <small>Free forever • No credit card required • Setup in 60 seconds</small>
                                </div>
                            </motion.div>
                        </Col>
                        <Col lg={6}>
                            <motion.div
                                initial={{ opacity: 0, x: 50 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.8, delay: 0.2 }}
                                className="text-center"
                            >
                                <div className="hero-image-container position-relative">
                                    <img
                                        src="https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=600&h=400&fit=crop"
                                        alt="Calendar Scheduling Interface"
                                        className="img-fluid rounded-3 shadow-lg"
                                        style={{ maxHeight: '400px', objectFit: 'cover' }}
                                    />
                                    <div className="position-absolute top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center">
                                        <div className="bg-white rounded-3 shadow p-4 mx-3">
                                            <div className="d-flex align-items-center mb-2">
                                                <FiCalendar className="text-primary me-2" />
                                                <strong>Meeting Scheduled!</strong>
                                            </div>
                                            <small className="text-muted">
                                                Your 30-minute meeting with John is confirmed for tomorrow at 2:00 PM
                                            </small>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        </Col>
                    </Row>
                </Container>
            </section>

            {/* Features Section */}
            <section id="features" className="py-5 bg-light">
                <Container>
                    <Row className="text-center mb-5">
                        <Col>
                            <motion.div
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.6 }}
                                viewport={{ once: true }}
                            >
                                <h2 className="display-5 fw-bold mb-3">Everything you need to schedule smarter</h2>
                                <p className="lead text-muted">
                                    Powerful features that make scheduling effortless for you and your clients
                                </p>
                            </motion.div>
                        </Col>
                    </Row>
                    <Row>
                        {features.map((feature, index) => (
                            <Col md={6} lg={4} key={index} className="mb-4">
                                <motion.div
                                    initial={{ opacity: 0, y: 30 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.6, delay: index * 0.1 }}
                                    viewport={{ once: true }}
                                >
                                    <Card className="h-100 border-0 shadow-sm hover-lift">
                                        <Card.Body className="text-center p-4">
                                            <div className="mb-3">{feature.icon}</div>
                                            <h5 className="fw-bold mb-3">{feature.title}</h5>
                                            <p className="text-muted">{feature.description}</p>
                                        </Card.Body>
                                    </Card>
                                </motion.div>
                            </Col>
                        ))}
                    </Row>
                </Container>
            </section>

            {/* Pricing Section */}
            <section id="pricing" className="py-5">
                <Container>
                    <Row className="text-center mb-5">
                        <Col>
                            <motion.div
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.6 }}
                                viewport={{ once: true }}
                            >
                                <h2 className="display-5 fw-bold mb-3">Simple, transparent pricing</h2>
                                <p className="lead text-muted">
                                    Choose the plan that's right for you. Start free, upgrade when you need more.
                                </p>
                            </motion.div>
                        </Col>
                    </Row>
                    <Row className="justify-content-center">
                        {pricingPlans.map((plan, index) => (
                            <Col md={6} lg={4} key={index} className="mb-4">
                                <motion.div
                                    initial={{ opacity: 0, y: 30 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.6, delay: index * 0.1 }}
                                    viewport={{ once: true }}
                                >
                                    <Card className={`h-100 ${plan.popular ? 'border-primary shadow-lg' : 'border-0 shadow-sm'} hover-lift position-relative`}>
                                        {plan.popular && (
                                            <div className="position-absolute top-0 start-50 translate-middle">
                                                <Badge bg="primary" className="px-3 py-2">Most Popular</Badge>
                                            </div>
                                        )}
                                        <Card.Body className="text-center p-4">
                                            <h4 className="fw-bold mb-3">{plan.name}</h4>
                                            <div className="mb-4">
                                                <h2 className="display-6 fw-bold text-primary mb-0">{plan.price}</h2>
                                                <small className="text-muted">/{plan.period}</small>
                                            </div>
                                            <ul className="list-unstyled mb-4">
                                                {plan.features.map((feature, featureIndex) => (
                                                    <li key={featureIndex} className="mb-2">
                                                        <FiCheck className="text-success me-2" />
                                                        {feature}
                                                    </li>
                                                ))}
                                            </ul>
                                            <Button
                                                variant={plan.popular ? "primary" : "outline-primary"}
                                                size="lg"
                                                className="w-100"
                                                onClick={() => navigate('/signup')}
                                            >
                                                {plan.buttonText}
                                            </Button>
                                        </Card.Body>
                                    </Card>
                                </motion.div>
                            </Col>
                        ))}
                    </Row>
                </Container>
            </section>

            {/* Testimonials Section */}
            <section id="testimonials" className="py-5 bg-light">
                <Container>
                    <Row className="text-center mb-5">
                        <Col>
                            <motion.div
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.6 }}
                                viewport={{ once: true }}
                            >
                                <h2 className="display-5 fw-bold mb-3">Loved by thousands of professionals</h2>
                                <p className="lead text-muted">
                                    See what our customers are saying about ScheduleMe
                                </p>
                            </motion.div>
                        </Col>
                    </Row>
                    <Row>
                        {testimonials.map((testimonial, index) => (
                            <Col md={6} lg={4} key={index} className="mb-4">
                                <motion.div
                                    initial={{ opacity: 0, y: 30 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.6, delay: index * 0.1 }}
                                    viewport={{ once: true }}
                                >
                                    <Card className="h-100 border-0 shadow-sm">
                                        <Card.Body className="p-4">
                                            <div className="mb-3">
                                                {[...Array(testimonial.rating)].map((_, i) => (
                                                    <FiStar key={i} className="text-warning me-1" fill="currentColor" />
                                                ))}
                                            </div>
                                            <p className="mb-4 fst-italic">"{testimonial.text}"</p>
                                            <div className="d-flex align-items-center">
                                                <img
                                                    src={testimonial.image}
                                                    alt={testimonial.name}
                                                    className="rounded-circle me-3"
                                                    width="50"
                                                    height="50"
                                                    style={{ objectFit: 'cover' }}
                                                />
                                                <div>
                                                    <h6 className="mb-0 fw-bold">{testimonial.name}</h6>
                                                    <small className="text-muted">{testimonial.role} at {testimonial.company}</small>
                                                </div>
                                            </div>
                                        </Card.Body>
                                    </Card>
                                </motion.div>
                            </Col>
                        ))}
                    </Row>
                </Container>
            </section>

            {/* CTA Section */}
            <section className="py-5 bg-primary text-white">
                <Container>
                    <Row className="text-center">
                        <Col>
                            <motion.div
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.6 }}
                                viewport={{ once: true }}
                            >
                                <h2 className="display-5 fw-bold mb-3">Ready to get started?</h2>
                                <p className="lead mb-4">
                                    Join thousands of professionals who trust ScheduleMe for their scheduling needs
                                </p>
                                <Button
                                    size="lg"
                                    variant="light"
                                    onClick={() => navigate('/signup')}
                                    className="px-5 py-3 me-3"
                                >
                                    Start Free Today
                                </Button>
                                <Button
                                    size="lg"
                                    variant="outline-light"
                                    className="px-5 py-3"
                                >
                                    Contact Sales
                                </Button>
                            </motion.div>
                        </Col>
                    </Row>
                </Container>
            </section>

            {/* Footer */}
            <footer className="py-5 bg-dark text-white">
                <Container>
                    <Row>
                        <Col md={6} lg={3} className="mb-4">
                            <h5 className="fw-bold mb-3 d-flex align-items-center">
                                <FiCalendar className="me-2" />
                                ScheduleMe
                            </h5>
                            <p className="text-light">
                                The easiest way to schedule meetings and manage your time effectively.
                            </p>
                            <div className="d-flex gap-3">
                                <Button variant="outline-light" size="sm">
                                    <FiMail />
                                </Button>
                                <Button variant="outline-light" size="sm">
                                    <FiGlobe />
                                </Button>
                                <Button variant="outline-light" size="sm">
                                    <FiSmartphone />
                                </Button>
                            </div>
                        </Col>
                        <Col md={6} lg={2} className="mb-4">
                            <h6 className="fw-bold mb-3">Product</h6>
                            <ul className="list-unstyled">
                                <li className="mb-2"><a href="#" className="text-light text-decoration-none">Features</a></li>
                                <li className="mb-2"><a href="#" className="text-light text-decoration-none">Pricing</a></li>
                                <li className="mb-2"><a href="#" className="text-light text-decoration-none">Integrations</a></li>
                                <li className="mb-2"><a href="#" className="text-light text-decoration-none">API</a></li>
                            </ul>
                        </Col>
                        <Col md={6} lg={2} className="mb-4">
                            <h6 className="fw-bold mb-3">Company</h6>
                            <ul className="list-unstyled">
                                <li className="mb-2"><a href="#" className="text-light text-decoration-none">About</a></li>
                                <li className="mb-2"><a href="#" className="text-light text-decoration-none">Blog</a></li>
                                <li className="mb-2"><a href="#" className="text-light text-decoration-none">Careers</a></li>
                                <li className="mb-2"><a href="#" className="text-light text-decoration-none">Contact</a></li>
                            </ul>
                        </Col>
                        <Col md={6} lg={2} className="mb-4">
                            <h6 className="fw-bold mb-3">Support</h6>
                            <ul className="list-unstyled">
                                <li className="mb-2"><a href="#" className="text-light text-decoration-none">Help Center</a></li>
                                <li className="mb-2"><a href="#" className="text-light text-decoration-none">Documentation</a></li>
                                <li className="mb-2"><a href="#" className="text-light text-decoration-none">Status</a></li>
                                <li className="mb-2"><a href="#" className="text-light text-decoration-none">Community</a></li>
                            </ul>
                        </Col>
                        <Col md={6} lg={3} className="mb-4">
                            <h6 className="fw-bold mb-3">Newsletter</h6>
                            <p className="text-light">Stay updated with our latest features and news.</p>
                            <div className="d-flex">
                                <Form.Control
                                    type="email"
                                    placeholder="Enter your email"
                                    className="me-2"
                                />
                                <Button variant="primary">Subscribe</Button>
                            </div>
                        </Col>
                    </Row>
                    <hr className="my-4" />
                    <Row className="align-items-center">
                        <Col md={6}>
                            <p className="text-light mb-0">© 2024 ScheduleMe. All rights reserved.</p>
                        </Col>
                        <Col md={6} className="text-md-end">
                            <a href="#" className="text-light text-decoration-none me-3">Privacy Policy</a>
                            <a href="#" className="text-light text-decoration-none me-3">Terms of Service</a>
                            <a href="#" className="text-light text-decoration-none">Cookie Policy</a>
                        </Col>
                    </Row>
                </Container>
            </footer>

            {/* Custom Styles */}
            <style jsx>{`
                .hero-section {
                    background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
                    min-height: 100vh;
                    display: flex;
                    align-items: center;
                }
                
                .min-vh-100 {
                    min-height: 100vh;
                }
                
                .hover-lift {
                    transition: transform 0.3s ease, box-shadow 0.3s ease;
                }
                
                .hover-lift:hover {
                    transform: translateY(-10px);
                    box-shadow: 0 20px 40px rgba(0,0,0,0.1) !important;
                }
                
                .bg-gradient {
                    background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
                }

                .hero-image-container {
                    max-width: 600px;
                    margin: 0 auto;
                }
            `}</style>
        </>
    );
};

export default LandingPage;

