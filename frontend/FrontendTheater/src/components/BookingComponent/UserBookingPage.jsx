import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import ConfirmationDialog from '../AdminComponent/ConfirmationDialog';
import './UserBookingPage.css';

const UserBookingsPage = () => {
    const [bookings, setBookings] = useState([]);
    const [eventDetails, setEventDetails] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [deleteBookingId, setDeleteBookingId] = useState(null);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        fetchBookings();
    }, []);

    const fetchBookings = async () => {
        try {
            setLoading(true);
            const response = await axios.get(`${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/user/bookings`, {
                withCredentials: true
            });

            let bookingsData = [];
            if (Array.isArray(response.data)) {
                bookingsData = response.data;
            } else if (response.data?.userId && Array.isArray(response.data.userId)) {
                bookingsData = response.data.userId;
            } else if (response.data?.data && Array.isArray(response.data.data)) {
                bookingsData = response.data.data;
            } else {
                setError("Unexpected data format from API");
                setLoading(false);
                return;
            }

            setBookings(bookingsData);

            // Fetch event details
            const events = {};
            await Promise.all(
                bookingsData.map(async (booking) => {
                    if (booking.eventId) {
                        try {
                            const eventResponse = await axios.get(`${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/event/${booking.eventId}`, {
                                withCredentials: true
                            });

                            if (eventResponse.data.success && eventResponse.data.data) {
                                events[booking.eventId] = eventResponse.data.data;
                            }
                        } catch (err) {
                            console.error(`Error fetching event for booking ${booking._id}:`, err);
                        }
                    }
                })
            );

            setEventDetails(events);
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
            await axios.delete(`${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/booking/${deleteBookingId}`, {
                withCredentials: true
            });
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
            <div className="header-with-back">
                <h1>My Bookings</h1>
                <button
                    className="back-button"
                    onClick={() => navigate('/events')}
                >
                    Back to Events
                </button>
            </div>

            {bookings.length === 0 ? (
                <div className="no-bookings">
                    <p>You haven't made any bookings yet.</p>
                    <Link to="/events" className="browse-events-link">Browse Events</Link>
                </div>
            ) : (
                <div className="bookings-list">
                    {bookings.map((booking) => {
                        const event = booking.eventId && eventDetails[booking.eventId]
                            ? eventDetails[booking.eventId]
                            : booking.event || {};

                        const quantity = booking.quantity || booking.numberOfTickets || 0;
                        const ticketPrice = event.ticketPrice || 0;
                        const totalPrice = booking.totalPrice?.toFixed(2) || (quantity * ticketPrice).toFixed(2);

                        return (
                            <div key={booking._id} className="booking-card">
                                <div className="booking-info">
                                    <h3>{event.title || 'Event Title Unavailable'}</h3>
                                    <span className="booking-date">
                                        {new Date(booking.createdAt).toLocaleDateString()}
                                    </span>

                                    <div className="booking-details">
                                        <p>Tickets: <strong>{quantity}</strong></p>
                                        <p>Total: <strong>${totalPrice}</strong></p>
                                        <p>Status:
                                            <span className={`status ${(booking.status || 'confirmed').toLowerCase()}`}>
                                                {booking.status || 'Confirmed'}
                                            </span>
                                        </p>
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
                        );
                    })}
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
