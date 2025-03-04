🎟️ Online Event Ticketing System 🎟️
Overview
This project is a full-stack web application for an online event ticketing system. Users can browse, search, and purchase tickets for various events such as concerts, sports games, theater shows, and more. 🎭🏟️🎤

User Roles
There are three main user roles within the system:

👤 Standard User: Can browse events, book tickets, and view their booking history.
🎟️ Event Posting User (Organizer): Can create, update, and delete their own events.
🛠️ System Admin: Has full control over the system, including managing users and events.
Project Features
🌐 Homepage
The homepage displays a list of upcoming events with essential details like event name, date, location, and price. Users can easily discover what events are happening soon.
<div class="event">
  <h2>🎭 Broadway Show: Phantom of the Opera</h2>
  <p><strong>Date:</strong> May 5, 2025</p>
  <p><strong>Location:</strong> Broadway Theater, NYC</p>
  <p><strong>Price:</strong> $70</p>
  <button>🎫 Book Now</button>
</div>
📝 Event Details Page
Each event has its own dedicated page where users can read detailed information. For theater events, this might include a show description, the cast, and a booking option.
<h1>🎭 Phantom of the Opera</h1>
<p><strong>Location:</strong> Broadway Theater, NYC</p>
<p><strong>Date:</strong> May 5, 2025</p>
<p><strong>Description:</strong> A world-renowned musical telling the story of a mysterious phantom living under the opera house.</p>
<p><strong>Ticket Availability:</strong> 200 Seats Left</p>
<button>🎟️ Book Tickets</button>
🎟️ Ticket Booking System
Users can select how many tickets they want, view the number of available seats, and proceed to checkout.
<form>
  <label for="ticketQuantity">🎫 Number of Tickets:</label>
  <input type="number" id="ticketQuantity" name="ticketQuantity" min="1" max="10">
  <button type="submit">🛒 Proceed to Checkout</button>
</form>
