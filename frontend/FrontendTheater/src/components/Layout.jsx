// src/components/Layout.jsx
import { Link, Outlet } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import Navbar from "./shared/Navbar";
import Footer from "./shared/Footer";
import Loader from "./shared/Loader";
import { useState, useEffect } from "react";

export default function Layout() {
    const { currentUser, logout } = useAuth();
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Simulate loading state for demonstration
        const timer = setTimeout(() => {
            setLoading(false);
        }, 500);

        return () => clearTimeout(timer);
    }, []);

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

