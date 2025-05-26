import { createContext, useContext, useEffect, useState } from "react";
import axios from "axios";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState();
    const [authenticated, setAuthenticated] = useState(false);
    const [loading, setLoading] = useState(true);

    // Fetch current user on app load
    useEffect(() => {
        const fetchUser = async () => {
            try {
                const res = await axios.get(`${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/user/profile`, {
                    withCredentials: true,
                });
                setUser(res.data);
                setAuthenticated(true);
            } catch(e) {
                console.log(e)
                setUser(null);
                setAuthenticated(false);
            } finally {
                setLoading(false);
            }
        };

        // Check if user was previously authenticated
        const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';
        if (isAuthenticated) {
            fetchUser();
        } else {
            setLoading(false);
        }
    }, []);

    // Login function
    const login = async (credentials) => {
        try {
            console.log("before post login");
            const response = await axios.post(`${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/login`, credentials, {
                withCredentials: true, // This is crucial for cookies to be sent/received
            });
            console.log("after post login");

            if (response.data && response.data.user) {
                // Store user data in context
                setUser(response.data.user);
                setAuthenticated(true);
                console.log(response.data);

                // Since token is stored in HTTP-only cookie, we don't need to store it in localStorage
                // Instead, mark that the user is authenticated in localStorage
                localStorage.setItem('isAuthenticated', 'true');

                return {
                    success: true,
                    user: response.data.user
                };
            }

            return {
                success: false,
                error: "Login failed"
            };
        } catch (err) {
            console.error(err);
            return {
                success: false,
                error: err.response?.data?.message || "Login failed"
            };
        }
    };

    // Logout function
    const logout = async () => {
        try {
            await axios.post(`${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/logout`, {}, {
                withCredentials: true
            });

            // Clear user from context
            setUser(null);
            setAuthenticated(false);
            localStorage.removeItem('isAuthenticated');

            return { success: true };
        } catch (error) {
            console.error("Logout error:", error);
            return {
                success: false,
                error: error.response?.data?.message || "Error logging out"
            };
        }
    };

    if (loading) return <div>Loading...</div>;

    return (
        <AuthContext.Provider value={{ user, authenticated, login, logout, loading }}>
            {children}
        </AuthContext.Provider>
    );
};

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
    return useContext(AuthContext);
}