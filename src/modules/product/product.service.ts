import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Like, Repository } from 'typeorm';
import { PaginationProductsDto } from './dto/pagination-product.dto';
import { QueryParamsDto } from './dto/query-product.dto';
import { ProductEntity } from './product.entity';
import { createError } from '../../common/helpers/error-handling.helpers';
import { ErrorTypeEnum } from '../../common/enums';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { FilesService } from '../files';
import { FileEntity } from '../files/file.entity';
import { PromotionService } from '../promotion/promotion.service';
import { ProductPromotionEntity } from './product-promotion.entity';
import { PromotionEntity } from '../promotion/promotion.entity';
import { ConfigService } from 'src/config/config.service';
import { ProductSapService } from './product-sap.service';
import { PaginationPromotionDto } from '../promotion/dto/pagination-promotion.dto';

@Injectable()
export class ProductService {
  private readonly pathToDownload: string;

  constructor(
    @InjectRepository(ProductEntity) private readonly productRepository: Repository<ProductEntity>,
    @InjectRepository(ProductPromotionEntity)
    private readonly productPromotionRepository: Repository<ProductPromotionEntity>,
    private readonly fileService: FilesService,
    private readonly promotionService: PromotionService,
    private readonly configService: ConfigService,
    private readonly productSapService: ProductSapService,
  ) {
    this.pathToDownload = this.configService.get('PATH_TO_DOWNLOAD');
  }

  public async getAllProducts(options: QueryParamsDto): Promise<PaginationProductsDto> {
    return new PaginationProductsDto(
      (Array.from(Object.keys(options)) as Array<string>).length
        ? await this.productRepository.findAndCount({
            where: [{ type: Like(`${options.type}%`) }, { title: Like(`%${options.title}%`) }],
            relations: ['cartItems', 'productPromotions', 'productPromotions.promotion'],
            take: 10,
            skip: 0,
          })
        : ((options = { take: 10, skip: 0 } as any),
          await this.productRepository.findAndCount({
            ...options,
            relations: ['cartItems', 'productPromotions', 'productPromotions.promotion'],
          })),
    );
  }

  public async createProduct(product: CreateProductDto): Promise<ProductEntity> {
    const image: FileEntity = await this.fileService.selectOne({ id: product.imageId });

    if (!image) {
      throw new NotFoundException(createError(ErrorTypeEnum.FILE_NOT_FOUND, 'imageId'));
    }

    const imageUrl = `${this.pathToDownload}${image.id}`;
    const { imageId, ...dataForCreation } = product;
    const createdProduct: ProductEntity = this.productRepository.create({
      ...dataForCreation,
      image,
      imageUrl,
      promotions: 'gelll',
    });
    await this.productRepository.save(createdProduct);

    const {
      result: promotions,
    }: PaginationPromotionDto = await this.promotionService.getAllPromotions({});
    await Promise.all(
      promotions.map(async (promotion: PromotionEntity) => {
        const productPromotion: ProductPromotionEntity = this.productPromotionRepository.create({
          promotion,
          product: createdProduct,
        });
        await this.productPromotionRepository.save(productPromotion);
      }),
    );
    return await this.getProductById(createdProduct.id);
  }

  public async getProductById(id: number): Promise<ProductEntity> {
    const product: ProductEntity = await this.productRepository.findOne({
      where: { id },
      relations: ['cartItems', 'productPromotions', 'productPromotions.promotion'],
    });
    if (!product) {
      throw new NotFoundException(createError(ErrorTypeEnum.PRODUCT_NOT_FOUND, 'id'));
    }
    return product;
  }

  public async updateProduct(id: number, data: UpdateProductDto): Promise<ProductEntity> {
    const product: ProductEntity = await this.productRepository.findOne({
      where: { id },
      relations: ['cartItems', 'productPromotions', 'productPromotions.promotion', 'image'],
    });

    if (!product) {
      throw new NotFoundException(createError(ErrorTypeEnum.PRODUCT_NOT_FOUND, 'id'));
    }

    const image: FileEntity = !data.imageId
      ? product.image
      : await this.fileService.selectOne({ id: data.imageId });

    if (!image) {
      throw new NotFoundException(createError(ErrorTypeEnum.FILE_NOT_FOUND, 'imageId'));
    }

    const imageUrl = `${this.pathToDownload}${image.id}`;
    const { imageId, ...dataToUpdate } = data;
    await this.productRepository.update(id, { ...dataToUpdate, image, imageUrl });
    return await this.getProductById(id);
  }

  public async destroyProduct(id: number): Promise<ProductEntity> {
    const product: ProductEntity = await this.productRepository.findOne({
      where: { id },
    });
    if (!product) {
      throw new NotFoundException(createError(ErrorTypeEnum.PRODUCT_NOT_FOUND, 'id'));
    }
    await this.productRepository.delete(id);
    return product;
  }
}
