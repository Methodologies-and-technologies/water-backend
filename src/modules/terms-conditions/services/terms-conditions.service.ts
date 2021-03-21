import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm/dist/common';
import { Repository } from 'typeorm/repository/Repository';
import { CreateTermsConditionsDto } from '../dto/create-terms-conditions.dto';
import { TermsConditionsEntity } from '../terms-conditions.entity';

@Injectable()
export class TermsConditionsService {
  constructor(
    @InjectRepository(TermsConditionsEntity)
    private readonly termsConditionsEntityRepository: Repository<TermsConditionsEntity>,
  ) {}

  public async getApplicationTermsConditions(): Promise<TermsConditionsEntity> {
    return Array.from(await this.termsConditionsEntityRepository.find()).shift();
  }

  public async createTermsConditions(
    termsConditions: CreateTermsConditionsDto,
  ): Promise<TermsConditionsEntity> {
    let oldTermsConditions: TermsConditionsEntity = Array.from(
      await this.termsConditionsEntityRepository.find(),
    ).shift();
    if (!oldTermsConditions) {
      const createdTermsConditions: TermsConditionsEntity = this.termsConditionsEntityRepository.create(
        { ...termsConditions },
      );
      await this.termsConditionsEntityRepository.save(createdTermsConditions);
      return createdTermsConditions;
    }
    await this.termsConditionsEntityRepository.update(oldTermsConditions.id, termsConditions);
    oldTermsConditions = await this.termsConditionsEntityRepository.findOne({
      where: { id: oldTermsConditions.id },
    });
    return oldTermsConditions;
  }
}
