import { Body, Controller, Delete, Get, Param, Post, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '../../common/guards/auth.guard';
import { GuardarMetodoDto } from '../dto/guardar-metodo.dto';
import { MetodoPagoService } from '../services/metodo-pago.service';

/** RF38 — Métodos de pago guardados (tokenizados). */
@Controller('metodos-pago')
@UseGuards(AuthGuard)
export class MetodoPagoController {
  constructor(private readonly metodoService: MetodoPagoService) {}

  @Post()
  guardar(@Body() dto: GuardarMetodoDto) {
    return this.metodoService.guardar(dto);
  }

  @Get()
  listar(@Query('idUsuario') idUsuario: string) {
    return this.metodoService.listar(Number(idUsuario));
  }

  @Delete(':id')
  eliminar(@Param('id') id: string) {
    return this.metodoService.eliminar(id);
  }
}
