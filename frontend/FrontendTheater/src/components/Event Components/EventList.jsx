import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../auth/AuthContext';
import EventCard from './EventCard';
import './EventList.css';
import './EventCard.css';

const EventList = () => {
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();
    const { user } = useAuth();

    useEffect(() => {
        if (!user) {
            console.log("No user found in auth context");
            navigate('/login');
            return;
        }

        // Redirect System Admin early
        if (user?.role === "System Admin") {
            navigate('/admin/events');
            return;
        }

        fetchEvents();
    }, [navigate, user]);

    const fetchEvents = async () => {
        try {
            const endpoint = 'http://localhost:3000/api/v1/event';
            console.log(`Fetching events from ${endpoint} as ${user.role}...`);

            const response = await axios.get(endpoint, {
                withCredentials: true
            });

            console.log("API Response:", response);

            const data = response.data;

            if (Array.isArray(data)) {
                setEvents(data);
            } else if (data?.events && Array.isArray(data.events)) {
                setEvents(data.events);
            } else if (data?.data && Array.isArray(data.data)) {
                setEvents(data.data);
            } else {
                console.error("Unexpected API response format:", data);
                setError("Unexpected data format from API");
            }
        } catch (err) {
            console.error("Error fetching events:", err);
            if (err.response && [401, 403, 405].includes(err.response.status)) {
                navigate('/login');
            } else {
                const errorMessage = err.response?.data?.message || err.message;
                setError(errorMessage);
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="event-list-container">
            <div className="event-header">
                <h1 className="page-title">Events</h1>
                {user?.role === "Organizer" && (
                    <div className="organizer-buttons">
                        <Link to="/my-events" className="create-event-button" style={{ marginLeft: '10px' }}>
                            My Events
                        </Link>
                    </div>
                )}
                {user?.role === "Standard User" && (
                    <div className="organizer-buttons">
                        <Link to="/bookings" className="event-button">
                            My Bookings
                        </Link>
                    </div>
                )}
            </div>

            {loading && <p className="loading-state">Loading events...</p>}
            {error && <p className="error-message">Error: {error}</p>}

            {!loading && !error && (
                <div className="event-grid">
                    {events.length > 0 ? (
                        events.map((event) => (
                            <div key={event._id} className="event-card-with-actions">
                                <EventCard event={event} />
                                <div className="event-info">
                                </div>
                                <div className="event-actions">
                                    <Link to={`/events/${event.id || event._id}`} className="event-button">Details</Link>
                                    <h3 className="event-title">{event.title || event.name}</h3>
                                    {user?.role === "Standard User" && (
                                        <button
                                            className="book-now-btn"
                                            onClick={() => navigate(`/bookings/new/${event._id}`)}
                                        >
                                            Book Now
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))
                    ) : (
                        <p className="no-events">No events found</p>
                    )}
                </div>
            )}
        </div>
    );
};

export default EventList;
