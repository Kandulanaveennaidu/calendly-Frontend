# Settings Page Design Documentation

## 🎨 Settings Page Layout

### Main Container

```
┌─────────────────────────────────────────────────────────────────┐
│                         SETTINGS PAGE                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  📋 Account  📅 Calendar  🔔 Notifications  🎨 Appearance  🔧 Integrations
│  ────────────────────────────────────────────────────────────── │
│                                                                 │
│                     ACTIVE TAB CONTENT                         │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Tab Navigation

```
┌─────────────────────────────────────────────────────────────────┐
│  ┌─────────┐ ┌─────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐
│  │Account  │ │Calendar │ │Notifications│ │ Appearance  │ │Integrations │
│  │   📋    │ │   📅    │ │     🔔      │ │     🎨      │ │     🔧      │
│  └─────────┘ └─────────┘ └─────────────┘ └─────────────┘ └─────────────┘
└─────────────────────────────────────────────────────────────────┘
```

### Account Tab

```
┌─────────────────────────────────────────────────────────────────┐
│                         ACCOUNT SETTINGS                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Profile Information                                            │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │ Name: John Doe                                              │ │
│  │ Email: john@example.com                                     │ │
│  │ Phone: +1 (555) 123-4567                                   │ │
│  │ Timezone: America/New_York                                  │ │
│  │                                                             │ │
│  │ ┌─────────────────┐                                        │ │
│  │ │  Save Changes   │                                        │ │
│  │ └─────────────────┘                                        │ │
│  └─────────────────────────────────────────────────────────────┘ │
│                                                                 │
│  Security Settings                                              │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │ ☐ Enable two-factor authentication                         │ │
│  │ ☐ Email login notifications                                │ │
│  │ ☐ Require password confirmation for sensitive actions      │ │
│  └─────────────────────────────────────────────────────────────┘ │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Integrations Tab (Enhanced)

```
┌─────────────────────────────────────────────────────────────────┐
│                    🔧 ADVANCED INTEGRATIONS                    │
├─────────────────────────────────────────────────────────────────┤
│  Connect your favorite tools to enhance your scheduling        │
│  workflow with advanced features.                              │
│                                                                 │
│  ┌──────────────────────┐    ┌──────────────────────┐          │
│  │       📹 ZOOM        │    │    👥 GOOGLE MEET    │          │
│  │  Zoom Video Comms    │    │       Google         │          │
│  │                      │    │                      │          │
│  │  Create and manage   │    │  Integrate with      │          │
│  │  Zoom meetings       │    │  Google Meet for     │          │
│  │  directly from your  │    │  seamless video      │          │
│  │  scheduling platform │    │  conferencing        │          │
│  │                      │    │                      │          │
│  │  ✅ Connected        │    │  ❌ Not Connected    │          │
│  │  user@company.com    │    │                      │          │
│  │                      │    │                      │          │
│  │ ┌─────────┐ ┌─────┐  │    │  ┌─────────────────┐ │          │
│  │ │Configure│ │  ❌  │  │    │  │     Connect     │ │          │
│  │ └─────────┘ └─────┘  │    │  └─────────────────┘ │          │
│  └──────────────────────┘    └──────────────────────┘          │
│                                                                 │
│  ┌──────────────────────┐    ┌──────────────────────┐          │
│  │       📧 GMAIL       │    │   ⚡ VITELGLOBAL     │          │
│  │       Google         │    │    VitelGlobal       │          │
│  │                      │    │                      │          │
│  │  Send automated      │    │  Enterprise-grade    │          │
│  │  emails for booking  │    │  video conferencing  │          │
│  │  confirmations and   │    │  with advanced       │          │
│  │  reminders           │    │  security features   │          │
│  │                      │    │                      │          │
│  │  ❌ Not Connected    │    │  ❌ Not Connected    │          │
│  │                      │    │                      │          │
│  │                      │    │                      │          │
│  │  ┌─────────────────┐ │    │  ┌─────────────────┐ │          │
│  │  │     Connect     │ │    │  │     Connect     │ │          │
│  │  └─────────────────┘ │    │  └─────────────────┘ │          │
│  └──────────────────────┘    └──────────────────────┘          │
│                                                                 │
│  ──────────────────────────────────────────────────────────────  │
│                                                                 │
│                      Legacy Integrations                       │
│  Basic integrations with simplified configuration.             │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │ 📅 Microsoft Outlook                                       │ │
│  │ Connected: user@company.com                ✅ Connected     │ │
│  │ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐           │ │
│  │ │  Sync Now   │ │ Disconnect  │ │  Settings   │           │ │
│  │ └─────────────┘ └─────────────┘ └─────────────┘           │ │
│  └─────────────────────────────────────────────────────────────┘ │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Appearance Tab

```
┌─────────────────────────────────────────────────────────────────┐
│                      🎨 APPEARANCE SETTINGS                    │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Theme Customization                                            │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │                                                             │ │
│  │ Color Palette                                               │ │
│  │ ┌─────────────────────────────────────────────────────────┐ │ │
│  │ │ Primary:   ████ #667eea                                 │ │ │
│  │ │ Secondary: ████ #6c757d                                 │ │ │
│  │ │ Accent:    ████ #28a745                                 │ │ │
│  │ └─────────────────────────────────────────────────────────┘ │ │
│  │                                                             │ │
│  │ Predefined Themes                                           │ │
│  │ ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐           │ │
│  │ │ Default │ │ Ocean   │ │ Sunset  │ │ Forest  │           │ │
│  │ │ 🔵🔴🟢  │ │ 🔵🔵🟢  │ │ 🟠🟡🔴  │ │ 🟢🟤🟫  │           │ │
│  │ └─────────┘ └─────────┘ └─────────┘ └─────────┘           │ │
│  │                                                             │ │
│  │ Dark Mode                                                   │ │
│  │ ┌─────────────────────────────────────────────────────────┐ │ │
│  │ │ ☐ Enable dark mode                     🌙 / ☀️        │ │ │
│  │ └─────────────────────────────────────────────────────────┘ │ │
│  │                                                             │ │
│  └─────────────────────────────────────────────────────────────┘ │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

## 🎯 Key Design Features

### Integration Cards (Enhanced)

- **Two-tier System**: Advanced integrations + Legacy integrations
- **Rich Information**: Provider names, descriptions, features
- **Visual Status**: Color-coded badges and icons
- **Action Buttons**: Connect, Configure, Disconnect
- **Hover Effects**: Smooth card lifting and glow effects

### Configuration Modals

```
┌─────────────────────────────────────────────────────────────────┐
│                     Configure Zoom                             │
├─────────────────────────────────────────────────────────────────┤
│  ⚠️ Configure your Zoom integration settings below.            │
│                                                                 │
│  API Key                                                        │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │ ••••••••••••••••••••••••••••••••••••••••••••••••••••••••••• │ │
│  └─────────────────────────────────────────────────────────────┘ │
│                                                                 │
│  API Secret                                                     │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │ ••••••••••••••••••••••••••••••••••••••••••••••••••••••••••• │ │
│  └─────────────────────────────────────────────────────────────┘ │
│                                                                 │
│  ☐ Auto-generate meeting links                                 │
│                                                                 │
│  ┌─────────────┐ ┌─────────────────────────────────────────────┐ │
│  │   Cancel    │ │ ✅ Save Configuration                       │ │
│  └─────────────┘ └─────────────────────────────────────────────┘ │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Visual Hierarchy

1. **Page Title**: Large, bold typography
2. **Tab Navigation**: Horizontal tabs with icons
3. **Section Headers**: Medium weight, proper spacing
4. **Card Layout**: Clean, shadowed containers
5. **Action Buttons**: Prominent, color-coded actions

### Animation & Interactions

- **Page Transitions**: Smooth fade-in animations
- **Card Hover**: Subtle lift and shadow increase
- **Button States**: Loading spinners, disabled states
- **Form Validation**: Real-time feedback
- **Modal Animations**: Smooth slide-in/fade-in effects

### Responsive Design

- **Desktop**: Full-width tabs, 2-column integration cards
- **Tablet**: Stacked cards, maintained spacing
- **Mobile**: Single column, touch-friendly buttons

## 🎨 Color Scheme & Styling

### Primary Colors

- **Brand Blue**: `#667eea` (Primary actions, borders)
- **Success Green**: `#28a745` (Connected status)
- **Warning Orange**: `#ffc107` (Pending states)
- **Danger Red**: `#dc3545` (Disconnect, errors)

### Background & Surfaces

- **Main Background**: `#f8f9fa`
- **Card Background**: `#ffffff`
- **Border Color**: `rgba(0,0,0,0.125)`
- **Shadow**: `0 4px 12px rgba(0,0,0,0.1)`

### Typography

- **Headers**: Inter, 600 weight
- **Body**: Inter, 400 weight
- **Small Text**: Inter, 400 weight, 0.875rem

### Interactive States

- **Hover**: Slight elevation, color intensification
- **Focus**: Blue outline, enhanced shadows
- **Active**: Pressed state with slight scale
- **Disabled**: Reduced opacity, no interactions
