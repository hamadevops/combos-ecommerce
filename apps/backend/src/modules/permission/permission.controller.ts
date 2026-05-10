/*
src/modules/permission/permisson.controller.ts
*/

import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { AppSwaggerTag } from '../swagger/swagger.constant';
import { CustomMessage } from 'src/common/decorators/custom-message.decorator';
import { RoleCreateDto } from './dto/role-create.dto';
import { PermissionService } from './permission.service';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { CreatePermissionDto } from './dto/permission-create.dto';
import { AssignPermissionDto } from './dto/assign-permission.dto';
import { UpdatePermissionDto } from './dto/update-permission.dto';
import { RoleQueryDto } from './dto/role-query.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { PermissionQueryDto } from './dto/permission-query.dto';
import { Permissions } from 'src/decorators/permissions.decorator';
import { PermissionEnum } from 'src/libs/enums/permission.enum';
import { SuccessResponseDto } from 'src/common/dto/success-response.dto';
import { RoleResponseDto, PermissionListResponseDto, PermissionResponseDto } from './responses/permission-role.response';
import { UserRolePermissionsResponseDto } from './responses/user-role-permissions.response';
import { CreatePermissionGroupDto } from './dto/permission-group-create.dto';
import { UpdatePermissionGroupDto } from './dto/permission-group-update.dto';
import { AssignPermissionsToGroupDto } from './dto/assign-permissions-to-group.dto';

@ApiTags(AppSwaggerTag.Permission)
@Controller()
export class PermissionController {
  constructor(private readonly permissionService: PermissionService) {}

  @ApiOperation({ summary: 'Get all roles' })
  @CustomMessage('Danh sách role')
  @Get('roles')
  @UseGuards(JwtAuthGuard)
  @Permissions(PermissionEnum.ROLE_READ)
  @ApiBearerAuth()
  @ApiOkResponse()
  async allRoles(@Query() query: RoleQueryDto) {
    const data = await this.permissionService.allRoles(query);
    return data;
  }

  @ApiOperation({ summary: 'Get Role Detail' })
  @CustomMessage('Danh sách role')
  @Get('roles/:id')
  @UseGuards(JwtAuthGuard)
  @Permissions(PermissionEnum.ROLE_READ)
  @ApiBearerAuth()
  @ApiOkResponse()
  async roleDetail(@Param('id', ParseIntPipe) id: number) {
    return await this.permissionService.detailRole(id);
  }

  @ApiOperation({ summary: 'Create a role' })
  @CustomMessage('Tạo role thành công')
  @Post('roles')
  @UseGuards(JwtAuthGuard)
  @Permissions(PermissionEnum.ROLE_CREATE)
  @ApiBearerAuth()
  @ApiOkResponse({ description: 'Role Created', type: RoleResponseDto })
  async create(@Body() data: RoleCreateDto) {
    return await this.permissionService.create(data);
  }

  @ApiOperation({ summary: 'Create a permission' })
  @CustomMessage('Gán quyền cho role thành công')
  @Post('permissions')
  @UseGuards(JwtAuthGuard)
  @Permissions(PermissionEnum.PERMISSION_CREATE)
  @ApiBearerAuth()
  @ApiOkResponse({ description: 'Permission Created', type: PermissionResponseDto })
  async createPermission(@Body() data: CreatePermissionDto) {
    return await this.permissionService.createPermission(data);
  }

  @ApiOperation({ summary: 'Assign permission to a role' })
  @CustomMessage('Gán quyền cho role thành công')
  @Post('roles/:id/permission')
  @UseGuards(JwtAuthGuard)
  @Permissions(PermissionEnum.PERMISSION_ASSIGN)
  @ApiBearerAuth()
  @ApiParam({
    name: 'id',
    description: 'Role ID',
    type: Number,
  })
  @ApiOkResponse({ description: 'Assign permission success' })
  async assignPermission(
    @Param('id', ParseIntPipe) roleId: number,
    @Body() data: AssignPermissionDto,
  ) {
    return this.permissionService.assignPermission(roleId, data);
  }

  @ApiOperation({ summary: 'Get all permissions' })
  @CustomMessage('Danh sách permissions')
  @Get('permissions')
  @UseGuards(JwtAuthGuard)
  @Permissions(PermissionEnum.PERMISSION_READ)
  @ApiBearerAuth()
  @ApiOkResponse({ description: 'List of permissions', type: PermissionListResponseDto })
  async getAllPermissions(@Query() query: PermissionQueryDto) {
    return await this.permissionService.getAllPermissions(query);
  }

  @ApiOperation({ summary: 'Update a permission' })
  @CustomMessage('Cập nhật quyền thành công')
  @Patch('permissions/:id')
  @UseGuards(JwtAuthGuard)
  @Permissions(PermissionEnum.PERMISSION_UPDATE)
  @ApiBearerAuth()
  @ApiParam({ name: 'id', description: 'Permission ID', type: Number })
  @ApiOkResponse({ description: 'Permission Updated', type: PermissionResponseDto })
  async updatePermission(
    @Param('id', ParseIntPipe) id: number,
    @Body() data: UpdatePermissionDto,
  ) {
    return await this.permissionService.updatePermission(id, data);
  }

  @ApiOperation({ summary: 'Delete a permission' })
  @CustomMessage('Xóa quyền thành công')
  @Delete('permissions/:id')
  @UseGuards(JwtAuthGuard)
  @Permissions(PermissionEnum.PERMISSION_DELETE)
  @ApiBearerAuth()
  @ApiParam({ name: 'id', description: 'Permission ID', type: Number })
  @ApiOkResponse({ description: 'Permission Deleted', type: SuccessResponseDto })
  async deletePermission(@Param('id', ParseIntPipe) id: number) {
    return await this.permissionService.deletePermission(id);
  }

  @ApiOperation({ summary: 'Update a role' })
  @CustomMessage('Cập nhật role thành công')
  @Patch('roles/:id')
  @UseGuards(JwtAuthGuard)
  @Permissions(PermissionEnum.ROLE_UPDATE)
  @ApiBearerAuth()
  @ApiParam({
    name: 'id',
    description: 'Role ID',
    type: Number,
  })
  @ApiOkResponse({ description: 'Role Updated', type: RoleResponseDto })
  async updateRole(
    @Param('id', ParseIntPipe) id: number,
    @Body() data: UpdateRoleDto,
  ) {
    return await this.permissionService.updateRole(id, data);
  }

  @ApiOperation({ summary: 'Delete a role' })
  @CustomMessage('Xóa role thành công')
  @Delete('roles/:id')
  @UseGuards(JwtAuthGuard)
  @Permissions(PermissionEnum.ROLE_DELETE)
  @ApiBearerAuth()
  @ApiParam({
    name: 'id',
    description: 'Role ID',
    type: Number,
  })
  @ApiOkResponse({ description: 'Role Deleted', type: SuccessResponseDto })
  async deleteRole(@Param('id', ParseIntPipe) id: number) {
    return await this.permissionService.deleteRole(id);
  }

  @ApiOperation({ summary: 'Remove permission from role' })
  @CustomMessage('Xóa quyền khỏi role thành công')
  @Delete('roles/:roleId/permissions/:permissionId')
  @UseGuards(JwtAuthGuard)
  @Permissions(PermissionEnum.PERMISSION_REVOKE)
  @ApiBearerAuth()
  @ApiParam({
    name: 'roleId',
    description: 'Role ID',
    type: Number,
  })
  @ApiParam({
    name: 'permissionId',
    description: 'Permission ID',
    type: Number,
  })
  @ApiOkResponse({ description: 'Permission Revoked', type: SuccessResponseDto })
  async removePermissionFromRole(
    @Param('roleId', ParseIntPipe) roleId: number,
    @Param('permissionId', ParseIntPipe) permissionId: number,
  ) {
    return await this.permissionService.removePermissionFromRole(
      roleId,
      permissionId,
    );
  }

  @ApiOperation({ summary: 'Get user permissions' })
  @CustomMessage('Danh sách quyền của user')
  @Get('users/:userId/permissions')
  @UseGuards(JwtAuthGuard)
  @Permissions(PermissionEnum.USER_READ)
  @ApiBearerAuth()
  @ApiParam({
    name: 'userId',
    description: 'User ID',
    type: Number,
  })
  @ApiOkResponse({ description: 'User Permissions', type: UserRolePermissionsResponseDto })
  async getUserPermissions(@Param('userId', ParseIntPipe) userId: number) {
    return await this.permissionService.getUserPermissions(userId);
  }

  // ========= Permission Groups =========

  @ApiOperation({ summary: 'Get grouped permissions' })
  @CustomMessage('Danh sách quyền theo nhóm')
  @Get('permissions/grouped')
  @UseGuards(JwtAuthGuard)
  @Permissions(PermissionEnum.PERMISSION_READ)
  @ApiBearerAuth()
  @ApiOkResponse({ description: 'Grouped permissions' })
  async getGroupedPermissions() {
    return await this.permissionService.getGroupedPermissions();
  }

  @ApiOperation({ summary: 'Get all permission groups' })
  @CustomMessage('Danh sách nhóm quyền')
  @Get('permission-groups')
  @UseGuards(JwtAuthGuard)
  @Permissions(PermissionEnum.PERMISSION_READ)
  @ApiBearerAuth()
  @ApiOkResponse({ description: 'List of permission groups' })
  async getAllPermissionGroups() {
    return await this.permissionService.getAllPermissionGroups();
  }

  @ApiOperation({ summary: 'Create a permission group' })
  @CustomMessage('Tạo nhóm quyền thành công')
  @Post('permission-groups')
  @UseGuards(JwtAuthGuard)
  @Permissions(PermissionEnum.PERMISSION_CREATE)
  @ApiBearerAuth()
  @ApiOkResponse({ description: 'Permission Group Created' })
  async createPermissionGroup(@Body() data: CreatePermissionGroupDto) {
    return await this.permissionService.createPermissionGroup(data);
  }

  @ApiOperation({ summary: 'Update a permission group' })
  @CustomMessage('Cập nhật nhóm quyền thành công')
  @Patch('permission-groups/:id')
  @UseGuards(JwtAuthGuard)
  @Permissions(PermissionEnum.PERMISSION_CREATE)
  @ApiBearerAuth()
  @ApiParam({ name: 'id', description: 'Permission Group ID', type: Number })
  @ApiOkResponse({ description: 'Permission Group Updated' })
  async updatePermissionGroup(
    @Param('id', ParseIntPipe) id: number,
    @Body() data: UpdatePermissionGroupDto,
  ) {
    return await this.permissionService.updatePermissionGroup(id, data);
  }

  @ApiOperation({ summary: 'Delete a permission group' })
  @CustomMessage('Xóa nhóm quyền thành công')
  @Delete('permission-groups/:id')
  @UseGuards(JwtAuthGuard)
  @Permissions(PermissionEnum.PERMISSION_CREATE)
  @ApiBearerAuth()
  @ApiParam({ name: 'id', description: 'Permission Group ID', type: Number })
  @ApiOkResponse({ description: 'Permission Group Deleted', type: SuccessResponseDto })
  async deletePermissionGroup(@Param('id', ParseIntPipe) id: number) {
    return await this.permissionService.deletePermissionGroup(id);
  }

  @ApiOperation({ summary: 'Assign permissions to a group' })
  @CustomMessage('Gán quyền vào nhóm thành công')
  @Post('permission-groups/:id/permissions')
  @UseGuards(JwtAuthGuard)
  @Permissions(PermissionEnum.PERMISSION_ASSIGN)
  @ApiBearerAuth()
  @ApiParam({ name: 'id', description: 'Permission Group ID', type: Number })
  @ApiOkResponse({ description: 'Permissions assigned to group' })
  async assignPermissionsToGroup(
    @Param('id', ParseIntPipe) id: number,
    @Body() data: AssignPermissionsToGroupDto,
  ) {
    return await this.permissionService.assignPermissionsToGroup(id, data);
  }

  @ApiOperation({ summary: 'Remove permissions from a group' })
  @CustomMessage('Bỏ quyền khỏi nhóm thành công')
  @Delete('permission-groups/:id/permissions')
  @UseGuards(JwtAuthGuard)
  @Permissions(PermissionEnum.PERMISSION_REVOKE)
  @ApiBearerAuth()
  @ApiParam({ name: 'id', description: 'Permission Group ID', type: Number })
  @ApiOkResponse({ description: 'Permissions removed from group', type: SuccessResponseDto })
  async removePermissionsFromGroup(
    @Param('id', ParseIntPipe) id: number,
    @Body() data: AssignPermissionsToGroupDto,
  ) {
    return await this.permissionService.removePermissionsFromGroup(id, data);
  }
}
