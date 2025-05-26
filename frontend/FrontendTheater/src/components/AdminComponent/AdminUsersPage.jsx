import React, { useEffect, useState } from 'react';
import axios from "axios";
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../auth/AuthContext';
import UserRow from './UserRow';
import './AdminUsersPage.css';
import UpdateUserRoleModal from './UpdateUserRoleModal';
import ConfirmationDialog from "./ConfirmationDialog.jsx";

const AdminUsersPage = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();
    const { user } = useAuth();

    // State for edit functionality
    const [editingUser, setEditingUser] = useState(null);
    const [isEditing, setIsEditing] = useState(false);

    // State for delete confirmation
    const [deleteUserId, setDeleteUserId] = useState(null);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

    useEffect(() => {
        if (!user) {
            console.log("No user found in auth context");
            navigate('/login');
            return;
        }

        if (user.role !== 'System Admin') {
            console.log("User is not an admin");
            navigate('/');
            return;
        }

        fetchUsers();
    }, [navigate, user]);

    const fetchUsers = async () => {
        try {
            console.log("Fetching users...");
            const response = await axios.get(`${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/v1/user`, {
                withCredentials: true
            });

            console.log("API Response:", response);

            if (response.data && Array.isArray(response.data)) {
                setUsers(response.data);
            } else if (response.data && response.data.users && Array.isArray(response.data.users)) {
                setUsers(response.data.users);
            } else if (response.data && response.data.data && Array.isArray(response.data.data)) {
                setUsers(response.data.data);
            } else {
                console.error("Unexpected API response format:", response.data);
                setError("Unexpected data format from API");
            }
        } catch (err) {
            console.error("Error fetching users:", err);
            if (err.response && (err.response.status === 401 || err.response.status === 403)) {
                navigate('/login');
            } else {
                const errorMessage = err.response?.data?.message || err.message;
                setError(errorMessage);
            }
        } finally {
            setLoading(false);
        }
    };

    // Define handleUpdateRole to update local state after role update
    const handleUpdateRole = (userId, updatedData) => {
        // Update local state with the new role
        setUsers(users.map(u => {
            const userIdField = u._id || u.userId;
            return userIdField === userId ? { ...u, ...updatedData } : u;
        }));
    };

    // Handle opening the edit modal
    const handleEditClick = (user) => {
        setEditingUser(user);
        setIsEditing(true);
    };

    // Handle deletion click - show confirmation dialog
    const handleDeleteClick = (userId) => {
        setDeleteUserId(userId);
        setShowDeleteConfirm(true);
    };

    // Handle confirmed deletion
    const confirmDelete = async () => {
        try {
            await axios.delete(`${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/user/${deleteUserId}`, {
                withCredentials: true
            });

            // Remove from local state
            setUsers(users.filter(u => (u._id || u.userId) !== deleteUserId));
            setShowDeleteConfirm(false);
        } catch (err) {
            console.error("Error deleting user:", err);
            alert(`Error deleting user: ${err.response?.data?.message || err.message}`);
        }
    };

    return (
        <div className="admin-container">
            <h1 className="admin-heading">All Users</h1>

            {loading && <p className="admin-message">Loading users...</p>}
            {error && <p className="admin-message admin-error">Error: {error}</p>}

            {!loading && !error && users.length > 0 && (
                <table className="admin-table">
                    <thead>
                    <tr>
                        <th>ID</th>
                        <th>Email</th>
                        <th>Full Name</th>
                        <th>Role</th>
                        <th>Actions</th>
                    </tr>
                    </thead>
                    <tbody>
                    {users.map((userData) => (
                        <UserRow
                            key={userData._id || userData.userId}
                            user={userData}
                            onEdit={handleEditClick}
                            onDelete={handleDeleteClick}
                        />
                    ))}
                    </tbody>
                </table>
            )}

            {!loading && !error && users.length === 0 && (
                <p className="admin-message">No users found in the system.</p>
            )}

            {/* Using the UpdateUserRoleModal component */}
            <UpdateUserRoleModal
                isOpen={isEditing}
                user={editingUser}
                onClose={() => setIsEditing(false)}
                onUpdate={handleUpdateRole}
            />

            {/* Delete Confirmation Modal */}
            <ConfirmationDialog
                isOpen={showDeleteConfirm}
                title="Confirm Delete"
                message="Are you sure you want to delete this user? This action cannot be undone."
                confirmText="Yes, Delete"
                cancelText="Cancel"
                onConfirm={confirmDelete}
                onCancel={() => setShowDeleteConfirm(false)}
            />
        </div>
    );
};

export default AdminUsersPage;