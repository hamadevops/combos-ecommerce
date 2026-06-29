import { IsDateString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SchedulePostDto {
  @ApiProperty({
    example: '2025-12-31T00:00:00Z',
    description: 'Publication date and time',
  })
  @IsDateString()
  published_at: string;
}
