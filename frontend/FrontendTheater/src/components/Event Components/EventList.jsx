import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../auth/AuthContext';
import EventCard from './EventCard';
import './EventList.css';
import './EventCard.css';

const EventList = () => {
    const [events, setEvents] = useState([]);
    const [filteredEvents, setFilteredEvents] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
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

    useEffect(() => {
        // Filter events when search term changes
        if (events.length > 0) {
            const filtered = events.filter(event =>
                (event.title || event.name || '').toLowerCase().includes(searchTerm.toLowerCase())
            );
            setFilteredEvents(filtered);
        }
    }, [searchTerm, events]);

    const fetchEvents = async () => {
        try {
            const endpoint = 'http://localhost:3000/api/v1/event';
            console.log(`Fetching events from ${endpoint} as ${user.role}...`);

            const response = await axios.get(endpoint, {
                withCredentials: true
            });

            console.log("API Response:", response);

            const data = response.data;
            let eventsData = [];

            if (Array.isArray(data)) {
                eventsData = data;
            } else if (data?.events && Array.isArray(data.events)) {
                eventsData = data.events;
            } else if (data?.data && Array.isArray(data.data)) {
                eventsData = data.data;
            } else {
                console.error("Unexpected API response format:", data);
                setError("Unexpected data format from API");
            }

            setEvents(eventsData);
            setFilteredEvents(eventsData);
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

    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
    };

    return (
        <div className="event-list-container">
            <div className="event-header">
                <h1 className="page-title">Events</h1>
                <div className="search-container">
                    <input
                        type="text"
                        placeholder="Search events by title..."
                        value={searchTerm}
                        onChange={handleSearchChange}
                        className="search-input"
                    />
                </div>
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
                    {filteredEvents.length > 0 ? (
                        filteredEvents.map((event) => (
                            <div key={event._id} className="event-card-with-actions">
                                <EventCard event={event} />
                                <div className="event-info">

                                </div>
                                <div className="event-actions">
                                    <Link to={`/events/${event.id || event._id}`} className="event-button">Details</Link>
                                    <h3 className="event-title">{event.title || event.name}</h3>

                                    {event.remainingTickets !== undefined && (
                                        <div className="tickets-badge">
                                            <span className="tickets-count">{event.remainingTickets}</span>
                                            <span className="tickets-label">tickets left</span>
                                        </div>
                                    )}

                                    {user?.role === "Standard User" && event.remainingTickets !== 0 && (
                                        <button
                                            className="book-now-btn"
                                            onClick={() => navigate(`/bookings/new/${event._id}`)}
                                        >
                                            Book Now
                                        </button>
                                    )}
                                    {event.remainingTickets > 0 && event.remainingTickets < 50 && (
                                        <button className="book-now-btn limited" disabled>
                                            Limited Tickets
                                        </button>
                                    )}

                                    {event.remainingTickets === 0 && (
                                        <button className="book-now-btn disabled" disabled>
                                            Sold Out
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))
                    ) : (
                        <p className="no-events">No events found matching "{searchTerm}"</p>
                    )}
                </div>
            )}
        </div>
    );
};

export default EventList;