import React, { useState } from 'react';
import { Container, Row, Col, Card, Form, Accordion } from 'react-bootstrap';
import { motion } from 'framer-motion';
import {
    FiHelpCircle, FiMessageCircle, FiMail, FiPhone, FiClock,
    FiSearch, FiVideo, FiUsers, FiLifeBuoy, FiSend,
    FiStar, FiThumbsUp
} from 'react-icons/fi';

const Support = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [contactForm, setContactForm] = useState({
        name: '',
        email: '',
        subject: '',
        message: ''
    });

    const supportOptions = [
        {
            icon: <FiMessageCircle />,
            title: "Live Chat",
            description: "Get instant help from our support team",
            availability: "24/7 Available",
            color: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            action: "Start Chat"
        },
        {
            icon: <FiMail />,
            title: "Email Support",
            description: "Send us a detailed message",
            availability: "Response within 2 hours",
            color: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
            action: "Send Email"
        },
        {
            icon: <FiPhone />,
            title: "Phone Support",
            description: "Speak directly with our experts",
            availability: "Mon-Fri 9AM-6PM EST",
            color: "linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)",
            action: "Call Now"
        },
        {
            icon: <FiVideo />,
            title: "Video Call",
            description: "Screen sharing and live assistance",
            availability: "By appointment",
            color: "linear-gradient(135deg, #fa709a 0%, #fee140 100%)",
            action: "Schedule Call"
        }
    ];

    const faqs = [
        {
            question: "How do I set up my first meeting type?",
            answer: "Navigate to your dashboard and click 'Create New Meeting Type'. Fill in the details like duration, availability, and description. You can customize buffer times, meeting locations, and notification preferences."
        },
        {
            question: "Can I integrate with my existing calendar?",
            answer: "Yes! meetslot.ai supports integration with Google Calendar, Outlook, Apple Calendar, and more. Go to Settings > Integrations to connect your calendars and avoid double bookings."
        },
        {
            question: "How do I customize my booking page?",
            answer: "Visit your Profile settings to customize your booking page. You can add your photo, bio, company branding, and set your availability preferences. Custom domains are available on Pro plans."
        },
        {
            question: "What payment methods do you accept?",
            answer: "We accept all major credit cards (Visa, MasterCard, American Express), PayPal, and bank transfers for enterprise customers. All payments are processed securely through encrypted channels."
        },
        {
            question: "How do I cancel or reschedule meetings?",
            answer: "Both you and your invitees can cancel or reschedule meetings from the confirmation email or your dashboard. Automatic notifications will be sent to all participants when changes are made."
        },
        {
            question: "Is there a mobile app available?",
            answer: "Yes! Our mobile apps are available for iOS and Android. Download them from the App Store or Google Play Store to manage your meetings on the go."
        }
    ];

    const handleInputChange = (e) => {
        setContactForm({
            ...contactForm,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        // Handle form submission
        console.log('Support form submitted:', contactForm);
    };

    const filteredFaqs = faqs.filter(faq =>
        faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
        faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="support-page">
            {/* Hero Section */}
            <motion.section
                className="support-hero"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.8 }}
            >
                <Container>
                    <Row className="justify-content-center text-center">
                        <Col lg={8}>
                            <motion.div
                                initial={{ y: 50, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ duration: 0.8, delay: 0.2 }}
                            >
                                <div className="hero-icon-container mb-4">
                                    <FiLifeBuoy size={60} />
                                </div>
                                <h1 className="hero-title mb-4">How can we help you?</h1>
                                <p className="hero-subtitle mb-5">
                                    Get the support you need to make the most of meetslot.ai. Our team is here to help you succeed.
                                </p>

                                {/* Search Bar */}
                                <div className="search-container">
                                    <FiSearch className="search-icon" />
                                    <Form.Control
                                        type="text"
                                        placeholder="Search for answers..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="search-input"
                                    />
                                </div>
                            </motion.div>
                        </Col>
                    </Row>
                </Container>
            </motion.section>

            {/* Support Options */}
            <section className="support-options">
                <Container>
                    <Row>
                        <Col>
                            <motion.h2
                                className="section-title text-center mb-5"
                                initial={{ y: 30, opacity: 0 }}
                                whileInView={{ y: 0, opacity: 1 }}
                                transition={{ duration: 0.8 }}
                                viewport={{ once: true }}
                            >
                                Choose Your Support Channel
                            </motion.h2>
                        </Col>
                    </Row>

                    <Row>
                        {supportOptions.map((option, index) => (
                            <Col lg={3} md={6} key={index} className="mb-4">
                                <motion.div
                                    initial={{ y: 50, opacity: 0 }}
                                    whileInView={{ y: 0, opacity: 1 }}
                                    transition={{ duration: 0.6, delay: index * 0.1 }}
                                    viewport={{ once: true }}
                                    whileHover={{ y: -10 }}
                                >
                                    <Card className="support-option-card h-100">
                                        <Card.Body className="p-4 text-center">
                                            <div
                                                className="option-icon mb-3"
                                                style={{ background: option.color }}
                                            >
                                                {option.icon}
                                            </div>
                                            <h5 className="option-title mb-3">{option.title}</h5>
                                            <p className="option-description mb-3">{option.description}</p>
                                            <div className="availability-badge mb-4">
                                                <FiClock className="me-2" />
                                                {option.availability}
                                            </div>
                                            <motion.button
                                                className="support-button"
                                                style={{ background: option.color }}
                                                whileHover={{ scale: 1.05 }}
                                                whileTap={{ scale: 0.95 }}
                                            >
                                                {option.action}
                                            </motion.button>
                                        </Card.Body>
                                    </Card>
                                </motion.div>
                            </Col>
                        ))}
                    </Row>
                </Container>
            </section>

            {/* FAQ Section */}
            <section className="faq-section">
                <Container>
                    <Row>
                        <Col>
                            <motion.h2
                                className="section-title text-center mb-5"
                                initial={{ y: 30, opacity: 0 }}
                                whileInView={{ y: 0, opacity: 1 }}
                                transition={{ duration: 0.8 }}
                                viewport={{ once: true }}
                            >
                                Frequently Asked Questions
                            </motion.h2>
                        </Col>
                    </Row>

                    <Row className="justify-content-center">
                        <Col lg={10}>
                            <motion.div
                                initial={{ y: 50, opacity: 0 }}
                                whileInView={{ y: 0, opacity: 1 }}
                                transition={{ duration: 0.8 }}
                                viewport={{ once: true }}
                            >
                                <Accordion className="faq-accordion">
                                    {filteredFaqs.map((faq, index) => (
                                        <motion.div
                                            key={index}
                                            initial={{ opacity: 0, y: 20 }}
                                            whileInView={{ opacity: 1, y: 0 }}
                                            transition={{ delay: index * 0.1 }}
                                            viewport={{ once: true }}
                                        >
                                            <Accordion.Item eventKey={index.toString()} className="faq-item">
                                                <Accordion.Header className="faq-header">
                                                    <FiHelpCircle className="me-3 text-primary" />
                                                    {faq.question}
                                                </Accordion.Header>
                                                <Accordion.Body className="faq-body">
                                                    {faq.answer}
                                                </Accordion.Body>
                                            </Accordion.Item>
                                        </motion.div>
                                    ))}
                                </Accordion>
                            </motion.div>
                        </Col>
                    </Row>
                </Container>
            </section>

            {/* Contact Form */}
            <section className="contact-form-section">
                <Container>
                    <Row className="justify-content-center">
                        <Col lg={8}>
                            <motion.div
                                initial={{ y: 50, opacity: 0 }}
                                whileInView={{ y: 0, opacity: 1 }}
                                transition={{ duration: 0.8 }}
                                viewport={{ once: true }}
                            >
                                <Card className="contact-form-card">
                                    <Card.Body className="p-5">
                                        <div className="text-center mb-5">
                                            <h3 className="contact-title mb-3">Still Need Help?</h3>
                                            <p className="contact-subtitle">
                                                Send us a message and we'll get back to you within 2 hours
                                            </p>
                                        </div>

                                        <Form onSubmit={handleSubmit}>
                                            <Row>
                                                <Col md={6}>
                                                    <Form.Group className="mb-3">
                                                        <Form.Label className="form-label">Name</Form.Label>
                                                        <Form.Control
                                                            type="text"
                                                            name="name"
                                                            value={contactForm.name}
                                                            onChange={handleInputChange}
                                                            placeholder="Your full name"
                                                            className="form-input"
                                                            required
                                                        />
                                                    </Form.Group>
                                                </Col>
                                                <Col md={6}>
                                                    <Form.Group className="mb-3">
                                                        <Form.Label className="form-label">Email</Form.Label>
                                                        <Form.Control
                                                            type="email"
                                                            name="email"
                                                            value={contactForm.email}
                                                            onChange={handleInputChange}
                                                            placeholder="your@email.com"
                                                            className="form-input"
                                                            required
                                                        />
                                                    </Form.Group>
                                                </Col>
                                            </Row>

                                            <Form.Group className="mb-3">
                                                <Form.Label className="form-label">Subject</Form.Label>
                                                <Form.Control
                                                    type="text"
                                                    name="subject"
                                                    value={contactForm.subject}
                                                    onChange={handleInputChange}
                                                    placeholder="What's this about?"
                                                    className="form-input"
                                                    required
                                                />
                                            </Form.Group>

                                            <Form.Group className="mb-4">
                                                <Form.Label className="form-label">Message</Form.Label>
                                                <Form.Control
                                                    as="textarea"
                                                    rows={5}
                                                    name="message"
                                                    value={contactForm.message}
                                                    onChange={handleInputChange}
                                                    placeholder="Describe your issue or question in detail..."
                                                    className="form-input"
                                                    required
                                                />
                                            </Form.Group>

                                            <div className="text-center">
                                                <motion.button
                                                    type="submit"
                                                    className="submit-button"
                                                    whileHover={{ scale: 1.05 }}
                                                    whileTap={{ scale: 0.95 }}
                                                >
                                                    <FiSend className="me-2" />
                                                    Send Message
                                                </motion.button>
                                            </div>
                                        </Form>
                                    </Card.Body>
                                </Card>
                            </motion.div>
                        </Col>
                    </Row>
                </Container>
            </section>

            {/* Success Stories */}
            <section className="success-stories">
                <Container>
                    <Row>
                        <Col>
                            <motion.h2
                                className="section-title text-center mb-5"
                                initial={{ y: 30, opacity: 0 }}
                                whileInView={{ y: 0, opacity: 1 }}
                                transition={{ duration: 0.8 }}
                                viewport={{ once: true }}
                            >
                                Our Support Success Stories
                            </motion.h2>
                        </Col>
                    </Row>

                    <Row>
                        {[
                            { icon: <FiThumbsUp />, stat: "99.5%", label: "Customer Satisfaction" },
                            { icon: <FiClock />, stat: "< 2 hours", label: "Average Response Time" },
                            { icon: <FiStar />, stat: "4.9/5", label: "Support Rating" },
                            { icon: <FiUsers />, stat: "50K+", label: "Happy Customers" }
                        ].map((item, index) => (
                            <Col lg={3} md={6} key={index} className="mb-4">
                                <motion.div
                                    className="success-stat text-center"
                                    initial={{ y: 50, opacity: 0 }}
                                    whileInView={{ y: 0, opacity: 1 }}
                                    transition={{ duration: 0.6, delay: index * 0.1 }}
                                    viewport={{ once: true }}
                                >
                                    <div className="stat-icon mb-3">
                                        {item.icon}
                                    </div>
                                    <h3 className="stat-number">{item.stat}</h3>
                                    <p className="stat-label">{item.label}</p>
                                </motion.div>
                            </Col>
                        ))}
                    </Row>
                </Container>
            </section>

            <style jsx>{`
                .support-page {
                    min-height: 100vh;
                    background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
                }

                .support-hero {
                    padding: 8rem 0 4rem;
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    color: white;
                    position: relative;
                    overflow: hidden;
                }

                .support-hero::before {
                    content: '';
                    position: absolute;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background: 
                        radial-gradient(circle at 25% 75%, rgba(240, 147, 251, 0.1) 0%, transparent 50%),
                        radial-gradient(circle at 75% 25%, rgba(67, 233, 123, 0.1) 0%, transparent 50%);
                }

                .hero-icon-container {
                    width: 120px;
                    height: 120px;
                    background: rgba(255, 255, 255, 0.1);
                    backdrop-filter: blur(20px);
                    border-radius: 30px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    margin: 0 auto;
                    border: 1px solid rgba(255, 255, 255, 0.2);
                }

                .hero-title {
                    font-size: 3.5rem;
                    font-weight: 800;
                    margin-bottom: 1rem;
                }

                .hero-subtitle {
                    font-size: 1.25rem;
                    opacity: 0.9;
                    max-width: 600px;
                    margin: 0 auto;
                }

                .search-container {
                    position: relative;
                    max-width: 500px;
                    margin: 0 auto;
                }

                .search-icon {
                    position: absolute;
                    left: 1rem;
                    top: 50%;
                    transform: translateY(-50%);
                    color: rgba(255, 255, 255, 0.7);
                    z-index: 2;
                }

                .search-input {
                    background: rgba(255, 255, 255, 0.1);
                    border: 1px solid rgba(255, 255, 255, 0.2);
                    border-radius: 50px;
                    padding: 1rem 1rem 1rem 3rem;
                    color: white;
                    font-size: 1.1rem;
                    backdrop-filter: blur(20px);
                }

                .search-input::placeholder {
                    color: rgba(255, 255, 255, 0.7);
                }

                .search-input:focus {
                    background: rgba(255, 255, 255, 0.2);
                    border-color: rgba(255, 255, 255, 0.4);
                    box-shadow: 0 0 0 0.2rem rgba(255, 255, 255, 0.1);
                    color: white;
                }

                .support-options {
                    padding: 6rem 0;
                }

                .section-title {
                    font-size: 2.5rem;
                    font-weight: 800;
                    color: #2d3748;
                    margin-bottom: 2rem;
                }

                .support-option-card {
                    background: rgba(255, 255, 255, 0.9);
                    backdrop-filter: blur(20px);
                    border: 1px solid rgba(255, 255, 255, 0.3);
                    border-radius: 20px;
                    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
                    transition: all 0.3s ease;
                }

                .support-option-card:hover {
                    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
                }

                .option-icon {
                    width: 80px;
                    height: 80px;
                    border-radius: 20px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: white;
                    font-size: 2rem;
                    margin: 0 auto;
                }

                .option-title {
                    font-size: 1.25rem;
                    font-weight: 700;
                    color: #2d3748;
                }

                .option-description {
                    color: #4a5568;
                    line-height: 1.6;
                }

                .availability-badge {
                    display: inline-flex;
                    align-items: center;
                    background: rgba(103, 126, 234, 0.1);
                    color: #667eea;
                    padding: 0.5rem 1rem;
                    border-radius: 20px;
                    font-size: 0.9rem;
                    font-weight: 600;
                }

                .support-button {
                    border: none;
                    color: white;
                    padding: 0.75rem 1.5rem;
                    border-radius: 25px;
                    font-weight: 600;
                    font-size: 0.9rem;
                    transition: all 0.3s ease;
                    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
                }

                .faq-section {
                    padding: 6rem 0;
                    background: white;
                }

                .faq-accordion .accordion-item {
                    border: none;
                    margin-bottom: 1rem;
                    border-radius: 15px;
                    overflow: hidden;
                    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.08);
                }

                .faq-accordion .accordion-header {
                    border: none;
                }

                .faq-accordion .accordion-button {
                    background: rgba(255, 255, 255, 0.9);
                    border: none;
                    padding: 1.5rem;
                    font-weight: 600;
                    color: #2d3748;
                    font-size: 1.1rem;
                }

                .faq-accordion .accordion-button:not(.collapsed) {
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    color: white;
                    box-shadow: none;
                }

                .faq-accordion .accordion-button:focus {
                    box-shadow: none;
                    border: none;
                }

                .faq-accordion .accordion-body {
                    background: #f8f9fa;
                    padding: 1.5rem;
                    color: #4a5568;
                    line-height: 1.6;
                }

                .contact-form-section {
                    padding: 6rem 0;
                }

                .contact-form-card {
                    background: rgba(255, 255, 255, 0.9);
                    backdrop-filter: blur(20px);
                    border: 1px solid rgba(255, 255, 255, 0.3);
                    border-radius: 25px;
                    box-shadow: 0 15px 35px rgba(0, 0, 0, 0.1);
                }

                .contact-title {
                    font-size: 2rem;
                    font-weight: 700;
                    color: #2d3748;
                }

                .contact-subtitle {
                    color: #4a5568;
                    font-size: 1.1rem;
                }

                .form-label {
                    font-weight: 600;
                    color: #2d3748;
                    margin-bottom: 0.5rem;
                }

                .form-input {
                    border: 1px solid rgba(0, 0, 0, 0.1);
                    border-radius: 10px;
                    padding: 0.75rem 1rem;
                    font-size: 1rem;
                    transition: all 0.3s ease;
                }

                .form-input:focus {
                    border-color: #667eea;
                    box-shadow: 0 0 0 0.2rem rgba(103, 126, 234, 0.1);
                }

                .submit-button {
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    border: none;
                    color: white;
                    padding: 1rem 2rem;
                    border-radius: 50px;
                    font-weight: 600;
                    font-size: 1.1rem;
                    transition: all 0.3s ease;
                    box-shadow: 0 5px 15px rgba(103, 126, 234, 0.3);
                }

                .success-stories {
                    padding: 6rem 0;
                    background: linear-gradient(135deg, #2d3748 0%, #4a5568 100%);
                    color: white;
                }

                .success-stories .section-title {
                    color: white;
                }

                .success-stat {
                    padding: 2rem 1rem;
                }

                .stat-icon {
                    width: 80px;
                    height: 80px;
                    background: rgba(255, 255, 255, 0.1);
                    border-radius: 20px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: white;
                    font-size: 2rem;
                    margin: 0 auto;
                    backdrop-filter: blur(20px);
                    border: 1px solid rgba(255, 255, 255, 0.2);
                }

                .stat-number {
                    font-size: 2.5rem;
                    font-weight: 800;
                    color: white;
                    margin: 1rem 0 0.5rem;
                }

                .stat-label {
                    color: rgba(255, 255, 255, 0.8);
                    font-weight: 500;
                    margin: 0;
                }

                @media (max-width: 768px) {
                    .hero-title {
                        font-size: 2.5rem;
                    }
                    
                    .support-hero {
                        padding: 6rem 0 3rem;
                    }
                    
                    .support-options,
                    .faq-section,
                    .contact-form-section,
                    .success-stories {
                        padding: 4rem 0;
                    }
                    
                    .section-title {
                        font-size: 2rem;
                    }
                    
                    .contact-title {
                        font-size: 1.5rem;
                    }
                }
            `}</style>
        </div>
    );
};

export default Support;
