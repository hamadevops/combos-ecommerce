import { EntityManager } from '@mikro-orm/core';
import { Seeder } from '@mikro-orm/seeder';
import { Post } from '../entities/post.entity';
import { User } from '../entities/user.entity';
import { Topic } from '../entities/topic.entity';
import { Tag } from '../entities/tag.entity';
import slugify from 'slugify';

export class PostSeeder extends Seeder {
  async run(em: EntityManager): Promise<void> {
    // Get admin user as author
    const admin = await em.findOne(User, { email: process.env.EMAIL_ADMIN });
    if (!admin) {
      console.log('- Admin user not found, skipping post seeding');
      return;
    }

    // Ensure Topics exist
    const jsTopic = await this.getOrCreateTopic(em, 'JavaScript', 'Programming related to JS');
    const tsTopic = await this.getOrCreateTopic(em, 'TypeScript', 'Typed superset of JS');
    const nestTopic = await this.getOrCreateTopic(em, 'NestJS', 'Node.js framework');
    const aiTopic = await this.getOrCreateTopic(em, 'AI & Machine Learning', 'Artificial Intelligence');
    const lifeTopic = await this.getOrCreateTopic(em, 'Lifestyle', 'Daily life and health');

    // Ensure Tags exist
    const tutorialTag = await this.getOrCreateTag(em, 'tutorial');
    const beginnerTag = await this.getOrCreateTag(em, 'beginner');
    const advancedTag = await this.getOrCreateTag(em, 'advanced');
    const newsTag = await this.getOrCreateTag(em, 'news');

    // Create sample posts
    await this.createPost(em, {
      title: 'Getting Started with NestJS',
      thumbnail: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800',
      excerpt: 'Learn the basics of NestJS framework for building scalable server-side applications',
      content: `NestJS is a progressive Node.js framework for building efficient, reliable and scalable server-side applications. It uses modern JavaScript, is built with TypeScript (preserves compatibility with pure JavaScript) and combines elements of OOP (Object Oriented Programming), FP (Functional Programming), and FRP (Functional Reactive Programming). Under the hood, Nest makes use of robust HTTP Server frameworks like Express (the default) and optionally can be configured to use Fastify as well!`,
      author: admin,
      topics: [jsTopic, tsTopic, nestTopic],
      tags: [tutorialTag, beginnerTag],
      isPublished: true,
      publishedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
    });

    await this.createPost(em, {
      title: '10 Tips for Healthier Life',
      thumbnail: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=800',
      excerpt: 'Simple daily habits to improve your wellbeing.',
      content: 'Drinking water, sleeping well, exercising regularly, eating whole foods, and keeping a positive mindset are the keys to a long and healthy life. Modern lifestyle makes it easy to forget the basics, but taking small, incremental steps toward healthy habits everyday can have a huge compounding effect over time. Try to start with drinking 2L of water per day and getting 7-8 hours of sleep.',
      author: admin,
      topics: [lifeTopic],
      tags: [beginnerTag],
      isPublished: true,
      publishedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    });

    await this.createPost(em, {
      title: 'The Future of AI',
      thumbnail: 'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=800',
      excerpt: 'How Artificial Intelligence is reshaping our world.',
      content: 'AI is everywhere nowadays. From code generation to automated driving and conversational agents, artificial intelligence is rapidly reshaping how we live, work, and communicate. As generative AI models grow increasingly capable, they are transitioning from helper tools to autonomous agentic assistants. Organizations and developers who adapt early to this paradigm shift will capture immense value.',
      author: admin,
      topics: [aiTopic],
      tags: [newsTag, advancedTag],
      isPublished: true,
      publishedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    });

    await this.createPost(em, {
      title: 'Advanced TypeScript Types',
      thumbnail: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800',
      excerpt: 'Deep dive into conditional types and mapped types.',
      content: 'Let\'s explore the power of TS type system. TypeScript provides advanced type features like conditional types, mapped types, template literal types, and utility types (like Omit, Pick, Record). Mastering these advanced constructs allows developers to design highly type-safe libraries and robust application architectures, catching complex programming errors at compile time rather than runtime.',
      author: admin,
      topics: [tsTopic],
      tags: [advancedTag, tutorialTag],
      isPublished: true,
      publishedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
    });

    await em.flush();
    console.log('✓ Posts seeded successfully');
  }

  private async getOrCreateTopic(em: EntityManager, name: string, description: string): Promise<Topic> {
    const existing = await em.findOne(Topic, { name });
    if (existing) return existing;

    const topic = em.create(Topic, {
      name,
      slug: slugify(name, { lower: true }),
      description,
      level: 0,
      isActive: true,
      sortOrder: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    em.persist(topic);
    return topic;
  }

  private async getOrCreateTag(em: EntityManager, name: string): Promise<Tag> {
    const existing = await em.findOne(Tag, { name });
    if (existing) return existing;

    const tag = em.create(Tag, {
      name,
      slug: slugify(name, { lower: true }),
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    em.persist(tag);
    return tag;
  }

  private async createPost(
    em: EntityManager,
    data: {
      title: string;
      thumbnail: string;
      excerpt: string;
      content: string;
      author: User;
      topics: Topic[];
      tags: Tag[];
      isPublished: boolean;
      publishedAt: Date;
    },
  ): Promise<Post> {
    const existing = await em.findOne(Post, { title: data.title });
    if (existing) {
      existing.thumbnail = data.thumbnail;
      existing.excerpt = data.excerpt;
      existing.content = data.content;
      existing.isPublished = data.isPublished;
      existing.publishedAt = data.publishedAt;
      console.log(`- Updated existing post: ${data.title}`);
      return existing;
    }

    const post = em.create(Post, {
      title: data.title,
      slug: '', 
      thumbnail: data.thumbnail,
      excerpt: data.excerpt,
      content: data.content,
      author: data.author,
      isActive: true,
      isPublished: data.isPublished,
      publishedAt: data.publishedAt,
      viewCount: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    for (const topic of data.topics) post.topics.add(topic);
    for (const tag of data.tags) post.tags.add(tag);

    em.persist(post);
    console.log(`✓ Created post: ${data.title}`);
    return post;
  }
}
