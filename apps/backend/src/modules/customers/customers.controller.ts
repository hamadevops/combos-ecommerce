// customers.controller.ts
import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiOkResponse,
} from '@nestjs/swagger';
import { CustomersService } from './customers.service';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';
import { CustomerQueryDto } from './dto/customer-query.dto';
import { AppSwaggerTag } from '../swagger/swagger.constant';
import { ApiPaginatedResponse } from '../../common/decorators/api-paginated-response.decorator';
import { CustomerResponseDto } from './dto/customer-response.dto';
import { ApiSuccessResponse } from '../../common/decorators/api-success-response.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { Permissions } from '../../decorators/permissions.decorator';
import { PermissionEnum } from '../../libs/enums/permission.enum';

@ApiTags(AppSwaggerTag.Customer)
@ApiBearerAuth()
@Controller('customers')
@UseGuards(JwtAuthGuard)
export class CustomersController {
  constructor(private readonly customersService: CustomersService) {}

  @ApiOperation({ summary: 'Lấy danh sách khách hàng' })
  @ApiPaginatedResponse(CustomerResponseDto)
  @Permissions(PermissionEnum.CUSTOMER_READ)
  @Get()
  findAll(@Query() query: CustomerQueryDto) {
    return this.customersService.findAll(query);
  }

  @ApiOperation({ summary: 'Lấy chi tiết khách hàng' })
  @ApiSuccessResponse(CustomerResponseDto)
  @Permissions(PermissionEnum.CUSTOMER_READ)
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.customersService.findOne(id);
  }

  @ApiOperation({ summary: 'Thêm khách hàng mới' })
  @ApiSuccessResponse(CustomerResponseDto)
  @Permissions(PermissionEnum.CUSTOMER_CREATE)
  @Post()
  create(@Body() dto: CreateCustomerDto) {
    return this.customersService.create(dto);
  }

  @ApiOperation({ summary: 'Cập nhật khách hàng' })
  @ApiSuccessResponse(CustomerResponseDto)
  @Permissions(PermissionEnum.CUSTOMER_UPDATE)
  @Put(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateCustomerDto,
  ) {
    return this.customersService.update(id, dto);
  }

  @ApiOperation({ summary: 'Xóa khách hàng' })
  @ApiOkResponse({ description: 'Khách hàng đã được xóa' })
  @Permissions(PermissionEnum.CUSTOMER_DELETE)
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.customersService.remove(id);
  }
}
