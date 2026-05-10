import { Migration } from '@mikro-orm/migrations';
import { Knex } from 'knex';

export abstract class MigrationWithKnex extends Migration {
  public getKnex(): Knex {
    return (this.ctx as Knex) ?? this.driver.getConnection('write').getKnex();
  }
}
