import reservationService from '../services/ReservationService.js';
import auditService from '../integration/audit/AuditService.js';

const sendServiceResult = (result, res) => {
    if (!result.success) {
        return res.status(result.status || 400).json({
            success: false,
            message: result.message
        });
    }

    return res.status(result.status || 200).json({
        success: true,
        data: result.data,
        ...(result.available !== undefined
            ? { available: result.available, conflicts: result.conflicts }
            : {})
    });
};

const create = async (req, res) => {
    const result = await reservationService.create(req.usuario, req.body);

    if (result.success) {
        await auditService.audit({
            req,
            usuario: req.usuario,
            action: 'CREATE_RESERVATION',
            description: `Reserva creada #${result.data?.id_reservation}`,
            statusCode: result.status
        });
    }

    return sendServiceResult(result, res);
};

const findOne = async (req, res) => {
    const result = await reservationService.findOne(req.usuario, req.params.id);
    return sendServiceResult(result, res);
};

const findByUser = async (req, res) => {
    const result = await reservationService.findByUser(req.usuario);
    return sendServiceResult(result, res);
};

const findByOwner = async (req, res) => {
    const result = await reservationService.findByOwner(req.usuario);
    return sendServiceResult(result, res);
};

const checkAvailability = async (req, res) => {
    const result = await reservationService.checkAvailability({
        vehicleId: req.params.vehicleId,
        startDate: req.query.start,
        endDate: req.query.end,
        excludeId: req.query.excludeId || null
    });
    return sendServiceResult(result, res);
};

const listUnavailable = async (req, res) => {
    const result = await reservationService.listUnavailableVehicles({
        startDate: req.query.start,
        endDate: req.query.end
    });
    return sendServiceResult(result, res);
};

const update = async (req, res) => {
    const result = await reservationService.update(
        req.usuario,
        req.params.id,
        req.body
    );

    if (result.success) {
        await auditService.audit({
            req,
            usuario: req.usuario,
            action: 'UPDATE_RESERVATION',
            description: `Reserva modificada #${req.params.id}`,
            statusCode: result.status
        });
    }

    return sendServiceResult(result, res);
};

const cancel = async (req, res) => {
    const result = await reservationService.cancel(req.usuario, req.params.id);

    if (result.success) {
        await auditService.audit({
            req,
            usuario: req.usuario,
            action: 'CANCEL_RESERVATION',
            description: `Reserva cancelada #${req.params.id}`,
            statusCode: result.status
        });
    }

    return sendServiceResult(result, res);
};

const confirm = async (req, res) => {
    const result = await reservationService.confirm(req.usuario, req.params.id);

    if (result.success) {
        await auditService.audit({
            req,
            usuario: req.usuario,
            action: 'CONFIRM_RESERVATION',
            description: `Reserva confirmada tras pago #${req.params.id}`,
            statusCode: result.status
        });
    }

    return sendServiceResult(result, res);
};

const accept = async (req, res) => {
    const result = await reservationService.accept(req.usuario, req.params.id);

    if (result.success) {
        await auditService.audit({
            req,
            usuario: req.usuario,
            action: 'ACCEPT_RESERVATION',
            description: `Reserva aceptada por propietario #${req.params.id}`,
            statusCode: result.status
        });
    }

    return sendServiceResult(result, res);
};

const reject = async (req, res) => {
    const result = await reservationService.reject(req.usuario, req.params.id);

    if (result.success) {
        await auditService.audit({
            req,
            usuario: req.usuario,
            action: 'REJECT_RESERVATION',
            description: `Reserva rechazada por propietario #${req.params.id}`,
            statusCode: result.status
        });
    }

    return sendServiceResult(result, res);
};

const close = async (req, res) => {
    const result = await reservationService.close(req.usuario, req.params.id);

    if (result.success) {
        await auditService.audit({
            req,
            usuario: req.usuario,
            action: 'CLOSE_RESERVATION',
            description: `Reserva finalizada #${req.params.id}`,
            statusCode: result.status
        });
    }

    return sendServiceResult(result, res);
};

export default {
    create,
    findOne,
    findByUser,
    findByOwner,
    checkAvailability,
    listUnavailable,
    update,
    cancel,
    confirm,
    accept,
    reject,
    close
};
