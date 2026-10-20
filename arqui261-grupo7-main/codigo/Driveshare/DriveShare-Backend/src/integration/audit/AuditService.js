import axios from 'axios';

const AUDIT_URL = process.env.AUDIT_URL;

const audit = async ({
    req,
    usuario,
    action,
    description,
    statusCode
}) => {

    // Si no está configurado el Sidecar, no hacemos nada
    if (!AUDIT_URL) {
        console.warn('⚠️ AUDIT_URL no está configurada.');
        return;
    }

    try {

        await axios.post(AUDIT_URL, {

            id_user: usuario?.id_user ?? null,

            email: usuario?.email ?? null,

            action,

            http_method: req.method,

            endpoint: req.path,

            status_code: statusCode,

            description,

            ip_address: req.ip,

            user_agent: req.headers['user-agent']

        });

        console.log(`📝 Auditoría registrada: ${action}`);

    } catch (error) {

        console.error(
            '⚠️ Error enviando auditoría:',
            error.message
        );

    }

};

export default {
    audit
};