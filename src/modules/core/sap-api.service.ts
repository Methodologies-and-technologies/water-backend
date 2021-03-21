import { HttpService, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '../../config/config.service';

export interface SapApiResponse {
  readonly isSuccess: boolean;
  readonly data?: {
    id: string;
  };
}

export interface SapApiGetResponse {
  readonly isSuccess: boolean;
  readonly data?: any;
}

@Injectable()
export class SapApiService {
  private readonly logger = new Logger(SapApiService.name);

  private readonly sapUrl: string;
  private readonly headers: { [key: string]: string };

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    this.sapUrl = this.configService.get('SAP_API_BASE_URL');
    const authHeaderName: string = this.configService.get('SAP_API_AUTH_HEADER_KEY');
    this.headers = {
      'Content-Type': 'application/json',
      [authHeaderName]: this.configService.get('SAP_API_AUTH_HEADER_VALUE'),
    };
  }

  public async post(path: string, data: object): Promise<SapApiResponse> {
    try {
      const response = await this.httpService
        .post(`${this.sapUrl}${path}`, data, { headers: this.headers })
        .toPromise();
      const isSuccess: boolean = [HttpStatus.ACCEPTED, HttpStatus.OK, HttpStatus.CREATED].includes(
        response.status,
      );

      return {
        isSuccess,
        data: { id: response.data.responseMessage.Id },
      };
    } catch (e) {
      this.logger.error(`[${e.status}] ${e.data}`);
      return {
        isSuccess: false,
      };
    }
  }

  public async get(path: string): Promise<SapApiGetResponse> {
    try {
      const response = await this.httpService
        .get(`${this.sapUrl}${path}`, { headers: this.headers })
        .toPromise();
      const isSuccess: boolean = [HttpStatus.ACCEPTED, HttpStatus.OK, HttpStatus.FOUND].includes(
        response.status,
      );

      return {
        isSuccess,
        data: response,
      };
    } catch (e) {
      this.logger.error(`[${e.status}] ${e.data}`);
      return {
        isSuccess: false,
      };
    }
  }
}
