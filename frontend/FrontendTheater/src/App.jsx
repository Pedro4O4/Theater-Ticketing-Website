// src/App.jsx
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./auth/AuthContext";
import LoginForm from "./components/LoginForm";
import RegisterForm from "./components/RegisterForm";
import Layout from "./components/Layout";
import './styles.css';
import ForgotPasswordForm from "./components/ForgotPasswordForm.jsx";

function App() {
    return (
        <AuthProvider>
            <BrowserRouter>
                <Routes>
                    <Route path="/login" element={<LoginForm />} />
                    <Route path="/register" element={<RegisterForm />} />
                    <Route path= "/forgot-password" element={<ForgotPasswordForm />} />
                    <Route path="/" element={<Layout />}>
                        <Route index element={<h1>Welcome to the Event Portal</h1>} />
                        <Route path="users" element={<h1>Users Page</h1>} />
                        <Route path="adm" element={<h1>Admin Page</h1>} />
                        <Route path="org" element={<h1>Organizer Page</h1>} />
                    </Route>
                    <Route path="*" element={<Navigate to="/login" replace />} />
                </Routes>
            </BrowserRouter>
        </AuthProvider>
    );
}

export default App;