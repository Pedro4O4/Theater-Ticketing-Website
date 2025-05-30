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
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            await axios.post("http://localhost:3000/api/v1/register", form);
            toast.success("Registration successful! Redirecting to login...");
            setTimeout(() => navigate('/login'), 2000);
        } catch (err) {
            const errorMessage = err.response?.data?.message || "Registration failed. Please try again.";
            setError(errorMessage);
            toast.error(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-container">
            <div className="background-shapes">
                <div className="shape shape-1"></div>
                <div className="shape shape-2"></div>
                <div className="shape shape-3"></div>
            </div>
            <div className="login-card">
                <div className="card-decoration"></div>
                <h1 className="login-title">Join the Theater</h1>

                {error && <div className="error-message">{error}</div>}

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label className="form-label">
                            <span className="label-text">Full Name</span>
                        </label>
                        <div className="input-container">
                            <input
                                type="text"
                                name="name"
                                placeholder="Enter your full name"
                                className="form-input"
                                value={form.name}
                                onChange={handleChange}
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
                            <input
                                type="email"
                                name="email"
                                placeholder="Enter your email"
                                className="form-input"
                                value={form.email}
                                onChange={handleChange}
                                required
                            />
                            <i className="input-icon fas fa-envelope"></i>
                        </div>
                    </div>

                    <div className="form-group">
                        <label className="form-label">
                            <span className="label-text">Password</span>
                        </label>
                        <div className="input-container">
                            <input
                                type="password"
                                name="password"
                                placeholder="Create a secure password"
                                className="form-input"
                                value={form.password}
                                onChange={handleChange}
                                required
                            />
                            <i className="input-icon fas fa-lock"></i>
                        </div>
                    </div>

                    <div className="form-group">
                        <label className="form-label">
                            <span className="label-text">Account Type</span>
                        </label>
                        <div className="input-container">
                            <select
                                name="role"
                                value={form.role}
                                onChange={handleChange}
                                className="form-input"
                            >
                                <option value="Standard User">Standard User</option>
                                <option value="Organizer">Organizer</option>
                            </select>
                            <i className="input-icon fas fa-user-tag"></i>
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
                    <div>Already part of our community? <Link to="/login">Sign In</Link></div>
                </div>
            </div>
        </div>
    );
}