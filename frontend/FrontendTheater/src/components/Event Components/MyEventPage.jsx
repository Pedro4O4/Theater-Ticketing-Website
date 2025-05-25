import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../auth/AuthContext';
import EventCard from './EventCard';
import './EventList.css';
import './MyEventPage.css'

const MyEventsPage = () => {
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();
    const { user } = useAuth();

    useEffect(() => {
        if (!user) {
            navigate('/login');
            return;
        }

        if (user.role !== 'Organizer') {
            navigate('/events');
            return;
        }

        fetchMyEvents();
    }, [navigate, user]);

    const fetchMyEvents = async () => {
        try {
            const response = await axios.get('http://localhost:3000/api/v1/user/events', {
                withCredentials: true
            });

            if (response.data) {
                const eventsData = Array.isArray(response.data) ? response.data :
                    (response.data.events || response.data.data || []);

                // Debug log to check event structure
                console.log("Event object structure:", eventsData[0]);

                setEvents(eventsData);
            }
        } catch (err) {
            setError('Failed to fetch your events: ' + (err.response?.data?.message || err.message));
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (eventId) => {
        if (!window.confirm('Are you sure you want to delete this event?')) {
            return;
        }

        try {
            await axios.delete(`http://localhost:3000/api/v1/event/${eventId}`, {
                withCredentials: true
            });

            // Use both id and _id in filter to ensure it works with either format
            setEvents(events.filter(event => (event.id || event._id) !== eventId));
        } catch (err) {
            setError('Failed to delete event: ' + (err.response?.data?.message || err.message));
        }
    };

    if (loading) {
        return <div className="loading">Loading your events...</div>;
    }

    if (error) {
        return (
            <div className="no-events-container">
                <div className="no-events">
                    <h2>You haven't created any events yet</h2>
                    <p>Create your first event to start selling tickets and managing registrations.</p>
                    <Link to="/my-events/new" className="event-button">
                        Create Your First Event
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="event-list-container">
            <div className="event-header">
                <h1 className="page-title">My Events</h1>
                <div className="organizer-buttons">
                    <Link to="/events" className="view-events-button">View All Events</Link>
                    <Link to="/my-events/new" className="create-event-button">Create New Event</Link>
                    <Link to="/my-events/analytics" className="analytics-button">Analytics</Link>
                </div>
            </div>

            {events && events.length > 0 ? (
                <div className="event-grid">
                    {events.map((event) => (
                        <div key={event.id || event._id} className="event-card-with-actions">
                            <EventCard event={event} />
                            <div className="event-actions">
                                <Link to={`/events/${event.id || event._id}`} className="event-button">Details</Link>
                                <Link to={`/my-events/${event.id || event._id}/edit`} className="event-button">Edit</Link>
                                <button onClick={() => handleDelete(event.id || event._id)} className="event-button cancel-button">
                                    Delete
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="no-events-container">
                    <div className="no-events">
                        <h2>You haven't created any events yet</h2>
                        <p>Create your first event to start selling tickets and managing registrations.</p>
                        <Link to="/my-events/new" className="event-button">
                            Create Your First Event
                        </Link>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MyEventsPage;