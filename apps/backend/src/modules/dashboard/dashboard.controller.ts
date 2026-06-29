import { Controller, Get, Query } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiOkResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { DashboardService } from './dashboard.service';
import { DashboardQueryDto } from './dto/dashboard-query.dto';
import { DashboardStatsResponseDto } from './dto/dashboard-response.dto';
import { AppSwaggerTag } from '../swagger/swagger.constant';
import { Permissions } from 'src/decorators/permissions.decorator';
import { PermissionEnum } from 'src/libs/enums/permission.enum';

@ApiTags(AppSwaggerTag.Dashboard)
@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @ApiOperation({ summary: 'Lấy thống kê tổng quan Dashboard' })
  @ApiBearerAuth()
  @Permissions(PermissionEnum.DASHBOARD_VIEW)
  @ApiOkResponse({
    description: 'Dữ liệu thống kê dashboard',
    type: DashboardStatsResponseDto,
  })
  @Get('stats')
  getStats(@Query() query: DashboardQueryDto) {
    return this.dashboardService.getStats(query);
  }
}
