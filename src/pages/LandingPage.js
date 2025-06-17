import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Button, Card, Badge, Form } from 'react-bootstrap';
import { motion, useScroll, useTransform } from 'framer-motion';
import {
    FiCalendar, FiClock, FiUsers, FiZap, FiCheck, FiArrowRight,
    FiStar, FiShield, FiGlobe, FiSmartphone, FiMail, FiUser,
    FiPlay, FiTrendingUp, FiAward, FiHeart
} from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';

const LandingPage = () => {
    const navigate = useNavigate();
    const { scrollYProgress } = useScroll();
    const y = useTransform(scrollYProgress, [0, 1], [0, -50]);
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

    useEffect(() => {
        const handleMouseMove = (e) => {
            setMousePosition({ x: e.clientX, y: e.clientY });
        };
        window.addEventListener('mousemove', handleMouseMove);
        return () => window.removeEventListener('mousemove', handleMouseMove);
    }, []);

    const features = [
        {
            icon: <FiCalendar size={40} className="feature-icon" />,
            title: "Smart Scheduling",
            description: "AI-powered scheduling that learns your preferences and automatically finds the best meeting times",
            color: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
        },
        {
            icon: <FiClock size={40} className="feature-icon" />,
            title: "Global Time Zones",
            description: "Intelligent time zone handling with real-time conversion and automatic daylight saving adjustments",
            color: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)"
        },
        {
            icon: <FiUsers size={40} className="feature-icon" />,
            title: "Team Collaboration",
            description: "Advanced team scheduling with resource management, conflict resolution, and shared availability",
            color: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)"
        },
        {
            icon: <FiZap size={40} className="feature-icon" />,
            title: "Lightning Fast",
            description: "Instant notifications, real-time updates, and seamless synchronization across all your devices",
            color: "linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)"
        },
        {
            icon: <FiShield size={40} className="feature-icon" />,
            title: "Enterprise Security",
            description: "Bank-level encryption, GDPR compliance, and SOC 2 Type II certification for complete peace of mind",
            color: "linear-gradient(135deg, #fa709a 0%, #fee140 100%)"
        },
        {
            icon: <FiTrendingUp size={40} className="feature-icon" />,
            title: "Analytics & Insights",
            description: "Comprehensive analytics dashboard with meeting metrics, productivity insights, and custom reports",
            color: "linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)"
        }
    ];

    const testimonials = [
        {
            name: "Sarah Johnson",
            role: "VP of Product",
            company: "TechCorp",
            image: "https://images.pexels.com/photos/2379005/pexels-photo-2379005.jpeg?auto=compress&cs=tinysrgb&dpr=1&w=500",
            rating: 5,
            text: "ScheduleMe revolutionized our meeting culture. 300% increase in productivity and zero scheduling conflicts.",
            metric: "300% productivity boost"
        },
        {
            name: "David Chen",
            role: "Sales Director",
            company: "GrowthLab",
            image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
            rating: 5,
            text: "Our sales team closed 40% more deals thanks to ScheduleMe's seamless client booking experience.",
            metric: "40% more deals closed"
        },
        {
            name: "Emily Rodriguez",
            role: "Digital Consultant",
            company: "Rodriguez Consulting",
            image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face",
            rating: 5,
            text: "My clients love the professional booking experience. It's like having a personal assistant 24/7.",
            metric: "24/7 availability"
        }
    ];

    const pricingPlans = [
        {
            name: "Starter",
            price: "$0",
            period: "forever",
            features: [
                "5 meeting types",
                "Unlimited bookings",
                "Basic calendar sync",
                "Email notifications",
                "Mobile app access"
            ],
            buttonText: "Start Free",
            popular: false,
            gradient: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
        },
        {
            name: "Professional",
            price: "$15",
            period: "per month",
            features: [
                "Unlimited meeting types",
                "Advanced scheduling logic",
                "All calendar integrations",
                "Custom branding",
                "Analytics dashboard",
                "Priority support",
                "API access",
                "Team collaboration"
            ],
            buttonText: "Start 14-Day Trial",
            popular: true,
            gradient: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)"
        },
        {
            name: "Enterprise",
            price: "$39",
            period: "per user/month",
            features: [
                "Everything in Professional",
                "Advanced team features",
                "SSO & SAML integration",
                "Custom workflows",
                "Dedicated success manager",
                "24/7 phone support",
                "Advanced security",
                "Custom integrations"
            ],
            buttonText: "Contact Sales",
            popular: false,
            gradient: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)"
        }
    ];

    const stats = [
        { number: "50K+", label: "Active Users", icon: <FiUsers /> },
        { number: "2M+", label: "Meetings Scheduled", icon: <FiCalendar /> },
        { number: "99.9%", label: "Uptime", icon: <FiShield /> },
        { number: "4.9/5", label: "User Rating", icon: <FiStar /> }
    ];

    return (
        <>
            {/* Floating Background Elements */}
            <div className="floating-elements">
                <div className="floating-circle circle-1"></div>
                <div className="floating-circle circle-2"></div>
                <div className="floating-circle circle-3"></div>
                <div className="floating-triangle triangle-1"></div>
                <div className="floating-triangle triangle-2"></div>
            </div>

            {/* Hero Section */}
            <motion.section
                className="hero-section"
                style={{ y }}
            >
                <div className="hero-background"></div>
                <Container className="position-relative">
                    <Row className="align-items-center min-vh-100">
                        <Col lg={6}>
                            <motion.div
                                initial={{ opacity: 0, x: -100 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 1, ease: "easeOut" }}
                            >
                                {/* <div className="brand-container mb-5">
                                    <motion.div
                                        className="brand-logo"
                                        whileHover={{ scale: 1.05, rotate: 5 }}
                                        transition={{ type: "spring", stiffness: 300 }}
                                    >
                                        <FiCalendar size={48} />
                                    </motion.div>
                                    <h1 className="brand-name">ScheduleMe</h1>
                                </div> */}

                                <h2 className="hero-title mb-4">
                                    The Future of
                                    <span className="gradient-text"> Smart Scheduling</span>
                                </h2>

                                <p className="hero-subtitle mb-5">
                                    Experience the next generation of meeting management with AI-powered scheduling,
                                    seamless integrations, and beautiful user experiences that your clients will love.
                                </p>

                                <div className="hero-buttons mb-5">
                                    <motion.div
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                    >
                                        <Button
                                            size="lg"
                                            className="cta-button primary-cta me-4"
                                            onClick={() => navigate('/signup')}
                                        >
                                            <span>Start Free Trial</span>
                                            <FiArrowRight className="ms-2" />
                                        </Button>
                                    </motion.div>

                                    <motion.div
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        className="d-inline-block"
                                    >
                                        <Button
                                            size="lg"
                                            className="cta-button secondary-cta"
                                        >
                                            <FiPlay className="me-2" />
                                            <span>Watch Demo</span>
                                        </Button>
                                    </motion.div>
                                </div>

                                <div className="hero-badges">
                                    <Badge className="hero-badge me-3">
                                        <FiCheck className="me-2" />
                                        14-day free trial
                                    </Badge>
                                    <Badge className="hero-badge me-3">
                                        <FiShield className="me-2" />
                                        No credit card required
                                    </Badge>
                                    <Badge className="hero-badge">
                                        <FiZap className="me-2" />
                                        Setup in 2 minutes
                                    </Badge>
                                </div>
                            </motion.div>
                        </Col>

                        <Col lg={6}>
                            <motion.div
                                initial={{ opacity: 0, x: 100, scale: 0.8 }}
                                animate={{ opacity: 1, x: 0, scale: 1 }}
                                transition={{ duration: 1.2, ease: "easeOut", delay: 0.3 }}
                                className="hero-image-container"
                            >
                                <div className="hero-dashboard">
                                    <div className="dashboard-header">
                                        <div className="dashboard-controls">
                                            <div className="control-dot red"></div>
                                            <div className="control-dot yellow"></div>
                                            <div className="control-dot green"></div>
                                        </div>
                                        <div className="dashboard-title">ScheduleMe Dashboard</div>
                                    </div>

                                    <div className="dashboard-content">
                                        <div className="calendar-preview">
                                            <div className="calendar-grid">
                                                {[...Array(7)].map((_, i) => (
                                                    <div key={i} className={`calendar-day ${i === 2 || i === 4 ? 'has-meeting' : ''}`}>
                                                        {i + 1}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        <div className="meeting-cards">
                                            <motion.div
                                                className="meeting-card"
                                                animate={{ y: [0, -10, 0] }}
                                                transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
                                            >
                                                <FiUsers className="meeting-icon" />
                                                <div className="meeting-info">
                                                    <div className="meeting-title">Team Standup</div>
                                                    <div className="meeting-time">Today, 10:00 AM</div>
                                                </div>
                                            </motion.div>

                                            <motion.div
                                                className="meeting-card"
                                                animate={{ y: [0, -10, 0] }}
                                                transition={{ duration: 2, repeat: Infinity, delay: 1 }}
                                            >
                                                <FiCalendar className="meeting-icon" />
                                                <div className="meeting-info">
                                                    <div className="meeting-title">Client Review</div>
                                                    <div className="meeting-time">Tomorrow, 2:00 PM</div>
                                                </div>
                                            </motion.div>
                                        </div>
                                    </div>
                                </div>

                                <motion.div
                                    className="floating-notification"
                                    animate={{
                                        y: [0, -20, 0],
                                        opacity: [0.8, 1, 0.8]
                                    }}
                                    transition={{ duration: 3, repeat: Infinity }}
                                >
                                    <FiCheck className="notification-icon" />
                                    <div className="notification-text">
                                        <strong>Meeting Confirmed!</strong>
                                        <br />
                                        <small>Client call scheduled for 3:00 PM</small>
                                    </div>
                                </motion.div>
                            </motion.div>
                        </Col>
                    </Row>
                </Container>
            </motion.section>

            {/* Stats Section */}
            <section className="stats-section">
                <Container>
                    <motion.div
                        initial={{ opacity: 0, y: 50 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                        viewport={{ once: true }}
                    >
                        <Row className="justify-content-center">
                            {stats.map((stat, index) => (
                                <Col md={6} lg={3} key={index} className="text-center mb-4">
                                    <motion.div
                                        className="stat-card"
                                        whileHover={{ scale: 1.05, y: -10 }}
                                        transition={{ type: "spring", stiffness: 300 }}
                                    >
                                        <div className="stat-icon">{stat.icon}</div>
                                        <h3 className="stat-number">{stat.number}</h3>
                                        <p className="stat-label">{stat.label}</p>
                                    </motion.div>
                                </Col>
                            ))}
                        </Row>
                    </motion.div>
                </Container>
            </section>

            {/* Features Section */}
            <section id="features" className="features-section">
                <Container>
                    <motion.div
                        initial={{ opacity: 0, y: 50 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                        viewport={{ once: true }}
                        className="text-center mb-5"
                    >
                        <h2 className="section-title mb-4">
                            Powerful Features for Modern Teams
                        </h2>
                        <p className="section-subtitle">
                            Experience scheduling like never before with our cutting-edge features
                            designed to make your workflow seamless and efficient.
                        </p>
                    </motion.div>

                    <Row>
                        {features.map((feature, index) => (
                            <Col md={6} lg={4} key={index} className="mb-5">
                                <motion.div
                                    initial={{ opacity: 0, y: 50 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.8, delay: index * 0.1 }}
                                    viewport={{ once: true }}
                                    whileHover={{ y: -20 }}
                                >
                                    <Card className="feature-card h-100">
                                        <Card.Body className="p-4">
                                            <div
                                                className="feature-icon-container mb-4"
                                                style={{ background: feature.color }}
                                            >
                                                {feature.icon}
                                            </div>
                                            <h5 className="feature-title mb-3">{feature.title}</h5>
                                            <p className="feature-description">{feature.description}</p>
                                        </Card.Body>
                                    </Card>
                                </motion.div>
                            </Col>
                        ))}
                    </Row>
                </Container>
            </section>

            {/* Pricing Section */}
            <section id="pricing" className="pricing-section">
                <Container>
                    <motion.div
                        initial={{ opacity: 0, y: 50 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                        viewport={{ once: true }}
                        className="text-center mb-5"
                    >
                        <h2 className="section-title mb-4">
                            Choose Your Perfect Plan
                        </h2>
                        <p className="section-subtitle">
                            Flexible pricing that grows with your business. Start free and upgrade when you're ready.
                        </p>
                    </motion.div>

                    <Row className="justify-content-center">
                        {pricingPlans.map((plan, index) => (
                            <Col md={6} lg={4} key={index} className="mb-4">
                                <motion.div
                                    initial={{ opacity: 0, y: 50, scale: 0.9 }}
                                    whileInView={{ opacity: 1, y: 0, scale: 1 }}
                                    transition={{ duration: 0.8, delay: index * 0.1 }}
                                    viewport={{ once: true }}
                                    whileHover={{ y: -20, scale: 1.02 }}
                                >
                                    <Card className={`pricing-card h-100 ${plan.popular ? 'popular-plan' : ''}`}>
                                        {plan.popular && (
                                            <div className="popular-badge">
                                                <FiAward className="me-1" />
                                                Most Popular
                                            </div>
                                        )}

                                        <Card.Body className="p-4 text-center">
                                            <div
                                                className="plan-icon mb-4"
                                                style={{ background: plan.gradient }}
                                            >
                                                <FiCalendar size={32} />
                                            </div>

                                            <h4 className="plan-name mb-3">{plan.name}</h4>

                                            <div className="plan-price mb-4">
                                                <span className="price-amount">{plan.price}</span>
                                                <span className="price-period">/{plan.period}</span>
                                            </div>

                                            <ul className="plan-features mb-4">
                                                {plan.features.map((feature, featureIndex) => (
                                                    <li key={featureIndex}>
                                                        <FiCheck className="feature-check" />
                                                        {feature}
                                                    </li>
                                                ))}
                                            </ul>

                                            <motion.div
                                                whileHover={{ scale: 1.05 }}
                                                whileTap={{ scale: 0.95 }}
                                            >
                                                <Button
                                                    className={`plan-button w-100 ${plan.popular ? 'popular-button' : ''}`}
                                                    size="lg"
                                                    onClick={() => navigate('/signup')}
                                                >
                                                    {plan.buttonText}
                                                </Button>
                                            </motion.div>
                                        </Card.Body>
                                    </Card>
                                </motion.div>
                            </Col>
                        ))}
                    </Row>
                </Container>
            </section>

            {/* Testimonials Section */}
            <section className="testimonials-section">
                <Container>
                    <motion.div
                        initial={{ opacity: 0, y: 50 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                        viewport={{ once: true }}
                        className="text-center mb-5"
                    >
                        <h2 className="section-title mb-4">
                            Loved by Professionals Worldwide
                        </h2>
                        <p className="section-subtitle">
                            Join thousands of satisfied customers who have transformed their scheduling workflow
                        </p>
                    </motion.div>

                    <Row>
                        {testimonials.map((testimonial, index) => (
                            <Col md={6} lg={4} key={index} className="mb-4">
                                <motion.div
                                    initial={{ opacity: 0, y: 50, rotate: -5 }}
                                    whileInView={{ opacity: 1, y: 0, rotate: 0 }}
                                    transition={{ duration: 0.8, delay: index * 0.1 }}
                                    viewport={{ once: true }}
                                    whileHover={{ y: -10, rotate: 2 }}
                                >
                                    <Card className="testimonial-card h-100">
                                        <Card.Body className="p-4">
                                            <div className="testimonial-header mb-3">
                                                <div className="rating mb-2">
                                                    {[...Array(testimonial.rating)].map((_, i) => (
                                                        <FiStar key={i} className="star-filled" />
                                                    ))}
                                                </div>
                                                <div className="metric-badge">
                                                    {testimonial.metric}
                                                </div>
                                            </div>

                                            <p className="testimonial-text mb-4">
                                                "{testimonial.text}"
                                            </p>

                                            <div className="testimonial-author">
                                                <img
                                                    src={testimonial.image}
                                                    alt={testimonial.name}
                                                    className="author-avatar"
                                                />
                                                <div className="author-info">
                                                    <h6 className="author-name">{testimonial.name}</h6>
                                                    <p className="author-role">
                                                        {testimonial.role} at {testimonial.company}
                                                    </p>
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
            <section className="cta-section">
                <Container>
                    <Row className="justify-content-center text-center">
                        <Col lg={8}>
                            <motion.div
                                initial={{ opacity: 0, scale: 0.8 }}
                                whileInView={{ opacity: 1, scale: 1 }}
                                transition={{ duration: 0.8 }}
                                viewport={{ once: true }}
                            >
                                <div className="cta-content">
                                    <h2 className="cta-title mb-4">
                                        Ready to Transform Your Scheduling?
                                    </h2>
                                    <p className="cta-subtitle mb-5">
                                        Join over 50,000 professionals who trust ScheduleMe to manage their time effectively.
                                        Start your free trial today and see the difference.
                                    </p>

                                    <div className="cta-buttons">
                                        <motion.div
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                            className="d-inline-block me-4"
                                        >
                                            <Button
                                                size="lg"
                                                className="cta-button primary-cta"
                                                onClick={() => navigate('/signup')}
                                            >
                                                <span>Start Free Trial</span>
                                                <FiArrowRight className="ms-2" />
                                            </Button>
                                        </motion.div>

                                        <motion.div
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                            className="d-inline-block"
                                        >
                                            <Button
                                                size="lg"
                                                className="cta-button secondary-cta"
                                            >
                                                <FiMail className="me-2" />
                                                <span>Contact Sales</span>
                                            </Button>
                                        </motion.div>
                                    </div>

                                    <div className="cta-features mt-5">
                                        <div className="cta-feature">
                                            <FiCheck className="me-2" />
                                            <span>14-day free trial</span>
                                        </div>
                                        <div className="cta-feature">
                                            <FiShield className="me-2" />
                                            <span>No setup fees</span>
                                        </div>
                                        <div className="cta-feature">
                                            <FiHeart className="me-2" />
                                            <span>Cancel anytime</span>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        </Col>
                    </Row>
                </Container>
            </section>

            {/* Footer */}
            <footer className="footer-section">
                <Container>
                    <Row>
                        <Col md={6} lg={4} className="mb-4">
                            <div className="footer-brand mb-4">
                                <FiCalendar size={32} className="me-3" />
                                <h5 className="brand-name mb-0">ScheduleMe</h5>
                            </div>
                            <p className="footer-description mb-4">
                                The most intuitive scheduling platform that helps professionals and teams
                                manage their time effectively with AI-powered automation.
                            </p>
                            <div className="social-links">
                                <Button className="social-link">
                                    <FiMail />
                                </Button>
                                <Button className="social-link">
                                    <FiGlobe />
                                </Button>
                                <Button className="social-link">
                                    <FiSmartphone />
                                </Button>
                            </div>
                        </Col>

                        <Col md={6} lg={2} className="mb-4">
                            <h6 className="footer-title">Product</h6>
                            <ul className="footer-links">
                                <li><a href="#">Features</a></li>
                                <li><a href="#">Pricing</a></li>
                                <li><a href="#">Integrations</a></li>
                                <li><a href="#">API</a></li>
                                <li><a href="#">Mobile Apps</a></li>
                            </ul>
                        </Col>

                        <Col md={6} lg={2} className="mb-4">
                            <h6 className="footer-title">Company</h6>
                            <ul className="footer-links">
                                <li><a href="#">About Us</a></li>
                                <li><a href="#">Blog</a></li>
                                <li><a href="#">Careers</a></li>
                                <li><a href="#">Press</a></li>
                                <li><a href="#">Contact</a></li>
                            </ul>
                        </Col>

                        <Col md={6} lg={2} className="mb-4">
                            <h6 className="footer-title">Support</h6>
                            <ul className="footer-links">
                                <li><a href="#">Help Center</a></li>
                                <li><a href="#">Documentation</a></li>
                                <li><a href="#">Status Page</a></li>
                                <li><a href="#">Community</a></li>
                                <li><a href="#">Security</a></li>
                            </ul>
                        </Col>

                        <Col md={6} lg={2} className="mb-4">
                            <h6 className="footer-title">Newsletter</h6>
                            <p className="newsletter-text mb-3">
                                Get the latest updates and productivity tips.
                            </p>
                            <Form className="newsletter-form">
                                <Form.Control
                                    type="email"
                                    placeholder="Enter email"
                                    className="newsletter-input mb-2"
                                />
                                <Button className="newsletter-button w-100">
                                    Subscribe
                                </Button>
                            </Form>
                        </Col>
                    </Row>

                    <hr className="footer-divider" />

                    <Row className="align-items-center">
                        <Col md={6}>
                            <p className="copyright">
                                © 2024 ScheduleMe. All rights reserved.
                            </p>
                        </Col>
                        <Col md={6} className="text-md-end">
                            <div className="legal-links">
                                <a href="#">Privacy Policy</a>
                                <a href="#">Terms of Service</a>
                                <a href="#">Cookie Policy</a>
                            </div>
                        </Col>
                    </Row>
                </Container>
            </footer>

            {/* Custom Styles */}
            <style jsx>{`
                /* Base Styles */
                * {
                    box-sizing: border-box;
                }

                body {
                    font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
                    line-height: 1.6;
                    color: #2d3748;
                    overflow-x: hidden;
                }

                /* Floating Background Elements */
                .floating-elements {
                    position: fixed;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    pointer-events: none;
                    z-index: 0;
                }

                .floating-circle {
                    position: absolute;
                    border-radius: 50%;
                    background: linear-gradient(135deg, rgba(103, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%);
                    animation: float 6s ease-in-out infinite;
                }

                .circle-1 {
                    width: 200px;
                    height: 200px;
                    top: 10%;
                    left: 5%;
                    animation-delay: 0s;
                }

                .circle-2 {
                    width: 150px;
                    height: 150px;
                    top: 60%;
                    right: 10%;
                    animation-delay: 2s;
                }

                .circle-3 {
                    width: 100px;
                    height: 100px;
                    bottom: 20%;
                    left: 15%;
                    animation-delay: 4s;
                }

                .floating-triangle {
                    position: absolute;
                    width: 0;
                    height: 0;
                    animation: float 8s ease-in-out infinite;
                }

                .triangle-1 {
                    border-left: 25px solid transparent;
                    border-right: 25px solid transparent;
                    border-bottom: 50px solid rgba(240, 147, 251, 0.1);
                    top: 30%;
                    right: 5%;
                    animation-delay: 1s;
                }

                .triangle-2 {
                    border-left: 20px solid transparent;
                    border-right: 20px solid transparent;
                    border-bottom: 40px solid rgba(67, 233, 123, 0.1);
                    bottom: 40%;
                    right: 20%;
                    animation-delay: 3s;
                }

                @keyframes float {
                    0%, 100% { transform: translateY(0px) rotate(0deg); }
                    50% { transform: translateY(-20px) rotate(180deg); }
                }

                /* Hero Section */
                .hero-section {
                    position: relative;
                    min-height: 100vh;
                    display: flex;
                    align-items: center;
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    overflow: hidden;
                }

                .hero-background {
                    position: absolute;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background: 
                        radial-gradient(circle at 20% 80%, rgba(120, 119, 198, 0.3) 0%, transparent 50%),
                        radial-gradient(circle at 80% 20%, rgba(255, 119, 198, 0.3) 0%, transparent 50%),
                        radial-gradient(circle at 40% 40%, rgba(120, 219, 255, 0.3) 0%, transparent 50%);
                    animation: backgroundShift 10s ease-in-out infinite;
                }

                @keyframes backgroundShift {
                    0%, 100% { transform: scale(1) rotate(0deg); }
                    50% { transform: scale(1.1) rotate(180deg); }
                }

                .brand-container {
                    display: flex;
                    align-items: center;
                    gap: 1rem;
                }

                .brand-logo {
                    width: 80px;
                    height: 80px;
                    background: rgba(255, 255, 255, 0.2);
                    backdrop-filter: blur(20px);
                    border-radius: 20px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: white;
                    border: 1px solid rgba(255, 255, 255, 0.3);
                }

                .brand-name {
                    font-size: 2.5rem;
                    font-weight: 800;
                    color: white;
                    margin: 0;
                    text-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
                }

                .hero-title {
                    font-size: 4rem;
                    font-weight: 900;
                    color: white;
                    line-height: 1.1;
                    text-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
                }

                .gradient-text {
                    background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                    background-clip: text;
                }

                .hero-subtitle {
                    font-size: 1.25rem;
                    color: rgba(255, 255, 255, 0.9);
                    font-weight: 400;
                    max-width: 600px;
                    line-height: 1.6;
                }

                .hero-buttons {
                    display: flex;
                    gap: 1rem;
                    flex-wrap: wrap;
                }

                .cta-button {
                    border: none;
                    padding: 1rem 2rem;
                    border-radius: 50px;
                    font-weight: 600;
                    font-size: 1.1rem;
                    transition: all 0.3s ease;
                    position: relative;
                    overflow: hidden;
                }

                .primary-cta {
                    background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
                    color: white;
                    box-shadow: 0 10px 30px rgba(240, 147, 251, 0.4);
                }

                .primary-cta:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 15px 40px rgba(240, 147, 251, 0.6);
                }

                .secondary-cta {
                    background: rgba(255, 255, 255, 0.2);
                    color: white;
                    backdrop-filter: blur(20px);
                    border: 1px solid rgba(255, 255, 255, 0.3);
                }

                .secondary-cta:hover {
                    background: rgba(255, 255, 255, 0.3);
                    transform: translateY(-2px);
                }

                .hero-badges {
                    display: flex;
                    gap: 0.5rem;
                    flex-wrap: wrap;
                }

                .hero-badge {
                    background: rgba(255, 255, 255, 0.2);
                    color: white;
                    padding: 0.5rem 1rem;
                    border-radius: 25px;
                    font-size: 0.9rem;
                    font-weight: 500;
                    backdrop-filter: blur(20px);
                    border: 1px solid rgba(255, 255, 255, 0.3);
                }

                /* Hero Dashboard */
                .hero-image-container {
                    position: relative;
                    max-width: 600px;
                    margin: 0 auto;
                }

                .hero-dashboard {
                    background: rgba(255, 255, 255, 0.1);
                    backdrop-filter: blur(20px);
                    border-radius: 20px;
                    border: 1px solid rgba(255, 255, 255, 0.2);
                    overflow: hidden;
                    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
                }

                .dashboard-header {
                    background: rgba(255, 255, 255, 0.1);
                    padding: 1rem;
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
                }

                .dashboard-controls {
                    display: flex;
                    gap: 0.5rem;
                }

                .control-dot {
                    width: 12px;
                    height: 12px;
                    border-radius: 50%;
                }

                .control-dot.red { background: #ff5f57; }
                .control-dot.yellow { background: #ffbd2e; }
                .control-dot.green { background: #28ca42; }

                .dashboard-title {
                    color: white;
                    font-weight: 600;
                    font-size: 0.9rem;
                }

                .dashboard-content {
                    padding: 2rem;
                }

                .calendar-preview {
                    background: rgba(255, 255, 255, 0.1);
                    border-radius: 12px;
                    padding: 1rem;
                    margin-bottom: 1.5rem;
                }

                .calendar-grid {
                    display: grid;
                    grid-template-columns: repeat(7, 1fr);
                    gap: 0.5rem;
                }

                .calendar-day {
                    aspect-ratio: 1;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    background: rgba(255, 255, 255, 0.1);
                    border-radius: 8px;
                    color: white;
                    font-weight: 500;
                    cursor: pointer;
                    transition: all 0.3s ease;
                }

                .calendar-day.has-meeting {
                    background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
                    box-shadow: 0 4px 15px rgba(240, 147, 251, 0.4);
                }

                .meeting-cards {
                    display: flex;
                    flex-direction: column;
                    gap: 1rem;
                }

                .meeting-card {
                    background: rgba(255, 255, 255, 0.1);
                    border-radius: 12px;
                    padding: 1rem;
                    display: flex;
                    align-items: center;
                    gap: 1rem;
                    backdrop-filter: blur(10px);
                    border: 1px solid rgba(255, 255, 255, 0.1);
                }

                .meeting-icon {
                    width: 40px;
                    height: 40px;
                    background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
                    border-radius: 10px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: white;
                    font-size: 1.2rem;
                }

                .meeting-info {
                    flex: 1;
                }

                .meeting-title {
                    color: white;
                    font-weight: 600;
                    margin-bottom: 0.25rem;
                }

                .meeting-time {
                    color: rgba(255, 255, 255, 0.7);
                    font-size: 0.9rem;
                }

                .floating-notification {
                    position: absolute;
                    top: 20px;
                    right: 20px;
                    background: rgba(255, 255, 255, 0.95);
                    backdrop-filter: blur(20px);
                    border-radius: 12px;
                    padding: 1rem;
                    display: flex;
                    align-items: center;
                    gap: 0.75rem;
                    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
                    border: 1px solid rgba(255, 255, 255, 0.3);
                    max-width: 250px;
                }

                .notification-icon {
                    width: 24px;
                    height: 24px;
                    background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: white;
                    font-size: 0.8rem;
                }

                .notification-text {
                    font-size: 0.85rem;
                    color: #2d3748;
                }

                /* Stats Section */
                .stats-section {
                    padding: 5rem 0;
                    background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
                }

                .stat-card {
                    background: rgba(255, 255, 255, 0.8);
                    backdrop-filter: blur(20px);
                    border-radius: 20px;
                    padding: 2rem;
                    border: 1px solid rgba(255, 255, 255, 0.3);
                    transition: all 0.3s ease;
                    cursor: pointer;
                }

                .stat-icon {
                    width: 60px;
                    height: 60px;
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    border-radius: 15px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: white;
                    font-size: 1.5rem;
                    margin: 0 auto 1rem;
                }

                .stat-number {
                    font-size: 3rem;
                    font-weight: 900;
                    color: #2d3748;
                    margin-bottom: 0.5rem;
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                    background-clip: text;
                }

                .stat-label {
                    color: #718096;
                    font-weight: 500;
                    margin: 0;
                }

                /* Features Section */
                .features-section {
                    padding: 6rem 0;
                    background: #ffffff;
                }

                .section-title {
                    font-size: 3rem;
                    font-weight: 800;
                    color: #2d3748;
                    margin-bottom: 1rem;
                }

                .section-subtitle {
                    font-size: 1.25rem;
                    color: #718096;
                    max-width: 600px;
                    margin: 0 auto;
                }

                .feature-card {
                    background: rgba(255, 255, 255, 0.8);
                    backdrop-filter: blur(20px);
                    border: 1px solid rgba(255, 255, 255, 0.3);
                    border-radius: 20px;
                    transition: all 0.3s ease;
                    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.08);
                    cursor: pointer;
                }

                .feature-card:hover {
                    box-shadow: 0 20px 50px rgba(0, 0, 0, 0.15);
                    border-color: rgba(103, 126, 234, 0.3);
                }

                .feature-icon-container {
                    width: 80px;
                    height: 80px;
                    border-radius: 20px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: white;
                }

                .feature-icon {
                    color: white;
                }

                .feature-title {
                    font-size: 1.5rem;
                    font-weight: 700;
                    color: #2d3748;
                }

                .feature-description {
                    color: #718096;
                    line-height: 1.6;
                    margin: 0;
                }

                /* Pricing Section */
                .pricing-section {
                    padding: 6rem 0;
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    color: white;
                }

                .pricing-section .section-title,
                .pricing-section .section-subtitle {
                    color: white;
                }

                .pricing-card {
                    background: rgba(255, 255, 255, 0.1);
                    backdrop-filter: blur(20px);
                    border: 1px solid rgba(255, 255, 255, 0.2);
                    border-radius: 20px;
                    transition: all 0.3s ease;
                    position: relative;
                    overflow: hidden;
                }

                .pricing-card:hover {
                    transform: translateY(-5px);
                    box-shadow: 0 25px 50px rgba(0, 0, 0, 0.2);
                }

                .popular-plan {
                    border-color: rgba(240, 147, 251, 0.5);
                    box-shadow: 0 15px 40px rgba(240, 147, 251, 0.3);
                }

                .popular-badge {
                    position: absolute;
                    top: -15px;
                    left: 50%;
                    transform: translateX(-50%);
                    background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
                    color: white;
                    padding: 0.5rem 1.5rem;
                    border-radius: 25px;
                    font-weight: 600;
                    font-size: 0.9rem;
                    box-shadow: 0 5px 15px rgba(240, 147, 251, 0.4);
                }

                .plan-icon {
                    width: 80px;
                    height: 80px;
                    border-radius: 20px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: white;
                    margin: 0 auto;
                }

                .plan-name {
                    font-size: 1.5rem;
                    font-weight: 700;
                    color: white;
                }

                .plan-price {
                    margin-bottom: 2rem;
                }

                .price-amount {
                    font-size: 3.5rem;
                    font-weight: 900;
                    color: white;
                }

                .price-period {
                    font-size: 1rem;
                    color: rgba(255, 255, 255, 0.7);
                }

                .plan-features {
                    list-style: none;
                    padding: 0;
                    margin: 0;
                    text-align: left;
                }

                .plan-features li {
                    display: flex;
                    align-items: center;
                    padding: 0.5rem 0;
                    color: rgba(255, 255, 255, 0.9);
                }

                .feature-check {
                    color: #43e97b;
                    margin-right: 0.75rem;
                    font-weight: bold;
                }

                .plan-button {
                    background: rgba(255, 255, 255, 0.2);
                    border: 1px solid rgba(255, 255, 255, 0.3);
                    color: white;
                    font-weight: 600;
                    border-radius: 50px;
                    padding: 0.75rem 2rem;
                    transition: all 0.3s ease;
                }

                .plan-button:hover {
                    background: rgba(255, 255, 255, 0.3);
                    transform: translateY(-2px);
                }

                .popular-button {
                    background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
                    border: none;
                    box-shadow: 0 10px 30px rgba(240, 147, 251, 0.4);
                }

                .popular-button:hover {
                    box-shadow: 0 15px 40px rgba(240, 147, 251, 0.6);
                }

                /* Testimonials Section */
                .testimonials-section {
                    padding: 6rem 0;
                    background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
                }

                .testimonial-card {
                    background: rgba(255, 255, 255, 0.8);
                    backdrop-filter: blur(20px);
                    border: 1px solid rgba(255, 255, 255, 0.3);
                    border-radius: 20px;
                    transition: all 0.3s ease;
                    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.08);
                }

                .testimonial-card:hover {
                    box-shadow: 0 20px 50px rgba(0, 0, 0, 0.15);
                }

                .testimonial-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    flex-wrap: wrap;
                    gap: 1rem;
                }

                .rating {
                    display: flex;
                    gap: 0.25rem;
                }

                .star-filled {
                    color: #ffd700;
                    fill: currentColor;
                }

                .metric-badge {
                    background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);
                    color: white;
                    padding: 0.25rem 0.75rem;
                    border-radius: 15px;
                    font-size: 0.8rem;
                    font-weight: 600;
                }

                .testimonial-text {
                    font-size: 1.1rem;
                    line-height: 1.6;
                    color: #2d3748;
                    font-style: italic;
                }

                .testimonial-author {
                    display: flex;
                    align-items: center;
                    gap: 1rem;
                }

                .author-avatar {
                    width: 50px;
                    height: 50px;
                    border-radius: 50%;
                    object-fit: cover;
                    border: 3px solid rgba(103, 126, 234, 0.2);
                }

                .author-name {
                    font-weight: 700;
                    color: #2d3748;
                    margin-bottom: 0.25rem;
                }

                .author-role {
                    color: #718096;
                    font-size: 0.9rem;
                    margin: 0;
                }

                /* CTA Section */
                .cta-section {
                    padding: 6rem 0;
                    background: linear-gradient(135deg, #2d3748 0%, #4a5568 100%);
                    color: white;
                    position: relative;
                    overflow: hidden;
                }

                .cta-section::before {
                    content: '';
                    position: absolute;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background: 
                        radial-gradient(circle at 20% 80%, rgba(240, 147, 251, 0.1) 0%, transparent 50%),
                        radial-gradient(circle at 80% 20%, rgba(67, 233, 123, 0.1) 0%, transparent 50%);
                }

                .cta-content {
                    position: relative;
                    z-index: 1;
                }

                .cta-title {
                    font-size: 3rem;
                    font-weight: 800;
                    color: white;
                }

                .cta-subtitle {
                    font-size: 1.25rem;
                    color: rgba(255, 255, 255, 0.8);
                    max-width: 600px;
                    margin: 0 auto;
                }

                .cta-buttons {
                    display: flex;
                    gap: 1rem;
                    justify-content: center;
                    flex-wrap: wrap;
                }

                .cta-features {
                    display: flex;
                    gap: 2rem;
                    justify-content: center;
                    flex-wrap: wrap;
                }

                .cta-feature {
                    display: flex;
                    align-items: center;
                    color: rgba(255, 255, 255, 0.8);
                    font-weight: 500;
                }

                /* Footer */
                .footer-section {
                    padding: 4rem 0 2rem;
                    background: #1a202c;
                    color: #e2e8f0;
                }

                .footer-brand {
                    display: flex;
                    align-items: center;
                    color: white;
                }

                .footer-description {
                    color: #a0aec0;
                    line-height: 1.6;
                }

                .social-links {
                    display: flex;
                    gap: 1rem;
                }

                .social-link {
                    width: 40px;
                    height: 40px;
                    background: rgba(255, 255, 255, 0.1);
                    border: 1px solid rgba(255, 255, 255, 0.2);
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: #e2e8f0;
                    transition: all 0.3s ease;
                }

                .social-link:hover {
                    background: rgba(255, 255, 255, 0.2);
                    transform: translateY(-2px);
                }

                .footer-title {
                    color: white;
                    font-weight: 700;
                    margin-bottom: 1rem;
                }

                .footer-links {
                    list-style: none;
                    padding: 0;
                    margin: 0;
                }

                .footer-links li {
                    margin-bottom: 0.5rem;
                }

                .footer-links a {
                    color: #a0aec0;
                    text-decoration: none;
                    transition: color 0.3s ease;
                }

                .footer-links a:hover {
                    color: white;
                }

                .newsletter-text {
                    color: #a0aec0;
                    font-size: 0.9rem;
                }

                .newsletter-input {
                    background: rgba(255, 255, 255, 0.1);
                    border: 1px solid rgba(255, 255, 255, 0.2);
                    color: white;
                    border-radius: 8px;
                }

                .newsletter-input::placeholder {
                    color: rgba(255, 255, 255, 0.5);
                }

                .newsletter-button {
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    border: none;
                    color: white;
                    font-weight: 600;
                    border-radius: 8px;
                    padding: 0.5rem 1rem;
                }

                .footer-divider {
                    border-color: rgba(255, 255, 255, 0.1);
                    margin: 2rem 0;
                }

                .copyright {
                    color: #a0aec0;
                    margin: 0;
                }

                .legal-links {
                    display: flex;
                    gap: 1.5rem;
                    flex-wrap: wrap;
                }

                .legal-links a {
                    color: #a0aec0;
                    text-decoration: none;
                    transition: color 0.3s ease;
                }

                .legal-links a:hover {
                    color: white;
                }

                /* Responsive Design */
                @media (max-width: 768px) {
                    .hero-title {
                        font-size: 2.5rem;
                    }
                    
                    .section-title {
                        font-size: 2rem;
                    }
                    
                    .cta-title {
                        font-size: 2rem;
                    }
                    
                    .hero-buttons {
                        flex-direction: column;
                        align-items: center;
                    }
                    
                    .cta-buttons {
                        flex-direction: column;
                        align-items: center;
                    }
                    
                    .cta-features {
                        flex-direction: column;
                        align-items: center;
                        gap: 1rem;
                    }
                    
                    .floating-notification {
                        position: static;
                        margin-top: 1rem;
                    }
                    
                    .stat-number {
                        font-size: 2rem;
                    }
                    
                    .legal-links {
                        justify-content: center;
                        margin-top: 1rem;
                    }
                }

                @media (max-width: 576px) {
                    .hero-title {
                        font-size: 2rem;
                    }
                    
                    .brand-name {
                        font-size: 1.8rem;
                    }
                    
                    .hero-subtitle {
                        font-size: 1.1rem;
                    }
                    
                    .cta-button {
                        padding: 0.75rem 1.5rem;
                        font-size: 1rem;
                    }
                    
                    .section-title {
                        font-size: 1.75rem;
                    }
                    
                    .feature-title {
                        font-size: 1.25rem;
                    }
                    
                    .price-amount {
                        font-size: 2.5rem;
                    }
                }
            `}</style>
        </>
    );
};

export default LandingPage;