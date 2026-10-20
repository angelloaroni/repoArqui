import reviewRepository from '../repositories/ReviewRepository.js';
import reservationRepository from '../repositories/ReservationRepository.js';

const normalizeRating = (rating) => Number(rating);

const canManageReview = (authUser, review) =>
    authUser?.role === 'admin' ||
    Number(review.user_id) === Number(authUser?.id_user);

const validateReviewPayload = ({ rating, comment }) => {
    const numericRating = normalizeRating(rating);

    if (!Number.isInteger(numericRating) || numericRating < 1 || numericRating > 5) {
        return 'La calificacion debe ser un numero entero entre 1 y 5.';
    }

    if (!String(comment || '').trim()) {
        return 'El comentario es obligatorio.';
    }

    return null;
};

const findByVehicle = async (vehicleId) => {
    const data = await reviewRepository.findByVehicleId(vehicleId);
    return { success: true, status: 200, data };
};

const findAll = async () => {
    const data = await reviewRepository.findAll();
    return { success: true, status: 200, data };
};

const findByUser = async (authUser) => {
    const data = await reviewRepository.findByUserId(authUser.id_user);
    return { success: true, status: 200, data };
};

const create = async (authUser, payload) => {
    const reservationId = payload.reservation_id;
    const validationMessage = validateReviewPayload(payload);

    if (!reservationId) {
        return { success: false, status: 400, message: 'La reserva es obligatoria.' };
    }

    if (validationMessage) {
        return { success: false, status: 400, message: validationMessage };
    }

    const reservation = await reservationRepository.findOne(reservationId);

    if (!reservation) {
        return { success: false, status: 404, message: 'Reserva no encontrada.' };
    }

    if (Number(reservation.user_id) !== Number(authUser.id_user) && authUser.role !== 'admin') {
        return { success: false, status: 403, message: 'Solo el arrendatario puede reseñar esta reserva.' };
    }

    if (reservation.status !== 'Finalizada') {
        return { success: false, status: 409, message: 'Solo se pueden reseñar reservas finalizadas.' };
    }

    const existing = await reviewRepository.findByReservationId(reservationId);

    if (existing) {
        return { success: false, status: 409, message: 'Esta reserva ya tiene una reseña.' };
    }

    const review = await reviewRepository.model.create({
        reservation_id: Number(reservationId),
        vehicle_id: String(reservation.vehicle_id),
        user_id: Number(authUser.id_user),
        rating: normalizeRating(payload.rating),
        comment: String(payload.comment).trim()
    });

    return { success: true, status: 201, data: review };
};

const update = async (authUser, id, payload) => {
    const validationMessage = validateReviewPayload(payload);

    if (validationMessage) {
        return { success: false, status: 400, message: validationMessage };
    }

    const review = await reviewRepository.findOne(id);

    if (!review) {
        return { success: false, status: 404, message: 'Reseña no encontrada.' };
    }

    if (!canManageReview(authUser, review)) {
        return { success: false, status: 403, message: 'No tienes permiso para modificar esta reseña.' };
    }

    review.rating = normalizeRating(payload.rating);
    review.comment = String(payload.comment).trim();
    review.updated_at = new Date();
    await review.save();

    return { success: true, status: 200, data: review };
};

const remove = async (authUser, id) => {
    const review = await reviewRepository.findOne(id);

    if (!review) {
        return { success: false, status: 404, message: 'Reseña no encontrada.' };
    }

    if (!canManageReview(authUser, review)) {
        return { success: false, status: 403, message: 'No tienes permiso para eliminar esta reseña.' };
    }

    await review.destroy();

    return { success: true, status: 200, data: { id_review: Number(id) } };
};

export default {
    findAll,
    findByVehicle,
    findByUser,
    create,
    update,
    remove
};
