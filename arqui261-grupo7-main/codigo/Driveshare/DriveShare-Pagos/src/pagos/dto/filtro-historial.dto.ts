import { IsEnum, IsInt, IsOptional, IsString } from 'class-validator';
import { Type } from 'class-transformer';
import { EstadoTransaccion, TipoTransaccion } from '../enums/estado-transaccion.enum';

/** Filtros para consultar el historial de transacciones (RF34). */
export class FiltroHistorialDto {
  @Type(() => Number)
  @IsInt()
  idUsuario: number;

  @IsOptional()
  @IsEnum(EstadoTransaccion)
  estado?: EstadoTransaccion;

  @IsOptional()
  @IsEnum(TipoTransaccion)
  tipo?: TipoTransaccion;

  @IsOptional()
  @IsString()
  desde?: string; // ISO date

  @IsOptional()
  @IsString()
  hasta?: string; // ISO date

  @IsOptional()
  @Type(() => Number)
  montoMin?: number;

  @IsOptional()
  @Type(() => Number)
  montoMax?: number;
}
