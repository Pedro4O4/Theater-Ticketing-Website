import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import '.././index.css';
import { getImageUrl } from '../utils/imageHelper';

const Homepage = () => {
    const [featuredEvents, setFeaturedEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showLoginPrompt, setShowLoginPrompt] = useState(false);
    const [selectedEvent, setSelectedEvent] = useState(null);
    const [showFullImage, setShowFullImage] = useState(false);
    const [currentImage, setCurrentImage] = useState(null);
    const navigate = useNavigate();

    const API_URL = 'http://localhost:3000';

    // Check if user is logged in
    const isLoggedIn = () => {
        return localStorage.getItem('token') !== null;
    };

    const handleEventClick = (event) => {
        if (isLoggedIn()) {
            navigate(`/events/${event.id}`);
        } else {
            setSelectedEvent(event);
            setShowLoginPrompt(true);
        }
    };

    const openFullImage = (event, e) => {
        e.stopPropagation();
        setCurrentImage(event);
        setShowFullImage(true);
    };

    useEffect(() => {
        axios.get(`${API_URL}/api/v1/event/approved`)
            .then(response => {
                if (response.data && Array.isArray(response.data)) {
                    const events = response.data.map(event => ({
                        id: event._id,
                        title: event.title,
                        date: new Date(event.date).toLocaleDateString(),
                        location: event.location,
                        image: getImageUrl(event.image) || '/placeholder-image.jpg',
                        ticketPrice: event.ticketPrice,
                        remainingTickets: event.remainingTickets
                    }));
                    setFeaturedEvents(events);
                } else {
                    setError('No events found');
                    setFeaturedEvents([]);
                }
                setLoading(false);
            })
            .catch(error => {
                console.error('Error fetching events:', error);
                setError('Failed to load events. Please try again later.');
                setFeaturedEvents([]);
                setLoading(false);
            });
    }, []);

    if (loading) {
        return <div className="loading-indicator">Loading...</div>;
    }

    return (
        <div className="homepage-container">
            {/* Hero Section with the specified background image */}
            <div className="hero-section" style={{
                background: 'linear-gradient(rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.7)), url("https://th.bing.com/th/id/OIP.GcQyOsMVDtUUhTTMmTjY0wHaEJ?w=626&h=351&rs=1&pid=ImgDetMain")',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat'
            }}>
                <div className="hero-content">
                    <h1 className="hero-title">Experience the Magic of Live Performance</h1>
                    <p className="hero-subtitle">Discover extraordinary events that will leave you breathless</p>
                    <div className="hero-buttons">
                    </div>
                </div>
            </div>

            {/* Featured Events Section */}
            <section className="featured-section">
                <h2 className="section-title">Featured Shows</h2>
                {error ? (
                    <div className="error-message">{error}</div>
                ) : featuredEvents.length === 0 ? (
                    <div className="no-events-message">No events available at the moment.</div>
                ) : (
                    <>
                        <div className="events-grid">
                            {featuredEvents.map(event => (
                                <div key={event.id} className="event-card">
                                    <div className="event-image-container" onClick={(e) => openFullImage(event, e)}>
                                        <img
                                            src={event.image}
                                            alt={event.title}
                                            className="event-image"
                                        />
                                        <div className="image-overlay">
                                            <span className="view-full">Click to view full image</span>
                                        </div>
                                    </div>
                                    <div className="event-info">
                                        <h3 className="events-titles">{event.title}</h3>
                                        <div className="event-meta">
                                            <p className="event-date">
                                                <i className="far fa-calendar"></i> {event.date}
                                            </p>
                                            <p className="event-location">
                                                <i className="fas fa-map-marker-alt"></i> {event.location}
                                            </p>
                                        </div>
                                        <div className="event-price-tag">
                                            <span>{event.ticketPrice > 0 ? `$${event.ticketPrice}` : 'Free'}</span>
                                        </div>
                                        <button
                                            className="view-detail-btn"
                                            onClick={() => handleEventClick(event)}
                                        >
                                            {isLoggedIn() ? 'View Details' : 'Login to View'}
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Scroll Navigation Buttons */}
                        <div className="scroll-nav">
                            <button className="scroll-btn" onClick={() => {
                                const container = document.querySelector('.events-grid');
                                container.scrollBy({ left: -320, behavior: 'smooth' });
                            }}>←</button>
                            <button className="scroll-btn" onClick={() => {
                                const container = document.querySelector('.events-grid');
                                container.scrollBy({ left: 320, behavior: 'smooth' });
                            }}>→</button>
                        </div>
                    </>
                )}
            </section>

            {/* Full Image Modal */}
            {showFullImage && (
                <div className="full-image-modal" onClick={() => setShowFullImage(false)}>
                    <div className="modal-content" onClick={e => e.stopPropagation()}>
                        <img src={currentImage.image} alt={currentImage.title} />
                        <button className="close-modal" onClick={() => setShowFullImage(false)}>×</button>
                    </div>
                </div>
            )}

            {/* Login Prompt Modal */}
            {showLoginPrompt && (
                <div className="login-prompt-overlay" onClick={() => setShowLoginPrompt(false)}>
                    <div className="login-prompt-modal" onClick={e => e.stopPropagation()}>
                        <h3>Login Required</h3>
                        <p>Please log in to view event details for "{selectedEvent?.title}"</p>
                        <div className="login-prompt-buttons">
                            <Link to="/login" className="login-btn">Login</Link>
                            <Link to="/register" className="register-btn">Register</Link>
                            <button className="cancel-btn" onClick={() => setShowLoginPrompt(false)}>Cancel</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Homepage;