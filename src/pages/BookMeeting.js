import React, { useState } from 'react';
import { Container, Row, Col, Card, Form, Button, Alert } from 'react-bootstrap';
import { motion } from 'framer-motion';
import { FiCalendar, FiClock, FiUser, FiCheck } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';


const BookMeeting = () => {
    const navigate = useNavigate();
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [selectedTime, setSelectedTime] = useState('');
    const [showSuccess, setShowSuccess] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        message: ''
    });

    const timeSlots = [
        '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
        '14:00', '14:30', '15:00', '15:30', '16:00', '16:30'
    ];

    const handleSubmit = (e) => {
        e.preventDefault();

        // Create new booking
        const newBooking = {
            id: Date.now(),
            title: `Meeting with ${formData.name}`,
            date: selectedDate.toISOString().split('T')[0],
            time: selectedTime,
            duration: 30, // Default duration
            attendees: [
                { name: formData.name, email: formData.email, status: 'confirmed' }
            ],
            type: 'consultation',
            status: 'confirmed',
            notes: formData.message,
            meetingLink: `https://zoom.us/j/${Math.random().toString().substr(2, 9)}`
        };

        // Store booking in localStorage using same key as meetings page
        const existingMeetings = JSON.parse(localStorage.getItem('scheduledMeetings') || '[]');
        existingMeetings.push(newBooking);
        localStorage.setItem('scheduledMeetings', JSON.stringify(existingMeetings));

        // Trigger event to update other components
        window.dispatchEvent(new CustomEvent('meetingsUpdated', {
            detail: { newMeeting: newBooking, allMeetings: existingMeetings }
        }));

        // Show success message
        setShowSuccess(true);

        // Send confirmation email
        const subject = encodeURIComponent(`Meeting Confirmation: ${newBooking.title}`);
        const body = encodeURIComponent(`
Dear ${formData.name},

Your meeting has been successfully booked!

Details:
- Date: ${selectedDate.toLocaleDateString()}
- Time: ${selectedTime}
- Duration: 30 minutes

Meeting Link: ${newBooking.meetingLink}

We look forward to meeting with you!

Best regards,
meetslot.ai Team
        `);

        // Redirect to meetings page after 3 seconds
        setTimeout(() => {
            navigate('/meetings', {
                state: {
                    newBooking: newBooking,
                    message: 'Your meeting has been successfully booked!',
                    highlight: newBooking.id
                }
            });
        }, 3000);

        // Optional: Open email client
        if (window.confirm('Booking confirmed! Would you like to send a confirmation email?')) {
            window.open(`mailto:${formData.email}?subject=${subject}&body=${body}`);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="page-transition py-5"
        >
            <Container>
                <Row>
                    <Col lg={8} className="mx-auto">
                        <motion.div
                            initial={{ y: 30, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.2 }}
                        >
                            <Card className="card-modern">
                                <Card.Body className="p-5">
                                    {showSuccess ? (
                                        <motion.div
                                            initial={{ scale: 0.8, opacity: 0 }}
                                            animate={{ scale: 1, opacity: 1 }}
                                            className="text-center py-5"
                                        >
                                            <FiCheck size={64} className="text-success mb-3" />
                                            <h2 className="h3 fw-bold text-success mb-3">Meeting Booked Successfully!</h2>
                                            <p className="text-muted mb-4">
                                                Your meeting for {selectedDate.toLocaleDateString()} at {selectedTime} has been confirmed.
                                                <br />
                                                You will be redirected to your meetings page shortly.
                                            </p>
                                            <Alert variant="success" className="d-inline-block">
                                                <strong>Confirmation sent to:</strong> {formData.email}
                                            </Alert>
                                            <div className="mt-4">
                                                <Button
                                                    variant="primary"
                                                    className="btn-modern me-3"
                                                    onClick={() => navigate('/meetings')}
                                                >
                                                    View My Meetings
                                                </Button>
                                                <Button
                                                    variant="outline-primary"
                                                    className="btn-modern"
                                                    onClick={() => navigate('/dashboard')}
                                                >
                                                    Go to Dashboard
                                                </Button>
                                            </div>
                                        </motion.div>
                                    ) : (
                                        <>
                                            <div className="text-center mb-4">
                                                <FiCalendar size={48} className="text-primary mb-3" />
                                                <h2 className="h3 fw-bold">Book a Meeting</h2>
                                                <p className="text-muted">Choose a time that works for you</p>
                                            </div>

                                            <Row>
                                                <Col md={6}>
                                                    <h5 className="mb-3">Select Date</h5>
                                                    <motion.div
                                                        whileHover={{ scale: 1.02 }}
                                                        className="calendar-container"
                                                    >
                                                        <Calendar
                                                            onChange={setSelectedDate}
                                                            value={selectedDate}
                                                            minDate={new Date()}
                                                            className="modern-calendar w-100"
                                                        />
                                                    </motion.div>
                                                </Col>

                                                <Col md={6} className="mt-4 mt-md-0">
                                                    <h5 className="mb-3">Available Times</h5>
                                                    <div className="time-slots">
                                                        {timeSlots.map((time) => (
                                                            <motion.button
                                                                key={time}
                                                                type="button"
                                                                className={`btn btn-outline-primary btn-sm me-2 mb-2 ${selectedTime === time ? 'active' : ''
                                                                    }`}
                                                                onClick={() => setSelectedTime(time)}
                                                                whileHover={{ scale: 1.05 }}
                                                                whileTap={{ scale: 0.95 }}
                                                            >
                                                                <FiClock size={14} className="me-1" />
                                                                {time}
                                                            </motion.button>
                                                        ))}
                                                    </div>

                                                    {selectedTime && (
                                                        <motion.div
                                                            initial={{ opacity: 0, y: 20 }}
                                                            animate={{ opacity: 1, y: 0 }}
                                                            className="mt-4"
                                                        >
                                                            <h5 className="mb-3">Your Details</h5>
                                                            <Form onSubmit={handleSubmit}>
                                                                <Form.Group className="mb-3">
                                                                    <Form.Label>Name *</Form.Label>
                                                                    <Form.Control
                                                                        type="text"
                                                                        required
                                                                        value={formData.name}
                                                                        onChange={(e) => setFormData({
                                                                            ...formData,
                                                                            name: e.target.value
                                                                        })}
                                                                        className="form-control-modern"
                                                                    />
                                                                </Form.Group>

                                                                <Form.Group className="mb-3">
                                                                    <Form.Label>Email *</Form.Label>
                                                                    <Form.Control
                                                                        type="email"
                                                                        required
                                                                        value={formData.email}
                                                                        onChange={(e) => setFormData({
                                                                            ...formData,
                                                                            email: e.target.value
                                                                        })}
                                                                        className="form-control-modern"
                                                                    />
                                                                </Form.Group>

                                                                <Form.Group className="mb-4">
                                                                    <Form.Label>Message (Optional)</Form.Label>
                                                                    <Form.Control
                                                                        as="textarea"
                                                                        rows={3}
                                                                        value={formData.message}
                                                                        onChange={(e) => setFormData({
                                                                            ...formData,
                                                                            message: e.target.value
                                                                        })}
                                                                        className="form-control-modern"
                                                                    />
                                                                </Form.Group>

                                                                <Button
                                                                    type="submit"
                                                                    variant="primary"
                                                                    size="lg"
                                                                    className="btn-modern w-100"
                                                                >
                                                                    <FiUser className="me-2" />
                                                                    Book Meeting
                                                                </Button>
                                                            </Form>
                                                        </motion.div>
                                                    )}
                                                </Col>
                                            </Row>
                                        </>
                                    )}
                                </Card.Body>
                            </Card>
                        </motion.div>
                    </Col>
                </Row>
            </Container>
        </motion.div>
    );
};

export default BookMeeting;
