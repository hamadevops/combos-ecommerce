import { EntityManager } from '@mikro-orm/core';
import { Seeder } from '@mikro-orm/seeder';
import { Tag } from '../entities/tag.entity';

export class TagSeeder extends Seeder {
  async run(em: EntityManager): Promise<void> {
    const tags = [
      'tutorial',
      'guide',
      'news',
      'review',
      'tips',
      'beginner',
      'advanced',
      'best-practices',
      'how-to',
      'productivity',
      'web-development',
      'mobile',
      'backend',
      'frontend',
      'database',
      'security',
      'performance',
      'testing',
      'deployment',
      'devops',
      'ai',
      'machine-learning',
      'data-science',
      'nodejs',
      'javascript',
      'typescript',
      'python',
      'react',
      'vue',
      'angular',
    ];

    for (const tagName of tags) {
      const existing = await em.findOne(Tag, { name: tagName });
      if (existing) {
        console.log(`- Tag already exists: ${tagName}`);
        continue;
      }

      const tag = em.create(Tag, {
        name: tagName,
        slug: '', // Will be auto-generated
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      em.persist(tag);
      console.log(`✓ Created tag: ${tagName}`);
    }

    await em.flush();
    console.log('✓ Tags seeded successfully');
  }
}
