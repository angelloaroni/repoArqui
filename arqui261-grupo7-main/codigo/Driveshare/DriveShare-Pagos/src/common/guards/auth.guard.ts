import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';

/**
 * Guard de autenticación (capa de seguridad de la Arquitectura en Capas, 8.4 Decisión 1).
 *
 * Centraliza el control de acceso a las reglas financieras (patrón Cliente-Servidor,
 * 8.4 Decisión 2). En producción validaría el JWT contra el módulo de Usuarios; aquí
 * se deja el punto de extensión con una verificación básica de token Bearer.
 */
@Injectable()
export class AuthGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest();
    const auth: string | undefined = req.headers['authorization'];
    if (!auth || !auth.startsWith('Bearer ')) {
      throw new UnauthorizedException('Token de autorización requerido');
    }
    // TODO: verificar la firma del JWT / consultar al microservicio de Usuarios.
    return true;
  }
}
