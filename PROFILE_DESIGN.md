# Profile Page Design Documentation

## 🎨 Profile Page Layout

### Header Section

```
┌─────────────────────────────────────────────────────────────────┐
│                          PROFILE PAGE                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─────────────────┐    ┌─────────────────────────────────────┐ │
│  │                 │    │                                     │ │
│  │   LEFT SIDEBAR  │    │           MAIN CONTENT              │ │
│  │                 │    │                                     │ │
│  └─────────────────┘    └─────────────────────────────────────┘ │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Left Sidebar (Profile Card)

```
┌─────────────────────────────────────┐
│           PROFILE CARD              │
├─────────────────────────────────────┤
│                                     │
│        ┌─────────────┐              │
│        │             │              │
│        │   AVATAR    │   📷         │
│        │   (120px)   │              │
│        └─────────────┘              │
│                                     │
│         John Doe                    │
│      john@example.com               │
│                                     │
│    "Bio text here..."               │
│                                     │
│    ┌─────────────────┐              │
│    │  Edit Profile   │              │
│    └─────────────────┘              │
│                                     │
│           STATS                     │
│    ┌─────────────────┐              │
│    │ 📅 12 Meetings  │              │
│    │ ⏰ 24 Hours     │              │
│    │ 👥 8 Attendees  │              │
│    └─────────────────┘              │
│                                     │
└─────────────────────────────────────┘
```

### Main Content Area

```
┌─────────────────────────────────────────────────────────────────┐
│                    PROFILE INFORMATION                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  First Name        │  Last Name                                 │
│  ┌─────────────┐   │  ┌─────────────┐                          │
│  │ John        │   │  │ Doe         │                          │
│  └─────────────┘   │  └─────────────┘                          │
│                                                                 │
│  Email Address                                                  │
│  ┌──────────────────────────────────┐                          │
│  │ john@example.com (readonly)      │                          │
│  └──────────────────────────────────┘                          │
│                                                                 │
│  Bio                                                            │
│  ┌──────────────────────────────────┐                          │
│  │ Tell us about yourself...        │                          │
│  │                                  │                          │
│  └──────────────────────────────────┘                          │
│                                                                 │
│  Phone            │  Timezone                                  │
│  ┌─────────────┐   │  ┌─────────────────────┐                  │
│  │ +1234567890 │   │  │ America/New_York    │                  │
│  └─────────────┘   │  └─────────────────────┘                  │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Integrations Section

```
┌─────────────────────────────────────────────────────────────────┐
│                 🔧 CONNECTED INTEGRATIONS                      │
├─────────────────────────────────────────────────────────────────┤
│  Connect your favorite tools to enhance your workflow.         │
│                                                                 │
│  ┌──────────────────┐    ┌──────────────────┐                  │
│  │     📹 ZOOM      │    │   👥 GOOGLE MEET │                  │
│  │                  │    │                  │                  │
│  │  Video meetings  │    │  Calendar sync   │                  │
│  │  with advanced   │    │  and meetings    │                  │
│  │  features        │    │                  │                  │
│  │                  │    │                  │                  │
│  │  ✅ Connected    │    │  ❌ Not Connected│                  │
│  │                  │    │                  │                  │
│  │ [Configure] [❌]  │    │    [Connect]     │                  │
│  └──────────────────┘    └──────────────────┘                  │
│                                                                 │
│  ┌──────────────────┐    ┌──────────────────┐                  │
│  │    📧 GMAIL      │    │  ⚡ VITELGLOBAL  │                  │
│  │                  │    │                  │                  │
│  │  Email templates │    │  Enterprise      │                  │
│  │  and automation  │    │  meetings        │                  │
│  │                  │    │                  │                  │
│  │  ❌ Not Connected│    │  ❌ Not Connected│                  │
│  │                  │    │                  │                  │
│  │    [Connect]     │    │    [Connect]     │                  │
│  └──────────────────┘    └──────────────────┘                  │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

## 🎯 Key Features

### Visual Design Elements

- **Modern Card Layout**: Clean, shadow-enhanced cards
- **Gradient Avatars**: Professional circular avatars with upload functionality
- **Status Badges**: Green "Connected" / Gray "Not Connected" indicators
- **Smooth Animations**: Framer Motion powered transitions
- **Responsive Grid**: 2-column layout on desktop, stacked on mobile

### Color Scheme

- **Primary**: `#667eea` (Gradient blue)
- **Success**: `#28a745` (Connected status)
- **Secondary**: `#6c757d` (Not connected)
- **Background**: `#ffffff` with subtle shadows
- **Text**: `#212529` primary, `#6c757d` muted

### Interactive Elements

- **Hover Effects**: Cards lift and glow on hover
- **Button States**: Loading spinners, disabled states
- **Form Validation**: Real-time validation with error messages
- **Modal Dialogs**: Configuration modals for each integration

## 📱 Responsive Behavior

- **Desktop**: 4-column sidebar + 8-column main content
- **Tablet**: Stacked layout with full-width cards
- **Mobile**: Single column with optimized spacing

## 🔧 Integration Cards Features

- **Connection Status**: Visual indicators and badges
- **Configuration**: Modal dialogs with service-specific settings
- **Error Handling**: User-friendly error messages
- **Loading States**: Spinners and disabled states during operations
