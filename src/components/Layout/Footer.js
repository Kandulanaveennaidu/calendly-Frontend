import React from 'react';
import { Container, Row, Col, Nav } from 'react-bootstrap';
import { motion } from 'framer-motion';
import { FiHeart, FiMail, FiPhone, FiMapPin, FiTwitter, FiLinkedin, FiFacebook, FiInstagram } from 'react-icons/fi';
import { Link } from 'react-router-dom';

const Footer = () => {
    const currentYear = new Date().getFullYear();

    return (
        <motion.footer
            className="footer mt-auto py-5"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            style={{
                backgroundColor: '#1a202c',
                color: '#f7fafc',
                position: 'relative',
                marginTop: '4rem',
                borderTop: '1px solid rgba(255,255,255,0.1)'
            }}
        >
            <Container>
                <Row className="mb-4">
                    <Col lg={4} md={6} className="mb-4 mb-md-0">
                        <h5 className="text-white mb-3 fw-bold">ScheduleMe</h5>
                        <p className="text-light mb-3" style={{ fontSize: '1rem', lineHeight: '1.6' }}>
                            Modern meeting scheduling made simple. Take control of your time with our intuitive scheduling platform.
                        </p>
                        <div className="d-flex gap-3">
                            <a href="#" className="text-white fs-5 social-icon">
                                <FiTwitter />
                            </a>
                            <a href="#" className="text-white fs-5 social-icon">
                                <FiLinkedin />
                            </a>
                            <a href="#" className="text-white fs-5 social-icon">
                                <FiFacebook />
                            </a>
                            <a href="#" className="text-white fs-5 social-icon">
                                <FiInstagram />
                            </a>
                        </div>
                    </Col>

                    <Col lg={2} md={6} className="mb-4 mb-md-0">
                        <h6 className="text-white mb-3 fw-bold">Company</h6>
                        <Nav className="flex-column">
                            <Nav.Link as={Link} to="/about" className="text-light p-0 mb-2">About Us</Nav.Link>
                            <Nav.Link as={Link} to="/features" className="text-light p-0 mb-2">Features</Nav.Link>
                            <Nav.Link as={Link} to="/pricing" className="text-light p-0 mb-2">Pricing</Nav.Link>
                            <Nav.Link as={Link} to="/blog" className="text-light p-0 mb-2">Blog</Nav.Link>
                        </Nav>
                    </Col>

                    <Col lg={2} md={6} className="mb-4 mb-md-0">
                        <h6 className="text-white mb-3 fw-bold">Support</h6>
                        <Nav className="flex-column">
                            <Nav.Link as={Link} to="/faq" className="text-light p-0 mb-2">FAQ</Nav.Link>
                            <Nav.Link as={Link} to="/help" className="text-light p-0 mb-2">Help Center</Nav.Link>
                            <Nav.Link as={Link} to="/contact" className="text-light p-0 mb-2">Contact Us</Nav.Link>
                            <Nav.Link as={Link} to="/terms" className="text-light p-0 mb-2">Terms of Service</Nav.Link>
                        </Nav>
                    </Col>

                    <Col lg={4} md={6}>
                        <h6 className="text-white mb-3 fw-bold">Contact Us</h6>
                        <ul className="list-unstyled">
                            <li className="mb-2">
                                <FiMapPin className="me-2 text-primary" /> 1234 Street Name, City, Country
                            </li>
                            <li className="mb-2">
                                <FiPhone className="me-2 text-primary" /> +1 (123) 456-7890
                            </li>
                            <li className="mb-2">
                                <FiMail className="me-2 text-primary" /> contact@scheduleme.com
                            </li>
                        </ul>
                    </Col>
                </Row>

                <hr className="my-4 bg-light opacity-25" />

                <Row>
                    <Col md={6}>
                        <p className="mb-0 text-light">
                            &copy; {currentYear} Calendly Clone. All rights reserved.
                        </p>
                    </Col>
                    <Col md={6} className="text-md-end">
                        <p className="mb-0 text-light">
                            Made with <FiHeart className="text-danger mx-1" /> for better scheduling
                        </p>
                    </Col>
                </Row>
            </Container>
        </motion.footer>
    );
};

export default Footer;
