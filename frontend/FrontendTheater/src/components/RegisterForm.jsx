import { useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { useNavigate, Link } from "react-router-dom";
import "./RegisterForm.css";

export default function RegisterForm() {
    const [form, setForm] = useState({
        name: "",
        email: "",
        password: "",
        role: "Standard User",
    });
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await axios.post("http://localhost:3000/api/v1/register", form);
            toast.success("Registration successful! Redirecting to login...");
            setTimeout(() => navigate('/login'), 2000);
        } catch (err) {
            const errorMessage = err.response?.data?.message || "Registration failed. Please try again.";
            toast.error(errorMessage);
        } finally {
            setLoading(false);
        }
    };


    return (
        <div className="register-container">
            <div className="background-shapes">
                <div className="shape shape-1"></div>
                <div className="shape shape-2"></div>
                <div className="shape shape-3"></div>
            </div>
            <div className="register-card">
                <div className="card-decoration"></div>
                <h1 className="register-title">Join the Theater</h1>

                {message && (
                    <div className={message.includes("successful") ? "success-message" : "error-box"}>
                        {message}
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label className="form-label">
                            <span className="label-text">Full Name</span>
                        </label>
                        <div className="input-container">
                            <input
                                type="text"
                                placeholder="Enter your full name"
                                className="form-input"
                                value={form.name}
                                onChange={(e) => setForm({ ...form, name: e.target.value })}
                                required
                            />
                            <i className="input-icon fas fa-user"></i>
                        </div>
                    </div>

                    <div className="form-group">
                        <label className="form-label">
                            <span className="label-text">Email Address</span>
                        </label>
                        <div className="input-container">
                            <i className="input-icon fas fa-envelope"></i>
                            <input
                                type="email"
                                placeholder="Enter your email"
                                className="form-input"
                                value={form.email}
                                onChange={(e) => setForm({ ...form, email: e.target.value })}
                                required
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <label className="form-label">
                            <span className="label-text">Password</span>
                        </label>
                        <div className="input-container">
                            <i className="input-icon fas fa-lock"></i>
                            <input
                                type="password"
                                placeholder="Create a secure password"
                                className="form-input"
                                value={form.password}
                                onChange={(e) => setForm({ ...form, password: e.target.value })}
                                required
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <label className="form-label">
                            <span className="label-text">Account Type</span>
                        </label>
                        <div className="input-container">
                            <i className="input-icon fas fa-user-tag"></i>
                            <select
                                value={form.role}
                                onChange={(e) => setForm({ ...form, role: e.target.value })}
                                className="form-input"
                            >
                                <option value="Standard User">Standard User</option>
                                <option value="Organizer">Organizer</option>
                            </select>
                        </div>
                    </div>

                    <button
                        type="submit"
                        className="btn-primary"
                        disabled={loading}
                    >
                        {loading ? (
                            <>
                                <span className="form-loader"></span>
                                Creating Account...
                            </>
                        ) : (
                            <>Join Now</>
                        )}
                    </button>
                </form>

                <div className="redirect-link">
                    Already part of our community? <Link to="/login">Sign In</Link>
                </div>
            </div>
        </div>
    );
}