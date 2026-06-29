import {
  Controller,
  Post,
  Body,
  BadRequestException,
  Patch,
  Param,
  ParseIntPipe,
  Get,
  Delete,
  Query,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  UploadedFiles,
} from '@nestjs/common';
import { FileInterceptor, FileFieldsInterceptor } from '@nestjs/platform-express';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UserQueryDto } from './dto/user-query.dto';
import { AdminCreateUserDto } from './dto/admin-create-user.dto';
import { AdminUpdateUserDto } from './dto/admin-update-user.dto';
import { AppSwaggerTag } from '../swagger/swagger.constant';
import {
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiBearerAuth,
  ApiParam,
  ApiConsumes,
  ApiBody,
  ApiQuery,
} from '@nestjs/swagger';
import { Public } from 'src/decorators/public.decorator';
import { CustomMessage } from 'src/common/decorators/custom-message.decorator';
import { RegisterResponseDto } from './responses/register.response';
import { UpdateUserRoleDto } from './dto/update-user-role.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { CurrentUser } from 'src/decorators/current-user.decorator';
import { ICurrentUser } from 'src/interfaces/current-user.interface';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { Permissions } from 'src/decorators/permissions.decorator';
import { PermissionEnum } from 'src/libs/enums/permission.enum';

import { UploadService } from '../upload/upload.service';
import { UserResponseDto } from './responses/user.response';
import { UserListResponseDto } from './responses/user-list.response';
import { UserWithPermissionsResponseDto } from './responses/user-permissions.response';
import { SuccessResponseDto } from 'src/common/dto/success-response.dto';

@ApiTags(AppSwaggerTag.User)
@Controller('users')
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly uploadService: UploadService,
  ) {}

  @ApiOperation({ summary: 'Register a new user' })
  @Public()
  @CustomMessage('Đăng ký thành công')
  @Post('register')
  @ApiOkResponse({ type: RegisterResponseDto })
  async register(@Body() data: CreateUserDto) {
    try {
      return await this.userService.register(data);
    } catch (err) {
      throw new BadRequestException(err.message);
    }
  }

  @ApiOperation({ summary: 'Update user profile' })
  @CustomMessage('Cập nhật thông tin profile thành công')
  @Patch('profile')
  @ApiOkResponse({ description: 'User profile updated', type: UserResponseDto })
  async updateProfile(
    @CurrentUser() user: ICurrentUser,
    @Body() data: UpdateProfileDto,
  ) {
    return await this.userService.updateProfile(user.userId, data);
  }

  @ApiOperation({ summary: 'Update user avatar' })
  @CustomMessage('Cập nhật avatar thành công')
  @Patch('profile/avatar')
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        avatar: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @UseInterceptors(FileInterceptor('avatar'))
  @ApiOkResponse({ description: 'User avatar updated', type: UserResponseDto })
  async updateAvatar(
    @CurrentUser() user: ICurrentUser,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) throw new BadRequestException('File is required');
    const url = await this.uploadService.uploadFile(file, 'avatars');
    return await this.userService.updateAvatar(user.userId, url);
  }

  @ApiOperation({ summary: 'Update user background' })
  @CustomMessage('Cập nhật background thành công')
  @Patch('profile/background')
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        background: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @UseInterceptors(FileInterceptor('background'))
  @ApiOkResponse({ description: 'User background updated', type: UserResponseDto })
  async updateBackground(
    @CurrentUser() user: ICurrentUser,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) throw new BadRequestException('File is required');
    const url = await this.uploadService.uploadFile(file, 'backgrounds');
    return await this.userService.updateBackground(user.userId, url);
  }

  @ApiOperation({ summary: 'Change password' })
  @CustomMessage('Đổi mật khẩu thành công')
  @Patch('change-password')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOkResponse({ description: 'Password changed', type: SuccessResponseDto })
  async changePassword(
    @CurrentUser() user: ICurrentUser,
    @Body() data: ChangePasswordDto,
  ) {
    return await this.userService.changePassword(user.userId, data);
  }

  @ApiOperation({ summary: 'Get all users (Admin)' })
  @CustomMessage('Lấy danh sách người dùng thành công')
  @Get()
  @UseGuards(JwtAuthGuard)
  @Permissions(PermissionEnum.USER_READ)
  @ApiBearerAuth()
  @ApiOkResponse({ description: 'List of users', type: UserListResponseDto })
  async findAll(@Query() query: UserQueryDto) {
    return await this.userService.findAll(query);
  }

  @ApiOperation({ summary: 'Get user by ID' })
  @CustomMessage('Lấy thông tin người dùng thành công')
  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @Permissions(PermissionEnum.USER_READ)
  @ApiBearerAuth()
  @ApiParam({ name: 'id', description: 'User ID', type: Number })
  @ApiOkResponse({ description: 'User details', type: UserResponseDto })
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return await this.userService.findOne(id);
  }

  @ApiOperation({ summary: 'Delete user' })
  @CustomMessage('Xóa người dùng thành công')
  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @Permissions(PermissionEnum.USER_DELETE)
  @ApiBearerAuth()
  @ApiParam({ name: 'id', description: 'User ID', type: Number })
  @ApiOkResponse({ description: 'User deleted', type: SuccessResponseDto })
  async delete(@Param('id', ParseIntPipe) id: number) {
    return await this.userService.delete(id);
  }

  @ApiOperation({ summary: 'Create user (Admin)' })
  @CustomMessage('Tạo người dùng thành công')
  @Post()
  @UseGuards(JwtAuthGuard)
  @Permissions(PermissionEnum.USER_CREATE)
  @ApiBearerAuth()
  @ApiConsumes('multipart/form-data')
  @ApiBody({ type: AdminCreateUserDto })
  @UseInterceptors(FileFieldsInterceptor([
    { name: 'avatar', maxCount: 1 },
    { name: 'background', maxCount: 1 },
  ]))
  @ApiOkResponse({ description: 'User created', type: UserResponseDto })
  async create(
    @Body() data: AdminCreateUserDto,
    @UploadedFiles() files: { avatar?: Express.Multer.File[]; background?: Express.Multer.File[] },
  ) {
    return await this.userService.adminCreate(data, files);
  }

  @ApiOperation({ summary: 'Update user (Admin)' })
  @CustomMessage('Cập nhật người dùng thành công')
  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @Permissions(PermissionEnum.USER_UPDATE)
  @ApiBearerAuth()
  @ApiConsumes('multipart/form-data')
  @ApiParam({ name: 'id', description: 'User ID', type: Number })
  @ApiBody({ type: AdminUpdateUserDto })
  @UseInterceptors(FileFieldsInterceptor([
    { name: 'avatar', maxCount: 1 },
    { name: 'background', maxCount: 1 },
  ]))
  @ApiOkResponse({ description: 'User updated', type: UserResponseDto })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() data: AdminUpdateUserDto,
    @UploadedFiles() files: { avatar?: Express.Multer.File[]; background?: Express.Multer.File[] },
  ) {
    return await this.userService.adminUpdate(id, data, files);
  }

  @ApiOperation({ summary: 'Update user role' })
  @CustomMessage('Cập nhật role cho user thành công')
  @Patch(':id/role')
  @UseGuards(JwtAuthGuard)
  @Permissions(PermissionEnum.USER_UPDATE_ROLE)
  @ApiBearerAuth()
  @ApiParam({
    name: 'id',
    description: 'User ID',
    type: Number,
  })
  @ApiOkResponse({ description: 'User role updated', type: UserResponseDto })
  async updateUserRole(
    @Param('id', ParseIntPipe) userId: number,
    @Body() data: UpdateUserRoleDto,
  ) {
    return await this.userService.updateUserRole(userId, data.roleId);
  }

  @ApiOperation({ summary: 'Get user with permissions' })
  @CustomMessage('Lấy thông tin user với permissions')
  @Get(':id/permissions')
  @UseGuards(JwtAuthGuard)
  @Permissions(PermissionEnum.USER_READ)
  @ApiBearerAuth()
  @ApiParam({
    name: 'id',
    description: 'User ID',
    type: Number,
  })
  @ApiOkResponse({ description: 'User with permissions', type: UserWithPermissionsResponseDto })
  async getUserWithPermissions(@Param('id', ParseIntPipe) userId: number) {
    return await this.userService.getUserWithPermissions(userId);
  }
}
