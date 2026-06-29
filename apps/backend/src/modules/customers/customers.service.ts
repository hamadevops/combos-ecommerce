// customers.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@mikro-orm/nestjs';
import { EntityManager, EntityRepository, FilterQuery } from '@mikro-orm/mysql';
import { Customer } from 'src/database/entities/customer.entity';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';
import { CustomerQueryDto } from './dto/customer-query.dto';

@Injectable()
export class CustomersService {
  constructor(
    @InjectRepository(Customer)
    private readonly customerRepository: EntityRepository<Customer>,
    private readonly em: EntityManager,
  ) {}

  async findAll(query: CustomerQueryDto) {
    const { page = 1, limit = 10, search, phone } = query;
    const offset = (page - 1) * limit;
    const where: FilterQuery<Customer> = {};

    if (search) {
      where.$or = [
        { fullName: { $like: `%${search}%` } },
        { email: { $like: `%${search}%` } },
        { phone: { $like: `%${search}%` } },
      ];
    }

    if (phone) {
      where.phone = phone;
    }

    const [items, total] = await this.customerRepository.findAndCount(where, {
      limit,
      offset,
      orderBy: { createdAt: 'DESC' },
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
    const customer = await this.customerRepository.findOne(id);
    if (!customer) {
      throw new NotFoundException(`Customer with ID ${id} not found`);
    }
    return customer;
  }

  async findOrCreateByPhone(phone: string, data: Partial<CreateCustomerDto>) {
    // Find existing customer by phone (get the most recent one)
    let customer = await this.customerRepository.findOne(
      { phone },
      { orderBy: { lastOrderAt: 'DESC' } },
    );

    if (!customer) {
      customer = this.em.create(Customer, {
        fullName: data.fullName || '',
        email: data.email,
        phone,
        city: data.city,
        district: data.district,
        ward: data.ward,
        address: data.address,
        totalOrders: 0,
        totalSpent: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      await this.em.persistAndFlush(customer);
    }

    return customer;
  }

  async create(dto: CreateCustomerDto) {
    const customer = this.em.create(Customer, {
      fullName: dto.fullName,
      email: dto.email,
      phone: dto.phone,
      city: dto.city,
      district: dto.district,
      ward: dto.ward,
      address: dto.address,
      totalOrders: 0,
      totalSpent: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    await this.em.persistAndFlush(customer);
    return customer;
  }

  async update(id: number, dto: UpdateCustomerDto) {
    const customer = await this.findOne(id);

    if (dto.fullName !== undefined) customer.fullName = dto.fullName;
    if (dto.email !== undefined) customer.email = dto.email;
    if (dto.phone !== undefined) customer.phone = dto.phone;
    if (dto.city !== undefined) customer.city = dto.city;
    if (dto.district !== undefined) customer.district = dto.district;
    if (dto.ward !== undefined) customer.ward = dto.ward;
    if (dto.address !== undefined) customer.address = dto.address;

    customer.updatedAt = new Date();
    await this.em.flush();
    return customer;
  }

  async updateOrderStats(customerId: number, orderAmount: number) {
    const customer = await this.findOne(customerId);
    customer.totalOrders += 1;
    customer.totalSpent = Number(customer.totalSpent) + orderAmount;
    customer.lastOrderAt = new Date();
    await this.em.flush();
  }

  async remove(id: number) {
    const customer = await this.findOne(id);
    await this.em.removeAndFlush(customer);
    return { success: true };
  }
}
