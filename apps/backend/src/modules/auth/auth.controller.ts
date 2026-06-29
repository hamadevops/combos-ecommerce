// auth/auth.controller.ts
import {
  Body,
  Controller,
  Post,
  UseGuards,
  Get,
  Request,
} from '@nestjs/common';
import { LoginDto } from './dto/login.dto';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { AppSwaggerTag } from '../swagger/swagger.constant';
import { Public } from 'src/decorators/public.decorator';
import { CustomMessage } from 'src/common/decorators/custom-message.decorator';
import { LoginResponseDto } from './responses/login.response';
import { UserResponseDto } from '../user/responses/user.response';

import type { AppRequest } from 'src/common/interfaces/request.interface';
import { Permissions } from 'src/decorators/permissions.decorator';
import { PermissionEnum } from 'src/libs/enums/permission.enum';

import { UserService } from '../user/user.service';

@ApiTags(AppSwaggerTag.Auth)
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly userService: UserService,
  ) {}

  @ApiOperation({ summary: 'Login to the application' })
  @CustomMessage('Đăng nhập thành công')
  @Public()
  @Post('login')
  @ApiOkResponse({ description: 'Login successfully', type: LoginResponseDto })
  async login(@Body() payload: LoginDto) {
    return this.authService.login(payload);
  }

  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get user profile' })
  @ApiBearerAuth()
  @ApiOkResponse({ description: 'User profile', type: UserResponseDto })
  @Get('profile')
  getProfile(@Request() req: AppRequest) {
    return this.userService.findOne(req.user.userId);
  }
}
