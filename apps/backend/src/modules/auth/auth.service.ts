// auth/auth.service.ts
import { EntityManager, EntityRepository } from '@mikro-orm/mysql';
import { InjectRepository } from '@mikro-orm/nestjs';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { User } from 'src/database/entities/user.entity';
import { LoginDto } from './dto/login.dto';
import { comparePassword } from 'src/common/utils/password.util';

@Injectable()
export class AuthService {
  // Giả lập user DB

  constructor(
    @InjectRepository(User)
    private readonly userRepo: EntityRepository<User>,
    private readonly em: EntityManager,
    private readonly jwtService: JwtService,
  ) { }

  async validateUser(
    email: string,
    password: string,
  ): Promise<Omit<User, 'password'> | null> {
    const user = await this.userRepo.findOne(
      { email },
      { fields: ['id', 'email', 'password'] },
    );
    if (!user) return null;
    const match = await comparePassword(password, user.password);
    if (!match) return null;
    const res = await this.em.findOne(User, user.id, {
      fields: ['id', 'email', 'name', 'role'],
      populate: [
        'role',
        'role.rolePermissions',
        'role.rolePermissions.permission',
      ],
    });
    return res;
  }

  async login(body: LoginDto) {
    const user = await this.validateUser(body.email, body.password);
    if (!user) throw new UnauthorizedException('Invalid credentials');
    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role?.key,
    };
    return {
      access_token: await this.jwtService.signAsync(payload),
    };
  }
}
