import { Injectable } from '@nestjs/common';
import { SapApiGetResponse, SapApiService } from '../core/sap-api.service';

@Injectable()
export class ProductSapService {
  constructor(private readonly sapApiService: SapApiService) {}

  public async getProductCatalogs(): Promise<SapApiGetResponse> {
    const sapProductResponse: SapApiGetResponse = await this.sapApiService.get(
      '/GetProductCatalogs/',
    );
    return sapProductResponse;
  }
}
