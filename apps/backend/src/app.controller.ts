import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { AppSwaggerTag } from './modules/swagger/swagger.constant';
import { Public } from './decorators/public.decorator';

@ApiTags(AppSwaggerTag.App)
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @ApiOperation({ summary: 'Hello app' })
  @Public()
  @Get()
  getHello(): string {
    return this.appService.getHello();
  }
}
