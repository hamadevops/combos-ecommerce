import { PermissionService } from './permission.service';
import { Module } from '@nestjs/common';
import { PermissionController } from './permission.controller';
import { MikroOrmModule } from '@mikro-orm/nestjs/mikro-orm.module';
import { Permission } from 'src/database/entities/permission.entity';
import { PermissionGroup } from 'src/database/entities/permission-group.entity';
import { RolePermission } from 'src/database/entities/role-permission.entity';
import { Role } from 'src/database/entities/role.entity';
import { JwtStrategy } from '../auth/strategies/jwt.strategy';
import { PassportModule } from '@nestjs/passport';

@Module({
  imports: [
    MikroOrmModule.forFeature([Permission, PermissionGroup, RolePermission, Role]),
    PassportModule,
  ],
  controllers: [PermissionController],
  providers: [PermissionService, JwtStrategy],
  exports: [PermissionService, JwtStrategy, PassportModule],
})
export class PermissionModule {}
