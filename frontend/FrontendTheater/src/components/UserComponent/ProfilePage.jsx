import React, { useState, useEffect } from 'react';
import { useAuth } from '../../auth/AuthContext';
import { useNavigate } from 'react-router-dom';
import './ProfilePage.css';

const ProfilePage = () => {
    const { currentUser, isAdmin, isOrganizer, updateUserProfile } = useAuth();
    const [profileImage, setProfileImage] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const navigate = useNavigate();

    // Form state for profile editing
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        bio: '',
        password: '',
        confirmPassword: ''
    });
    const [error, setError] = useState('');

    // Initialize form data when currentUser changes
    useEffect(() => {
        if (currentUser) {
            setFormData({
                name: currentUser.name || '',
                email: currentUser.email || '',
                phone: currentUser.phone || '',
                bio: currentUser.bio || '',
                password: '',
                confirmPassword: ''
            });
        }

        // Simulate loading user data
        const timer = setTimeout(() => {
            setIsLoading(false);
        }, 1000);

        // Debug output to see what data is available
        console.log("Current user data:", currentUser);

        return () => clearTimeout(timer);
    }, [currentUser]);

    const handleImageUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setProfileImage(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleImageDownload = () => {
        if (profileImage) {
            const link = document.createElement('a');
            link.href = profileImage;
            link.download = `${currentUser.name}_profile.png`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        // Validate passwords match if they're being updated
        if (formData.password && formData.password !== formData.confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        try {
            setIsLoading(true);
            // Call your update profile function from auth context
            await updateUserProfile(formData);
            setIsEditing(false);
        } catch (err) {
            setError('Failed to update profile: ' + (err.message || 'Unknown error'));
        } finally {
            setIsLoading(false);
        }
    };

    if (isLoading) {
        return <div className="profile-loading">Loading your profile...</div>;
    }

    // Profile edit form view
    if (isEditing) {
        return (
            <div className="update-profile-container">
                <h2>Update Your Profile</h2>

                {error && <div className="error-message">{error}</div>}

                <form onSubmit={handleSubmit} className="update-profile-form">
                    <div className="form-group">
                        <label>Name</label>
                        <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label>Email</label>
                        <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label>Phone Number</label>
                        <input
                            type="tel"
                            name="phone"
                            value={formData.phone}
                            onChange={handleChange}
                        />
                    </div>

                    <div className="form-group">
                        <label>Bio</label>
                        <textarea
                            name="bio"
                            value={formData.bio}
                            onChange={handleChange}
                            rows="4"
                        />
                    </div>

                    <div className="password-section">
                        <h3>Change Password</h3>
                        <p className="password-note">Leave blank to keep current password</p>

                        <div className="form-group">
                            <label>New Password</label>
                            <input
                                type="password"
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                            />
                        </div>

                        <div className="form-group">
                            <label>Confirm Password</label>
                            <input
                                type="password"
                                name="confirmPassword"
                                value={formData.confirmPassword}
                                onChange={handleChange}
                            />
                        </div>
                    </div>

                    <div className="form-buttons">
                        <button
                            type="button"
                            className="cancel-btn"
                            onClick={() => setIsEditing(false)}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="save-btn"
                            disabled={isLoading}
                        >
                            {isLoading ? 'Saving...' : 'Save Changes'}
                        </button>
                    </div>
                </form>
            </div>
        );
    }

    // Profile view
    return (
        <div className="profile-container">
            <div className="profile-header">
                {profileImage ? (
                    <img
                        src={profileImage}
                        alt="Profile"
                        className="profile-avatar"
                        style={{ objectFit: 'cover' }}
                    />
                ) : (
                    <div className="profile-avatar">
                        {currentUser?.name?.charAt(0)?.toUpperCase() || '?'}
                    </div>
                )}
                <h2>{currentUser?.name || "User"}</h2>
                <div className="profile-role">
                    {isAdmin ? 'Administrator' : isOrganizer ? 'Event Organizer' : 'Standard User'}
                </div>

                <div style={{ marginTop: '15px', display: 'flex', gap: '10px' }}>
                    <label className="custom-file-upload">
                        <input type="file" onChange={handleImageUpload} accept="image/*" />
                        Upload Photo
                    </label>
                    {profileImage && (
                        <button
                            className="download-btn"
                            onClick={handleImageDownload}
                        >
                            Download Photo
                        </button>
                    )}
                </div>
            </div>

            <div className="profile-details">
                <div className="profile-field email-field">
                    <label>Email:</label>
                    <span>{currentUser?.email || "No email available"}</span>
                </div>
                <div className="profile-field">
                    <label>Phone:</label>
                    <span>{currentUser?.phone || "No phone number available"}</span>
                </div>
                <div className="profile-field">
                    <label>Bio:</label>
                    <span>{currentUser?.bio || "No bio available"}</span>
                </div>
                <div className="profile-field">
                    <label>Member Since:</label>
                    <span>{currentUser?.createdAt ? new Date(currentUser.createdAt).toLocaleDateString() : "Unknown"}</span>
                </div>
            </div>

            {isAdmin && (
                <div className="admin-section">
                    <h3>Administration Quick Access</h3>
                    <div className="quick-links">
                        <a href="/admin/events">Manage Events</a>
                        <a href="/admin/users">Manage Users</a>
                        <a href="/admin/reports">View Reports</a>
                        <a href="/admin/settings">System Settings</a>
                    </div>
                </div>
            )}

            {isOrganizer && (
                <div className="organizer-section">
                    <h3>Organizer Tools</h3>
                    <div className="quick-links">
                        <a href="/my-events">My Events</a>
                        <a href="/events/create">Create Event</a>
                        <a href="/my-events/analytics">Analytics</a>
                        <a href="/my-events/tickets">Manage Tickets</a>
                    </div>
                </div>
            )}

            <div className="user-section">
                <h3>Account Management</h3>
                <div className="quick-links">
                    <a href="/bookings">My Bookings</a>
                </div>
                <button
                    className="edit-profile-btn"
                    onClick={() => setIsEditing(true)}
                    style={{ marginTop: '1rem' }}
                >
                    Edit Profile
                </button>
            </div>
        </div>
    );
};

export default ProfilePage;