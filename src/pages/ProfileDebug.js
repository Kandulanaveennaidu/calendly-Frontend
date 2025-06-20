import React from 'react';
import { Container, Alert } from 'react-bootstrap';

const ProfileDebug = () => {
    return (
        <Container className="py-5">
            <Alert variant="success">
                <h4>✅ Profile Page Working!</h4>
                <p>The routing is working correctly. You have successfully navigated to the Profile page.</p>
                <hr />
                <p className="mb-0">
                    <strong>Route:</strong> /profile<br />
                    <strong>Component:</strong> Profile.js<br />
                    <strong>Status:</strong> Loaded successfully
                </p>
            </Alert>
        </Container>
    );
};

export default ProfileDebug;
