import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Login.css";

function Login() {

    const navigate = useNavigate();

    const [email, setEmail] = useState("");

    const [password, setPassword] = useState("");

    const [error, setError] = useState("");

    function handleLogin(e) {

        e.preventDefault();

        if (
            email === "admin@demo.com" &&
            password === "admin123"
        ) {

            localStorage.setItem("demo-auth", "true");

            navigate("/dashboard");

            return;

        }

        setError("Invalid demo credentials.");

    }

    return (

        <div className="login">

            <form
                className="login-card"
                onSubmit={handleLogin}
            >

                <h1>

                    DriveShare Demo Environment

                </h1>

                <p>

                    Demonstration Environment

                </p>

                <label>

                    Email

                </label>

                <input
                    type="email"
                    placeholder="admin@demo.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                />

                <label>

                    Password

                </label>

                <input
                    type="password"
                    placeholder="********"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />

                {

                    error &&

                    <span className="error">

                        {error}

                    </span>

                }

                <button
                    type="submit"
                >

                    Sign In

                </button>

                <div className="demo-info">

                    <strong>

                        Demo Credentials

                    </strong>

                    <span>

                        admin@demo.com

                    </span>

                    <span>

                        admin123

                    </span>

                </div>

            </form>

        </div>

    );

}

export default Login;