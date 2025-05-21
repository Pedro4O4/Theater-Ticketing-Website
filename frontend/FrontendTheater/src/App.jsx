import { Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./auth/AuthContext";
import LoginForm from "./components/LoginForm";
import RegisterForm from "./components/RegisterForm";
import Layout from "./components/Layout";
import HomePage from "./components/HomePage";
import './styles.css';
import "./App.css";
import ForgotPasswordForm from "./components/ForgotPasswordForm.jsx";
import AdminUsersPage from "./components/AdminComponent/AdminUsersPage.jsx";
import { ProtectedRoute } from "./auth/ProtectedRoute";

function App() {
    return (
        <AuthProvider>
            <Routes>
                <Route path="/login" element={<LoginForm />} />
                <Route path="/register" element={<RegisterForm />} />
                <Route path="/forgot-password" element={<ForgotPasswordForm />} />
                <Route path="/" element={<Layout />}>
                    <Route index element={<HomePage />} />
                    <Route path="users" element={
                        <ProtectedRoute requiredRole="Standard User">
                            <h1>Users Page</h1>
                        </ProtectedRoute>
                    } />
                    <Route path="admin/users" element={
                        <ProtectedRoute requiredRole="System Admin">
                            <AdminUsersPage />
                        </ProtectedRoute>
                    } />
                    <Route path="org" element={
                        <ProtectedRoute requiredRole="Organizer">
                            <h1>Organizer Page</h1>
                        </ProtectedRoute>
                    } />
                </Route>
                <Route path="*" element={<Navigate to="/login" replace />} />
            </Routes>
        </AuthProvider>
    );
}

export default App;