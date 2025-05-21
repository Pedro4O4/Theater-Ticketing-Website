import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";

export default function LoginForm() {
    const { login } = useAuth();
    const navigate = useNavigate();
    const [form, setForm] = useState({ email: "", password: "" });

    const handleSubmit = async (e) => {
        e.preventDefault();
        const success = await login(form);
        if (success) navigate("/");
    };

    return (
        <form onSubmit={handleSubmit} className="max-w-sm mx-auto mt-20 space-y-4">
            <h1>Welcome Please Login</h1>
            <br/>
            <label>Email  </label>
            <br/>
            <input
                type="email"
                placeholder="Email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="border p-2 w-full"
            />
            <br/>
            <p>password </p>
            <input
                type="password"
                placeholder="Password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                className="border p-2 w-full"
            />
            <br/>
            <br/>
            <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">
                Login
            </button>
            <br/>

            <button onClick={()=>navigate('/register')} className="bg-blue-600 text-white px-4 py-2 rounded">
                Register
            </button>
        </form>
    );
}