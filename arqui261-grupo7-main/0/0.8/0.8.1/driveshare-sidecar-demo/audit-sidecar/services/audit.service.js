//Segundo Tema Individual\driveshare-sidecar-demo\audit-sidecar\services\audit.service.js
import auditRepository from "../repositories/audit.repository.js";

class AuditService {

  determineSeverity(eventData) {

    if (
      eventData.event === "ROLE_CHANGED" &&
      eventData.role_anterior === "arrendatario" &&
      eventData.role_nuevo === "arrendador"
    ) {
      return "HIGH";
    }

    if (
      eventData.event === "ROLE_CHANGE_DENIED"
    ) {
      return "MEDIUM";
    }

    if (
      eventData.event === "USER_CREATED"
    ) {
      return "LOW";
    }

    if (
      eventData.event === "USER_VIEWED"
    ) {
      return "LOW";
    }

    return "LOW";
  }

  generateAlert(eventData, severity) {

    if (severity === "HIGH") {

      console.log("\n==============================");
      console.log("HIGH ALERT");
      console.log("Role elevation detected");
      console.log(`User: ${eventData.email}`);
      console.log(
        `${eventData.role_anterior} -> ${eventData.role_nuevo}`
      );
      console.log("==============================\n");

    }

  }

  async processEvent(eventData) {

    const severity =
      this.determineSeverity(eventData);

    this.generateAlert(
      eventData,
      severity
    );

    return await auditRepository.saveEvent({
      user_id: eventData.user_id,
      event: eventData.event,
      detail: {
        ...eventData,
        severity
      }
    });

  }

  async getAuditLogs() {

    return await auditRepository.getAllAudits();

  }

}

export default new AuditService();