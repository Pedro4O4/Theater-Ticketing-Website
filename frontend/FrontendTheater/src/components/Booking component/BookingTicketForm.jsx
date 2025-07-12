import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import './BookingTicketForm.css';
import { calculateFees, formatCurrency } from '../../utils/feeCalculator';

const BookTicketForm = ({ event: preSelectedEvent, onBookingComplete }) => {
    const { eventId } = useParams(); // Get eventId from URL parameters
    const [selectedEvent, setSelectedEvent] = useState(null);
    const [numberOfTickets, setNumberOfTickets] = useState(1);
    const [isLoading, setIsLoading] = useState(false);
    const [isEventLoading, setIsEventLoading] = useState(false);
    const [error, setError] = useState(null);
    const [feeDetails, setFeeDetails] = useState({
        subtotal: 0,
        percentageFee: 0,
        fixedFee: 0,
        total: 0
    });
    const navigate = useNavigate();

    // Fetch event by ID from URL parameter if needed
    useEffect(() => {
        // If we have a preSelectedEvent, use it immediately
        if (preSelectedEvent) {
            setSelectedEvent(preSelectedEvent);
            return;
        }

        // If we have an eventId from URL params, fetch that event
        if (eventId) {
            fetchEventById(eventId);
        }
    }, [preSelectedEvent, eventId]);

    // Update fee calculation when number of tickets or event changes
    useEffect(() => {
        if (selectedEvent && selectedEvent.ticketPrice) {
            const fees = calculateFees(selectedEvent.ticketPrice, numberOfTickets);
            setFeeDetails(fees);
        }
    }, [selectedEvent, numberOfTickets]);

    const fetchEventById = async (id) => {
        try {
            setIsEventLoading(true);
            const response = await axios.get(`http://localhost:3000/api/v1/event/${id}`, {
                withCredentials: true
            });

            if (response.data && response.data.data) {
                setSelectedEvent(response.data.data);

                // Calculate initial fees
                if (response.data.data.ticketPrice) {
                    const fees = calculateFees(response.data.data.ticketPrice, 1);
                    setFeeDetails(fees);
                }
            } else {
                throw new Error('Invalid event data received');
            }
        } catch (err) {
            console.error("Error fetching event details:", err);
            setError("Failed to load event details: " + (err.response?.data?.message || err.message));
        } finally {
            setIsEventLoading(false);
        }
    };

    const handleTicketChange = (e) => {
        const value = parseInt(e.target.value);
        const maxTickets = selectedEvent?.remainingTickets || selectedEvent?.totalTickets || 0;

        if (value <= 0) setNumberOfTickets(1);
        else if (value > maxTickets) setNumberOfTickets(maxTickets);
        else setNumberOfTickets(value);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!selectedEvent) {
            setError("Please select an event before booking");
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            const response = await axios.post(
                'http://localhost:3000/api/v1/booking',
                {
                    eventId: selectedEvent._id,
                    numberOfTickets,
                    subtotal: feeDetails.subtotal,
                    percentageFee: feeDetails.percentageFee,
                    fixedFee: feeDetails.fixedFee,
                    totalPrice: feeDetails.total,
                    status: 'confirmed'
                },
                { withCredentials: true }
            );

            if (onBookingComplete) {
                onBookingComplete(response.data);
            } else {
                navigate('/bookings');
            }
        } catch (err) {
            console.error("Booking error details:", err);

            let errorMessage = "Failed to book tickets. Please try again.";
            if (err.response) {
                errorMessage = err.response.data?.message || errorMessage;
            }

            setError(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    const getAvailableTickets = (event) => {
        return event?.remainingTickets || event?.totalTickets || 0;
    };

    if (isEventLoading) {
        return <div className="loading">Loading event details...</div>;
    }

    if (!selectedEvent) {
        return <div className="loading">Event not found</div>;
    }

    const maxTickets = getAvailableTickets(selectedEvent);
    const ticketPrice = selectedEvent?.ticketPrice || 0;

    return (
        <div className="book-ticket-form">
            <h2>Book Tickets</h2>

            <form onSubmit={handleSubmit}>
                <div className="event-summary">
                    <h4>{selectedEvent.title}</h4>
                    <p><strong>Date:</strong> {new Date(selectedEvent.date).toLocaleDateString()}</p>
                    <p><strong>Location:</strong> {selectedEvent.location}</p>
                    <p><strong>Category:</strong> {selectedEvent.category}</p>
                    {selectedEvent.description && (
                        <p><strong>Description:</strong> {selectedEvent.description}</p>
                    )}
                </div>

                <div className="form-group">
                    <label htmlFor="numberOfTickets">
                        Number of Tickets:
                        <span className="tickets-remaining">({maxTickets} available)</span>
                    </label>
                    <input
                        type="number"
                        id="numberOfTickets"
                        value={numberOfTickets}
                        onChange={handleTicketChange}
                        min="1"
                        max={maxTickets}
                        disabled={isLoading}
                        required
                    />
                </div>

                {/* Price Breakdown with Fees */}
                <div className="price-summary">
                    <div className="fee-breakdown">
                        <p>Price per ticket: {formatCurrency(ticketPrice)}</p>
                        <p className="subtotal">Subtotal: {formatCurrency(feeDetails.subtotal)}</p>
                        <p className="fee-line">Service fee (3.5%): {formatCurrency(feeDetails.percentageFee)}</p>
                        <p className="fee-line">Processing fee: {formatCurrency(feeDetails.fixedFee)}</p>
                        <p className="total-price">Total: {formatCurrency(feeDetails.total)}</p>
                    </div>
                </div>

                {error && (
                    <div className="error-message">
                        {error}
                        <p className="error-hint">
                            Note: There might be an issue with the booking service. Please try again later or contact support.
                        </p>
                    </div>
                )}

                <div className="form-actions">
                    <button
                        type="submit"
                        className="book-button"
                        disabled={isLoading || maxTickets === 0}
                    >
                        {isLoading ? 'Processing...' : 'Book Now'}
                    </button>
                    <button
                        type="button"
                        className="cancel-button"
                        onClick={() => navigate('/events')}
                        disabled={isLoading}
                    >
                        Cancel
                    </button>
                </div>
            </form>
        </div>
    );
};

export default BookTicketForm;