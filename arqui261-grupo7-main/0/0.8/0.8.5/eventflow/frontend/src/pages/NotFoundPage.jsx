import { Link } from 'react-router-dom';

export default function NotFoundPage() {
  return (
    <section className="card not-found">
      <span aria-hidden="true">404</span>
      <h1>Página no encontrada</h1>
      <p>La sección solicitada no forma parte del recorrido académico de EventFlow.</p>
      <Link className="button button-primary" to="/">
        Volver al inicio
      </Link>
    </section>
  );
}

