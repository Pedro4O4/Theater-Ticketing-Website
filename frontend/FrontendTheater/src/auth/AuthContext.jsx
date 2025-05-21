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
                const res = await axios.get("http://localhost:3000/api/v1/users/profile", {
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
            const response =  await axios.post("http://localhost:3000/api/v1/login", credentials, {
                withCredentials: true,
            });
            if (response.data) {
                setUser(response.data.user);

                return true;
            }
            throw new Error(response.message);
        } catch (err) {
            console.error(err);
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