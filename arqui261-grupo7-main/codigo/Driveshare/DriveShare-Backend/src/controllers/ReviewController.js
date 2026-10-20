import reviewService from '../services/ReviewService.js';

const sendServiceResult = (result, res) => {
    if (!result.success) {
        return res.status(result.status || 400).json({
            success: false,
            message: result.message
        });
    }

    return res.status(result.status || 200).json({
        success: true,
        data: result.data
    });
};

const findByVehicle = async (req, res) => {
    const result = await reviewService.findByVehicle(req.params.vehicleId);
    return sendServiceResult(result, res);
};

const findAll = async (req, res) => {
    const result = await reviewService.findAll();
    return sendServiceResult(result, res);
};

const findByUser = async (req, res) => {
    const result = await reviewService.findByUser(req.usuario);
    return sendServiceResult(result, res);
};

const create = async (req, res) => {
    const result = await reviewService.create(req.usuario, req.body);
    return sendServiceResult(result, res);
};

const update = async (req, res) => {
    const result = await reviewService.update(req.usuario, req.params.id, req.body);
    return sendServiceResult(result, res);
};

const remove = async (req, res) => {
    const result = await reviewService.remove(req.usuario, req.params.id);
    return sendServiceResult(result, res);
};

export default {
    findAll,
    findByVehicle,
    findByUser,
    create,
    update,
    remove
};
