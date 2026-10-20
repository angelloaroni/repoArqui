import Review from '../models/Review.js';
import RepositoryBase from './RepositoryBase.js';

class ReviewRepository extends RepositoryBase {
    constructor() {
        super(Review);
    }

    async findByVehicleId(vehicleId) {
        return await Review.findAll({
            where: { vehicle_id: String(vehicleId) },
            order: [['created_at', 'DESC']]
        });
    }

    async findByUserId(userId) {
        return await Review.findAll({
            where: { user_id: Number(userId) },
            order: [['created_at', 'DESC']]
        });
    }

    async findByReservationId(reservationId) {
        return await Review.findOne({
            where: { reservation_id: Number(reservationId) }
        });
    }
}

const reviewRepository = new ReviewRepository();

export default reviewRepository;
