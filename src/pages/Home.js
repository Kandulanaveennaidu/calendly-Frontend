import React from 'react';
import { Container, Row, Col, Button, Card } from 'react-bootstrap';
import { motion } from 'framer-motion';
import { FiCalendar, FiClock, FiUsers, FiZap } from 'react-icons/fi';
import { Link } from 'react-router-dom';

const Home = () => {
    const features = [
        {
            icon: <FiCalendar size={48} />,
            title: "Easy Scheduling",
            description: "Schedule meetings in seconds with our intuitive interface"
        },
        {
            icon: <FiClock size={48} />,
            title: "Time Zone Smart",
            description: "Automatically handles time zones for global meetings"
        },
        {
            icon: <FiUsers size={48} />,
            title: "Team Collaboration",
            description: "Coordinate with team members effortlessly"
        },
        {
            icon: <FiZap size={48} />,
            title: "Outlook Integration",
            description: "Seamlessly sync with your Outlook calendar"
        }
    ];

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="page-transition"
        >
            {/* Hero Section */}
            <section className="gradient-bg text-white py-5">
                <Container>
                    <Row className="align-items-center min-vh-50">
                        <Col lg={6}>
                            <motion.div
                                initial={{ x: -100, opacity: 0 }}
                                animate={{ x: 0, opacity: 1 }}
                                transition={{ delay: 0.2, duration: 0.8 }}
                            >
                                <h1 className="display-4 fw-bold mb-4">
                                    Schedule meetings like a pro
                                </h1>
                                <p className="lead mb-4">
                                    Eliminate the back-and-forth emails. Let people book time with you
                                    seamlessly integrated with your Outlook calendar.
                                </p>
                                <div className="d-flex gap-3 flex-wrap">
                                    <Button
                                        size="lg"
                                        variant="light"
                                        className="btn-modern"
                                        as={Link}
                                        to="/dashboard"
                                    >
                                        Get Started Free
                                    </Button>
                                    <Button
                                        size="lg"
                                        variant="outline-light"
                                        className="btn-modern"
                                        as={Link}
                                        to="/book/demo"
                                    >
                                        Book a Demo
                                    </Button>
                                </div>
                            </motion.div>
                        </Col>
                        <Col lg={6}>
                            <motion.div
                                initial={{ x: 100, opacity: 0 }}
                                animate={{ x: 0, opacity: 1 }}
                                transition={{ delay: 0.4, duration: 0.8 }}
                                className="text-center"
                            >
                                <div className="glass-effect p-4 rounded-4">
                                    <FiCalendar size={120} className="text-white opacity-75" />
                                </div>
                            </motion.div>
                        </Col>
                    </Row>
                </Container>
            </section>

            {/* Features Section */}
            <section className="py-5">
                <Container>
                    <Row>
                        <Col lg={8} className="mx-auto text-center mb-5">
                            <motion.div
                                initial={{ y: 50, opacity: 0 }}
                                whileInView={{ y: 0, opacity: 1 }}
                                transition={{ duration: 0.6 }}
                                viewport={{ once: true }}
                            >
                                <h2 className="display-5 fw-bold mb-3">
                                    Everything you need to schedule better
                                </h2>
                                <p className="lead text-muted">
                                    Our platform provides all the tools you need for efficient meeting management
                                </p>
                            </motion.div>
                        </Col>
                    </Row>
                    <Row>
                        {features.map((feature, index) => (
                            <Col md={6} lg={3} key={index} className="mb-4">
                                <motion.div
                                    initial={{ y: 50, opacity: 0 }}
                                    whileInView={{ y: 0, opacity: 1 }}
                                    transition={{ delay: index * 0.1, duration: 0.6 }}
                                    viewport={{ once: true }}
                                    whileHover={{ y: -5 }}
                                >
                                    <Card className="card-modern h-100 text-center p-4">
                                        <Card.Body>
                                            <div className="text-primary mb-3">
                                                {feature.icon}
                                            </div>
                                            <Card.Title className="h5 mb-3">
                                                {feature.title}
                                            </Card.Title>
                                            <Card.Text className="text-muted">
                                                {feature.description}
                                            </Card.Text>
                                        </Card.Body>
                                    </Card>
                                </motion.div>
                            </Col>
                        ))}
                    </Row>
                </Container>
            </section>

            {/* CTA Section */}
            <section className="bg-light py-5">
                <Container>
                    <Row>
                        <Col lg={8} className="mx-auto text-center">
                            <motion.div
                                initial={{ scale: 0.9, opacity: 0 }}
                                whileInView={{ scale: 1, opacity: 1 }}
                                transition={{ duration: 0.6 }}
                                viewport={{ once: true }}
                            >
                                <h2 className="display-6 fw-bold mb-3">
                                    Ready to get started?
                                </h2>
                                <p className="lead text-muted mb-4">
                                    Join thousands of professionals who trust ScheduleMe for their meeting needs
                                </p>
                                <Button
                                    size="lg"
                                    variant="primary"
                                    className="btn-modern"
                                    as={Link}
                                    to="/dashboard"
                                >
                                    Start Scheduling Now
                                </Button>
                            </motion.div>
                        </Col>
                    </Row>
                </Container>
            </section>
        </motion.div>
    );
};

export default Home;
