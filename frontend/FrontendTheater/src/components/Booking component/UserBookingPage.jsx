import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import ConfirmationDialog from '../AdminComponent/ConfirmationDialog';
import './UserBookingPage.css';
import { formatCurrency } from '../../utils/feeCalculator';
import { toast } from 'react-toastify';

const UserBookingsPage = () => {
    const [bookings, setBookings] = useState([]);
    const [eventDetails, setEventDetails] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [deleteBookingId, setDeleteBookingId] = useState(null);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [cancellationLoading, setCancellationLoading] = useState(false);

    useEffect(() => {
        fetchBookings();
    }, []);

    const fetchBookings = async () => {
        try {
            setLoading(true);
            const response = await axios.get('http://localhost:3000/api/v1/booking/user', {
                withCredentials: true
            });

            let bookingsData = [];
            if (response.data && Array.isArray(response.data)) {
                bookingsData = response.data;
            } else if (response.data && response.data.userId && Array.isArray(response.data.userId)) {
                bookingsData = response.data.userId;
            } else if (response.data && response.data.data && Array.isArray(response.data.data)) {
                bookingsData = response.data.data;
            } else {
                setError("Unexpected data format from API");
                setLoading(false);
                return;
            }

            setBookings(bookingsData);

            // Fetch event details for each booking
            const events = {};
            await Promise.all(
                bookingsData.map(async (booking) => {
                    if (booking.eventId) {
                        try {
                            // 修正: 确保 eventId 是字符串而不是对象
                            const eventId = typeof booking.eventId === 'object' ?
                                booking.eventId._id || booking.eventId.toString() :
                                booking.eventId;

                            const eventResponse = await axios.get(`http://localhost:3000/api/v1/event/${eventId}`, {
                                withCredentials: true
                            });

                            if (eventResponse.data.success && eventResponse.data.data) {
                                events[eventId] = eventResponse.data.data;
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
            setCancellationLoading(true);
            await axios.delete(`http://localhost:3000/api/v1/booking/${deleteBookingId}`, {
                withCredentials: true
            });
            // Remove from local state
            setBookings(bookings.filter(booking => booking._id !== deleteBookingId));
            setShowDeleteConfirm(false);
        } catch (err) {
            console.error("Error canceling booking:", err);
            alert(`Error: ${err.response?.data?.message || err.message}`);
        } finally {
            setCancellationLoading(false);
        }
    };

    if (loading) return <div className="loading">Loading your bookings...</div>;
    if (error) return <div className="error">Error: {error}</div>;



    return (
        <div className="bookings-container">
            <div className="bookings-header">
                <h1>My Bookings</h1>
                <Link to="/events" className="browse-events-btn">Events</Link>
            </div>

            {bookings.length === 0 ? (
                <div className="no-bookings">
                    <p>You haven't made any bookings yet.</p>
                    <Link to="/events" className="browse-events-link">Events</Link>
                </div>
            ) : (
                <div className="bookings-list">
                    {bookings.map((booking) => {
                        // 修正: 正确处理 eventId，确保是字符串
                        const eventId = typeof booking.eventId === 'object' ?
                            booking.eventId._id || booking.eventId.toString() :
                            booking.eventId;

                        const event = eventDetails[eventId] || {};

                        // Get ticket quantity from either numberOfTickets or quantity field
                        const ticketQuantity = booking.numberOfTickets || booking.quantity || 0;
                        const ticketPrice = event?.ticketPrice || 0;

                        // 修正: 更好地处理费用计算
                        const hasDetailedFees = booking.subtotal !== undefined &&
                            (booking.percentageFee !== undefined || booking.fixedFee !== undefined);

                        const subtotal = booking.subtotal || (ticketPrice * ticketQuantity);

                        // 修正: 更准确地计算费用
                        const percentageFee = booking.percentageFee !== undefined ? booking.percentageFee : (subtotal * 0.035);
                        const fixedFee = booking.fixedFee !== undefined ? booking.fixedFee : (1.99 * ticketQuantity);
                        const totalFees = percentageFee + fixedFee;

                        return (
                            <div key={booking._id} className="booking-card">
                                <div className="booking-info">
                                    <h3>{event.title || 'Event Title Unavailable'}</h3>
                                    <span className="booking-date">
                                        {new Date(booking.createdAt).toLocaleDateString()}
                                    </span>

                                    <div className="booking-details">
                                        <p>Tickets: <strong>{ticketQuantity}</strong></p>

                                        {/* Show fee breakdown if available */}
                                        {hasDetailedFees ? (
                                            <div className="fee-summary">
                                                <p>Subtotal: <span>{formatCurrency(subtotal)}</span></p>
                                                <p>Fees: <span>{formatCurrency(totalFees)}</span></p>
                                                <p className="total">Total: <strong>{formatCurrency(booking.totalPrice)}</strong></p>
                                            </div>
                                        ) : (
                                            <p>Total: <strong>{formatCurrency(booking.totalPrice || (ticketQuantity * ticketPrice) || 0)}</strong></p>
                                        )}

                                        <p>Status: <span className={`status ${(booking.status || 'confirmed').toLowerCase()}`}>
                                            {booking.status || 'Confirmed'}
                                        </span></p>
                                    </div>

                                    <div className="bookings-actions">
                                        <Link to={`/bookings/${booking._id}`} className="view-details-btn">View Details</Link>
                                        {booking.status !== 'Cancelled' && (
                                            <button
                                                onClick={() => handleCancelClick(booking._id)}
                                                className="cancel-btn"
                                                disabled={cancellationLoading}
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
                confirmText={cancellationLoading ? "Cancelling..." : "Yes, Cancel Booking"}
                cancelText="Keep Booking"
                onConfirm={confirmCancel}
                onCancel={() => setShowDeleteConfirm(false)}
                isLoading={cancellationLoading}
                disabled={cancellationLoading}
            />
        </div>
    );
};

export default UserBookingsPage;