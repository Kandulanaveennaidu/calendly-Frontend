import React from 'react';
import { Container, Alert } from 'react-bootstrap';

const SettingsDebug = () => {
    return (
        <Container className="py-5">
            <Alert variant="info">
                <h4>✅ Settings Page Working!</h4>
                <p>The routing is working correctly. You have successfully navigated to the Settings page.</p>
                <hr />
                <p className="mb-0">
                    <strong>Route:</strong> /settings<br />
                    <strong>Component:</strong> Settings.js<br />
                    <strong>Status:</strong> Loaded successfully
                </p>
            </Alert>
        </Container>
    );
};

export default SettingsDebug;
