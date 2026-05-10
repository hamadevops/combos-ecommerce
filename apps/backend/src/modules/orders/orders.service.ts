// orders.service.ts
import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@mikro-orm/nestjs';
import { EntityManager, EntityRepository, FilterQuery } from '@mikro-orm/mysql';
import { Order, OrderStatus, PaymentStatus, PaymentMethod } from 'src/database/entities/order.entity';
import { OrderItem } from 'src/database/entities/order-item.entity';
import { Product } from 'src/database/entities/product.entity';
import { ProductVariant } from 'src/database/entities/product-variant.entity';
import { Customer } from 'src/database/entities/customer.entity';
import { CustomersService } from '../customers/customers.service';
import { WebhooksService } from '../webhooks/webhooks.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { OrderQueryDto } from './dto/order-query.dto';
import { UpdateOrderDto } from './dto/update-order.dto';

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order)
    private readonly orderRepository: EntityRepository<Order>,
    @InjectRepository(Product)
    private readonly productRepository: EntityRepository<Product>,
    @InjectRepository(ProductVariant)
    private readonly variantRepository: EntityRepository<ProductVariant>,
    private readonly em: EntityManager,
    private readonly customersService: CustomersService,
    private readonly webhooksService: WebhooksService,
  ) {}

  private generateOrderCode(): string {
    const date = new Date();
    const dateStr = date.toISOString().slice(0, 10).replace(/-/g, '');
    const random = Math.random().toString(36).substring(2, 8).toUpperCase();
    return `ORD-${dateStr}-${random}`;
  }

  async findAll(query: OrderQueryDto) {
    const {
      page = 1, limit = 10,
      search, customerPhone,
      status, paymentStatus, paymentMethod, customerId,
      dateFrom, dateTo,
      minAmount, maxAmount,
      utmSource, marketingPlatform,
      sortBy = 'updatedAt', sortOrder = 'DESC',
    } = query;
    const offset = (page - 1) * limit;
    const where: FilterQuery<Order> = {};

    // Tìm kiếm tổng quát
    if (search) {
      where.$or = [
        { code: { $like: `%${search}%` } },
        { customerName: { $like: `%${search}%` } },
        { customerPhone: { $like: `%${search}%` } },
      ];
    }

    // Lọc chính xác SĐT
    if (customerPhone) {
      where.customerPhone = { $like: `%${customerPhone}%` };
    }

    // Trạng thái
    if (status)        where.status = status;
    if (paymentStatus) where.paymentStatus = paymentStatus;
    if (paymentMethod) where.paymentMethod = paymentMethod;
    if (customerId)    where.customer = { id: customerId };

    // Khoảng thời gian
    if (dateFrom || dateTo) {
      where.createdAt = {};
      if (dateFrom) (where.createdAt as any).$gte = new Date(dateFrom);
      if (dateTo) {
        const end = new Date(dateTo);
        end.setHours(23, 59, 59, 999);
        (where.createdAt as any).$lte = end;
      }
    }

    // Khoảng giá trị
    if (minAmount !== undefined || maxAmount !== undefined) {
      where.finalAmount = {};
      if (minAmount !== undefined) (where.finalAmount as any).$gte = minAmount;
      if (maxAmount !== undefined) (where.finalAmount as any).$lte = maxAmount;
    }

    // Marketing Attribution
    if (utmSource)         where.utmSource = { $like: `%${utmSource}%` };
    if (marketingPlatform) where.marketingPlatform = { $like: `%${marketingPlatform}%` };

    const orderBy: any = { [sortBy]: sortOrder };

    const [items, total] = await this.orderRepository.findAndCount(where, {
      limit,
      offset,
      populate: ['customer', 'items'],
      orderBy,
    });

    return {
      items,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: number) {
    const order = await this.orderRepository.findOne(id, {
      populate: ['customer', 'items', 'items.product', 'items.productVariant'],
    });

    if (!order) {
      throw new NotFoundException(`Order with ID ${id} not found`);
    }

    return order;
  }

  async findByCode(code: string) {
    const order = await this.orderRepository.findOne(
      { code },
      { populate: ['customer', 'items'] },
    );

    if (!order) {
      throw new NotFoundException(`Order with code ${code} not found`);
    }

    return order;
  }

  async create(dto: CreateOrderDto) {
    // 1. Transactional block for Order creation
    const order = await this.em.transactional(async (em) => {
      if (!dto.items || dto.items.length === 0) {
        throw new BadRequestException('Order must have at least one item');
      }

      // Find or create customer
      let customer: Customer | null = null;
      if (dto.customerPhone) {
        customer = await this.customersService.findOrCreateByPhone(dto.customerPhone, {
          fullName: dto.customerName,
          email: dto.customerEmail,
          phone: dto.customerPhone,
          city: dto.shippingCity,
          district: dto.shippingDistrict,
          ward: dto.shippingWard,
          address: dto.shippingAddress,
        });
      }

      // Create order
      const newOrder = em.create(Order, {
        code: this.generateOrderCode(),
        customer: customer || undefined,
        customerName: dto.customerName,
        customerEmail: dto.customerEmail,
        customerPhone: dto.customerPhone,
        shippingAddress: dto.shippingAddress,
        shippingCity: dto.shippingCity,
        shippingDistrict: dto.shippingDistrict,
        shippingWard: dto.shippingWard,
        notes: dto.notes,
        paymentMethod: dto.paymentMethod || PaymentMethod.COD,
        paymentStatus: PaymentStatus.PENDING,
        status: OrderStatus.PENDING,
        shippingFee: dto.shippingFee || 0,
        discountAmount: dto.discountAmount || 0,
        utmSource: dto.utmSource,
        utmMedium: dto.utmMedium,
        utmCampaign: dto.utmCampaign,
        utmTerm: dto.utmTerm,
        utmContent: dto.utmContent,
        marketingPlatform: dto.marketingPlatform,
        marketingPlatformId: dto.marketingPlatformId,
        totalAmount: 0,
        finalAmount: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      let totalAmount = 0;

      // Create order items
      for (const itemDto of dto.items) {
        const product = await em.findOne(Product, itemDto.productId, {
          populate: ['images', 'tierVariations.options'],
        });

        if (!product) {
          throw new NotFoundException(`Product with ID ${itemDto.productId} not found`);
        }

        let variant: ProductVariant | null = null;
        let price = product.salePrice || product.price;
        let costPrice = product.costPrice;
        let variantName: string | undefined;
        let variantOptions: Array<{ name: string; value: string }> | undefined;
        let sku = product.sku;
        let thumbnail = product.images.getItems()[0]?.url;

        if (itemDto.productVariantId) {
          variant = await em.findOne(ProductVariant, itemDto.productVariantId, {
            populate: ['tierIndexes.tierOption.tierVariation'],
          });

          if (variant) {
            price = variant.salePrice || variant.price;
            costPrice = variant.costPrice;
            sku = variant.sku || sku;
            variantName = variant.name;

            // Extract variant options from tier indexes
            const options: Array<{ name: string; value: string }> = [];
            for (const tierIndex of variant.tierIndexes.getItems()) {
              const tierOption = tierIndex.tierOption;
              if (tierOption) {
                options.push({
                  name: tierOption.tierVariation?.name || '',
                  value: tierOption.value,
                });
                // Use tier option image if available (tier1)
                if (tierOption.imageUrl) {
                  thumbnail = tierOption.imageUrl;
                }
              }
            }
            if (options.length > 0) {
              variantOptions = options;
            }
          }
        }

        const itemTotal = Number(price) * itemDto.quantity;
        totalAmount += itemTotal;

        em.create(OrderItem, {
          order: newOrder,
          product,
          productVariant: variant || undefined,
          productName: product.name,
          variantName,
          variantOptions,
          sku,
          thumbnail,
          quantity: itemDto.quantity,
          price: Number(price),
          costPrice: costPrice ? Number(costPrice) : undefined,
          total: itemTotal,
          createdAt: new Date(),
        });

        // Update product sold count
        product.soldCount += itemDto.quantity;
      }

      newOrder.totalAmount = totalAmount;
      newOrder.finalAmount = totalAmount + (dto.shippingFee || 0) - (dto.discountAmount || 0);

      await em.persistAndFlush(newOrder);

      // Update customer stats
      if (customer) {
        await this.customersService.updateOrderStats(customer.id, newOrder.finalAmount);
      }

      return newOrder;
    });

    // 2. Dispatch Webhook Event (Outside transaction)
    try {
      const fullOrder = await this.orderRepository.findOne(order.id, {
        populate: [
          'customer',
          'items',
          'items.product',
          'items.productVariant',
          'items.productVariant.tierIndexes.tierOption.tierVariation'
        ],
      });

      if (fullOrder) {
        // Fire and forget, but catch errors to prevent crash
        this.webhooksService.dispatch('order.created', fullOrder)
          .catch(err => console.error('Webhook dispatch error:', err));
      }
      return fullOrder || order;

    } catch (error) {
      console.error('Error fetching full order for webhook:', error);
      return order;
    }
  }

  async update(id: number, dto: UpdateOrderDto) {
    const order = await this.findOne(id);

    // Kiểm tra hủy đơn
    const isCancelling = dto.status === OrderStatus.CANCELLED;
    if (isCancelling) {
      if (order.status === OrderStatus.COMPLETED) {
        throw new BadRequestException('Không thể hủy đơn hàng đã hoàn thành');
      }
      if (order.status === OrderStatus.SHIPPING) {
        throw new BadRequestException('Không thể hủy đơn hàng đang vận chuyển');
      }
      // Hoàn lại số lượng đã bán
      for (const item of order.items.getItems()) {
        if (item.product) {
          const product = await this.em.findOneOrFail(Product, item.product.id);
          product.soldCount = Math.max(0, product.soldCount - item.quantity);
        }
      }
    }

    // Cập nhật trạng thái
    if (dto.status !== undefined)        order.status = dto.status;
    if (dto.paymentStatus !== undefined) order.paymentStatus = dto.paymentStatus;

    // Cập nhật thông tin khách hàng
    if (dto.customerName !== undefined)  order.customerName = dto.customerName;
    if (dto.customerPhone !== undefined) order.customerPhone = dto.customerPhone;
    if (dto.customerEmail !== undefined) order.customerEmail = dto.customerEmail;

    // Cập nhật thông tin giao hàng
    if (dto.shippingAddress !== undefined)  order.shippingAddress = dto.shippingAddress;
    if (dto.shippingCity !== undefined)     order.shippingCity = dto.shippingCity;
    if (dto.shippingDistrict !== undefined) order.shippingDistrict = dto.shippingDistrict;
    if (dto.shippingWard !== undefined)     order.shippingWard = dto.shippingWard;

    // Ghi chú
    if (dto.notes !== undefined) order.notes = dto.notes;

    order.updatedAt = new Date();
    await this.em.flush();

    // Webhook
    this.webhooksService.dispatch('order.updated', order).catch(err => {
      console.error('Webhook order.updated error:', err);
    });

    return order;
  }

  async remove(id: number) {
    const order = await this.findOne(id);
    await this.em.removeAndFlush(order);

    // Webhook - Order Deleted
    this.webhooksService.dispatch('order.deleted', { id, code: order.code }).catch(err => {
        console.error('Error dispatching webhook order.deleted:', err);
    });

    return { success: true };
  }
}
