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
} from '@nestjs/swagger';
import { FaqsService } from './faqs.service';
import { CreateFaqDto } from './dto/create-faq.dto';
import { UpdateFaqDto } from './dto/update-faq.dto';
import { FaqResponse } from './responses/faq.response';
import { Public } from 'src/decorators/public.decorator';
import { Permissions } from 'src/decorators/permissions.decorator';
import { PermissionEnum } from 'src/libs/enums/permission.enum';
import { SuccessResponseDto } from 'src/common/dto/success-response.dto';

@ApiTags('Faqs')
@Controller('faqs')
export class FaqsController {
  constructor(private readonly faqsService: FaqsService) {}

  @ApiOperation({ summary: 'Get all public FAQs' })
  @ApiOkResponse({ description: 'List of public FAQs', type: [FaqResponse] })
  @Public()
  @Get()
  findAllPublic() {
    return this.faqsService.findAll(false);
  }

  @ApiOperation({ summary: 'Create FAQ' })
  @ApiCreatedResponse({
    description: 'The FAQ has been created.',
    type: FaqResponse,
  })
  @ApiBearerAuth()
  @Permissions(PermissionEnum.FAQ_CREATE)
  @Post()
  create(@Body() createFaqDto: CreateFaqDto) {
    return this.faqsService.create(createFaqDto);
  }

  @ApiOperation({ summary: 'Get all FAQs (Admin)' })
  @ApiOkResponse({ description: 'List of all FAQs', type: [FaqResponse] })
  @ApiBearerAuth()
  @Permissions(PermissionEnum.FAQ_READ)
  @Get('admin')
  findAllAdmin() {
    return this.faqsService.findAll(true);
  }

  @ApiOperation({ summary: 'Get FAQ by ID' })
  @ApiOkResponse({ description: 'The FAQ found', type: FaqResponse })
  @ApiNotFoundResponse({ description: 'FAQ not found' })
  @Public()
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.faqsService.findOne(id);
  }

  @ApiOperation({ summary: 'Update FAQ' })
  @ApiOkResponse({
    description: 'The FAQ has been updated.',
    type: FaqResponse,
  })
  @ApiNotFoundResponse({ description: 'FAQ not found' })
  @ApiBearerAuth()
  @Permissions(PermissionEnum.FAQ_UPDATE)
  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateFaqDto: UpdateFaqDto,
  ) {
    return this.faqsService.update(id, updateFaqDto);
  }

  @ApiOperation({ summary: 'Delete FAQ' })
  @ApiOkResponse({ description: 'The FAQ has been deleted.', type: SuccessResponseDto })
  @ApiNotFoundResponse({ description: 'FAQ not found' })
  @ApiBearerAuth()
  @Permissions(PermissionEnum.FAQ_DELETE)
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.faqsService.remove(id);
  }
}
