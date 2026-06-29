import { EntityRepository } from '@mikro-orm/core';
import { InjectRepository } from '@mikro-orm/nestjs';
import { Injectable, NotFoundException } from '@nestjs/common';
import { Review } from '../../database/entities/review.entity';
import { Product } from '../../database/entities/product.entity';
import { CreateReviewDto } from './dto/create-review.dto';
import { EntityManager } from '@mikro-orm/mysql';

@Injectable()
export class ReviewsService {
  constructor(
    @InjectRepository(Review)
    private readonly reviewRepository: EntityRepository<Review>,
    @InjectRepository(Product)
    private readonly productRepository: EntityRepository<Product>,
    private readonly em: EntityManager,
  ) {}

  async create(createReviewDto: CreateReviewDto) {
    const product = await this.productRepository.findOne(createReviewDto.productId);
    if (!product) {
      throw new NotFoundException('Product not found');
    }

    const review = this.reviewRepository.create({
      ...createReviewDto,
      product,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    await this.em.persistAndFlush(review);
    return review;
  }

  async findAll(productId?: number, page = 1, limit = 10) {
    const where = productId ? { product: { id: productId } } : {};
    const [items, total] = await this.reviewRepository.findAndCount(where, { // Use findAndCount
      orderBy: { createdAt: 'DESC' },
      limit,
      offset: (page - 1) * limit,
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

  async remove(id: number) {
    const review = await this.reviewRepository.findOne(id);
    if (!review) {
      throw new NotFoundException('Review not found');
    }
    await this.em.removeAndFlush(review);
    return { message: 'Review deleted successfully' };
  }
}
