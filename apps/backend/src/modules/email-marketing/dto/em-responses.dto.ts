import { ApiProperty } from '@nestjs/swagger';
import { PaginationMetaDto } from '../../../common/dto/pagination-meta.dto';
import { CreateEmContactDto } from './em-contact.dto';
import { CreateEmSegmentDto } from './em-segment.dto';
import { CreateEmTemplateDto } from './em-template.dto';
import { CreateEmCampaignDto } from './em-campaign.dto';

// --- Base DTOs with ID ---

export class EmContactDto extends CreateEmContactDto {
  @ApiProperty()
  id: number;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}

export class EmSegmentDto extends CreateEmSegmentDto {
  @ApiProperty()
  id: number;

  @ApiProperty()
  contactCount: number;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}

export class EmTemplateDto extends CreateEmTemplateDto {
  @ApiProperty()
  id: number;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}

export class EmCampaignDto extends CreateEmCampaignDto {
  @ApiProperty()
  id: number;

  @ApiProperty()
  status: string;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}

// --- List Responses ---

export class EmContactListResponseDto {
  @ApiProperty({ type: [EmContactDto] })
  data: EmContactDto[];

  @ApiProperty()
  meta: PaginationMetaDto;
}

export class EmSegmentListResponseDto {
  @ApiProperty({ type: [EmSegmentDto] })
  data: EmSegmentDto[];

  @ApiProperty()
  meta: PaginationMetaDto;
}

export class EmTemplateListResponseDto {
  @ApiProperty({ type: [EmTemplateDto] })
  data: EmTemplateDto[];

  @ApiProperty()
  meta: PaginationMetaDto;
}

export class EmCampaignListResponseDto {
  @ApiProperty({ type: [EmCampaignDto] })
  data: EmCampaignDto[];

  @ApiProperty()
  meta: PaginationMetaDto;
}

export class EmCampaignLogDto {
  @ApiProperty()
  id: number;

  @ApiProperty()
  email: string;

  @ApiProperty()
  status: string;

  @ApiProperty()
  sentAt?: Date;

  @ApiProperty()
  openedAt?: Date;

  @ApiProperty()
  clickedAt?: Date;
}

export class EmCampaignLogListResponseDto {
  @ApiProperty({ type: [EmCampaignLogDto] })
  data: EmCampaignLogDto[];

  @ApiProperty()
  meta: PaginationMetaDto;
}

// --- Other Responses ---

export class EmImportResponseDto {
  @ApiProperty()
  imported: number;

  @ApiProperty()
  skipped: number;
}

export class EmMessageResponseDto {
  @ApiProperty()
  message: string;
}
