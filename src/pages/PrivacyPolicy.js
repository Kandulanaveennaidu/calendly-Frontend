import React from 'react';
import { Container, Row, Col, Card } from 'react-bootstrap';
import { motion } from 'framer-motion';
import { FiShield, FiLock, FiEye, FiUsers, FiServer, FiMail } from 'react-icons/fi';

const PrivacyPolicy = () => {
    const sections = [
        {
            title: "Information We Collect",
            icon: <FiEye />,
            content: [
                "Personal information you provide when creating an account",
                "Meeting scheduling data and calendar information",
                "Communication preferences and contact details",
                "Device and browser information for security purposes"
            ]
        },
        {
            title: "How We Use Your Data",
            icon: <FiUsers />,
            content: [
                "To provide and improve our scheduling services",
                "To send important notifications about your meetings",
                "To ensure platform security and prevent fraud",
                "To analyze usage patterns and enhance user experience"
            ]
        },
        {
            title: "Data Protection",
            icon: <FiLock />,
            content: [
                "All data is encrypted in transit and at rest",
                "Regular security audits and compliance checks",
                "Strict access controls and employee training",
                "GDPR and CCPA compliant data handling practices"
            ]
        },
        {
            title: "Data Sharing",
            icon: <FiServer />,
            content: [
                "We never sell your personal information to third parties",
                "Limited sharing with trusted service providers under strict agreements",
                "Calendar integrations only with your explicit consent",
                "Legal compliance sharing only when required by law"
            ]
        }
    ];

    return (
        <div className="privacy-policy-page">
            {/* Hero Section */}
            <motion.section
                className="privacy-hero"
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
                                    <FiShield size={60} />
                                </div>
                                <h1 className="hero-title mb-4">Privacy Policy</h1>
                                <p className="hero-subtitle mb-4">
                                    Your privacy is our priority. Learn how we collect, use, and protect your personal information.
                                </p>
                                <div className="last-updated">
                                    Last updated: June 20, 2025
                                </div>
                            </motion.div>
                        </Col>
                    </Row>
                </Container>
            </motion.section>

            {/* Content Sections */}
            <section className="privacy-content">
                <Container>
                    <Row>
                        {sections.map((section, index) => (
                            <Col lg={6} key={index} className="mb-5">
                                <motion.div
                                    initial={{ y: 50, opacity: 0 }}
                                    whileInView={{ y: 0, opacity: 1 }}
                                    transition={{ duration: 0.6, delay: index * 0.1 }}
                                    viewport={{ once: true }}
                                >
                                    <Card className="privacy-card h-100">
                                        <Card.Body className="p-4">
                                            <div className="section-header mb-4">
                                                <div className="section-icon">
                                                    {section.icon}
                                                </div>
                                                <h3 className="section-title">{section.title}</h3>
                                            </div>
                                            <ul className="section-list">
                                                {section.content.map((item, itemIndex) => (
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
                                        <h4 className="mb-3">Questions About Your Privacy?</h4>
                                        <p className="mb-4">
                                            If you have any questions about this Privacy Policy or how we handle your data,
                                            please don't hesitate to contact us.
                                        </p>
                                        <motion.a
                                            href="mailto:privacy@meetslot.ai"
                                            className="contact-button"
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                        >
                                            Contact Privacy Team
                                        </motion.a>
                                    </Card.Body>
                                </Card>
                            </motion.div>
                        </Col>
                    </Row>
                </Container>
            </section>

            <style jsx>{`
                .privacy-policy-page {
                    min-height: 100vh;
                    background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
                }

                .privacy-hero {
                    padding: 8rem 0 4rem;
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    color: white;
                    position: relative;
                    overflow: hidden;
                }

                .privacy-hero::before {
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

                .privacy-content {
                    padding: 6rem 0;
                }

                .privacy-card {
                    background: rgba(255, 255, 255, 0.9);
                    backdrop-filter: blur(20px);
                    border: 1px solid rgba(255, 255, 255, 0.3);
                    border-radius: 20px;
                    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
                    transition: all 0.3s ease;
                }

                .privacy-card:hover {
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

                .section-list {
                    list-style: none;
                    padding: 0;
                    margin: 0;
                }

                .section-list li {
                    padding: 0.75rem 0;
                    border-bottom: 1px solid rgba(0, 0, 0, 0.05);
                    color: #4a5568;
                    line-height: 1.6;
                    position: relative;
                    padding-left: 1.5rem;
                }

                .section-list li:before {
                    content: '→';
                    position: absolute;
                    left: 0;
                    color: #667eea;
                    font-weight: bold;
                }

                .section-list li:last-child {
                    border-bottom: none;
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
                    
                    .privacy-hero {
                        padding: 6rem 0 3rem;
                    }
                    
                    .privacy-content {
                        padding: 4rem 0;
                    }
                    
                    .section-header {
                        flex-direction: column;
                        text-align: center;
                    }
                }
            `}</style>
        </div>
    );
};

export default PrivacyPolicy;
