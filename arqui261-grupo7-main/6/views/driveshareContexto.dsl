workspace "DriveShare" "Diagrama de Contexto - DriveShare" {

    model {

        arrendador = person "Arrendador" "Publica vehículos y administra sus reservas."

        arrendatario = person "Arrendatario" "Busca, reserva y alquila vehículos disponibles en la plataforma."

        driveshare = softwareSystem "DriveShare" "Plataforma para la publicación y alquiler de vehículos."

        oauth = softwareSystem "Authentication (Google OAuth)" "Inicio de sesión opcional mediante cuentas Google."

        minio = softwareSystem "Media Storage (MinIO)" "Almacenamiento y gestión de imágenes y archivos asociados a los vehículos."

        paymentGateway = softwareSystem "Payment Gateway" "Procesamiento de pagos electrónicos."

        resend = softwareSystem "Email Service (Resend)" "Envío de correos electrónicos y notificaciones."

        vault = softwareSystem "Secrets Management (HashiCorp Vault)" "Gestión centralizada de secretos y claves criptográficas."

        arrendador -> driveshare "Publicación de vehículos y gestión de reservas"

        arrendatario -> driveshare "Búsqueda, reservas y pagos"

        driveshare -> oauth "Inicio de sesión opcional con Google"

        driveshare -> minio "Imágenes y archivos"

        driveshare -> paymentGateway "Pagos"

        driveshare -> resend "Correos y notificaciones"

        driveshare -> vault "Secretos y claves"
    }

    views {

        systemContext driveshare contexto_driveshare {

            include *

            autoLayout tb
        }

        styles {

            element "Person" {
                shape Person
                background #0B4884
                color #ffffff
            }

            element "Software System" {
                background #1565C0
                color #ffffff
            }
        }
    }
}
