workspace "DriveShare" "Diagrama de Componentes - API DriveShare" {

    model {

        arrendador = person "Arrendador" "Publica vehículos y administra reservas"

        arrendatario = person "Arrendatario" "Busca vehículos, realiza reservas y pagos"

        googleOAuth = softwareSystem "Google OAuth" "Autenticación mediante cuentas Google"

        minio = softwareSystem "MinIO" "Almacenamiento de imágenes"

        resend = softwareSystem "Resend" "Servicio de correo electrónico"

        paymentGateway = softwareSystem "Payment Gateway" "Procesamiento de pagos"

        vault = softwareSystem "HashiCorp Vault" "Gestión de secretos"

        driveshare = softwareSystem "DriveShare" {

            webapp = container "Aplicación Web" "Interfaz web para arrendadores y arrendatarios." "React + Vite"

            api = container "API REST" "Backend principal de la plataforma. Gestiona usuarios, catálogo, reservas y reseñas." "Node.js + Express" {

                middlewareJWT = component "Middleware JWT" "Valida autenticación y autorización mediante JWT."

                publicRoutes = component "Rutas Públicas" "Registro, inicio de sesión y recuperación de contraseña."

                userModule = component "Módulo Usuarios" "Gestión de usuarios, perfiles y autenticación."

                vehicleModule = component "Módulo Vehículos" "Gestión de vehículos, imágenes y disponibilidad."

                reservationModule = component "Módulo Reservas" "Gestión de reservas, validación de disponibilidad y envío de notificaciones."

                reviewModule = component "Módulo Reseñas" "Gestión de comentarios y calificaciones."

                authComponent = component "Authentication Component" "Integración con Google OAuth."

                storageComponent = component "Storage Component" "Integración con MinIO."

                emailComponent = component "Email Component" "Integración con Resend."

                cacheComponent = component "Cache Component" "Gestión de caché mediante Redis."

                secretsComponent = component "Secrets Component" "Obtención de secretos desde HashiCorp Vault."

                repositories = component "Capa de Repositorios" "Acceso centralizado a PostgreSQL."

                middlewareJWT -> userModule "Valida y redirige"
                middlewareJWT -> vehicleModule "Valida y redirige"
                middlewareJWT -> reservationModule "Valida y redirige"
                middlewareJWT -> reviewModule "Valida y redirige"

                publicRoutes -> userModule "Delegación de registro y login"

                userModule -> authComponent "OAuth 2.0"
                userModule -> secretsComponent "Obtiene credenciales"

                vehicleModule -> storageComponent "Sube y recupera imágenes"
                vehicleModule -> cacheComponent "Consulta y actualiza disponibilidad"
                vehicleModule -> secretsComponent "Obtiene credenciales"

                reservationModule -> cacheComponent "Lee y escribe disponibilidad temporal"
                reservationModule -> emailComponent "Envía notificaciones de confirmación y cancelación"

                reviewModule -> reservationModule "Valida que la reserva exista y haya finalizado"
                reviewModule -> cacheComponent "Cachea puntuaciones de reputación"
                reviewModule -> secretsComponent "Obtiene credenciales"

                storageComponent -> secretsComponent "Obtiene credenciales de MinIO"
                emailComponent -> secretsComponent "Obtiene credenciales de Resend"

                userModule -> repositories "SQL"
                vehicleModule -> repositories "SQL"
                reservationModule -> repositories "SQL"
                reviewModule -> repositories "SQL"
            }

            database = container "Database" "Almacena usuarios, vehículos, reservas y reseñas." "PostgreSQL" {
                tags "Database"
            }

            cassandra = container "Search Database" "Almacena historiales de búsqueda y soporta consultas masivas del catálogo." "Cassandra" {
                tags "Database"
            }

            cache = container "Cache" "Almacena temporalmente disponibilidad, sesiones y puntuaciones de reputación." "Redis" {
                tags "Database"
            }

            paymentService = container "Servicio de Pagos" "Microservicio independiente que gestiona cobros, retenciones, reembolsos e historial de transacciones." "NestJS + TypeScript + BullMQ"

            paymentDatabase = container "Payment Database" "Almacena transacciones, retenciones, reembolsos e historial de estados de pago." "PostgreSQL" {
                tags "Database"
            }
        }

        arrendador -> webapp "Publica vehículos y administra reservas"

        arrendatario -> webapp "Busca vehículos, reserva y paga"

        webapp -> api "HTTPS / JSON"

        webapp -> paymentService "Solicita procesamiento de pagos" "HTTPS / JSON"

        repositories -> database "SQL"

        repositories -> cassandra "CQL"

        cacheComponent -> cache "Redis"

        authComponent -> googleOAuth "OAuth 2.0"

        storageComponent -> minio "API"

        emailComponent -> resend "API"

        secretsComponent -> vault "API"

        paymentService -> paymentGateway "API"

        paymentService -> vault "Obtiene credenciales del gateway"

        paymentService -> cache "Cola de trabajos BullMQ" "Redis"

        paymentService -> paymentDatabase "SQL"
    }

    views {

        component api componentes_api {

            include arrendador
            include arrendatario
            include webapp
            include paymentService
            include database
            include cassandra
            include cache
            include paymentDatabase
            include googleOAuth
            include minio
            include resend
            include paymentGateway
            include vault
            include *

            autoLayout tb
        }

        styles {

            element "Person" {
                shape Person
                background #0B4884
                color #ffffff
            }

            element "Component" {
                background #438DD5
                color #ffffff
            }

            element "Container" {
                background #2E75B6
                color #ffffff
            }

            element "Software System" {
                background #999999
                color #ffffff
            }

            element "Database" {
                shape Cylinder
                background #2E75B6
                color #ffffff
            }

        }

    }

}
