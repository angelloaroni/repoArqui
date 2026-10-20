import { IsInt, IsNumber, IsOptional, IsPositive, IsString, Length, Min } from 'class-validator';

/** Payload del cobro de una reserva (RF30). */
export class CobrarDto {
  @IsInt()
  idReserva: number;

  @IsInt()
  idArrendatario: number;

  @IsInt()
  idArrendador: number;

  // Monto base de la reserva (sobre este se calculan impuestos/comisión).
  @IsNumber({ maxDecimalPlaces: 2 })
  @IsPositive()
  monto: number;

  @IsOptional()
  @IsString()
  @Length(3, 3)
  moneda?: string;

  // Token de la tarjeta (viene del frontend tras tokenizar con Culqi) o del método guardado.
  @IsString()
  token: string;

  @IsOptional()
  @IsString()
  email?: string;

  // Clave de idempotencia enviada por el cliente para no duplicar el cobro (RF35).
  @IsString()
  @Length(8, 100)
  idempotencyKey: string;
}
