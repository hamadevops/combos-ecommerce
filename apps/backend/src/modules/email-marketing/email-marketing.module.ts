import { Module } from '@nestjs/common';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { BullModule } from '@nestjs/bullmq';

// Entities
import { EmConfig } from 'src/database/entities/email-marketing/em-config.entity';
import { EmContact } from 'src/database/entities/email-marketing/em-contact.entity';
import { EmSegment } from 'src/database/entities/email-marketing/em-segment.entity';
import { EmTemplate } from 'src/database/entities/email-marketing/em-template.entity';
import { EmCampaign } from 'src/database/entities/email-marketing/em-campaign.entity';
import { EmEmailLog } from 'src/database/entities/email-marketing/em-email-log.entity';
import { EmTrackedLink } from 'src/database/entities/email-marketing/em-tracked-link.entity';
import { EmLinkClick } from 'src/database/entities/email-marketing/em-link-click.entity';

// Services
import { EmConfigService } from './services/em-config.service';
import { EmContactService } from './services/em-contact.service';
import { EmSegmentService } from './services/em-segment.service';
import { EmTemplateService } from './services/em-template.service';
import { EmCampaignService } from './services/em-campaign.service';
import { EmTemplateCompilerService } from './services/em-template-compiler.service';
import { EmTrackingService } from './services/em-tracking.service';

// Controllers
import { EmConfigController } from './controllers/em-config.controller';
import { EmContactController } from './controllers/em-contact.controller';
import { EmSegmentController } from './controllers/em-segment.controller';
import { EmTemplateController } from './controllers/em-template.controller';
import { EmCampaignController } from './controllers/em-campaign.controller';
import { EmTrackingController } from './controllers/em-tracking.controller';

// Processors
import { EmCampaignProcessor } from './processors/em-campaign.processor';

@Module({
  imports: [
    MikroOrmModule.forFeature([
      EmConfig,
      EmContact,
      EmSegment,
      EmTemplate,
      EmCampaign,
      EmEmailLog,
      EmTrackedLink,
      EmLinkClick,
    ]),
    BullModule.registerQueue({
      name: 'campaign-processing',
    }),
    BullModule.registerQueue({
      name: 'mailer-processing',
    }),
  ],
  controllers: [
    EmConfigController,
    EmContactController,
    EmSegmentController,
    EmTemplateController,
    EmCampaignController,
    EmTrackingController,
  ],
  providers: [
    EmConfigService,
    EmContactService,
    EmSegmentService,
    EmTemplateService,
    EmCampaignService,
    EmTemplateCompilerService,
    EmTrackingService,
    EmCampaignProcessor,
  ],
  exports: [EmConfigService],
})
export class EmailMarketingModule {}
