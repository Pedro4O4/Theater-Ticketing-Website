import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../auth/AuthContext';
import BookTicketForm from './booking/BookTicketForm';
import './EventDetails.css';

const EventDetails = () => {
    const [event, setEvent] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [showBookingForm, setShowBookingForm] = useState(false);
    const { id } = useParams();
    const { token, user } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        fetchEventDetails();
    }, [id]);

    const fetchEventDetails = async () => {
        try {
            const response = await axios.get(`http://localhost:3000/events/${id}`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            setEvent(response.data);
        } catch (err) {
            setError('Failed to fetch event details. Please try again later.');
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateString) => {
        const options = {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        };
        return new Date(dateString).toLocaleDateString(undefined, options);
    };

    if (loading) {
        return <div className="loading">Loading event details...</div>;
    }

    if (error) {
        return <div className="error-message">{error}</div>;
    }

    if (!event) {
        return <div className="error-message">Event not found</div>;
    }

    return (
        <div className="event-details-page">
            <div className="event-header">
                <div className="event-image">
                    <img src={event.image || '/default-event.jpg'} alt={event.title} />
                    <span className="event-category">{event.category}</span>
                </div>
                
                <div className="event-info">
                    <h1>{event.title}</h1>
                    <div className="event-meta">
                        <p className="event-date">
                            <i className="fas fa-calendar"></i>
                            {formatDate(event.date)}
                        </p>
                        <p className="event-location">
                            <i className="fas fa-map-marker-alt"></i>
                            {event.location}
                        </p>
                        <p className="event-price">
                            <i className="fas fa-ticket-alt"></i>
                            ${event.ticketPrice} per ticket
                        </p>
                        <p className="event-tickets">
                            <i className="fas fa-ticket-alt"></i>
                            {event.remainingTickets} tickets remaining
                        </p>
                    </div>

                    {user?.role === 'Standard User' && (
                        <button
                            className="book-tickets-button"
                            onClick={() => setShowBookingForm(true)}
                            disabled={event.remainingTickets === 0}
                        >
                            {event.remainingTickets === 0 ? 'Sold Out' : 'Book Tickets'}
                        </button>
                    )}
                </div>
            </div>

            <div className="event-content">
                <section className="event-description">
                    <h2>About This Event</h2>
                    <p>{event.description}</p>
                </section>

                {event.organizerId && (
                    <section className="event-organizer">
                        <h2>Organizer</h2>
                        <p>{event.organizerId.name}</p>
                    </section>
                )}
            </div>

            {showBookingForm && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <BookTicketForm
                            event={event}
                            onClose={() => setShowBookingForm(false)}
                        />
                    </div>
                </div>
            )}
        </div>
    );
};

export default EventDetails; 