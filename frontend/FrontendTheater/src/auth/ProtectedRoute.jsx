import { Navigate } from "react-router-dom";
import { useAuth } from "./AuthContext.jsx";

export const ProtectedRoute = ({ children, requiredRole }) => {
    const { user } = useAuth();

    // If no user is logged in, redirect to login
    if (!user) {
        return <Navigate to="/login" replace />;
    }

    // If a specific role is required and user doesn't have it
    if (requiredRole && user.role !== requiredRole) {
        return <Navigate to="/" replace />;
    }

    return children;
};