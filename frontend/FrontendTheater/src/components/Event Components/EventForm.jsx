import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../../auth/AuthContext';
import './EventForm.css';

const EventForm = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const isEditing = Boolean(id);

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        date: '',
        location: '',
        category: '',
        ticketPrice: '',
        totalTickets: '',
        image: ''
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!user || user.role !== 'Organizer') {
            navigate('/events');
            return;
        }

        if (isEditing) {
            fetchEventData();
        }
    }, [user, id, navigate]);

    const fetchEventData = async () => {
        try {
            setLoading(true);
            const response = await axios.get(`http://localhost:3000/api/v1/event/${id}`, {
                withCredentials: true
            });

            const event = response.data.data || response.data;
            setFormData({
                title: event.title || '',
                description: event.description || '',
                date: event.date ? new Date(event.date).toISOString().split('T')[0] : '',
                location: event.location || '',
                category: event.category || '',
                ticketPrice: event.ticketPrice || '',
                totalTickets: event.totalTickets || '',
                image: event.image || ''
            });
        } catch (err) {
            setError('Failed to fetch event data. ' + (err.response?.data?.message || err.message));
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: name === 'totalTickets' || name === 'ticketPrice' ? parseFloat(value) || '' : value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            setLoading(true);

            const eventData = {
                ...formData,
                totalTickets: parseInt(formData.totalTickets),
                ticketPrice: parseFloat(formData.ticketPrice),
                remainingTickets: parseInt(formData.totalTickets) // Set initially to total tickets
            };

            if (isEditing) {
                await axios.put(`http://localhost:3000/api/v1/event/${id}`, eventData, {
                    withCredentials: true
                });
            } else {
                await axios.post('http://localhost:3000/api/v1/event', eventData, {
                    withCredentials: true
                });
            }

            navigate('/events');
        } catch (err) {
            setError('Failed to save event. ' + (err.response?.data?.message || err.message));
        } finally {
            setLoading(false);
        }
    };

    if (loading && isEditing) {
        return <div className="loading">Loading event data...</div>;
    }

    return (
        <div className="event-form-container">
            <h2>{isEditing ? 'Edit Event' : 'Create New Event'}</h2>

            {error && <div className="error-message">{error}</div>}

            <form onSubmit={handleSubmit} className="event-form">
                <div className="form-group">
                    <label htmlFor="title">Event Title*</label>
                    <input
                        type="text"
                        id="title"
                        name="title"
                        value={formData.title}
                        onChange={handleChange}
                        required
                        placeholder="Enter event title"
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="description">Description*</label>
                    <textarea
                        id="description"
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        required
                        rows="4"
                        placeholder="Enter event description"
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="date">Date*</label>
                    <input
                        type="date"
                        id="date"
                        name="date"
                        value={formData.date}
                        onChange={handleChange}
                        required
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="location">Location*</label>
                    <input
                        type="text"
                        id="location"
                        name="location"
                        value={formData.location}
                        onChange={handleChange}
                        required
                        placeholder="Enter event location"
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="category">Category*</label>
                    <input
                        type="text"
                        id="category"
                        name="category"
                        value={formData.category}
                        onChange={handleChange}
                        required
                        placeholder="Enter event category"
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="totalTickets">Available Tickets*</label>
                    <input
                        type="number"
                        id="totalTickets"
                        name="totalTickets"
                        value={formData.totalTickets}
                        onChange={handleChange}
                        required
                        min="1"
                        placeholder="Enter number of available tickets"
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="ticketPrice">Ticket Price ($)*</label>
                    <input
                        type="number"
                        id="ticketPrice"
                        name="ticketPrice"
                        value={formData.ticketPrice}
                        onChange={handleChange}
                        required
                        step="0.01"
                        min="0"
                        placeholder="Enter ticket price"
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="image">Image URL</label>
                    <input
                        type="url"
                        id="image"
                        name="image"
                        value={formData.image}
                        onChange={handleChange}
                        placeholder="Enter image URL"
                    />
                </div>

                <div className="form-actions">
                    <button type="button" onClick={() => navigate('/events')} className="cancel-button">
                        Cancel
                    </button>
                    <button type="submit" className="submit-button" disabled={loading}>
                        {loading ? 'Saving...' : (isEditing ? 'Update Event' : 'Create Event')}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default EventForm;