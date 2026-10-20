import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

// ==========================================================
// MÉTODO INTERNO
// Toda la lógica de envío pasa por aquí.
// ==========================================================

const sendEmail = async ({
    to,
    subject,
    html,
    consoleTitle,
    consoleMessage
}) => {

    // Siempre mostrar información en consola
    console.log('\n===================================');
    console.log(consoleTitle);
    console.log(`Usuario : ${to}`);
    console.log(consoleMessage);
    console.log('===================================\n');

    const provider = process.env.MAIL_PROVIDER || 'mock';

    // ===================== MOCK =====================

    if (provider === 'mock') {

        console.log('📧 MAIL_PROVIDER = MOCK');

        return;

    }

    // ===================== AUTO =====================

    if (
        provider === 'auto' &&
        to.toLowerCase() !== process.env.RESEND_TEST_EMAIL.toLowerCase()
    ) {

        console.log(
            '📧 MAIL_PROVIDER = AUTO (solo consola).'
        );

        return;

    }

    // ===================== RESEND =====================

    const MAX_REINTENTOS = 3;

    const ESPERA_MS = 2000;

    for (let intento = 1; intento <= MAX_REINTENTOS; intento++) {

        try {

            console.log(
                `📨 Intento ${intento} de envío mediante Resend...`
            );

            if (process.env.DEMO_RETRY === "true" && intento < 3) {
                console.log("🧪 Modo DEMO: simulando fallo de Resend...");
                throw new Error("Fallo simulado de Resend");
            }

            await resend.emails.send({

                from: 'DriveShare <onboarding@resend.dev>',

                to,

                subject,

                html

            });

            console.log(
                '✅ Correo enviado correctamente.'
            );

            return;

        }

        catch (error) {

            console.warn(
                `⚠️ Intento ${intento} fallido: ${error.message}`
            );

            if (intento === MAX_REINTENTOS) {

                console.error(
                    '❌ Se agotaron los intentos de envío.'
                );

                throw error;

            }

            console.log(
                `🔄 Reintentando en ${ESPERA_MS / 1000} segundos...`
            );

            await new Promise(resolve =>
                setTimeout(resolve, ESPERA_MS)
            );

        }

    }

};

// ==========================================================
// ACTIVACIÓN DE CUENTA
// ==========================================================

const sendActivationEmail = async (usuario, codigo) => {

    await sendEmail({

        to: usuario.email,

        subject: 'Activa tu cuenta en DriveShare',

        consoleTitle: '📧 CÓDIGO DE ACTIVACIÓN',

        consoleMessage: `Código  : ${codigo}`,

        html: `
            <p>Hola <strong>${usuario.name}</strong>,</p>

            <p>Tu código de activación es:</p>

            <h2>${codigo}</h2>

            <p>Bienvenido a DriveShare.</p>
        `

    });

};

// ==========================================================
// RECUPERACIÓN DE CONTRASEÑA
// ==========================================================

const sendRecoveryEmail = async (usuario, codigo) => {

    await sendEmail({

        to: usuario.email,

        subject: 'Recuperación de contraseña - DriveShare',

        consoleTitle: '🔑 CÓDIGO DE RECUPERACIÓN',

        consoleMessage: `Código  : ${codigo}`,

        html: `
            <p>Hola <strong>${usuario.name}</strong>,</p>

            <p>Tu código para recuperar tu contraseña es:</p>

            <h2>${codigo}</h2>

            <p>Si no solicitaste este cambio, ignora este correo.</p>
        `

    });

};

// ==========================================================
// CONTRASEÑA CAMBIADA
// ==========================================================

const sendPasswordChangedEmail = async (usuario) => {

    await sendEmail({

        to: usuario.email,

        subject: 'Contraseña modificada',

        consoleTitle: '🔐 CONTRASEÑA MODIFICADA',

        consoleMessage: 'La contraseña fue modificada correctamente.',

        html: `
            <p>Hola <strong>${usuario.name}</strong>,</p>

            <p>Te informamos que tu contraseña fue modificada correctamente.</p>

            <p>Si no realizaste esta acción, comunícate con soporte inmediatamente.</p>
        `

    });

};

// ==========================================================
// CONTRASEÑA RESTABLECIDA
// ==========================================================

const sendPasswordResetSuccessEmail = async (usuario) => {

    await sendEmail({

        to: usuario.email,

        subject: 'Contraseña restablecida',

        consoleTitle: '✅ CONTRASEÑA RESTABLECIDA',

        consoleMessage: 'La contraseña fue restablecida correctamente.',

        html: `
            <p>Hola <strong>${usuario.name}</strong>,</p>

            <p>Tu contraseña fue restablecida correctamente.</p>
        `

    });

};

// ==========================================================
// CUENTA VERIFICADA
// ==========================================================

const sendAccountVerifiedEmail = async (usuario) => {

    await sendEmail({

        to: usuario.email,

        subject: 'Cuenta verificada',

        consoleTitle: '✅ CUENTA VERIFICADA',

        consoleMessage: 'La cuenta fue activada correctamente.',

        html: `
            <p>Hola <strong>${usuario.name}</strong>,</p>

            <p>Tu cuenta fue verificada correctamente.</p>

            <p>Ya puedes utilizar todas las funcionalidades de DriveShare.</p>
        `

    });

};

// ==========================================================
// CAMBIO DE ESTADO
// ==========================================================

const sendAccountStatusEmail = async (usuario, estado) => {

    await sendEmail({

        to: usuario.email,

        subject: 'Cambio de estado de la cuenta',

        consoleTitle: 'ℹ️ CAMBIO DE ESTADO',

        consoleMessage: `Nuevo estado: ${estado}`,

        html: `
            <p>Hola <strong>${usuario.name}</strong>,</p>

            <p>El estado de tu cuenta ahora es:</p>

            <h2>${estado}</h2>
        `

    });

};

// ==========================================================
// NOTIFICACIONES DE RESERVA (M3 — RF27)
// ==========================================================

const sendReservationNotificationEmail = async (
    usuario,
    reservation,
    eventLabel
) => {

    await sendEmail({

        to: usuario.email,

        subject: `DriveShare — Reserva ${eventLabel}`,

        consoleTitle: '📅 NOTIFICACIÓN DE RESERVA',

        consoleMessage:
            `Reserva #${reservation.id_reservation} — ${eventLabel}`,

        html: `
            <p>Hola <strong>${usuario.name}</strong>,</p>

            <p>Tu reserva <strong>#${reservation.id_reservation}</strong>
            ha sido <strong>${eventLabel}</strong>.</p>

            <ul>
              <li>Vehículo: ${reservation.vehicle_name || reservation.vehicle_id}</li>
              <li>Inicio: ${reservation.start_date}</li>
              <li>Fin: ${reservation.end_date}</li>
              <li>Total: S/ ${reservation.total_price}</li>
              <li>Estado: ${reservation.status}</li>
            </ul>
        `

    });

};

export default {

    sendActivationEmail,

    sendRecoveryEmail,

    sendPasswordChangedEmail,

    sendPasswordResetSuccessEmail,

    sendAccountVerifiedEmail,

    sendAccountStatusEmail,

    sendReservationNotificationEmail

};