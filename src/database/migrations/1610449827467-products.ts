import { HttpService } from '@nestjs/common';
import { ConfigService } from 'src/config/config.service';
import { SapApiGetResponse, SapApiService } from 'src/modules/core/sap-api.service';
import { FileEntity } from 'src/modules/files/file.entity';
import { ProductPromotionEntity } from 'src/modules/product/product-promotion.entity';
import { ProductSapService } from 'src/modules/product/product-sap.service';
import { ProductEntity } from 'src/modules/product/product.entity';
import { PromotionSapService } from 'src/modules/promotion/promotion-sap.service';
import { PromotionEntity } from 'src/modules/promotion/promotion.entity';
import { MigrationInterface, QueryRunner, Repository } from 'typeorm';
import * as fs from 'fs';
import { createMockFileMeta, CreateMockFileReturn } from 'src/database/utils/mock-file.util';

/**
 *
 * @initial data
 */
const promotions: Partial<PromotionEntity>[] = [
  { paidPacks: 1, price: 2, freePacks: 5 },
  { paidPacks: 2, price: 10, freePacks: 2 },
];

export class defaultPreference1604344371541 implements MigrationInterface {
  public async up({ connection }: QueryRunner): Promise<void> {
    const fileEntityRepository: Repository<FileEntity> = connection.getRepository(FileEntity);
    const productEntityRepository: Repository<ProductEntity> = connection.getRepository(
      ProductEntity,
    );
    const promotionEntityRepository: Repository<PromotionEntity> = connection.getRepository(
      PromotionEntity,
    );
    const productPromotionEntityRepository: Repository<ProductPromotionEntity> = connection.getRepository(
      ProductPromotionEntity,
    );

    const configService: ConfigService = new ConfigService();
    const httpService: HttpService = new HttpService();
    const sapApiService: SapApiService = new SapApiService(httpService, configService);
    const productSapService: ProductSapService = new ProductSapService(sapApiService);
    const promotionSapService: PromotionSapService = new PromotionSapService(sapApiService);

    const sapProducts: SapApiGetResponse = await productSapService.getProductCatalogs();
    const sapPromotions: SapApiGetResponse = await promotionSapService.getPromotionCatalogs();

    const productFile = {
      title: 'test file',
      fileSize: 1116886,
      extname: '.jpg',
      encoding: '7bit',
      mimetype: 'image/jpg',
    };

    const savedPromotions = await Promise.all(
      promotions.map(async (promotion) => {
        const prepareFile: CreateMockFileReturn = createMockFileMeta(productFile);
        fs.writeFileSync(prepareFile.filePath, prepareFile.buffer);

        const file = fileEntityRepository.create(prepareFile);
        await fileEntityRepository.save(file);

        const imageUrl = `${configService.get('PATH_TO_DOWNLOAD')}${file.id}`;
        const createdPromotions: PromotionEntity = promotionEntityRepository.create({
          ...promotion,
          image: file,
          imageUrl,
        });
        return await promotionEntityRepository.save(createdPromotions);
      }),
    );

    if (sapProducts.isSuccess) {
      await Promise.all(
        sapProducts.data.data.slice(0, 10).map(async (product) => {
          const prepareFile: CreateMockFileReturn = createMockFileMeta(productFile);
          fs.writeFileSync(prepareFile.filePath, prepareFile.buffer);

          const file = fileEntityRepository.create(prepareFile);
          await fileEntityRepository.save(file);

          const imageUrl = `${configService.get('PATH_TO_DOWNLOAD')}${file.id}`;

          const mappedSapProduct: Partial<ProductEntity> = {
            sapId: product.ProductID,
            type: product.Category,
            title: product.ProductName,
            capacity: 1,
            packCapacity: 1,
            pricePerItem: product.UnitPrice || 1,
            totalPrice: 1,
            about: product.ProductDescription,
            minOrder: product.MinimumOrderQty || 1,
            maxOrder: 1,
            freeProducts: 1,
            image: file,
            imageUrl,
            promotions: 'test promotion',
          };

          const createdProduct: ProductEntity = productEntityRepository.create(mappedSapProduct);
          await productEntityRepository.save(createdProduct);

          savedPromotions.map(async (promotion: PromotionEntity) => {
            const productPromotion: ProductPromotionEntity = productPromotionEntityRepository.create(
              {
                promotion,
                product: createdProduct,
              },
            );
            await productPromotionEntityRepository.save(productPromotion);
          });
        }),
      );
    }
  }

  public async down({ connection }: QueryRunner): Promise<void> {
    await connection.getRepository(FileEntity).delete({});
    await connection.getRepository(ProductEntity).delete({});
    await connection.getRepository(PromotionEntity).delete({});
    await connection.getRepository(ProductPromotionEntity).delete({});
  }
}
