import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private readonly jwt: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest();
    const token = this.extraerToken(req);
    if (!token) throw new UnauthorizedException('Token no enviado');
    try {
      req.usuario = await this.jwt.verifyAsync(token);
    } catch {
      throw new UnauthorizedException('Token inválido o vencido');
    }
    return true;
  }

  private extraerToken(req: any): string | undefined {
    if (req.cookies?.['access_token']) return req.cookies['access_token'];
    const [tipo, token] = req.headers?.authorization?.split(' ') ?? [];
    return tipo === 'Bearer' ? token : undefined;
  }
}