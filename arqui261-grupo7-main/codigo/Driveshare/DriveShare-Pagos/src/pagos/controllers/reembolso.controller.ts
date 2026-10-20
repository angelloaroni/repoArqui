import { Body, Controller, Param, Post, UseGuards } from '@nestjs/common';
import { AuthGuard } from '../../common/guards/auth.guard';
import { ReembolsarDto } from '../dto/reembolsar.dto';
import { ReembolsoService } from '../services/reembolso.service';

/** RF33 — Reembolsos por cancelación. */
@Controller('reembolsos')
@UseGuards(AuthGuard)
export class ReembolsoController {
  constructor(private readonly reembolsoService: ReembolsoService) {}

  @Post(':idTransaccion')
  reembolsar(@Param('idTransaccion') id: string, @Body() dto: ReembolsarDto) {
    return this.reembolsoService.reembolsar(id, dto.motivo);
  }
}
