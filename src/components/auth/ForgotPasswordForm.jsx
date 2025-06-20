import React, { useState } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Form,
  Button,
  Alert,
  InputGroup,
  Spinner,
} from "react-bootstrap";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiMail,
  FiArrowLeft,
  FiSend,
  FiCheckCircle,
  FiInfo,
} from "react-icons/fi";
import authService from "../../services/authService";

const ForgotPasswordForm = ({
  onBackToLogin,
  onResetCodeSent,
  title = "Reset Your Password",
  subtitle = "Enter your email to receive reset instructions",
}) => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [validationError, setValidationError] = useState("");

  const validateEmail = (email) => {
    if (!email) {
      return "Email is required";
    }
    if (!/\S+@\S+\.\S+/.test(email)) {
      return "Please enter a valid email address";
    }
    return "";
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const emailError = validateEmail(email);
    if (emailError) {
      setValidationError(emailError);
      return;
    }

    setLoading(true);

    try {
      const response = await authService.forgotPassword(email);
      console.log("Forgot password response:", response); // Debug log

      // The backend returns a success response
      if (response.success || response.message) {
        setSuccess(true);
        if (onResetCodeSent) {
          onResetCodeSent(email);
        }
      } else {
        // If no success property, assume success since no error was thrown
        setSuccess(true);
        if (onResetCodeSent) {
          onResetCodeSent(email);
        }
      }
    } catch (err) {
      console.error("Forgot password error:", err);
      setError(err.message || "Failed to send reset email. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleEmailChange = (value) => {
    setEmail(value);

    // Clear validation error when user starts typing
    if (validationError) {
      setValidationError("");
    }

    // Clear general error
    if (error) {
      setError("");
    }
  };

  const getErrorType = (errorMessage) => {
    if (
      errorMessage.includes("rate limit") ||
      errorMessage.includes("Too many")
    ) {
      return "warning";
    }
    return "danger";
  };

  if (success) {
    return (
      <Container className="py-5">
        <Row className="justify-content-center">
          <Col xs={12} sm={10} md={8} lg={6} xl={5}>
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6 }}
            >
              <Card className="shadow-lg border-0 rounded-4">
                <Card.Body className="p-5 text-center">
                  <motion.div
                    className="d-inline-flex align-items-center justify-content-center rounded-circle mb-4"
                    style={{
                      width: "80px",
                      height: "80px",
                      background:
                        "linear-gradient(135deg, #22c55e 0%, #16a34a 100%)",
                    }}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.3, duration: 0.5, type: "spring" }}
                  >
                    <FiCheckCircle size={32} className="text-white" />
                  </motion.div>

                  <h2 className="fw-bold mb-3 text-success">
                    Check Your Email!
                  </h2>
                  <p className="text-muted mb-4">
                    We've sent password reset instructions to{" "}
                    <strong>{email}</strong>
                  </p>

                  <Alert variant="info" className="text-start mb-4">
                    <FiInfo className="me-2" />
                    <div>
                      <strong>Next Steps:</strong>
                      <ol className="mb-0 mt-2 ps-3">
                        <li>Check your email inbox for our message</li>
                        <li>Click the reset link or copy the reset code</li>
                        <li>
                          Follow the instructions to create a new password
                        </li>
                      </ol>
                    </div>
                  </Alert>

                  <div className="text-muted small mb-4">
                    <p className="mb-2">
                      <strong>Didn't receive the email?</strong>
                    </p>
                    <ul className="list-unstyled small">
                      <li>• Check your spam/junk folder</li>
                      <li>• Make sure you entered the correct email</li>
                      <li>• Wait a few minutes for delivery</li>
                    </ul>
                  </div>

                  <Button
                    variant="outline-primary"
                    onClick={onBackToLogin}
                    className="me-3"
                  >
                    <FiArrowLeft className="me-2" />
                    Back to Login
                  </Button>

                  <Button
                    variant="primary"
                    onClick={() => {
                      setSuccess(false);
                      setEmail("");
                    }}
                    style={{
                      background:
                        "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                      border: "none",
                    }}
                  >
                    Send Another Email
                  </Button>
                </Card.Body>
              </Card>
            </motion.div>
          </Col>
        </Row>
      </Container>
    );
  }

  return (
    <Container className="py-5">
      <Row className="justify-content-center">
        <Col xs={12} sm={10} md={8} lg={6} xl={5}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Card className="shadow-lg border-0 rounded-4">
              <Card.Body className="p-5">
                {/* Header */}
                <div className="text-center mb-4">
                  <motion.div
                    className="d-inline-flex align-items-center justify-content-center rounded-circle mb-3"
                    style={{
                      width: "64px",
                      height: "64px",
                      background:
                        "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                    }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <FiMail size={24} className="text-white" />
                  </motion.div>
                  <h2 className="fw-bold mb-2 text-gradient">{title}</h2>
                  <p className="text-muted mb-0">{subtitle}</p>
                </div>

                {/* Error Alert */}
                <AnimatePresence>
                  {error && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mb-4"
                    >
                      <Alert variant={getErrorType(error)}>
                        <strong>{error}</strong>
                        {error.includes("rate limit") && (
                          <div className="small mt-1">
                            Please wait a few minutes before trying again.
                          </div>
                        )}
                      </Alert>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Form */}
                <Form onSubmit={handleSubmit}>
                  <Form.Group className="mb-4">
                    <Form.Label className="fw-semibold">
                      Email Address
                    </Form.Label>
                    <InputGroup>
                      <InputGroup.Text className="bg-light border-end-0">
                        <FiMail className="text-muted" />
                      </InputGroup.Text>
                      <Form.Control
                        type="email"
                        placeholder="Enter your email address"
                        value={email}
                        onChange={(e) => handleEmailChange(e.target.value)}
                        isInvalid={!!validationError}
                        className="border-start-0 ps-0"
                        autoComplete="email"
                        disabled={loading}
                        autoFocus
                      />
                      <Form.Control.Feedback type="invalid">
                        {validationError}
                      </Form.Control.Feedback>
                    </InputGroup>
                    <Form.Text className="text-muted">
                      We'll send password reset instructions to this email
                      address.
                    </Form.Text>
                  </Form.Group>

                  <div className="d-grid gap-2 mb-4">
                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Button
                        type="submit"
                        variant="primary"
                        size="lg"
                        className="py-3 fw-semibold rounded-3"
                        disabled={loading}
                        style={{
                          background:
                            "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                          border: "none",
                        }}
                      >
                        {loading ? (
                          <>
                            <Spinner size="sm" className="me-2" />
                            Sending Instructions...
                          </>
                        ) : (
                          <>
                            <FiSend className="me-2" />
                            Send Reset Instructions
                          </>
                        )}
                      </Button>
                    </motion.div>
                  </div>

                  <div className="text-center">
                    <Button
                      variant="link"
                      onClick={onBackToLogin}
                      className="text-decoration-none"
                      disabled={loading}
                    >
                      <FiArrowLeft className="me-2" />
                      Back to Login
                    </Button>
                  </div>
                </Form>

                {/* Information Box */}
                <Alert variant="light" className="mt-4 border">
                  <FiInfo className="me-2 text-primary" />
                  <strong>Security Notice:</strong> If you don't receive an
                  email within 10 minutes, please check your spam folder or
                  contact support for assistance.
                </Alert>
              </Card.Body>
            </Card>
          </motion.div>
        </Col>
      </Row>

      {/* Styles */}
      <style jsx>{`
        .text-gradient {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .form-control:focus {
          border-color: #667eea;
          box-shadow: 0 0 0 0.2rem rgba(102, 126, 234, 0.25);
        }

        .input-group:focus-within .input-group-text {
          border-color: #667eea;
        }

        .form-control.border-start-0:focus {
          border-left-color: transparent;
        }
      `}</style>
    </Container>
  );
};

export default ForgotPasswordForm;
