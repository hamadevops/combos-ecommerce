import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@mikro-orm/nestjs';
import { EntityManager, EntityRepository, FilterQuery } from '@mikro-orm/mysql';
import { Post } from 'src/database/entities/post.entity';
import { Topic } from 'src/database/entities/topic.entity';
import { Tag } from 'src/database/entities/tag.entity';
import { User } from 'src/database/entities/user.entity';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { PostQueryDto, PostSortByEnum } from './dto/post-query.dto';
import { SchedulePostDto } from './dto/schedule-post.dto';
import { UploadService } from '../upload/upload.service';

@Injectable()
export class PostsService {
  constructor(
    @InjectRepository(Post)
    private readonly postRepository: EntityRepository<Post>,
    private readonly em: EntityManager,
    private readonly uploadService: UploadService,
  ) {}

  async findAll(query: PostQueryDto) {
    const {
      page = 1,
      limit = 10,
      search,
      topic_id,
      topic_ids,
      topic_slug,
      tag_id,
      tag_ids,
      author_id,
      author_name,
      is_active,
      is_published,
    } = query;
    const offset = (page - 1) * limit;

    const where: FilterQuery<Post> = {};

    // ── Tìm kiếm text ──────────────────────────────────────────────────
    if (search) {
      where.$or = [
        { title: { $like: `%${search}%` } },
        { excerpt: { $like: `%${search}%` } },
        { content: { $like: `%${search}%` } },
      ];
    }

    // ── Tìm kiếm theo slug ─────────────────────────────────────────────
    if (query.slug) {
      where.slug = { $like: `%${query.slug}%` };
    }

    // ── Lọc theo Topic ──────────────────────────────────────────────────
    // topic_ids (multi) ưu tiên hơn topic_id (đơn)
    if (topic_ids && topic_ids.length > 0) {
      where.topics = { id: { $in: topic_ids } };
    } else if (topic_id !== undefined) {
      where.topics = { id: topic_id };
    }

    // Lọc theo topic slug (bổ sung, không ghi đè nếu đã có topic filter)
    if (topic_slug && !(topic_ids && topic_ids.length > 0) && topic_id === undefined) {
      where.topics = { slug: topic_slug };
    }

    // ── Lọc theo Tag ────────────────────────────────────────────────────
    // tag_ids (multi) ưu tiên hơn tag_id (đơn)
    if (tag_ids && tag_ids.length > 0) {
      where.tags = { id: { $in: tag_ids } };
    } else if (tag_id !== undefined) {
      where.tags = { id: tag_id };
    }

    // ── Lọc theo Author ─────────────────────────────────────────────────
    if (author_id !== undefined) {
      where.author = author_id;
    } else if (author_name) {
      where.author = { name: { $like: `%${author_name}%` } } as any;
    }

    // ── Trạng thái ──────────────────────────────────────────────────────
    if (is_active !== undefined) {
      where.isActive = is_active;
    }

    if (is_published !== undefined) {
      where.isPublished = is_published;
    }

    // ── Has thumbnail ───────────────────────────────────────────────────
    if (query.has_thumbnail === true) {
      where.thumbnail = { $ne: null };
    } else if (query.has_thumbnail === false) {
      where.thumbnail = null as any;
    }

    // ── Khoảng thời gian published (publishedAt) ────────────────────────
    if (query.start_date || query.end_date) {
      where.publishedAt = {};

      if (query.start_date) {
        where.publishedAt.$gte = new Date(query.start_date);
      }

      if (query.end_date) {
        const endDate = new Date(query.end_date);
        endDate.setHours(23, 59, 59, 999);
        where.publishedAt.$lte = endDate;
      }
    }

    // ── Khoảng thời gian tạo (createdAt) ────────────────────────────────
    if (query.created_from || query.created_to) {
      where.createdAt = {};

      if (query.created_from) {
        (where.createdAt as any).$gte = new Date(query.created_from);
      }

      if (query.created_to) {
        const endDate = new Date(query.created_to);
        endDate.setHours(23, 59, 59, 999);
        (where.createdAt as any).$lte = endDate;
      }
    }

    // ── Khoảng lượt xem (viewCount) ─────────────────────────────────────
    if (query.min_views !== undefined || query.max_views !== undefined) {
      where.viewCount = {};
      if (query.min_views !== undefined) (where.viewCount as any).$gte = query.min_views;
      if (query.max_views !== undefined) (where.viewCount as any).$lte = query.max_views;
    }

    // ── Sắp xếp ────────────────────────────────────────────────────────
    let orderBy: any = { createdAt: 'DESC' };

    if (query.sort_by) {
      switch (query.sort_by) {
        case PostSortByEnum.NEWEST:
          orderBy = { createdAt: 'DESC' };
          break;
        case PostSortByEnum.OLDEST:
          orderBy = { createdAt: 'ASC' };
          break;
        case PostSortByEnum.MOST_VIEWS:
          orderBy = { viewCount: 'DESC' };
          break;
        case PostSortByEnum.TITLE_ASC:
          orderBy = { title: 'ASC' };
          break;
        case PostSortByEnum.TITLE_DESC:
          orderBy = { title: 'DESC' };
          break;
        case PostSortByEnum.RECENTLY_PUBLISHED:
          orderBy = { publishedAt: 'DESC' };
          break;
      }
    }

    // Override hướng sắp xếp nếu sort_order được cung cấp
    if (query.sort_order) {
      const field = Object.keys(orderBy)[0];
      orderBy = { [field]: query.sort_order };
    }

    const [items, total] = await this.postRepository.findAndCount(where, {
      limit,
      offset,
      populate: ['author', 'topics', 'tags'],
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

  async findOne(idOrSlug: string | number) {
    const where: FilterQuery<Post> = {};

    // Check if it's a numeric ID
    const id = Number(idOrSlug);
    if (!isNaN(id)) {
      where.id = id;
    } else {
      where.slug = String(idOrSlug);
    }

    const post = await this.postRepository.findOne(where, {
      populate: ['author', 'topics', 'tags'],
    });

    if (!post) {
      throw new NotFoundException(`Post not found`);
    }

    return post;
  }

  async create(
    dto: CreatePostDto,
    file: Express.Multer.File | undefined,
    userId: number,
  ) {
    return await this.em.transactional(async (em) => {
      const author = await em.findOne(User, userId);
      if (!author) {
        throw new NotFoundException(`User with ID ${userId} not found`);
      }

      // Upload thumbnail if provided
      let thumbnailUrl: string | undefined;
      if (file) {
        thumbnailUrl = await this.uploadService.uploadFile(file, 'posts');
      }

      // Parse published_at if provided
      let publishedAt: Date | undefined;
      if (dto.published_at) {
        publishedAt = new Date(dto.published_at);
      }

      const post = em.create(Post, {
        title: dto.title,
        slug: '', // Will be auto-generated by entity hook
        thumbnail: thumbnailUrl,
        excerpt: dto.excerpt,
        content: dto.content,
        author: author,
        isActive: dto.is_active ?? false,
        isPublished: dto.is_published ?? false,
        publishedAt: publishedAt,
        viewCount: 0,
        metaTitle: dto.meta_title,
        metaDescription: dto.meta_description,
        metaKeywords: dto.meta_keywords,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      // Handle topics
      if (dto.topic_ids && dto.topic_ids.length > 0) {
        const topics = await em.find(Topic, { id: { $in: dto.topic_ids } });
        for (const topic of topics) {
          post.topics.add(topic);
        }
      }

      // Handle tags
      if (dto.tag_ids && dto.tag_ids.length > 0) {
        const tags = await em.find(Tag, { id: { $in: dto.tag_ids } });
        for (const tag of tags) {
          post.tags.add(tag);
        }
      }

      await em.persistAndFlush(post);
      return post;
    });
  }

  async update(id: number, dto: UpdatePostDto, file?: Express.Multer.File) {
    return await this.em.transactional(async (em) => {
      const post = await em.findOne(Post, id, {
        populate: ['topics', 'tags'],
      });

      if (!post) {
        throw new NotFoundException(`Post with ID ${id} not found`);
      }

      // Update basic fields
      if (dto.title !== undefined) {
        post.title = dto.title;
        post.slug = ''; // Reset to trigger regeneration
      }
      if (dto.excerpt !== undefined) post.excerpt = dto.excerpt;
      if (dto.content !== undefined) post.content = dto.content;
      if (dto.is_active !== undefined) post.isActive = dto.is_active;
      if (dto.is_published !== undefined) post.isPublished = dto.is_published;
      if (dto.meta_title !== undefined) post.metaTitle = dto.meta_title;
      if (dto.meta_description !== undefined)
        post.metaDescription = dto.meta_description;
      if (dto.meta_keywords !== undefined)
        post.metaKeywords = dto.meta_keywords;

      // Handle thumbnail upload
      if (file) {
        // Delete old thumbnail if exists
        if (post.thumbnail) {
          await this.uploadService.deleteFile(post.thumbnail);
        }
        post.thumbnail = await this.uploadService.uploadFile(file, 'posts');
      }

      // Handle scheduled publication
      if (dto.published_at !== undefined) {
        post.publishedAt = dto.published_at
          ? new Date(dto.published_at)
          : undefined;
      }

      // Handle topics update
      if (dto.topic_ids !== undefined) {
        post.topics.removeAll();
        if (dto.topic_ids.length > 0) {
          const topics = await em.find(Topic, { id: { $in: dto.topic_ids } });
          for (const topic of topics) {
            post.topics.add(topic);
          }
        }
      }

      // Handle tags update
      if (dto.tag_ids !== undefined) {
        post.tags.removeAll();
        if (dto.tag_ids.length > 0) {
          const tags = await em.find(Tag, { id: { $in: dto.tag_ids } });
          for (const tag of tags) {
            post.tags.add(tag);
          }
        }
      }

      await em.flush();
      return post;
    });
  }

  async remove(id: number) {
    const post = await this.postRepository.findOne(id);

    if (!post) {
      throw new NotFoundException(`Post with ID ${id} not found`);
    }

    // Delete thumbnail from MinIO if exists
    if (post.thumbnail) {
      await this.uploadService.deleteFile(post.thumbnail);
    }

    await this.em.removeAndFlush(post);
    return { success: true };
  }

  async publish(id: number) {
    const post = await this.postRepository.findOne(id);

    if (!post) {
      throw new NotFoundException(`Post with ID ${id} not found`);
    }

    post.isPublished = true;
    post.publishedAt = new Date();
    await this.em.flush();

    return post;
  }

  async schedule(id: number, dto: SchedulePostDto) {
    const post = await this.postRepository.findOne(id);

    if (!post) {
      throw new NotFoundException(`Post with ID ${id} not found`);
    }

    const scheduledDate = new Date(dto.published_at);
    if (scheduledDate <= new Date()) {
      throw new BadRequestException('Scheduled date must be in the future');
    }

    post.publishedAt = scheduledDate;
    post.isPublished = false; // Will be published when scheduled time arrives
    await this.em.flush();

    return post;
  }

  async uploadThumbnail(id: number, file: Express.Multer.File) {
    const post = await this.postRepository.findOne(id);

    if (!post) {
      throw new NotFoundException(`Post with ID ${id} not found`);
    }

    // Delete old thumbnail if exists
    if (post.thumbnail) {
      await this.uploadService.deleteFile(post.thumbnail);
    }

    // Upload new thumbnail
    post.thumbnail = await this.uploadService.uploadFile(file, 'posts');
    await this.em.flush();

    return { thumbnail: post.thumbnail };
  }

  async removeThumbnail(id: number) {
    const post = await this.postRepository.findOne(id);

    if (!post) {
      throw new NotFoundException(`Post with ID ${id} not found`);
    }

    if (!post.thumbnail) {
      throw new BadRequestException('Post has no thumbnail');
    }

    // Delete thumbnail from MinIO
    await this.uploadService.deleteFile(post.thumbnail);
    post.thumbnail = undefined;
    await this.em.flush();

    return { success: true };
  }

  // Method to publish scheduled posts (can be called by cron job)
  async publishScheduledPosts() {
    const now = new Date();
    const posts = await this.postRepository.find({
      isPublished: false,
      publishedAt: { $lte: now },
    });

    for (const post of posts) {
      post.isPublished = true;
      await this.em.flush();
    }

    return { published: posts.length };
  }
}
