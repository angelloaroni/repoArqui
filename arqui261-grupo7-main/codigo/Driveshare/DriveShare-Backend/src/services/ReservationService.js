import sequelize from '../config/database.js';
import reservationRepository from '../repositories/ReservationRepository.js';
import Usuario from '../models/Usuario.js';
import mailService from '../integration/mail/MailService.js';

const STATUS = {
    PENDIENTE: 'Pendiente',
    CONFIRMADA: 'Confirmada',
    RECHAZADA: 'Rechazada',
    CANCELADA: 'Cancelada',
    FINALIZADA: 'Finalizada'
};

/** Evita spam de recordatorios "próxima a iniciar" (RF27) en la misma sesión del proceso */
const remindedUpcoming = new Set();

const calculateDays = (startDate, endDate) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const ms = end - start;
    return Math.ceil(ms / (1000 * 60 * 60 * 24));
};

const notifyAsync = (usuario, reservation, eventLabel) => {
    // RF27 — notificaciones asíncronas (no bloquean la respuesta)
    setImmediate(async () => {
        try {
            if (!usuario?.email) return;
            await mailService.sendReservationNotificationEmail(
                usuario,
                reservation,
                eventLabel
            );
        } catch (error) {
            console.warn('⚠️ Notificación de reserva no enviada:', error.message);
        }
    });
};

const assertAuthenticated = (authUser) => {
    if (!authUser?.id_user) {
        return { success: false, status: 401, message: 'Usuario no autenticado.' };
    }
    return null;
};

const canManageAsOwnerOrAdmin = (authUser, reservation) => {
    const isAdmin = authUser.role === 'admin';
    const isOwner =
        String(reservation.owner_id) === String(authUser.id_user);
    return isAdmin || isOwner;
};

const canView = (authUser, reservation) => {
    const isAdmin = authUser.role === 'admin';
    const isRenter = Number(reservation.user_id) === Number(authUser.id_user);
    return isAdmin || isRenter || canManageAsOwnerOrAdmin(authUser, reservation);
};

// ================= CREAR (RF20, RF21, RF23) =================
const create = async (authUser, payload) => {
    const authError = assertAuthenticated(authUser);
    if (authError) return authError;

    const {
        vehicle_id,
        owner_id,
        vehicle_name,
        price_per_day,
        start_date,
        end_date,
        pickup_location,
        return_location
    } = payload;

    if (
        !vehicle_id ||
        price_per_day == null ||
        !start_date ||
        !end_date ||
        !pickup_location ||
        !return_location
    ) {
        return {
            success: false,
            status: 400,
            message: 'Faltan campos mandatorios para crear la reserva.'
        };
    }

    const days = calculateDays(start_date, end_date);
    if (days <= 0) {
        return {
            success: false,
            status: 400,
            message: 'La fecha de fin debe ser posterior a la de inicio.'
        };
    }

    const total_price = Number((days * Number(price_per_day)).toFixed(2));

    const transaction = await sequelize.transaction();

    try {
        const overlapping = await reservationRepository.findOverlapping({
            vehicleId: vehicle_id,
            startDate: start_date,
            endDate: end_date
        });

        if (overlapping.length > 0) {
            await transaction.rollback();
            return {
                success: false,
                status: 409,
                message: 'El vehículo no está disponible en las fechas seleccionadas.'
            };
        }

        const reservation = await reservationRepository.model.create({
            user_id: authUser.id_user,
            vehicle_id: String(vehicle_id),
            owner_id: owner_id != null ? String(owner_id) : null,
            vehicle_name: vehicle_name || null,
            price_per_day,
            start_date,
            end_date,
            total_price,
            status: STATUS.PENDIENTE,
            pickup_location,
            return_location,
            created_at: new Date(),
            updated_at: new Date()
        }, { transaction });

        await transaction.commit();

        const usuario = await Usuario.findByPk(authUser.id_user);
        notifyAsync(usuario, reservation, 'creada (pendiente de pago/confirmación)');

        return { success: true, status: 201, data: reservation };
    } catch (error) {
        await transaction.rollback();
        console.error('❌ ReservationService.create:', error.message);
        return {
            success: false,
            status: 500,
            message: 'Error al crear la reserva.'
        };
    }
};

// ================= DETALLE =================
const findOne = async (authUser, id) => {
    const authError = assertAuthenticated(authUser);
    if (authError) return authError;

    const reservation = await reservationRepository.findOne(id);
    if (!reservation) {
        return { success: false, status: 404, message: 'Reserva no encontrada.' };
    }

    if (!canView(authUser, reservation)) {
        return {
            success: false,
            status: 403,
            message: 'No tienes permiso para ver esta reserva.'
        };
    }

    return { success: true, status: 200, data: reservation };
};

// ================= HISTORIAL ARRENDATARIO (RF26) + reminder RF27 =================
const findByUser = async (authUser) => {
    const authError = assertAuthenticated(authUser);
    if (authError) return authError;

    const data = await reservationRepository.findByUserId(authUser.id_user);

    // RF27 — notificar reservas confirmadas próximas a iniciar (≤ 48h)
    const usuario = await Usuario.findByPk(authUser.id_user);
    const now = Date.now();
    const in48h = 48 * 60 * 60 * 1000;

    for (const reservation of data) {
        if (reservation.status !== STATUS.CONFIRMADA) continue;

        const startMs = new Date(reservation.start_date).getTime();
        const key = `${reservation.id_reservation}-upcoming`;

        if (
            startMs > now &&
            startMs - now <= in48h &&
            !remindedUpcoming.has(key)
        ) {
            remindedUpcoming.add(key);
            notifyAsync(usuario, reservation, 'próxima a iniciar');
        }
    }

    return { success: true, status: 200, data };
};

// ================= HISTORIAL PROPIETARIO (RF28) =================
const findByOwner = async (authUser) => {
    const authError = assertAuthenticated(authUser);
    if (authError) return authError;

    let data = await reservationRepository.findByOwnerId(authUser.id_user);

    // Bridge temporal: catálogo mock usa owner_id USR-* hasta que exista M2 en BD
    if (
        (!data || data.length === 0) &&
        String(authUser.role || '').toLowerCase() === 'arrendador'
    ) {
        data = await reservationRepository.findByMockOwners();
    }

    return { success: true, status: 200, data };
};

// ================= DISPONIBILIDAD (RF18 / RF23) =================
const checkAvailability = async ({ vehicleId, startDate, endDate, excludeId }) => {
    if (!vehicleId || !startDate || !endDate) {
        return {
            success: false,
            status: 400,
            message: 'Se requieren vehicleId, startDate y endDate.'
        };
    }

    const days = calculateDays(startDate, endDate);
    if (days <= 0) {
        return {
            success: false,
            status: 400,
            message: 'Rango de fechas inválido.',
            available: false
        };
    }

    const overlapping = await reservationRepository.findOverlapping({
        vehicleId,
        startDate,
        endDate,
        excludeId
    });

    return {
        success: true,
        status: 200,
        available: overlapping.length === 0,
        conflicts: overlapping.length
    };
};

/** RF18 — lista de vehicle_id no disponibles en un rango */
const listUnavailableVehicles = async ({ startDate, endDate }) => {
    if (!startDate || !endDate) {
        return {
            success: false,
            status: 400,
            message: 'Se requieren start y end.'
        };
    }

    const days = calculateDays(startDate, endDate);
    if (days <= 0) {
        return {
            success: false,
            status: 400,
            message: 'Rango de fechas inválido.',
            data: []
        };
    }

    const unavailable = await reservationRepository.findUnavailableVehicleIds({
        startDate,
        endDate
    });

    return {
        success: true,
        status: 200,
        data: unavailable
    };
};

// ================= MODIFICAR FECHAS (RF24) =================
const update = async (authUser, id, payload) => {
    const authError = assertAuthenticated(authUser);
    if (authError) return authError;

    const reservation = await reservationRepository.findOne(id);
    if (!reservation) {
        return { success: false, status: 404, message: 'Reserva no encontrada.' };
    }

    if (Number(reservation.user_id) !== Number(authUser.id_user) && authUser.role !== 'admin') {
        return { success: false, status: 403, message: 'Solo el arrendatario puede modificar su reserva.' };
    }

    if ([STATUS.CANCELADA, STATUS.FINALIZADA, STATUS.RECHAZADA].includes(reservation.status)) {
        return {
            success: false,
            status: 400,
            message: 'No se puede modificar una reserva cancelada, rechazada o finalizada.'
        };
    }

    if (new Date(reservation.start_date) <= new Date()) {
        return {
            success: false,
            status: 400,
            message: 'Solo se puede modificar una reserva antes de la fecha de inicio.'
        };
    }

    const start_date = payload.start_date || reservation.start_date;
    const end_date = payload.end_date || reservation.end_date;
    const pickup_location = payload.pickup_location || reservation.pickup_location;
    const return_location = payload.return_location || reservation.return_location;

    const days = calculateDays(start_date, end_date);
    if (days <= 0) {
        return {
            success: false,
            status: 400,
            message: 'La fecha de fin debe ser posterior a la de inicio.'
        };
    }

    const overlapping = await reservationRepository.findOverlapping({
        vehicleId: reservation.vehicle_id,
        startDate: start_date,
        endDate: end_date,
        excludeId: reservation.id_reservation
    });

    if (overlapping.length > 0) {
        return {
            success: false,
            status: 409,
            message: 'El vehículo no está disponible en las nuevas fechas.'
        };
    }

    const total_price = Number((days * Number(reservation.price_per_day)).toFixed(2));

    reservation.start_date = start_date;
    reservation.end_date = end_date;
    reservation.pickup_location = pickup_location;
    reservation.return_location = return_location;
    reservation.total_price = total_price;
    reservation.updated_at = new Date();
    await reservation.save();

    const usuario = await Usuario.findByPk(authUser.id_user);
    notifyAsync(usuario, reservation, 'modificada');

    return { success: true, status: 200, data: reservation };
};

// ================= CANCELAR (RF25) =================
const cancel = async (authUser, id) => {
    const authError = assertAuthenticated(authUser);
    if (authError) return authError;

    const reservation = await reservationRepository.findOne(id);
    if (!reservation) {
        return { success: false, status: 404, message: 'Reserva no encontrada.' };
    }

    const isRenter = Number(reservation.user_id) === Number(authUser.id_user);
    const isOwnerOrAdmin = canManageAsOwnerOrAdmin(authUser, reservation);

    if (!isRenter && !isOwnerOrAdmin) {
        return { success: false, status: 403, message: 'No tienes permiso para cancelar esta reserva.' };
    }

    if (reservation.status === STATUS.CANCELADA) {
        return {
            success: false,
            status: 400,
            message: 'La reserva ya está cancelada y no puede reactivarse.'
        };
    }

    if (reservation.status === STATUS.FINALIZADA) {
        return {
            success: false,
            status: 400,
            message: 'Las reservas finalizadas no pueden cancelarse.'
        };
    }

    reservation.status = STATUS.CANCELADA;
    reservation.updated_at = new Date();
    await reservation.save();

    const usuario = await Usuario.findByPk(reservation.user_id);
    notifyAsync(usuario, reservation, 'cancelada');

    return { success: true, status: 200, data: reservation };
};

// ================= CONFIRMAR TRAS PAGO (RF22) =================
const confirm = async (authUser, id) => {
    const authError = assertAuthenticated(authUser);
    if (authError) return authError;

    const reservation = await reservationRepository.findOne(id);
    if (!reservation) {
        return { success: false, status: 404, message: 'Reserva no encontrada.' };
    }

    if (Number(reservation.user_id) !== Number(authUser.id_user) && authUser.role !== 'admin') {
        return { success: false, status: 403, message: 'No tienes permiso para confirmar esta reserva.' };
    }

    if (reservation.status !== STATUS.PENDIENTE) {
        return {
            success: false,
            status: 400,
            message: `Solo se puede confirmar una reserva pendiente. Estado actual: ${reservation.status}.`
        };
    }

    // Revalidar disponibilidad al confirmar (concurrencia)
    const overlapping = await reservationRepository.findOverlapping({
        vehicleId: reservation.vehicle_id,
        startDate: reservation.start_date,
        endDate: reservation.end_date,
        excludeId: reservation.id_reservation
    });

    if (overlapping.length > 0) {
        return {
            success: false,
            status: 409,
            message: 'Ya no hay disponibilidad para confirmar esta reserva.'
        };
    }

    reservation.status = STATUS.CONFIRMADA;
    reservation.updated_at = new Date();
    await reservation.save();

    const usuario = await Usuario.findByPk(reservation.user_id);
    notifyAsync(usuario, reservation, 'confirmada');

    return { success: true, status: 200, data: reservation };
};

// ================= ACEPTAR (RF28) =================
const accept = async (authUser, id) => {
    const authError = assertAuthenticated(authUser);
    if (authError) return authError;

    const reservation = await reservationRepository.findOne(id);
    if (!reservation) {
        return { success: false, status: 404, message: 'Reserva no encontrada.' };
    }

    if (!canManageAsOwnerOrAdmin(authUser, reservation)) {
        return {
            success: false,
            status: 403,
            message: 'Solo el propietario del vehículo puede aceptar esta reserva.'
        };
    }

    if (reservation.status !== STATUS.PENDIENTE) {
        return {
            success: false,
            status: 400,
            message: 'Solo se pueden aceptar reservas pendientes.'
        };
    }

    reservation.status = STATUS.CONFIRMADA;
    reservation.updated_at = new Date();
    await reservation.save();

    const usuario = await Usuario.findByPk(reservation.user_id);
    notifyAsync(usuario, reservation, 'aceptada por el propietario');

    return { success: true, status: 200, data: reservation };
};

// ================= RECHAZAR (RF28) =================
const reject = async (authUser, id) => {
    const authError = assertAuthenticated(authUser);
    if (authError) return authError;

    const reservation = await reservationRepository.findOne(id);
    if (!reservation) {
        return { success: false, status: 404, message: 'Reserva no encontrada.' };
    }

    if (!canManageAsOwnerOrAdmin(authUser, reservation)) {
        return {
            success: false,
            status: 403,
            message: 'Solo el propietario del vehículo puede rechazar esta reserva.'
        };
    }

    if (reservation.status !== STATUS.PENDIENTE) {
        return {
            success: false,
            status: 400,
            message: 'Solo se pueden rechazar reservas pendientes.'
        };
    }

    reservation.status = STATUS.RECHAZADA;
    reservation.updated_at = new Date();
    await reservation.save();

    const usuario = await Usuario.findByPk(reservation.user_id);
    notifyAsync(usuario, reservation, 'rechazada por el propietario');

    return { success: true, status: 200, data: reservation };
};

// ================= CIERRE / DEVOLUCIÓN (RF29) =================
const close = async (authUser, id) => {
    const authError = assertAuthenticated(authUser);
    if (authError) return authError;

    const reservation = await reservationRepository.findOne(id);
    if (!reservation) {
        return { success: false, status: 404, message: 'Reserva no encontrada.' };
    }

    const isRenter = Number(reservation.user_id) === Number(authUser.id_user);
    const isOwnerOrAdmin = canManageAsOwnerOrAdmin(authUser, reservation);

    if (!isRenter && !isOwnerOrAdmin) {
        return { success: false, status: 403, message: 'No tienes permiso para cerrar esta reserva.' };
    }

    if (reservation.status !== STATUS.CONFIRMADA) {
        return {
            success: false,
            status: 400,
            message: 'Solo se pueden finalizar reservas confirmadas.'
        };
    }

    reservation.status = STATUS.FINALIZADA;
    reservation.updated_at = new Date();
    await reservation.save();

    const usuario = await Usuario.findByPk(reservation.user_id);
    notifyAsync(usuario, reservation, 'finalizada (devolución registrada)');

    return { success: true, status: 200, data: reservation };
};

export default {
    STATUS,
    create,
    findOne,
    findByUser,
    findByOwner,
    checkAvailability,
    listUnavailableVehicles,
    update,
    cancel,
    confirm,
    accept,
    reject,
    close
};
