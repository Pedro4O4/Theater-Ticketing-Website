import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';

export default function AdminUsersPage() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // In your useEffect
    useEffect(() => {
        const fetchUsers = async () => {
            try {
                // This should match your backend route exactly
                const response = await api.get('/user');
                setUsers(response.data);
            } catch (err) {
                setError(`Failed to fetch users: ${err.response?.data?.message || err.message}`);
            } finally {
                setLoading(false);
            }
        };

        fetchUsers();
    }, []);

    async function handleDelete(id) {
        try {
            const response = await api.delete(`/user/${id}`);
            alert(response.data);
            // Refresh the user list after deletion
            setUsers(users.filter(user => user._id !== id));
        } catch (error) {
            alert(`Error deleting user: ${error.message}`);
        }
    }

    if (loading) return <div className="text-center p-10">Loading users...</div>;

    if (error) return (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative m-4" role="alert">
            <strong className="font-bold">Error:</strong>
            <span className="block sm:inline"> {error}</span>
        </div>
    );

    return (
        <div className="p-4">
            <h1 className="text-2xl font-bold mb-6">All Users</h1>

            {users.length === 0 ? (
                <div className="text-center p-4">No users found</div>
            ) : (
                <ul className="bg-white shadow-md rounded-lg p-4">
                    {users.map(user => (
                        <li key={user._id || user.userId} className="flex justify-between items-center mb-4 pb-2 border-b last:border-b-0">
                            <div>
                                <span className="font-semibold">{user.name || 'N/A'}</span> -
                                <span className="text-gray-600 mx-2">{user.email}</span> -
                                <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs">{user.role}</span>
                                <Link to={`/admin/users/${user._id || user.userId}`} className="text-blue-500 ml-4 underline">
                                    View
                                </Link>
                            </div>
                            <button
                                onClick={() => handleDelete(user._id || user.userId)}
                                className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm"
                            >
                                Delete
                            </button>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}