import { Op } from 'sequelize';
import Reservation from '../models/Reservation.js';
import RepositoryBase from './RepositoryBase.js';

const ACTIVE_STATUSES = ['Pendiente', 'Confirmada'];

class ReservationRepository extends RepositoryBase {

    constructor() {
        super(Reservation);
    }

    async findByUserId(userId) {
        try {
            return await Reservation.findAll({
                where: { user_id: userId },
                order: [['created_at', 'DESC']]
            });
        } catch (error) {
            console.error('❌ ReservationRepository.findByUserId:', error.message);
            throw error;
        }
    }

    async findByOwnerId(ownerId) {
        try {
            return await Reservation.findAll({
                where: { owner_id: String(ownerId) },
                order: [['created_at', 'DESC']]
            });
        } catch (error) {
            console.error('❌ ReservationRepository.findByOwnerId:', error.message);
            throw error;
        }
    }

    async findByMockOwners() {
        try {
            return await Reservation.findAll({
                where: { owner_id: { [Op.like]: 'USR-%' } },
                order: [['created_at', 'DESC']]
            });
        } catch (error) {
            console.error('❌ ReservationRepository.findByMockOwners:', error.message);
            throw error;
        }
    }

    async findUnavailableVehicleIds({ startDate, endDate }) {
        try {
            const rows = await Reservation.findAll({
                where: {
                    status: { [Op.in]: ACTIVE_STATUSES },
                    start_date: { [Op.lt]: endDate },
                    end_date: { [Op.gt]: startDate }
                },
                attributes: ['vehicle_id']
            });

            return [...new Set(rows.map((r) => String(r.vehicle_id)))];
        } catch (error) {
            console.error('❌ ReservationRepository.findUnavailableVehicleIds:', error.message);
            throw error;
        }
    }

    async findOverlapping({ vehicleId, startDate, endDate, excludeId = null }) {
        try {
            const where = {
                vehicle_id: String(vehicleId),
                status: { [Op.in]: ACTIVE_STATUSES },
                start_date: { [Op.lt]: endDate },
                end_date: { [Op.gt]: startDate }
            };

            if (excludeId) {
                where.id_reservation = { [Op.ne]: excludeId };
            }

            return await Reservation.findAll({ where });
        } catch (error) {
            console.error('❌ ReservationRepository.findOverlapping:', error.message);
            throw error;
        }
    }
}

const reservationRepository = new ReservationRepository();

export default reservationRepository;
export { ACTIVE_STATUSES };
