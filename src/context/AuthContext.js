import React, { createContext, useState, useEffect, useMemo } from 'react';

// Create Authentication Context
export const AuthContext = createContext();

// Authentication Provider Component
export const AuthProvider = ({ children }) => {
    const [currentUser, setCurrentUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [initialized, setInitialized] = useState(false);

    // Check if user is already logged in (from localStorage) on component mount
    useEffect(() => {
        const checkAuth = () => {
            try {
                const token = localStorage.getItem('token') || localStorage.getItem('authToken');
                const storedUser = localStorage.getItem('currentUser') || localStorage.getItem('user');

                if (token && storedUser) {
                    const userData = JSON.parse(storedUser);
                    setCurrentUser(userData);
                    console.log('User restored from localStorage:', userData.email);
                }
            } catch (error) {
                console.error('Authentication error:', error);
                // Clear invalid data
                localStorage.removeItem('token');
                localStorage.removeItem('authToken');
                localStorage.removeItem('currentUser');
                localStorage.removeItem('user');
            } finally {
                setLoading(false);
                setInitialized(true);
            }
        };

        checkAuth();
    }, []);

    // Login function
    const login = (userData) => {
        console.log('Logging in user:', userData.email);
        setCurrentUser(userData);
        localStorage.setItem('currentUser', JSON.stringify(userData));
        // Also set token if available
        if (userData.token) {
            localStorage.setItem('token', userData.token);
        }
    };

    // Explicit logout function that only triggers when called directly
    const logout = () => {
        console.log('Explicit logout called');
        try {
            // Clear all authentication data
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            localStorage.removeItem('authToken');
            localStorage.removeItem('currentUser');
            localStorage.removeItem('authData');

            // Clear user state
            setCurrentUser(null);

            console.log('User logged out successfully');
        } catch (error) {
            console.error('Error during logout:', error);
        }
    };

    // Check if user is authenticated
    const isAuthenticated = () => {
        if (!initialized) return false;

        const hasToken = !!(localStorage.getItem('token') || localStorage.getItem('authToken'));
        const hasUser = !!currentUser;

        return hasUser && hasToken;
    };

    // Context value
    const value = useMemo(() => ({
        currentUser,
        loading,
        login,
        logout,
        isAuthenticated
    }), [currentUser, loading, initialized]);

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
};
