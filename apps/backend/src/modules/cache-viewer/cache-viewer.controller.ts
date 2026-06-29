import {
  Controller,
  Get,
  Delete,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { CacheService } from '../cache/cache.service';
import { Permissions } from '../../decorators/permissions.decorator';
import { PermissionEnum } from '../../libs/enums/permission.enum';
import { Public } from '../../decorators/public.decorator'; // Temporarily for testing if needed, or stick to permissions
import { SuccessResponseDto } from 'src/common/dto/success-response.dto';
import { CacheKeysResponseDto, CacheValueResponseDto } from './dto/cache-response.dto';
import { ApiOkResponse } from '@nestjs/swagger';

@ApiTags('Cache Viewer')
@Controller('cache')
@ApiBearerAuth()
export class CacheViewerController {
  constructor(private readonly cacheService: CacheService) {}

  @Get('keys')
  @ApiOperation({ summary: 'List all cache keys' })
  @Permissions(PermissionEnum.CACHE_MANAGE)
  @ApiQuery({
    name: 'pattern',
    required: false,
    description: 'Search pattern (e.g. "product")',
  })
  @ApiOkResponse({ description: 'List keys', type: CacheKeysResponseDto })
  async getKeys(@Query('pattern') pattern?: string) {
    const keys = await this.cacheService.getKeys(pattern);
    return {
      success: true,
      count: keys.length,
      data: keys,
    };
  }

  @Get('keys/:key')
  @ApiOperation({ summary: 'Get cache value by key' })
  @Permissions(PermissionEnum.CACHE_MANAGE)
  @ApiOkResponse({ description: 'Get key value', type: CacheValueResponseDto })
  async getValue(@Param('key') key: string) {
    const value = await this.cacheService.getRaw(key);
    return {
      success: true,
      data: value,
    };
  }

  @Delete('keys/:key')
  @ApiOperation({ summary: 'Delete cache key' })
  @Permissions(PermissionEnum.CACHE_MANAGE)
  @ApiOkResponse({ description: 'Delete key', type: SuccessResponseDto })
  async deleteKey(@Param('key') key: string) {
    await this.cacheService.deleteRaw(key);
    return {
      success: true,
      message: `Key ${key} deleted`,
    };
  }

  @Delete('all')
  @ApiOperation({ summary: 'Clear all cache' })
  @Permissions(PermissionEnum.CACHE_MANAGE)
  @ApiOkResponse({ description: 'Clear all', type: SuccessResponseDto })
  async clearAll() {
    await this.cacheService.reset();
    return {
      success: true,
      message: 'All cache cleared',
    };
  }
}
