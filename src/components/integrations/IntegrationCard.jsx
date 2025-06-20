import React, { useState } from "react";
import {
  Card,
  Button,
  Badge,
  Form,
  Modal,
  Alert,
  Spinner,
} from "react-bootstrap";
import { motion } from "framer-motion";
import {
  FiCheck,
  FiX,
  FiSettings,
  FiExternalLink,
  FiVideo,
  FiMail,
  FiCalendar,
  FiUsers,
  FiZap,
} from "react-icons/fi";

const IntegrationCard = ({
  integration,
  onConnect,
  onDisconnect,
  onConfigure,
  isLoading = false,
}) => {
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [configData, setConfigData] = useState(integration.config || {});
  const [isConfiguring, setIsConfiguring] = useState(false);

  const getIntegrationIcon = (type) => {
    switch (type) {
      case "zoom":
        return <FiVideo className="text-primary" size={24} />;
      case "google-meet":
        return <FiUsers className="text-success" size={24} />;
      case "gmail":
        return <FiMail className="text-danger" size={24} />;
      case "vitelglobal":
        return <FiZap className="text-info" size={24} />;
      case "outlook":
        return <FiCalendar className="text-warning" size={24} />;
      default:
        return <FiSettings className="text-secondary" size={24} />;
    }
  };

  const getIntegrationBadge = (connected) => {
    return connected ? (
      <Badge bg="success" className="d-flex align-items-center gap-1">
        <FiCheck size={12} />
        Connected
      </Badge>
    ) : (
      <Badge bg="secondary" className="d-flex align-items-center gap-1">
        <FiX size={12} />
        Not Connected
      </Badge>
    );
  };

  const handleConnect = async () => {
    if (integration.requiresConfig && !integration.connected) {
      setShowConfigModal(true);
    } else {
      await onConnect(integration.type);
    }
  };

  const handleConfigure = async () => {
    setIsConfiguring(true);
    try {
      await onConfigure(integration.type, configData);
      setShowConfigModal(false);
    } catch (error) {
      console.error("Configuration error:", error);
    } finally {
      setIsConfiguring(false);
    }
  };

  const renderConfigForm = () => {
    switch (integration.type) {
      case "zoom":
        return (
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>API Key</Form.Label>
              <Form.Control
                type="password"
                placeholder="Enter your Zoom API Key"
                value={configData.apiKey || ""}
                onChange={(e) =>
                  setConfigData({ ...configData, apiKey: e.target.value })
                }
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>API Secret</Form.Label>
              <Form.Control
                type="password"
                placeholder="Enter your Zoom API Secret"
                value={configData.apiSecret || ""}
                onChange={(e) =>
                  setConfigData({ ...configData, apiSecret: e.target.value })
                }
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Check
                type="checkbox"
                label="Auto-generate meeting links"
                checked={configData.autoGenerate || false}
                onChange={(e) =>
                  setConfigData({
                    ...configData,
                    autoGenerate: e.target.checked,
                  })
                }
              />
            </Form.Group>
          </Form>
        );
      case "google-meet":
        return (
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Client ID</Form.Label>
              <Form.Control
                type="text"
                placeholder="Google OAuth Client ID"
                value={configData.clientId || ""}
                onChange={(e) =>
                  setConfigData({ ...configData, clientId: e.target.value })
                }
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Client Secret</Form.Label>
              <Form.Control
                type="password"
                placeholder="Google OAuth Client Secret"
                value={configData.clientSecret || ""}
                onChange={(e) =>
                  setConfigData({ ...configData, clientSecret: e.target.value })
                }
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Check
                type="checkbox"
                label="Enable calendar sync"
                checked={configData.calendarSync || false}
                onChange={(e) =>
                  setConfigData({
                    ...configData,
                    calendarSync: e.target.checked,
                  })
                }
              />
            </Form.Group>
          </Form>
        );
      case "vitelglobal":
        return (
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>VitelGlobal API Token</Form.Label>
              <Form.Control
                type="password"
                placeholder="Enter your VitelGlobal API Token"
                value={configData.apiToken || ""}
                onChange={(e) =>
                  setConfigData({ ...configData, apiToken: e.target.value })
                }
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Account ID</Form.Label>
              <Form.Control
                type="text"
                placeholder="Your VitelGlobal Account ID"
                value={configData.accountId || ""}
                onChange={(e) =>
                  setConfigData({ ...configData, accountId: e.target.value })
                }
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Check
                type="checkbox"
                label="Enable advanced meeting features"
                checked={configData.advancedFeatures || false}
                onChange={(e) =>
                  setConfigData({
                    ...configData,
                    advancedFeatures: e.target.checked,
                  })
                }
              />
            </Form.Group>
          </Form>
        );
      case "gmail":
        return (
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Email Templates</Form.Label>
              <Form.Select
                value={configData.template || "default"}
                onChange={(e) =>
                  setConfigData({ ...configData, template: e.target.value })
                }
              >
                <option value="default">Default Template</option>
                <option value="professional">Professional Template</option>
                <option value="casual">Casual Template</option>
                <option value="custom">Custom Template</option>
              </Form.Select>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Check
                type="checkbox"
                label="Send confirmation emails"
                checked={configData.sendConfirmation || true}
                onChange={(e) =>
                  setConfigData({
                    ...configData,
                    sendConfirmation: e.target.checked,
                  })
                }
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Check
                type="checkbox"
                label="Send reminder emails"
                checked={configData.sendReminders || true}
                onChange={(e) =>
                  setConfigData({
                    ...configData,
                    sendReminders: e.target.checked,
                  })
                }
              />
            </Form.Group>
          </Form>
        );
      default:
        return <p>No configuration options available.</p>;
    }
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Card className="h-100 shadow-sm border-0 integration-card">
          <Card.Body className="d-flex flex-column">
            <div className="d-flex align-items-center justify-content-between mb-3">
              <div className="d-flex align-items-center gap-3">
                {getIntegrationIcon(integration.type)}
                <div>
                  <h5 className="mb-1">{integration.name}</h5>
                  <small className="text-muted">{integration.provider}</small>
                </div>
              </div>
              {getIntegrationBadge(integration.connected)}
            </div>

            <p className="text-muted mb-3 flex-grow-1">
              {integration.description}
            </p>

            {integration.connected && integration.email && (
              <div className="mb-3">
                <small className="text-success">
                  <FiCheck className="me-1" />
                  Connected as: {integration.email}
                </small>
              </div>
            )}

            <div className="d-flex gap-2 mt-auto">
              {!integration.connected ? (
                <Button
                  variant="primary"
                  size="sm"
                  onClick={handleConnect}
                  disabled={isLoading}
                  className="flex-grow-1"
                >
                  {isLoading ? (
                    <>
                      <Spinner size="sm" className="me-2" />
                      Connecting...
                    </>
                  ) : (
                    <>
                      <FiExternalLink className="me-2" />
                      Connect
                    </>
                  )}
                </Button>
              ) : (
                <>
                  <Button
                    variant="outline-secondary"
                    size="sm"
                    onClick={() => setShowConfigModal(true)}
                  >
                    <FiSettings className="me-2" />
                    Configure
                  </Button>
                  <Button
                    variant="outline-danger"
                    size="sm"
                    onClick={() => onDisconnect(integration.type)}
                    disabled={isLoading}
                  >
                    {isLoading ? <Spinner size="sm" /> : <FiX />}
                  </Button>
                </>
              )}
            </div>
          </Card.Body>
        </Card>
      </motion.div>

      {/* Configuration Modal */}
      <Modal
        show={showConfigModal}
        onHide={() => setShowConfigModal(false)}
        size="lg"
      >
        <Modal.Header closeButton>
          <Modal.Title>Configure {integration.name}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Alert variant="info" className="mb-3">
            <FiSettings className="me-2" />
            Configure your {integration.name} integration settings below.
          </Alert>
          {renderConfigForm()}
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={() => setShowConfigModal(false)}
            disabled={isConfiguring}
          >
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleConfigure}
            disabled={isConfiguring}
          >
            {isConfiguring ? (
              <>
                <Spinner size="sm" className="me-2" />
                Saving...
              </>
            ) : (
              <>
                <FiCheck className="me-2" />
                Save Configuration
              </>
            )}
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default IntegrationCard;
