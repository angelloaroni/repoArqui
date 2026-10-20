import service from '../services/AuditService.js';

class AuditController {

    async registrar(req, res) {

        try {

            const auditoria = await service.registrarEvento(req.body);

            res.status(201).json({

                success: true,

                message: 'Evento auditado correctamente.',

                auditoria

            });

        }

        catch (error) {

            console.error(error);

            res.status(500).json({

                success: false,

                message: 'Error al registrar auditoría.'

            });

        }

    }

}

export default new AuditController();