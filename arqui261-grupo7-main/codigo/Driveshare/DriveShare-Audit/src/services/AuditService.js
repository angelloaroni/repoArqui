import repository from '../repositories/AuditRepository.js';

class AuditService {

    async registrarEvento(data) {

        return await repository.create(data);

    }

}

export default new AuditService();