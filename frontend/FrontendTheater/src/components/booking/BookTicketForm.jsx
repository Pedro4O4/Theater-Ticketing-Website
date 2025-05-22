import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../auth/AuthContext';
import './BookTicketForm.css';

const BookTicketForm = ({ event, onClose }) => {
    const [quantity, setQuantity] = useState(1);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const { token } = useAuth();
    const navigate = useNavigate();

    const totalPrice = event.ticketPrice * quantity;

    const handleQuantityChange = (e) => {
        const value = parseInt(e.target.value);
        if (value > 0 && value <= event.remainingTickets) {
            setQuantity(value);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const response = await axios.post(
                'http://localhost:3000/bookings',
                {
                    eventId: event._id,
                    numberOfTickets: quantity,
                    totalPrice: totalPrice
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            if (response.status === 201) {
                onClose();
                navigate('/bookings');
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to book tickets. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="book-ticket-form">
            <h2>Book Tickets for {event.title}</h2>
            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label htmlFor="quantity">Number of Tickets:</label>
                    <input
                        type="number"
                        id="quantity"
                        min="1"
                        max={event.remainingTickets}
                        value={quantity}
                        onChange={handleQuantityChange}
                        required
                    />
                    <span className="tickets-remaining">
                        {event.remainingTickets} tickets remaining
                    </span>
                </div>

                <div className="price-summary">
                    <p>Price per ticket: ${event.ticketPrice}</p>
                    <p className="total-price">Total: ${totalPrice}</p>
                </div>

                {error && <div className="error-message">{error}</div>}

                <div className="form-actions">
                    <button
                        type="button"
                        className="cancel-button"
                        onClick={onClose}
                        disabled={loading}
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        className="book-button"
                        disabled={loading || event.remainingTickets === 0}
                    >
                        {loading ? 'Booking...' : 'Book Tickets'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default BookTicketForm; 