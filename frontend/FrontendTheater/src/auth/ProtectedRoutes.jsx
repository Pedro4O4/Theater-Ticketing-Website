// authorization
import { Navigate } from "react-router-dom";
import { useAuth } from "./AuthContext";

const ProtectedRoute = ({ allowedRoles, children }) => {
    const { user } = useAuth();
    if (!user ) {
        return <Navigate to="/login" replace />;
    }
    if (!allowedRoles.includes(user.role)) {
        return <Navigate to="/unauthorized" replace />;
    }

    return children;
};

export default ProtectedRoute;