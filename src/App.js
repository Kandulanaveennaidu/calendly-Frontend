import React, { useContext, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';
import './styles/theme.css';
import { AuthProvider, AuthContext } from './context/AuthContext';

// Components
import Navbar from './components/Layout/Navbar';

// Pages
import Dashboard from './pages/Dashboard';
import Calendar from './pages/Calendar';
import Meetings from './pages/Meetings';
import Login from './pages/Login';
import SignUp from './pages/SignUp';
import EditMeetingType from './pages/EditMeetingType';
import LandingPage from './pages/LandingPage';
import PublicScheduling from './pages/PublicScheduling';

// Custom Protected Route Component
const ProtectedRoute = ({ children }) => {
    const { isAuthenticated } = useContext(AuthContext);
    const location = useLocation();

    if (!isAuthenticated()) {
        return <Navigate to="/login" state={{ from: location.pathname }} replace />;
    }

    return children;
};

// Public Routes Component
const PublicRoute = ({ children }) => {
    const { isAuthenticated } = useContext(AuthContext);
    const location = useLocation();

    if (isAuthenticated()) {
        const intendedPath = location.state?.from || '/dashboard';
        return <Navigate to={intendedPath} replace />;
    }

    return children;
};

// App Component with Routing
const AppRoutes = () => {
    const { isAuthenticated } = useContext(AuthContext);
    const location = useLocation();

    // Hide navbar only on public scheduling page
    const hideNavbar = location.pathname.startsWith('/schedule/');

    return (
        <>
            {/* Show navbar everywhere except public scheduling page */}
            {!hideNavbar && <Navbar />}

            <Routes>
                {/* Public Routes */}
                <Route path="/" element={<LandingPage />} />
                <Route path="/landing" element={<LandingPage />} />
                <Route path="/login" element={
                    <PublicRoute>
                        <Login />
                    </PublicRoute>
                } />
                <Route path="/signup" element={
                    <PublicRoute>
                        <SignUp />
                    </PublicRoute>
                } />

                {/* Public scheduling page - NO NAVBAR here */}
                <Route path="/schedule/:meetingId" element={<PublicScheduling />} />

                {/* Protected Routes - navbar shows here */}
                <Route path="/dashboard" element={
                    <ProtectedRoute>
                        <Dashboard />
                    </ProtectedRoute>
                } />
                <Route path="/meetings" element={
                    <ProtectedRoute>
                        <Meetings />
                    </ProtectedRoute>
                } />
                <Route path="/calendar" element={
                    <ProtectedRoute>
                        <Calendar />
                    </ProtectedRoute>
                } />
                <Route path="/meeting-types/edit/:id" element={
                    <ProtectedRoute>
                        <EditMeetingType />
                    </ProtectedRoute>
                } />

                {/* Catch all other routes and redirect appropriately */}
                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
        </>
    );
};

function App() {
    useEffect(() => {
        // Load theme settings from localStorage
        const savedTheme = localStorage.getItem('themeSettings');
        if (savedTheme) {
            const theme = JSON.parse(savedTheme);

            // Apply theme colors
            document.documentElement.style.setProperty('--primary-color', theme.primaryColor);
            document.documentElement.style.setProperty('--secondary-color', theme.secondaryColor);
            document.documentElement.style.setProperty('--accent-color', theme.accentColor);

            // Apply derived colors
            document.documentElement.style.setProperty(
                '--primary-hover',
                '#' + theme.primaryColor.replace(/^#/, '').replace(/../g, color =>
                    ('0' + Math.min(255, Math.max(0, parseInt(color, 16) - 20)).toString(16)).substr(-2)
                )
            );

            // Apply dark mode if enabled
            if (theme.darkMode) {
                document.documentElement.setAttribute('data-theme', 'dark');
                document.body.classList.add('dark-mode');
            }
        }
    }, []);

    return (
        <AuthProvider>
            <Router>
                <div className="App">
                    <AnimatePresence mode="wait">
                        <AppRoutes />
                    </AnimatePresence>
                </div>
            </Router>
        </AuthProvider>
    );
}

export default App;
