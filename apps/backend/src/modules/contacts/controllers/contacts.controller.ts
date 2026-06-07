import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  ParseIntPipe,
  Header,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiOkResponse, ApiCreatedResponse } from '@nestjs/swagger';
import { ContactsService } from '../services/contacts.service';
import { SubmitNewsletterDto, SubmitContactFormDto, UpdateContactStatusDto, CreateContactDto, UpdateContactDto } from '../dto/contact.dto';
import { ContactType, ContactStatus } from '../../../database/entities/contact.entity';
import { Permissions } from '../../../decorators/permissions.decorator';
import { PermissionEnum } from '../../../libs/enums/permission.enum';
import { Public } from '../../../decorators/public.decorator';

@ApiTags('Contacts')
@Controller('contacts')
export class ContactsController {
  constructor(private readonly contactsService: ContactsService) {}

  @Public()
  @ApiOperation({ summary: 'Submit Newsletter Subscription' })
  @ApiCreatedResponse({ description: 'Subscribed successfully' })
  @Post('newsletter')
  async submitNewsletter(@Body() dto: SubmitNewsletterDto) {
    return this.contactsService.submitNewsletter(dto);
  }

  @Public()
  @ApiOperation({ summary: 'Submit Contact Form' })
  @ApiCreatedResponse({ description: 'Contact submitted successfully' })
  @Post('submit')
  async submitContactForm(@Body() dto: SubmitContactFormDto) {
    return this.contactsService.submitContactForm(dto);
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'List Contacts' })
  @Permissions(PermissionEnum.CONTACT_READ)
  @Get()
  findAll(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('search') search?: string,
    @Query('type') type?: ContactType,
    @Query('status') status?: ContactStatus,
  ) {
    return this.contactsService.findAll({ page, limit, search, type, status });
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Export Contacts to CSV' })
  @Permissions(PermissionEnum.CONTACT_READ)
  @Get('export')
  @Header('Content-Type', 'text/csv')
  @Header('Content-Disposition', 'attachment; filename="contacts.csv"')
  exportCsv(
    @Query('search') search?: string,
    @Query('type') type?: ContactType,
    @Query('status') status?: ContactStatus,
  ) {
    return this.contactsService.exportCsv({ search, type, status });
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create Contact Manually' })
  @Permissions(PermissionEnum.CONTACT_CREATE)
  @Post()
  create(@Body() dto: CreateContactDto) {
    return this.contactsService.create(dto);
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get Contact Details' })
  @Permissions(PermissionEnum.CONTACT_READ)
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.contactsService.findOne(id);
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update Contact Status' })
  @Permissions(PermissionEnum.CONTACT_UPDATE)
  @Patch(':id/status')
  updateStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateContactStatusDto,
  ) {
    return this.contactsService.updateStatus(id, dto);
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update Contact' })
  @Permissions(PermissionEnum.CONTACT_UPDATE)
  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateContactDto,
  ) {
    return this.contactsService.update(id, dto);
  }


  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete Contact' })
  @Permissions(PermissionEnum.CONTACT_DELETE)
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.contactsService.remove(id);
  }
}
