import { useState } from 'react';
import { announceDataChange, api } from '../services/api.js';

export default function DemoControls() {
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  async function run(action) {
    setBusy(true);
    setMessage('');
    setError('');
    try {
      const response = await action();
      setMessage(response.message);
      announceDataChange();
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setBusy(false);
    }
  }

  function reset() {
    const confirmed = window.confirm(
      '¿Desea restablecer la demostración? Se eliminarán los eventos de prueba y los suscriptores agregados manualmente.',
    );
    if (confirmed) {
      run(api.resetDemo);
    }
  }

  return (
    <section className="demo-controls" aria-labelledby="demo-mode-title">
      <h2 id="demo-mode-title">Modo demostración</h2>
      <div className="demo-actions">
        <button
          type="button"
          className="button button-light"
          disabled={busy}
          onClick={() => run(api.seedDemo)}
        >
          Cargar datos de ejemplo
        </button>
        <button
          type="button"
          className="button button-outline-light"
          disabled={busy}
          onClick={reset}
        >
          Restablecer demostración
        </button>
      </div>
      {busy && <p className="demo-feedback">Procesando operación…</p>}
      {message && <p className="demo-feedback demo-success">{message}</p>}
      {error && <p className="demo-feedback demo-error">{error}</p>}
    </section>
  );
}
