import { Module } from '@nestjs/common';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { Contact } from '../../database/entities/contact.entity';
import { ContactsController } from './controllers/contacts.controller';
import { ContactsService } from './services/contacts.service';
import { WebhooksModule } from '../webhooks/webhooks.module';

@Module({
  imports: [
    MikroOrmModule.forFeature([Contact]),
    WebhooksModule,
  ],
  controllers: [ContactsController],
  providers: [ContactsService],
  exports: [ContactsService],
})
export class ContactsModule {}
