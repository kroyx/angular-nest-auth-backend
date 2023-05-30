import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AuthService } from '../auth.service';
import { JwtPayload } from '../interfaces/jwt-payload';

@Injectable()
export class AuthGuard implements CanActivate {

  constructor(
    private jwtService: JwtService,
    private authService: AuthService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {

    const request = context.switchToHttp()
      .getRequest();
    const token = this.extractTokenFromHeader(request);

    if (!token) {
      throw new UnauthorizedException('El usuario no está autenticado');
    }

    try { // Comprueba si el token ha sido generado con la misma semilla
      const payload = await this.jwtService.verifyAsync<JwtPayload>(
        token, { secret: process.env.JWT_SEED },
      );

      const user = await this.authService.findUserById(payload.id);
      if (!user) throw new UnauthorizedException('El usuario no existe');
      if (!user.isActive) throw new UnauthorizedException('El usuario no está activo');

      request['user'] = user;
    } catch (error) {
      throw new UnauthorizedException('Token no válido');
    }

    return true;
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [ type, token ] = request.headers['authorization']?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}
