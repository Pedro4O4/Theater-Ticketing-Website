import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../auth/AuthContext';
import BookingDetails from './BookingDetails';
import './UserBookingsPage.css';

const UserBookingsPage = () => {
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [selectedBooking, setSelectedBooking] = useState(null);
    const { token } = useAuth();

    useEffect(() => {
        fetchBookings();
    }, []);

    const fetchBookings = async () => {
        try {
            const response = await axios.get('http://localhost:3000/users/bookings', {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            setBookings(response.data);
        } catch (err) {
            setError('Failed to fetch bookings. Please try again later.');
        } finally {
            setLoading(false);
        }
    };

    const handleCancelBooking = async (bookingId) => {
        if (!window.confirm('Are you sure you want to cancel this booking?')) {
            return;
        }

        try {
            await axios.delete(`http://localhost:3000/bookings/${bookingId}`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            setBookings(bookings.filter(booking => booking._id !== bookingId));
        } catch (err) {
            setError('Failed to cancel booking. Please try again later.');
        }
    };

    if (loading) {
        return <div className="loading">Loading bookings...</div>;
    }

    if (error) {
        return <div className="error-message">{error}</div>;
    }

    return (
        <div className="bookings-page">
            <h1>My Bookings</h1>
            
            {bookings.length === 0 ? (
                <p className="no-bookings">You haven't made any bookings yet.</p>
            ) : (
                <div className="bookings-list">
                    {bookings.map(booking => (
                        <div key={booking._id} className="booking-card">
                            <div className="booking-header">
                                <h3>{booking.eventId.title}</h3>
                                <span className={`status ${booking.status}`}>
                                    {booking.status}
                                </span>
                            </div>
                            
                            <div className="booking-details">
                                <p>
                                    <strong>Date:</strong>{' '}
                                    {new Date(booking.eventId.date).toLocaleDateString()}
                                </p>
                                <p>
                                    <strong>Location:</strong> {booking.eventId.location}
                                </p>
                                <p>
                                    <strong>Tickets:</strong> {booking.numberOfTickets}
                                </p>
                                <p>
                                    <strong>Total Price:</strong> ${booking.totalPrice}
                                </p>
                            </div>

                            <div className="booking-actions">
                                <button
                                    className="view-details-button"
                                    onClick={() => setSelectedBooking(booking)}
                                >
                                    View Details
                                </button>
                                {booking.status === 'confirmed' && (
                                    <button
                                        className="cancel-button"
                                        onClick={() => handleCancelBooking(booking._id)}
                                    >
                                        Cancel Booking
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {selectedBooking && (
                <BookingDetails
                    booking={selectedBooking}
                    onClose={() => setSelectedBooking(null)}
                />
            )}
        </div>
    );
};

export default UserBookingsPage; 