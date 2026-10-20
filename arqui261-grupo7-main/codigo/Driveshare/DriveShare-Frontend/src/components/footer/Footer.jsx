// src/components/footer/Footer.jsx

import React from 'react';

const Footer = () => {
  return (
    <footer className="bg-gray-950 text-white py-10">

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">

          {/* Redes Sociales */}
          <div>

            <h3 className="text-lg font-semibold mb-4">
              Síguenos
            </h3>

            <div className="flex space-x-4">

              <a
                href="https://www.facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Facebook"
              >
                <img
                  src="https://upload.wikimedia.org/wikipedia/commons/thumb/c/cd/Facebook_logo_%28square%29.png/960px-Facebook_logo_%28square%29.png"
                  alt="Facebook"
                  className="w-10 h-10 hover:opacity-70 hover:scale-110 transition-all duration-200"
                />
              </a>

              <a
                href="https://x.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="X"
              >
                <img
                  src="https://img.freepik.com/vector-gratis/nuevo-diseno-icono-x-logotipo-twitter-2023_1017-45418.jpg?semt=ais_hybrid&w=740&q=80"
                  alt="X"
                  className="w-10 h-10 hover:opacity-70 hover:scale-110 transition-all duration-200"
                />
              </a>

              <a
                href="https://www.instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
              >
                <img
                  src="https://upload.wikimedia.org/wikipedia/commons/a/a5/Instagram_icon.png"
                  alt="Instagram"
                  className="w-10 h-10 hover:opacity-70 hover:scale-110 transition-all duration-200"
                />
              </a>

              <a
                href="https://www.tiktok.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="TikTok"
              >
                <img
                  src="https://upload.wikimedia.org/wikipedia/commons/a/a6/Tiktok_icon.svg"
                  alt="TikTok"
                  className="w-10 h-10 hover:opacity-70 hover:scale-110 transition-all duration-200"
                />
              </a>

            </div>

          </div>

          {/* DriveShare */}
          <div>

            <h3 className="text-lg font-semibold mb-4">
              DriveShare
            </h3>

            <ul className="space-y-2 text-sm text-gray-300">

              <li className="hover:text-green-400 transition-colors cursor-pointer">
                Conócenos
              </li>

              <li className="hover:text-green-400 transition-colors cursor-pointer">
                Vehículos disponibles
              </li>

              <li className="hover:text-green-400 transition-colors cursor-pointer">
                Cómo funciona
              </li>

            </ul>

          </div>

          {/* Atención */}
          <div>

            <h3 className="text-lg font-semibold mb-4">
              Atención al cliente
            </h3>

            <ul className="space-y-2 text-sm text-gray-300">

              <li className="hover:text-green-400 transition-colors cursor-pointer">
                Atención al cliente
              </li>

              <li className="hover:text-green-400 transition-colors cursor-pointer">
                Horarios de atención
              </li>

              <li className="hover:text-green-400 transition-colors cursor-pointer">
                Preguntas frecuentes
              </li>

            </ul>

          </div>

          {/* Políticas */}
          <div>

            <h3 className="text-lg font-semibold mb-4">
              Políticas y condiciones
            </h3>

            <ul className="space-y-2 text-sm text-gray-300">

              <li className="hover:text-green-400 transition-colors cursor-pointer">
                Políticas de datos personales
              </li>

              <li className="hover:text-green-400 transition-colors cursor-pointer">
                Seguridad y confianza
              </li>

              <li className="hover:text-green-400 transition-colors cursor-pointer">
                Términos y condiciones
              </li>

            </ul>

          </div>

        </div>

        <div className="border-t border-gray-800 mt-8 pt-6 text-center text-sm text-gray-400">

          © 2026 DriveShare. Todos los derechos reservados.

        </div>

      </div>

    </footer>
  );
};

export default Footer;