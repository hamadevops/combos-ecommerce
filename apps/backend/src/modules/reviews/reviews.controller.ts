import {
    Controller,
    Get,
    Post,
    Body,
    Param,
    Delete,
    Query,
    ParseIntPipe,
} from '@nestjs/common';
import { ReviewsService } from './reviews.service';
import { CreateReviewDto } from './dto/create-review.dto';
import { ReviewQueryDto } from './dto/review-query.dto';
import {
    ApiTags,
    ApiOperation,
    ApiOkResponse,
    ApiCreatedResponse,
    ApiBearerAuth,
} from '@nestjs/swagger';
import { ReviewResponseDto } from './dto/review-response.dto';
import { Public } from 'src/decorators/public.decorator';
import { Permissions } from 'src/decorators/permissions.decorator';
import { PermissionEnum } from 'src/libs/enums/permission.enum';
import { SuccessResponseDto } from 'src/common/dto/success-response.dto';

@ApiTags('Reviews')
@Controller('reviews')
export class ReviewsController {
    constructor(private readonly reviewsService: ReviewsService) { }

    @Post()
    @ApiOperation({ summary: 'Create a new review' })
    @ApiCreatedResponse({ description: 'The review has been successfully created.', type: ReviewResponseDto })
    @ApiBearerAuth()
    @Permissions(PermissionEnum.REVIEW_CREATE)
    create(@Body() createReviewDto: CreateReviewDto) {
        return this.reviewsService.create(createReviewDto);
    }

    @Get()
    @ApiOperation({ summary: 'Get all reviews' })
    @ApiOkResponse({ description: 'List of reviews', type: [ReviewResponseDto] })
    @Public()
    findAll(@Query() query: ReviewQueryDto) {
        return this.reviewsService.findAll(query.productId, query.page, query.limit);
    }

    @Delete(':id')
    @ApiOperation({ summary: 'Delete a review' })
    @ApiOkResponse({ description: 'The review has been successfully deleted.', type: SuccessResponseDto })
    @ApiBearerAuth()
    @Permissions(PermissionEnum.REVIEW_DELETE)
    remove(@Param('id', ParseIntPipe) id: number) {
        return this.reviewsService.remove(id);
    }
}

