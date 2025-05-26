import { useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import './ForgotPasswordForm.css';
const ForgotPasswordForm = () => {
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [step, setStep] = useState(1);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);

    const handleRequestOtp = async (e) => {
        e.preventDefault();
        if (!email) {
            setError('Email is required');
            return;
        }

        setLoading(true);
        setError('');

        try {
            const response = await axios.put(
                `${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/forgetPassword`,
                { email }
            );

            setSuccess(response.data.message || 'Verification code sent to your email');
            setStep(2);
        } catch (err) {
            console.error('Error:', err.response?.data || err.message);
            setError(err.response?.data?.message || 'Failed to send OTP. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleResetPassword = async (e) => {
        e.preventDefault();

        if (!otp || !newPassword || !confirmPassword) {
            setError('All fields are required');
            return;
        }

        if (newPassword !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        setLoading(true);
        setError('');

        try {
            const response = await axios.post(
                `${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/verify-otp`,
                { email, otp, newPassword }
            );

            setSuccess(response.data.message || 'Password reset successfully');
            setTimeout(() => {
                window.location.href = '/login';
            }, 2000);
        } catch (err) {
            console.error('Error:', err.response?.data || err.message);
            setError(err.response?.data?.message || 'Failed to reset password. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-container">
            <div className="login-card">
                <h2 className="login-title">Reset Password</h2>
                {step === 1 ? (
                    <p className="redirect-link">
                        Enter your email address to receive a verification code.
                    </p>
                ) : (
                    <p className="redirect-link">
                        Enter the verification code sent to your email and your new password.
                    </p>
                )}

                {error && <div className="error-message">{error}</div>}
                {success && <div className="success-message">{success}</div>}

                {step === 1 ? (
                    <form onSubmit={handleRequestOtp}>
                        <div className="form-group">
                            <label htmlFor="email" className="form-label">Email Address</label>
                            <input
                                type="email"
                                id="email"
                                className="form-input"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>

                        <button
                            type="submit"
                            className="btn-primary"
                            disabled={loading}
                        >
                            {loading ? 'Sending...' : 'Send Reset Code'}
                        </button>
                    </form>
                ) : (
                    <form onSubmit={handleResetPassword}>
                        <div className="form-group">
                            <label htmlFor="otp" className="form-label">Verification Code</label>
                            <input
                                type="text"
                                id="otp"
                                className="form-input"
                                value={otp}
                                onChange={(e) => setOtp(e.target.value)}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="newPassword" className="form-label">New Password</label>
                            <input
                                type="password"
                                id="newPassword"
                                className="form-input"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="confirmPassword" className="form-label">Confirm New Password</label>
                            <input
                                type="password"
                                id="confirmPassword"
                                className="form-input"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                required
                            />
                        </div>

                        <button
                            type="submit"
                            className="btn-primary"
                            disabled={loading}
                        >
                            {loading ? 'Resetting...' : 'Reset Password'}
                        </button>
                    </form>
                )}

                <div className="redirect-link">
                    <Link to="/login">Return to Login</Link>
                </div>
            </div>
        </div>
    );
};

export default ForgotPasswordForm;