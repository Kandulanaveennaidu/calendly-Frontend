import React from 'react';
import { Container, Row, Col, Card } from 'react-bootstrap';
import { motion } from 'framer-motion';
import { FiFileText, FiCheck, FiX, FiAlertTriangle, FiCreditCard, FiRefreshCw, FiMail } from 'react-icons/fi';

const TermsOfService = () => {
    const termsData = [
        {
            title: "Service Usage",
            icon: <FiCheck />,
            items: [
                "You must be at least 18 years old to use meetslot.ai",
                "Provide accurate and up-to-date information when creating your account",
                "Use the service for legitimate business and personal scheduling purposes",
                "Respect other users and maintain professional conduct"
            ]
        },
        {
            title: "Prohibited Activities",
            icon: <FiX />,
            items: [
                "Attempting to gain unauthorized access to our systems",
                "Using the service to send spam or unsolicited communications",
                "Violating any applicable laws or regulations",
                "Interfering with the security or functionality of the platform"
            ]
        },
        {
            title: "Payment Terms",
            icon: <FiCreditCard />,
            items: [
                "Subscription fees are billed monthly or annually in advance",
                "All payments are processed securely through encrypted channels",
                "Refunds are available within 30 days for annual subscriptions",
                "Free trial periods are subject to fair use policies"
            ]
        },
        {
            title: "Service Changes",
            icon: <FiRefreshCw />,
            items: [
                "We reserve the right to modify or discontinue features with notice",
                "Critical security updates may be applied without prior notice",
                "Major changes to terms will be communicated 30 days in advance",
                "Continued use constitutes acceptance of updated terms"
            ]
        }
    ];

    const importantNotes = [
        {
            icon: <FiAlertTriangle />,
            title: "Limitation of Liability",
            description: "Our liability is limited to the amount you paid for the service in the 12 months preceding any claim."
        },
        {
            icon: <FiFileText />,
            title: "Data Ownership",
            description: "You retain full ownership of all data you input into our system. We act solely as a processor."
        },
        {
            icon: <FiRefreshCw />,
            title: "Service Availability",
            description: "While we strive for 99.9% uptime, we cannot guarantee uninterrupted service availability."
        }
    ];

    return (
        <div className="terms-page">
            {/* Hero Section */}
            <motion.section
                className="terms-hero"
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
                                    <FiFileText size={60} />
                                </div>
                                <h1 className="hero-title mb-4">Terms of Service</h1>
                                <p className="hero-subtitle mb-4">
                                    Please read these terms carefully. By using meetslot.ai, you agree to be bound by these terms and conditions.
                                </p>
                                <div className="last-updated">
                                    Effective Date: June 20, 2025
                                </div>
                            </motion.div>
                        </Col>
                    </Row>
                </Container>
            </motion.section>

            {/* Terms Content */}
            <section className="terms-content">
                <Container>
                    <Row>
                        {termsData.map((section, index) => (
                            <Col lg={6} key={index} className="mb-5">
                                <motion.div
                                    initial={{ y: 50, opacity: 0 }}
                                    whileInView={{ y: 0, opacity: 1 }}
                                    transition={{ duration: 0.6, delay: index * 0.1 }}
                                    viewport={{ once: true }}
                                >
                                    <Card className="terms-card h-100">
                                        <Card.Body className="p-4">
                                            <div className="section-header mb-4">
                                                <div className="section-icon">
                                                    {section.icon}
                                                </div>
                                                <h3 className="section-title">{section.title}</h3>
                                            </div>
                                            <ul className="terms-list">
                                                {section.items.map((item, itemIndex) => (
                                                    <motion.li
                                                        key={itemIndex}
                                                        initial={{ x: -20, opacity: 0 }}
                                                        whileInView={{ x: 0, opacity: 1 }}
                                                        transition={{ delay: 0.1 * itemIndex }}
                                                        viewport={{ once: true }}
                                                    >
                                                        {item}
                                                    </motion.li>
                                                ))}
                                            </ul>
                                        </Card.Body>
                                    </Card>
                                </motion.div>
                            </Col>
                        ))}
                    </Row>

                    {/* Important Notes */}
                    <Row className="mt-5">
                        <Col>
                            <motion.h2
                                className="section-heading text-center mb-5"
                                initial={{ y: 30, opacity: 0 }}
                                whileInView={{ y: 0, opacity: 1 }}
                                transition={{ duration: 0.8 }}
                                viewport={{ once: true }}
                            >
                                Important Legal Information
                            </motion.h2>
                        </Col>
                    </Row>

                    <Row>
                        {importantNotes.map((note, index) => (
                            <Col lg={4} key={index} className="mb-4">
                                <motion.div
                                    initial={{ y: 50, opacity: 0 }}
                                    whileInView={{ y: 0, opacity: 1 }}
                                    transition={{ duration: 0.6, delay: index * 0.1 }}
                                    viewport={{ once: true }}
                                >
                                    <Card className="note-card h-100">
                                        <Card.Body className="p-4 text-center">
                                            <div className="note-icon mb-3">
                                                {note.icon}
                                            </div>
                                            <h5 className="note-title mb-3">{note.title}</h5>
                                            <p className="note-description">{note.description}</p>
                                        </Card.Body>
                                    </Card>
                                </motion.div>
                            </Col>
                        ))}
                    </Row>

                    {/* Contact Section */}
                    <Row className="justify-content-center mt-5">
                        <Col lg={8}>
                            <motion.div
                                initial={{ y: 50, opacity: 0 }}
                                whileInView={{ y: 0, opacity: 1 }}
                                transition={{ duration: 0.8 }}
                                viewport={{ once: true }}
                            >
                                <Card className="contact-card">
                                    <Card.Body className="p-5 text-center">
                                        <FiMail size={40} className="contact-icon mb-3" />
                                        <h4 className="mb-3">Questions About These Terms?</h4>
                                        <p className="mb-4">
                                            If you have any questions about these Terms of Service or need clarification
                                            on any of our policies, please contact our legal team.
                                        </p>
                                        <motion.a
                                            href="mailto:legal@meetslot.ai"
                                            className="contact-button"
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                        >
                                            Contact Legal Team
                                        </motion.a>
                                    </Card.Body>
                                </Card>
                            </motion.div>
                        </Col>
                    </Row>
                </Container>
            </section>

            <style jsx>{`
                .terms-page {
                    min-height: 100vh;
                    background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
                }

                .terms-hero {
                    padding: 8rem 0 4rem;
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    color: white;
                    position: relative;
                    overflow: hidden;
                }

                .terms-hero::before {
                    content: '';
                    position: absolute;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background: 
                        radial-gradient(circle at 30% 70%, rgba(240, 147, 251, 0.1) 0%, transparent 50%),
                        radial-gradient(circle at 70% 30%, rgba(67, 233, 123, 0.1) 0%, transparent 50%);
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

                .last-updated {
                    display: inline-block;
                    background: rgba(255, 255, 255, 0.1);
                    padding: 0.5rem 1rem;
                    border-radius: 25px;
                    font-size: 0.9rem;
                    backdrop-filter: blur(10px);
                }

                .terms-content {
                    padding: 6rem 0;
                }

                .terms-card {
                    background: rgba(255, 255, 255, 0.9);
                    backdrop-filter: blur(20px);
                    border: 1px solid rgba(255, 255, 255, 0.3);
                    border-radius: 20px;
                    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
                    transition: all 0.3s ease;
                }

                .terms-card:hover {
                    transform: translateY(-5px);
                    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
                }

                .section-header {
                    display: flex;
                    align-items: center;
                    gap: 1rem;
                }

                .section-icon {
                    width: 60px;
                    height: 60px;
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    border-radius: 15px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: white;
                    font-size: 1.5rem;
                }

                .section-title {
                    font-size: 1.5rem;
                    font-weight: 700;
                    color: #2d3748;
                    margin: 0;
                }

                .terms-list {
                    list-style: none;
                    padding: 0;
                    margin: 0;
                }

                .terms-list li {
                    padding: 0.75rem 0;
                    border-bottom: 1px solid rgba(0, 0, 0, 0.05);
                    color: #4a5568;
                    line-height: 1.6;
                    position: relative;
                    padding-left: 1.5rem;
                }

                .terms-list li:before {
                    content: '•';
                    position: absolute;
                    left: 0;
                    color: #667eea;
                    font-weight: bold;
                    font-size: 1.2rem;
                }

                .terms-list li:last-child {
                    border-bottom: none;
                }

                .section-heading {
                    font-size: 2.5rem;
                    font-weight: 800;
                    color: #2d3748;
                    position: relative;
                }

                .section-heading::after {
                    content: '';
                    position: absolute;
                    bottom: -10px;
                    left: 50%;
                    transform: translateX(-50%);
                    width: 80px;
                    height: 4px;
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    border-radius: 2px;
                }

                .note-card {
                    background: rgba(255, 255, 255, 0.9);
                    backdrop-filter: blur(20px);
                    border: 1px solid rgba(255, 255, 255, 0.3);
                    border-radius: 20px;
                    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
                    transition: all 0.3s ease;
                }

                .note-card:hover {
                    transform: translateY(-10px);
                    box-shadow: 0 25px 45px rgba(0, 0, 0, 0.15);
                }

                .note-icon {
                    width: 80px;
                    height: 80px;
                    background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
                    border-radius: 20px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: white;
                    font-size: 2rem;
                    margin: 0 auto;
                }

                .note-title {
                    font-size: 1.25rem;
                    font-weight: 700;
                    color: #2d3748;
                }

                .note-description {
                    color: #4a5568;
                    line-height: 1.6;
                    margin: 0;
                }

                .contact-card {
                    background: rgba(255, 255, 255, 0.9);
                    backdrop-filter: blur(20px);
                    border: 1px solid rgba(255, 255, 255, 0.3);
                    border-radius: 25px;
                    box-shadow: 0 15px 35px rgba(0, 0, 0, 0.1);
                }

                .contact-icon {
                    color: #667eea;
                }

                .contact-button {
                    display: inline-block;
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    color: white;
                    padding: 1rem 2rem;
                    border-radius: 50px;
                    text-decoration: none;
                    font-weight: 600;
                    transition: all 0.3s ease;
                    box-shadow: 0 5px 15px rgba(103, 126, 234, 0.3);
                }

                .contact-button:hover {
                    color: white;
                    text-decoration: none;
                    box-shadow: 0 8px 25px rgba(103, 126, 234, 0.4);
                }

                @media (max-width: 768px) {
                    .hero-title {
                        font-size: 2.5rem;
                    }
                    
                    .terms-hero {
                        padding: 6rem 0 3rem;
                    }
                    
                    .terms-content {
                        padding: 4rem 0;
                    }
                    
                    .section-header {
                        flex-direction: column;
                        text-align: center;
                    }
                    
                    .section-heading {
                        font-size: 2rem;
                    }
                }
            `}</style>
        </div>
    );
};

export default TermsOfService;
