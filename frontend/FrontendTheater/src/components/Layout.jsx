import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import './Layout.css'
export default function Layout() {
    const { user } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();

    // Determine if we're in an admin or organizer section
    const isAdminSection = location.pathname.startsWith('/admin');
    const isOrganizerSection = location.pathname.startsWith('/events') &&
        user.role === "Organizer";
    const isStandardUserViewingEvents = location.pathname.startsWith('/events') &&
        user.role !== "Organizer";

    const goToProfile = () => {
        navigate('/profile');
    };

    return (
        <div className="layout-container">
            <header className="layout-header">
                <div className="header-content">
                    <h1 className="portal-title-large">Event Portal</h1>

                    {user && (isStandardUserViewingEvents || isAdminSection || isOrganizerSection) && (
                        <div
                            className="user-greeting-expanded"
                            onClick={goToProfile}
                            style={{ cursor: 'pointer' }}
                            title="Go to profile"
                        >
                            <div className="user-avatar">
                                {user.profilePicture ? (
                                    <img src={user.profilePicture} alt={user.name} />
                                ) : (
                                    <div className="avatar-placeholder">
                                        {user.name.charAt(0).toUpperCase()}
                                    </div>
                                )}
                            </div>
                            <div className="user-data">
                                <div className="user-name">Hi {user.name}</div>
                                <div className="user-details">
                                    <div className="user-info-row">
                                        <span className="user-email">{user.email}</span>
                                        <span className="user-role">{user.role || "Member"}</span>
                                        {isAdminSection && <span className="dashboard-label">Admin Dashboard</span>}
                                        {isOrganizerSection && <span className="dashboard-label">Organizer Dashboard</span>}
                                        {isStandardUserViewingEvents && <span className="dashboard-label">Event Explorer</span>}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                <nav className="main-navigation">
                    {/* Navigation links here */}
                </nav>
            </header>

            <main className="main-content">
                <Outlet />
            </main>

            <footer className="layout-footer">
                &copy; {new Date().getFullYear()} Event Management Portal
            </footer>
        </div>
    );
}