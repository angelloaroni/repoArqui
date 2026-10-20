import AuditLog from '../models/AuditLog.js';

class AuditRepository {

    async create(data) {
        return await AuditLog.create(data);
    }

}

export default new AuditRepository();