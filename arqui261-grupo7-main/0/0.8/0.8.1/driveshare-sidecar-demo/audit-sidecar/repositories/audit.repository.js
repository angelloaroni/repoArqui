import AuditLog from "../models/audit.model.js";

class AuditRepository {

  async saveEvent(eventData) {

    return await AuditLog.create(eventData);

  }

  async getAllAudits() {

    return await AuditLog.findAll({
      order: [["created_at", "DESC"]]
    });

  }

}

export default new AuditRepository();