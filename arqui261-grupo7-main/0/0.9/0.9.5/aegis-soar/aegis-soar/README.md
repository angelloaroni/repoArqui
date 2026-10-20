# AegisSOAR

AegisSOAR es una aplicación web académica que simula una plataforma SOAR
(Security Orchestration, Automation and Response). Permite registrar eventos de
seguridad, crear incidentes, ejecutar Playbooks y consultar las acciones de
contención almacenadas localmente.

> Todas las detecciones, automatizaciones y acciones de bloqueo son simuladas.
> El proyecto no modifica usuarios, redes ni sistemas reales.

## Tecnologías

- Frontend: React, Vite, JavaScript, CSS y Fetch API.
- Backend: Node.js, Express, JavaScript, CORS y `better-sqlite3`.
- Datos: SQLite, sin ORM.

## Estructura

```text
aegis-soar/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── styles.css
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
├── backend/
│   ├── src/
│   │   ├── database/
│   │   ├── routes/
│   │   ├── services/
│   │   ├── app.js
│   │   └── server.js
│   ├── .env.example
│   └── package.json
├── .gitignore
└── README.md
```

## Login de demostración

- Usuario: `admin`
- Contraseña: `admin123`

El acceso solo guarda un indicador en `localStorage`; no es autenticación real.

## Escenarios disponibles

1. **Fuerza bruta:** crea cinco eventos `LOGIN_FAILED`, un incidente `HIGH`,
   bloquea al usuario `demo.user` y la IP `192.168.1.50`.
2. **SQL Injection:** crea un evento, un incidente `CRITICAL`, bloquea la IP
   `10.0.0.25` y registra evidencia.
3. **SQL Injection sin Playbook:** desactiva el Playbook correspondiente y
   registra el evento sin crear incidente ni bloqueo.

Los Playbooks pueden activarse o desactivarse desde su pantalla y el cambio se
conserva en SQLite.

## Endpoints

| Método | Endpoint | Descripción |
| --- | --- | --- |
| GET | `/api/dashboard` | Estadísticas y registros recientes |
| GET | `/api/events` | Lista de eventos |
| POST | `/api/events/brute-force` | Simula fuerza bruta |
| POST | `/api/events/sql-injection` | Simula SQL Injection |
| POST | `/api/events/sql-injection-disabled` | Simula SQL Injection sin Playbook |
| GET | `/api/incidents` | Lista de incidentes |
| GET | `/api/playbooks` | Lista de Playbooks |
| PATCH | `/api/playbooks/:id/toggle` | Activa o desactiva un Playbook |
| GET | `/api/blocked-users` | Usuarios bloqueados |
| GET | `/api/blocked-ips` | Direcciones IP bloqueadas |
| GET | `/api/actions` | Historial de acciones |
| DELETE | `/api/demo/reset` | Limpia los datos de demostración |

