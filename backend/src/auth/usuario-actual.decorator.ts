import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export class UsuarioToken {
  sub: string;
  nombreUsuario: string;
  perfil: string;
  exp?: number;
  iat?: number;
}

export const UsuarioActual = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext) => ctx.switchToHttp().getRequest().usuario,
);