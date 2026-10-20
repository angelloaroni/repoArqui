// src/components/OAuthSuccess/OAuthSuccess.jsx

import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useUser } from '../../context/UserContext';
import { jwtDecode } from 'jwt-decode';
import './OAuthSuccess.css';

function OAuthSuccess() {

  const [searchParams] = useSearchParams();

  const navigate = useNavigate();

  const {
    user,
    loginWithToken
  } = useUser();

  useEffect(() => {

    const token = searchParams.get('token');

    if (token) {

      try {

        // Guardamos la sesión en el Context
        if (loginWithToken) {
          loginWithToken(token);
        }

        // Decodificamos el JWT
        const decodedUser = jwtDecode(token);

        // ===========================
        // Normalización de campos
        // ===========================

        const telefono =
          decodedUser.phone ||
          decodedUser.telefono;

        const documento =
          decodedUser.document_id ||
          decodedUser.dni;

        const licencia =
          decodedUser.driver_license ||
          decodedUser.licencia;

        // ===========================
        // Validación de perfil
        // ===========================

        const tienePerfilIncompleto =
          !documento ||
          !telefono ||
          !licencia;

        if (tienePerfilIncompleto) {

          navigate(
            '/usuario/onboarding',
            {
              replace: true
            }
          );

        } else {

          navigate(
            '/home',
            {
              replace: true
            }
          );

        }

      } catch (error) {

        console.error(
          '❌ Error procesando OAuth:',
          error
        );

        navigate(
          '/login?error=invalid_token',
          {
            replace: true
          }
        );

      }

    } else {

      if (user) {

        const telefono =
          user.phone ||
          user.telefono;

        const documento =
          user.document_id ||
          user.dni;

        const licencia =
          user.driver_license ||
          user.licencia;

        const tienePerfilIncompleto =
          !documento ||
          !telefono ||
          !licencia;

        if (tienePerfilIncompleto) {

          navigate(
            '/usuario/onboarding',
            {
              replace: true
            }
          );

        } else {

          navigate(
            '/home',
            {
              replace: true
            }
          );

        }

      } else {

        navigate(
          '/login?error=no_token',
          {
            replace: true
          }
        );

      }

    }

  }, [
    searchParams,
    navigate,
    user,
    loginWithToken
  ]);

  return (

    <div className="oauth-loading-container">

      <div className="spinner"></div>

      <h2>
        Conectando con DriveShare...
      </h2>

      <p>
        Estamos validando tus credenciales de Google de forma segura.
      </p>

    </div>

  );

}

export default OAuthSuccess;