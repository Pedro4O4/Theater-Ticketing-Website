// frontend/FrontendTheater/src/components/Booking Components/BookTicketForm.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './BookingStyles.css';

const BookTicketForm = ({ event, onBookingComplete }) => {
    const [quantity, setQuantity] = useState(1);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    const maxTickets = event?.tickCount || 0;
    const ticketPrice = event?.ticketPrice || 0;
    const totalPrice = quantity * ticketPrice;

    const handleQuantityChange = (e) => {
        const value = parseInt(e.target.value);
        if (value <= 0) setQuantity(1);
        else if (value > maxTickets) setQuantity(maxTickets);
        else setQuantity(value);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);

        try {
            const response = await axios.post(
                'http://localhost:3000/api/v1/booking',
                {
                    eventId: event._id,
                    quantity,
                },
                { withCredentials: true }
            );

            if (onBookingComplete) {
                onBookingComplete(response.data);
            } else {
                navigate('/bookings');
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to book tickets. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="booking-form">
            <h3>Book Tickets</h3>

            {maxTickets === 0 ? (
                <p className="sold-out">Sold Out</p>
            ) : (
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="quantity">Quantity ({maxTickets} available):</label>
                        <input
                            type="number"
                            id="quantity"
                            value={quantity}
                            onChange={handleQuantityChange}
                            min="1"
                            max={maxTickets}
                            disabled={isLoading}
                        />
                    </div>

                    <div className="price-summary">
                        <p>Price per ticket: ${ticketPrice.toFixed(2)}</p>
                        <p className="total-price">Total: ${totalPrice.toFixed(2)}</p>
                    </div>

                    {error && <div className="error-message">{error}</div>}

                    <button
                        type="submit"
                        className="book-button"
                        disabled={isLoading || maxTickets === 0}
                    >
                        {isLoading ? 'Processing...' : 'Book Now'}
                    </button>
                </form>
            )}
        </div>
    );
};

export default BookTicketForm;