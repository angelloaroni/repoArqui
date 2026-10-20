import { useState } from "react";
import { Icon } from "../components/Icons.jsx";

export default function LoginPage({ onLogin }) {
  const [form, setForm] = useState({ username: "", password: "" });
  const [error, setError] = useState("");

  function submit(event) {
    event.preventDefault();
    if (form.username === "admin" && form.password === "admin123") {
      onLogin();
      return;
    }
    setError("Usuario o contraseña incorrectos.");
  }

  return (
    <div className="login">
      <div className="login__glow login__glow--one" />
      <div className="login__glow login__glow--two" />
      <section className="login-card">
        <div className="login-brand"><span><Icon name="shield" size={33} /></span></div>
        <p className="eyebrow">SECURITY OPERATIONS</p>
        <h1>Bienvenido a <em>AegisSOAR</em></h1>
        <p className="login-card__lead">Automatización inteligente para la respuesta ante incidentes de seguridad.</p>
        <form onSubmit={submit}>
          <label>
            Usuario
            <input
              value={form.username}
              onChange={(event) => setForm({ ...form, username: event.target.value })}
              placeholder="Ingresa tu usuario"
              autoComplete="username"
            />
          </label>
          <label>
            Contraseña
            <input
              type="password"
              value={form.password}
              onChange={(event) => setForm({ ...form, password: event.target.value })}
              placeholder="Ingresa tu contraseña"
              autoComplete="current-password"
            />
          </label>
          {error && <div className="form-error">{error}</div>}
          <button className="button button--primary button--full" type="submit">
            Acceder a la plataforma <Icon name="chevron" size={17} />
          </button>
        </form>
        <div className="demo-access"><span>Acceso de demostración</span><code>admin / admin123</code></div>
      </section>
      <footer className="login__footer">Entorno académico · Todas las respuestas son simuladas</footer>
    </div>
  );
}

