import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiOkResponse,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiBearerAuth,
  ApiConflictResponse,
} from '@nestjs/swagger';
import { SettingsService } from './settings.service';
import { CreateSettingDto } from './dto/create-setting.dto';
import { UpdateSettingDto } from './dto/update-setting.dto';
import { SettingResponse } from './responses/setting.response';
import { Public } from 'src/decorators/public.decorator';
import { Permissions } from 'src/decorators/permissions.decorator';
import { PermissionEnum } from 'src/libs/enums/permission.enum';
import { SuccessResponseDto } from 'src/common/dto/success-response.dto';

@ApiTags('Settings')
@Controller('settings')
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  @ApiOperation({ summary: 'Get public settings' })
  @ApiOkResponse({ description: 'Object containing public key-value pairs' })
  @Public()
  @Get('public')
  getPublicSettings() {
    return this.settingsService.getPublicSettings();
  }

  @ApiOperation({ summary: 'Create Setting' })
  @ApiCreatedResponse({
    description: 'The Setting has been created.',
    type: SettingResponse,
  })
  @ApiConflictResponse({ description: 'Setting key already exists' })
  @ApiBearerAuth()
  @Permissions(PermissionEnum.SETTING_CREATE)
  @Post()
  create(@Body() createSettingDto: CreateSettingDto) {
    return this.settingsService.create(createSettingDto);
  }

  @ApiOperation({ summary: 'Get all Settings (Admin)' })
  @ApiOkResponse({
    description: 'List of all Settings',
    type: [SettingResponse],
  })
  @ApiBearerAuth()
  @Permissions(PermissionEnum.SETTING_READ)
  @Get()
  findAll() {
    return this.settingsService.findAll(true);
  }

  @ApiOperation({ summary: 'Get Setting by ID' })
  @ApiOkResponse({ description: 'The Setting found', type: SettingResponse })
  @ApiNotFoundResponse({ description: 'Setting not found' })
  @ApiBearerAuth()
  @Permissions(PermissionEnum.SETTING_READ)
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.settingsService.findOne(id);
  }

  @ApiOperation({ summary: 'Update Setting' })
  @ApiOkResponse({
    description: 'The Setting has been updated.',
    type: SettingResponse,
  })
  @ApiNotFoundResponse({ description: 'Setting not found' })
  @ApiBearerAuth()
  @Permissions(PermissionEnum.SETTING_UPDATE)
  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateSettingDto: UpdateSettingDto,
  ) {
    return this.settingsService.update(id, updateSettingDto);
  }

  @ApiOperation({ summary: 'Delete Setting' })
  @ApiOperation({ summary: 'Delete Setting' })
  @ApiOkResponse({ description: 'The Setting has been deleted.', type: SuccessResponseDto })
  @ApiNotFoundResponse({ description: 'Setting not found' })
  @ApiBearerAuth()
  @Permissions(PermissionEnum.SETTING_DELETE)
  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number) {
    await this.settingsService.remove(id);
    return { success: true };
  }
}
