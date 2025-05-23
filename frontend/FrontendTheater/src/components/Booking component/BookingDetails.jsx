// frontend/FrontendTheater/src/components/Booking Components/BookingDetails.jsx
import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import ConfirmationDialog from '../AdminComponent/ConfirmationDialog';
import './BookingStyles.css';

const BookingDetails = () => {
    const { id } = useParams();
    const [booking, setBooking] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showCancelConfirm, setShowCancelConfirm] = useState(false);


    useEffect(() => {
        fetchBookingDetails();
    }, [id]);

    const fetchBookingDetails = async () => {
        try {
            setLoading(true);
            const response = await axios.get(`http://localhost:3000/api/v1/booking/${id}`, {
                withCredentials: true
            });

            if (response.data) {
                setBooking(response.data);
            } else {
                setError("Booking not found");
            }
        } catch (err) {
            console.error("Error fetching booking details:", err);
            setError(err.response?.data?.message || "Failed to load booking details");
        } finally {
            setLoading(false);
        }
    };

    const handleCancelBooking = async () => {
        try {
            await axios.delete(`http://localhost:3000/api/v1/booking/${id}`, {
                withCredentials: true
            });
            // Update booking status locally
            setBooking({...booking, status: 'Cancelled'});
            setShowCancelConfirm(false);
        } catch (err) {
            console.error("Error canceling booking:", err);
            alert(`Error: ${err.response?.data?.message || err.message}`);
        }
    };

    if (loading) return <div className="loading">Loading booking details...</div>;
    if (error) return (
        <div className="error-container">
            <div className="error">Error: {error}</div>
            <Link to="/bookings" className="back-button">Back to My Bookings</Link>
        </div>
    );
    if (!booking) return (
        <div className="not-found">
            <h2>Booking not found</h2>
            <Link to="/bookings" className="back-button">Back to My Bookings</Link>
        </div>
    );

    const eventDate = booking.event?.date
        ? new Date(booking.event.date).toLocaleDateString()
        : 'Date not available';

    const bookingDate = booking.createdAt
        ? new Date(booking.createdAt).toLocaleDateString()
        : 'Date not available';

    return (
        <div className="booking-details-container">
            <div className="booking-details-card">
                <div className="booking-header">
                    <h2>Booking Details</h2>
                    <span className={`booking-status ${booking.status?.toLowerCase() || 'confirmed'}`}>
            {booking.status || 'Confirmed'}
          </span>
                </div>

                <div className="booking-info-section">
                    <h3>Event Information</h3>
                    <div className="info-grid">
                        <div className="info-item">
                            <span className="info-label">Event:</span>
                            <span className="info-value">{booking.event?.title || 'Title unavailable'}</span>
                        </div>
                        <div className="info-item">
                            <span className="info-label">Location:</span>
                            <span className="info-value">{booking.event?.location || 'Location unavailable'}</span>
                        </div>
                        <div className="info-item">
                            <span className="info-label">Event Date:</span>
                            <span className="info-value">{eventDate}</span>
                        </div>
                    </div>
                </div>

                <div className="booking-info-section">
                    <h3>Booking Information</h3>
                    <div className="info-grid">
                        <div className="info-item">
                            <span className="info-label">Booking ID:</span>
                            <span className="info-value">{booking._id}</span>
                        </div>
                        <div className="info-item">
                            <span className="info-label">Booked on:</span>
                            <span className="info-value">{bookingDate}</span>
                        </div>
                        <div className="info-item">
                            <span className="info-label">Number of Tickets:</span>
                            <span className="info-value">{booking.quantity}</span>
                        </div>
                        <div className="info-item">
                            <span className="info-label">Price per Ticket:</span>
                            <span className="info-value">${booking.event?.ticketPrice?.toFixed(2) || 'N/A'}</span>
                        </div>
                        <div className="info-item">
                            <span className="info-label">Total Price:</span>
                            <span className="info-value">${booking.totalPrice?.toFixed(2) || 'N/A'}</span>
                        </div>
                    </div>
                </div>

                <div className="booking-actions">
                    <Link to="/bookings" className="back-button">Back to My Bookings</Link>
                    {booking.status !== 'Cancelled' && (
                        <button
                            onClick={() => setShowCancelConfirm(true)}
                            className="cancel-booking-btn"
                        >
                            Cancel Booking
                        </button>
                    )}
                </div>
            </div>

            <ConfirmationDialog
                isOpen={showCancelConfirm}
                title="Confirm Cancellation"
                message="Are you sure you want to cancel this booking? This action cannot be undone."
                confirmText="Yes, Cancel Booking"
                cancelText="Keep Booking"
                onConfirm={handleCancelBooking}
                onCancel={() => setShowCancelConfirm(false)}
            />
        </div>
    );
};

export default BookingDetails;