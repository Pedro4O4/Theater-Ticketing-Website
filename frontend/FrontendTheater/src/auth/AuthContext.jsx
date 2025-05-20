// src/auth/AuthContext.js
import { createContext, useState, useEffect, useContext } from "react";

const AuthContext = createContext(null);
// Update this to match your backend - from your .env file I can see it's on port 5000
const API_URL = "http://localhost:5000/api/v1";

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Check if user is logged in from local storage
    useEffect(() => {
        const storedUser = localStorage.getItem("user");
        if (storedUser) {
            try {
                setUser(JSON.parse(storedUser));
                // eslint-disable-next-line no-unused-vars
            } catch (e) {
                localStorage.removeItem("user");
            }
        }
        setLoading(false);
    }, []);

    const register = async (userData) => {
        setLoading(true);
        setError(null);

        try {
            console.log("Registering user:", userData);
            const response = await fetch(`${API_URL}/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(userData),
                credentials: 'include'
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || `Registration failed (${response.status})`);
            }

            const data = await response.json();
            return { success: true, data };
        } catch (err) {
            console.error("Registration error:", err);
            setError(err.message);
            return { success: false, error: err.message };
        } finally {
            setLoading(false);
        }
    };

    const login = async (credentials) => {
        setLoading(true);
        setError(null);

        try {
            const response = await fetch(`${API_URL}/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(credentials),
                credentials: 'include'
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || `Login failed (${response.status})`);
            }

            const data = await response.json();
            const userData = data.user || data;

            setUser(userData);
            localStorage.setItem("user", JSON.stringify(userData));
            if (data.token) localStorage.setItem("token", data.token);

            return { success: true, user: userData };
        } catch (err) {
            console.error("Login error:", err);
            setError(err.message);
            return { success: false, error: err.message };
        } finally {
            setLoading(false);
        }
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem("user");
        localStorage.removeItem("token");
    };

    // Helper properties for components
    const isAuthenticated = !!user;
    const isAdmin = user?.role === "admin";
    const isOrganizer = user?.role === "organizer";

    const value = {
        user,
        loading,
        error,
        login,
        register,
        logout,
        isAuthenticated,
        isAdmin,
        isOrganizer
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);