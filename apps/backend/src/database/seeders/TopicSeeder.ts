import { EntityManager } from '@mikro-orm/core';
import { Seeder } from '@mikro-orm/seeder';
import { Topic } from '../entities/topic.entity';

export class TopicSeeder extends Seeder {
  async run(em: EntityManager): Promise<void> {
    // Create root topics (level 0)
    const technology = await this.createTopic(em, {
      name: 'Technology',
      description: 'All about technology and innovation',
      level: 0,
      metaTitle: 'Technology News and Articles',
      metaDescription: 'Latest technology news, tutorials, and insights',
      metaKeywords: 'technology, tech, innovation',
      sortOrder: 1,
    });

    const lifestyle = await this.createTopic(em, {
      name: 'Lifestyle',
      description: 'Lifestyle tips and guides',
      level: 0,
      metaTitle: 'Lifestyle Articles',
      metaDescription: 'Lifestyle tips, health, and wellness',
      metaKeywords: 'lifestyle, health, wellness',
      sortOrder: 2,
    });

    // Create level 1 topics
    const programming = await this.createTopic(em, {
      name: 'Programming',
      description: 'Programming tutorials and guides',
      parent: technology,
      level: 1,
      metaTitle: 'Programming Tutorials',
      metaDescription: 'Learn programming with our tutorials',
      metaKeywords: 'programming, coding, development',
      sortOrder: 1,
    });

    const aiMl = await this.createTopic(em, {
      name: 'AI & Machine Learning',
      description: 'Artificial Intelligence and ML',
      parent: technology,
      level: 1,
      metaTitle: 'AI and Machine Learning',
      metaDescription: 'AI and ML articles and tutorials',
      metaKeywords: 'ai, machine learning, artificial intelligence',
      sortOrder: 2,
    });

    const health = await this.createTopic(em, {
      name: 'Health',
      description: 'Health and wellness tips',
      parent: lifestyle,
      level: 1,
      metaTitle: 'Health and Wellness',
      metaDescription: 'Health tips and wellness guides',
      metaKeywords: 'health, wellness, fitness',
      sortOrder: 1,
    });

    const travel = await this.createTopic(em, {
      name: 'Travel',
      description: 'Travel guides and tips',
      parent: lifestyle,
      level: 1,
      metaTitle: 'Travel Guides',
      metaDescription: 'Explore the world with our travel guides',
      metaKeywords: 'travel, tourism, destinations',
      sortOrder: 2,
    });

    // Create level 2 topics
    await this.createTopic(em, {
      name: 'JavaScript',
      description: 'JavaScript programming',
      parent: programming,
      level: 2,
      metaTitle: 'JavaScript Tutorials',
      metaDescription: 'Learn JavaScript programming',
      metaKeywords: 'javascript, js, programming',
      sortOrder: 1,
    });

    await this.createTopic(em, {
      name: 'Python',
      description: 'Python programming',
      parent: programming,
      level: 2,
      metaTitle: 'Python Tutorials',
      metaDescription: 'Learn Python programming',
      metaKeywords: 'python, programming',
      sortOrder: 2,
    });

    await this.createTopic(em, {
      name: 'TypeScript',
      description: 'TypeScript programming',
      parent: programming,
      level: 2,
      metaTitle: 'TypeScript Tutorials',
      metaDescription: 'Learn TypeScript programming',
      metaKeywords: 'typescript, ts, programming',
      sortOrder: 3,
    });

    await this.createTopic(em, {
      name: 'Deep Learning',
      description: 'Deep learning and neural networks',
      parent: aiMl,
      level: 2,
      metaTitle: 'Deep Learning',
      metaDescription: 'Deep learning tutorials and guides',
      metaKeywords: 'deep learning, neural networks, ai',
      sortOrder: 1,
    });

    await this.createTopic(em, {
      name: 'Fitness',
      description: 'Fitness and exercise',
      parent: health,
      level: 2,
      metaTitle: 'Fitness Tips',
      metaDescription: 'Get fit with our exercise guides',
      metaKeywords: 'fitness, exercise, workout',
      sortOrder: 1,
    });

    await em.flush();
    console.log('✓ Topics seeded successfully');
  }

  private async createTopic(
    em: EntityManager,
    data: {
      name: string;
      description: string;
      parent?: Topic;
      level: number;
      metaTitle?: string;
      metaDescription?: string;
      metaKeywords?: string;
      sortOrder?: number;
    },
  ): Promise<Topic> {
    const existing = await em.findOne(Topic, { name: data.name });
    if (existing) {
      console.log(`- Topic already exists: ${data.name}`);
      return existing;
    }

    const topic = em.create(Topic, {
      name: data.name,
      slug: '', // Will be auto-generated
      description: data.description,
      parent: data.parent,
      level: data.level,
      isActive: true,
      sortOrder: data.sortOrder ?? 0,
      metaTitle: data.metaTitle,
      metaDescription: data.metaDescription,
      metaKeywords: data.metaKeywords,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    em.persist(topic);
    console.log(`✓ Created topic: ${data.name} (level ${data.level})`);
    return topic;
  }
}
