import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../auth/AuthContext';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import './EventAnalytics.css'; // Updated import

const EventAnalytics = () => {
    const [analytics, setAnalytics] = useState(null);
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

        fetchAnalyticsData();
    }, [navigate, user]);

    const fetchAnalyticsData = async () => {
        try {
            const response = await axios.get(`http://localhost:3000/api/v1/user/events/analytics`, {
                withCredentials: true
            });

            setAnalytics(response.data);
        } catch (err) {
            setError('Failed to fetch analytics: ' + (err.response?.data?.message || err.message));
        } finally {
            setLoading(false);
        }
    };

    // Prepare data for event comparison chart
    const prepareEventComparisonData = () => {
        if (!analytics?.events) return [];
        return analytics.events.map(event => ({
            name: event.eventTitle,
            value: event.ticketsSold
        }));
    }

    // COLORS for pie chart
    const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#83a6ed', '#8dd1e1'];

    if (loading) {
        return <div className="loading">Loading analytics data...</div>;
    }

    if (error) {
        return <div className="error-message">{error}</div>;
    }

    return (
        <div className="analytics-container">
            <div className="analytics-header">
                <h2 className="analytics-title">Event Analytics Dashboard</h2>
            </div>

            <div className="stats-summary">
                <div className="stat-card">
                    <h3>Total Events</h3>
                    <p>{analytics?.totalEvents || 0}</p>
                </div>
                <div className="stat-card">
                    <h3>Total Revenue</h3>
                    <p>${analytics?.totalRevenue?.toFixed(2) || '0.00'}</p>
                </div>
                <div className="stat-card">
                    <h3>Average Sales Rate</h3>
                    <p>{analytics?.averageSoldPercentage || 0}%</p>
                </div>
            </div>

            {analytics?.events && analytics.events.length > 0 ? (
                <>
                    <div className="chart-container">
                        <h2>Ticket Sales by Event</h2>
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart
                                data={analytics.events}
                                margin={{ top: 5, right: 30, left: 20, bottom: 80 }}
                            >
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis
                                    dataKey="eventTitle"
                                    tick={{ fontSize: 12 }}
                                    interval={0}
                                    angle={-45}
                                    textAnchor="end"
                                />
                                <YAxis />
                                <Tooltip />
                                <Legend />
                                <Bar dataKey="ticketsSold" name="Tickets Sold" fill="#8884d8" />
                                <Bar dataKey="ticketsAvailable" name="Tickets Available" fill="#82ca9d" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>

                    <div className="chart-container">
                        <h2>Sales Distribution</h2>
                        <ResponsiveContainer width="100%" height={300}>
                            <PieChart>
                                <Pie
                                    data={prepareEventComparisonData()}
                                    cx="50%"
                                    cy="50%"
                                    labelLine={false}
                                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                                    outerRadius={100}
                                    fill="#8884d8"
                                    dataKey="value"
                                >
                                    {prepareEventComparisonData().map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>

                    <div className="chart-container">
                        <h2>Events Performance</h2>
                        <div className="events-table">
                            <table>
                                <thead>
                                <tr>
                                    <th>Event</th>
                                    <th>Tickets Sold</th>
                                    <th>Available</th>
                                    <th>Sales %</th>
                                    <th>Revenue</th>
                                </tr>
                                </thead>
                                <tbody>
                                {analytics.events.map(event => (
                                    <tr key={event.eventId}>
                                        <td>{event.eventTitle}</td>
                                        <td>{event.ticketsSold}</td>
                                        <td>{event.ticketsAvailable}</td>
                                        <td>{event.percentageSold}%</td>
                                        <td>${event.revenue?.toFixed(2)}</td>
                                    </tr>
                                ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </>
            ) : (
                <div className="no-events-message">
                    <p>No event data available. Create events to start seeing analytics.</p>
                </div>
            )}

            <div className="event-actions">
                <button onClick={() => navigate('/my-events')} className="back-button">
                    Back to My Events
                </button>
            </div>
        </div>
    );
};

export default EventAnalytics;