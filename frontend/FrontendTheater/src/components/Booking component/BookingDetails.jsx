import './BookingDetails.css';

const BookingDetails = ({ booking, onClose }) => {
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

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
                <button className="close-button" onClick={onClose}>&times;</button>

                <h2>Booking Details</h2>

                <div className="booking-info">
                    <div className="info-section">
                        <h3>Event Information</h3>
                        <p><strong>Event:</strong> {booking.eventId.title}</p>
                        <p><strong>Date:</strong> {formatDate(booking.eventId.date)}</p>
                        <p><strong>Location:</strong> {booking.eventId.location}</p>
                        <p><strong>Category:</strong> {booking.eventId.category}</p>
                    </div>

                    <div className="info-section">
                        <h3>Booking Information</h3>
                        <p><strong>Booking ID:</strong> {booking._id}</p>
                        <p><strong>Status:</strong>
                            <span className={`status ${booking.status}`}>
                                {booking.status}
                            </span>
                        </p>
                        <p><strong>Number of Tickets:</strong> {booking.numberOfTickets}</p>
                        <p><strong>Price per Ticket:</strong> ${booking.eventId.ticketPrice}</p>
                        <p><strong>Total Price:</strong> ${booking.totalPrice}</p>
                        <p><strong>Booked On:</strong> {formatDate(booking.createdAt)}</p>
                    </div>

                    {booking.eventId.description && (
                        <div className="info-section">
                            <h3>Event Description</h3>
                            <p>{booking.eventId.description}</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default BookingDetails;