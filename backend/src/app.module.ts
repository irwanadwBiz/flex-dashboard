
import { Module } from '@nestjs/common';
import { ReviewsController } from './reviews/reviews.controller';
import { ReviewsService } from './reviews/reviews.service';

@Module({
  imports: [],
  controllers: [ReviewsController],
  providers: [ReviewsService],
})
export class AppModule {}
