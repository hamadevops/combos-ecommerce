import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  ParseIntPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiOkResponse,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { AppFeedbacksService } from './app-feedbacks.service';
import { CreateAppFeedbackDto } from './dto/create-app-feedback.dto';
import { UpdateAppFeedbackDto } from './dto/update-app-feedback.dto';
import { AppFeedbackQueryDto } from './dto/app-feedback-query.dto';
import { AppFeedbackResponseDto } from './dto/app-feedback-response.dto';
import { Public } from 'src/decorators/public.decorator';
import { Permissions } from 'src/decorators/permissions.decorator';
import { PermissionEnum } from 'src/libs/enums/permission.enum';
import { SuccessResponseDto } from 'src/common/dto/success-response.dto';

@ApiTags('App Feedbacks')
@Controller('app-feedbacks')
export class AppFeedbacksController {
  constructor(private readonly appFeedbacksService: AppFeedbacksService) {}

  @ApiOperation({ summary: 'Get all active app feedbacks (Public)' })
  @ApiOkResponse({ description: 'List of active app feedbacks', type: [AppFeedbackResponseDto] })
  @Public()
  @Get()
  findAllPublic(@Query() query: AppFeedbackQueryDto) {
    return this.appFeedbacksService.findAll({
      ...query,
      isActive: true, // Only show active on public frontend
    });
  }

  @ApiOperation({ summary: 'Create a new app feedback' })
  @ApiCreatedResponse({ description: 'App feedback created successfully.', type: AppFeedbackResponseDto })
  @ApiBearerAuth()
  @Permissions(PermissionEnum.APP_FEEDBACK_CREATE)
  @Post()
  create(@Body() createDto: CreateAppFeedbackDto) {
    return this.appFeedbacksService.create(createDto);
  }

  @ApiOperation({ summary: 'Get all app feedbacks (Admin)' })
  @ApiOkResponse({ description: 'List of all app feedbacks', type: [AppFeedbackResponseDto] })
  @ApiBearerAuth()
  @Permissions(PermissionEnum.APP_FEEDBACK_READ)
  @Get('admin')
  findAllAdmin(@Query() query: AppFeedbackQueryDto) {
    return this.appFeedbacksService.findAll(query);
  }

  @ApiOperation({ summary: 'Get app feedback by ID' })
  @ApiOkResponse({ description: 'App feedback details', type: AppFeedbackResponseDto })
  @ApiNotFoundResponse({ description: 'App feedback not found' })
  @Public()
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.appFeedbacksService.findOne(id);
  }

  @ApiOperation({ summary: 'Update an app feedback' })
  @ApiOkResponse({ description: 'App feedback updated successfully.', type: AppFeedbackResponseDto })
  @ApiNotFoundResponse({ description: 'App feedback not found' })
  @ApiBearerAuth()
  @Permissions(PermissionEnum.APP_FEEDBACK_UPDATE)
  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDto: UpdateAppFeedbackDto,
  ) {
    return this.appFeedbacksService.update(id, updateDto);
  }

  @ApiOperation({ summary: 'Delete an app feedback' })
  @ApiOkResponse({ description: 'App feedback deleted successfully.', type: SuccessResponseDto })
  @ApiNotFoundResponse({ description: 'App feedback not found' })
  @ApiBearerAuth()
  @Permissions(PermissionEnum.APP_FEEDBACK_DELETE)
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.appFeedbacksService.remove(id);
  }
}
