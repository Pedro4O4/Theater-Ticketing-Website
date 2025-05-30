import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import { toast } from "react-toastify";
import './LoginForm.css';
import tailwindConfig from "../../../tailwind.config.js";

export default function LoginForm() {
    const [formData, setFormData] = useState({
        email: "",
        password: ""
    });
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const { login } = useAuth();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            const result = await login(formData);


                // Redirect based on user role
                // In LoginForm.jsx, update the login success handler:
                if (result.success) {
                    toast.success("Login successful!");

                    // Redirect based on user role
                        console.log("Successfully logged in admin");
                        console.log(result.user.role);
                        navigate("/events");


                }
            else {
                    toast.error(result.error || "Login failed");
            }
        } catch (err) {
            toast.error("An unexpected error occurred");
            console.error(err);
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
                <h1 className="login-title">Welcome Back</h1>

                {error && <div className="error-message">{error}</div>}

                <form onSubmit={handleSubmit}>
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
                                value={formData.email}
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
                                placeholder="Enter your password"
                                className="form-input"
                                value={formData.password}
                                onChange={handleChange}
                                required
                            />
                            <i className="input-icon fas fa-lock"></i>
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
                                Signing In...
                            </>
                        ) : (
                            <>Sign In</>
                        )}
                    </button>
                </form>

                <div className="redirect-link">
                    <div>Don't have an account? <Link to="/register">Register</Link></div>
                    <div>Forgot your password? <Link to="/forgot-password">Reset Password</Link></div>
                </div>
            </div>
        </div>
    );
}