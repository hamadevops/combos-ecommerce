// orders.controller.ts
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
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiOkResponse,
  ApiCreatedResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { OrderQueryDto } from './dto/order-query.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { AppSwaggerTag } from '../swagger/swagger.constant';
import { Public } from 'src/decorators/public.decorator';
import { Permissions } from 'src/decorators/permissions.decorator';
import { PermissionEnum } from 'src/libs/enums/permission.enum';

@ApiTags(AppSwaggerTag.Order)
@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @ApiOperation({ summary: 'Lấy danh sách đơn hàng' })
  @ApiBearerAuth()
  @Permissions(PermissionEnum.ORDER_READ)
  @ApiOkResponse({ description: 'Danh sách đơn hàng' })
  @Get()
  findAll(@Query() query: OrderQueryDto) {
    return this.ordersService.findAll(query);
  }

  @ApiOperation({ summary: 'Lấy chi tiết đơn hàng theo ID' })
  @ApiBearerAuth()
  @Permissions(PermissionEnum.ORDER_READ)
  @ApiOkResponse({ description: 'Chi tiết đơn hàng' })
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.ordersService.findOne(id);
  }

  @ApiOperation({ summary: 'Lấy đơn hàng theo mã' })
  @Public()
  @ApiOkResponse({ description: 'Chi tiết đơn hàng' })
  @Get('code/:code')
  findByCode(@Param('code') code: string) {
    return this.ordersService.findByCode(code);
  }

  @ApiOperation({ summary: 'Tạo đơn hàng mới' })
  @Public()
  @ApiCreatedResponse({ description: 'Đơn hàng đã được tạo' })
  @Post()
  create(@Body() dto: CreateOrderDto) {
    return this.ordersService.create(dto);
  }

  @ApiOperation({ summary: 'Cập nhật đơn hàng (trạng thái, thông tin khách, địa chỉ...)' })
  @ApiBearerAuth()
  @Permissions(PermissionEnum.ORDER_UPDATE)
  @ApiOkResponse({ description: 'Đơn hàng đã được cập nhật' })
  @Put(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateOrderDto,
  ) {
    return this.ordersService.update(id, dto);
  }

  @ApiOperation({ summary: 'Xóa đơn hàng' })
  @ApiBearerAuth()
  @Permissions(PermissionEnum.ORDER_DELETE)
  @ApiOkResponse({ description: 'Đơn hàng đã được xóa' })
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.ordersService.remove(id);
  }
}
