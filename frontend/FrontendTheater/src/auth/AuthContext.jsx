import { createContext, useContext, useEffect, useState } from "react";
import axios from "axios";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState();
    const [loading, setLoading] = useState(true);
    // Fetch current user on app load
    useEffect(() => {
        const fetchUser = async () => {
            try {
                const res = await axios.get("http://localhost:3000/api/v1/user/profile", {
                    withCredentials: true,
                });
                setUser(res.data);
            } catch(e) {
                console.log(e)
                setUser(null);
            } finally {
                setLoading(false);
            }
        };
        fetchUser();
    }, []);

    // Login function
    const login = async (credentials) => {
        try {
            console.log("before post login");
            const response = await axios.post("http://localhost:3000/api/v1/login", credentials, {
                withCredentials: true, // This is crucial for cookies to be sent/received
            });
            console.log("after post login");

            if (response.data && response.data.user) {
                // Store user data in context
                setUser(response.data.user);
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
    // Logout function in case we have logout endpoint
    const logout = async () => {
        await axios.post(
            "http://localhost:3000/api/v1/logout",
            {},
            {
                withCredentials: true,
            }
        );
        setUser(null);
        ;
    };

    if (loading) return <div>Loading...</div>;

    return (
        <AuthContext.Provider value={{ user, login, logout ,loading}}>
            {children}
        </AuthContext.Provider>
    );
};

export function useAuth() {
    return useContext(AuthContext);
}