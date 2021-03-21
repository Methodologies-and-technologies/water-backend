import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { createError } from '../../common/helpers/error-handling.helpers';
import { ErrorTypeEnum } from '../../common/enums';
import { FilesService } from '../files/files.service';
import { FileEntity } from '../files/file.entity';
import { PromotionEntity } from './promotion.entity';
import { QueryParamsPromotionDto } from './dto/query-promotion.dto';
import { PaginationPromotionDto } from './dto/pagination-promotion.dto';
import { CreatePromotionDto } from './dto/create-promotion.dto';
import { UpdatePromotionDto } from './dto/update-promotion.dto';
import { ConfigService } from 'src/config/config.service';

@Injectable()
export class PromotionService {
  private readonly pathToDownload: string;

  constructor(
    @InjectRepository(PromotionEntity)
    private readonly promotionRepository: Repository<PromotionEntity>,
    private readonly fileService: FilesService,
    private readonly configService: ConfigService,
  ) {
    this.pathToDownload = this.configService.get('PATH_TO_DOWNLOAD');
  }

  public async getAllPromotions(options: QueryParamsPromotionDto): Promise<PaginationPromotionDto> {
    const promotionsByQueryLike: [
      PromotionEntity[],
      number,
    ] = await this.promotionRepository.findAndCount({
      where: [
        { paidPacks: options.paidPacks },
        { price: options.price },
        { freePacks: options.freePacks },
      ],
      take: 10,
      skip: 0,
    });
    if ((Array.from(promotionsByQueryLike).shift() as Array<PromotionEntity>).length) {
      return new PaginationPromotionDto(promotionsByQueryLike);
    }
    options = { take: 10, skip: 0 } as any;
    const data: [PromotionEntity[], number] = await this.promotionRepository.findAndCount({
      ...options,
    });
    return new PaginationPromotionDto(data);
  }

  public async createPromotion(promotion: CreatePromotionDto): Promise<PromotionEntity> {
    const image: FileEntity = await this.fileService.selectOne({ id: promotion.imageId });

    console.log('Some image', image);
    if (!image) {
      throw new NotFoundException(createError(ErrorTypeEnum.FILE_NOT_FOUND, 'imageId'));
    }

    const imageUrl = `${this.pathToDownload}${image.id}`;
    const { imageId, ...dataForCreation } = promotion;
    const createdPromotion: PromotionEntity = this.promotionRepository.create({
      ...dataForCreation,
      image,
      imageUrl,
    });
    await this.promotionRepository.save(createdPromotion);
    return await this.getPromotionById(createdPromotion.id);
  }

  public async getPromotionById(id: number): Promise<PromotionEntity> {
    const promotion: PromotionEntity = await this.promotionRepository.findOne({
      where: { id },
    });
    if (!promotion) {
      throw new NotFoundException(createError(ErrorTypeEnum.PROMOTION_NOT_FOUND, 'id'));
    }
    return promotion;
  }

  public async updatePromotion(id: number, data: UpdatePromotionDto): Promise<PromotionEntity> {
    const promotion: PromotionEntity = await this.promotionRepository.findOne({
      where: { id },
    });
    const image: FileEntity = !data.imageId
      ? promotion.image
      : await this.fileService.selectOne({ id: data.imageId });

    if (!image) {
      throw new NotFoundException(createError(ErrorTypeEnum.FILE_NOT_FOUND, 'imageId'));
    }

    if (!promotion) {
      throw new NotFoundException(createError(ErrorTypeEnum.PROMOTION_NOT_FOUND, 'id'));
    }
    const imageUrl = `${this.pathToDownload}${image.id}`;
    const { imageId, ...dataToUpdate } = data;
    await this.promotionRepository.update(id, { ...dataToUpdate, image, imageUrl });
    return await this.getPromotionById(id);
  }

  public async destroyPromotion(id: number): Promise<PromotionEntity> {
    const promotion: PromotionEntity = await this.promotionRepository.findOne({
      where: { id },
    });
    if (!promotion) {
      throw new NotFoundException(createError(ErrorTypeEnum.PROMOTION_NOT_FOUND, 'id'));
    }
    await this.promotionRepository.delete(id);
    return promotion;
  }
}
