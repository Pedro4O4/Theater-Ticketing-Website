import { createContext, useContext, useEffect, useState } from "react";
import axios from "axios";

const AuthContext = createContext();
const TOKEN_KEY = "auth_token";

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState();
    const [token, setToken] = useState(localStorage.getItem(TOKEN_KEY));
    const [loading, setLoading] = useState(true);

    // Set up axios interceptor for authorization headers
    useEffect(() => {
        if (token) {
            axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
        } else {
            delete axios.defaults.headers.common["Authorization"];
        }
    }, [token]);

    // Fetch current user on app load
    useEffect(() => {
        const fetchUser = async () => {
            if (!token) {
                setUser(null);
                setLoading(false);
                return;
            }

            try {
                const res = await axios.get("http://localhost:5000/api/v1/users/profile");
                setUser(res.data);
            } catch(e) {
                console.log(e);
                setUser(null);
                // Clear token if it's invalid
                localStorage.removeItem(TOKEN_KEY);
                setToken(null);
            } finally {
                setLoading(false);
            }
        };
        fetchUser();
    }, [token]);

    // Login function
    const login = async (credentials) => {
        try {
            const response = await axios.post(
                "http://localhost:5000/api/v1/login",
                credentials
            );

            if (response.data && response.data.token) {
                // Save token to localStorage and state
                localStorage.setItem(TOKEN_KEY, response.data.token);
                setToken(response.data.token);
                setUser(response.data.user);
                return true;
            }
            throw new Error(response.data.message || "Login failed");
        } catch (err) {
            console.error(err);
            return false;
        }
    };

    // Logout function
    const logout = async () => {
        try {
            await axios.post("http://localhost:5000/api/v1/logout");
        } catch (err) {
            console.error(err);
        } finally {
            // Clear token regardless of API response
            localStorage.removeItem(TOKEN_KEY);
            setToken(null);
            setUser(null);
        }
    };

    if (loading) return <div>Loading...</div>;

    return (
        <AuthContext.Provider value={{ user, login, logout, loading, token }}>
            {children}
        </AuthContext.Provider>
    );
};

export function useAuth() {
    return useContext(AuthContext);
}