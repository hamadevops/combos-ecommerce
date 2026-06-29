import { PartialType } from '@nestjs/swagger';
import { CreateAppFeedbackDto } from './create-app-feedback.dto';

export class UpdateAppFeedbackDto extends PartialType(CreateAppFeedbackDto) {}
