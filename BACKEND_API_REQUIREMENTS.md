# Backend API Requirements for Profile and Settings

## Overview
This document provides comprehensive requirements for implementing backend APIs to support the Profile and Settings sections of the scheduling application. The frontend has been built with modern React components and expects specific API endpoints and data structures.

## Authentication Requirements
All APIs must be protected with JWT authentication. Include the following in every request:
```
Authorization: Bearer <jwt_token>
```

---

## 📋 TABLE OF CONTENTS

1. [Profile Section APIs](#profile-section-apis)
2. [Settings Section APIs](#settings-section-apis)
3. [Integration APIs](#integration-apis)
4. [User Statistics APIs](#user-statistics-apis)
5. [File Upload APIs](#file-upload-apis)
6. [Database Schema Requirements](#database-schema-requirements)
7. [Security Considerations](#security-considerations)
8. [Error Handling Standards](#error-handling-standards)

---

## 🔧 PROFILE SECTION APIs

### 1. Get User Profile
**Endpoint:** `GET /api/profile`

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Response Format:**
```json
{
  "success": true,
  "data": {
    "id": "user_id",
    "firstName": "John",
    "lastName": "Doe",
    "email": "john.doe@email.com",
    "bio": "Professional description",
    "phone": "+1234567890",
    "timezone": "America/New_York",
    "avatar": "https://storage.example.com/avatars/user_id.jpg",
    "createdAt": "2024-01-01T00:00:00Z",
    "updatedAt": "2024-01-15T10:30:00Z",
    "emailVerified": true,
    "phoneVerified": false,
    "isActive": true
  }
}
```

**Error Response:**
```json
{
  "success": false,
  "error": "Profile not found",
  "code": "PROFILE_NOT_FOUND"
}
```

### 2. Update User Profile
**Endpoint:** `PUT /api/profile`

**Headers:**
```
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "bio": "Updated professional description",
  "phone": "+1234567890",
  "timezone": "America/New_York"
}
```

**Validation Rules:**
- `firstName`: Required, 2-50 characters, letters only
- `lastName`: Required, 2-50 characters, letters only
- `bio`: Optional, max 500 characters
- `phone`: Optional, valid phone format
- `timezone`: Optional, valid timezone string

**Response Format:**
```json
{
  "success": true,
  "message": "Profile updated successfully",
  "data": {
    // Updated profile object (same as GET /api/profile)
  }
}
```

### 3. Upload Avatar
**Endpoint:** `POST /api/profile/avatar`

**Headers:**
```
Authorization: Bearer <jwt_token>
Content-Type: multipart/form-data
```

**Request Body:**
```
avatar: <file> (image file)
```

**File Requirements:**
- Max size: 5MB
- Allowed formats: jpg, jpeg, png, gif
- Recommended dimensions: 400x400px minimum

**Response Format:**
```json
{
  "success": true,
  "message": "Avatar uploaded successfully",
  "data": {
    "avatar": "https://storage.example.com/avatars/user_id_timestamp.jpg"
  }
}
```

### 4. Delete Avatar
**Endpoint:** `DELETE /api/profile/avatar`

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Response Format:**
```json
{
  "success": true,
  "message": "Avatar deleted successfully"
}
```

---

## ⚙️ SETTINGS SECTION APIs

### 1. Get User Settings
**Endpoint:** `GET /api/settings`

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Response Format:**
```json
{
  "success": true,
  "data": {
    "notifications": {
      "emailNotifications": true,
      "browserNotifications": true,
      "reminderTime": 15
    },
    "calendar": {
      "workingHours": {
        "start": "09:00",
        "end": "17:00",
        "timezone": "America/New_York"
      },
      "bufferTime": 15,
      "maxBookingsPerDay": 8,
      "availableDays": ["monday", "tuesday", "wednesday", "thursday", "friday"]
    },
    "theme": {
      "primaryColor": "#006bff",
      "secondaryColor": "#6c757d",
      "accentColor": "#28a745",
      "darkMode": false
    },
    "integrations": {
      "autoCreateMeetings": true,
      "defaultMeetingProvider": "zoom",
      "syncCalendar": true
    }
  }
}
```

### 2. Update Notification Settings
**Endpoint:** `PUT /api/settings/notifications`

**Headers:**
```
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "emailNotifications": true,
  "browserNotifications": false,
  "reminderTime": 30
}
```

**Validation Rules:**
- `reminderTime`: Integer between 5 and 120 minutes

**Response Format:**
```json
{
  "success": true,
  "message": "Notification settings updated successfully",
  "data": {
    "notifications": {
      // Updated notification settings
    }
  }
}
```

### 3. Update Calendar Settings
**Endpoint:** `PUT /api/settings/calendar`

**Headers:**
```
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "workingHours": {
    "start": "08:00",
    "end": "18:00",
    "timezone": "America/New_York"
  },
  "bufferTime": 10,
  "maxBookingsPerDay": 12,
  "availableDays": ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday"]
}
```

**Validation Rules:**
- `workingHours.start/end`: Valid 24-hour time format (HH:MM)
- `bufferTime`: Integer between 0 and 60 minutes
- `maxBookingsPerDay`: Integer between 1 and 24
- `availableDays`: Array of valid day names

### 4. Update Theme Settings
**Endpoint:** `PUT /api/settings/theme`

**Headers:**
```
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "primaryColor": "#007bff",
  "secondaryColor": "#6c757d",
  "accentColor": "#28a745",
  "darkMode": true
}
```

**Validation Rules:**
- Color values must be valid hex colors (#RRGGBB format)
- `darkMode`: Boolean value

---

## 🔗 INTEGRATION APIS

### 1. Get All Integrations
**Endpoint:** `GET /api/integrations`

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Response Format:**
```json
{
  "success": true,
  "data": [
    {
      "id": "zoom",
      "name": "Zoom",
      "type": "video_conferencing",
      "connected": true,
      "status": "active",
      "email": "user@company.com",
      "connectedAt": "2024-01-10T14:30:00Z",
      "lastSync": "2024-01-15T09:00:00Z",
      "config": {
        "autoCreateMeetings": true,
        "meetingPassword": true
      }
    },
    {
      "id": "google_meet",
      "name": "Google Meet",
      "type": "video_conferencing",
      "connected": false,
      "status": "available"
    },
    {
      "id": "outlook",
      "name": "Microsoft Outlook",
      "type": "calendar",
      "connected": true,
      "status": "active",
      "email": "user@company.com",
      "connectedAt": "2024-01-05T10:15:00Z",
      "lastSync": "2024-01-15T08:45:00Z"
    },
    {
      "id": "gmail",
      "name": "Gmail",
      "type": "email",
      "connected": false,
      "status": "available"
    },
    {
      "id": "vitelglobal",
      "name": "VitelGlobal Meet",
      "type": "video_conferencing",
      "connected": false,
      "status": "available"
    }
  ]
}
```

### 2. Connect Integration
**Endpoint:** `POST /api/integrations/{integration_type}/connect`

**Headers:**
```
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

**Request Body (varies by integration):**

**For Zoom:**
```json
{
  "authCode": "authorization_code_from_zoom",
  "redirectUri": "https://yourdomain.com/integrations/zoom/callback"
}
```

**For Google Services:**
```json
{
  "authCode": "authorization_code_from_google",
  "scope": ["https://www.googleapis.com/auth/calendar", "https://www.googleapis.com/auth/gmail.send"]
}
```

**For VitelGlobal:**
```json
{
  "apiKey": "vitelglobal_api_key",
  "organizationId": "org_id"
}
```

**Response Format:**
```json
{
  "success": true,
  "message": "Integration connected successfully",
  "data": {
    "integration": {
      "id": "zoom",
      "connected": true,
      "status": "active",
      "email": "user@company.com",
      "connectedAt": "2024-01-15T12:00:00Z"
    }
  }
}
```

### 3. Disconnect Integration
**Endpoint:** `DELETE /api/integrations/{integration_type}/disconnect`

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Response Format:**
```json
{
  "success": true,
  "message": "Integration disconnected successfully"
}
```

### 4. Configure Integration
**Endpoint:** `PUT /api/integrations/{integration_type}/configure`

**Headers:**
```
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

**Request Body (Zoom example):**
```json
{
  "autoCreateMeetings": true,
  "meetingPassword": true,
  "defaultDuration": 30,
  "waitingRoom": false
}
```

### 5. Test Integration
**Endpoint:** `POST /api/integrations/{integration_type}/test`

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Response Format:**
```json
{
  "success": true,
  "message": "Integration test successful",
  "data": {
    "status": "connected",
    "lastTested": "2024-01-15T13:45:00Z",
    "testResults": {
      "connectionStatus": "success",
      "authStatus": "valid",
      "apiVersion": "v2"
    }
  }
}
```

---

## 📊 USER STATISTICS APIS

### 1. Get User Statistics
**Endpoint:** `GET /api/profile/stats`

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Response Format:**
```json
{
  "success": true,
  "data": {
    "totalMeetings": 145,
    "totalBookings": 189,
    "totalHours": 256.5,
    "thisMonth": {
      "meetings": 23,
      "bookings": 28,
      "hours": 34.5
    },
    "integrations": {
      "connected": 3,
      "available": 5
    },
    "recentActivity": [
      {
        "type": "meeting_completed",
        "title": "Team Standup",
        "date": "2024-01-15T10:00:00Z"
      },
      {
        "type": "booking_created",
        "title": "Client Consultation",
        "date": "2024-01-14T15:30:00Z"
      }
    ]
  }
}
```

---

## 📤 FILE UPLOAD APIS

### 1. Upload Profile Documents
**Endpoint:** `POST /api/profile/documents`

**Headers:**
```
Authorization: Bearer <jwt_token>
Content-Type: multipart/form-data
```

**Request Body:**
```
document: <file>
type: "resume" | "certificate" | "portfolio"
```

**Response Format:**
```json
{
  "success": true,
  "message": "Document uploaded successfully",
  "data": {
    "id": "doc_id",
    "filename": "resume.pdf",
    "url": "https://storage.example.com/documents/user_id/resume.pdf",
    "type": "resume",
    "uploadedAt": "2024-01-15T14:20:00Z"
  }
}
```

---

## 🗄️ DATABASE SCHEMA REQUIREMENTS

### Users Table
```sql
CREATE TABLE users (
    id VARCHAR(36) PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    bio TEXT,
    phone VARCHAR(20),
    timezone VARCHAR(50) DEFAULT 'UTC',
    avatar VARCHAR(500),
    email_verified BOOLEAN DEFAULT FALSE,
    phone_verified BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

### User Settings Table
```sql
CREATE TABLE user_settings (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL,
    email_notifications BOOLEAN DEFAULT TRUE,
    browser_notifications BOOLEAN DEFAULT TRUE,
    reminder_time INT DEFAULT 15,
    working_hours_start TIME DEFAULT '09:00:00',
    working_hours_end TIME DEFAULT '17:00:00',
    working_timezone VARCHAR(50) DEFAULT 'UTC',
    buffer_time INT DEFAULT 15,
    max_bookings_per_day INT DEFAULT 8,
    available_days JSON DEFAULT '["monday","tuesday","wednesday","thursday","friday"]',
    primary_color VARCHAR(7) DEFAULT '#006bff',
    secondary_color VARCHAR(7) DEFAULT '#6c757d',
    accent_color VARCHAR(7) DEFAULT '#28a745',
    dark_mode BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

### User Integrations Table
```sql
CREATE TABLE user_integrations (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL,
    integration_type VARCHAR(50) NOT NULL,
    connected BOOLEAN DEFAULT FALSE,
    status ENUM('active', 'inactive', 'error') DEFAULT 'inactive',
    email VARCHAR(255),
    access_token TEXT,
    refresh_token TEXT,
    token_expires_at TIMESTAMP,
    config JSON,
    connected_at TIMESTAMP,
    last_sync TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_integration (user_id, integration_type)
);
```

### User Documents Table
```sql
CREATE TABLE user_documents (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL,
    filename VARCHAR(255) NOT NULL,
    original_name VARCHAR(255) NOT NULL,
    url VARCHAR(500) NOT NULL,
    type ENUM('avatar', 'resume', 'certificate', 'portfolio') NOT NULL,
    file_size INT NOT NULL,
    mime_type VARCHAR(100) NOT NULL,
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

---

## 🔒 SECURITY CONSIDERATIONS

### 1. Authentication & Authorization
- All endpoints require valid JWT tokens
- Implement rate limiting (e.g., 100 requests per minute per user)
- Use HTTPS only for all API communications
- Validate JWT tokens on every request

### 2. Data Validation
- Sanitize all input data
- Implement server-side validation for all fields
- Use parameterized queries to prevent SQL injection
- Validate file uploads (type, size, content)

### 3. Integration Security
- Store integration tokens encrypted at rest
- Use secure OAuth 2.0 flows for third-party integrations
- Implement token refresh mechanisms
- Log all integration activities

### 4. File Security
- Scan uploaded files for malware
- Generate unique filenames to prevent conflicts
- Store files in secure cloud storage (AWS S3, Google Cloud Storage)
- Implement access controls for file downloads

---

## ⚠️ ERROR HANDLING STANDARDS

### Standard Error Response Format
```json
{
  "success": false,
  "error": "Human readable error message",
  "code": "ERROR_CODE",
  "details": {
    "field": "Specific field error message"
  },
  "timestamp": "2024-01-15T15:30:00Z"
}
```

### Common Error Codes
- `UNAUTHORIZED`: Invalid or missing authentication token
- `FORBIDDEN`: User doesn't have permission for this action
- `VALIDATION_ERROR`: Input validation failed
- `NOT_FOUND`: Resource not found
- `INTEGRATION_ERROR`: Third-party integration error
- `FILE_UPLOAD_ERROR`: File upload failed
- `RATE_LIMIT_EXCEEDED`: Too many requests

### HTTP Status Codes
- `200`: Success
- `201`: Created
- `400`: Bad Request (validation errors)
- `401`: Unauthorized
- `403`: Forbidden
- `404`: Not Found
- `422`: Unprocessable Entity (business logic errors)
- `429`: Too Many Requests (rate limiting)
- `500`: Internal Server Error

---

## 🧪 TESTING REQUIREMENTS

### Unit Tests Required
- Input validation functions
- Authentication middleware
- Integration service methods
- File upload handlers

### Integration Tests Required
- Complete API endpoint flows
- Database operations
- Third-party integration connections
- File upload and storage

### Performance Tests Required
- API response times (< 200ms for profile operations)
- File upload performance (< 30 seconds for 5MB files)
- Database query optimization
- Rate limiting effectiveness

---

## 📝 IMPLEMENTATION CHECKLIST

### Phase 1: Core Profile APIs
- [ ] Implement user profile CRUD operations
- [ ] Add input validation and sanitization
- [ ] Create database schemas and migrations
- [ ] Implement avatar upload functionality
- [ ] Add comprehensive error handling

### Phase 2: Settings APIs
- [ ] Implement settings management endpoints
- [ ] Add theme customization support
- [ ] Create notification preferences system
- [ ] Implement calendar settings
- [ ] Add settings validation

### Phase 3: Integration APIs
- [ ] Implement OAuth 2.0 flows for major providers
- [ ] Create integration management system
- [ ] Add configuration and testing endpoints
- [ ] Implement secure token storage
- [ ] Add integration activity logging

### Phase 4: Advanced Features
- [ ] Implement user statistics calculations
- [ ] Add document management system
- [ ] Create audit logging for sensitive operations
- [ ] Implement backup and recovery procedures
- [ ] Add monitoring and alerting

### Phase 5: Testing & Security
- [ ] Write comprehensive test suites
- [ ] Implement security scanning
- [ ] Add performance monitoring
- [ ] Create API documentation
- [ ] Conduct security audit

---

## 📚 ADDITIONAL RESOURCES

### OAuth 2.0 Integration URLs
- **Zoom:** `https://zoom.us/oauth/authorize`
- **Google:** `https://accounts.google.com/oauth2/auth`
- **Microsoft:** `https://login.microsoftonline.com/common/oauth2/v2.0/authorize`

### Webhook Endpoints (for real-time updates)
- `POST /api/webhooks/zoom` - Zoom meeting events
- `POST /api/webhooks/google` - Google Calendar events
- `POST /api/webhooks/outlook` - Outlook Calendar events

### Environment Variables Required
```env
# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=scheduleme
DB_USER=admin
DB_PASSWORD=password

# JWT
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=24h

# File Storage
AWS_ACCESS_KEY_ID=your-key
AWS_SECRET_ACCESS_KEY=your-secret
AWS_S3_BUCKET=scheduleme-files
AWS_REGION=us-east-1

# Integration Credentials
ZOOM_CLIENT_ID=your-zoom-client-id
ZOOM_CLIENT_SECRET=your-zoom-client-secret
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
MICROSOFT_CLIENT_ID=your-microsoft-client-id
MICROSOFT_CLIENT_SECRET=your-microsoft-client-secret
VITELGLOBAL_API_KEY=your-vitelglobal-key

# Email Service
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
```

This comprehensive requirements document should provide you with everything needed to implement the backend APIs for the Profile and Settings sections. The frontend is already built and expects these exact API structures and responses.
