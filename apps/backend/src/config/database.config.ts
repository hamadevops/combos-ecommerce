import { registerAs } from '@nestjs/config';
import { MySqlDriver } from '@mikro-orm/mysql';
import { SqlHighlighter } from '@mikro-orm/sql-highlighter';
import { MikroOrmModuleOptions } from '@mikro-orm/nestjs';

export default registerAs(
  'database',
  (): MikroOrmModuleOptions => ({
    driver: MySqlDriver,
    host: process.env.DB_HOST || 'localhost',
    port: Number.parseInt(process.env.DB_PORT || '3306', 10),
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    dbName: process.env.DB_NAME || 'test',
    autoLoadEntities: true,
    debug: process.env.NODE_ENV === 'development',
    highlighter: new SqlHighlighter(),
  }),
);
