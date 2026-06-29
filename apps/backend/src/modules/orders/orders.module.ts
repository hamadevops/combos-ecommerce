// orders.module.ts
import { Module } from '@nestjs/common';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { OrdersController } from './orders.controller';
import { OrdersService } from './orders.service';
import { Order } from 'src/database/entities/order.entity';
import { OrderItem } from 'src/database/entities/order-item.entity';
import { CustomersModule } from '../customers/customers.module';
import { WebhooksModule } from '../webhooks/webhooks.module';
import { Product } from 'src/database/entities/product.entity';
import { ProductVariant } from 'src/database/entities/product-variant.entity';

@Module({
  imports: [
    MikroOrmModule.forFeature([Order, OrderItem, Product, ProductVariant]),
    CustomersModule,
    WebhooksModule,
  ],
  controllers: [OrdersController],
  providers: [OrdersService],
  exports: [OrdersService],
})
export class OrdersModule {}
