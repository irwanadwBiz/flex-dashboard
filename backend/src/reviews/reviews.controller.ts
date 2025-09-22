import { Controller, Get, Query, Post, Body } from '@nestjs/common';
import { ReviewsService } from './reviews.service';
import { IsBoolean, IsISO8601, IsNumberString, IsOptional, IsString } from 'class-validator';
import { Transform } from 'class-transformer';

class HostawayQueryDto {
  @IsOptional() @IsString() listingId?: string;
  @IsOptional() @IsString() channel?: string;
  @IsOptional() @IsISO8601() from?: string;
  @IsOptional() @IsISO8601() to?: string;
  @IsOptional() @IsNumberString() minRating?: string; // 0..5

  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => {
    if (value === true || value === false) return value;
    if (typeof value === 'string') {
      const v = value.toLowerCase();
      if (['true', '1', 'yes', 'on'].includes(v)) return true;
      if (['false', '0', 'no', 'off', ''].includes(v)) return false;
    }
    return undefined; // make it optional if empty
  })
  onlyApproved?: boolean;
}

class ApproveDto {
  @IsString() reviewId!: string;
  @IsBoolean() approved!: boolean;
}

@Controller('reviews')
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @Get('hostaway')
  async getHostaway(@Query() q: HostawayQueryDto) {
    return this.reviewsService.getHostawayNormalized({
      listingId: q.listingId,
      channel: q.channel,
      from: q.from,
      to: q.to,
      minRating: q.minRating ? parseFloat(q.minRating) : undefined,
      onlyApproved: q.onlyApproved,
    });
  }

  @Post('approve')
  async approve(@Body() body: ApproveDto) {
    return this.reviewsService.setApproval(body.reviewId, body.approved);
  }

  @Get('approved')
  async approved(@Query('listingId') listingId?: string) {
    return this.reviewsService.getApproved(listingId);
  }

  @Get('website')
  async website(@Query('listingId') listingId?: string) {
    return this.reviewsService.getWebsitePayload(listingId);
  }

  // Google reviews (opsional; butuh GOOGLE_PLACES_API_KEY)
  @Get('google')
  async google(@Query('placeId') placeId: string) {
    return this.reviewsService.getGoogleReviews(placeId);
  }

  // Cari place_id dari nama/alamat
  @Get('google/search')
  async googleSearch(@Query('query') query: string) {
    if (!query || !query.trim()) {
      return { enabled: true, candidates: [] };
    }
    return this.reviewsService.searchGooglePlaces(query.trim());
  }
}
