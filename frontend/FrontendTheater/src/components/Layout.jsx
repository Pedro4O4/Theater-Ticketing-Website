// src/components/Layout.jsx
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import Navbar from "./shared/Navbar";
import Footer from "./shared/Footer";
import Loader from "./shared/Loader";
import { useState, useEffect } from "react";

export default function Layout() {
    const { currentUser } = useAuth();
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Simulate loading state for demonstration
        const timer = setTimeout(() => {
            setLoading(false);
        }, 500);

        return () => clearTimeout(timer);
    }, []);

    // Redirect to AdminPage if user is an admin
    // In Layout.jsx
// Redirect to admin users page if user is an admin
    if (currentUser?.role === "System Admin") {
        return <Navigate to="/admin/users" replace />;
    }

    if (loading) {
        return <Loader message="Loading page..." />;
    }

    return (
        <div className="min-h-screen flex flex-col">
            <Navbar />

            <main className="flex-1 p-6 bg-gray-50">
                <Outlet />
            </main>

            <Footer />
        </div>
    );
}