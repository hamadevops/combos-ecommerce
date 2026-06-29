import { BadRequestException, Injectable, Inject, NotFoundException, forwardRef } from '@nestjs/common';
import { EntityManager, EntityRepository } from '@mikro-orm/mysql';
import { User } from 'src/database/entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { UserQueryDto } from './dto/user-query.dto';
import { hashPassword, comparePassword } from 'src/common/utils/password.util';
import { InjectRepository } from '@mikro-orm/nestjs';
import { Role } from 'src/database/entities/role.entity';
import { AuthService } from '../auth/auth.service';
import { RegisterResponse } from './responses/register.response';
import { CustomBadRequestException } from 'src/common/exceptions/custom-exceptions';
import { UploadService } from '../upload/upload.service';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepo: EntityRepository<User>,
    @Inject(EntityManager)
    private readonly em: EntityManager,
    @Inject(forwardRef(() => AuthService))
    private readonly authService: AuthService,
    private readonly uploadService: UploadService,
  ) {}

  async findAll(query: UserQueryDto) {
    const { page = 1, limit = 10, search, roleId } = query;
    const offset = (page - 1) * limit;

    const where: any = {};

    if (search) {
      where.$or = [
        { name: { $like: `%${search}%` } },
        { email: { $like: `%${search}%` } },
      ];
    }

    if (roleId) {
      where.role = { id: roleId };
    }

    const [users, total] = await this.userRepo.findAndCount(where, {
      populate: ['role'],
      limit,
      offset,
      orderBy: { created_at: 'DESC' },
    });

    return {
      data: users.map((user) => ({
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        avatar: user.avatar,
        bio: user.bio,
        background: user.background,
        role: user.role
          ? { id: user.role.id, name: user.role.name, key: user.role.key }
          : null,
        createdAt: user.created_at,
        updatedAt: user.updated_at,
        isActive: true,
      })),
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: number) {
    const user = await this.userRepo.findOne(
      { id },
      { populate: ['role', 'role.rolePermissions', 'role.rolePermissions.permission'] },
    );

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const permissions = user.role?.rolePermissions
      .getItems()
      .map((rp) => rp.permission);

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      avatar: user.avatar,
      bio: user.bio,
      background: user.background,
      role: user.role
        ? { 
            id: user.role.id, 
            name: user.role.name, 
            key: user.role.key,
            permissions: permissions || [] 
          }
        : null,
      createdAt: user.created_at,
      updatedAt: user.updated_at,
      isActive: true,
    };
  }

  async delete(id: number) {
    const user = await this.userRepo.findOne({ id });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    await this.em.removeAndFlush(user);
    return { success: true, message: 'User deleted successfully' };
  }

  async adminCreate(
    data: { name: string; email: string; password: string; roleId?: number; bio?: string; phone?: string; avatar?: string; background?: string },
    files?: { avatar?: Express.Multer.File[]; background?: Express.Multer.File[] }
  ) {
    const existing = await this.userRepo.findOne({ email: data.email });
    if (existing) {
      throw new BadRequestException('Email already in use');
    }

    const hashedPassword = await hashPassword(data.password);
    
    let role: Role | null = null;
    if (data.roleId) {
      role = await this.em.findOne(Role, { id: data.roleId });
      if (!role) {
        throw new BadRequestException('Role not found');
      }
    } else {
      role = await this.em.findOne(Role, { key: 'member' });
    }

    let avatarUrl = data.avatar;
    if (files?.avatar?.[0]) {
      avatarUrl = await this.uploadService.uploadFile(files.avatar[0], 'avatars');
    }

    let backgroundUrl = data.background;
    if (files?.background?.[0]) {
      backgroundUrl = await this.uploadService.uploadFile(files.background[0], 'backgrounds');
    }

    const user = this.userRepo.create({
      name: data.name,
      email: data.email,
      password: hashedPassword,
      role: role,
      bio: data.bio,
      phone: data.phone,
      avatar: avatarUrl,
      background: backgroundUrl,
    });
    await this.em.persistAndFlush(user);

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      avatar: user.avatar,
      bio: user.bio,
      background: user.background,
      role: user.role
        ? { id: user.role.id, name: user.role.name, key: user.role.key }
        : null,
      createdAt: user.created_at,
      updatedAt: user.updated_at,
      isActive: true,
    };
  }

  async adminUpdate(
    id: number,
    data: { name?: string; email?: string; password?: string; roleId?: number; bio?: string; phone?: string; background?: string; avatar?: string },
    files?: { avatar?: Express.Multer.File[]; background?: Express.Multer.File[] }
  ) {
    const user = await this.userRepo.findOne({ id }, { populate: ['role'] });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (data.name) user.name = data.name;
    if (data.bio !== undefined) user.bio = data.bio;
    if (data.phone !== undefined) user.phone = data.phone;
    if (data.background !== undefined) user.background = data.background;
    if (data.avatar !== undefined) user.avatar = data.avatar;

    if (files?.avatar?.[0]) {
      console.log(files.avatar[0]);
      user.avatar = await this.uploadService.uploadFile(files.avatar[0], 'avatars');
    }

    if (files?.background?.[0]) {
      user.background = await this.uploadService.uploadFile(files.background[0], 'backgrounds');
    }

    if (data.email && data.email !== user.email) {
      const existingEmail = await this.userRepo.findOne({ email: data.email });
      if (existingEmail) {
        throw new BadRequestException('Email already in use');
      }
      user.email = data.email;
    }

    if (data.password) {
      user.password = await hashPassword(data.password);
    }

    if (data.roleId) {
      const role = await this.em.findOne(Role, { id: data.roleId });
      if (!role) {
        throw new BadRequestException('Role not found');
      }
      user.role = role;
    }

    await this.em.flush();

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      avatar: user.avatar,
      bio: user.bio,
      background: user.background,
      role: user.role
        ? { id: user.role.id, name: user.role.name, key: user.role.key }
        : null,
      createdAt: user.created_at,
      updatedAt: user.updated_at,
      isActive: true,
    };
  }

  async register(data: CreateUserDto): Promise<RegisterResponse> {
    const existing = await this.userRepo.findOne({ email: data.email });
    if (existing) {
      throw new BadRequestException('Email already in use');
    }
    const hashedPassword = await hashPassword(data.password);
    const member = await this.em.findOne(Role, { key: 'member' });
    const user = this.userRepo.create({
      name: data.name,
      email: data.email,
      password: hashedPassword,
      role: member,
    });
    await this.em.persistAndFlush(user);
    const rest = await this.authService.login({
      email: data.email,
      password: data.password,
    });
    return rest;
  }

  async updateUserRole(userId: number, roleId: number) {
    return this.em.transactional(async (em) => {
      const user = await em.findOne(User, { id: userId });
      if (!user) {
        throw new CustomBadRequestException('User not found');
      }

      const role = await em.findOne(Role, { id: roleId });
      if (!role) {
        throw new CustomBadRequestException('Role not found');
      }

      user.role = role;
      await em.flush();

      return {
        id: user.id,
        name: user.name,
        email: user.email,
        role: {
          id: role.id,
          name: role.name,
          key: role.key,
        },
      };
    });
  }

  async getUserWithPermissions(userId: number) {
    const user = await this.em.findOne(
      User,
      { id: userId },
      {
        populate: [
          'role',
          'role.rolePermissions',
          'role.rolePermissions.permission',
        ],
      },
    );

    if (!user) {
      throw new CustomBadRequestException('User not found');
    }

    const permissions = user.role?.rolePermissions
      .getItems()
      .map((rp) => rp.permission);

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role
        ? {
            id: user.role.id,
            name: user.role.name,
            key: user.role.key,
          }
        : null,
      permissions: permissions || [],
    };
  }

  async updateProfile(userId: number, data: UpdateProfileDto) {
    const user = await this.userRepo.findOne({ id: userId });
    if (!user) {
      throw new CustomBadRequestException('User not found');
    }
    if (data.name) user.name = data.name;
    if (data.bio !== undefined) user.bio = data.bio;
    if (data.phone !== undefined) user.phone = data.phone;

    await this.em.flush();

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      avatar: user.avatar,
      bio: user.bio,
      background: user.background,
    };
  }

  async updateAvatar(userId: number, avatar: string) {
    const user = await this.userRepo.findOne({ id: userId });
    if (!user) {
      throw new CustomBadRequestException('User not found');
    }

    user.avatar = avatar;
    await this.em.flush();

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      avatar: user.avatar,
      bio: user.bio,
      background: user.background,
    };
  }

  async updateBackground(userId: number, background: string) {
    const user = await this.userRepo.findOne({ id: userId });
    if (!user) {
      throw new CustomBadRequestException('User not found');
    }

    user.background = background;
    await this.em.flush();

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      avatar: user.avatar,
      bio: user.bio,
      background: user.background,
    };
  }

  async changePassword(userId: number, data: ChangePasswordDto) {
    const user = await this.userRepo.findOne({ id: userId });
    if (!user) {
      throw new CustomBadRequestException('User not found');
    }

    const isPasswordValid = await comparePassword(
      data.oldPassword,
      user.password,
    );
    if (!isPasswordValid) {
      throw new CustomBadRequestException('Mật khẩu cũ không chính xác');
    }

    user.password = await hashPassword(data.newPassword);
    await this.em.flush();

    return { success: true };
  }
}
