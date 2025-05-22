import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import './EventCard.css';

const EventCard = ({ event }) => {
    const { _id, title, date, location, ticketPrice, image, description, category, remainingTickets } = event;

    // Format date if it exists
    const formattedDate = date ? new Date(date).toLocaleDateString('en-US', {
        weekday: 'short',
        year: 'numeric',
        month: 'short',
        day: 'numeric',
    }) : 'Date not available';

    return (
        <div className="event-card">
            <div className="event-image">
                {image && image !== 'default-image.jpg' ? (
                    <img src={image} alt={title} />
                ) : (
                    <div className="placeholder-image">No Image Available</div>
                )}
            </div>

            <div className="event-info">
                <h3 className="event-title">{title}</h3>
                <p className="event-date">📅 {formattedDate}</p>
                <p className="event-location">📍 {location || 'Location not specified'}</p>
                {category && <p className="event-category">🏷️ {category}</p>}
                <p className="event-description">
                    {description?.substring(0, 100) || 'No description available'}
                    {description?.length > 100 ? '...' : ''}
                </p>
                <p className="event-price">
                    💰 {typeof ticketPrice !== 'undefined' ? `$${ticketPrice.toFixed(2)}` : 'Price not available'}
                </p>
                {typeof remainingTickets !== 'undefined' && (
                    <p className="event-tickets">
                        🎟️ {remainingTickets > 0 ? `${remainingTickets} tickets remaining` : 'Sold Out'}
                    </p>
                )}
                <Link to={`/events/${_id}`} className="event-button">
                    View Details
                </Link>
            </div>
        </div>
    );
};

EventCard.propTypes = {
    event: PropTypes.shape({
        _id: PropTypes.string.isRequired,
        title: PropTypes.string.isRequired,
        date: PropTypes.string,
        location: PropTypes.string,
        description: PropTypes.string,
        ticketPrice: PropTypes.number,
        totalTickets: PropTypes.number,
        remainingTickets: PropTypes.number,
        category: PropTypes.string,
        image: PropTypes.string,
        status: PropTypes.string
    }).isRequired
};

export default EventCard;