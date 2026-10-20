workspace "DriveShare" "Diagrama de Contenedores" {

    model {

        arrendatario = person "Arrendatario" "Busca, reserva y alquila vehículos disponibles."

        arrendador = person "Arrendador" "Publica vehículos y administra sus reservas."

        driveshare = softwareSystem "DriveShare" "Plataforma para la publicación y alquiler de vehículos." {

            webApp = container "Aplicación Web" "Permite registro, autenticación, publicación de vehículos, búsqueda, reservas, pagos y gestión de perfiles." "React + Vite"

            api = container "API REST" "Expone los servicios REST de usuarios, catálogo, reservas y reseñas. Implementa la lógica de negocio y coordina las integraciones externas." "Node.js + Express"

            paymentService = container "Servicio de Pagos" "Microservicio independiente que gestiona cobros, retenciones, reembolsos e historial de transacciones." "NestJS + TypeScript + BullMQ"

            messageBroker = container "Message Broker" "Gestiona eventos de estado entre el servicio de pagos y los demás módulos." "RabbitMQ" {
                tags "Queue"
            }

            database = container "Database" "Almacena usuarios, vehículos, reservas y reseñas." "PostgreSQL" {
                tags "Database"
            }

            searchDatabase = container "Search Database" "Almacena historiales de búsqueda y soporta consultas masivas del catálogo." "Cassandra" {
                tags "Database"
            }

            paymentDatabase = container "Payment Database" "Almacena transacciones, retenciones, reembolsos e historial de estados de pago." "PostgreSQL" {
                tags "Database"
            }

            cache = container "Cache" "Almacena temporalmente resultados de búsquedas, disponibilidad de vehículos, sesiones, puntuaciones de reputación y cola de trabajos de pagos." "Redis" {
                tags "Database"
            }

            arrendatario -> webApp "Busca vehículos, reserva y paga"

            arrendador -> webApp "Publica vehículos y administra reservas"

            webApp -> api "Consume funcionalidades" "JSON/HTTPS"

            webApp -> paymentService "Solicita procesamiento de pagos" "JSON/HTTPS"

            api -> database "Lee y escribe información" "SQL"

            api -> searchDatabase "Consultas masivas e historial de búsquedas" "CQL"

            api -> cache "Consulta y almacena datos temporales" "Redis"

            api -> messageBroker "Publica eventos de reserva" "AMQP"

            paymentService -> paymentDatabase "Lee y escribe transacciones" "SQL"

            paymentService -> cache "Cola de trabajos BullMQ" "Redis"

            paymentService -> messageBroker "Publica y consume eventos de pago" "AMQP"
        }

        oauth = softwareSystem "Google OAuth" "Autenticación opcional mediante cuentas Google."

        minio = softwareSystem "MinIO" "Almacenamiento de imágenes y archivos asociados a vehículos."

        paymentGateway = softwareSystem "Payment Gateway" "Procesamiento de pagos mediante tarjeta, Yape y Plin."

        resend = softwareSystem "Resend" "Servicio de envío de correos electrónicos y notificaciones."

        vault = softwareSystem "HashiCorp Vault" "Gestión centralizada de secretos, credenciales y claves criptográficas."

        api -> oauth "OAuth 2.0"

        api -> minio "Sube y recupera imágenes"

        api -> resend "Envía correos y notificaciones"

        api -> vault "Obtiene secretos y credenciales"

        paymentService -> paymentGateway "Procesa pagos"

        paymentService -> vault "Obtiene credenciales del gateway"
    }

    views {

        container driveshare "Contenedores" {
            include *

            autoLayout lr
        }

        styles {

            element "Person" {
                shape Person
                background #0B4884
                color #ffffff
            }

            element "Container" {
                background #438DD5
                color #ffffff
            }

            element "Database" {
                shape Cylinder
                background #438DD5
                color #ffffff
            }

            element "Queue" {
                shape Pipe
                background #438DD5
                color #ffffff
            }

            element "Software System" {
                background #999999
                color #ffffff
            }
        }

        theme default
    }
}
