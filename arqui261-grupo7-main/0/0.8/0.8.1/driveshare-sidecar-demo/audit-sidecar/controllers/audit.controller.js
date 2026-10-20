//Segundo Tema Individual\driveshare-sidecar-demo\audit-sidecar\controllers\audit.controller.js
import auditService from "../services/audit.service.js";

class AuditController {

  async receiveEvent(req, res) {

    try {

      const audit =
        await auditService.processEvent(
          req.body
        );

      return res.status(201).json({
        message: "Event stored",
        audit
      });

    } catch (error) {

      console.error(error);

      return res.status(500).json({
        message: error.message
      });

    }

  }

  async getAuditLogs(req, res) {

    try {

      const logs =
        await auditService.getAuditLogs();

      return res.json(logs);

    } catch (error) {

      console.error(error);

      return res.status(500).json({
        message: error.message
      });

    }

  }

}

export default new AuditController();