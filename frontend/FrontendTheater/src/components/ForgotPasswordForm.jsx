import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import "./ForgotPasswordForm.css";

export default function ForgotPasswordForm() {
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");
    const [isSuccess, setIsSuccess] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage("");

        try {
            // Replace with your actual forgot password endpoint
            await axios.post("http://localhost:5000/api/v1/forgot-password", { email });
            setIsSuccess(true);
            setMessage("Reset link sent to your email. Please check your inbox.");
            setTimeout(() => {
                navigate("/login");
            }, 3000);
        } catch (err) {
            setIsSuccess(false);
            setMessage(err.response?.data?.message || "Failed to send reset link. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="forgot-password-container">
            <div className="forgot-password-card">
                <h1 className="forgot-password-title">Reset Your Password</h1>
                <p className="forgot-password-subtitle">
                    Enter your email address and we'll send you instructions to reset your password.
                </p>

                {message && (
                    <div className={isSuccess ? "success-message" : "error-box"}>
                        {message}
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label className="form-label">Email Address</label>
                        <input
                            type="email"
                            placeholder="Enter your registered email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="form-input"
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        className="btn-primary"
                        disabled={loading}
                    >
                        {loading ? "Sending..." : "Send Reset Link"}
                    </button>
                </form>

                <div className="redirect-link">
                    Remember your password? <Link to="/login">Back to Login</Link>
                </div>
            </div>
        </div>
    );
}