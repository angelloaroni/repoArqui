import { IsOptional, IsString } from 'class-validator';

/** Solicitud de reembolso por cancelación (RF33). */
export class ReembolsarDto {
  @IsOptional()
  @IsString()
  motivo?: string;
}
