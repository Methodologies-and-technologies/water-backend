import { Injectable } from '@nestjs/common';
import { SapApiGetResponse, SapApiService } from '../core/sap-api.service';

@Injectable()
export class PromotionSapService {
  constructor(private readonly sapApiService: SapApiService) {}

  public async getPromotionCatalogs(): Promise<SapApiGetResponse> {
    const sapPromotionResponse: SapApiGetResponse = await this.sapApiService.get(
      '/PromotionCatalogs/',
    );
    return sapPromotionResponse;
  }
}
