import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../auth/AuthContext';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
    ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, AreaChart, Area
} from 'recharts';
import { toast } from 'react-toastify';
import './EventAnalytics.css';

const EventAnalytics = () => {
    const [activeTab, setActiveTab] = useState('performance'); // 'performance' or 'revenue'
    const [activeView, setActiveView] = useState('summary'); // 'summary' or 'individual'
    const [eventAnalytics, setEventAnalytics] = useState(null);
    const [revenueAnalytics, setRevenueAnalytics] = useState(null);
    const [selectedEventId, setSelectedEventId] = useState(null);
    const [individualEventData, setIndividualEventData] = useState(null);
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

        fetchData();
    }, [navigate, user]);

    // تأثير إضافي لتحميل بيانات الفعالية الفردية عند تغيير الفعالية المحددة
    useEffect(() => {
        if (selectedEventId) {
            fetchIndividualEventData(selectedEventId);
        }
    }, [selectedEventId]);

    const fetchData = async () => {
        setLoading(true);
        try {
            // جلب بيانات الأداء
            const performanceResponse = await axios.get(
                `http://localhost:3000/api/v1/user/events/analytics`,
                { withCredentials: true }
            );

            console.log("Performance data response:", performanceResponse.data);

            if (performanceResponse.data) {
                setEventAnalytics(performanceResponse.data);
                // تعيين الفعالية الأولى كفعالية افتراضية محددة
                if (performanceResponse.data.events && performanceResponse.data.events.length > 0) {
                    setSelectedEventId(performanceResponse.data.events[0].eventId);
                }
            }

            // جلب بيانات الإيرادات
            const revenueResponse = await axios.get(
                `http://localhost:3000/api/v1/booking/stats`,
                { withCredentials: true }
            );

            console.log("Revenue data response:", revenueResponse.data);

            if (revenueResponse.data) {
                setRevenueAnalytics(revenueResponse.data);
            }

        } catch (err) {
            console.error("Error fetching analytics:", err);
            setError('Failed to fetch analytics: ' + (err.response?.data?.message || err.message));
            toast.error('Failed to load analytics data');
        } finally {
            setLoading(false);
        }
    };

    // دالة جديدة لجلب بيانات فعالية محددة
    const fetchIndividualEventData = async (eventId) => {
        try {
            // جلب بيانات الحجوزات للفعالية المحددة
            const bookingsResponse = await axios.get(
                `http://localhost:3000/api/v1/booking/event/${eventId}`,
                { withCredentials: true }
            );

            const eventDetailsResponse = await axios.get(
                `http://localhost:3000/api/v1/event/${eventId}`,
                { withCredentials: true }
            );

            // تنظيم البيانات للرسوم البيانية الفردية
            const event = eventDetailsResponse.data.data || eventDetailsResponse.data;
            const bookings = bookingsResponse.data.bookings || bookingsResponse.data;

            // تنظيم البيانات حسب التاريخ للرسم البياني الزمني
            const bookingsByDate = groupBookingsByDate(bookings);

            setIndividualEventData({
                event,
                bookings,
                bookingsByDate,
                totalTicketsSold: bookings.reduce((sum, booking) =>
                    sum + (booking.numberOfTickets || 0), 0),
                totalRevenue: bookings.reduce((sum, booking) =>
                    booking.status !== 'Cancelled' ? sum + (booking.totalPrice || 0) : sum, 0),
            });

        } catch (err) {
            console.error(`Error fetching data for event ${eventId}:`, err);
            toast.error(`Couldn't load individual event data`);
        }
    };

    // مساعدة - تجميع الحجوزات حسب التاريخ
    const groupBookingsByDate = (bookings) => {
        const dateMap = {};

        // تصنيف الحجوزات حسب التاريخ
        bookings.forEach(booking => {
            if (booking.status === 'Cancelled') return;

            const date = booking.createdAt
                ? new Date(booking.createdAt).toLocaleDateString()
                : new Date(booking._id.toString().substring(0, 8) * 1000).toLocaleDateString();

            if (!dateMap[date]) {
                dateMap[date] = {
                    date,
                    count: 0,
                    revenue: 0,
                    tickets: 0
                };
            }

            dateMap[date].count += 1;
            dateMap[date].revenue += (booking.totalPrice || 0);
            dateMap[date].tickets += (booking.numberOfTickets || 0);
        });

        // تحويل إلى مصفوفة وترتيبها حسب التاريخ
        return Object.values(dateMap).sort((a, b) =>
            new Date(a.date) - new Date(b.date)
        );
    };

    // تحضير بيانات لمخطط مقارنة الفعاليات
    const prepareEventComparisonData = () => {
        if (!eventAnalytics?.events || !eventAnalytics.events.length) return [];

        return eventAnalytics.events
            .filter(event => event.ticketsSold > 0) // فقط الفعاليات التي باعت تذاكر
            .map(event => ({
                name: event.eventTitle,
                value: event.ticketsSold
            }));
    };

    // تصنيف الأداء بناءً على النسبة المئوية
    const getPerformanceClass = (percentage) => {
        if (percentage >= 80) return 'performance-high';
        if (percentage >= 50) return 'performance-medium';
        return 'performance-low';
    };

    // تصنيف الإيرادات بناءً على القيمة
    const getRevenueClass = (revenue) => {
        if (revenue >= 1000) return 'revenue-high';
        if (revenue >= 500) return 'revenue-medium';
        return 'revenue-low';
    };

    // ألوان لمخطط الدائرة
    const COLORS = ['#4C51BF', '#22D3EE', '#FBBF24', '#DB2777', '#8B5CF6', '#10B981', '#F472B6'];

    // تحضير بيانات مقارنة لمخطط الإيرادات
    const prepareRevenueData = () => {
        if (!revenueAnalytics || !eventAnalytics?.events) return [];

        return eventAnalytics.events
            .filter(event => event.revenue > 0)
            .map(event => ({
                name: event.eventTitle,
                revenue: event.revenue,
                fees: event.revenue * 0.05, // تقريب للرسوم (5% من الإيرادات)
                net: event.revenue * 0.95, // صافي الإيرادات بعد الرسوم
            }));
    };

    if (loading) {
        return <div className="loading">Loading analytics data...</div>;
    }

    if (error) {
        return (
            <div className="analytics-container">
                <div className="error-message">
                    <h3>Error Loading Analytics</h3>
                    <p>{error}</p>
                    <button onClick={fetchData} className="retry-button">
                        Retry
                    </button>
                    <button onClick={() => navigate('/my-events')} className="back-button">
                        Back to My Events
                    </button>
                </div>
            </div>
        );
    }

    // التأكد من وجود بيانات صالحة لمخطط الدائرة
    const pieChartData = prepareEventComparisonData();
    const hasPieData = pieChartData.length > 0;

    // بيانات لمخططات الإيرادات
    const revenueData = prepareRevenueData();
    const hasRevenueData = revenueData.length > 0;

    // التأكد من وجود فعاليات قبل عرض الواجهة
    const hasEvents = eventAnalytics?.events && eventAnalytics.events.length > 0;

    return (
        <div className="analytics-container">
            <div className="analytics-header">
                <h2 className="analytics-title">Event Analytics Dashboard</h2>

                {/* الأقسام الرئيسية */}
                <div className="analytics-tabs">
                    <button
                        className={`tab-button ${activeTab === 'performance' ? 'active' : ''}`}
                        onClick={() => setActiveTab('performance')}
                    >
                        Event Performance
                    </button>
                    <button
                        className={`tab-button ${activeTab === 'revenue' ? 'active' : ''}`}
                        onClick={() => setActiveTab('revenue')}
                    >
                        Revenue Analytics
                    </button>
                </div>

                {/* اختيار العرض - ملخص أو فعالية فردية */}
                {hasEvents && (
                    <div className="view-selector">
                        <button
                            className={`view-button ${activeView === 'summary' ? 'active' : ''}`}
                            onClick={() => setActiveView('summary')}
                        >
                            Summary View
                        </button>
                        <button
                            className={`view-button ${activeView === 'individual' ? 'active' : ''}`}
                            onClick={() => setActiveView('individual')}
                        >
                            Individual Event View
                        </button>
                    </div>
                )}

                {/* قائمة اختيار الفعالية - تظهر فقط في عرض الفعالية الفردية */}
                {activeView === 'individual' && hasEvents && (
                    <div className="event-selector">
                        <label htmlFor="event-select">Select Event:</label>
                        <select
                            id="event-select"
                            value={selectedEventId || ''}
                            onChange={(e) => setSelectedEventId(e.target.value)}
                            className="event-select-dropdown"
                        >
                            {eventAnalytics.events.map(event => (
                                <option key={event.eventId} value={event.eventId}>
                                    {event.eventTitle}
                                </option>
                            ))}
                        </select>
                    </div>
                )}
            </div>

            {/* عرض الملخص - عرض تحليلات جميع الفعاليات */}
            {activeView === 'summary' && activeTab === 'performance' && (
                <>
                    <div className="stats-summary">
                        <div className="stat-card">
                            <h3>Total Events</h3>
                            <p>{eventAnalytics?.totalEvents || 0}</p>
                        </div>
                        <div className="stat-card">
                            <h3>Total Revenue</h3>
                            <p>${eventAnalytics?.totalRevenue?.toFixed(2) || '0.00'}</p>
                        </div>
                        <div className="stat-card">
                            <h3>Average Sales Rate</h3>
                            <p>{eventAnalytics?.averageSoldPercentage?.toFixed(1) || 0}%</p>
                        </div>
                    </div>

                    {hasEvents ? (
                        <>
                            <div className="chart-container">
                                <h2>Ticket Sales by Event</h2>
                                <ResponsiveContainer width="100%" height={300}>
                                    <BarChart
                                        data={eventAnalytics.events}
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

                            {hasPieData && (
                                <div className="chart-container">
                                    <h2>Sales Distribution</h2>
                                    <ResponsiveContainer width="100%" height={300}>
                                        <PieChart>
                                            <Pie
                                                data={pieChartData}
                                                cx="50%"
                                                cy="50%"
                                                labelLine={true}
                                                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                                                outerRadius={100}
                                                fill="#8884d8"
                                                dataKey="value"
                                                animationBegin={0}
                                                animationDuration={1500}
                                            >
                                                {pieChartData.map((entry, index) => (
                                                    <Cell
                                                        key={`cell-${index}`}
                                                        fill={COLORS[index % COLORS.length]}
                                                        stroke="#ffffff"
                                                        strokeWidth={2}
                                                    />
                                                ))}
                                            </Pie>
                                            <Tooltip formatter={(value) => [`${value} tickets`, 'Sold']} />
                                        </PieChart>
                                    </ResponsiveContainer>
                                </div>
                            )}

                            <div className="chart-container">
                                <h2>Events Performance</h2>
                                <div className="events-table enhanced-table">
                                    <table>
                                        <thead>
                                        <tr>
                                            <th>Event</th>
                                            <th>Tickets Sold</th>
                                            <th>Available</th>
                                            <th>Sales %</th>
                                            <th>Revenue</th>
                                            <th>Action</th>
                                        </tr>
                                        </thead>
                                        <tbody>
                                        {eventAnalytics.events.map(event => (
                                            <tr key={event.eventId}>
                                                <td className="event-title-cell">{event.eventTitle}</td>
                                                <td>{event.ticketsSold}</td>
                                                <td>{event.ticketsAvailable}</td>
                                                <td className={getPerformanceClass(event.percentageSold)}>
                                                    <div className="progress-container">
                                                        <div
                                                            className="progress-bar"
                                                            style={{width: `${Math.min(100, event.percentageSold)}%`}}
                                                        ></div>
                                                        <span>{event.percentageSold?.toFixed(1) || 0}%</span>
                                                    </div>
                                                </td>
                                                <td className={getRevenueClass(event.revenue)}>
                                                    ${event.revenue?.toFixed(2) || '0.00'}
                                                </td>
                                                <td>
                                                    <button
                                                        className="view-details-btn"
                                                        onClick={() => {
                                                            setSelectedEventId(event.eventId);
                                                            setActiveView('individual');
                                                        }}
                                                    >
                                                        View Details
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="no-events-message">
                            <p>No event data available. Create events and sell tickets to start seeing analytics.</p>
                        </div>
                    )}
                </>
            )}

            {/* عرض الملخص - عرض تحليلات الإيرادات */}
            {activeView === 'summary' && activeTab === 'revenue' && (
                <>
                    <div className="stats-summary">
                        <div className="stat-card">
                            <h3>Total Revenue</h3>
                            <p>${revenueAnalytics?.revenue?.total?.toFixed(2) || '0.00'}</p>
                        </div>
                        <div className="stat-card">
                            <h3>Total Fees</h3>
                            <p>${revenueAnalytics?.revenue?.fees?.toFixed(2) || '0.00'}</p>
                        </div>
                        <div className="stat-card">
                            <h3>Net Revenue</h3>
                            <p>${revenueAnalytics?.revenue?.net?.toFixed(2) || '0.00'}</p>
                        </div>
                    </div>

                    <div className="stats-summary">
                        <div className="stat-card">
                            <h3>Total Bookings</h3>
                            <p>{revenueAnalytics?.totalBookings || 0}</p>
                        </div>
                        <div className="stat-card">
                            <h3>Confirmed Bookings</h3>
                            <p>{revenueAnalytics?.bookingsByStatus?.confirmed || 0}</p>
                        </div>
                        <div className="stat-card">
                            <h3>Cancelled Bookings</h3>
                            <p>{revenueAnalytics?.bookingsByStatus?.cancelled || 0}</p>
                        </div>
                    </div>

                    {hasRevenueData ? (
                        <>
                            <div className="chart-container">
                                <h2>Revenue by Event</h2>
                                <ResponsiveContainer width="100%" height={300}>
                                    <BarChart
                                        data={revenueData}
                                        margin={{ top: 5, right: 30, left: 20, bottom: 80 }}
                                    >
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis
                                            dataKey="name"
                                            tick={{ fontSize: 12 }}
                                            interval={0}
                                            angle={-45}
                                            textAnchor="end"
                                        />
                                        <YAxis />
                                        <Tooltip formatter={(value) => [`$${value.toFixed(2)}`, 'Amount']} />
                                        <Legend />
                                        <Bar dataKey="revenue" name="Total Revenue" fill="#8884d8" />
                                        <Bar dataKey="fees" name="Fees" fill="#FF8042" />
                                        <Bar dataKey="net" name="Net Revenue" fill="#82ca9d" />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>

                            <div className="chart-container">
                                <h2>Monthly Revenue</h2>
                                <ResponsiveContainer width="100%" height={300}>
                                    <AreaChart
                                        data={revenueAnalytics?.monthlyStats || []}
                                        margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                                    >
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="month" />
                                        <YAxis />
                                        <Tooltip formatter={(value) => [`$${value.toFixed(2)}`, 'Revenue']}/>
                                        <Area type="monotone" dataKey="revenue" stroke="#8884d8" fill="#8884d8" />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>

                            <div className="chart-container">
                                <h2>Revenue Breakdown</h2>
                                <div className="events-table enhanced-table">
                                    <table>
                                        <thead>
                                        <tr>
                                            <th>Event</th>
                                            <th>Total Revenue</th>
                                            <th>Platform Fees</th>
                                            <th>Payment Fees</th>
                                            <th>Net Revenue</th>
                                            <th>Action</th>
                                        </tr>
                                        </thead>
                                        <tbody>
                                        {revenueData.map((event, index) => (
                                            <tr key={index}>
                                                <td className="event-title-cell">{event.name}</td>
                                                <td className="revenue-total">${event.revenue.toFixed(2)}</td>
                                                <td>${(event.fees * 0.7).toFixed(2)}</td>
                                                <td>${(event.fees * 0.3).toFixed(2)}</td>
                                                <td className="revenue-net">${event.net.toFixed(2)}</td>
                                                <td>
                                                    <button
                                                        className="view-details-btn"
                                                        onClick={() => {
                                                            // البحث عن معرف الفعالية بناءً على الاسم
                                                            const matchingEvent = eventAnalytics.events.find(
                                                                e => e.eventTitle === event.name
                                                            );
                                                            if (matchingEvent) {
                                                                setSelectedEventId(matchingEvent.eventId);
                                                                setActiveView('individual');
                                                            }
                                                        }}
                                                    >
                                                        View Details
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="no-events-message">
                            <p>No revenue data available. Sell tickets to start seeing revenue analytics.</p>
                        </div>
                    )}
                </>
            )}

            {/* عرض الفعالية الفردية - تفاصيل حول فعالية محددة */}
            {activeView === 'individual' && selectedEventId && (
                <div className="individual-event-analytics">
                    {!individualEventData ? (
                        <div className="loading">Loading event details...</div>
                    ) : (
                        <>
                            {/* معلومات الفعالية المحددة */}
                            <div className="event-header-card">
                                <div className="event-details">
                                    <h3>{individualEventData.event.title || 'Event Title'}</h3>
                                    <div className="event-date">
                                        {new Date(individualEventData.event.date).toLocaleDateString()}
                                    </div>
                                    <div className="event-location">
                                        {individualEventData.event.location || 'No location specified'}
                                    </div>
                                </div>

                                {/* إحصائيات أساسية للفعالية */}
                                <div className="event-stats">
                                    <div className="stat">
                                        <div className="stat-label">Total Tickets</div>
                                        <div className="stat-value">{individualEventData.event.totalTickets || 0}</div>
                                    </div>
                                    <div className="stat">
                                        <div className="stat-label">Tickets Sold</div>
                                        <div className="stat-value">{individualEventData.totalTicketsSold || 0}</div>
                                    </div>
                                    <div className="stat">
                                        <div className="stat-label">Available</div>
                                        <div className="stat-value">{individualEventData.event.remainingTickets || 0}</div>
                                    </div>
                                    <div className="stat">
                                        <div className="stat-label">Revenue</div>
                                        <div className="stat-value">${individualEventData.totalRevenue?.toFixed(2) || '0.00'}</div>
                                    </div>
                                </div>
                            </div>

                            {/* رسوم بيانية للفعالية الفردية */}
                            <div className="stats-grid">
                                {/* رسم بياني خطي لمبيعات التذاكر عبر الوقت */}
                                <div className="chart-container">
                                    <h2>Ticket Sales Over Time</h2>
                                    <ResponsiveContainer width="100%" height={300}>
                                        <LineChart
                                            data={individualEventData.bookingsByDate}
                                            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                                        >
                                            <CartesianGrid strokeDasharray="3 3" />
                                            <XAxis dataKey="date" />
                                            <YAxis />
                                            <Tooltip />
                                            <Legend />
                                            <Line
                                                type="monotone"
                                                dataKey="tickets"
                                                name="Tickets Sold"
                                                stroke="#8884d8"
                                                activeDot={{ r: 8 }}
                                            />
                                        </LineChart>
                                    </ResponsiveContainer>
                                </div>

                                {/* رسم بياني للإيرادات عبر الوقت */}
                                <div className="chart-container">
                                    <h2>Revenue Over Time</h2>
                                    <ResponsiveContainer width="100%" height={300}>
                                        <AreaChart
                                            data={individualEventData.bookingsByDate}
                                            margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                                        >
                                            <CartesianGrid strokeDasharray="3 3" />
                                            <XAxis dataKey="date" />
                                            <YAxis />
                                            <Tooltip formatter={(value) => [`$${value.toFixed(2)}`, 'Revenue']} />
                                            <Area
                                                type="monotone"
                                                dataKey="revenue"
                                                stroke="#82ca9d"
                                                fill="#82ca9d"
                                            />
                                        </AreaChart>
                                    </ResponsiveContainer>
                                </div>

                                {/* رسم بياني دائري للمبيعات */}
                                <div className="chart-container">
                                    <h2>Ticket Sales Status</h2>
                                    <ResponsiveContainer width="100%" height={300}>
                                        <PieChart>
                                            <Pie
                                                data={[
                                                    { name: 'Sold', value: individualEventData.totalTicketsSold },
                                                    { name: 'Available', value: individualEventData.event.remainingTickets }
                                                ]}
                                                cx="50%"
                                                cy="50%"
                                                labelLine={true}
                                                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                                                outerRadius={100}
                                                fill="#8884d8"
                                                dataKey="value"
                                            >
                                                <Cell fill="#8884d8" />
                                                <Cell fill="#82ca9d" />
                                            </Pie>
                                            <Tooltip formatter={(value) => [`${value} tickets`, '']} />
                                        </PieChart>
                                    </ResponsiveContainer>
                                </div>

                                {/* قائمة الحجوزات الأخيرة */}
                                <div className="chart-container">
                                    <h2>Recent Bookings</h2>
                                    <div className="bookings-table enhanced-table">
                                        <table>
                                            <thead>
                                            <tr>
                                                <th>Date</th>
                                                <th>Tickets</th>
                                                <th>Total</th>
                                                <th>Status</th>
                                            </tr>
                                            </thead>
                                            <tbody>
                                            {individualEventData.bookings
                                                .slice(0, 5) // أحدث 5 حجوزات فقط
                                                .map((booking, index) => (
                                                    <tr key={index}>
                                                        <td>
                                                            {booking.createdAt
                                                                ? new Date(booking.createdAt).toLocaleDateString()
                                                                : 'No date'
                                                            }
                                                        </td>
                                                        <td>{booking.numberOfTickets}</td>
                                                        <td>${booking.totalPrice?.toFixed(2) || '0.00'}</td>
                                                        <td className={`status-${booking.status?.toLowerCase() || 'confirmed'}`}>
                                                            {booking.status || 'Confirmed'}
                                                        </td>
                                                    </tr>
                                                ))
                                            }
                                            {individualEventData.bookings.length === 0 && (
                                                <tr>
                                                    <td colSpan="4">No bookings found for this event</td>
                                                </tr>
                                            )}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            )}

            <div className="event-actions">
                <button onClick={() => navigate('/my-events')} className="back-button">
                    Back to My Events
                </button>
                <button onClick={fetchData} className="refresh-button">
                    Refresh Data
                </button>
            </div>
        </div>
    );
};

export default EventAnalytics;