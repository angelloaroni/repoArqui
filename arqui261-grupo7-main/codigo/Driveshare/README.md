# DriveShare

DriveShare es una aplicación web para el alquiler de vehículos entre particulares, desarrollada con una arquitectura basada en servicios y contenedores Docker.

## Tecnologías utilizadas

### Frontend
- React
- Vite
- CSS

### Backend
- Node.js
- Express
- Sequelize
- Passport.js
- JWT

### Base de datos
- PostgreSQL

### Infraestructura
- Docker
- Docker Compose
- HashiCorp Vault

### Seguridad
- Google OAuth 2.0
- JWT
- RSA
- bcrypt

### Patrones implementados
- Arquitectura en Capas
- SOA (REST)
- Sidecar (Auditoría)

---

# Ejecución del proyecto

Levantar todos los servicios:

```bash
docker compose up --build
```

Servicios disponibles:

| Servicio | URL / Puerto |
|----------|--------------|
| Frontend | http://localhost:5173 |
| Backend | http://localhost:3000 |
| PostgreSQL | localhost:5439 |
| pgAdmin | http://localhost:5059 |
| Vault | http://localhost:8200 |
| Audit Sidecar | http://localhost:4000 |

---

# Acceso a PostgreSQL

La base de datos puede administrarse desde pgAdmin.

## Datos de acceso a pgAdmin

Email

```
admin@driveshare.com
```

Contraseña

```
admin123
```

## Registro del servidor

Host

```
postgres
```

Puerto

```
5432
```

Base de datos

```
driveshare
```

Usuario

```
postgres
```

Contraseña

```
123456
```

> Si se desea acceder desde una herramienta instalada en el equipo (DBeaver, DataGrip, etc.), utilizar:

Host

```
localhost
```

Puerto

```
5439
```

---

# Seguridad implementada

## Autenticación

- Inicio de sesión mediante correo y contraseña.
- Inicio de sesión mediante Google OAuth.
- Tokens JWT para autenticación.

## Protección de contraseñas

Las contraseñas nunca se almacenan en texto plano.

Se utiliza:

- bcrypt

---

# Cifrado RSA

DriveShare utiliza cifrado RSA para proteger información sensible antes de almacenarla en PostgreSQL.

Los datos cifrados son:

- Documento de identidad (DNI)
- Número de teléfono
- Número de licencia de conducir

Las llaves RSA son administradas mediante HashiCorp Vault y los datos son descifrados únicamente cuando son necesarios para el usuario autenticado.

---

# Auditoría (Sidecar)

El proyecto implementa un Sidecar independiente para registrar eventos de auditoría sin acoplar la lógica al Backend principal.

Eventos registrados:

- REGISTER
- VERIFY_ACCOUNT
- LOGIN
- REGISTER_GOOGLE
- LOGIN_GOOGLE
- UPDATE_PROFILE
- CHANGE_PASSWORD
- REQUEST_PASSWORD_RESET
- RESET_PASSWORD
- DELETE_ACCOUNT

Toda la información de auditoría se almacena en la tabla:

```
AUDIT_LOG
```

---

# Estructura de contenedores

- driveshare-frontend
- driveshare-backend
- driveshare-db
- driveshare-pgadmin
- driveshare-vault
- driveshare-audit

Todos los servicios son orquestados mediante Docker Compose.

---

