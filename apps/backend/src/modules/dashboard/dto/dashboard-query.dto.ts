import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsDateString } from 'class-validator';

export class DashboardQueryDto {
  @ApiPropertyOptional({
    description: 'Ngày bắt đầu (ISO 8601, YYYY-MM-DD)',
    example: '2026-03-01',
  })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiPropertyOptional({
    description: 'Ngày kết thúc (ISO 8601, YYYY-MM-DD)',
    example: '2026-03-31',
  })
  @IsOptional()
  @IsDateString()
  endDate?: string;
}
