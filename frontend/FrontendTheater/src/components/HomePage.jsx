// src/components/HomePage.jsx
import { Link } from "react-router-dom";
import "./HomePage.css";

export default function HomePage() {
    const featuredEvents = [
        {
            id: 1,
            title: "Summer Music Festival",
            date: "July 15-17, 2023",
            image: "https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
            category: "Music"
        },
        {
            id: 2,
            title: "Tech Conference 2023",
            date: "August 5-7, 2023",
            image: "https://images.unsplash.com/photo-1505373877841-8d25f7d46678?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
            category: "Technology"
        },
        {
            id: 3,
            title: "Food & Wine Festival",
            date: "September 10-12, 2023",
            image: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
            category: "Culinary"
        }
    ];

    return (
        <div className="home-page">
            <section className="hero-section">
                <div className="hero-content">
                    <h1 className="hero-title">Discover Amazing Events</h1>
                    <p className="hero-subtitle">Find and book tickets for the best events in your area</p>
                    <div className="hero-actions">
                        <button className="btn-primary btn-large">Browse Events</button>
                        <button className="btn-secondary btn-large">Create Event</button>
                    </div>
                </div>
            </section>

            <section className="featured-events">
                <h2 className="section-title">Featured Events</h2>
                <div className="event-grid">
                    {featuredEvents.map(event => (
                        <div className="event-card" key={event.id}>
                            <div className="event-image">
                                <img src={event.image} alt={event.title} />
                                <span className="event-category">{event.category}</span>
                            </div>
                            <div className="event-details">
                                <h3 className="event-title">{event.title}</h3>
                                <p className="event-date">{event.date}</p>
                                <Link to={`/events/${event.id}`} className="event-link">
                                    View Details
                                </Link>
                            </div>
                        </div>
                    ))}
                </div>
                <div className="view-all-container">
                    <Link to="/events" className="view-all-link">View All Events</Link>
                </div>
            </section>

            <section className="cta-section">
                <div className="cta-content">
                    <h2>Ready to host your own event?</h2>
                    <p>Join thousands of organizers using our platform</p>
                    <Link to="/org" className="btn-primary">Get Started</Link>
                </div>
            </section>
        </div>
    );
}