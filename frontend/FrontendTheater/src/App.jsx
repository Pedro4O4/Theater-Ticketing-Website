// src/App.jsx
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./auth/AuthContext";
import LoginForm from "./components/LoginForm";
import RegisterForm from "./components/RegisterForm";
import Layout from "./components/Layout";
import HomePage from "./components/HomePage";
import ForgotPasswordForm from "./components/ForgotPasswordForm.jsx";
import ProtectedRoute from "./components/shared/protectedRoutes";
import './styles.css';
import "./App.css";

function App() {
    return (
        <AuthProvider>
            <div className="background-shapes">
                <div className="shape shape-1"></div>
                <div className="shape shape-2"></div>
                <div className="shape shape-3"></div>
            </div>
            <BrowserRouter>
                <Routes>
                    {/* Public routes */}
                    <Route path="/login" element={<LoginForm />} />
                    <Route path="/register" element={<RegisterForm />} />
                    <Route path="/forgot-password" element={<ForgotPasswordForm />} />

                    {/* Main layout with navbar/footer */}
                    <Route path="/" element={<Layout />}>
                        {/* Public routes within layout */}
                        <Route index element={<HomePage />} />

                        {/* Protected user routes */}
                        <Route element={<ProtectedRoute />}>
                            <Route path="profile" element={<h1>Profile Page</h1>} />
                            <Route path="bookings" element={<h1>My Bookings</h1>} />
                        </Route>

                        {/* Protected organizer routes */}
                        <Route element={<ProtectedRoute allowedRoles={['organizer', 'admin']} />}>
                            <Route path="my-events" element={<h1>My Events</h1>} />
                            <Route path="my-events/new" element={<h1>Create Event</h1>} />
                            <Route path="my-events/analytics" element={<h1>Event Analytics</h1>} />
                        </Route>

                        {/* Protected admin routes */}
                        <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
                            <Route path="admin/events" element={<h1>Admin: Manage Events</h1>} />
                            <Route path="admin/users" element={<h1>Admin: Manage Users</h1>} />
                        </Route>
                    </Route>

                    {/* Fallback route */}
                    <Route path="*" element={<Navigate to="/login" replace />} />
                </Routes>
            </BrowserRouter>
        </AuthProvider>
    );
}

export default App;