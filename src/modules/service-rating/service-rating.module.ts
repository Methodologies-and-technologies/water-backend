import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ServiceRatingController } from './service-rating.controller';
import { ServiceRatingEntity } from './service-rating.entity';
import { ServiceRatingService } from './services';

@Module({
  imports: [
    TypeOrmModule.forFeature([ServiceRatingEntity]),
    PassportModule.register({ defaultStrategy: 'jwt' }),
  ],
  controllers: [ServiceRatingController],
  providers: [ServiceRatingService],
  exports: [ServiceRatingService],
})
export class ServiceRatingModule {}
