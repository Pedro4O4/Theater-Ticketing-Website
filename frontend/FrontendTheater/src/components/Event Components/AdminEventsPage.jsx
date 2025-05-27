import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../auth/AuthContext';
import EventCard from './EventCard';
import './AdminEventsPage.css';

const AdminEventsPage = () => {
    const [events, setEvents] = useState([]);
    const [filteredEvents, setFilteredEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeFilter, setActiveFilter] = useState('pending');
    const [searchQuery, setSearchQuery] = useState('');

    const navigate = useNavigate();
    const { user } = useAuth();

    useEffect(() => {




        if (!user) {
            navigate('/login');
            return;
        }

        if (user.role !== 'System Admin') {
            navigate('/');
            return;
        }

        fetchEvents();
    }, [navigate, user]);

    useEffect(() => {
        if (events.length > 0) {
            setFilteredEvents(events.filter(event => event.status === activeFilter));
        }
    }, [activeFilter, events]);

    useEffect(() => {
        if (events.length > 0) {
            // First filter by status
            let filtered = events.filter(event => event.status === activeFilter);

            // Then apply search filter if there's a search query
            if (searchQuery.trim()) {
                const query = searchQuery.toLowerCase();
                filtered = filtered.filter(event =>
                    (event.title && event.title.toLowerCase().includes(query)) ||
                    (event.description && event.description.toLowerCase().includes(query)) ||
                    (event.location && event.location.toLowerCase().includes(query)) ||
                    (event.organizer && event.organizer.name &&
                        event.organizer.name.toLowerCase().includes(query))
                );
            }

            setFilteredEvents(filtered);
        }
    }, [activeFilter, events, searchQuery]);

    const fetchEvents = async () => {
        setLoading(true);
        try {
            const response = await axios.get(`http://localhost:3000/api/v1/event/all`, {
                withCredentials: true
            });

            if (response.data) {
                const eventsData = Array.isArray(response.data) ? response.data :
                    (response.data.events || response.data.data || []);
                setEvents(eventsData);
            }
        } catch (err) {
            setError('Failed to fetch events: ' + (err.response?.data?.message || err.message));
        } finally {
            setLoading(false);
        }
    };

    const handleStatusChange = async (eventId, newStatus) => {
        try {
            await axios.put(`http://localhost:3000/api/v1/event/${eventId}/`, {
                status: newStatus
            }, {
                withCredentials: true
            });

            // Update the status in the local events array
            setEvents(events.map(event => {
                if ((event.id || event._id) === eventId) {
                    return { ...event, status: newStatus };
                }
                return event;
            }));
        } catch (err) {
            setError('Failed to update event status: ' + (err.response?.data?.message || err.message));
        }
    };

    const handleSearchChange = (e) => {
        setSearchQuery(e.target.value);
    };
    if (loading) {
        return <div className="loading">Loading events...</div>;
    }

    return (
        <div className="admin-events-container">
            <div className="event-header">
                <h1 className="page-title">Event Administration</h1>
                <div className="admin-actions">
                    <div className="organizer-buttons">
                        <Link to="/events" className="view-events-button">View All Events</Link>
                        <Link to="/admin/users" className="view-events-button">Manage Users</Link>
                    </div>
                </div>

                {/* Search bar is placed here */}
                <div className="search-container">
                    <input
                        type="text"
                        placeholder="Search events by title, description, location..."
                        value={searchQuery}
                        onChange={handleSearchChange}
                        className="search-input"
                    />
                </div>
                <div className="filter-tabs">
                    <button
                        className={`filter-tab ${activeFilter === 'pending' ? 'active' : ''}`}
                        onClick={() => setActiveFilter('pending')}>
                        Pending
                    </button>
                    <button
                        className={`filter-tab ${activeFilter === 'approved' ? 'active' : ''}`}
                        onClick={() => setActiveFilter('approved')}>
                        Approved
                    </button>
                    <button
                        className={`filter-tab ${activeFilter === 'declined' ? 'active' : ''}`}
                        onClick={() => setActiveFilter('declined')}>
                        Declined
                    </button>
                </div>
            </div>

            {error && <div className="error-message">{error}</div>}

            {filteredEvents && filteredEvents.length > 0 ? (
                <div className="event-grid">
                    {filteredEvents.map((event) => (
                        <div key={event.id || event._id} className="event-card-with-actions">
                            <EventCard event={event} />
                            <div className="event-info">
                            </div>
                            <div className="event-actions">
                                <Link to={`/events/${event.id || event._id}`} className="event-button">Details</Link>
                                <h3 className="event-title">{event.title || event.name}</h3>

                                {activeFilter === 'pending' && (
                                    <>
                                        <button
                                            onClick={() => handleStatusChange(event.id || event._id, 'approved')}
                                            className="event-button approve-button">
                                            Approve
                                        </button>
                                        <button
                                            onClick={() => handleStatusChange(event.id || event._id, 'declined')}
                                            className="event-button cancel-button">
                                            Decline
                                        </button>
                                    </>
                                )}
                                {activeFilter === 'approved' && (
                                    <button
                                        onClick={() => handleStatusChange(event.id || event._id, 'declined')}
                                        className="event-button cancel-button">
                                        Revoke Approval
                                    </button>
                                )}
                                {activeFilter === 'declined' && (
                                    <button
                                        onClick={() => handleStatusChange(event.id || event._id, 'approved')}
                                        className="event-button approve-button">
                                        Approve
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="no-events-container">
                    <div className="no-events">
                        <h2>No {activeFilter} events</h2>
                        <p>There are currently no events with {activeFilter} status.</p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminEventsPage;