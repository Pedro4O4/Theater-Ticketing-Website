// frontend/FrontendTheater/src/components/Booking Components/UserBookingsPage.jsx
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../auth/AuthContext';
import ConfirmationDialog from '../AdminComponent/ConfirmationDialog';
import './BookingStyles.css';

const UserBookingsPage = () => {
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [deleteBookingId, setDeleteBookingId] = useState(null);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const { user } = useAuth();

    useEffect(() => {
        fetchBookings();
    }, []);

    const fetchBookings = async () => {
        try {
            setLoading(true);
            const response = await axios.get('http://localhost:3000/api/v1/booking/user', {
                withCredentials: true
            });
//////////////////////////////////////////////////////////////////////////////////
            if (response.data && Array.isArray(response.data)) {
                setBookings(response.data);
            } else if (response.data && response.data.userId && Array.isArray(response.data.userId)) {
                setBookings(response.data.userId);
            } else if (response.data && response.data.data && Array.isArray(response.data.data)) {
                setBookings(response.data.data);
            } else {
                setError("Unexpected data format from API");
            }
        } catch (err) {
            console.error("Error fetching bookings:", err);
            setError(err.response?.data?.message || "Failed to load bookings");
        } finally {
            setLoading(false);
        }
    };

    const handleCancelClick = (bookingId) => {
        setDeleteBookingId(bookingId);
        setShowDeleteConfirm(true);
    };

    const confirmCancel = async () => {
        try {
            await axios.delete(`http://localhost:3000/api/v1/booking/${deleteBookingId}`, {
                withCredentials: true
            });
            // Remove from local state
            setBookings(bookings.filter(booking => booking._id !== deleteBookingId));
            setShowDeleteConfirm(false);
        } catch (err) {
            console.error("Error canceling booking:", err);
            alert(`Error: ${err.response?.data?.message || err.message}`);
        }
    };

    if (loading) return <div className="loading">Loading your bookings...</div>;
    if (error) return <div className="error">Error: {error}</div>;

    return (
        <div className="bookings-container">
            <h1>My Bookings</h1>

            {bookings.length === 0 ? (
                <div className="no-bookings">
                    <p>You haven't made any bookings yet.</p>
                    <Link to="/events" className="browse-events-link">Browse Events</Link>
                </div>
            ) : (
                <div className="bookings-list">
                    {bookings.map((booking) => (
                        <div key={booking._id} className="booking-card">
                            <div className="booking-info">
                                <h3>{booking.event?.title || 'Event Title Unavailable'}</h3>
                                <p className="booking-date">
                                    {new Date(booking.createdAt).toLocaleDateString()}
                                </p>
                                <div className="booking-details">
                                    <p>Tickets: {booking.quantity}</p>
                                    <p>Total: ${booking.totalPrice?.toFixed(2) || (booking.quantity * booking.event?.price).toFixed(2)}</p>
                                    <p>Status: <span className="status">{booking.status || 'Confirmed'}</span></p>
                                </div>
                                <div className="booking-actions">
                                    <Link to={`/bookings/${booking._id}`} className="view-details-btn">View Details</Link>
                                    {booking.status !== 'Cancelled' && (
                                        <button
                                            onClick={() => handleCancelClick(booking._id)}
                                            className="cancel-btn"
                                        >
                                            Cancel Booking
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <ConfirmationDialog
                isOpen={showDeleteConfirm}
                title="Confirm Cancellation"
                message="Are you sure you want to cancel this booking? This action cannot be undone."
                confirmText="Yes, Cancel Booking"
                cancelText="Keep Booking"
                onConfirm={confirmCancel}
                onCancel={() => setShowDeleteConfirm(false)}
            />
        </div>
    );
};

export default UserBookingsPage;