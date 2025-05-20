// src/components/Layout.jsx
import { Link, Outlet } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";

export default function Layout() {
    const { user, logout } = useAuth();

    return (
        <div className="min-h-screen flex flex-col">
            <header className="bg-blue-600 text-white p-4 flex justify-between items-center">
                <h1 className="text-xl font-semibold">Event Portal</h1>
                <nav className="space-x-6">
                    <Link to="/" className="hover:underline">Home</Link>
                    <Link to="/events" className="hover:underline">Events</Link>
                    {user?.role === "Standard User" && <Link to="/users" className="hover:underline">Users</Link>}
                    {user?.role === "Organizer" && <Link to="/org" className="hover:underline">Organizer Dashboard</Link>}
                    {user?.role === "System Admin" && <Link to="/adm" className="hover:underline">Admin Panel</Link>}
                    <button onClick={logout} className="bg-red-500 px-3 py-1 rounded text-white hover:bg-red-600">Logout</button>
                </nav>
            </header>

            <main className="flex-1 p-6 bg-gray-50">
                <Outlet />
            </main>

            <footer className="bg-gray-800 text-white p-4 text-center">
                &copy; {new Date().getFullYear()} Event Management Portal
            </footer>
        </div>
    );
}