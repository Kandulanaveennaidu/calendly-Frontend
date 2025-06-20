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
  FiLock,
  FiEye,
  FiEyeOff,
  FiUser,
  FiShield,
  FiAlertCircle,
} from "react-icons/fi";
import authService from "../../services/authService";

const EnhancedLoginForm = ({
  onLoginSuccess,
  onForgotPassword,
  onSignUp,
  redirectTo = "/",
  showSignUpLink = true,
  title = "Welcome Back",
  subtitle = "Sign in to your account",
}) => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    rememberMe: false,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [validationErrors, setValidationErrors] = useState({});

  const validateForm = () => {
    const errors = {};

    if (!formData.email) {
      errors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = "Please enter a valid email address";
    }

    if (!formData.password) {
      errors.password = "Password is required";
    } else if (formData.password.length < 6) {
      errors.password = "Password must be at least 6 characters";
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const response = await authService.login(
        formData.email,
        formData.password,
        formData.rememberMe
      );

      if (onLoginSuccess) {
        onLoginSuccess(response);
      }
    } catch (err) {
      console.error("Login error:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));

    // Clear validation error when user starts typing
    if (validationErrors[field]) {
      setValidationErrors((prev) => ({ ...prev, [field]: "" }));
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
    if (
      errorMessage.includes("locked") ||
      errorMessage.includes("Account is locked")
    ) {
      return "danger";
    }
    return "danger";
  };

  const getErrorIcon = (errorMessage) => {
    if (
      errorMessage.includes("rate limit") ||
      errorMessage.includes("Too many")
    ) {
      return <FiShield className="me-2" />;
    }
    if (
      errorMessage.includes("locked") ||
      errorMessage.includes("Account is locked")
    ) {
      return <FiAlertCircle className="me-2" />;
    }
    return <FiAlertCircle className="me-2" />;
  };

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
                    <FiUser size={24} className="text-white" />
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
                      <Alert
                        variant={getErrorType(error)}
                        className="d-flex align-items-center"
                      >
                        {getErrorIcon(error)}
                        <div>
                          <strong>{error}</strong>
                          {error.includes("locked") && (
                            <div className="small mt-1">
                              You can reset your password or wait before trying
                              again.
                            </div>
                          )}
                          {error.includes("rate limit") && (
                            <div className="small mt-1">
                              Please wait a few minutes before attempting to log
                              in again.
                            </div>
                          )}
                        </div>
                      </Alert>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Login Form */}
                <Form onSubmit={handleSubmit}>
                  <Form.Group className="mb-3">
                    <Form.Label className="fw-semibold">
                      Email Address
                    </Form.Label>
                    <InputGroup>
                      <InputGroup.Text className="bg-light border-end-0">
                        <FiMail className="text-muted" />
                      </InputGroup.Text>
                      <Form.Control
                        type="email"
                        placeholder="Enter your email"
                        value={formData.email}
                        onChange={(e) =>
                          handleInputChange("email", e.target.value)
                        }
                        isInvalid={!!validationErrors.email}
                        className="border-start-0 ps-0"
                        autoComplete="email"
                        disabled={loading}
                      />
                      <Form.Control.Feedback type="invalid">
                        {validationErrors.email}
                      </Form.Control.Feedback>
                    </InputGroup>
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label className="fw-semibold">Password</Form.Label>
                    <InputGroup>
                      <InputGroup.Text className="bg-light border-end-0">
                        <FiLock className="text-muted" />
                      </InputGroup.Text>
                      <Form.Control
                        type={showPassword ? "text" : "password"}
                        placeholder="Enter your password"
                        value={formData.password}
                        onChange={(e) =>
                          handleInputChange("password", e.target.value)
                        }
                        isInvalid={!!validationErrors.password}
                        className="border-start-0 border-end-0 ps-0"
                        autoComplete="current-password"
                        disabled={loading}
                      />
                      <InputGroup.Text
                        className="bg-light border-start-0 cursor-pointer"
                        onClick={() => setShowPassword(!showPassword)}
                        style={{ cursor: "pointer" }}
                      >
                        {showPassword ? (
                          <FiEyeOff className="text-muted" />
                        ) : (
                          <FiEye className="text-muted" />
                        )}
                      </InputGroup.Text>
                      <Form.Control.Feedback type="invalid">
                        {validationErrors.password}
                      </Form.Control.Feedback>
                    </InputGroup>
                  </Form.Group>

                  <Row className="mb-4">
                    <Col>
                      <Form.Check
                        type="checkbox"
                        id="rememberMe"
                        label="Remember me"
                        checked={formData.rememberMe}
                        onChange={(e) =>
                          handleInputChange("rememberMe", e.target.checked)
                        }
                        disabled={loading}
                      />
                    </Col>
                    <Col className="text-end">
                      <Button
                        variant="link"
                        onClick={onForgotPassword}
                        className="p-0 text-decoration-none small"
                        disabled={loading}
                      >
                        Forgot Password?
                      </Button>
                    </Col>
                  </Row>

                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Button
                      type="submit"
                      variant="primary"
                      size="lg"
                      className="w-100 py-3 fw-semibold rounded-3"
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
                          Signing in...
                        </>
                      ) : (
                        "Sign In"
                      )}
                    </Button>
                  </motion.div>
                </Form>

                {/* Sign Up Link */}
                {showSignUpLink && (
                  <div className="text-center mt-4">
                    <p className="text-muted mb-0">
                      Don't have an account?{" "}
                      <Button
                        variant="link"
                        onClick={onSignUp}
                        className="p-0 fw-semibold text-decoration-none"
                        disabled={loading}
                      >
                        Sign up here
                      </Button>
                    </p>
                  </div>
                )}
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

        .cursor-pointer {
          cursor: pointer;
        }

        .form-control:focus {
          border-color: #667eea;
          box-shadow: 0 0 0 0.2rem rgba(102, 126, 234, 0.25);
        }

        .input-group-text {
          border-color: #dee2e6;
        }

        .form-control.border-start-0:focus {
          border-left-color: transparent;
        }

        .form-control.border-end-0:focus {
          border-right-color: transparent;
        }

        .input-group:focus-within .input-group-text {
          border-color: #667eea;
        }
      `}</style>
    </Container>
  );
};

export default EnhancedLoginForm;
