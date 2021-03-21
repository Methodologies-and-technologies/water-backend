import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { classToPlain } from 'class-transformer';
import { FindManyOptions, Repository } from 'typeorm';
import { PaginationMosqueDto } from '../dto/pagination-mosque.dto';
import { MosqueEntity } from '../mosque.entity';

@Injectable()
export class MosqueService {
  constructor(
    @InjectRepository(MosqueEntity)
    private readonly mosqueEntityRepository: Repository<MosqueEntity>,
  ) {}

  public async getAllMosque(
    options: FindManyOptions<MosqueEntity> = { take: 10, skip: 0 },
  ): Promise<PaginationMosqueDto> {
    const data: [MosqueEntity[], number] = await this.mosqueEntityRepository.findAndCount(
      classToPlain(options),
    );
    return new PaginationMosqueDto(data);
  }
}
