import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import ConfirmationDialog from '../AdminComponent/ConfirmationDialog';
import './BookingDetails.css';
import { formatCurrency } from '../../utils/feeCalculator';
import { toast } from 'react-toastify';

const BookingDetails = () => {
    const { id } = useParams();
    const [booking, setBooking] = useState(null);
    const [event, setEvent] = useState(null);
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

                // إذا كان لدينا معرف للفعالية، نجلب تفاصيلها
                if (response.data.eventId) {
                    try {
                        // تأكد من أن eventId هو سلسلة نصية وليس كائن
                        const eventId = typeof response.data.eventId === 'object' ?
                            response.data.eventId._id || response.data.eventId.toString() :
                            response.data.eventId;

                        // استخدم المسار الصحيح (singular 'event', not plural 'events')
                        const eventResponse = await axios.get(`http://localhost:3000/api/v1/event/${eventId}`, {
                            withCredentials: true
                        });

                        // معالجة هيكل الاستجابة بشكل صحيح
                        if (eventResponse.data.success && eventResponse.data.data) {
                            setEvent(eventResponse.data.data);
                        }
                    } catch (eventErr) {
                        console.error("Error fetching event details:", eventErr);
                    }
                }
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
            // استخدام POST بدلاً من PATCH
            await axios.delete(`http://localhost:3000/api/v1/booking/${id}`,
                { withCredentials: true }
            );
            setBooking({...booking, status: 'Cancelled'});
            setShowCancelConfirm(false);
            toast.success('تم إلغاء الحجز بنجاح');
        } catch (err) {
            console.error("Error canceling booking:", err);
            toast.error(`خطأ: ${err.response?.data?.message || err.message}`);
        }
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
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

    // استخدم حالة الفعالية إذا كانت متاحة، وإلا استخدم booking.event
    const eventData = event || booking.event || {};

    const bookingDate = booking.createdAt
        ? new Date(booking.createdAt).toLocaleDateString()
        : 'Date not available';

    // حساب subtotal إذا لم يتم توفيره
    const ticketQuantity = booking.numberOfTickets || booking.quantity || 0;
    const ticketPrice = eventData.ticketPrice || 0;
    const subtotal = booking.subtotal || (ticketPrice * ticketQuantity);
    const percentageFee = booking.percentageFee || (subtotal * 0.035); // 3.5%
    const fixedFee = booking.fixedFee || (1.99 * ticketQuantity);
    const totalPrice = booking.totalPrice || (subtotal + percentageFee + fixedFee);

    return (
        <div className="booking-details-container">
            <div className="booking-details-card">
                <div className="booking-header">
                    <h2>Event & Booking Details</h2>
                    <span className={`booking-status ${booking.status?.toLowerCase() || 'confirmed'}`}>
                        {booking.status || 'Confirmed'}
                    </span>
                </div>

                {/* قسم معلومات الفعالية */}
                <div className="event-details-content">
                    <div className="event-image-container">
                        {eventData.image ? (
                            <img src={eventData.image} alt={eventData.title} className="event-image" />
                        ) : (
                            <div className="event-no-image">No image available</div>
                        )}
                    </div>

                    <div className="event-info">
                        <h3>{eventData.title || 'Event Title Unavailable'}</h3>

                        <div className="event-info-item">
                            <h4>📅 Date & Time</h4>
                            <p>{eventData.date ? formatDate(eventData.date) : 'Date not available'}</p>
                        </div>

                        <div className="event-info-item">
                            <h4>📍 Location</h4>
                            <p>{eventData.location || 'Location not specified'}</p>
                        </div>

                        <div className="event-info-item">
                            <h4>🏷️ Category</h4>
                            <p>{eventData.category || 'Uncategorized'}</p>
                        </div>

                        <div className="event-info-item full-width">
                            <h4>📝 Description</h4>
                            <p className="event-description">{eventData.description || 'No description available'}</p>
                        </div>
                    </div>
                </div>

                {/* قسم معلومات الحجز */}
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
                            <span className="info-value">{ticketQuantity}</span>
                        </div>
                        <div className="info-item">
                            <span className="info-label">Price per Ticket:</span>
                            <span className="info-value">{formatCurrency(ticketPrice)}</span>
                        </div>
                    </div>
                </div>

                {/* قسم تفاصيل الأسعار */}
                <div className="price-breakdown-section">
                    <h3>Price Breakdown</h3>
                    <div className="price-breakdown">
                        <div className="price-item">
                            <span>Subtotal:</span>
                            <span>{formatCurrency(subtotal)}</span>
                        </div>
                        <div className="price-item fee">
                            <span>Service Fee (3.5%):</span>
                            <span>{formatCurrency(percentageFee)}</span>
                        </div>
                        <div className="price-item fee">
                            <span>Processing Fee:</span>
                            <span>{formatCurrency(fixedFee)}</span>
                        </div>
                        <div className="price-item total">
                            <span>Total:</span>
                            <span>{formatCurrency(totalPrice)}</span>
                        </div>
                    </div>
                </div>

                <div className="booking-actions">
                    <Link to="/bookings" className="back-button">Back to My Bookings</Link>
                    {eventData._id && (
                        <Link to={`/events/${eventData._id}`} className="view-event-btn">View Event Page</Link>
                    )}
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