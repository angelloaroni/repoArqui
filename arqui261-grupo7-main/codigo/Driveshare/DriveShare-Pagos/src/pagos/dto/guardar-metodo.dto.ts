import { IsInt, IsString } from 'class-validator';

/** Guardado de un método de pago tokenizado (RF38). */
export class GuardarMetodoDto {
  @IsInt()
  idUsuario: number;

  // El frontend tokeniza la tarjeta con Culqi.js y envía SOLO el token, nunca el PAN.
  @IsString()
  token: string;
}
