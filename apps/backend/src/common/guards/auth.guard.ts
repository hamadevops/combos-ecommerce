import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { Reflector } from '@nestjs/core';
import { CustomForbiddenException } from 'src/common/exceptions/custom-exceptions';
import { IS_PUBLIC_KEY } from 'src/decorators/public.decorator';
import { PERMISSIONS_KEY } from 'src/decorators/permissions.decorator';
import { ROLES_KEY } from 'src/decorators/roles.decorator';
import { JwtPayload, RequestUser } from 'src/modules/auth/responses/jwt.response';
import { RoleEnum } from 'src/libs/enums/role.enum';
import { ConfigService } from '@nestjs/config';
import { EntityManager } from '@mikro-orm/mysql';
import { Role } from 'src/database/entities/role.entity';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly reflector: Reflector,
    private readonly configService: ConfigService,
    private readonly em: EntityManager,
  ) { }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = this.extractTokenFromHeader(request);

    // Check if endpoint is public
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!token) {
      if (isPublic) {
        return true;
      }
      throw new UnauthorizedException();
    }

    try {
      const payload = await this.jwtService.verifyAsync<JwtPayload>(token, {
        secret: this.configService.get<string>('JWT_SECRET'),
      });

      // Build user object from payload
      const user: RequestUser = {
        ...payload,
        id: payload.sub,
        userId: payload.sub,
      };

      request['user'] = user;

      // If public endpoint, allow access even with token
      if (isPublic) {
        return true;
      }

      // Admin bypass - admin has access to everything
      if (user.role === RoleEnum.ADMIN) {
        return true;
      }

      // Check roles using decorator
      const requiredRoles = this.reflector.getAllAndOverride<string[]>(
        ROLES_KEY,
        [context.getHandler(), context.getClass()],
      );

      if (requiredRoles && requiredRoles.length > 0) {
        return this.checkRoles(user, requiredRoles);
      }

      // Check permissions using decorator
      const requiredPermissions = this.reflector.getAllAndOverride<string[]>(
        PERMISSIONS_KEY,
        [context.getHandler(), context.getClass()],
      );

      if (requiredPermissions && requiredPermissions.length > 0) {
        // Fetch permissions from database
        const permissions = await this.fetchUserPermissions(user.role);
        user.permissions = permissions;
        return this.checkPermissions(permissions, requiredPermissions);
      }

      // If neither permissions nor roles are specified, allow access for authenticated user
      return true;
    } catch {
      throw new CustomForbiddenException('Invalid token');
    }
  }

  /**
   * Fetch user permissions from database based on role key
   */
  private async fetchUserPermissions(roleKey: string): Promise<string[]> {
    const role = await this.em.findOne(
      Role,
      { key: roleKey },
      { populate: ['rolePermissions.permission'] },
    );

    if (!role) {
      return [];
    }

    return role.rolePermissions.getItems().map((rp) => rp.permission.key);
  }

  /**
   * Check if user has required permissions by permission keys
   */
  private checkPermissions(
    userPermissions: string[],
    requiredPermissions: string[],
  ): boolean {
    // User must have at least one of the required permissions
    return requiredPermissions.some((permission) =>
      userPermissions.includes(permission),
    );
  }

  /**
   * Check if user has required roles
   */
  private checkRoles(user: RequestUser, requiredRoles: string[]): boolean {
    if (!user?.role) {
      return false;
    }
    return requiredRoles.includes(user.role);
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}
