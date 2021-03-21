import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { classToPlain } from 'class-transformer';
import { FindManyOptions, Repository } from 'typeorm';
import { PaginationServiceRatingDto } from '../dto/pagination-service-rating.dto';
import { ServiceRatingDto } from '../dto/service-rating.dto';
import { ServiceRatingEntity } from '../service-rating.entity';

@Injectable()
export class ServiceRatingService {
  constructor(
    @InjectRepository(ServiceRatingEntity)
    private readonly enjoyServiceEntityRepository: Repository<ServiceRatingEntity>,
  ) {}

  public async createServiceRating(data: ServiceRatingDto): Promise<ServiceRatingEntity> {
    const rating: ServiceRatingEntity = this.enjoyServiceEntityRepository.create(data);
    return await this.enjoyServiceEntityRepository.save(rating);
  }

  public async getAllRatings(
    options: FindManyOptions<ServiceRatingEntity> = { take: 10, skip: 0 },
  ): Promise<PaginationServiceRatingDto> {
    const data: [
      ServiceRatingEntity[],
      number,
    ] = await this.enjoyServiceEntityRepository.findAndCount(classToPlain(options));
    return new PaginationServiceRatingDto(data);
  }
}
