import React, { useContext } from 'react';
import { Navbar, Nav, Container, NavDropdown, Button } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { FiCalendar, FiUser, FiLogOut, FiSettings } from 'react-icons/fi';
import { AuthContext } from '../context/AuthContext';

const NavbarComponent = () => {
    const { currentUser, logout } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <Navbar bg="white" expand="lg" className="shadow-sm py-2">
            <Container>
                <Navbar.Brand as={Link} to="/dashboard" className="fw-bold">
                    <FiCalendar className="me-2" />
                    ScheduleMe
                </Navbar.Brand>
                <Navbar.Toggle aria-controls="basic-navbar-nav" />
                <Navbar.Collapse id="basic-navbar-nav">
                    <Nav className="me-auto">
                        <Nav.Link as={Link} to="/dashboard">Dashboard</Nav.Link>
                        <Nav.Link as={Link} to="/meetings">Meetings</Nav.Link>
                        <Nav.Link as={Link} to="/calendar">Calendar</Nav.Link>
                    </Nav>
                    <Nav>
                        {currentUser ? (
                            <NavDropdown
                                title={
                                    <div className="d-inline-flex align-items-center">
                                        <div className="avatar-sm me-2">
                                            <img
                                                src={currentUser.avatar || 'https://via.placeholder.com/40'}
                                                alt="User"
                                                className="rounded-circle"
                                                width="30"
                                                height="30"
                                            />
                                        </div>
                                        <span>{currentUser.name}</span>
                                    </div>
                                }
                                id="user-nav-dropdown"
                            >
                                <NavDropdown.Item as={Link} to="/profile">
                                    <FiUser className="me-2" />
                                    Profile
                                </NavDropdown.Item>
                                <NavDropdown.Item as={Link} to="/settings">
                                    <FiSettings className="me-2" />
                                    Settings
                                </NavDropdown.Item>
                                <NavDropdown.Divider />
                                <NavDropdown.Item onClick={handleLogout}>
                                    <FiLogOut className="me-2" />
                                    Logout
                                </NavDropdown.Item>
                            </NavDropdown>
                        ) : (
                            <>
                                <Nav.Link as={Link} to="/login">Login</Nav.Link>
                                <Button
                                    as={Link}
                                    to="/signup"
                                    variant="primary"
                                    className="ms-2 btn-modern"
                                >
                                    Sign Up
                                </Button>
                            </>
                        )}
                    </Nav>
                </Navbar.Collapse>
            </Container>
        </Navbar>
    );
};

export default NavbarComponent;
